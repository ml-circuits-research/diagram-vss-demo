(function () {
'use strict';
const K = SOPKit, sys = K.createSystem(), world = sys.world, engine = sys.engine;
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const svg = $('#canvas'), layer = $('#layer'), framesG = $('#frames'), msgs = $('#msgs');
const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const neural = NeuralKit.create(engine, sys.formalize);
let mode = 'rules', models = null, loading = false, queue = Promise.resolve();
let view = 'auto', focusCell = null;
let last = [], pending = null, hl = { shapes: new Set(), edges: new Set() }, hlTimer = null, drag = null;
const history = []; let turnSeq = 0;
const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ---------------- canvas ---------------- */
/* ---------------- canvas ---------------- */
function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function lum(hex) { const n = parseInt(hex.slice(1), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
function outlinePts(s) {
  const { w, h } = K.dims(s), hw = w / 2, hh = h / 2;
  if (s.shape === 'triangle') return [[0, -hh], [hw, hh], [-hw, hh]];
  if (s.shape === 'diamond') return [[0, -hh], [hw, 0], [0, hh], [-hw, 0]];
  if (s.shape === 'hexagon') return [0, 1, 2, 3, 4, 5].map(i => [Math.cos(i * Math.PI / 3) * hw, Math.sin(i * Math.PI / 3) * hh * 1.0]);
  if (s.shape === 'star') return [...Array(10)].map((_, i) => { const r = i % 2 ? 0.44 : 1, a = -Math.PI / 2 + i * Math.PI / 5; return [Math.cos(a) * hw * r, Math.sin(a) * hh * r + hh * 0.08]; });
  return null;
}
function rayDist(s, ux, uy) {
  const { w, h } = K.dims(s), hw = w / 2, hh = h / 2, c = Math.abs(ux) || 1e-6, sn = Math.abs(uy) || 1e-6;
  switch (s.shape) {
    case 'circle': return hw;
    case 'ellipse': return 1 / Math.sqrt((c / hw) ** 2 + (sn / hh) ** 2);
    case 'square': case 'rectangle': return Math.min(hw / c, hh / sn);
    case 'diamond': return 1 / (c / hw + sn / hh);
    case 'hexagon': return Math.min(hw / c, (hh * 0.87) / sn, 1 / Math.sqrt((c / hw) ** 2 + (sn / hh) ** 2) * 1.02);
    case 'triangle': return Math.min(hw, hh) * 0.72;
    default: return hw * 0.62;
  }
}
function drawShape(g, s) {
  const grp = el('g', { class: 'shp' + (hl.shapes.has(s.name) ? ' hl' : ''), 'data-name': s.name, transform: `translate(${s.x} ${s.y})` }, g);
  const { w, h } = K.dims(s), fill = K.COLOR_HEX[s.color] || '#ffffff';
  const attrs = { class: 'body' + (s.outline ? ' outlined' : ''), fill };
  if (s.outline) attrs.style = `stroke: ${K.COLOR_HEX[s.outline]}`;
  const pts = outlinePts(s);
  if (s.shape === 'circle') el('circle', Object.assign({ r: w / 2 }, attrs), grp);
  else if (s.shape === 'ellipse') el('ellipse', Object.assign({ rx: w / 2, ry: h / 2 }, attrs), grp);
  else if (pts) el('polygon', Object.assign({ points: pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' '), 'stroke-linejoin': 'round' }, attrs), grp);
  else el('rect', Object.assign({ x: -w / 2, y: -h / 2, width: w, height: h, rx: 6 }, attrs), grp);
  if (hl.shapes.has(s.name)) el('rect', { class: 'halo', x: -w / 2 - 7, y: -h / 2 - 7, width: w + 14, height: h + 14, rx: 10 }, grp);
  const tag = el('text', { class: 'tag', x: 0, y: -h / 2 - (hl.shapes.has(s.name) ? 12 : 7), 'text-anchor': 'middle' }, grp); tag.textContent = s.name;
  if (s.label) {
    const room = s.shape === 'rectangle' || s.shape === 'square' || s.shape === 'ellipse' || s.shape === 'circle' ? w * 0.84 : w * 0.56;
    let fs = Math.max(9, Math.min(14, s.size / 4.4)), txt = s.label;
    while (txt.length * fs * 0.56 > room && fs > 9) fs -= 0.5;
    const maxc = Math.max(3, Math.floor(room / (fs * 0.56))); if (txt.length > maxc) txt = txt.slice(0, maxc - 1) + '…';
    const t = el('text', { class: 'lbl', x: 0, y: s.shape === 'triangle' ? h * 0.18 : 0, 'text-anchor': 'middle', 'dominant-baseline': 'central', 'font-size': fs.toFixed(1), fill: lum(fill) > 0.62 ? '#17202B' : '#FFFFFF' }, grp);
    t.textContent = txt;
  }
}
function drawEdge(g, e, a, b, offset) {
  let dx = b.x - a.x, dy = b.y - a.y; const L = Math.hypot(dx, dy) || 1; const ux = dx / L, uy = dy / L;
  const ox = -uy * offset, oy = ux * offset;
  const ra = rayDist(a, ux, uy) + 3, rb = rayDist(b, -ux, -uy) + 3;
  if (ra + rb >= L - 4) return;
  const x1 = a.x + ux * ra + ox, y1 = a.y + uy * ra + oy, x2 = b.x - ux * rb + ox, y2 = b.y - uy * rb + oy;
  const grp = el('g', { class: 'edge' + (hl.edges.has(e.id) ? ' hl' : '') }, g);
  const col = e.color ? K.COLOR_HEX[e.color] : null;
  const head = (tx, ty, vx, vy) => { const bx = tx - vx * 11, by = ty - vy * 11; el('polygon', { class: 'hd', points: `${tx},${ty} ${bx - vy * 5},${by + vx * 5} ${bx + vy * 5},${by - vx * 5}`, style: col ? `fill:${col}` : '' }, grp); };
  const sx = e.arrow === 'both' ? x1 + ux * 9 : x1, sy = e.arrow === 'both' ? y1 + uy * 9 : y1;
  const ex = e.arrow === 'none' ? x2 : x2 - ux * 9, ey = e.arrow === 'none' ? y2 : y2 - uy * 9;
  const ln = el('line', { class: 'ln', x1: sx, y1: sy, x2: ex, y2: ey, style: col ? `stroke:${col}` : '' }, grp);
  if (e.style === 'dashed') ln.setAttribute('stroke-dasharray', '8 6');
  if (e.style === 'dotted') { ln.setAttribute('stroke-dasharray', '0.5 6'); ln.setAttribute('stroke-linecap', 'round'); ln.setAttribute('stroke-width', '2.6'); }
  if (e.arrow !== 'none') head(x2, y2, ux, uy);
  if (e.arrow === 'both') head(x1, y1, -ux, -uy);
  if (e.label) { const t = el('text', { class: 'elbl', x: (x1 + x2) / 2 - uy * 12, y: (y1 + y2) / 2 + ux * 12, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, grp); t.textContent = e.label; }
}

function cellsInUse() {
  const S = world.state, cells = new Map(), add = c => cells.set(c.x + ',' + c.y, c);
  S.shapes.forEach(s => add(K.cellOf(s.x, s.y)));
  add(S.frame || { x: 0, y: 0 });
  return [...cells.values()];
}
function renderCanvas() {
  layer.textContent = ''; framesG.textContent = '';
  const S = world.state, by = new Map(S.shapes.map(s => [s.name, s])), cells = cellsInUse();
  const narrow = svg.clientWidth > 0 && svg.clientWidth < 640;
  const focus = view === 'focus' || (view === 'auto' && narrow);
  if (focus) {
    const fc = focusCell || S.frame || { x: 0, y: 0 };
    const inside = S.shapes.filter(s => { const c = K.cellOf(s.x, s.y); return c.x === fc.x && c.y === fc.y; });
    let bx1 = fc.x, by1 = fc.y, bx2 = fc.x + 800, by2 = fc.y + 500;
    if (inside.length) {
      bx1 = Math.min(...inside.map(s => s.x - K.dims(s).w / 2)) - 40; bx2 = Math.max(...inside.map(s => s.x + K.dims(s).w / 2)) + 40;
      by1 = Math.min(...inside.map(s => s.y - K.dims(s).h / 2)) - 44; by2 = Math.max(...inside.map(s => s.y + K.dims(s).h / 2)) + 30;
      const minW = 380, minH = 240;
      if (bx2 - bx1 < minW) { const m = (bx1 + bx2) / 2; bx1 = m - minW / 2; bx2 = m + minW / 2; }
      if (by2 - by1 < minH) { const m = (by1 + by2) / 2; by1 = m - minH / 2; by2 = m + minH / 2; }
    }
    svg.setAttribute('viewBox', `${bx1} ${by1} ${bx2 - bx1} ${by2 - by1}`);
  } else {
    const x1 = Math.min(...cells.map(c => c.x)), y1 = Math.min(...cells.map(c => c.y));
    const x2 = Math.max(...cells.map(c => c.x + 800)), y2 = Math.max(...cells.map(c => c.y + 500));
    svg.setAttribute('viewBox', `${x1 - 14} ${y1 - (cells.length > 1 ? 30 : 8)} ${x2 - x1 + 28} ${y2 - y1 + (cells.length > 1 ? 44 : 16)}`);
  }
  const vb = $('#view-btn'); if (vb) { vb.setAttribute('aria-pressed', String(!focus)); vb.title = focus ? 'Show the whole canvas' : 'Zoom to the current drawing'; vb.setAttribute('aria-label', vb.title); }
  if (cells.length > 1) for (const c of cells) {
    el('rect', { class: 'frame', x: c.x, y: c.y, width: 800, height: 500, rx: 14 }, framesG);
    const f = (S.frames || []).find(f => f.x === c.x && f.y === c.y);
    if (f && f.title) { const t = el('text', { class: 'ftitle', x: c.x + 14, y: c.y - 9 }, framesG); t.textContent = f.title; }
  }
  if (!S.shapes.length) { const f = S.frame || { x: 0, y: 0 }, t = el('text', { class: 'empty-note', x: f.x + 400, y: f.y + 250, 'text-anchor': 'middle' }, layer); t.textContent = 'Nothing here yet. Write what to draw.'; }
  const eg = el('g', {}, layer), sg = el('g', {}, layer);
  for (const e of S.edges) {
    const a = by.get(e.from), b = by.get(e.to); if (!a || !b) continue;
    drawEdge(eg, e, a, b, S.edges.some(o => o !== e && o.from === e.to && o.to === e.from) ? 6 : 0);
  }
  for (const s of S.shapes) drawShape(sg, s);
  const n = S.shapes.length, m = S.edges.length;
  $('#readout').textContent = `${n} shape${n === 1 ? '' : 's'} · ${m} link${m === 1 ? '' : 's'}`;
}
function flash(h) {
  hl = { shapes: new Set((h && h.shapes) || []), edges: new Set((h && h.edges) || []) };
  renderCanvas(); clearTimeout(hlTimer);
  if (hl.shapes.size || hl.edges.size) hlTimer = setTimeout(() => { hl = { shapes: new Set(), edges: new Set() }; renderCanvas(); }, 4200);
}

/* drag shapes by hand */
function svgPt(ev) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
svg.addEventListener('pointerdown', ev => {
  const g = ev.target.closest && ev.target.closest('.shp'); if (!g) return;
  const s = world.find(g.dataset.name); if (!s) return;
  const p = svgPt(ev); drag = { name: s.name, before: world.snapshot(), dx: s.x - p.x, dy: s.y - p.y, cell: K.cellOf(s.x, s.y), moved: false };
  svg.setPointerCapture(ev.pointerId); ev.preventDefault();
});
svg.addEventListener('pointermove', ev => {
  if (!drag) return; const s = world.find(drag.name); if (!s) return;
  const p = svgPt(ev), { w, h } = K.dims(s), c = drag.cell;
  const x = Math.round(Math.min(c.x + 800 - w / 2 - 10, Math.max(c.x + w / 2 + 10, p.x + drag.dx))), y = Math.round(Math.min(c.y + 500 - h / 2 - 10, Math.max(c.y + h / 2 + 24, p.y + drag.dy)));
  if (x !== s.x || y !== s.y) { s.x = x; s.y = y; drag.moved = true; renderCanvas(); }
});
const endDrag = () => {
  if (!drag) return; const d = drag; drag = null;
  if (d.moved) { world.commit(d.before); last = [d.name]; }
};
svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);

/* ---------------- chat ---------------- */
const scrollDown = () => { msgs.scrollTop = msgs.scrollHeight; };
function meBubble(text) {
  const d = document.createElement('div'); d.className = 'b me';
  d.innerHTML = `<div class="txt">${escH(text)}</div><div class="meta"><time>${clock()}</time></div>`;
  msgs.appendChild(d); scrollDown();
}
function botBubble(o) {
  const d = document.createElement('div'); d.className = 'b bot' + (o.err ? ' err' : '');
  let h = `<div class="txt">${escH(o.text)}</div>`;
  if (o.sub) h += `<div class="sub">${escH(o.sub)}</div>`;
  if (o.chips && o.chips.length) h += `<div class="chips">${o.chips.map(c => `<button type="button" data-pick="${escH(c)}">${escH(c)}</button>`).join('')}</div>`;
  h += `<div class="meta">${o.tag ? `<span class="tag2">${escH(o.tag)}</span>` : ''}${o.turn ? `<button type="button" data-turn="${o.turn}">details</button>` : ''}<time>${clock()}</time></div>`;
  d.innerHTML = h;
  if (o.replace) o.replace.replaceWith(d); else msgs.appendChild(d);
  scrollDown(); return d;
}
function sysNote(text) { const d = document.createElement('div'); d.className = 'sys'; d.textContent = text; msgs.appendChild(d); scrollDown(); }
function typing() { const d = document.createElement('div'); d.className = 'b bot'; d.innerHTML = '<div class="typing" aria-label="Thinking"><i></i><i></i><i></i></div>'; msgs.appendChild(d); scrollDown(); return d; }
function setStatus(t) { $('#status').textContent = t; }
const idleStatus = () => ({ rules: 'draws what you write', vss: 'reading you with the VSS model', neural: 'reading you with a neural model', compare: 'comparing every reader' })[mode];
msgs.addEventListener('click', ev => {
  const p = ev.target.closest('[data-pick]'); if (p) { submit(p.dataset.pick); return; }
  const t = ev.target.closest('[data-turn]'); if (t) openSheet('settings', 'history', +t.dataset.turn);
});

/* Turn effects into one or two plain sentences. */
const listing = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const few = (a, n) => a.length > n ? listing(a.slice(0, n).concat(`${a.length - n} more`)) : listing(a);
function summarize(result) {
  const adds = [], links = [], unlinks = [], dels = [], moved = [], changed = [], renames = [], rules = [], said = [], answers = [];
  for (const st of result.steps) {
    if (st.node.type === 'mention' || st.error || st.skipped) continue;
    for (const p of st.patches) {
      if (p.op === 'add') adds.push(`${p.shape.name}`);
      else if (p.op === 'link') links.push(K.edgeText(p.edge).replace(/ \(.*$|\s+".*"$/, ''));
      else if (p.op === 'unlink') unlinks.push(p.edge ? `${p.edge.from}–${p.edge.to}` : p.id);
      else if (p.op === 'remove') dels.push(p.name);
      else if (p.op === 'rename') renames.push(`${p.from} to ${p.to}`);
      else if (p.op === 'rule') rules.push(p.rule);
      else if (p.op === 'forget') said.push('Forgot all default rules.');
      else if (p.op === 'reorder') said.push(p.to === 'front' ? `Brought ${p.name} to the front.` : `Sent ${p.name} to the back.`);
      else if (p.op === 'set') {
        if ('x' in p.props && !moved.includes(p.name)) moved.push(p.name);
        const ch = Object.entries(p.props).filter(([k]) => k !== 'x' && k !== 'y').map(([k, v]) => k === 'size' ? K.sizeName(v) : k === 'label' ? `labeled “${v}”` : k === 'outline' ? (v ? `${v} outline` : 'no outline') : k === 'shape' ? `a ${v}` : String(v));
        if (ch.length) changed.push(`${p.name} is now ${listing(ch)}`);
      }
    }
    if (st.answer) answers.push(st.answer);
    for (const n of st.notes || []) if (/^(reverted|re-applied|there was nothing)|already/.test(n)) said.push(n.charAt(0).toUpperCase() + n.slice(1) + '.');
  }
  const out = [];
  if (adds.length) out.push(`Drew ${few(adds, 6)}.`);
  if (links.length) out.push(`Connected ${few(links, 4)}.`);
  if (renames.length) out.push(`Renamed ${listing(renames)}.`);
  if (changed.length) out.push(changed.slice(0, 4).join('; ') + (changed.length > 4 ? `; and ${changed.length - 4} more.` : '.'));
  if (moved.length) out.push(`Moved ${few(moved, 5)}.`);
  if (unlinks.length) out.push(`Removed the link${unlinks.length > 1 ? 's' : ''} ${few(unlinks, 4)}.`);
  if (dels.length) out.push(`Deleted ${few(dels, 6)}.`);
  for (const r of rules) out.push(`From now on, new ${r.shape ? r.shape + 's' : 'shapes'} will be ${['size', 'color'].filter(k => r[k]).map(k => r[k]).join(' ')}${r.outline ? ' with a ' + r.outline + ' outline' : ''}.`);
  out.push(...said.map(s => s.replace(/^Reverted 1 turn\.$/, 'Undid the last change.').replace(/^Re-applied 1 turn\.$/, 'Redid it.')));
  out.push(...answers);
  return out.join(' ') || 'Done.';
}

/* ---------------- running a turn ---------------- */
function submit(text) { queue = queue.then(() => run(text)).catch(e => { console.error(e); botBubble({ text: 'Something went wrong: ' + e.message, err: true }); }); return queue; }
async function run(text) {
  text = String(text).trim(); if (!text) return;
  meBubble(text);
  let nodes = null, notes = [], raw = false, overrides = {}, nOut = null, vOut = null, ran = 'rules', wait = null;
  if (pending) {
    const want = text.toLowerCase().replace(/^(?:i\s+mean|use|the\s+one\s+(?:named|called))\s+/, '').replace(/[.!]+$/, '').trim();
    const pick = pending.candidates.find(c => c.toLowerCase() === want);
    if (pick) { nodes = pending.nodes; overrides = Object.assign({}, pending.overrides, { [pending.wire]: [pick] }); }
    pending = null;
  }
  const id = ++turnSeq, rec = { id, time: clock(), text, ran: 'rules' }; history.push(rec);
  if (!nodes) {
    if (text.startsWith('@')) { raw = true; try { nodes = K.parse(text); } catch (e) { rec.error = e; botBubble({ text: e.message, err: true, turn: id, tag: 'SOP' }); return; } }
    else {
      const ctx = { names: world.state.shapes.map(s => s.name), last };
      const f = sys.formalize(text, ctx); nodes = f.nodes; notes = f.notes;
      if (mode !== 'rules') {
        wait = typing(); setStatus('typing…');
        if ((mode === 'vss' || mode === 'compare') && await ensureVSS()) {
          try { vOut = await window.VSSFormalizer.formalize(text, ctx, sys.formalize); } catch (e) { notes = notes.concat(['The VSS formalizer failed: ' + e.message]); }
          if (vOut && mode === 'vss') { nodes = vOut.nodes; notes = vOut.notes; ran = 'vss'; }
        }
        if ((mode === 'neural' || mode === 'compare') && models) {
          try { nOut = await neural.formalize(text, ctx); } catch (e) { notes = notes.concat(['The neural formalizer failed: ' + e.message]); }
          if (nOut && mode === 'neural') { nodes = nOut.nodes; notes = nOut.notes.filter(n => !/couldn't find an action/.test(n)); ran = 'neural'; }
        }
        if (mode === 'neural' && !models) notes = notes.concat([neuralLoading ? 'The neural models are still loading; the rules read this message.' : 'The neural models are not loaded; the rules read this message.']);
        if (mode === 'vss' && !vOut) notes = notes.concat(['The VSS model is not available; the rules read this message.']);
        setStatus(idleStatus());
      }
    }
  }
  Object.assign(rec, { nodes, notes, raw, neural: nOut, vss: vOut, ran });
  const unread = notes.filter(n => /couldn't find an action/.test(n)).map(n => (n.match(/in "(.*)"\.?$/) || [])[1]).filter(Boolean);
  if (!nodes.length) {
    const unknown = unread.length;
    rec.error = new K.SOPError('No wires.');
    botBubble({ text: unknown ? 'I didn’t get what to do there. Try something like “draw a red circle next to Start” or “what is connected to Start?”.' : 'I couldn’t turn that into anything I can do.', err: true, turn: id, replace: wait });
    return;
  }
  const result = engine.run(nodes, { overrides }); rec.result = result;
  // do what was understood; ask about the rest (a question never blocks the other wires of the message)
  const asks = [], problems = [];
  let clar = null;
  for (const er of result.errors || []) {
    const e = er.error;
    if (e instanceof K.Clarify && !clar) {
      clar = e;
      const keep = new Set([e.wire, ...er.dependents.map(n => n.id)]);
      const need = new Set(); const refsOf = v => K.isRef(v) ? [v.ref] : Array.isArray(v) ? v.flatMap(refsOf) : [];
      for (const n of nodes) if (keep.has(n.id)) Object.values(n.args).flatMap(refsOf).forEach(r => need.add(r));
      const ov = Object.assign({}, overrides); for (const st of result.steps) if (need.has(st.node.id) && !keep.has(st.node.id) && st.value !== undefined) ov[st.node.id] = st.value;
      pending = { nodes: nodes.filter(n => keep.has(n.id) || need.has(n.id)), wire: e.wire, candidates: e.candidates, overrides: ov };
    } else if (!(e instanceof K.Clarify)) problems.push(e.message + (er.dependents.length ? ` (so I also skipped ${er.dependents.length} step${er.dependents.length > 1 ? 's' : ''} that needed it)` : ''));
  }
  for (const u of unread) asks.push(`I didn’t understand “${u}”. Could you say it another way?`);
  const anyDone = result.steps.some(st => !st.error && !st.skipped && st.node.type !== 'mention');
  if (!anyDone && !clar && !problems.length && !asks.length) { botBubble({ text: 'Done.', turn: id, replace: wait }); return; }
  const highlight = { shapes: [], edges: [] }, touched = [];
  result.steps.forEach(s => {
    s.patches.forEach(p => { if (p.op === 'add') touched.push(p.shape.name); else if (p.op === 'set') touched.push(p.name); else if (p.op === 'rename') touched.push(p.to); });
    if (s.highlight) { highlight.shapes.push(...(s.highlight.shapes || [])); highlight.edges.push(...(s.highlight.edges || [])); }
  });
  const live = [...new Set(touched)].filter(n => world.find(n));
  if (live.length) last = live; else if (highlight.shapes.length) last = [...new Set(highlight.shapes)].filter(n => world.find(n));
  if (!highlight.shapes.length) highlight.shapes = live;
  { const f = world.find(highlight.shapes[0] || live[0]); if (f) focusCell = K.cellOf(f.x, f.y); }
  const odd = notes.filter(n => /is not a shape I know|couldn't tell|^I read |still loading|not loaded|not available/.test(n));
  const tag = ran !== 'rules' ? (ran === 'vss' ? 'VSS' : ran) : (nOut || vOut) ? 'compared' : null;
  const did = anyDone ? summarize(result) : '';
  const tail = problems.concat(asks).join(' ');
  if (clar) botBubble({ text: (did && did !== 'Done.' ? did + ' ' : '') + clar.message.replace(/ Reply with a name\.$/, ''), sub: [tail, odd.join(' ')].filter(Boolean).join(' ') || null, chips: clar.candidates, turn: id, tag, replace: wait });
  else if (problems.length && !anyDone) botBubble({ text: problems.join(' '), sub: [asks.join(' '), odd.join(' ')].filter(Boolean).join(' ') || null, err: true, turn: id, tag, replace: wait });
  else botBubble({ text: did || 'Done.', sub: [tail, odd.join(' ')].filter(Boolean).join(' ') || null, turn: id, tag, replace: wait });
  flash(highlight);
}

/* ---------------- technical history ---------------- */
function turnHTML(r) {
  let h = '';
  if (r.nodes && r.nodes.length) h += `<pre class="sop">${r.raw ? '<span class="cm"># typed as SOP</span>\n' : ''}${r.nodes.map(hlNode).join('\n')}</pre>`;
  (r.notes || []).forEach(n => { h += `<div class="note">${escH(n)}</div>`; });
  if (r.vss) h += vssHTML(r.vss, r.ran);
  if (r.neural) h += neuralHTML(r.neural, r.ran);
  if (r.result) h += r.result.steps.map(stepHTML).join('');
  const err = r.error && r.error.message !== 'No wires.' ? r.error : r.result && !r.result.ok ? r.result.error : null;
  if (err) h += `<div class="errt">${escH(err.message)}</div>`;
  return h || '<div class="note">No wires were produced.</div>';
}
function renderHistory(focus) {
  if (!history.length) return '<p class="intro">Nothing yet.</p>';
  return `<p class="intro">Every message, as the system saw it: the SOP wires the formalizer wrote, the plugin that interpreted each wire, the patches applied to the drawing, Datalog programs for graph questions, and the neural model’s answers when it is on.</p>` +
    history.slice().reverse().map(r => `<details class="turn" id="turn-${r.id}"${r.id === focus ? ' open' : ''}><summary><time>${escH(r.time)}</time><span>${escH(r.text)}</span><em>${escH(r.ran === 'neural' ? 'neural' : r.neural ? 'compare' : r.raw ? 'SOP' : 'rules')}</em></summary><div class="tb">${turnHTML(r)}</div></details>`).join('');
}

/* ---------------- SOP rendering for History ---------------- */
/* ---------------- SOP highlighting ---------------- */
function hlValue(raw) {
  return K.fmtValue(raw).split(/(,)/).map(part => {
    if (part === ',') return '<span class="cm">,</span>';
    if (part.startsWith('$')) return `<span class="rf">${escH(part)}</span>`;
    if (part.startsWith('"')) return `<span class="str">${escH(part)}</span>`;
    return `<span class="v">${escH(part)}</span>`;
  }).join('');
}
function hlNode(n) {
  const line = K.serialize(n); const head = `<span class="wid">@${escH(n.id)}</span> <span class="wt">${escH(n.type)}</span>`;
  const keys = line.split(' ').slice(2).map(t => t.split('=')[0]);
  const body = keys.map(k => { const q = engine.legend.get(k); return ` <span class="k"${q && q.ask ? ` title="${escH(q.ask)}"` : ''}>${escH(k)}</span><span class="cm">=</span>${hlValue(n.args[k])}`; }).join('');
  return `<span class="${n.type === 'mention' ? 'ln-mention' : ''}">${head}${body}</span>`;
}

/* ---------------- conversation ---------------- */
function patchLine(p) {
  const sz = v => K.sizeName(v);
  switch (p.op) {
    case 'add': return ['add', '+', `${p.shape.name}  ${sz(p.shape.size)} ${p.shape.color} ${p.shape.shape}${p.shape.label ? ` "${p.shape.label}"` : ''}`];
    case 'remove': return ['del', '−', p.name];
    case 'set': { const pr = p.props, parts = []; if ('x' in pr) parts.push(`moved to (${pr.x}, ${pr.y})`); for (const [k, v] of Object.entries(pr)) { if (k === 'x' || k === 'y') continue; parts.push(k === 'size' ? `size ${sz(v)}` : `${k} ${v == null ? 'none' : v}`); } return ['chg', '~', `${p.name}  ${parts.join(', ')}`]; }
    case 'rename': return ['chg', '~', `${p.from} is now ${p.to}`];
    case 'link': return ['add', '+', K.edgeText(p.edge)];
    case 'unlink': return ['del', '−', p.edge ? K.edgeText(p.edge) : p.id];
    case 'rule': return ['add', '+', `rule ${p.rule.id}`];
    case 'forget': return ['del', '−', 'all rules'];
  }
  return ['chg', '?', p.op];
}
function stepHTML(st) {
  const bits = [];
  if (st.patches.length) bits.push(`<ul class="fx">${st.patches.map(p => { const [c, o, t] = patchLine(p); return `<li><span class="op ${c}">${o}</span>${escH(t)}</li>`; }).join('')}</ul>`);
  if (st.answer) bits.push(`<div class="answer">${escH(st.answer)}</div>`);
  if (st.notes && st.notes.length) bits.push(`<div class="note">${escH(st.notes.join('; '))}</div>`);
  (st.issues || []).filter(i => i.level === 'warn').forEach(i => bits.push(`<div class="note">${escH(i.msg)}</div>`));
  if (st.lowering) bits.push(`<details class="lower"><summary>Lowered to Datalog and evaluated</summary><pre>${escH(st.lowering)}</pre></details>`);
  if (!bits.length) return '';
  const plug = st.plugin ? engine.plugin(st.plugin) : null;
  return `<div class="row"><span class="chip">@${escH(st.node.id)} <span class="p">${escH(plug ? plug.name : st.plugin || '')}</span></span><div class="res">${bits.join('')}</div></div>`;
}
const fmtV = v => v == null ? '' : K.fmtValue(v);
function vssHTML(v, ran) {
  let h = ran === 'vss' ? `<div class="minihead">Formalized by the VSS reader <span>${v.ms.toFixed(1)} ms</span></div>` : `<div class="minihead">VSS reader, for comparison <span>${v.ms.toFixed(1)} ms</span></div><pre class="sop">${v.nodes.map(hlNode).join('\n') || '<span class="cm"># no wires</span>'}</pre>`;
  for (const c of v.clauses) {
    const m = c.vss.margins || {}, ms = Object.entries(m).filter(([, x]) => typeof x === 'number').map(([k, x]) => `${k} ${x.toFixed(2)}`).slice(0, 8).join(' · ');
    h += `<details class="cmp"><summary>clause <span class="src">${escH(c.src)}</span></summary><div class="tb" style="padding:6px 0 0">
      <div class="note">normalized: <code>${escH(c.normalized)}</code> · status <b>${escH(c.vss.status)}</b> · residual ${(+c.vss.residual).toFixed(3)}${c.vss.unplaced && c.vss.unplaced.length ? ' · unplaced: ' + escH(c.vss.unplaced.join(' ')) : ''}</div>
      ${ms ? `<div class="note">margins: ${escH(ms)}</div>` : ''}<pre class="sop">${escH(c.vss.sop)}</pre></div></details>`;
  }
  return h;
}
function neuralHTML(n, ran) {
  const pct = x => (x * 100).toFixed(0) + '%';
  let h = '';
  if (ran === 'rules') h += `<div class="minihead">Neural formalizer, for comparison <span>${n.ms} ms · ${n.calls} model calls</span></div><pre class="sop alt">${n.nodes.map(hlNode).join('\n') || '<span class="cm"># no wires</span>'}</pre>`;
  else h += `<div class="minihead">Formalized by the neural model <span>${n.ms} ms · ${n.calls} model calls</span></div>`;
  for (const a of n.analyses) {
    const r = a.rules, rows = [];
    const actKey = a.kind.value === 'command' ? 'action' : a.kind.value === 'question' ? 'ask' : null;
    rows.push(['wire type', r ? r.type : '', a.kind.value, a.kind.top.map(t => `${t[0]} ${pct(t[1])}`).join(' · '), true]);
    if (actKey || (r && (r.args.action || r.args.ask))) { const rk = r ? (r.args.action || r.args.ask || '') : ''; rows.push([actKey || 'action/ask', rk, a.act ? a.act.value : '', a.act ? a.act.top.map(t => `${t[0]} ${pct(t[1])}`).join(' · ') : '', true]); }
    const keys = new Set(Object.keys(a.keys).concat(r ? Object.keys(r.args).filter(k => k !== 'action' && k !== 'ask') : []));
    for (const k of keys) {
      const q = a.keys[k];
      const why = q ? (q.span ? `“${q.span}” ${pct(q.score)}${q.source !== 'neural' ? ' · from ' + q.source : ''}` : 'no span') : 'not in frame';
      rows.push([k, r ? fmtV(r.args[k]) : '', q ? fmtV(q.value) : '', why, false]);
    }
    const body = rows.filter(x => x[1] !== '' || x[2] !== '' || x[4]).map(([k, rv, nv, why]) => `<tr class="${rv === nv ? 'same' : 'diff'}"><th>${escH(k)}</th><td>${escH(rv || '–')}</td><td>${escH(nv || '–')}</td><td class="why">${escH(why)}</td></tr>`).join('');
    h += `<details class="cmp"${ran === 'rules' ? ' open' : ''}><summary>@${escH(a.id)} <span class="src">${escH(a.src)}</span></summary><div class="tbl"><table><thead><tr><th>question</th><th>rules</th><th>neural</th><th>model evidence</th></tr></thead><tbody>${body}</tbody></table></div></details>`;
  }
  return h;
}

/* ---------------- sheets ---------------- */
const sheet = $('#sheet'), scrim = $('#scrim'), sbody = $('#sbody'), stabs = $('#stabs');
let sheetKind = null, sheetTab = null;
const TABS = { settings: [['history', 'History'], ['formalizer', 'Formalizer'], ['benchmark', 'Benchmark'], ['legend', 'Legend'], ['plugins', 'Plugins'], ['world', 'World']], examples: [] };
function openSheet(kind, tab, focus) {
  sheetKind = kind; sheetTab = tab || (TABS[kind][0] || [])[0] || null;
  $('#sheet-title').textContent = kind === 'examples' ? 'Examples' : 'History and settings';
  stabs.hidden = !TABS[kind].length;
  stabs.innerHTML = TABS[kind].map(([k, l]) => `<button class="stab" role="tab" type="button" data-stab="${k}" aria-selected="${k === sheetTab}">${l}</button>`).join('');
  sheet.hidden = false; scrim.hidden = false; renderSheet(focus);
  if (focus) { const t = document.getElementById('turn-' + focus); if (t) { t.scrollIntoView({ block: 'start' }); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1600); } }
  else sbody.scrollTop = 0;
}
function closeSheet() { sheet.hidden = true; scrim.hidden = true; sheetKind = null; }
$('#close-sheet').addEventListener('click', closeSheet); scrim.addEventListener('click', closeSheet);
document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && !sheet.hidden) closeSheet(); });
stabs.addEventListener('click', ev => { const b = ev.target.closest('[data-stab]'); if (!b) return; sheetTab = b.dataset.stab; stabs.querySelectorAll('.stab').forEach(x => x.setAttribute('aria-selected', String(x === b))); renderSheet(); sbody.scrollTop = 0; });
$('#open-settings').addEventListener('click', () => openSheet('settings', 'history'));
$('#open-examples').addEventListener('click', () => openSheet('examples'));
function renderSheet(focus) {
  if (sheetKind === 'examples') sbody.innerHTML = renderExamples();
  else if (sheetTab === 'history') sbody.innerHTML = renderHistory(focus);
  else if (sheetTab === 'formalizer') { sbody.innerHTML = renderFormalizer(); syncFormalizer(); }
  else if (sheetTab === 'benchmark') { sbody.innerHTML = renderBench(); if (!benchSets) benchIndex().then(() => { if (sheetTab === 'benchmark' && !sheet.hidden) sbody.innerHTML = renderBench(); }).catch(e => { sbody.innerHTML = `<p class="intro">The test sets could not be loaded: ${escH(e.message)}</p>`; }); }
  else if (sheetTab === 'legend') sbody.innerHTML = renderLegend();
  else if (sheetTab === 'plugins') sbody.innerHTML = renderPlugins();
  else if (sheetTab === 'world') sbody.innerHTML = renderWorld();
}

/* ---------------- examples ---------------- */
const QUICK = [
  'Draw a small pink star next to Done',
  'Make the green circle bigger',
  'Connect Done to Start with a dotted line',
  'Is there a path from Start to Done?',
  'What is connected to Check?',
  'Add three tiny red circles in a row below Process',
  'Which shape has the most connections?',
  'From now on, circles are orange',
  'Check is above Process',
  'Rename Done to End',
  'Arrange everything in a circle',
  'Describe the diagram',
  '@g1 command action=create shape=star color=gold name=Gem position=center'
];
function renderExamples() {
  return `<h3 class="sub">Send one sentence</h3>
  <div class="quick">${QUICK.map(q => `<button type="button" data-quick="${escH(q)}">${escH(q.startsWith('@') ? 'Raw SOP: ' + q : q)}</button>`).join('')}</div>
  <h3 class="sub">Play a scenario</h3>
  <p class="intro">A scenario is a script of messages. It is drawn in a new area next to what is already on the canvas; nothing is erased.</p>
  <div class="opts"><label for="sc-delay">Pause between messages</label><select id="sc-delay"><option value="0">none</option><option value="400" selected>0.4 s</option><option value="1000">1 s</option><option value="2000">2 s</option></select></div>
  <div class="sc-list">${SCENARIOS.map(sc => `<article class="sc"><header><h4>${escH(sc.title)}</h4><span class="len">${sc.size} · ${sc.turns.length} message${sc.turns.length === 1 ? '' : 's'}</span></header><p>${escH(sc.blurb)}</p><div class="row2"><button type="button" class="btn solid" data-sc="${sc.id}" data-how="play">Play</button><button type="button" class="btn" data-sc="${sc.id}" data-how="step">Step through</button><button type="button" class="btn" data-sc="${sc.id}" data-how="edit">Edit a copy</button></div></article>`).join('')}</div>
  <h3 class="sub">Your own script</h3>
  <p class="intro">One message per line. Lines starting with <code>#</code> are comments; lines starting with <code>@</code> are raw SOP.</p>
  <textarea id="sc-text" rows="7" spellcheck="false" placeholder="# My diagram&#10;Draw a blue circle named Hub in the center.&#10;Add a red square named Node1 left of Hub and connect Hub to it.&#10;What is connected to Hub?"></textarea>
  <div class="row2" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px"><button type="button" class="btn solid" data-own="play">Play</button><button type="button" class="btn" data-own="step">Step through</button><label class="btn file">Load .txt<input type="file" id="sc-file" accept=".txt,.md,.sop,text/plain"></label><span class="status" id="sc-status"></span></div>`;
}
const player = { name: '', turns: [], i: 0, playing: false, stop: false, delay: 400 };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const parseScript = txt => txt.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.startsWith('//'));
function renamedForCanvas(turns) {
  const declared = new Set(); turns.forEach(t => (t.match(/\b(?:named|called)\s+([A-Za-z_][\w-]*)/g) || []).forEach(m => declared.add(m.split(/\s+/).pop())));
  const map = {};
  for (const n of declared) if (world.find(n)) { let k = 2; while (world.find(n + k) || declared.has(n + k)) k++; map[n] = n + k; }
  const keys = Object.keys(map); if (!keys.length) return { turns, map };
  const re = new RegExp(`\\b(${keys.join('|')})\\b`, 'g');
  return { turns: turns.map(t => t.replace(re, m => map[m])), map };
}
function renderPlayer() {
  const bar = $('#player');
  if (!player.turns.length) { bar.hidden = true; return; }
  bar.hidden = false;
  const done = player.i >= player.turns.length;
  bar.innerHTML = `<div class="pl-t"><b>${escH(player.name)}</b> · ${done ? 'finished' : `${player.i + 1} of ${player.turns.length}`}${done ? '' : `<span>Next: ${escH(player.turns[player.i])}</span>`}</div>
    ${done ? '' : player.playing ? '<button type="button" class="pbtn ghost" data-pl="pause">Pause</button>' : '<button type="button" class="pbtn ghost" data-pl="play">Play</button><button type="button" class="pbtn" data-pl="next">Next</button>'}
    <button type="button" class="ib" data-pl="close" aria-label="Close player"><svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
}
async function playRest() {
  if (player.playing) return; player.playing = true; player.stop = false; renderPlayer();
  while (player.i < player.turns.length && !player.stop) { const t = player.turns[player.i++]; renderPlayer(); await submit(t); await sleep(player.delay); }
  player.playing = false; renderPlayer();
}
async function startScript(name, turns, how) {
  if (!turns.length) return;
  player.delay = +(($('#sc-delay') || {}).value || 400);
  player.stop = true; await queue; player.playing = false;
  closeSheet();
  const fixed = renamedForCanvas(turns);
  if (world.state.shapes.length) { const before = world.snapshot(); world.newFrame(name); world.commit(before); }
  else { world.state.frame = { x: 0, y: 0 }; world.state.frames = [{ x: 0, y: 0, title: name }]; }
  const ren = Object.entries(fixed.map).map(([a, b]) => `${a} → ${b}`);
  focusCell = Object.assign({}, world.state.frame);
  sysNote(`Scenario: ${name}` + (ren.length ? ` · renamed ${ren.join(', ')} to avoid clashes` : ''));
  renderCanvas();
  Object.assign(player, { name, turns: fixed.turns, i: 0 });
  renderPlayer();
  if (how === 'play') playRest();
}
$('#player').addEventListener('click', async ev => {
  const b = ev.target.closest('[data-pl]'); if (!b) return;
  const a = b.dataset.pl;
  if (a === 'next' && player.i < player.turns.length && !player.playing) { const t = player.turns[player.i++]; renderPlayer(); await submit(t); renderPlayer(); }
  if (a === 'play') playRest();
  if (a === 'pause') player.stop = true;
  if (a === 'close') { player.stop = true; player.turns = []; renderPlayer(); }
});

/* ---------------- formalizers: rules, VSS, neural ---------------- */
let vssState = 'idle', vssInfo = null, vssError = null, neuralLoading = false, neuralBytes = 0, neuralLoadMs = 0;
const RULES_BYTES_INLINE = (() => { try { return [...document.scripts].filter(s => !s.src && /SOPKit/.test(s.textContent.slice(0, 400))).reduce((a, s) => a + s.textContent.length, 0); } catch (e) { return 0; } })();
const rulesBytes = () => { try { const e = performance.getEntriesByType('resource').find(r => /\/js\/logic\.js$/.test(r.name)); return e && e.decodedBodySize ? e.decodedBodySize : RULES_BYTES_INLINE; } catch (e) { return RULES_BYTES_INLINE; } };
const mb = b => b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : (b / 1e3).toFixed(0) + ' KB';
async function ensureVSS(announce) {
  if (vssState === 'ready') return true;
  if (vssState === 'loading') { while (vssState === 'loading') await sleep(100); return vssState === 'ready'; }
  vssState = 'loading'; refreshFormalizer();
  try {
    if (!window.VSSFormalizer) await import(new URL('js/vss-formalizer.js', document.baseURI).href);
    vssInfo = await window.VSSFormalizer.load(); vssState = 'ready'; vssError = null;
    if (announce !== false) sysNote(`VSS model ready: ${mb(vssInfo.bytes)}, D ${vssInfo.D}, loaded in ${(vssInfo.loadMs / 1000).toFixed(1)} s`);
  } catch (e) { vssState = 'failed'; vssError = e; sysNote('The VSS model could not be loaded: ' + (e && e.message || e)); }
  refreshFormalizer(); return vssState === 'ready';
}
function refreshFormalizer() { if (sheetKind === 'settings' && sheetTab === 'formalizer' && !sheet.hidden) { sbody.innerHTML = renderFormalizer(); syncFormalizer(); } }
function renderFormalizer() {
  const nst = models ? `Ready on ${models.device.toUpperCase()}: ${models.enumModel} + ${models.qaModel}, ${mb(neuralBytes)} downloaded.` : neuralLoading ? 'Loading…' : 'Not loaded (about 100–200 MB on first use, then cached).';
  const vst = vssState === 'ready' ? `Ready: D ${vssInfo.D}, ${vssInfo.bits || 8}-bit route book, ${mb(vssInfo.bytes)}, loaded in ${(vssInfo.loadMs / 1000).toFixed(1)} s.` : vssState === 'loading' ? 'Loading…' : vssState === 'failed' ? 'Failed: ' + (vssError && vssError.message || vssError) : 'Not loaded yet (loads on first use).';
  return `<h3 class="sub">Who reads your messages</h3>
  <div class="seg" role="radiogroup" aria-label="Formalizer">
    ${['rules', 'vss', 'neural', 'compare'].map(m => `<button type="button" role="radio" data-mode="${m}" aria-checked="${mode === m}">${{ rules: 'Rules', vss: 'VSS', neural: 'Neural', compare: 'Compare' }[m]}</button>`).join('')}
  </div>
  <p class="intro" style="margin-top:8px">Every reader writes the same SOP wires, and the same engine and Datalog reasoner run them. <b>Rules</b> use the legend’s cue words. <b>VSS</b> is a small reader trained on this demo’s legend (a VSA route book, no transformer). <b>Neural</b> asks pretrained transformers the legend questions. <b>Compare</b> runs the rules and records what the other readers wrote in History. Picking a reader loads its model.</p>
  <h3 class="sub">VSS model</h3>
  <p class="intro">Trained on the sketch world generated from this legend (training/sketch). A sentence is normalized, read into an event with its roles in a few milliseconds, and turned into the demo’s wires. The rules segmenter cuts messages into clauses first, for every reader.</p>
  <div class="actions"><button type="button" class="btn${vssState === 'ready' ? '' : ' solid'}" id="vss-load"${vssState === 'loading' || vssState === 'ready' ? ' disabled' : ''}>${vssState === 'ready' ? 'Loaded' : 'Load VSS model'}</button><span class="status">${escH(vst)}</span></div>
  <h3 class="sub">Neural models</h3>
  <p class="intro">The model classifies the kind of message and the action, then answers each legend question in that action’s frame with extractive question answering (“Where does the connection start?”).</p>
  <div class="form">
    <label for="nm-strategy">Message type</label>
    <select id="nm-strategy"><option value="zeroshot:deberta">Zero-shot NLI · DeBERTa-v3 xsmall</option><option value="zeroshot:distilbert">Zero-shot NLI · DistilBERT MNLI</option><option value="embed">Similarity to legend examples · MiniLM-L6</option></select>
    <label>Answers</label><div>Extractive QA · DistilBERT SQuAD</div>
    <label for="nm-device">Device</label>
    <select id="nm-device"><option value="auto">WebGPU if available, else WASM</option><option value="wasm">WASM (CPU)</option></select>
  </div>
  <div class="actions"><button type="button" class="btn solid" id="nm-load"${neuralLoading ? ' disabled' : ''}>${models ? 'Reload models' : 'Load models'}</button><span class="status" id="nm-status">${escH(nst)}</span></div>
  <div class="prog" id="nm-prog" hidden><div></div></div>
  <div class="local" id="nm-local" hidden>The model files couldn’t be downloaded from the model host. The page on GitHub Pages or a local server (<code>npx serve docs</code>) can reach it; a sandboxed preview cannot.</div>`;
}
function syncFormalizer() {
  const sel = $('#nm-strategy'); if (!sel) return;
  sel.value = neural.state.strategy === 'embed' ? 'embed' : 'zeroshot:' + (neural.state.zeroshot || 'deberta');
  $('#nm-device').value = neural.state.device || 'auto';
}
function setMode(m) {
  mode = m; setStatus(idleStatus());
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.mode === m)));
  if (m === 'vss' || m === 'compare') ensureVSS();
  if ((m === 'neural' || m === 'compare') && !models && !neuralLoading) { sysNote(m === 'neural' ? 'Loading the neural models; the rules read your messages until they are ready.' : 'Compare records the VSS reader now, and the neural one once its models load.'); loadModels(); }
}
sbody.addEventListener('click', async ev => {
  const q = ev.target.closest('[data-quick]'); if (q) { closeSheet(); submit(q.dataset.quick); return; }
  const b = ev.target.closest('[data-sc]');
  if (b) {
    const sc = SCENARIOS.find(x => x.id === b.dataset.sc);
    if (b.dataset.how === 'edit') { const t = $('#sc-text'); t.value = `# ${sc.title}\n` + sc.turns.join('\n'); t.focus(); t.scrollIntoView({ block: 'center' }); return; }
    startScript(sc.title, sc.turns.slice(), b.dataset.how); return;
  }
  const o = ev.target.closest('[data-own]');
  if (o) { const v = $('#sc-text').value, turns = parseScript(v); if (!turns.length) { $('#sc-status').textContent = 'Write at least one line first.'; return; } startScript((v.match(/^\s*#\s*(.+)$/m) || [])[1] || 'Your script', turns, o.dataset.own); return; }
  const md = ev.target.closest('[data-mode]'); if (md) { setMode(md.dataset.mode); return; }
  if (ev.target.id === 'nm-load') loadModels();
  if (ev.target.id === 'vss-load') ensureVSS(true);
  if (ev.target.id === 'bm-run') runBench(ev.target);
  if (ev.target.id === 'bm-stop') benchStop = true;
  const fx = ev.target.closest('[data-fails]'); if (fx) { const d = document.getElementById('fails-' + fx.dataset.fails); if (d) d.hidden = !d.hidden; }
});
sbody.addEventListener('change', ev => {
  if (ev.target.id === 'sc-file' && ev.target.files[0]) {
    const f = ev.target.files[0], rd = new FileReader();
    rd.onload = () => { $('#sc-text').value = String(rd.result); $('#sc-status').textContent = `Loaded ${f.name}: ${parseScript(String(rd.result)).length} messages.`; };
    rd.onerror = () => { $('#sc-status').textContent = `Couldn't read ${f.name}.`; };
    rd.readAsText(f); ev.target.value = '';
  }
  const pl = ev.target.closest('[data-plug]');
  if (pl) { const p = engine.plugin(pl.dataset.plug); p.enabled = pl.checked; sysNote(`${p.title} plugin switched ${p.enabled ? 'on' : 'off'}`); sbody.innerHTML = renderPlugins(); }
});
async function loadModels() {
  const sel = $('#nm-strategy'), dev = $('#nm-device');
  const [strategy, zs] = (sel ? sel.value : (neural.state.strategy === 'embed' ? 'embed' : 'zeroshot:' + (neural.state.zeroshot || 'deberta'))).split(':');
  const device = dev ? dev.value : (neural.state.device || 'auto');
  neural.state.zeroshot = zs || 'deberta'; neural.state.device = device;
  neuralLoading = true; refreshFormalizer();
  const files = {}, t0 = performance.now(); const prog = $('#nm-prog'); if (prog) prog.hidden = false;
  try {
    const m = await NeuralKit.load({ strategy, zeroshot: zs, device }, e => {
      if (e.status === 'progress' && e.file) {
        files[e.name + '/' + e.file] = [e.loaded || 0, e.total || 0]; const v = Object.values(files), L = v.reduce((a, x) => a + x[0], 0), T = v.reduce((a, x) => a + x[1], 0);
        neuralBytes = T; const bar = $('#nm-prog > div'), stat = $('#nm-status');
        if (bar) bar.style.width = (T ? L / T * 100 : 0).toFixed(1) + '%'; if (stat) stat.textContent = `Downloading ${(L / 1e6).toFixed(0)} of ${(T / 1e6).toFixed(0)} MB`;
        setStatus(`loading models ${(T ? L / T * 100 : 0).toFixed(0)}%`);
      }
    });
    neural.setStrategy(strategy); neural.setModels(m); models = m; neuralLoading = false; neuralLoadMs = performance.now() - t0;
    refreshFormalizer(); setStatus(idleStatus());
    sysNote(`Neural models ready (${m.device.toUpperCase()}, ${mb(neuralBytes)}, ${(neuralLoadMs / 1000).toFixed(0)} s).`);
  } catch (e) {
    neuralLoading = false; setStatus(idleStatus());
    sysNote('The neural models could not be loaded: ' + (e && e.message || e));
    refreshFormalizer(); const l = $('#nm-local'); if (l) l.hidden = false;
  }
}

/* ---------------- benchmark: every reader on the same labelled sentences ---------------- */
let benchStop = false, benchSets = null, benchLast = null;
async function benchIndex() { if (!benchSets) { const r = await fetch(new URL('bench/index.json', document.baseURI)); benchSets = (await r.json()).sets; } return benchSets; }
function renderBench() {
  const sets = benchSets || [];
  const fz = [['rules', 'Rules', true], ['vss', 'VSS', vssState !== 'failed'], ['neural', 'Neural', !!models]];
  return `<p class="intro">Every reader reads the same labelled sentences against the same gold wires. A message counts when its wire type and every labelled answer match (descriptions are compared by what they describe). Speed is measured here, in this browser, per message, after the model has loaded.</p>
  <h3 class="sub">Test sets</h3>
  ${sets.length ? sets.map(s => `<label class="ck" style="display:flex;margin:4px 0"><input type="checkbox" data-bset="${s.id}" ${['blind', 'broad', 'new_identities'].includes(s.id) ? 'checked' : ''}> ${escH(s.title)} <span class="status">&nbsp;· ${s.n}</span></label>`).join('') : '<p class="intro">Loading the test sets…</p>'}
  <div class="opts" style="margin-top:8px"><label for="bm-limit">Sentences per generated set</label><select id="bm-limit"><option value="50">50</option><option value="100" selected>100</option><option value="300">300</option></select></div>
  <h3 class="sub">Readers</h3>
  ${fz.map(([k, l, ok]) => `<label class="ck" style="display:flex;margin:4px 0"><input type="checkbox" data-bfz="${k}" ${ok ? 'checked' : ''}> ${l}${k === 'neural' && !models ? ' <span class="status">&nbsp;(load the models in Formalizer first; about 40 model calls per message)</span>' : ''}</label>`).join('')}
  <div class="actions" style="margin-top:10px"><button type="button" class="btn solid" id="bm-run">Run benchmark</button><button type="button" class="btn" id="bm-stop">Stop</button><span class="status" id="bm-status"></span></div>
  <div id="bm-out">${benchLast || ''}</div>`;
}
const pctl = (xs, p) => { if (!xs.length) return 0; const s = xs.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
async function runBench(btn) {
  benchStop = false; btn.disabled = true;
  const stat = () => $('#bm-status'), say = t => { const s = stat(); if (s) s.textContent = t; };
  const setIds = [...document.querySelectorAll('[data-bset]')].filter(x => x.checked).map(x => x.dataset.bset);
  const fzs = [...document.querySelectorAll('[data-bfz]')].filter(x => x.checked).map(x => x.dataset.bfz);
  const limit = +($('#bm-limit') || { value: 100 }).value;
  if (fzs.includes('vss') && !(await ensureVSS(false))) fzs.splice(fzs.indexOf('vss'), 1);
  if (fzs.includes('neural') && !models) fzs.splice(fzs.indexOf('neural'), 1);
  const res = {}; for (const f of fzs) res[f] = { sets: {}, times: [], fails: [] };
  for (const id of setIds) {
    const meta = benchSets.find(s => s.id === id);
    let rows = await (await fetch(new URL(`bench/${id}.json`, document.baseURI))).json();
    if (!['hand', 'blind', 'broad'].includes(id)) rows = rows.slice(0, limit);
    for (const f of fzs) res[f].sets[id] = { ok: 0, n: 0, keys: 0, kok: 0 };
    for (let i = 0; i < rows.length && !benchStop; i++) {
      const r = rows[i], ctx = { names: r.names, last: [] };
      for (const f of fzs) {
        const t0 = performance.now(); let nodes = [];
        try {
          if (f === 'rules') nodes = sys.formalize(r.text, ctx).nodes;
          else if (f === 'vss') nodes = (await window.VSSFormalizer.formalize(r.text, ctx, sys.formalize)).nodes;
          else nodes = (await neural.formalize(r.text, ctx)).nodes;
        } catch (e) { nodes = []; }
        const dt = performance.now() - t0; res[f].times.push(dt);
        const sc = BenchCanon.score(nodes, r), S = res[f].sets[id]; S.n++; if (sc.ok) S.ok++;
        for (const [k, p] of Object.entries(sc.per)) { if (k === '_type') continue; S.keys++; if (p.ok) S.kok++; }
        if (!sc.ok && res[f].fails.length < 400) res[f].fails.push({ set: id, text: r.text, miss: Object.entries(sc.per).filter(([, p]) => !p.ok).map(([k, p]) => `${k === '_type' ? 'type' : k}: ${p.got} (want ${p.want})`).join('; ') });
      }
      if (i % 5 === 0) { say(`${meta.title}: ${i + 1} of ${rows.length}`); await sleep(0); }
    }
    if (benchStop) break;
  }
  const size = { rules: rulesBytes(), vss: vssInfo ? vssInfo.bytes : 0, neural: neuralBytes };
  const load = { rules: 0, vss: vssInfo ? vssInfo.loadMs : 0, neural: neuralLoadMs };
  const label = { rules: 'Rules', vss: `VSS (D ${vssInfo ? vssInfo.D : '?'})`, neural: models ? `Neural (${models.enumModel.split('/')[1]} + ${models.qaModel.split('/')[1]})` : 'Neural' };
  const sets = setIds.filter(id => fzs.some(f => res[f].sets[id] && res[f].sets[id].n));
  const cell = S => S && S.n ? `<b>${(S.ok / S.n * 100).toFixed(0)}%</b> <span class="why">${S.ok}/${S.n} · answers ${(S.kok / Math.max(1, S.keys) * 100).toFixed(0)}%</span>` : '–';
  const html = `<h3 class="sub">Results</h3><div class="tbl"><table class="bench"><thead><tr><th>reader</th>${sets.map(id => `<th>${escH(benchSets.find(s => s.id === id).title.split(' (')[0])}</th>`).join('')}<th>model size</th><th>load</th><th>ms / message (median · p95)</th></tr></thead><tbody>
    ${fzs.map(f => `<tr><td><b>${escH(label[f])}</b></td>${sets.map(id => `<td>${cell(res[f].sets[id])}</td>`).join('')}<td>${f === 'rules' ? mb(size[f]) + ' <span class="why">code</span>' : mb(size[f])}</td><td>${f === 'rules' ? '–' : (load[f] / 1000).toFixed(1) + ' s'}</td><td>${pctl(res[f].times, 0.5).toFixed(1)} · ${pctl(res[f].times, 0.95).toFixed(1)}</td></tr>`).join('')}
  </tbody></table></div>
  <p class="intro" style="margin-top:8px">The generated sets come from the same templates the VSS model was trained on (new names, held-out template × prefix pairs), and the rules were written by the same author as the templates, so they favour both. The blind paraphrases and the broad set were written before any reader was run on them and no reader was tuned on them afterwards; their author also wrote the rules, which favours the rules.</p>
  ${fzs.map(f => `<div class="actions"><button type="button" class="btn" data-fails="${f}">${escH(label[f])}: ${res[f].fails.length} misread message${res[f].fails.length === 1 ? '' : 's'}</button></div><div id="fails-${f}" hidden><div class="tbl"><table class="bench"><tbody>${res[f].fails.map(x => `<tr><td>${escH(x.text)}<div class="why">${escH(x.set)} · ${escH(x.miss)}</div></td></tr>`).join('')}</tbody></table></div></div>`).join('')}`;
  benchLast = html; btn.disabled = false;
  const out = $('#bm-out'); if (out) out.innerHTML = html;
  say(benchStop ? 'Stopped.' : `Done: ${fzs.length} reader${fzs.length > 1 ? 's' : ''} on ${sets.length} set${sets.length > 1 ? 's' : ''}.`);
}
function renderLegend() {
  const groups = new Map();
  for (const q of engine.legend.questions.values()) { const g = q.plugins[0]; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(q); }
  let h = `<p class="intro">Every message is formalized by answering these questions. A message answers only the ones its meaning touches. Plugins add questions and answers; the cue words (hover a value) are what the rules look for.</p>`;
  for (const [plug, qs] of groups) {
    const p = engine.plugin(plug);
    h += `<h3 class="sub">${escH(p ? p.title : plug)}</h3>`;
    for (const q of qs) {
      h += `<div class="lq"><div class="key">${escH(q.key)}</div><div>${escH(q.ask || '')}<span class="kind">${escH(q.kind)}</span></div>`;
      if (q.values) h += `<div class="vals">${Object.entries(q.values).map(([v, c]) => `<span${c && c.length ? ` title="cues: ${escH(c.join(', '))}"` : ''}>${escH(v)}</span>`).join('')}</div>`;
      h += `</div>`;
    }
  }
  return h;
}
function renderPlugins() {
  let h = `<p class="intro">A plugin brings wire types, legend questions and interpreters. Each interpreter registers a pattern; the most specific enabled one runs. Switch one off to see its messages fail cleanly.</p>`;
  for (const p of engine.plugins) {
    const pats = engine.handlers.filter(x => x.plugin === p).map(x => `${x.type}${Object.entries(x.when || {}).map(([k, v]) => ` ${k}=${[].concat(v).join('|')}`).join('')}`);
    const types = Object.keys(p.wireTypes || {});
    h += `<div class="plug${p.enabled ? '' : ' off'}"><header><h4>${escH(p.title)}</h4><label class="sw"><input type="checkbox" data-plug="${escH(p.name)}" ${p.enabled ? 'checked' : ''} ${p.locked ? 'disabled' : ''} aria-label="Enable ${escH(p.title)}">${p.locked ? 'required' : p.enabled ? 'on' : 'off'}</label></header><p>${escH(p.description)}</p>`;
    if (types.length) h += `<div class="pats">${types.map(t => `<code>wire type: ${escH(t)}</code>`).join('')}</div>`;
    if (pats.length) h += `<div class="pats">${pats.map(t => `<code>${escH(t)}</code>`).join('')}</div>`;
    h += `</div>`;
  }
  return h;
}
function renderWorld() {
  const S = world.state, lines = [];
  for (const s of S.shapes) lines.push(hlNode({ id: s.name, type: 'shape', args: Object.assign({ shape: s.shape, size: K.sizeName(s.size), color: s.color }, s.outline ? { outline: s.outline } : {}, s.label ? { label: s.label } : {}, { at: [s.x, s.y] }) }));
  for (const e of S.edges) lines.push(hlNode({ id: e.id, type: 'edge', args: Object.assign({ from: { ref: e.from }, to: { ref: e.to }, style: e.style, arrow: e.arrow }, e.color ? { color: e.color } : {}, e.label ? { label: e.label } : {}) }));
  for (const r of S.rules) { const a = {}; ['shape', 'size', 'color', 'outline'].forEach(k => { if (r[k]) a[k] = r[k]; }); lines.push(hlNode({ id: r.id, type: 'rule', args: a })); }
  if (!lines.length) lines.push('<span class="cm"># empty</span>');
  return `<p class="intro">The drawing, written back as SOP wires. This is what a backend such as Datalog, Prolog or Z3 would receive after lowering. ${world.undoStack.length} step${world.undoStack.length === 1 ? '' : 's'} can be undone.</p><pre class="sop">${lines.join('\n')}</pre>`;
}

/* ---------------- composer ---------------- */
const ta = $('#say');
const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.min(128, ta.scrollHeight) + 'px'; };
ta.addEventListener('input', grow);
function sendTyped() { const v = ta.value; if (!v.trim()) return; ta.value = ''; grow(); submit(v); }
const touchFirst = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
ta.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter' || ev.shiftKey || ev.isComposing || ev.keyCode === 229) return;
  if (touchFirst && !ev.ctrlKey && !ev.metaKey) return; // phone keyboards: Enter adds a line, the button sends
  ev.preventDefault(); sendTyped();
});
const sendBtn = $('#send-btn');
sendBtn.addEventListener('pointerdown', ev => ev.preventDefault()); // keep the keyboard open
sendBtn.addEventListener('click', () => { sendTyped(); ta.focus({ preventScroll: true }); });

/* Fit the app to the visible area, so the composer stays above the on-screen keyboard. */
const appEl = document.querySelector('.app');
function fitViewport() {
  const vv = window.visualViewport; if (!vv) return;
  const full = window.innerHeight, h = Math.round(vv.height);
  appEl.style.setProperty('--app-h', h + 'px');
  appEl.classList.toggle('kb', full - h > 120 && window.matchMedia('(max-width: 860px)').matches);
  if (vv.offsetTop) window.scrollTo(0, 0);
  msgs.scrollTop = msgs.scrollHeight;
}
if (window.visualViewport) { visualViewport.addEventListener('resize', fitViewport); visualViewport.addEventListener('scroll', fitViewport); fitViewport(); }
document.querySelectorAll('[data-say]').forEach(b => b.addEventListener('click', () => submit(b.dataset.say)));
$('#view-btn').addEventListener('click', () => { const narrow = svg.clientWidth < 640, focused = view === 'focus' || (view === 'auto' && narrow); view = focused ? 'all' : 'focus'; renderCanvas(); });
window.addEventListener('resize', () => { if (!drag) renderCanvas(); });

/* ---------------- start ---------------- */
renderCanvas(); setStatus(idleStatus());
botBubble({ text: 'Hi! Tell me what to draw, change or connect, or ask me about the drawing. Tap + for examples and whole scenarios.' });
[
  'Draw a large blue circle named Start in the top left, then add a rectangle named Process to the right of it labeled "Validate". Connect Start to Process.',
  'Add a yellow diamond named Check right of Process labeled "ok?" and connect Process to it. Put a green circle named Done below Check and link Check to Done with a dashed arrow labeled "yes".',
  'Is there a path from Start to Done?'
].forEach(submit);
queue.then(() => { world.undoStack = []; });
})();
