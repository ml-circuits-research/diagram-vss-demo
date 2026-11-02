// node check.mjs: checks texts_NN.jsonl vs msg_NN.jsonl and counts the new position requests per kind
import fs from 'node:fs'; import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const K = require('../../../../docs/js/logic.js'); const L = K.createSystem().engine.legend;
const here = new URL('.', import.meta.url).pathname; let bad = 0; const err = m => { bad++; console.log('ERR', m); };
const cnt = {two: {}, reg: {}}; let msgs = 0, wires = 0, short = 0;
for (const f of fs.readdirSync(here).filter(f => /^texts_\d+\.jsonl$/.test(f)).sort()) {
  const T = fs.readFileSync(here + f, 'utf8').trim().split('\n').map(l => JSON.parse(l));
  const mf = f.replace('texts', 'msg'); if (!fs.existsSync(here + mf)) { console.log('no', mf); continue; }
  const M = fs.readFileSync(here + mf, 'utf8').trim().split('\n').map(l => JSON.parse(l));
  if (T.length !== M.length) err(`${f}: ${T.length} texts vs ${M.length} msgs`);
  T.forEach((t, i) => { const m = M[i]; msgs++; if (!m) return;
    if (t.id !== m.id || t.text !== m.text || JSON.stringify(t.names) !== JSON.stringify(m.names)) err(`${m.id}: text/names/id differ from texts file`);
    if (m.wires.length === 1 && m.text.length < 120) short++;
    let last = -1;
    for (const w of m.wires) { wires++;
      const at = m.text.indexOf(w.span); if (at < 0) err(`${m.id}: span not in text: ${w.span}`);
      else { if (at < last) err(`${m.id}: wires out of order: ${w.span}`); last = at; if (!w.span.includes(w.trigger)) err(`${m.id}: trigger "${w.trigger}" not in span "${w.span}"`); }
      for (const [k, v] of Object.entries(w.args)) { const q = L.get(k); if (!q && ['position2','anchor2','region'].includes(k)) continue; if (!q) { err(`${m.id}: key ${k} not in legend`); continue; }
        if (q.kind === 'enum' && q.values && !String(v).startsWith('mention(') && v !== '$new') for (const x of String(v).split(',')) if (!(x in q.values)) err(`${m.id}: ${k}=${x} not a legend value`); }
      const a = w.args;
      for (const pk of ['position', 'position2', 'region']) if (a[pk] && !/^(leftOf|rightOf|above|below|near|between|center|top|bottom|left|right|topLeft|topRight|bottomLeft|bottomRight)$/.test(a[pk])) err(`${m.id}: bad ${pk}`);
      if (a.position2 && !a.anchor2) err(`${m.id}: position2 without anchor2`);
      const kind = w.type === 'fact' ? 'fact' : w.type === 'question' ? (a.ask === 'check' ? 'check' : ['list', 'count', 'exists'].includes(a.ask) ? 'list/count/exists' : 'other-q') : (a.action === 'create' ? 'create' : a.action === 'move' ? 'move' : 'other-cmd');
      if (a.position2) cnt.two[kind] = (cnt.two[kind] || 0) + 1;
      else if (a.region && a.anchor) cnt.reg[kind] = (cnt.reg[kind] || 0) + 1;
    }
  });
}
console.log({msgs, wires, short, ...cnt}); const s = o => Object.values(o).reduce((a, b) => a + b, 0);
console.log('two relations', s(cnt.two), 'region+relation', s(cnt.reg), bad ? `ERRORS ${bad}` : 'ALL CHECKS OK');
