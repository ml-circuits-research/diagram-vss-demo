// test_collect.mjs: node tests of docs/js/collect.js (the collected requests) and training/sketch/collect_to_bench.py (the converter).
//   node training/sketch/test_collect.mjs
// 1. the store: entries persist in the (fake) localStorage and come back after a reload; the cap keeps the last N; a quota error drops the
//    oldest tenth until the write fits (and counts what was dropped); a storage that throws on every access keeps the entries in memory;
//    the on/off switch persists; clear empties it; events attach to the entry of (session, turn);
// 2. JSONL: one valid JSON object per line, a final newline, the file name has the local date;
// 3. buildEntry on a turn shaped like docs/js/ui.js's `rec`: the fresh2 wire format (mentions folded, $new, names as written), spans from the
//    gate's units, the confidences, executed / held, the source with the original words, an empty gold;
// 4. the converter: texts / batch (gold empty) / context files, --via and --dedupe, bad lines skipped, the texts identical to the entries'.
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const C = require("../../docs/js/collect.js");
const K = require("../../docs/js/logic.js");
const HERE = dirname(fileURLToPath(import.meta.url));
let fails = 0, n = 0;
const check = (name, ok, detail = "") => { n++; if (!ok) { fails++; console.log(`FAIL ${name}${detail ? "\n     " + detail : ""}`); } else console.log(`ok   ${name}`); };
const eq = (name, got, want) => check(name, JSON.stringify(got) === JSON.stringify(want), `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

/** a localStorage with a byte limit (string lengths), like the browser's quota */
function fakeStorage(limit = Infinity, opts = {}) {
  const m = new Map();
  const size = () => [...m].reduce((s, [k, v]) => s + k.length + v.length, 0);
  return {
    m,
    getItem(k) { if (opts.broken) throw Object.assign(new Error("The operation is insecure."), { name: "SecurityError" }); return m.has(k) ? m.get(k) : null; },
    setItem(k, v) {
      if (opts.broken) throw Object.assign(new Error("The operation is insecure."), { name: "SecurityError" });
      const before = m.get(k); m.set(k, String(v));
      if (size() > limit) { if (before === undefined) m.delete(k); else m.set(k, before); throw Object.assign(new Error("Setting the value exceeded the quota."), { name: "QuotaExceededError", code: 22 }); }
    },
    removeItem(k) { m.delete(k); }
  };
}
const mk = (i, extra = {}) => Object.assign({ session: "s1", turn: i, text: `message ${i}`, names: ["Start"], readings: {}, wires: [] }, extra);

// 1. the store
{
  const st = fakeStorage();
  let clock = Date.UTC(2026, 10, 3, 12, 0, 0);
  const now = () => new Date(clock += 1000);
  const S = C.createStore({ storage: st, now });
  check("1. on by default", S.enabled());
  const e = S.add(mk(1));
  check("1. add sets id, time, format, events", /^c-/.test(e.id) && e.time === "2026-11-03T12:00:01.000Z" && e.format === C.FORMAT && Array.isArray(e.events));
  S.add(mk(2));
  const S2 = C.createStore({ storage: st, now });
  eq("1. the entries come back after a reload", S2.list().map(x => x.text), ["message 1", "message 2"]);
  check("1. event on (session, turn)", S2.event("s1", 2, { kind: "anyway", reader: "combined", index: 0 }) && S2.find("s1", 2).events[0].kind === "anyway");
  check("1. event on an unknown turn -> false", S2.event("s1", 99, { kind: "edit" }) === false && S2.event("other", 1, { kind: "edit" }) === false);
  eq("1. the event is stored", JSON.parse(st.getItem(C.KEY))[1].events.map(x => x.kind), ["anyway"]);
  S2.setEnabled(false);
  check("1. off: add returns null and keeps nothing", S2.add(mk(3)) === null && S2.count() === 2);
  check("1. the switch persists", C.createStore({ storage: st }).enabled() === false);
  S2.setEnabled(true);
  check("1. on again persists", C.createStore({ storage: st }).enabled() === true && st.getItem(C.ON_KEY) === null);
  S2.clear();
  check("1. clear empties the store and the key", S2.count() === 0 && st.getItem(C.KEY) === null && C.createStore({ storage: st }).count() === 0);
}
{ // cap
  const S = C.createStore({ storage: fakeStorage(), cap: 5 });
  for (let i = 1; i <= 12; i++) S.add(mk(i));
  eq("1. the cap keeps the last 5", S.list().map(x => x.turn), [8, 9, 10, 11, 12]);
  check("1. what the cap dropped is counted", S.status().dropped === 7);
  eq("1. last(3) is newest first", S.last(3).map(x => x.turn), [12, 11, 10]);
}
{ // the default cap is 5000
  check("1. default cap 5000", C.createStore({ storage: null }).cap === 5000 && C.CAP === 5000);
}
{ // quota
  const one = JSON.stringify(Object.assign(mk(1), { format: C.FORMAT, id: "c-xxxxxxxx-xxxxxx", time: "2026-11-03T12:00:00.000Z", events: [] })).length;
  const st = fakeStorage(one * 20 + 200);
  const S = C.createStore({ storage: st });
  for (let i = 1; i <= 60; i++) S.add(mk(i));
  const kept = S.list().map(x => x.turn), stored = JSON.parse(st.getItem(C.KEY)).map(x => x.turn);
  check("1. quota: the newest entry is always kept", kept[kept.length - 1] === 60, JSON.stringify(kept));
  check("1. quota: the oldest were dropped, the rest in order", kept.length < 60 && kept.length >= 10 && kept.every((t, i) => i === 0 || t === kept[i - 1] + 1), JSON.stringify(kept));
  eq("1. quota: memory and storage agree", stored, kept);
  check("1. quota: dropped + kept = added", S.status().dropped + kept.length === 60, JSON.stringify(S.status()));
  check("1. quota: still persistent", S.status().persistent === true);
  check("1. isQuota recognises the browsers' errors", C.isQuota({ name: "QuotaExceededError" }) && C.isQuota({ name: "NS_ERROR_DOM_QUOTA_REACHED" }) && C.isQuota({ code: 22 }) && !C.isQuota({ name: "SecurityError" }));
}
{ // one entry bigger than the whole quota: it is dropped too, nothing throws
  const S = C.createStore({ storage: fakeStorage(50) });
  let threw = false; try { S.add(mk(1, { text: "x".repeat(500) })); } catch (e) { threw = true; }
  check("1. an entry bigger than the quota does not throw", !threw && S.status().persistent);
}
{ // storage that throws on every access (blocked site data): memory only
  let threw = false, S;
  try { S = C.createStore({ storage: fakeStorage(Infinity, { broken: true }) }); S.add(mk(1)); S.add(mk(2)); S.event("s1", 1, { kind: "edit" }); S.setEnabled(true); S.clear(); S.add(mk(3)); } catch (e) { threw = true; }
  check("1. broken storage: nothing throws", !threw);
  check("1. broken storage: memory only, said in the status", S.count() === 1 && S.status().persistent === false && /insecure/.test(S.status().error), JSON.stringify(S.status()));
  const T = C.createStore({ storage: null }); T.add(mk(1));
  check("1. no storage at all: memory only", T.count() === 1 && T.status().persistent === false);
}
{ // a corrupt stored value
  const st = fakeStorage(); st.setItem(C.KEY, "{not json");
  const S = C.createStore({ storage: st });
  check("1. corrupt stored value: starts empty, says so", S.count() === 0 && /could not be read/.test(S.status().error));
  S.add(mk(1)); check("1. corrupt stored value: overwritten by the next add", JSON.parse(st.getItem(C.KEY)).length === 1);
}

// 2. JSONL and the file name
{
  const S = C.createStore({ storage: fakeStorage() });
  check("2. empty JSONL is empty", S.jsonl() === "");
  S.add(mk(1, { text: 'quote " and\nnewline and ț ș' })); S.add(mk(2));
  const j = S.jsonl(), lines = j.split("\n");
  check("2. one line per entry and a final newline", lines.length === 3 && lines[2] === "" && j.endsWith("\n"));
  let ok = true; try { lines.slice(0, 2).forEach(l => JSON.parse(l)); } catch (e) { ok = false; }
  check("2. every line is JSON", ok);
  eq("2. text with a newline survives", JSON.parse(lines[0]).text, 'quote " and\nnewline and ț ș');
  eq("2. file name with the local date", C.fileName(new Date(2026, 10, 3, 9, 5)), "sop-requests-2026-11-03-0905.jsonl");
}

// 3. buildEntry
{
  const nodes = K.parse(`@m1 mention shape=circle color=red
@t1 command action=create shape=square name=Api color=blue
@t2 command action=connect from=$t1 to=Start
@t3 command action=set target=$m1 color=green`);
  const [m1, t1, t2, t3] = nodes;
  const rec = {
    id: 7, text: "add a blue square Api and connect it to Start, make the red circle green", typed: "add a blue sqare Api and connect it to Start, make the red circle green",
    spell: { fixes: [{ from: "sqare", to: "square", sim: 0.9, second: 0.5 }] },
    cut: { strategy: "bert", units: [{ src: "add a blue square Api" }, { src: "connect it to Start" }, { src: "make the red circle green" }] },
    readers: {
      rules: { nodes, ms: 1.23456, names: ["Start", "Done"] },
      vss: { nodes: [t1], ms: 4, names: ["Start", "Done"], error: null },
      combined: { allNodes: nodes, nodes: [t1, t2], ms: 30, names: ["Start", "Done"],
        gate: { level: "cost", threshold: { command: 0.71234567, question: 0.5 }, units: [
          { index: 0, src: "add a blue square Api", conf: 0.93, execute: true, nodes: [t1] },
          { index: 1, src: "connect it to Start", conf: 0.88, execute: true, nodes: [t2] },
          { index: 2, src: "make the red circle green", conf: 0.41, execute: false, nodes: [m1, t3], reasons: [{ text: "the two readers read different colours" }] }] } }
    },
    off: { neural: "still loading, did not read this" }
  };
  const e = C.buildEntry(rec, { session: "s9", serialize: K.serialize, names: ["Start", "Done"], source: { via: "voice", lang: "ro-RO", original: "adaugă un pătrat albastru Api", translation: { by: "builtin", edited: false } }, reply: "Drew Api.", tab: "combined" });
  eq("3. text as sent (before spelling), read = after", [e.text, e.read], [rec.typed, rec.text]);
  eq("3. spelling fixes", e.spell, [{ from: "sqare", to: "square" }]);
  eq("3. source with the original and the language", e.source, { via: "voice", lang: "ro-RO", original: "adaugă un pătrat albastru Api", translation: { by: "builtin", edited: false } });
  eq("3. names, domain, gold empty", [e.names, e.domain, e.wires], [["Start", "Done"], "collected from the demo", []]);
  eq("3. session and turn", [e.session, e.turn], ["s9", 7]);
  const c = e.readings.combined;
  eq("3. combined wires: fresh2 format, mention folded, $new, case kept", c.wires.map(w => [w.type, w.args]), [
    ["command", { action: "create", shape: "square", name: "Api", color: "blue" }],
    ["command", { action: "connect", from: "$new", to: "Start" }],
    ["command", { action: "set", target: "mention(color=red,shape=circle)", color: "green" }]]);
  eq("3. spans from the gate's units", c.wires.map(w => w.span), ["add a blue square Api", "connect it to Start", "make the red circle green"]);
  eq("3. confidences, executed, held", [c.units.map(u => u.conf), c.executed, c.held], [[0.93, 0.88, 0.41], [0, 1], [2]]);
  eq("3. reasons only on held units", c.units.map(u => u.reasons || null), [null, null, ["the two readers read different colours"]]);
  eq("3. gate level and threshold (rounded)", c.gate, { level: "cost", threshold: { command: 0.7123, question: 0.5 } });
  check("3. SOP Lang of every wire the reader read (also the held)", c.sop.split("\n").length === 4 && /action=set/.test(c.sop) && /@m1 mention/.test(c.sop), c.sop);
  check("3. Rules: read, no gate, rounded ms", e.readings.rules.status === "read" && !e.readings.rules.units && e.readings.rules.ms === 1.2346);
  eq("3. a reader that did not read it", e.readings.neural, { status: "off", note: "still loading, did not read this" });
  eq("3. the cut", e.cut, { by: "bert", units: ["add a blue square Api", "connect it to Start", "make the red circle green"] });
  check("3. reply and tab", e.reply === "Drew Api." && e.tab === "combined");
  check("3. a reader's names only when they differ", !("names" in c) && C.buildEntry(rec, { names: ["Start"] }).readings.combined.names.length === 2);
  check("3. the entry round-trips through JSON", JSON.stringify(JSON.parse(JSON.stringify(e))) === JSON.stringify(e));
  const t = C.buildEntry({ id: 1, text: "hi", typed: "hi", readers: {} }, {});
  check("3. a typed message: via typed, no read, no original", t.source.via === "typed" && !("read" in t) && !("original" in t.source));
  const er = C.buildEntry({ id: 2, text: "x", typed: "x", readers: { rules: { nodes: [], error: new Error("No wires.") }, vss: { nodes: [], error: new Error("boom") } } }, {});
  check("3. 'No wires.' is a reading with no wires, another error is an error", er.readings.rules.status === "read" && er.readings.rules.wires.length === 0 && er.readings.vss.status === "error" && er.readings.vss.error === "boom");
}

// 4. the converter
{
  const dir = mkdtempSync(join(tmpdir(), "collect-test-"));
  const S = C.createStore({ storage: fakeStorage() });
  const ent = (i, text, extra = {}) => S.add(Object.assign({ format: C.FORMAT, session: "s", turn: i, domain: "collected from the demo", names: ["Start", "Process"], text, source: { via: "typed" }, readings: { combined: { status: "read", sop: "", wires: [], units: [{ index: 0, src: text, conf: 0.4, execute: false }], executed: [], held: [0] } }, events: [], wires: [] }, extra));
  ent(1, "make Start red");
  ent(2, "fă Start roșu → make Start red", { source: { via: "voice", lang: "ro-RO", original: "fă Start roșu", translation: { by: "builtin", edited: false } } });
  ent(3, "make Start red");
  ent(4, "undo");
  S.event("s", 1, { kind: "undo-next", by: "button" });
  const file = join(dir, "collected.jsonl");
  writeFileSync(file, S.jsonl() + "this is not json\n" + JSON.stringify({ format: "other", text: "x" }) + "\n");
  const out = join(dir, "bench");
  const py = join(HERE, "collect_to_bench.py");
  const run = args => execFileSync("python3", [py, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const msg = run([file, "--out", out]);
  check("4. converter runs", /wrote 4 messages/.test(msg) && /skipped 2 lines/.test(msg), msg);
  const rd = p => readFileSync(join(out, p), "utf8").trim().split("\n").map(l => JSON.parse(l));
  const texts = rd("texts/texts_01.jsonl"), batch = rd("batch_01.jsonl"), ctx = rd("context/context_01.jsonl");
  eq("4. ids", texts.map(x => x.id), ["col-0001", "col-0002", "col-0003", "col-0004"]);
  eq("4. texts row: id, domain, names, text (as fresh2 texts)", Object.keys(texts[0]), ["id", "domain", "names", "text"]);
  check("4. texts identical to the entries", texts.map(x => x.text).join("|") === S.list().map(x => x.text).join("|"));
  check("4. batch = texts + empty wires", batch.every((b, i) => b.wires.length === 0 && JSON.stringify(Object.assign({}, b, { wires: undefined })) === JSON.stringify(Object.assign({}, texts[i], { wires: undefined }))));
  eq("4. context keeps the original and the events", [ctx[1].collected.source.original, ctx[0].collected.events[0].kind], ["fă Start roșu", "undo-next"]);
  check("4. context has the readings, batch has none", ctx[0].collected.readings.combined.held[0] === 0 && !("readings" in batch[0]));
  check("4. README written", existsSync(join(out, "README.md")) && /4 messages/.test(readFileSync(join(out, "README.md"), "utf8")));
  let refused = false; try { run([file, "--out", out]); } catch (e) { refused = e.status === 1; }
  check("4. an existing batch is not overwritten without --force", refused);
  const out2 = join(dir, "b2");
  run([file, "--out", out2, "--via", "voice"]);
  eq("4. --via voice", rd2(out2).map(x => x.text), ["fă Start roșu → make Start red"]);
  const out3 = join(dir, "b3");
  run([file, "--out", out3, "--dedupe", "--prefix", "x"]);
  eq("4. --dedupe and --prefix", rd2(out3).map(x => x.id + " " + x.text), ["x-0001 make Start red", "x-0002 fă Start roșu → make Start red", "x-0003 undo"]);
  function rd2(o) { return readFileSync(join(o, "batch_01.jsonl"), "utf8").trim().split("\n").map(l => JSON.parse(l)); }
  rmSync(dir, { recursive: true, force: true });
}

console.log(`\n${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
