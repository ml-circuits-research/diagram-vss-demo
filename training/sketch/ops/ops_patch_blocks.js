// ops_patch_blocks.js: the code blocks that training/sketch/ops/apply_ops_patch.mjs inserts into docs/js/logic.js (the integration of the
// high-level layout operations and of arrow restyling; design: training/sketch/ops/HIGH_LEVEL_OPS.md, patch description: docs/js/ops-integration.md).
// This file is NOT loaded by anything; it is the text of the patch. Each block starts with a line "//@@ <name>".

//@@ ENGINE_HELPERS  (inserted before `const layoutPlugin = {`)
/* ---------- high-level layout operations (training/sketch/ops/HIGH_LEVEL_OPS.md; geometry and quality score: docs/js/auto-layout.js) ---------- */
const autoLayout = () => (typeof AutoLayout !== 'undefined' ? AutoLayout : null) || optRequire('./auto-layout.js');
const EDGE_PX = { tiny: 1, small: 1.5, medium: 2, large: 3.5, huge: 5 };   /* the stroke width of an arrow per size value (ui.js draws e.width) */
const inThisCell = s => { const c = cellOf(s.x, s.y); return c.x === FR.x && c.y === FR.y; };
/** the shapes of the drawing's cell as AutoLayout input (background panels and zones are left out: shapes may sit on them) */
const alShapes = W => W.state.shapes.filter(s => !isPanel(s) && inThisCell(s)).map(s => { const d = dims(s); return { name: s.name, x: s.x, y: s.y, w: d.w, h: d.h, color: s.color, shape: s.shape, size: s.size, label: s.label, outline: s.outline }; });
const alLinks = (W, shapes) => { const here = new Set(shapes.map(s => s.name)); return W.state.edges.filter(e => here.has(e.from) && here.has(e.to)).map(e => ({ from: e.from, to: e.to, arrow: e.arrow })); };
/** runs an AutoLayout operation on the targets (group names expanded; no target = every shape of the drawing's cell, also for
 *  target=mention(quantifier=all)), in the cell of the first target, and emits the new positions. LayoutError -> Clarify when it asks
 *  (no links for a tree, a loop, ...), else SOPError. -> the AutoLayout result */
function alRun(W, a, ctx, fn) {
  const AL = autoLayout(); if (!AL) throw new SOPError('The layout module (auto-layout.js) is not loaded.');
  const t = expandGroups(W, names(a.target)).map(n => need(W, n).name), first = t.length ? W.find(t[0]) : null;
  const go = () => {
    const shapes = alShapes(W), links = alLinks(W, shapes), here = new Set(shapes.map(s => s.name));
    const targets = t.filter(n => here.has(n)), all = targets.length === shapes.length;
    const opts = { canvas: { x: FR.x, y: FR.y, w: CANVAS.W, h: CANVAS.H }, targets: targets.length && !all ? targets : null, groups: (W.state.groups || []).map(g => ({ name: g.name, members: g.members.slice() })) };
    let r;
    try { r = fn(AL, shapes, links, opts); }
    catch (e) { if (e && e.name === 'LayoutError') throw (e.ask ? new Clarify(e.message, { wire: ctx.node.id, code: e.code }) : new SOPError(e.message)); throw e; }
    for (const [n, p] of Object.entries(r.positions || {})) { const s = W.find(n); if (s && (s.x !== p.x || s.y !== p.y)) ctx.emit({ op: 'set', name: s.name, props: { x: p.x, y: p.y } }); }
    if (t.length > targets.length) r.notes = (r.notes || []).concat([`${t.length - targets.length} of the shapes are in another drawing and stayed where they were`]);
    return r;
  };
  return first ? inCell(first.x, first.y, go) : go();
}
const alSays = (r, what) => what + (r.crowded ? ' They do not all fit on the canvas without touching.' : '');
/** the existing arrows a restyle / reverse wire names: from= / to= (edgesNamed), else the arrows touching target=, else every arrow */
function edgesOf(W, a) {
  if (a.from != null || a.to != null) return edgesNamed(W, a).es;
  const t = expandGroups(W, names(a.target)).map(n => need(W, n).name);
  const es = t.length ? W.state.edges.filter(e => t.includes(e.from) || t.includes(e.to)) : W.state.edges.slice();
  if (!es.length) throw new SOPError(t.length ? `There are no arrows at ${listing(t)}.` : 'There are no arrows on the canvas.');
  return es;
}
function restyleEdges(a, ctx) {
  const W = ctx.world, es = edgesOf(W, a), props = {};
  if (a.style) props.style = a.style;
  if (a.color) props.color = a.color;
  if (a.arrow) props.arrow = a.arrow;
  if (a.size) props.width = EDGE_PX[a.size];
  const grow = a.action === 'resize' ? (a.scale != null ? +a.scale : 1.5) : null;
  if (!Object.keys(props).length && grow == null) throw new SOPError('What should change about the arrow? Try dashed, dotted, solid, a colour, two-way, no arrowhead, thicker or thinner.');
  let n = 0;
  for (const e of es) {
    const p = Object.assign({}, props); if (grow != null) p.width = Math.round(Math.min(8, Math.max(1, (e.width || 2) * grow)) * 10) / 10;
    if (Object.keys(p).every(k => e[k] === p[k])) continue;
    ctx.emit({ op: 'edgeSet', id: e.id, props: p }); n++;
  }
  return { value: es.map(e => e.id), answer: n ? `Changed ${n === 1 ? 'the arrow ' + edgeEnds(es[0]) : n + ' arrows'}.` : `The ${es.length === 1 ? 'arrow already looks' : 'arrows already look'} like that.`, highlight: { edges: es.map(e => e.id) } };
}

const opsPlugin = {
  name: 'ops', title: 'Layout operations',
  description: 'Re-lay out existing shapes by their links (tree, layers, radial, organic, or the layout that fits them), improve the layout by a measured score, more or less space, snap to the grid, flip, sort, cluster, make the same, straighten links, untangle crossings, fit on the canvas; restyle and reverse existing arrows.',
  legend: {
    action: { values: {
      improve: ['improve', 'tidy', 'tidy up', 'tidyup', 'neaten', 'declutter', 'unclutter', 'clean up', 'cleanup', 'beautify', 'prettify'],
      respace: ['compact', 'condense', 'squeeze', 'tighten'],
      snap: ['snap'], flip: ['flip', 'mirror'], reverse: ['reverse', 'invert'], sort: ['sort', 'alphabetize', 'alphabetise'], groupBy: [],
      equalize: ['equalize', 'equalise', 'unify'], straighten: ['straighten'], untangle: ['untangle', 'disentangle', 'uncross'], fit: ['fit', 'recenter', 'recentre', 're-center', 're-centre']
    } },
    layout: { values: {
      tree: ['tree', 'hierarchy', 'hierarchical', 'org chart', 'organization chart', 'organisation chart', 'organigram'],
      layers: ['layers', 'layered', 'flow', 'flowchart', 'flow chart', 'tiers', 'levels'],
      radial: ['radial', 'radially', 'sunburst', 'concentric', 'mind map', 'hub and spokes'],
      organic: ['organic', 'force-directed', 'force directed', 'spring']
    } },
    property: { values: { name: ['alphabetical', 'alphabetically'] } }
  },
  handlers: [
    { type: 'command', when: { action: 'improve' }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => { if (!sh.length) throw new SOPError('There is nothing to improve: the canvas is empty.'); return AL.improve(sh, ln, o); });
      return { value: Object.keys(r.positions), notes: (r.notes || []).concat(r.candidates.map(c => `${c.name}: ${c.score}`)), answer: alSays(r, r.message) };
    } },
    { type: 'command', when: { action: 'respace' }, run(a, ctx) {
      /* comparison = bigger (more space) | smaller (less space); scale = how much (a factor; default 1.5 / 0.67); distance = a gap in px */
      let f = a.scale != null ? +a.scale : null;
      if (a.comparison === 'smaller') f = f == null ? 0.67 : f > 1 ? 1 / f : f; else if (a.comparison === 'bigger') f = f == null ? 1.5 : f < 1 ? 1 / f : f;
      if (f == null && a.distance == null) throw new SOPError('More space or less space between the shapes?');
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => AL.spacing(sh, ln, Object.assign(o, { scale: f != null ? f : undefined, distance: a.distance != null && f == null ? +a.distance : undefined })));
      return { value: Object.keys(r.positions), notes: r.notes, answer: alSays(r, r.scale >= 1 ? `More space between the shapes (x${r.scale}).` : `Less space between the shapes (x${r.scale}).`) };
    } },
    { type: 'command', when: { action: 'snap' }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => AL.snap(sh, ln, Object.assign(o, { grid: a.distance != null ? +a.distance : 20 })));
      return { value: r.moved, notes: r.notes, answer: `Snapped ${r.moved.length} shape${r.moved.length === 1 ? '' : 's'} to the ${r.grid} px grid.` };
    } },
    { type: 'command', when: { action: 'flip' }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => AL.flip(sh, ln, Object.assign(o, { axis: a.axis })));
      return { value: Object.keys(r.positions), notes: r.notes, answer: a.axis === 'vertical' ? 'Flipped top to bottom.' : 'Flipped left to right.' };
    } },
    { type: 'command', when: { action: 'sort' }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => AL.sort(sh, ln, Object.assign(o, { property: a.property || 'name', descending: a.superlative === 'biggest', layout: a.layout })));
      return { value: r.order, notes: r.notes, answer: alSays(r, `Sorted by ${a.property || 'name'}: ${r.order.join(', ')}.`) };
    } },
    { type: 'command', when: { action: 'groupBy' }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => AL.cluster(sh, ln, Object.assign(o, { property: a.property || 'color' })));
      return { value: Object.keys(r.positions), notes: r.notes, answer: alSays(r, `Gathered the shapes by ${a.property || 'color'}: ${r.clusters.join(', ')}.`) };
    } },
    { type: 'command', when: { action: 'equalize' }, run(a, ctx) {
      const W = ctx.world, p = a.property || 'size';
      if (!['size', 'color', 'shape', 'outline'].includes(p)) throw new SOPError(`I can make the size, colour, shape or outline the same, not the ${p}.`);
      const like = a.anchor != null ? need(W, names(a.anchor)[0]).name : undefined;
      const r = alRun(W, a, ctx, (AL, sh, ln, o) => AL.equalize(sh, ln, Object.assign(o, { property: p, like })));
      for (const [n, props] of Object.entries(r.props)) ctx.emit({ op: 'set', name: n, props });
      if (p === 'size' || p === 'shape') alRun(W, a, ctx, (AL, sh, ln, o) => AL.separate(sh, ln, o));   /* bigger shapes may now overlap */
      const k = Object.keys(r.props).length;
      return { value: Object.keys(r.props), answer: k ? `Gave ${k} shape${k === 1 ? '' : 's'} the ${p} ${p === 'size' ? sizeName(r.value) : r.value}.` : `They already have the same ${p}.` };
    } },
    { type: 'command', when: { action: 'straighten' }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => AL.straighten(sh, ln, o));
      return { value: r.moved, notes: r.notes, answer: r.straightened ? `Straightened ${r.straightened} link${r.straightened === 1 ? '' : 's'}.` : 'No link was nearly straight, so nothing moved; "untangle" or "tidy up" may help more.' };
    } },
    { type: 'command', when: { action: 'untangle' }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => AL.untangle(sh, ln, o));
      return { value: r.moved, notes: r.notes, answer: r.swaps ? `Swapped ${r.swaps} pair${r.swaps === 1 ? '' : 's'} of shapes to reduce the crossings.` : 'Swapping shapes did not reduce the crossings; "arrange as a tree" or "in layers" may.' };
    } },
    { type: 'command', when: { action: 'fit' }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => AL.fit(sh, ln, Object.assign(o, { center: a.position === 'center' })));
      return { value: Object.keys(r.positions), notes: r.notes, answer: alSays(r, a.position === 'center' ? 'Centred the drawing on the canvas.' : r.moved.length ? 'Everything is on the canvas now.' : 'Everything was already on the canvas.') };
    } },
    { type: 'command', when: { action: 'align', direction: true }, run(a, ctx) {
      const r = alRun(ctx.world, a, ctx, (AL, sh, ln, o) => { if (!o.targets && sh.length < 2) throw new SOPError('Align needs at least two shapes.'); return AL.align(sh, ln, Object.assign(o, { direction: a.direction })); });
      return { value: Object.keys(r.positions), notes: r.notes, answer: `Aligned the ${({ left: 'left edges', right: 'right edges', up: 'tops', down: 'bottoms' })[a.direction]}.` };
    } },
    { type: 'command', when: { action: 'reverse' }, run(a, ctx) {
      const W = ctx.world, es = edgesOf(W, a);
      for (const e of es) ctx.emit({ op: 'edgeSet', id: e.id, props: { from: e.to, to: e.from } });
      return { value: es.map(e => e.id), answer: es.length === 1 ? `The arrow now goes ${edgeEnds(W.state.edges.find(x => x.id === es[0].id))}.` : `Reversed ${es.length} arrows.`, highlight: { edges: es.map(e => e.id) } };
    } },
    /* restyle existing arrows: action=set|resize with from=/to= (one arrow by its ends) or kind=edge (every arrow, or those at target=) */
    { type: 'command', when: { action: ['set', 'resize'], from: true }, run: restyleEdges },
    { type: 'command', when: { action: ['set', 'resize'], to: true }, run: restyleEdges },
    { type: 'command', when: { action: ['set', 'resize'], kind: 'edge' }, run: restyleEdges }
  ]
};

//@@ ARRANGE_HANDLER  (replaces layoutPlugin's whole `{ type: 'command', when: { action: 'arrange' }, run(a, ctx) { ... } }` handler)
    { type: 'command', when: { action: 'arrange' }, run(a, ctx) {
      /* layout = row | column | grid | circle | tree | layers | radial | organic; no layout: axis -> row / column; direction -> the
         layout the links ask for in that direction (a row / column when the shapes are not linked); nothing -> the layout the links ask
         for (AutoLayout 'auto'). anchor = the tree root / radial centre / the shape the layers start from. */
      const W = ctx.world, root = a.anchor != null ? need(W, names(a.anchor)[0]).name : undefined;
      let kind = a.layout || (a.axis === 'vertical' ? 'column' : a.axis === 'horizontal' ? 'row' : null);
      try {
        const r = alRun(W, a, ctx, (AL, sh, ln, o) => {
          if (!sh.length) throw new SOPError('There is nothing to arrange.');
          let order;
          if (!kind && a.direction) {
            const mine = o.targets ? sh.filter(s => o.targets.includes(s.name)) : sh, an = AL.analyse(mine, ln.filter(l => mine.some(s => s.name === l.from) && mine.some(s => s.name === l.to)));
            kind = an.m ? 'auto' : (a.direction === 'left' || a.direction === 'right' ? 'row' : 'column');
            if (!an.m && (a.direction === 'left' || a.direction === 'up')) order = AL.readingOrderNames(mine).reverse();
          }
          if (['row', 'column'].includes(kind) && (a.direction === 'left' || a.direction === 'up') && !order) order = AL.readingOrderNames(o.targets ? sh.filter(s => o.targets.includes(s.name)) : sh).reverse();
          return AL.layout(kind || 'auto', sh, ln, Object.assign(o, { direction: a.direction, root, order }));
        });
        const dirW = r.direction && r.direction !== 'down' ? `, ${({ up: 'growing upwards', left: 'right to left', right: 'left to right' })[r.direction]}` : '';
        return { value: Object.keys(r.positions), notes: (r.notes || []).concat([`${r.layout} layout`]), answer: alSays(r, `Arranged ${Object.keys(r.positions).length} shapes as a ${({ layers: 'layered flow', grid: 'grid', row: 'row', column: 'column', circle: 'circle', tree: 'tree', radial: 'radial layout', organic: 'free (organic) layout' })[r.layout]}${dirW}.`) };
      } catch (e) {
        /* a tree / radial layout of shapes that are not linked: the hierarchy / hub template's form, in the order given (templates.js) */
        const TK = templateKit();
        if (e instanceof Clarify && e.code === 'no-links' && TK && (kind === 'tree' || kind === 'radial') && names(a.target).length) {
          const h = ctx.engine.match('command', Object.assign({}, a, { template: kind === 'tree' ? 'hierarchy' : 'hub', layout: undefined }));
          const out = h.run(Object.assign({}, a, { template: kind === 'tree' ? 'hierarchy' : 'hub', layout: undefined }), ctx) || {};
          return Object.assign(out, { answer: `There are no links between them, so I used the ${kind === 'tree' ? 'hierarchy' : 'hub'} form in the order given. ${out.answer || ''}`.trim() });
        }
        throw e;
      }
    } }

//@@ READER_HELPERS  (inserted before `function makeFormalizer(engine) {`)
/* ---------- the Rules' reading of the high-level layout operations and of arrow restyling (training/sketch/ops/HIGH_LEVEL_OPS.md section 6) ----------
   Pure functions of the clause text. opsSkipTemplate: a re-layout that follows the links is not a template (templates.js) request.
   opsRestyle: a change to existing arrows -> 'set' | 'resize'. opsAction: the operation a clause asks for -> an action or null.
   opsArgs: the parameters of these actions, from the remaining words. */
const OPS_LAYOUT = [
  ['tree', /\b(?:trees?|hierarch(?:y|ies|ical|ically)|org(?:ani[sz]ation(?:al)?)?[\s-]*charts?|organigram|reporting\s+structure|family\s+tree)\b/i],
  ['layers', /\b(?:layers?|layered|flow[\s-]*charts?|flows?|flowing|tiers?|tiered|levels)\b/i],
  ['radial', /\b(?:radial(?:ly)?|sunburst|concentric(?:\s+(?:rings|circles))?|rings?\s+around|mind[\s-]*maps?|hub[\s-]+and[\s-]+spokes?|spokes)\b/i],
  ['organic', /\b(?:organic(?:ally)?|force[\s-]*directed|force\s+layout|spring\s+layout|physics)\b/i],
  ['row', /\b(?:in|into|as)\s+(?:a\s+|one\s+)?(?:row|line)\b/i], ['column', /\b(?:in|into|as)\s+(?:a\s+|one\s+)?(?:column|stack)\b/i],
  ['grid', /\b(?:in|into|as|on)\s+(?:a\s+)?grid\b/i], ['circle', /\b(?:in|into|as)\s+(?:a\s+)?(?:circle|ring)\b/i]
];
const opsLayoutOf = s => { for (const [v, re] of OPS_LAYOUT) if (re.test(s)) return v; return null; };
const OPS_LINK_LAYOUT = /\b(?:rings?\s+around|trees?|hierarch(?:y|ical)|org(?:ani[sz]ation(?:al)?)?[\s-]*charts?|organigram|layers?|layered|flow[\s-]*charts?|flows?|radial(?:ly)?|organic|force[\s-]*directed|spokes|mind[\s-]*maps?)\b/i;
/** the direction of a tree / layered layout. strong = false also reads horizontal (right) and vertical (down) */
function opsDirection(raw, strong) {
  const s = ' ' + raw + ' ';
  if (/\bright[\s-]+to[\s-]+left\b|\bleftwards?\b|\b(?:going|growing|flowing|pointing|running|reading)\s+(?:to\s+the\s+)?left\b|\bRL\b/i.test(s) && !/\bleft[\s-]+to[\s-]+right\b/i.test(s)) return 'left';
  if (/\bleft[\s-]+to[\s-]+right\b|\brightwards?\b|\bsideways\b|\b(?:going|growing|flowing|pointing|running|reading)\s+(?:to\s+the\s+)?right\b|\bLR\b|\bL\s*-?>\s*R\b/i.test(s)) return 'right';
  if (/\bbottom[\s-]+(?:to[\s-]+top|up)\b|\bupside[\s-]+down\b|\bupwards?\b|\b(?:going|growing|flowing|pointing|running)\s+up\b|\broots?\s+(?:at|on)\s+the\s+bottom\b|\bBT\b/i.test(s)) return 'up';
  if (/\btop[\s-]+(?:to[\s-]+bottom|down)\b|\bdownwards?\b|\b(?:going|growing|flowing|pointing|running)\s+down\b|\b(?:TD|TB)\b/i.test(s)) return 'down';
  if (!strong) {
    if (/\bhorizontal(?:ly)?\b|\b(?:root|start|source|it)\s+(?:at|on)\s+the\s+left\b|\bat\s+the\s+left\b/i.test(s)) return 'right';
    if (/\bvertical(?:ly)?\b/i.test(s) || /\b(?:root|start|source)\s+(?:at|on)\s+the\s+top\b/.test(s)) return 'down';
    if (/\b(?:root|start|source)\s+(?:at|on)\s+the\s+right\b/i.test(s)) return 'left';
  }
  return null;
}
/** a re-layout of existing shapes by their links, not a template: a link-layout word, no creation verb, no list of new items */
function opsSkipTemplate(t) {
  const s = ' ' + t + ' ';
  if (!OPS_LINK_LAYOUT.test(s)) return false;
  if (/\b(?:draw|create|build|add|sketch|insert|start|new|generate)\b|\bmake\s+(?:me\s+)?(?:a|an|one)\b/i.test(s)) return false;
  if (/\b(?:of|for|listing|showing|containing)\s+(?:⟪\d+⟫|[A-Za-z][\w-]*\s*(?:,|\band\b))/i.test(s)) return false;
  return true;
}
const OPS_EDGE = 'arrows?|lines?|edges?|links?|connections?|connectors?|wires?';
const OPS_REVERSE = { test: s => new RegExp(`\\b(?:${OPS_EDGE}|direction)\\b`, 'i').test(s) && /\b(?:reverse[sd]?|flip|invert|turn\s+(?:[\w→-]+\s+){0,6}?around|(?:switch|swap|change|flip|reverse)\s+(?:the\s+)?(?:direction|ends)|the\s+other\s+way(?:\s+(?:round|around))?|backwards?|the\s+opposite\s+(?:way|direction)|reversed)\b/i.test(s) };
/** a change to EXISTING arrows (style, colour, heads, thickness) -> 'set' | 'resize' | null */
function opsRestyle(t, act, colorRe) {
  const s = (' ' + t + ' ').replace(/\b(?:left|right|top|bottom|upper|lower|outer|far|near|canvas|page|screen)\s+edges?\b|\bedges?\s+of\s+the\s+(?:canvas|page|screen|drawing)\b/gi, ' ');
  const edge = new RegExp(`\\b(?:${OPS_EDGE}|arrow\\s*heads?)\\b`, 'i').test(s) || /→|->/.test(s);
  if (!edge || OPS_REVERSE.test(s)) return null;
  if (/^\s*(?:connect|link|join|wire|attach|hook|tie)\b/i.test(s)) return null;                                                   // a new connection
  const headAdd = /\b(?:add|put)\s+(?:an?\s+|the\s+)?arrow\s*heads?\b/i.test(s);
  if (act === 'create' && !headAdd) return null;
  if (!headAdd && new RegExp(`\\b(?:draw|add|create|insert|sketch|put|place|make)\\s+(?:an?|another|new|one|\\d+)\\s+(?:[\\w-]+\\s+){0,2}?(?:${OPS_EDGE})\\b`, 'i').test(s)) return null;
  const headOff = /\b(?:remove|delete|drop|take\s+off|get\s+rid\s+of|lose|no)\s+(?:the\s+|its\s+|their\s+|any\s+|all\s+(?:the\s+)?)?arrow\s*heads?\b|\bheadless\b/i.test(s);
  const head = headOff || /\barrow\s*heads?\b/i.test(s);
  const style = new RegExp(`\\b(?:dash(?:ed|es)?|dotted|dot\s+(?:line|style)|solid|thick|thin|bold|heavy|fat|hairline|two[\\s-]way|bidirectional|both\\s+(?:ways|ends|directions)|double[\\s-]headed|one[\\s-]way|plain|undirected|${colorRe})\\b`, 'i').test(s);
  const comp = /\b(?:thicker|thinner|bolder|heavier|lighter|fatter|wider|narrower|skinnier|finer)\b/i.test(s);
  if (!style && !comp && !head) return null;
  if (act && !['set', 'resize', 'connect', 'delete', 'disconnect', 'move', 'label', 'create'].includes(act)) return null;
  if ((act === 'delete' || act === 'disconnect') && !headOff) return null;                                                  // "delete the red arrow" deletes it
  if (act === 'label' && !style && !comp && !head) return null;
  const definite = new RegExp(`\\b(?:the|this|that|these|those|all|every|each|its|their|both|my)\\s+(?:[\\w-]+\\s+){0,3}?(?:${OPS_EDGE})\\b`, 'i').test(s) || /→|->|–|[A-Za-z0-9]-[A-Z]/.test(s) || head;
  if (!definite && act && act !== 'set' && act !== 'resize') return null;
  return comp && !style && !head ? 'resize' : 'set';
}
const OPS_MORE = /\b(?:more|extra|bigger|larger|wider|some|a\s+bit\s+of|a\s+little|additional)\s+(?:space|spacing|room|gaps?|distance|breathing\s+room|air|padding|whitespace|white\s+space)\b|\b(?:further|farther|wider|more)\s+apart\b|\b(?:spread|space)\s+(?:[\w']+\s+){0,3}?out\s+(?:more|a\s+(?:bit|little)(?:\s+more)?|further)\b|\bmore\s+spread\s+out\b|\b(?:increase|grow|widen|enlarge|expand|double|triple)\s+(?:the\s+)?(?:spacing|gaps?|space|distances?)\b|\btoo\s+(?:crowded|cramped|squished|squashed|tight|close(?:\s+together)?|packed|bunched(?:\s+up)?)\b|\bgive\s+(?:\w+\s+){0,3}?(?:room|space)\b|\bbreathing\s+room\b/i;
const OPS_LESS = /\b(?:less|smaller|narrower|tighter)\s+(?:space|spacing|room|gaps?|distance|padding|whitespace|white\s+space)\b|\bcloser\s+(?:together|to\s+each\s+other)\b|\bless\s+spread\s+out\b|\b(?:compact|compacter|condense|squeeze|tighten|tighter|pack)\b|\b(?:shrink|reduce|decrease|cut|narrow|halve)\s+(?:the\s+)?(?:spacing|gaps?|space|distances?|whitespace)\b|\btoo\s+(?:spread\s+out|far\s+apart|sparse|loose|spaced\s+out|much\s+(?:space|room|white\s*space|gap))\b|\bnot\s+so\s+far\s+apart\b|\bbring\s+(?:\w+\s+){0,3}?closer\b/i;
const OPS_IMPROVE = /\b(?:tidy|tidier|neaten|neater|declutter|de-clutter|unclutter|clean\s+(?:[\w']+\s+){0,3}?up|cleanup|clean-up|cleaner|beautify|prettify|prettier|nicer|improve|improved)\b|\blook(?:s|ing)?\s+(?:(?:a\s+(?:bit|lot)|much|way|far)\s+)?(?:more\s+)?(?:better|nicer|neater|cleaner|tidier|good|nice|neat|clean|tidy|professional|organi[sz]ed|less\s+messy)\b|\bless\s+(?:messy|cluttered|clutter|chaotic|busy|of\s+a\s+mess)\b|\bfix\s+(?:up\s+)?(?:the\s+|this\s+|my\s+)?(?:layout|mess|arrangement|placement|positions?|positioning)\b|\b(?:sort|straighten)\s+(?:\w+\s+)?out\s+(?:the\s+|this\s+)?mess\b|\b(?:messy|mess|cluttered|chaos|chaotic|spaghetti)\b/i;
const OPS_UNTANGLE = new RegExp(String.raw`\b(?:untangle|disentangle|uncross)\b|\bcrossings?\b|\b(?:don'?t|do\s+not|doesn'?t|won'?t|stop|no\s+longer|never|not)\s+(?:\w+\s+)?(?:cross|crossing|overlap|overlapping)\b|\bcross(?:ing)?\s+(?:each\s+other|over)\b|\btangled?\b|\b(?:${OPS_EDGE})\s+(?:\w+\s+){0,2}?(?:overlap|overlapping)\b`, 'i');
/** the operation a command clause asks for: improve, spacing, snap, flip, reverse, sort, cluster, equalize, straighten, untangle, fit,
 *  arrange (a layout word on existing shapes), align (an edge: left / right / top / bottom); null = keep the action read so far */
function opsAction(t, act) {
  const s = ' ' + t + ' ', has = re => re.test(s);
  const may = list => act == null || list.includes(act);
  const E = new RegExp(`\\b(?:${OPS_EDGE})\\b`, 'i');
  if (has(OPS_REVERSE) && may(['set', 'resize', 'swap', 'move', 'connect', 'arrange', 'flip', 'reverse', 'improve', 'create'])) return 'reverse';
  if ((has(/\bsnap\b/) || has(/\b(?:to|on|onto|with)\s+the\s+grid\b/) || has(/\bgrid[\s-]+(?:aligned|snapped)\b/)) && may(['snap', 'align', 'move', 'set', 'arrange', 'create'])) return 'snap';
  if ((has(/\bstraighten\b/) || (E.test(s) && has(/\bstraight\b/)) || has(/\bno\s+(?:more\s+)?(?:diagonal|slanted|crooked|wonky)\b/)) && may(['straighten', 'set', 'move', 'arrange', 'improve', 'align', 'connect'])) return 'straighten';
  if (has(OPS_UNTANGLE) && may(['untangle', 'set', 'move', 'arrange', 'improve', 'resize', 'connect', 'delete', 'disconnect'])) return 'untangle';
  /* group by a property before sort and equalize ("keep the same colours together", "cluster by size") */
  if ((has(/^\s*cluster\b/) || has(/\b(?:cluster|group|gather|bunch|collect)\s+(?:[\w']+\s+){0,4}?by\s+(?:their\s+)?(?:colou?rs?|shapes?|kinds?|types?|sizes?)\b/) || has(/\b(?:same|like)\s+colou?rs?\s+together\b/) || has(/\bcolou?rs?\s+together\b/)) && may(['groupBy', 'group', 'arrange', 'move', 'set', 'improve', 'connect', 'equalize', 'sort'])) return 'groupBy';
  if ((has(/\bsame\s+(?:size|colou?r|shape|outline|border|width|height)s?\b/) || has(/\b(?:outlines?|borders?|sizes?|colou?rs?|shapes?)\s+(?:all\s+)?the\s+same\s*(?:$|[,.!?]|\b(?:please|pls|as|too)\b)/) || has(/\b(?:equali[sz]e|unify)\b/) || has(/\bas\s+(?:big|large|small|wide|tall)\s+as\b/) || has(/\b(?:match|matching)\s+(?:the\s+)?(?:sizes?|colou?rs?)\b/)) && may(['equalize', 'set', 'resize', 'arrange', 'improve'])) return 'equalize';
  if (!has(/\bsort\s+out\b/) && (has(/\b(?:sort|alphabeti[sz]e)\b/) || has(/\b(?:order|rank)\s+(?:[\w']+\s+){0,4}?by\b/) || has(/\balphabetic(?:al)?(?:ly)?\b/) || has(/\b(?:biggest|largest|smallest|tiniest)\s+first\b/) || has(/\bby\s+(?:their\s+)?(?:names?|sizes?|labels?)\b/)) && may(['sort', 'arrange', 'align', 'move', 'set', 'improve', 'distribute'])) return 'sort';
  if ((has(/^\s*cluster\b/) || has(/\bcluster\s+(?:\w+\s+){0,4}?by\b/) || has(/\b(?:group|gather|bunch|collect|cluster|arrange|organi[sz]e|lay\s+out|put|keep|sort\s+out)\b[\s\S]*\bby\s+(?:their\s+)?(?:colou?rs?|shapes?|kinds?|types?)\b/) || has(/\b(?:same|like)\s+colou?rs?\s+together\b/) || has(/\bcolou?rs?\s+together\b/)) && may(['groupBy', 'group', 'arrange', 'move', 'set', 'improve'])) return 'groupBy';
  if ((has(OPS_MORE) || has(OPS_LESS) || has(/\b\d+\s*(?:px|pixels?)\s+apart\b/)) && may(['respace', 'distribute', 'arrange', 'set', 'create', 'move', 'resize', 'improve', 'toFront'])) return 'respace';
  if ((has(/\b(?:equal|even|same)\s+(?:spacing|gaps?|distances?)\b/) || has(/\b(?:gaps?|spacing|distances?)\s+(?:\w+\s+)?(?:equal|even)\b/) || has(/\beven\s+(?:[\w']+\s+){0,2}?out\b/)) && may(['distribute', 'set', 'arrange', 'improve'])) return 'distribute';
  if ((has(/^\s*(?:re-?)?cent(?:er|re)\b/) || has(/\bfit\b/) || has(/\b(?:into|in)\s+view\b/) || has(/\boff[\s-]+(?:the\s+)?(?:canvas|screen|page)\b/) || has(/\bback\s+(?:on|onto|into)\s+(?:the\s+)?(?:canvas|screen|page)\b/) || has(/\bcent(?:er|re)\s+(?:the\s+)?(?:whole\s+|entire\s+)?(?:diagram|drawing|everything|layout|picture|chart|graph)\b/)) && may(['fit', 'move', 'set', 'toFront', 'arrange', 'resize'])) return 'fit';
  if ((has(/\b(?:flip|mirror)\b/) || (has(/\bupside[\s-]+down\b/) && !OPS_LINK_LAYOUT.test(s))) && may(['flip', 'set', 'move', 'arrange'])) return 'flip';
  if (act === 'align' && has(/\b(?:left|right|top|bottom)\s+(?:edges?|sides?)\b|\b(?:their|the)\s+(?:tops|bottoms)\b|\b(?:left|right|top|bottom)[\s-]+align(?:ed)?\b|\balign\w*\s+(?:[\w⟦⟧,]+\s+){0,6}?(?:to\s+the\s+|on\s+the\s+|at\s+the\s+|along\s+the\s+)?(?:left|right|top|bottom)\b/)) return 'align';
  const lay = opsLayoutOf(s);
  if (act == null && has(/^\s*(?:grid|row|column|circle|ring|tree|radial|organic|layers?|flow(?:chart)?)(?:\s+(?:layout|view|style|please|pls|plz|thanks))*\s*$/)) return 'arrange';   /* "grid pls" */
  if (act == null && has(/^\s*stack\b/)) return 'arrange';                                                                 /* "stack them" */
  if (act == null && has(/^\s*lay\s+(?:[\w']+\s+){1,3}?out\b/)) return 'arrange';                                          /* "lay it out" */
  if (act == null && has(/^\s*line\s+(?:[\w']+\s+){1,3}?up\b/)) return 'align';                                             /* "line everything up" */
  if (['move', 'set'].includes(act) && has(/\b(?:put|place|make|turn|set)\s+(?:it|them|this|these|those|everything|all(?:\s+of\s+them)?|the\s+(?:[\w-]+\s+){0,2}?[\w-]+s)\s+(?:in|into|as)?\s*(?:an?\s+|one\s+)?(?:row|line|column|stack|grid|circle|ring)\b/)) return 'arrange';   /* "put them in a grid", "make it a grid" */
  if (has(OPS_IMPROVE) && !(lay && OPS_LINK_LAYOUT.test(s)) && may(['improve', 'arrange', 'set', 'resize', 'move', 'delete', 'sort'])) return lay ? 'arrange' : 'improve';
  if (lay && OPS_LINK_LAYOUT.test(s) && opsSkipTemplate(t) && may(['arrange', 'set', 'move', 'improve', 'resize'])) return 'arrange';
  if (act == null && (lay || opsDirection(t, true) || has(/\b(?:auto[\s-]?(?:layout|arrange)|automatic(?:ally)?\s+(?:layout|arrange))\b/))) return 'arrange';
  if (has(/\b(?:auto[\s-]?(?:layout|arrange)|re-?layout|automatic(?:ally)?\s+(?:layout|arrange|lay\s+out))\b/) && may(['arrange', 'set', 'improve'])) return 'arrange';
  return null;
}
/** the parameters of the operations, from the clause's words (raw: the clause as written; rest: the words left, lower case) */
function opsArgs(C, action, raw) {
  const r = ' ' + raw.toLowerCase().replace(/[’']/g, "'") + ' ', has = re => re.test(r), drop = (...ks) => ks.forEach(k => { delete C.args[k]; });
  if (C.restyle) {
    { const st = [...r.matchAll(/\b(dash(?:ed|es)?|dotted|dot\s+(?:line|style)|solid)\b/g)].pop(); if (st) C.args.style = /^dash/.test(st[1]) ? 'dashed' : st[1] === 'solid' ? 'solid' : 'dotted'; else drop('style'); }   /* the last style word: "make the dashed arrow solid" */
    if (has(/\b(?:two[\s-]way|bidirectional|both\s+(?:ways|ends|directions|sides)|double[\s-]headed|two\s+(?:arrow\s*)?heads|heads?\s+(?:at|on)\s+both)\b/)) C.args.arrow = 'both';
    else if (has(/\b(?:remove|delete|drop|take\s+off|get\s+rid\s+of|lose|no)\s+(?:the\s+|its\s+|their\s+|any\s+|all\s+(?:the\s+)?)?arrow\s*heads?\b|\bheadless\b|\bplain\s+lines?\b|\bundirected\b|\bjust\s+(?:a\s+)?lines?\b|\bwithout\s+(?:an?\s+|the\s+)?(?:arrow\s*heads?|arrows?)\b|\bno\s+arrows?\b/)) C.args.arrow = 'none';
    else if (has(/\b(?:one[\s-]way|single[\s-]headed|add\s+(?:an?\s+|the\s+)?arrow\s*heads?|put\s+(?:an?\s+|the\s+)?arrow\s*heads?|with\s+an?\s+arrow\s*head)\b/)) C.args.arrow = 'forward';
    else drop('arrow');
    if (action === 'set') { if (has(/\b(?:very|extra|really|super)\s+(?:thick|bold|heavy)\b/)) C.args.size = 'huge'; else if (has(/\b(?:thick|bold|heavy|fat)\b/)) C.args.size = 'large'; else if (has(/\b(?:thin|fine|hairline|skinny)\b/)) C.args.size = 'small'; else if (has(/\b(?:normal|regular|default)\s+(?:width|thickness)\b/)) C.args.size = 'medium'; else drop('size'); }
    else drop('size');
    /* no ends: every arrow (kind=edge); but "this / that arrow" is a reference the context fills: no kind, so the engine asks which one */
    if (C.args.from == null && C.args.to == null && !new RegExp(`\\b(?:this|that)\\s+(?:${OPS_EDGE})\\b`).test(r)) { C.args.kind = 'edge'; if (has(/\b(?:all|every|each)\b/)) C.args.quantifier = 'all'; }
    drop('target', 'shape', 'label', 'position', 'anchor', 'position2', 'anchor2', 'region', 'pairing', 'scale', 'distance');
    return;
  }
  const layoutOf = () => { const m = r.match(/\b(?:in|into|as)\s+(?:a\s+|one\s+)?(row|line|column|stack|grid|circle|ring)\b/); return m ? ({ line: 'row', stack: 'column', ring: 'circle' })[m[1]] || m[1] : null; };
  switch (action) {
    case 'arrange': {
      const lay = opsLayoutOf(r); if (lay && ['tree', 'layers', 'radial', 'organic'].includes(lay)) C.args.layout = lay;
      const linky = ['tree', 'layers'].includes(C.args.layout), d = C.args.layout === 'radial' || C.args.layout === 'organic' || C.args.layout === 'circle' || C.args.layout === 'grid' ? null : opsDirection(raw, !linky);
      if (d) C.args.direction = d;
      if (linky || C.args.direction) drop('axis');
      if (['tree', 'layers', 'radial', 'organic'].includes(C.args.layout) || C.args.direction) drop('position', 'region', 'position2', 'anchor2', 'shape', 'size', 'color');
      break;
    }
    case 'respace': {
      const lot = has(/\b(?:much|a\s+lot|way|lots|far)\s+(?:more|further|farther|wider|closer|less|tighter)\b|\b(?:double|twice)\b|\bhalf\b|\bhalve\b/);
      const bit = has(/\b(?:a\s+(?:bit|little|touch|tad)|slightly|somewhat)\b/);
      /* comparison: bigger = more space, smaller = less; scale only for an amount word (a lot / double: 2, a bit: 1.25, half: 0.5) */
      drop('scale', 'comparison');
      const less = OPS_LESS.test(r) || (!OPS_MORE.test(r) && has(/\b(?:shrink|smaller|less|half|halve)\b/));
      if (less) C.args.comparison = 'smaller'; else if (OPS_MORE.test(r) || C.args.distance == null) C.args.comparison = 'bigger';
      if (lot) C.args.scale = less ? 0.5 : 2; else if (bit) C.args.scale = less ? 0.8 : 1.25;
      drop('axis', 'layout', 'position', 'region', 'size', 'shape');
      break;
    }
    case 'fit': if (has(/\b(?:re-?)?cent(?:er|re)(?:d|s|ing)?\b|\bmiddle\b/)) C.args.position = 'center'; else drop('position'); drop('region', 'anchor', 'size', 'scale', 'layout'); break;
    case 'flip':
      if (has(/\bvertical(?:ly)?\b|\bupside[\s-]+down\b|\btop\s+(?:to|and|for)\s+bottom\b|\bbottom\s+(?:to|and)\s+top\b|\bup\s+(?:and|to)\s+down\b/)) C.args.axis = 'vertical';
      else if (has(/\bhorizontal(?:ly)?\b|\bleft\s+(?:to|and|for)\s+right\b|\bright\s+(?:to|and)\s+left\b|\bside\s+to\s+side\b|\bsideways\b/)) C.args.axis = 'horizontal';
      else drop('axis');
      drop('position', 'region', 'layout', 'direction'); break;
    case 'sort': {
      if (has(/\balphabet|\bby\s+(?:their\s+)?names?\b|\ba\s*(?:-|to)\s*z\b/)) C.args.property = 'name';
      else if (has(/\bby\s+(?:their\s+)?colou?rs?\b/)) C.args.property = 'color';
      else if (has(/\bby\s+(?:their\s+)?sizes?\b|\b(?:biggest|largest|smallest|tiniest)\s+first\b|\b(?:small|big|large)(?:est)?\s+to\s+(?:big|large|small)(?:est)?\b/)) C.args.property = 'size';
      else if (has(/\bby\s+(?:their\s+)?(?:shapes?|kinds?|types?)\b/)) C.args.property = 'shape';
      else if (has(/\bby\s+(?:their\s+)?(?:labels?|texts?)\b/)) C.args.property = 'label';
      if (has(/\b(?:biggest|largest)\s+first\b|\bdescending\b|\b(?:big|large)(?:st|r)?\s+to\s+small/)) C.args.superlative = 'biggest'; else if (has(/\b(?:smallest|tiniest)\s+first\b/)) C.args.superlative = 'smallest'; else drop('superlative');
      const l = layoutOf(); if (l) C.args.layout = l; else drop('layout');
      drop('axis', 'size', 'color', 'shape', 'position', 'region'); break;
    }
    case 'groupBy':
      if (has(/\bcolou?rs?\b/)) C.args.property = 'color'; else if (has(/\b(?:shapes?|kinds?|types?)\b/) && has(/\bby\s+(?:their\s+)?(?:shapes?|kinds?|types?)\b/)) C.args.property = 'shape'; else if (has(/\bsizes?\b/)) C.args.property = 'size';
      drop('layout', 'axis', 'color', 'shape', 'size', 'position', 'region'); break;
    case 'equalize': {
      const m = r.match(/\bsame\s+(size|colou?r|shape|outline|border|width|height)s?\b/) || r.match(/\b(?:match|matching|equali[sz]e|unify)\s+(?:the\s+|their\s+)?(size|colou?r|shape|outline|border)s?\b/) || r.match(/\b(size|colou?r|shape|outline|border)s?\s+(?:all\s+)?the\s+same\s*(?:$|[,.!?]|\b(?:please|pls|as|too)\b)/);
      if (m) C.args.property = ({ colour: 'color', border: 'outline', width: 'size', height: 'size' })[m[1]] || m[1]; else if (has(/\bas\s+(?:big|large|small|wide|tall)\s+as\b/)) C.args.property = 'size';
      drop('size', 'scale', 'layout', 'position', 'region'); if (C.args.property !== 'color') drop('color'); if (C.args.property !== 'shape') drop('shape'); break;
    }
    case 'align': {
      const m = r.match(/\b(left|right|top|bottom)s?\b|\b(tops|bottoms)\b/);
      if (m) { C.args.direction = ({ left: 'left', right: 'right', top: 'up', bottom: 'down', tops: 'up', bottoms: 'down' })[m[1] || m[2]]; drop('axis', 'position', 'region'); }
      break;
    }
    case 'reverse':
      if (C.args.from != null && C.args.to == null && !has(/\bfrom\b/)) { C.args.target = C.args.from; drop('from'); }   /* "the arrows at Hub": every arrow touching Hub */
      if (C.args.from == null && C.args.to == null && C.args.target == null && has(/\b(?:all|every|each)\b/)) C.args.quantifier = 'all'; drop('shape', 'color', 'size', 'position', 'region', 'arrow', 'style'); break;
    case 'snap': drop('layout', 'position', 'region', 'axis'); break;
    case 'straighten': case 'untangle': if (C.args.position === 'between' && C.args.anchor != null) { C.args.target = C.args.anchor; drop('anchor'); }   /* "the arrows between Start and Done" */
      // fall through
    case 'improve': drop('layout', 'position', 'region', 'axis', 'scale', 'shape', 'size', 'color'); break;
  }
}
/** a clause without a verb cue: an operation only when it is short and not a remark ("Ugh, messy.", "That's the main flow.",
 *  "I'm drawing the family tree for grandma" are not requests; "tree layout pls", "left to right", "less clutter" are) */
function opsVerbless(t, colorRe) {
  const s = ' ' + t + ' ';
  const strong = /\b(?:clean\s+(?:\w+\s+){0,2}up|tidy|neaten|declutter|untangle|straighten|snap|flip|mirror|sort|cent(?:er|re)|fit|arrange|layout|lay\s+(?:\w+\s+){0,2}out|reverse|line\s+(?:\w+\s+){0,2}up)\b/i.test(s);
  if (!strong && /\b(?:i'?m|i\s+am|we'?re|we\s+are|it'?s|that'?s|this\s+is|it\s+is|there'?s|was|were|getting|got|looks?|seems?|feels?|ugh|hmm+|lol|my|our)\b/i.test(s)) return null;
  if (s.trim().split(/\s+/).length > 14) return null;
  const rs = opsRestyle(t, null, colorRe); if (rs) return { action: rs, restyle: true };
  const a = opsAction(strong || /\b(?:fix|sort\s+out|less)\b/i.test(s) ? s : s.replace(/\b(?:messy|mess|chaotic|chaos|cluttered|spaghetti)\b/gi, ' '), null);
  return a ? { action: a } : null;
}
const OPS_WHOLE = /\b(?:(?:the|this|my|our)\s+(?:whole\s+|entire\s+|full\s+)?(?:diagram|canvas|drawing|chart|picture|page|graph|sketch)|the\s+whole\s+(?:thing|lot)|the\s+lot|all\s+of\s+(?:it|them)|it\s+all|for\s+all|all(?!\s+(?:over|the\s+(?:arrows?|lines?|links?|connections?|connectors?|edges?|wires?)|arrows?|lines?|links?|connections?|connectors?|edges?|wires?)\b))\b/i;
const OPS_WHOLE_FIT = /\b(?:(?:the|this|my|our)\s+(?:whole\s+|entire\s+|full\s+)?(?:diagram|drawing|chart|picture|graph|sketch)|the\s+whole\s+(?:thing|lot)|the\s+lot|all\s+of\s+(?:it|them)|it\s+all|for\s+all|all)\b/i;
/** names masked for the ops readers ("group A and B as Flow": Flow is a name, not a layout word); nameIndex: the formalizer's names */
const opsMaskWith = (t, nameIndex) => t.replace(/\b(as|named|called|into|to)\s+([A-Z][\w-]*)/g, (m, p) => p + ' Xname').replace(/[A-Za-z_][\w-]*/g, w => /^[A-Z]/.test(w) && nameIndex.has(w.toLowerCase()) && !/^(?:LR|RL|TD|TB|BT)$/.test(w) ? 'Xname' : w);
const OPS_WHOLE_ACTIONS = ['arrange', 'improve', 'respace', 'snap', 'flip', 'sort', 'groupBy', 'equalize', 'straighten', 'untangle', 'fit', 'align', 'distribute'];

//@@ CLAUSE_TEMPLATE_GUARD  (replaces `      if (templateClause(t.trim(), isQ)) return;`)
      /* the clause for the ops readers: known shape and group names masked ("group A and B as Flow": Flow is a name, not a layout word),
         and so are the new names a group / rename / create declares */
      t = t.replace(/([A-Za-z0-9_])\s*(?:->|→)\s*([A-Za-z_])/g, '$1 → $2');   /* "Process->Check": the arrow between two names */
      const tOps = opsMask(t);
      if (!(!isQ && opsSkipTemplate(tOps)) && templateClause(t.trim(), isQ)) return;   // a diagram template (timeline, pyramid, heart, ...); a re-layout by the links is not one

//@@ CLAUSE_VERBLESS  (inserted before `        else { F.notes.push(\`I couldn't find an action in`)
        else if (!isQ && opsVerbless(tOps, colorRe)) { const v = opsVerbless(tOps, colorRe); action = v.action; if (v.restyle) C.restyle = true; }   /* "Start-Done line red", "tree layout pls", "left to right", "less clutter" */

//@@ CLAUSE_ACTION  (inserted before `      const isCmd = kind === 'command';`)
      if (kind === 'command' && action && !['undo', 'redo', 'forget'].includes(action)) {   /* high-level layout operations, arrow restyling (HIGH_LEVEL_OPS.md) */
        const rs = opsRestyle(tOps, action, colorRe);
        if (rs) { action = rs; C.restyle = true; } else { const oa = opsAction(tOps, action); if (oa) action = oa; }
      }

//@@ CLAUSE_ROOT  (inserted before `      // ---- roles that use prepositions ----`)
      // ---- the root / centre of a re-layout, the model of "the same … as X", "the whole diagram" (HIGH_LEVEL_OPS.md) ----
      if (isCmd && action === 'arrange') {
        const ROOT = new RegExp(`\\b(?:with|and|having|keep(?:ing)?|put(?:ting)?)\\s+(?:the\\s+)?${M}\\s+(?:as\\s+(?:the\\s+)?(?:root|top|head|hub|cent(?:er|re)|start|source|origin)|at\\s+the\\s+(?:top|root|head|cent(?:er|re)|middle|left|start|core)|on\\s+top|in\\s+the\\s+(?:cent(?:er|re)|middle))\\b|\\b(?:rooted\\s+(?:at|in|on)|starting\\s+(?:from|at|with)|beginning\\s+(?:from|at|with)|from|around|cent(?:er|re)d\\s+(?:on|at|around)|root(?:ed)?\\s*(?:=|:|is|being)?)\\s+(?:the\\s+)?${M}|\\b${M}\\s+(?:as\\s+(?:the\\s+)?(?:root|hub|cent(?:er|re)|top)|at\\s+the\\s+(?:top|root|cent(?:er|re)|middle|left)|in\\s+the\\s+(?:cent(?:er|re)|middle)|on\\s+top)\\b`, 'i');
        take(ROOT, m => { const i = m[1] || m[2] || m[3]; C.args.anchor = markVals([+i]); });
      }
      if (isCmd && action === 'equalize') take(new RegExp(`\\b(?:as|like|to\\s+match|matching)\\s+${M}`, 'i'), m => { C.args.anchor = markVals([+m[1]]); });
      if (isCmd && OPS_WHOLE_ACTIONS.includes(action) && !refsIn(C.t).length && !C.restyle) take(action === 'fit' ? OPS_WHOLE_FIT : OPS_WHOLE, () => { C.t += ' ' + mark(mention(true, '', null)); });

//@@ CLAUSE_EDGE_ENDS  (replaces `      if (action === 'connect' || action === 'disconnect' || ask === 'path') {`)
      if (action === 'connect' || action === 'disconnect' || ask === 'path' || C.restyle || action === 'reverse') {

//@@ CLAUSE_ARGS  (inserted after the line `      if (action === 'disconnect' && !C.args.from && /\b(all|every|everything)\b/.test(rest)) C.args.quantifier = 'all';`)
      if (isCmd && (C.restyle || ['arrange', 'improve', 'respace', 'snap', 'flip', 'reverse', 'sort', 'groupBy', 'equalize', 'straighten', 'untangle', 'fit', 'align'].includes(action))) opsArgs(C, action, raw);


//@@ SENTENCE_TEMPLATE_GUARD  (replaces `templateOf(' ' + p + ' ') ? [TPL_PART + p]` in the sentence loop)
templateOf(' ' + p + ' ') && !opsSkipTemplate(opsMask(p)) ? [TPL_PART + p]

//@@ FORMALIZER_MASK  (inserted after `    const TPL_PART = '\u0001';`)
    const opsMask = t => opsMaskWith(t, nameIndex);   /* the clause text for the ops readers (READER_HELPERS) */
