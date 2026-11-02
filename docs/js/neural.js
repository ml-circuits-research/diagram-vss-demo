/*NEURAL-START*/
const NeuralKit = (function () {
'use strict';
const K = SOPKit;

/* ---------------------------------------------------------------------
   Hypotheses and examples per legend value. A plugin that adds an
   action or a question type adds a line here; the model needs no change.
   --------------------------------------------------------------------- */
const KIND = {
  command: ['This asks the editor to change the diagram.', ['draw a red circle', 'delete Start', 'connect A to B']],
  question: ['This asks a question about the diagram.', ['how many circles are there?', 'what is connected to Start?', 'where is Done?']],
  fact: ['This states what a named shape is like or where it is.', ['Start is red', 'Done is above Check', 'Process is a square']],
  rule: ['This sets a default for shapes created later.', ['from now on circles are orange', 'new squares should be large', 'by default make shapes blue']]
};
const ACTION = {
  create: ['The user wants to create a new shape.', ['draw a blue circle', 'add a box named Log', 'I need a small triangle']],
  delete: ['The user wants to delete a shape.', ['delete Start', 'remove the red circle', 'get rid of Check']],
  move: ['The user wants to move a shape somewhere else.', ['move Start below Done', 'shift A to the left', 'put Check next to Process']],
  set: ['The user wants to change the color, outline or kind of a shape.', ['make Start red', 'paint Done green', 'turn A into a square']],
  resize: ['The user wants to make a shape bigger or smaller.', ['make Done bigger', 'shrink Start', 'double the size of A']],
  rename: ['The user wants to give a shape a new name.', ['rename Check to Decision', 'call circle1 Hub', 'change the name of A to B']],
  label: ['The user wants to write a text label on a shape.', ['label Start "begin"', 'write "hello" on A', 'add the text "ok" to Check']],
  duplicate: ['The user wants to copy a shape.', ['duplicate Start', 'make two copies of A', 'clone Check']],
  swap: ['The user wants to swap the positions of two shapes.', ['swap A and B', 'exchange Start and Done']],
  connect: ['The user wants to connect shapes with an arrow or a line.', ['connect Start to Done', 'draw an arrow from A to B', 'link Check with Process']],
  disconnect: ['The user wants to remove a connection between shapes.', ['disconnect A from B', 'remove the arrow between Start and Done', 'cut the link from A to B']],
  align: ['The user wants to align shapes in a straight line.', ['align A, B and C vertically', 'line up the circles']],
  distribute: ['The user wants to space shapes evenly.', ['distribute the circles evenly', 'space the boxes out horizontally']],
  toFront: ['The user wants to bring a shape to the front.', ['bring Start to the front', 'move A on top of the others']],
  toBack: ['The user wants to send a shape to the back.', ['send Done to the back', 'put A behind the others']],
  arrange: ['The user wants to arrange shapes in a layout.', ['arrange everything in a grid', 'tidy up the diagram', 'put all shapes in a circle']],
  undo: ['The user wants to undo the last change.', ['undo', 'take that back', 'revert the last step']],
  redo: ['The user wants to redo a change that was undone.', ['redo', 'do that again']],
  forget: ['The user wants to remove the default rules.', ['forget the rules', 'clear all defaults']]
};
const ASK = {
  count: ['The user wants to know how many shapes there are.', ['how many circles are there?', 'count the red shapes']],
  list: ['The user wants a list of shapes.', ['which shapes are blue?', 'list all squares', 'what is above Start?']],
  exists: ['The user wants to know whether such a shape exists.', ['is there a red circle?', 'are there any squares?']],
  property: ['The user wants to know a property of a shape, such as its color, size or position.', ['what color is Start?', 'where is Done?', 'how big is A?']],
  check: ['The user wants to know whether a statement about a shape is true.', ['is A red?', 'is Start left of Done?', 'is A bigger than B?']],
  describe: ['The user wants a description of the diagram or of a shape.', ['describe the diagram', 'what is Start?', "what's on the canvas?"]],
  neighbors: ['The user wants to know what a shape is connected to.', ['what is connected to Start?', 'what does A link to?']],
  connected: ['The user wants to know whether two shapes are directly connected.', ['are A and B connected?', 'is Start linked to Done?']],
  degree: ['The user wants to know how many connections a shape has.', ['how many connections does A have?']],
  nearest: ['The user wants the shape closest to or farthest from another shape.', ['what is closest to Start?', 'which circle is nearest to A?']],
  extreme: ['The user wants the biggest, smallest, leftmost or most connected shape.', ['which shape is the biggest?', 'which shape has the most connections?']],
  path: ['The user wants to know whether there is a path between two shapes.', ['is there a path from A to B?', 'can I get from Start to Done?']],
  reachable: ['The user wants to know what can be reached from a shape.', ['what can be reached from A?', 'what comes after Start?']],
  cycle: ['The user wants to know whether the arrows form a cycle.', ['are there any cycles?', 'is there a loop?']],
  rules: ['The user wants to know which default rules are active.', ['what rules are active?', 'list the defaults']]
};

/* Which legend questions each kind of sentence answers (its frame). */
const FRAMES = {
  command: { create: ['count', 'shape', 'color', 'size', 'outline', 'name', 'label', 'position', 'anchor'], delete: ['target'], move: ['target', 'position', 'anchor', 'direction', 'distance'], set: ['target', 'color', 'shape', 'outline', 'label', 'size'], resize: ['target', 'size'], rename: ['target', 'name'], label: ['target', 'label'], duplicate: ['target', 'count', 'name'], swap: ['target'], connect: ['from', 'to', 'label', 'style', 'arrow', 'color', 'pairing'], distribute: ['target', 'axis'], toFront: ['target'], toBack: ['target'], disconnect: ['from', 'to'], align: ['target', 'axis'], arrange: ['target', 'layout'], undo: [], redo: [], forget: [] },
  question: { count: ['shape', 'color', 'notColor', 'size', 'position', 'anchor', 'linked'], list: ['shape', 'color', 'notColor', 'size', 'position', 'anchor', 'linked'], exists: ['shape', 'color', 'notColor', 'size', 'position', 'anchor'], property: ['target', 'property'], check: ['target', 'color', 'shape', 'size', 'position', 'anchor', 'comparison'], describe: ['target'], neighbors: ['target'], connected: ['target', 'anchor'], degree: ['target'], nearest: ['anchor', 'shape', 'color', 'superlative'], extreme: ['shape', 'color', 'superlative'], path: ['from', 'to'], reachable: ['from'], cycle: [], rules: [] },
  fact: ['target', 'color', 'shape', 'size', 'outline', 'label', 'position', 'anchor', 'linked'],
  rule: ['shape', 'color', 'size', 'outline']
};
/* Question wording, when the legend's generic wording is ambiguous for this act. */
const WORDING = {
  _: { notColor: 'Which colour must the shapes not have?', pairing: 'Are they connected in a chain, each to the next, or all to each other?', target: 'Which shape?', shape: 'What kind of shape?', color: 'What color?', size: 'How big?', anchor: 'Relative to which shape?', position: 'Where?', name: 'What is it called?', label: 'What text?', count: 'How many?', distance: 'How far?', direction: 'In which direction?', linked: 'Connected to which shape?', property: 'Which property is asked about?', superlative: 'Which extreme?', comparison: 'Bigger or smaller?' },
  create: { name: 'What is the new shape named?', label: 'What text is written on the new shape?', count: 'How many shapes are created?', anchor: 'Next to which existing shape is it placed?', position: 'Where is the new shape placed?' },
  rename: { target: 'Which shape gets a new name?', name: 'What is the new name?' },
  label: { target: 'Which shape gets the label?', label: 'What text should be written?' },
  move: { target: 'Which shape moves?', position: 'Where does it move to?', anchor: 'Next to which shape does it move?' },
  set: { target: 'Which shape changes?', color: 'Which new color?', shape: 'Which new shape?' },
  resize: { target: 'Which shape changes size?' },
  connect: { from: 'Where does the connection start?', to: 'Where does the connection end?', label: 'What text is on the connection?', style: 'Is the line dashed, dotted or solid?', color: 'What color is the connection?' },
  disconnect: { from: 'Where does the removed connection start?', to: 'Where does the removed connection end?' },
  path: { from: 'Where does the path start?', to: 'Where does the path end?' },
  reachable: { from: 'Starting from which shape?' },
  property: { target: 'Which shape is asked about?' },
  nearest: { anchor: 'Closest to which shape?' },
  connected: { target: 'Which is the first shape?', anchor: 'Which is the second shape?' }
};

/* ---------------- span normalisation (span → legend answer) ---------------- */
const camel = v => v.replace(/([A-Z])/g, ' $1').toLowerCase();
const clean = s => ' ' + String(s).toLowerCase().replace(/[^a-z0-9'-]+/g, ' ').replace(/\s+/g, ' ') + ' ';
function cueFind(span, values) {
  const s = clean(span); let best = null, bl = 0;
  for (const [v, cues] of Object.entries(values || {})) for (const c of [camel(v), v.toLowerCase()].concat(cues || [])) {
    const cc = ' ' + c.toLowerCase() + ' ';
    if (c && s.includes(cc) && cc.length > bl) { best = v; bl = cc.length; }
  }
  return best;
}
const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twice: 2, couple: 2, pair: 2 };
function numFind(span) { const m = String(span).match(/\d+(?:\.\d+)?/); if (m) return +m[0]; for (const w of clean(span).trim().split(' ')) if (w in NUMW) return NUMW[w]; return null; }
const ARTICLES = new Set(['a', 'an', 'the', 'it', 'its', 'and', 'to', 'of', 'with', 'named', 'called', 'new', 'shape']);

function cosine(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

/* =====================================================================
   The neural formalizer. `models` is injected so the same code runs in
   the browser (Transformers.js) and in tests (mocks).
   models.classify(text, hypotheses) → {labels, scores}   (zero-shot NLI)
   models.embed(texts)               → number[][]          (sentence embeddings)
   models.qa(question, context)      → {answer, score}     (extractive QA)
   ===================================================================== */
function create(engine, rulesFormalize) {
  const L = engine.legend;
  const st = { models: null, strategy: 'zeroshot', protoCache: new Map(), calls: 0 };

  async function classify(key, text, table) {
    const values = Object.keys(table).filter(v => !L.get(key) || !L.get(key).values || v in L.get(key).values);
    if (st.strategy === 'embed') {
      let proto = st.protoCache.get(key);
      if (!proto) {
        const items = []; values.forEach(v => { items.push([v, table[v][0]]); table[v][1].forEach(e => items.push([v, e])); });
        const vecs = await st.models.embed(items.map(i => i[1])); st.calls++;
        proto = items.map((it, i) => ({ v: it[0], vec: vecs[i] })); st.protoCache.set(key, proto);
      }
      const [q] = await st.models.embed([text]); st.calls++;
      const best = {}; for (const p of proto) { const c = cosine(q, p.vec); if (!(p.v in best) || c > best[p.v]) best[p.v] = c; }
      const ranked = Object.entries(best).sort((a, b) => b[1] - a[1]);
      const ex = ranked.map(r => Math.exp(r[1] * 20)), z = ex.reduce((a, b) => a + b, 0);
      return { value: ranked[0][0], top: ranked.slice(0, 3).map((r, i) => [r[0], ex[i] / z]) };
    }
    const hyps = values.map(v => table[v][0]);
    const r = await st.models.classify(text, hyps); st.calls += hyps.length;
    const top = r.labels.slice(0, 3).map((h, i) => [values[hyps.indexOf(h)], r.scores[i]]);
    return { value: top[0][0], top };
  }

  async function answer(key, act, src, ruleNode, names) {
    const q = (WORDING[act] && WORDING[act][key]) || WORDING._[key] || (L.get(key) && L.get(key).ask) || key + '?';
    const r = await st.models.qa(q, src); st.calls++;
    const span = (r && r.answer || '').trim(), score = r ? r.score : 0;
    const lq = L.get(key), kind = lq ? lq.kind : 'text';
    const out = { q, span, score, value: null, source: 'neural' };
    if (!span || score < 0.02) return out;
    if (kind === 'enum') out.value = cueFind(span, lq.values);
    if (key === 'notColor' && !/\b(?:not|non-?)\s*\w/i.test(src)) out.value = null;   /* a negated colour needs a negation in the clause */
    else if (kind === 'number') { const n = numFind(span); if (n != null && (key !== 'count' || n > 1)) out.value = n; }
    else if (kind === 'name') {
      const tok = (span.replace(/["“”']/g, ' ').match(/[A-Za-z_][\w-]*/g) || []).find(w => !ARTICLES.has(w.toLowerCase()) && !L.lexicon('color').has(w.toLowerCase()) && !L.lexicon('shape').has(w.toLowerCase()) && !L.lexicon('size').has(w.toLowerCase()));
      if (tok && score > 0.15 && (act !== 'create' || /\b(named|called|name)\b/i.test(src))) out.value = tok;
    } else if (kind === 'text') {
      const quoted = [...src.matchAll(/"([^"]*)"/g)].map(m => m[1]);
      const hit = quoted.find(qs => qs.includes(span.replace(/^"|"$/g, '')) || span.includes(qs));
      if (hit != null) out.value = hit; else if (score > 0.5 && !quoted.length && /\b(label|text|write|say|says|saying|title)/i.test(src)) out.value = span.replace(/^["']|["']$/g, '');
    } else if (kind === 'names') {
      const found = [];
      for (const w of span.match(/[A-Za-z_][\w-]*/g) || []) { if (w === 'a' || w === 'I') continue; const hit = names.get(w.toLowerCase()); if (hit != null && !found.some(f => f === hit)) found.push(hit); }
      if (found.length) out.value = found.length === 1 ? found[0] : found;
      else if (ruleNode && ruleNode.args[key] != null && /\b(it|its|them|they|this|that|the|all|every|each|everything)\b/i.test(span)) { out.value = ruleNode.args[key]; out.source = 'rules (reference)'; }
    }
    return out;
  }

  async function formalize(input, ctx) {
    if (!st.models) throw new K.SOPError('The neural models are not loaded yet. Open the Neural tab and load them.');
    const t0 = Date.now(); st.calls = 0;
    const rules = rulesFormalize(input, ctx);
    const names = new Map((ctx.names || []).map(n => [n.toLowerCase(), n]));
    const mentionById = new Map(rules.nodes.filter(n => n.type === 'mention').map(n => [n.id, n]));
    const nodes = [], analyses = [], used = new Set();
    const taken = new Set(rules.nodes.map(n => n.id)); let k = 0;
    for (const seg of rules.segments) {
      const rn = seg.id ? rules.nodes.find(n => n.id === seg.id) : { id: null, type: null, args: {}, src: seg.src };
      if (!rn.id) { do { rn.id = 'n' + (++k); } while (taken.has(rn.id)); taken.add(rn.id); }
      const a = { id: rn.id, src: seg.src, rules: seg.id ? rn : null, keys: {} };
      a.kind = await classify('wire', seg.src, KIND);
      const type = a.kind.value; let act = null, actKey = null;
      if (type === 'command') { actKey = 'action'; a.act = await classify('action', seg.src, ACTION); act = a.act.value; }
      else if (type === 'question') { actKey = 'ask'; a.act = await classify('ask', seg.src, ASK); act = a.act.value; }
      const frame = type === 'command' ? FRAMES.command[act] : type === 'question' ? FRAMES.question[act] : FRAMES[type];
      const args = {}; if (actKey) args[actKey] = act;
      for (const k of frame || []) {
        const r = await answer(k, act || type, seg.src, a.rules, names); a.keys[k] = r;
        if (r.value != null) args[k] = r.value;
      }
      if (args.notColor && args.color === args.notColor) delete args.color;
      if (args.position && !['center', 'top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(args.position) && args.anchor == null) delete args.position;
      if (args.anchor != null && !args.position && !['nearest', 'connected', 'check'].includes(act)) delete args.anchor;
      const id = rn.id;
      const node = { id, type, args };
      for (const v of Object.values(args)) [].concat(v).forEach(x => { if (K.isRef(x) && mentionById.has(x.ref)) used.add(x.ref); });
      for (const m of rules.nodes) if (m.type === 'mention' && used.has(m.id) && !nodes.includes(m)) nodes.push(m);
      nodes.push(node); analyses.push(a);
      if (act === 'create' && args.name != null && !args.count) names.set(String(args.name).toLowerCase(), { ref: id });
      if (act === 'rename' && args.name != null) names.set(String(args.name).toLowerCase(), String(args.name));
    }
    return { nodes, notes: rules.notes, rulesNodes: rules.nodes, analyses, ms: Date.now() - t0, calls: st.calls };
  }

  /* ---------------- benchmark: hand-labelled sentences ---------------- */
  const BENCH = [
    ['Draw a small red circle named Ball', 'command', { action: 'create', shape: 'circle', size: 'small', color: 'red', name: 'Ball' }],
    ["I'd like a big green box under Process", 'command', { action: 'create', shape: 'rectangle', size: 'large', color: 'green', position: 'below', anchor: 'Process' }],
    ['Add three yellow triangles', 'command', { action: 'create', count: 3, shape: 'triangle', color: 'yellow' }],
    ['Get rid of Check', 'command', { action: 'delete', target: 'Check' }],
    ['Erase Done', 'command', { action: 'delete', target: 'Done' }],
    ['Put Check under Done', 'command', { action: 'move', target: 'Check', position: 'below', anchor: 'Done' }],
    ['Shift Process to the left by 40 pixels', 'command', { action: 'move', target: 'Process', direction: 'left', distance: 40 }],
    ['Colour Start orange', 'command', { action: 'set', target: 'Start', color: 'orange' }],
    ['Paint Process yellow', 'command', { action: 'set', target: 'Process', color: 'yellow' }],
    ['Can you make Done a bit larger', 'command', { action: 'resize', target: 'Done' }],
    ['Call Check Decision', 'command', { action: 'rename', target: 'Check', name: 'Decision' }],
    ['Write "begin" on Start', 'command', { action: 'label', target: 'Start', label: 'begin' }],
    ['Hook Start up to Done with a dashed arrow', 'command', { action: 'connect', from: 'Start', to: 'Done', style: 'dashed' }],
    ['Draw an arrow from Done to Start', 'command', { action: 'connect', from: 'Done', to: 'Start' }],
    ['Cut the link between Process and Check', 'command', { action: 'disconnect', from: 'Process', to: 'Check' }],
    ['Line up Start, Process and Check horizontally', 'command', { action: 'align', target: ['Start', 'Process', 'Check'], axis: 'horizontal' }],
    ['Lay everything out as a grid', 'command', { action: 'arrange', layout: 'grid' }],
    ['Take that back', 'command', { action: 'undo' }],
    ['How many circles do we have?', 'question', { ask: 'count', shape: 'circle' }],
    ['Is there any blue square?', 'question', { ask: 'exists', shape: 'square', color: 'blue' }],
    ['Where is Done?', 'question', { ask: 'property', target: 'Done', property: 'position' }],
    ['What colour is Check?', 'question', { ask: 'property', target: 'Check', property: 'color' }],
    ['Which things link to Process?', 'question', { ask: 'neighbors', target: 'Process' }],
    ['Can I get from Start to Done?', 'question', { ask: 'path', from: 'Start', to: 'Done' }],
    ['What lies downstream of Process?', 'question', { ask: 'reachable', from: 'Process' }],
    ['Does the graph contain a loop?', 'question', { ask: 'cycle' }],
    ['Which shape is the largest?', 'question', { ask: 'extreme', superlative: 'biggest' }],
    ["What's nearest to Start?", 'question', { ask: 'nearest', anchor: 'Start', superlative: 'closest' }],
    ['Is Check to the right of Process?', 'question', { ask: 'check', target: 'Check', position: 'rightOf', anchor: 'Process' }],
    ['From now on, squares should be gray', 'rule', { shape: 'square', color: 'gray' }],
    ['Done is red', 'fact', { target: 'Done', color: 'red' }]
  ];
  const norm = v => v == null ? '∅' : K.isRef(v) ? '$' + v.ref : Array.isArray(v) ? v.map(norm).join(',') : String(v).toLowerCase();
  function score(node, type, gold) {
    const keys = Object.keys(gold), per = {};
    let ok = !!node && node.type === type;
    for (const k of keys) { const got = node ? norm(node.args[k]) : '∅', want = norm(gold[k]); per[k] = { got, want, ok: got === want }; if (!per[k].ok) ok = false; }
    return { ok, per };
  }
  async function bench(onRow) {
    const names = ['Start', 'Process', 'Check', 'Done'], rows = [];
    for (const [text, type, gold] of BENCH) {
      const ctx = { names, last: [] };
      const r = rulesFormalize(text, ctx), rMain = r.nodes.filter(n => n.type !== 'mention').pop();
      const t0 = Date.now(); let nMain = null, err = null;
      try { const n = await formalize(text, ctx); nMain = n.nodes.filter(x => x.type !== 'mention').pop(); } catch (e) { err = e.message; }
      const row = { text, type, gold, rules: score(rMain, type, gold), neural: score(nMain, type, gold), rNode: rMain, nNode: nMain, ms: Date.now() - t0, err };
      rows.push(row); if (onRow) onRow(row, rows.length, BENCH.length);
    }
    const sum = side => { let keys = 0, kok = 0, wires = 0; rows.forEach(r => { if (r[side].ok) wires++; Object.values(r[side].per).forEach(p => { keys++; if (p.ok) kok++; }); }); return { wires, keys, kok, n: rows.length }; };
    return { rows, rules: sum('rules'), neural: sum('neural') };
  }

  return { formalize, bench, state: st, setModels(m) { st.models = m; st.protoCache.clear(); }, setStrategy(s) { st.strategy = s; }, BENCH, FRAMES, WORDING };
}

/* ---------------- Transformers.js loader (browser only) ---------------- */
const MODELS = {
  zeroshot: { deberta: 'Xenova/nli-deberta-v3-xsmall', distilbert: 'Xenova/distilbert-base-uncased-mnli' },
  embed: 'Xenova/all-MiniLM-L6-v2',
  qa: 'Xenova/distilbert-base-cased-distilled-squad'
};
const LIB = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1';
/* The neural reader runs on the CPU (WASM) with the q8 files (onnx/model_quantized.onnx). WebGPU is not offered: on a browser that
   exposes navigator.gpu without an adapter (owner, Linux) it failed with "no available backend found ... Failed to get GPU adapter",
   and transformers.js 3.8.1 cannot retry on WASM in the same page: src/backends/onnx.js keeps the first session promise
   (wasmInitPromise) and awaits it before every later session, so one failed WebGPU session fails every WASM session after it.
   device 'wasm' maps to the execution providers ['wasm'] only, so this path never touches WebGPU. Sizes are those of the .onnx
   files (measured 2026-11-02; MiniLM approximate); the tokenizer and config files add a little. */
const DTYPE = 'q8', HF = 'https://huggingface.co/', CACHE = 'transformers-cache';   // transformers.js 3.8.1: src/utils/hub.js getModelFile
const FILES = ['config.json', 'tokenizer.json', 'tokenizer_config.json', 'onnx/model_quantized.onnx'];
const SIZES = { 'Xenova/nli-deberta-v3-xsmall': 87.2e6, 'Xenova/distilbert-base-uncased-mnli': 67.6e6, 'Xenova/all-MiniLM-L6-v2': 23e6, 'Xenova/distilbert-base-cased-distilled-squad': 65.8e6 };
const NAMES = { 'Xenova/nli-deberta-v3-xsmall': 'DeBERTa-v3 xsmall', 'Xenova/distilbert-base-uncased-mnli': 'DistilBERT MNLI', 'Xenova/all-MiniLM-L6-v2': 'MiniLM-L6', 'Xenova/distilbert-base-cased-distilled-squad': 'DistilBERT SQuAD' };
/** the two models a choice needs: [message-type model, answer model] */
const modelsFor = opts => [opts.strategy === 'embed' ? MODELS.embed : MODELS.zeroshot[opts.zeroshot || 'deberta'], MODELS.qa];
/** the exact URLs transformers.js requests (and uses as Cache API keys) for these models */
const urlsFor = opts => modelsFor(opts).flatMap(id => FILES.map(f => `${HF}${id}/resolve/main/${f}`));
/** true when every file of the choice is already in this browser's transformers.js cache (nothing to download) */
async function cached(opts) {
  try {
    if (typeof caches === 'undefined' || !(await caches.has(CACHE))) return false;
    const c = await caches.open(CACHE);
    for (const u of urlsFor(opts)) if (!(await c.match(u))) return false;
    return true;
  } catch (e) { return false; }
}
const looksNetwork = e => /failed to fetch|networkerror|load failed|network|dynamically imported module|importing a module script failed|err_|timeout|cors/i.test(String(e && e.message || e)) || (e && e.name === 'TypeError' && /fetch/i.test(String(e.message)));
async function load(opts, onProgress) {
  let T;
  try { T = await import(LIB); }
  catch (e) { throw Object.assign(new Error(`The transformers.js library could not be loaded: ${e && e.message || e}`), { url: LIB, network: true, cause: e }); }
  T.env.allowLocalModels = false;
  try { T.env.useBrowserCache = typeof caches !== 'undefined'; } catch (e) { T.env.useBrowserCache = false; }
  const open = new Set();   // files asked for and not finished: transformers.js loads them in parallel, so a failure names no single file
  const track = e => { if (e && e.name && e.file) { const u = `${HF}${e.name}/resolve/main/${e.file}`; if (e.status === 'initiate') open.add(u); else if (e.status === 'done') open.delete(u); } if (onProgress) onProgress(e); };
  const build = async device => {
    const make = (task, model) => T.pipeline(task, model, { device, dtype: DTYPE, progress_callback: track });
    const qa = await make('question-answering', MODELS.qa);
    const m = { device, dtype: DTYPE, qaModel: MODELS.qa };
    m.qa = async (q, c) => { let r = await qa(q, c); if (Array.isArray(r)) r = r[0]; return r || { answer: '', score: 0 }; };
    if (opts.strategy === 'embed') {
      const fe = await make('feature-extraction', MODELS.embed); m.enumModel = MODELS.embed;
      m.embed = async texts => (await fe(texts, { pooling: 'mean', normalize: true })).tolist();
    } else {
      const id = MODELS.zeroshot[opts.zeroshot || 'deberta'], zs = await make('zero-shot-classification', id); m.enumModel = id;
      m.classify = async (text, hyps) => { const r = await zs(text, hyps, { hypothesis_template: '{}' }); return Array.isArray(r) ? r[0] : r; };
    }
    open.clear();
    await m.qa('What is drawn?', 'A red circle is drawn.');           // the first inference: a device that fails here fails now, not on a message
    if (m.classify) await m.classify('draw a circle', ['This asks the editor to change the diagram.', 'This asks a question about the diagram.']); else await m.embed(['draw a circle']);
    return m;
  };
  try {
    return await build('wasm');
  } catch (e) {
    const msg = String(e && e.message || e || 'unknown error');
    const pending = /https?:\/\//.test(msg) ? [] : [...open];
    throw Object.assign(new Error(msg), { url: pending.length ? pending.join(' ') : null, files: pending, network: looksNetwork(e), cause: e });
  }
}

return { create, load, cached, modelsFor, urlsFor, MODELS, SIZES, NAMES, DTYPE };
})();
if (typeof module !== 'undefined') module.exports = NeuralKit;
/*NEURAL-END*/
