"""finetune_roles.py: fine-tune the neural reader's joint model (one DistilBERT, one call per request) and export it for transformers.js 3.8.1.

One encoder, three heads (data: make_roles.py output):
  - act head on the [CLS] vector (as DistilBertForSequenceClassification: pre_classifier + ReLU + dropout + classifier): the act;
  - one class head per legend key with values (color, shape, size, position, style, arrow, pairing, ...), on the same [CLS] vector:
    "none" or one of the values the key takes in the training gold;
  - a token head: a B / I / O tag per word for the keys whose answer is written in the request (target, anchor, from, to, name, label,
    count, distance); the tag of a word is read on its first word piece.
Loss = cross-entropy of the act + the mean cross-entropy of the class heads + the cross-entropy of the word tags. AdamW, linear warm-up and
decay, fp16 autocast on cuda, early stop on the held-out share of requests read right (fixed before training: act right, every gold class
key right, every gold role tagged on exactly its words); the best epoch is kept.

Export: torch.onnx (TorchScript exporter) of the encoder + heads with inputs input_ids, attention_mask and outputs token_logits
[batch, tokens, tags] and seq_logits [batch, acts + sum of class sizes], then dynamic 8-bit quantization as finetune.py (QUInt8, per
channel, reduce_range) -> onnx/model_quantized.onnx. config.json is the encoder's (model_type distilbert, so transformers.js loads it as
AutoModel and returns both outputs) plus "reader": the head layout (reader.json of make_roles.py). Then check_roles_node.mjs reads 50
held-out requests through docs/js/neural.js makeReader (the demo's decoding code) and compares word pieces, act, classes and tags with torch.

--base distilbert-base-uncased  (or another DistilBERT checkpoint)     --base tiny: a 2-layer DistilBERT from scratch (offline smoke test)
Run: python3 training/neural/finetune_roles.py --base distilbert-base-uncased --name reader-distilbert [--data DIR] [--work DIR] [--out DIR]
"""
import argparse, collections, json, os, random, shutil, subprocess, sys, time
import numpy as np, torch
from torch import nn

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
REPO = os.path.normpath(os.path.join(HERE, "..", ".."))
LICENSE = {"distilbert-base-uncased": "Apache-2.0", "tiny": "none (random weights, smoke test)"}


def read(path): return [json.loads(l) for l in open(path, encoding="utf8") if l.strip()]


class Reader(nn.Module):
    def __init__(self, encoder, n_acts, class_sizes, n_tags):
        super().__init__()
        H = encoder.config.dim; p = getattr(encoder.config, "seq_classif_dropout", 0.1)
        self.encoder, self.class_sizes = encoder, list(class_sizes)
        self.pre = nn.Linear(H, H); self.drop = nn.Dropout(p)
        self.act = nn.Linear(H, n_acts); self.classes = nn.Linear(H, sum(class_sizes))
        self.tok_drop = nn.Dropout(getattr(encoder.config, "dropout", 0.1)); self.tags = nn.Linear(H, n_tags)

    def forward(self, input_ids, attention_mask):
        h = self.encoder(input_ids=input_ids, attention_mask=attention_mask).last_hidden_state
        cls = self.drop(torch.relu(self.pre(h[:, 0])))
        return self.tags(self.tok_drop(h)), torch.cat([self.act(cls), self.classes(cls)], dim=-1)


def build(base, rows, n_acts, class_sizes, n_tags):
    from transformers import AutoModel, AutoTokenizer, DistilBertConfig, DistilBertModel
    if base == "tiny":
        from finetune import tiny_tokenizer
        tok = tiny_tokenizer([" ".join(r["words"]) for r in rows], None)
        enc = DistilBertModel(DistilBertConfig(vocab_size=len(tok), n_layers=2, n_heads=2, dim=64, hidden_dim=128, max_position_embeddings=128))
    else:
        tok = AutoTokenizer.from_pretrained(base)
        enc = AutoModel.from_pretrained(base, attn_implementation="eager")
    if enc.config.model_type != "distilbert": raise SystemExit(f"--base {base}: a DistilBERT checkpoint is expected (model_type {enc.config.model_type})")
    return tok, Reader(enc, n_acts, class_sizes, n_tags)


class Layout:
    def __init__(self, R):
        self.acts, self.tags, self.classes = R["acts"], R["tags"], R["classes"]
        self.act_id = {a: i for i, a in enumerate(self.acts)}; self.tag_id = {t: i for i, t in enumerate(self.tags)}
        self.class_sizes = [len(v) for _, v in self.classes]
        self.offsets = np.cumsum([len(self.acts)] + self.class_sizes).tolist()   # start of each class key in seq_logits

    def class_targets(self, row):
        return [vals.index(row["classes"][k]) if row["classes"].get(k) in vals else 0 for k, vals in self.classes]


def encode(tok, rows, L, maxlen, dev):
    enc = tok([r["words"] for r in rows], is_split_into_words=True, truncation=True, max_length=maxlen, padding=True, return_tensors="pt")
    lab, first = [], []
    for b, r in enumerate(rows):
        wid, seen, row, fw = enc.word_ids(b), set(), [], {}
        for t, w in enumerate(wid):
            if w is None or w in seen: row.append(-100); continue
            seen.add(w); fw[w] = t; row.append(L.tag_id.get(r["tags"][w], 0) if "tags" in r else -100)
        lab.append(row); first.append(fw)
    x = {"input_ids": enc["input_ids"].to(dev), "attention_mask": enc["attention_mask"].to(dev)}
    return x, torch.tensor(lab, device=dev), first, enc


def batches(rows, bs, shuffle, rng):
    idx = list(range(len(rows)))
    if shuffle: rng.shuffle(idx)
    for i in range(0, len(idx), bs): yield [rows[j] for j in idx[i:i + bs]]


def decode(tokl, seql, first, nwords, L):
    """one request's logits -> {act, classes: {key: value}, tags: [tag per word], spans: {key: [[i, j], ...]}} (docs/js/neural.js makeReader)"""
    a = int(np.argmax(seql[:len(L.acts)]))
    classes = {}
    for (k, vals), s in zip(L.classes, L.offsets[:-1]):
        c = int(np.argmax(seql[s:s + len(vals)]))
        if c: classes[k] = vals[c]
    tags = [L.tags[int(np.argmax(tokl[first[w]]))] if w in first else "O" for w in range(nwords)]
    return {"act": L.acts[a], "classes": classes, "tags": tags, "spans": spans_of(tags)}


def spans_of(tags):
    """word tags -> {key: [[first word, last word + 1], ...]}: B starts a role, I continues the role of the same key just before it, else starts one"""
    out, cur = collections.defaultdict(list), None
    for i, t in enumerate(tags):
        if t == "O": cur = None; continue
        p, k = t.split("-", 1)
        if p == "I" and cur == k and out[k] and out[k][-1][1] == i: out[k][-1][1] = i + 1
        else: out[k].append([i, i + 1]); cur = k
    return dict(out)


@torch.no_grad()
def predict(model, tok, rows, L, maxlen, dev, fp16, bs=128):
    model.eval(); out = []
    for part in batches(rows, bs, False, None):
        x, _, first, _ = encode(tok, part, L, maxlen, dev)
        with torch.autocast(device_type="cuda", dtype=torch.float16, enabled=fp16): tl, sl = model(**x)
        tl, sl = tl.float().cpu().numpy(), sl.float().cpu().numpy()
        for b, r in enumerate(part): out.append(decode(tl[b], sl[b], first[b], len(r["words"]), L))
    return out


def evaluate(model, tok, rows, L, maxlen, dev, fp16):
    """share of requests read right + per key: right / gold, and keys produced that the gold does not have"""
    if not rows: return {"n": 0, "right": 0.0, "act": 0.0, "keys": {}}
    preds = predict(model, tok, rows, L, maxlen, dev, fp16)
    keys = collections.defaultdict(lambda: [0, 0, 0]); right = act = 0
    for r, p in zip(rows, preds):
        ok = p["act"] == r["act"]; act += ok
        for k, _ in L.classes:
            g, q = r["classes"].get(k), p["classes"].get(k)
            if g is not None: keys[k][1] += 1; keys[k][0] += g == q; ok &= g == q
            elif q is not None: keys[k][2] += 1
        gs = spans_of(r["tags"])
        for k in set(gs) | set(p["spans"]):
            g, q = gs.get(k), p["spans"].get(k)
            if g: keys[k][1] += 1; keys[k][0] += g == q; ok &= g == q
            else: keys[k][2] += 1
        right += ok
    return {"n": len(rows), "right": right / len(rows), "act": act / len(rows), "keys": {k: {"right": v[0], "gold": v[1], "extra": v[2]} for k, v in sorted(keys.items())}}


def report(name, ev):
    print(f"  {name:22} n={ev['n']:5}  requests read right {ev['right']:.4f}  act {ev['act']:.4f}")
    print("      " + " · ".join(f"{k} {v['right']}/{v['gold']}" + (f" +{v['extra']}" if v['extra'] else "") for k, v in ev["keys"].items()))


def export(model, tok, L, R, out, work, maxlen, enc_config):
    from onnxruntime.quantization import QuantType, quantize_dynamic
    model = model.to("cpu").eval()
    ox = os.path.join(work, "onnx_fp32"); shutil.rmtree(ox, ignore_errors=True); os.makedirs(ox)
    x = tok([["draw", "a", "red", "circle"], ["connect", "Start", "to", "Done", "with", "a", "dashed", "arrow"]], is_split_into_words=True, padding=True, return_tensors="pt")
    torch.onnx.export(model, (x["input_ids"], x["attention_mask"]), os.path.join(ox, "model.onnx"), dynamo=False, opset_version=14,
                      input_names=["input_ids", "attention_mask"], output_names=["token_logits", "seq_logits"],
                      dynamic_axes={"input_ids": {0: "batch", 1: "sequence"}, "attention_mask": {0: "batch", 1: "sequence"},
                                    "token_logits": {0: "batch", 1: "sequence"}, "seq_logits": {0: "batch"}})
    import onnxruntime as ort   # the fp32 graph must give torch's numbers before it is quantized
    s = ort.InferenceSession(os.path.join(ox, "model.onnx"), providers=["CPUExecutionProvider"])
    o = s.run(None, {"input_ids": x["input_ids"].numpy(), "attention_mask": x["attention_mask"].numpy()})
    with torch.no_grad(): t = model(x["input_ids"], x["attention_mask"])
    print(f"onnx fp32 vs torch: max |diff| token {np.abs(o[0] - t[0].numpy()).max():.2e}, seq {np.abs(o[1] - t[1].numpy()).max():.2e}")
    shutil.rmtree(out, ignore_errors=True); os.makedirs(os.path.join(out, "onnx"))
    quantize_dynamic(os.path.join(ox, "model.onnx"), os.path.join(out, "onnx", "model_quantized.onnx"), per_channel=True, reduce_range=True, weight_type=QuantType.QUInt8)
    tok.save_pretrained(out)
    for f in os.listdir(out):   # keep only what transformers.js reads: tokenizer.json, tokenizer_config.json (+ config.json below)
        if f not in ("tokenizer.json", "tokenizer_config.json", "onnx"): os.remove(os.path.join(out, f))
    cfg = enc_config.to_dict(); cfg["architectures"] = ["DistilBertModel"]
    for k in ("id2label", "label2id"): cfg.pop(k, None)
    cfg["reader"] = dict(R, max_length=maxlen)
    json.dump(cfg, open(os.path.join(out, "config.json"), "w"), indent=1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True); ap.add_argument("--name", required=True)
    ap.add_argument("--data", default=os.path.expanduser("~/vss-box/ft/roles"))
    ap.add_argument("--work", default=None, help="checkpoints and caches, outside the repo (default ~/vss-box/ft/<name>)")
    ap.add_argument("--out", default=None, help="default docs/model/neural/<name>")
    ap.add_argument("--epochs", type=int, default=8); ap.add_argument("--patience", type=int, default=2)
    ap.add_argument("--lr", type=float, default=6e-5); ap.add_argument("--bs", type=int, default=32)
    ap.add_argument("--max-steps", type=int, default=0, help="stop after N optimizer steps (smoke test)")
    ap.add_argument("--seed", type=int, default=0); ap.add_argument("--no-fp16", action="store_true")
    ap.add_argument("--no-node-check", action="store_true")
    a = ap.parse_args()
    work = a.work or os.path.expanduser(f"~/vss-box/ft/{a.name}"); out = a.out or os.path.join(REPO, "docs", "model", "neural", a.name)
    os.makedirs(work, exist_ok=True); os.environ.setdefault("HF_HOME", os.path.expanduser("~/vss-box/ft/hf"))
    random.seed(a.seed); np.random.seed(a.seed); torch.manual_seed(a.seed); rng = random.Random(a.seed)
    dev = "cuda" if torch.cuda.is_available() else "cpu"; fp16 = dev == "cuda" and not a.no_fp16
    R = json.load(open(os.path.join(a.data, "reader.json"))); L = Layout(R); maxlen = R.get("max_length", 128)
    train, held = read(os.path.join(a.data, "train.jsonl")), read(os.path.join(a.data, "heldout.jsonl"))
    evals = {f[5:-6]: read(os.path.join(a.data, f)) for f in sorted(os.listdir(a.data)) if f.startswith("eval_")}
    tok, model = build(a.base, train, len(L.acts), L.class_sizes, len(L.tags)); model.to(dev)
    print(f"base {a.base}: {sum(p.numel() for p in model.parameters()) / 1e6:.1f}M parameters, device {dev}, fp16 {fp16}; train {len(train)} held-out {len(held)}; "
          f"acts {len(L.acts)}, class keys {len(L.classes)} ({sum(L.class_sizes)} classes), tags {len(L.tags)}", flush=True)
    steps_per_epoch = (len(train) + a.bs - 1) // a.bs; total = a.max_steps or steps_per_epoch * a.epochs
    from transformers import get_linear_schedule_with_warmup
    opt = torch.optim.AdamW(model.parameters(), lr=a.lr, weight_decay=0.01)
    sch = get_linear_schedule_with_warmup(opt, int(0.06 * total), total); scaler = torch.amp.GradScaler("cuda", enabled=fp16)
    ce = nn.functional.cross_entropy
    best, bad, step, best_state, t0, done = -1.0, 0, 0, None, time.time(), False
    for ep in range(1, a.epochs + 1):
        model.train(); loss_sum = n = 0
        for part in batches(train, a.bs, True, rng):
            x, lab, _, _ = encode(tok, part, L, maxlen, dev)
            ya = torch.tensor([L.act_id[r["act"]] for r in part], device=dev)
            yc = torch.tensor([L.class_targets(r) for r in part], device=dev)
            with torch.autocast(device_type="cuda", dtype=torch.float16, enabled=fp16):
                tl, sl = model(**x)
            tl, sl = tl.float(), sl.float()
            loss = ce(sl[:, :len(L.acts)], ya)
            loss = loss + sum(ce(sl[:, s:s + c], yc[:, i]) for i, (s, c) in enumerate(zip(L.offsets[:-1], L.class_sizes))) / len(L.class_sizes)
            loss = loss + ce(tl.reshape(-1, tl.shape[-1]), lab.reshape(-1), ignore_index=-100)
            opt.zero_grad(); scaler.scale(loss).backward(); scaler.unscale_(opt); torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            scaler.step(opt); scaler.update(); sch.step(); loss_sum += loss.item(); n += 1; step += 1
            if a.max_steps and step >= a.max_steps: done = True; break
        ev = evaluate(model, tok, held, L, maxlen, dev, fp16)
        print(f"epoch {ep}: loss {loss_sum / max(n, 1):.4f}  held-out: requests read right {ev['right']:.4f}, act {ev['act']:.4f}  ({time.time() - t0:.0f}s)", flush=True)
        if ev["right"] > best: best, bad, best_state = ev["right"], 0, {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}
        else: bad += 1
        if done or bad >= a.patience: break
    model.load_state_dict(best_state); model.to(dev)
    torch.save(best_state, os.path.join(work, "best.pt"))
    print(f"\nbest epoch: held-out requests read right {best:.4f} (act right, every gold class key right, every gold role on exactly its words)")
    print("per key: right/gold (+ produced where the gold has none)")
    res = {"heldout": evaluate(model, tok, held, L, maxlen, dev, fp16)}; report("heldout", res["heldout"])
    for k, rows in evals.items(): res[k] = evaluate(model, tok, rows, L, maxlen, dev, fp16); report(k, res[k])
    json.dump(res, open(os.path.join(work, "eval.json"), "w"), indent=1)
    model.to("cpu"); dev = "cpu"
    chk = held[:50]
    ref = os.path.join(work, "torch_ref.jsonl")
    with open(ref, "w") as f:
        for r, p in zip(chk, predict(model, tok, chk, L, maxlen, "cpu", False)):
            ids = tok([r["words"]], is_split_into_words=True, truncation=True, max_length=maxlen)["input_ids"][0]
            f.write(json.dumps({"text": r["text"], "words": r["words"], "ids": ids, **p}, ensure_ascii=False) + "\n")
    export(model, tok, L, R, out, work, maxlen, model.encoder.config)
    q = os.path.getsize(os.path.join(out, "onnx", "model_quantized.onnx"))
    agree = None
    if not a.no_node_check and shutil.which("node"):
        r = subprocess.run(["node", os.path.join(HERE, "check_roles_node.mjs"), os.path.dirname(os.path.abspath(out)), os.path.basename(os.path.abspath(out)), ref],
                           capture_output=True, text=True); print(r.stdout.strip(), r.stderr.strip()[-800:])
        agree = json.loads(r.stdout.strip().splitlines()[-1]) if r.returncode == 0 and r.stdout.strip() else None
    ho = res["heldout"]; s1 = res.get("sample1000")
    with open(os.path.join(out, "README.md"), "w") as f:
        f.write(f"""# {a.name}: the demo's neural reader (act and roles in one model), fine-tuned on our annotated requests

One DistilBERT encoder with three heads, one call per request (the text of one request, as the rules cut it):
- the act ({len(L.acts)} classes: the action of a command, the ask of a question, else `fact` or `rule`);
- {len(L.classes)} class heads, one per legend key with values ({", ".join(k for k, _ in L.classes)}): `none` or a value;
- a B / I / O tag per word for the keys whose answer is written in the request ({", ".join(R["span_keys"])}).
The head layout is `reader` in config.json; docs/js/neural.js makeReader decodes it. Load with transformers.js as AutoTokenizer +
AutoModel (dtype `q8`, file `onnx/model_quantized.onnx`); outputs `token_logits` and `seq_logits`.

- Base model: `{a.base}` (license: {LICENSE.get(a.base, "see the base model's card")}); fine-tuned here, weights are a derivative of it.
- Data: {len(train)} request spans from the span-annotated messages of training/sketch (made by training/neural/make_roles.py; split by message id,
  10% of the messages held out; the fixed 1000-message sample and the docs/bench sets are never trained on).
- Held-out act accuracy (fp32 torch): {ho['act']:.4f}. Held-out requests read right (act, every gold class key, every gold role on exactly its words): {ho['right']:.4f}.
  1000-message sample: {f"act {s1['act']:.4f}, requests read right {s1['right']:.4f}" if s1 else "not exported"}.
- Size: onnx/model_quantized.onnx {q / 1e6:.1f} MB (q8). Node check (docs/js/neural.js makeReader, q8) vs torch on {len(chk)} held-out requests: {json.dumps(agree) if agree else "not run"}.
- Trained with training/neural/finetune_roles.py (epochs <= {a.epochs}, lr {a.lr}, batch {a.bs}, fp16 on cuda, seed {a.seed}).
""")
    print(f"\nwrote {out} ({q / 1e6:.1f} MB q8); README.md inside")


if __name__ == "__main__": main()
