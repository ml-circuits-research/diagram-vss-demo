// Export display-only example references. Never call a language reader or change training data here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const K = require('../../docs/js/logic.js');
const scenarios = require('../../docs/js/scenarios.js');
const manual = JSON.parse(fs.readFileSync(path.join(root, 'docs/examples/manual.json')));
const annotations = new Map();
for (const folder of ['llm_train/scenes_r3', 'llm_train/scenes_r3b', 'llm_bench/scenes_test']) {
  const dir = path.join(root, 'training/sketch', folder);
  for (const file of fs.readdirSync(dir).filter(f => /^(msg|batch)_.*\.jsonl$/.test(f)).sort()) {
    for (const line of fs.readFileSync(path.join(dir, file), 'utf8').split('\n').filter(Boolean)) {
      const row = JSON.parse(line);
      if (annotations.has(row.text)) throw new Error(`Duplicate annotation text: ${row.id}`);
      annotations.set(row.text, { ...row, source: `training/sketch/${folder}/${file}#${row.id}` });
    }
  }
}
const split = text => { const out = []; let depth = 0, part = ''; for (const c of text) { if (c === '(') depth++; if (c === ')') depth--; if (c === ',' && !depth) { out.push(part.trim()); part = ''; } else part += c; } out.push(part.trim()); return out; };
const scalar = v => /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
const listKeys = new Set(['target', 'from', 'to', 'anchor', 'anchor2', 'members', 'items', 'items2', 'parents', 'at']);
function annotated(row) {
  const nodes = [], notes = []; let latest = null, mentions = 0, incomplete = false;
  row.wires.forEach((w, i) => {
    const id = 's' + (i + 1), args = {};
    for (const [key, value] of Object.entries(w.args)) {
      if (typeof value !== 'string') { args[key] = value; continue; }
      const values = (listKeys.has(key) ? split(value) : [value]).map(v => {
        if (v === '$new') { if (!latest) throw new Error(`${row.id}: unresolved $new`); return { ref: latest }; }
        const mention = /^mention\((.*)\)$/.exec(v);
        if (mention) {
          const mid = 'm' + (++mentions), ma = {};
          for (const item of split(mention[1])) { const eq = item.indexOf('='); if (eq < 1) throw new Error(`Invalid mention: ${item}`); ma[item.slice(0, eq).replace(/^notcolor$/, 'notColor')] = scalar(item.slice(eq + 1)); }
          nodes.push({ id: mid, type: 'mention', args: ma }); return { ref: mid };
        }
        return ['label', 'title', 'name'].includes(key) ? v : scalar(v);
      });
      args[key] = values.length === 1 ? values[0] : values;
    }
    if (args.action === 'resize' && args.scale == null && args.size == null) {
      const smaller = /\b(shrink|smaller|tinier|reduce|less big)\b/i.test(w.span || row.text);
      args.scale = smaller ? 0.67 : 1.5;
      notes.push(`The request gives no exact size factor; this preview chooses ${args.scale}×.`);
      if (/\bthan\b/i.test(w.span || row.text)) { incomplete = true; notes.push('The saved annotation does not encode the size comparison. This preview is illustrative; it does not establish that the comparison is satisfied.'); }
    }
    nodes.push({ id, type: w.type, args });
    if (w.type === 'command' && ['create', 'duplicate'].includes(args.action)) latest = id;
  });
  return { text: row.text, sop: nodes.map(K.serialize).join('\n'), source: row.source, ...(notes.length ? { notes } : {}), ...(incomplete ? { incomplete: true } : {}) };
}
function checked(row) {
  if (!row) throw new Error('Missing reference');
  const nodes = K.parse(row.sop);
  if (nodes.some(n => n.args.action === 'resize' && n.args.scale != null) && !row.notes) row = { ...row, notes: ['The request gives no exact size factor; this reference uses the editor’s default factor.'] };
  return row;
}
const result = { version: 1, scenarios: {}, quick: manual.quick.map(checked) };
for (const sc of scenarios) {
  result.scenarios[sc.id] = sc.turns.map((text, i) => {
    if (sc.kind !== 'scene') {
      const row = manual.scenarios[sc.id]?.[i];
      if (row?.text !== text) throw new Error(`Stale manual reference: ${sc.id}, step ${i + 1}`);
      return checked({ ...row, source: `docs/examples/manual.json#${sc.id}/${i + 1}` });
    }
    if (i === 0 && text === 'Clear the canvas') return { text, sop: '@m1 mention quantifier=all\n@s1 command action=delete target=$m1', setup: 'empty', source: 'Scenario setup' };
    const row = annotations.get(text);
    if (!row) throw new Error(`No annotation: ${sc.id}, step ${i + 1}`);
    return checked(annotated(row));
  });
}
const output = path.join(root, 'docs/examples/reference.json');
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(`Exported ${Object.keys(result.scenarios).length} scenarios (${Object.values(result.scenarios).flat().length} messages) and ${result.quick.length} quick examples.`);
