/* Help, SOP language and Capabilities: the three reference tabs of the ⋮ sheet.
   Every list here (shape kinds, colours, sizes, line styles, arrow heads, positions, actions, questions, SOP keys and values,
   capabilities) is read at run time from the engine's legend and plugins (docs/js/logic.js), so the reference cannot drift from what the
   engine does. The prose, the example sentences and the drawings around those lists are written here. A legend value without a
   description here is still listed (with its cue words), so a new action or value shows up even before anyone documents it.
   Every example sentence is meant to work with the Rules reader on the drawing the page opens with (Start, Process, Check, Done);
   an example with `pre` needs the sentences in `pre` first (they are shown next to it). */
(function (root) {
'use strict';
const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NS = 'http://www.w3.org/2000/svg';
const words = v => String(v).replace(/([A-Z])/g, ' $1').toLowerCase();
const listing = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const GROUP_PRE = ['Group Start and Process as Intake'];

/* ---------------- what each action and question is, in plain words ---------------- */
const ACTIONS = {
  create: { t: 'Draw', d: 'Add one or more shapes (up to 12 at once). Say the kind, colour, size, name, label and place you want; whatever you leave out gets a default: a medium white circle in a free spot, named circle1, circle2…', ex: ['Draw a red circle named Hub in the center', 'Add three small squares in a row below Process', 'Draw a gold star named Gem with a black outline in the top right'] },
  delete: { t: 'Delete', d: 'Remove shapes together with their arrows.', ex: ['Delete Done', 'Delete the yellow diamond', 'Clear the canvas'] },
  duplicate: { t: 'Copy', d: 'Make copies next to the original, with the same look.', ex: ['Copy Check', 'Duplicate Done twice'] },
  move: { t: 'Move', d: 'Put a shape next to another one, in a part of the canvas, at x,y coordinates, or a distance in a direction (80 pixels if you give no distance).', ex: ['Move Done to the top right', 'Move Done left by 100', 'Put Done between Start and Check'] },
  swap: { t: 'Swap', d: 'Two shapes trade places.', ex: ['Swap Start and Done'] },
  set: { t: 'Change', d: 'Change the colour, the kind of shape, the size or the outline. “all” changes every shape that fits.', ex: ['Make Done red', 'Turn Done into a star', 'Give Process a red outline', 'Make all circles red'] },
  resize: { t: 'Resize', d: 'Make a shape bigger or smaller. “Bigger” alone means one and a half times; you can also say a factor or a size name.', ex: ['Make Process bigger', 'Shrink Start', 'Make Check twice as big'] },
  label: { t: 'Label', d: 'Write text inside a shape. Put the text in quotes. Long text is shortened with “…” to fit.', ex: ['Label Done "finish"'] },
  rename: { t: 'Rename', d: 'Give a shape (or a group) a new name. Arrows stay attached.', ex: ['Rename Done to End'] },
  connect: { t: 'Connect', d: 'Draw arrows or lines between shapes. One shape can connect to several at once, and a list can be joined as a chain.', ex: ['Connect Start to Done with a dashed arrow', 'Connect Start to Process, Check and Done', 'Connect Start, Check and Done in a chain'] },
  disconnect: { t: 'Disconnect', d: 'Remove the arrows between two shapes, all arrows of one shape, or every arrow.', ex: ['Disconnect Start from Process', 'Remove all connections'] },
  align: { t: 'Align', d: 'Put shapes on one horizontal line (the default) or one vertical line, without overlapping.', ex: ['Align Start, Process and Check', 'Align Check and Done vertically'] },
  distribute: { t: 'Space evenly', d: 'Keep the first and last shape where they are and space the others evenly between them (needs three or more).', ex: ['Distribute the shapes evenly'] },
  arrange: { t: 'Arrange', d: 'Lay shapes out as a row, a column, a grid or a circle.', ex: ['Arrange everything in a circle', 'Arrange everything in a grid'] },
  toFront: { t: 'Bring to front', d: 'Draw a shape on top of the ones it overlaps.', ex: ['Bring Start to the front'] },
  toBack: { t: 'Send to back', d: 'Draw a shape behind the ones it overlaps.', ex: ['Send Process to the back'] },
  group: { t: 'Group', d: 'Give several shapes one name. The group then moves, copies, aligns and is deleted as one block, and its name works anywhere a shape name does. A dashed frame shows it.', ex: GROUP_PRE.slice() },
  ungroup: { t: 'Ungroup', d: 'Dissolve a group (its shapes stay), or take one shape out of its group.', ex: [{ text: 'Ungroup Intake', pre: GROUP_PRE }] },
  undo: { t: 'Undo', d: 'Step back one change. The arrow buttons above the drawing do the same.', ex: ['Undo'] },
  redo: { t: 'Redo', d: 'Put back what undo took away.', ex: [{ text: 'Redo', pre: ['Make Done red', 'Undo'] }] },
  forget: { t: 'Forget the rules', d: 'Drop every “from now on” rule.', ex: [{ text: 'Forget the rules', pre: ['From now on, circles are orange'] }] }
};
/* requests that are not an action: a rule for new shapes, and a statement of fact (wire types `rule` and `fact`) */
const WIRE_ITEMS = {
  rule: { t: 'Rules for new shapes', d: '“From now on …” sets a default for shapes drawn later. It fills in only what you leave out, and it does not change shapes already drawn.', ex: ['From now on, circles are orange', 'From now on, new shapes are small and purple'] },
  fact: { t: 'Statements', d: 'A sentence that says how things are is treated as a wish: if it is already true nothing changes; if not, the drawing is changed until it is true.', ex: ['Check is above Process', 'Done is red', 'Done is connected to Start'] }
};
const ACTION_GROUPS = [
  ['Draw, copy, delete', ['create', 'duplicate', 'delete']],
  ['Move and swap', ['move', 'swap']],
  ['Change how it looks', ['set', 'resize', 'label', 'rename']],
  ['Arrows and lines', ['connect', 'disconnect']],
  ['Tidy up', ['align', 'distribute', 'arrange', 'toFront', 'toBack']],
  ['Groups', ['group', 'ungroup']],
  ['Rules and statements', ['rule', 'forget', 'fact']],
  ['Undo', ['undo', 'redo']]
];
const ASKS = {
  count: { t: 'How many', ex: ['How many circles are there?', 'How many connections are there?', 'How many groups are there?'] },
  list: { t: 'Which ones', ex: ['Which shapes are green?', 'Which shapes are below Start?', 'Which circles are not blue?'] },
  exists: { t: 'Is there…', ex: ['Is there a red shape?', 'Are there any stars?'] },
  property: { t: 'What colour, where, how big, what text', ex: ['What color is Check?', 'Where is Done?', 'How big is Start?', 'What does Process say?'] },
  check: { t: 'Yes-or-no checks', ex: ['Is Check above Done?', 'Is Done a green circle?', 'Is Start bigger than Done?'] },
  describe: { t: 'Describe', ex: ['Describe Check', 'Describe the diagram'] },
  neighbors: { t: 'What is it connected to', ex: ['What is connected to Check?'] },
  connected: { t: 'Are two shapes connected', d: 'Only a direct arrow or line counts; for a route through other shapes ask for a path.', ex: ['Are Start and Done connected?'] },
  degree: { t: 'How many connections', ex: ['How many connections does Check have?'] },
  path: { t: 'Is there a path', d: 'Follows the arrows in their direction (two-way arrows and plain lines go both ways) and shows the route.', ex: ['Is there a path from Start to Done?'] },
  reachable: { t: 'What can be reached', ex: ['What can be reached from Process?'] },
  cycle: { t: 'Are there cycles', d: 'A cycle is a loop of one-way arrows that leads back to where it started.', ex: ['Are there any cycles?'] },
  nearest: { t: 'Closest and farthest', ex: ['Which shape is closest to Start?', 'Which shape is farthest from Start?'] },
  extreme: { t: 'Biggest, leftmost, most connected…', ex: ['Which shape is the biggest?', 'Which shape is the leftmost?', 'Which shape has the most connections?'] },
  members: { t: 'What is in a group', ex: [{ text: 'What is in Intake?', pre: GROUP_PRE }] },
  groupOf: { t: 'Which group', ex: [{ text: 'Which group is Start in?', pre: GROUP_PRE }] },
  rules: { t: 'Which rules are on', ex: [{ text: 'What rules are there?', pre: ['From now on, circles are orange'] }] }
};

/* ---------------- capabilities (the engine's plugins) in plain words ---------------- */
const CAPS = {
  core: { t: 'Pointing at shapes', d: 'Lets you name shapes by what they look like instead of by name: “the green circle”, “all squares”, “the newest star”. When a description fits more than one shape, the reply asks which one you mean and offers buttons.', ex: ['Make the green circle bigger', 'Make all circles red'], off: 'It cannot be switched off: every other capability needs it.' },
  history: { t: 'Undo and redo', d: 'Steps back through your changes and forward again. The arrow buttons above the drawing use it too.', ex: ['Undo', { text: 'Redo', pre: ['Make Done red', 'Undo'] }] },
  shapes: { t: 'Shapes', d: 'Drawing, deleting, moving, copying, swapping, recolouring, resizing, labelling and renaming shapes, and placing them by position.', ex: ['Draw a red circle named Hub in the center', 'Move Done to the top right', 'Turn Done into a star'] },
  groups: { t: 'Groups', d: 'Several shapes under one name, handled as one block.', ex: GROUP_PRE.concat([{ text: 'Move Intake to the bottom right', pre: GROUP_PRE }]) },
  connections: { t: 'Arrows and lines', d: 'Connecting and disconnecting shapes, with a line style, arrow heads, a colour and a label.', ex: ['Connect Start to Done with a dashed arrow', 'Disconnect Start from Process'] },
  layout: { t: 'Tidying up', d: 'Aligning, spacing evenly, arranging as a row, column, grid or circle, and bringing to the front or sending to the back.', ex: ['Arrange everything in a circle', 'Align Start, Process and Check'] },
  queries: { t: 'Questions about the drawing', d: 'Answers questions by looking at the drawing: how many, which, where, what colour, what is connected, biggest, closest, and so on.', ex: ['How many circles are there?', 'Describe Check', 'Which shape is the biggest?'] },
  reasoning: { t: 'Paths and cycles', d: 'Follows the arrows from shape to shape to answer whether there is a path, what can be reached and whether there are loops.', ex: ['Is there a path from Start to Done?', 'Are there any cycles?'] },
  logic: { t: 'Answers checked by logic (Datalog)', d: 'A second way to answer questions. The drawing is written as logical facts, such as color(Done, green) and above(Check, Done), and your question as a query over those facts; a small logic engine (Datalog) solves it. Under “details” you can read the facts and the query.', ex: ['Which shapes are below Start?', 'Is Check above Done?'], off: 'The plain question code answers instead, so the answers should stay the same: switching it off is a way to check that both give the same answer.' },
  rules: { t: 'Rules for new shapes', d: '“From now on …” defaults for shapes drawn later, and forgetting them.', ex: ['From now on, circles are orange', { text: 'What rules are there?', pre: ['From now on, circles are orange'] }] },
  facts: { t: 'Statements', d: 'Sentences that say how things are (“Check is above Process”): if already true nothing changes, otherwise the drawing is changed until it is true.', ex: ['Check is above Process', 'Done is red'] }
};

/* ---------------- the SOP keys, grouped by what they are for, each with one English example ---------------- */
const KEY_GROUPS = [
  ['What to do', 'The kind of request.', ['action', 'ask', 'property', 'kind', 'superlative', 'comparison']],
  ['Which shapes', 'Who the request is about.', ['target', 'name', 'quantifier', 'count', 'recency', 'notColor', 'linked', 'members']],
  ['How it looks', '', ['shape', 'color', 'size', 'scale', 'outline', 'label']],
  ['Where', '', ['position', 'anchor', 'at', 'direction', 'distance']],
  ['Arrows and lines', '', ['from', 'to', 'style', 'arrow', 'pairing']],
  ['Layout', '', ['axis', 'layout']]
];
const KEY_EX = {
  action: 'Make Done red', ask: 'How many circles are there?', property: 'What color is Check?', kind: 'How many connections are there?',
  superlative: 'Which shape is the leftmost?', comparison: 'Is Start bigger than Done?', target: 'Delete Done', name: 'Rename Done to End',
  quantifier: 'Make all circles red', count: 'Add three small squares in a row below Process', recency: 'Delete the newest circle',
  notColor: 'Which circles are not blue?', linked: 'Done is connected to Start', shape: 'Turn Done into a star', color: 'Make Done red',
  size: 'Make Start small', scale: 'Make Check twice as big', outline: 'Give Process a red outline', label: 'Label Done "finish"',
  position: 'Draw a tiny orange triangle named T1 next to Start', anchor: 'Draw a tiny orange triangle named T1 next to Start',
  at: 'Draw a circle named Hub at 400, 250', direction: 'Move Done left by 100', distance: 'Move Done left by 100',
  from: 'Connect Start to Done', to: 'Connect Start to Done', style: 'Connect Start to Done with a dashed arrow',
  arrow: 'Connect Start and Check with a two-way arrow', pairing: 'Connect Start, Check and Done in a chain',
  axis: 'Align Check and Done vertically', layout: 'Arrange everything in a circle'
};
const KIND_WORDS = { enum: 'one of these values', names: 'one or more shape names, or $id of another wire', name: 'a name', number: 'a number', text: 'text, in quotes when it has spaces', point: 'x,y in pixels' };
const WIRE_WORDS = {
  command: 'A request to change the drawing: “Make Done red”.',
  question: 'A question; it never changes the drawing: “Is there a path from Start to Done?”',
  fact: 'A statement of how things are; if it is not true yet, the drawing is changed until it is: “Check is above Process”.',
  rule: 'A default for shapes drawn from now on: “From now on, circles are orange”.',
  mention: 'A description that points at existing shapes: “the green circle” in “make the green circle bigger”.'
};
const NAMES_ON_START = ['Start', 'Process', 'Check', 'Done', 'Intake'];

/* every clickable example, for the test (training-free check that each one works with the Rules reader) */
function examples() {
  const out = [], add = e => out.push(typeof e === 'string' ? { text: e, pre: [] } : { text: e.text, pre: e.pre || [] });
  Object.values(ACTIONS).concat(Object.values(WIRE_ITEMS), Object.values(ASKS), Object.values(CAPS)).forEach(x => x.ex.forEach(add));
  Object.values(KEY_EX).forEach(add);
  add(WORKED[0]); add(WORKED[1]);
  return out.filter((e, i) => out.findIndex(o => o.text === e.text && o.pre.join('|') === e.pre.join('|')) === i);
}
const WORKED = ['Draw a small red star named Gem below Check and connect Check to Gem with a dashed arrow', 'Is the green circle below Check?'];

/* ---------------- small pieces ---------------- */
function say(e) {
  const x = typeof e === 'string' ? { text: e, pre: [] } : e;
  return `<span class="hsay"><button type="button" class="say" data-quick="${escH(x.text)}" title="Send this message">${escH(x.text)}</button>${x.pre && x.pre.length ? `<span class="pre">after ${x.pre.map(p => `“${escH(p)}”`).join(', then ')}</span>` : ''}</span>`;
}
const says = list => `<div class="says">${list.map(say).join('')}</div>`;
const cuesOf = (q, v) => ((q && q.values && q.values[v]) || []).filter(c => c !== v && c !== v + 's' && c !== v + 'es' && !/…/.test(c));
const alsoText = (q, v, n) => { const c = cuesOf(q, v).filter(c => !/s$/.test(c) || !cuesOf(q, v).includes(c.replace(/e?s$/, ''))).slice(0, n || 4); return c.length ? `also: ${c.join(', ')}` : ''; };
const askOf = (engine, key) => { const q = engine.legend.get(key); if (q && q.ask) return q.ask; for (const p of engine.plugins) if (p.legend && p.legend[key] && p.legend[key].ask) return p.legend[key].ask; return ''; };
const valuesOf = (engine, key) => { const q = engine.legend.get(key); return q && q.values ? Object.keys(q.values) : []; };
const isSpot = v => /^(center|top|bottom|left|right)(Left|Right)?$/.test(v);
/* the capabilities (plugins) whose handlers run a value of action/ask, or a wire type */
function providers(engine, type, key, value) {
  return [...new Set(engine.handlers.filter(h => h.type === type && (key == null || (h.when && (Array.isArray(h.when[key]) ? h.when[key].includes(value) : h.when[key] === value)))).map(h => h.plugin))];
}
const offNote = ps => ps.length && ps.every(p => !p.enabled) ? `<span class="offnote">switched off in Capabilities</span>` : '';

/* drawings: the canvas's own drawing code (ui.js drawShape / drawEdge / drawGroups), into a detached SVG */
function pic(env, vb, fn, label, cls) {
  if (typeof document === 'undefined') return '';
  const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', vb); s.setAttribute('class', 'hsvg' + (cls ? ' ' + cls : ''));
  s.setAttribute('role', 'img'); s.setAttribute('aria-label', label);
  const g = document.createElementNS(NS, 'g'); s.appendChild(g); fn(g, (tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; g.appendChild(e); return e; });
  return s.outerHTML;
}
const shp = (K, o) => Object.assign({ name: '', shape: 'circle', color: 'white', size: K.SIZE_PX.medium, x: 0, y: 0, label: null, outline: null }, o, o.size && typeof o.size === 'string' ? { size: K.SIZE_PX[o.size] } : {});

/* ================================================================== HELP ================================================================== */
function help(env) {
  const { K, engine } = env, L = k => engine.legend.get(k);
  const toc = [['h-what', 'What this is'], ['h-draw', 'Shapes, colours, sizes'], ['h-arrows', 'Arrows and lines'], ['h-where', 'Where things go'], ['h-do', 'Everything you can do'], ['h-ask', 'Everything you can ask'], ['h-read', 'Reading the replies'], ['h-cannot', 'What it cannot do']];
  let h = `<div class="help hdoc"><nav class="htoc" aria-label="Contents">${toc.map(([id, t]) => `<a href="#${id}">${escH(t)}</a>`).join('')}</nav>`;

  /* ---- what this is ---- */
  const nb = env.neuralBytes ? Math.round(env.neuralBytes / 1e6) : null, vb = env.vssBytes ? Math.round(env.vssBytes / 1e6) : null;
  h += `<h3 class="hh" id="h-what">What this is</h3>
  <p>A diagram editor you talk to. You write what you want in plain English, for example <q>draw a red circle named Hub and connect Start to it</q>, and it draws it, changes it, or answers questions about the drawing. The buttons with a sentence on them in this help send that sentence, so you can try each one.</p>
  <p>The page is also an experiment. Three different <b>readers</b> each turn your sentence into the same small command language, <b>SOP</b>. For example, “draw a red circle named Hub” becomes the line <code>command action=create shape=circle color=red name=Hub</code>. One drawing engine then carries out those lines. Each reader keeps its own drawing, so you can see side by side how well each one understood you, and how fast.</p>
  <dl class="readers">
    <dt>Rules</dt><dd>Hand-written code that looks for known words (“draw”, “red”, “below”) and their order. Instant, nothing to download.</dd>
    <dt>VSS</dt><dd>Small models we trained on example messages written for this editor. VSS stands for vector-symbolic: each word becomes a long list of numbers, and the model combines these lists to find the action and its details. Not a transformer. ${vb ? `About ${vb} MB, loaded` : 'Loaded'} from this site when the page opens, and run in your browser.</dd>
    <dt>Neural</dt><dd>Transformer models of the BERT family, the kind of model behind many language tools. One, fine-tuned by us on the same example messages, recognises the kind of request (draw, connect, how many…). A second, ready-made one answers each question SOP asks (“which colour?”, “where does the arrow start?”) by pointing at words in your sentence. ${nb ? `About ${nb} MB, loaded` : 'Loaded'} from this site, kept in your browser’s cache, and run in your browser.</dd>
  </dl>
  <p>Before reading, a message is cut into its requests (“draw a red circle named Hub” and “connect Start to it” are two). The message is cut once and all three readers read the same requests, so the tabs differ only in how each reader understands a request. Three ways of cutting are available at the top of this Help, under <b>Cutting into requests</b>: the Rules segmenter (hand-written: sentences, then a comma or “and” before a verb), the VSS cutter (a small model trained on our annotated messages that marks where each request starts and ends) and the BERT cutter (the same job done by the neural model, once a version that can do it is published). The default is the one that scored best on our test messages. <b>details</b> under a reply shows the requests and how long the cut took.</p>
  <p>Nothing you type leaves your browser. The drawings are not saved: reloading the page starts again from the example drawing.</p>`;
  h += `<p class="note">How it works inside: <a href="architecture.html" target="_blank" rel="noopener">architecture</a></p>`;

  /* ---- what you can draw ---- */
  const kinds = valuesOf(engine, 'shape').filter(v => v !== 'any');
  h += `<h3 class="hh" id="h-draw">What you can draw</h3>
  <h4>${kinds.length} kinds of shape</h4>
  <div class="kinds">${kinds.map(k => { const s = shp(K, { shape: k, color: 'white' }), d = K.dims(s); s.x = d.w / 2 + 4; s.y = d.h / 2 + 4;
    return `<figure>${pic(env, `0 0 ${d.w + 8} ${d.h + 8}`, g => env.drawShape(g, s), k)}<figcaption><b>${escH(k)}</b><span>${escH(alsoText(L('shape'), k, 3))}</span></figcaption></figure>`; }).join('')}</div>
  <p class="note">Any other kind (a cloud, an arrow shape, a cylinder) is not available; the reply says so.</p>`;
  const colors = valuesOf(engine, 'color');
  h += `<h4>${colors.length} colours</h4><div class="swatches">${colors.map(c => `<span class="sw8"><i style="background:${K.COLOR_HEX[c] || 'transparent'}"></i><b>${escH(c)}</b>${alsoText(L('color'), c, 2) ? `<em>${escH(alsoText(L('color'), c, 2).replace(/^also: /, ''))}</em>` : ''}</span>`).join('')}</div>
  <p class="note">Only these names; codes such as #ff8800 are not understood. A shape drawn without a colour is white.</p>`;
  const sizes = valuesOf(engine, 'size');
  { let x = 8; const row = sizes.map(z => { const s = shp(K, { size: z, color: 'blue' }); s.x = x + s.size / 2; x += s.size + 22; s.y = 130 - s.size / 2; return s; });
    h += `<h4>${sizes.length} sizes</h4>${pic(env, `0 0 ${x - 14} 152`, (g, add) => row.forEach((s, i) => { env.drawShape(g, s); add('text', { x: s.x, y: 148, 'text-anchor': 'middle', class: 'hcap' }, sizes[i]); }), 'sizes from ' + sizes[0] + ' to ' + sizes[sizes.length - 1], 'wide')}
    <p class="note">Medium is the default. “Bigger” and “smaller” multiply the size (by 1.5 and by two thirds), and “twice as big” by 2.</p>`; }
  h += `<h4>Outline, label and name</h4>
  ${pic(env, '0 0 420 120', g => {
    env.drawShape(g, shp(K, { name: 'Process', shape: 'rectangle', label: 'Validate', x: 70, y: 66 }));
    env.drawShape(g, shp(K, { name: 'Hub', color: 'teal', outline: 'black', x: 210, y: 66 }));
    env.drawShape(g, shp(K, { name: 'Gem', shape: 'star', color: 'gold', outline: 'red', x: 340, y: 66 }));
  }, 'a rectangle named Process labeled Validate, a teal circle with a black outline, a gold star with a red outline', 'mid')}
  <ul>
    <li><b>Name</b>: the small text above a shape. You use it to point at the shape later. Letters, digits, - and _, starting with a letter; no spaces. Names are not case-sensitive.</li>
    <li><b>Label</b>: text written inside the shape, put in quotes: ${say('Label Done "finish"')}</li>
    <li><b>Outline</b>: a thick border in any of the colours above, or none: ${say('Give Process a red outline')} ${say('Give Process no outline')}</li>
  </ul>`;

  /* ---- arrows ---- */
  const styles = valuesOf(engine, 'style'), heads = valuesOf(engine, 'arrow'), HEADW = { forward: 'arrow (one way)', both: 'two-way arrow', none: 'plain line' };
  h += `<h3 class="hh" id="h-arrows">Arrows and lines</h3>
  <p>A connection always goes between two shapes, as a straight line. You choose its style, its arrow heads, a colour and a label.</p>
  ${pic(env, `0 0 ${110 + styles.length * 150} ${34 + heads.length * 54}`, (g, add) => {
    styles.forEach((st, j) => add('text', { x: 110 + j * 150 + 70, y: 18, 'text-anchor': 'middle', class: 'hcap' }, st));
    heads.forEach((hd, i) => {
      const y = 52 + i * 54; add('text', { x: 4, y: y + 5, class: 'hcap' }, HEADW[hd] || words(hd));
      styles.forEach((st, j) => { const a = shp(K, { size: 'tiny', x: 110 + j * 150 + 16, y }), b = shp(K, { size: 'tiny', x: 110 + j * 150 + 124, y }); env.drawEdge(g, { id: 'x', from: '', to: '', style: st, arrow: hd }, a, b, 0); env.drawShape(g, a); env.drawShape(g, b); });
    });
  }, 'connection styles: ' + styles.join(', ') + '; arrow heads: ' + heads.join(', '), 'wide')}
  <ul>
    <li><b>Styles</b>: ${styles.map(s => `<code>${escH(s)}</code>`).join(', ')}. Solid is the default. ${say('Connect Start to Done with a dashed arrow')}</li>
    <li><b>Heads</b>: ${heads.map(s => `<code>${escH(HEADW[s] || words(s))}</code>`).join(', ')}. One-way arrow is the default; “line” means no heads. ${say('Connect Start and Check with a two-way arrow')} ${say('Connect Done to Start with a dotted line')}</li>
    <li><b>Colour and label</b>: any colour above, and text in quotes written next to the line. ${say('Connect Start to Done with a red arrow labeled "skip"')}</li>
  </ul>
  ${pic(env, '0 0 420 96', g => {
    const a = shp(K, { name: 'A', size: 'small', x: 40, y: 56 }), b = shp(K, { name: 'B', size: 'small', x: 210, y: 56 }), c = shp(K, { name: 'C', size: 'small', x: 380, y: 56 });
    env.drawEdge(g, { id: 'x1', from: 'A', to: 'B', style: 'solid', arrow: 'forward' }, a, b, 0); env.drawEdge(g, { id: 'x2', from: 'B', to: 'C', style: 'solid', arrow: 'forward', label: 'yes' }, b, c, 0);
    [a, b, c].forEach(s => env.drawShape(g, s));
  }, 'a chain A to B to C', 'mid')}
  <p>Several shapes at once: ${escH(listing(valuesOf(engine, 'pairing').map(v => `“${cuesOf(L('pairing'), v)[0] || words(v)}”`)))}. ${say('Connect Start, Check and Done in a chain')} ${say('Connect Start to Process, Check and Done')}</p>
  <p class="note">To change an arrow you already drew (its style, colour or label), disconnect it and connect again; an existing arrow cannot be edited. A shape cannot be connected to itself.</p>`;

  /* ---- where things go ---- */
  const pos = valuesOf(engine, 'position'), rel = pos.filter(v => !isSpot(v)), spots = pos.filter(isSpot), dirs = valuesOf(engine, 'direction');
  h += `<h3 class="hh" id="h-where">Where things go</h3>
  <h4>Next to another shape</h4>
  <p>${rel.map(v => `<code>${escH(words(v))}</code>`).join(', ')}. The new shape goes on that side with a gap, moved a little if the spot is taken. “Near” or “next to” picks a free side.</p>
  ${pic(env, '0 0 440 250', g => {
    const hub = shp(K, { name: 'Hub', color: 'blue', x: 220, y: 128 }); env.drawShape(g, hub);
    [['left of', 110, 128], ['right of', 330, 128], ['above', 220, 42], ['below', 220, 218]].forEach(([n, x, y]) => env.drawShape(g, shp(K, { name: n, size: 'small', x, y })));
  }, 'positions around a shape named Hub: left of, right of, above, below', 'mid')}
  ${says(['Draw a tiny orange triangle named T1 next to Start', 'Add a white ellipse named Note labeled "draft" below Done', 'Draw a teal square named Box between Start and Done'])}
  <h4>A part of the canvas</h4>
  <p>The canvas is 800 × 500 pixels. ${spots.map(v => `<code>${escH(words(v))}</code>`).join(', ')}; or exact coordinates, x from the left and y from the top.</p>
  ${pic(env, '0 0 800 500', (g, add) => {
    add('rect', { x: 2, y: 2, width: 796, height: 496, rx: 14, class: 'hcanvas' });
    spots.forEach(v => { const x = /Left$|^left$/.test(v) ? 110 : /Right$|^right$/.test(v) ? 690 : 400, y = /^top/.test(v) ? 80 : /^bottom/.test(v) ? 420 : 250;
      add('circle', { cx: x, cy: y, r: 9, class: 'hdot' }); add('text', { x, y: y + 42, 'text-anchor': 'middle', class: 'hcap big' }, words(v)); });
  }, 'the canvas with its named places', 'canvas')}
  ${says(['Draw a huge purple hexagon named Big in the bottom right', 'Draw a circle named Hub at 400, 250'])}
  <h4>By a distance</h4>
  <p>Move ${dirs.map(v => `<code>${escH(v)}</code>`).join(', ')}, by a number of pixels (80 if you say none). ${say('Move Done left by 100')} ${say('Move Check down')}</p>
  <h4>Two conditions at once</h4>
  ${pic(env, '0 0 300 250', g => {
    env.drawShape(g, shp(K, { name: 'Check', shape: 'diamond', color: 'yellow', x: 150, y: 50 }));
    env.drawShape(g, shp(K, { name: 'Q', shape: 'diamond', color: 'pink', size: 'small', x: 150, y: 128 }));
    env.drawShape(g, shp(K, { name: 'Done', color: 'green', x: 150, y: 210 }));
  }, 'a pink diamond Q placed below Check and above Done', 'small')}
  <p>Up to two positions next to shapes, plus one part of the canvas. If no free spot satisfies all of them, the shape goes where most of them hold and the reply says which one was not met.</p>
  ${says(['Draw a pink diamond named Q below Check but above Done', 'Draw a navy rectangle named Side left of Done and in the bottom left'])}
  <h4>Groups</h4>
  ${pic(env, '0 0 320 120', g => {
    const S = { shapes: [shp(K, { name: 'Start', color: 'blue', x: 60, y: 70 }), shp(K, { name: 'Process', shape: 'rectangle', label: 'Validate', x: 200, y: 70 })], groups: [{ name: 'Intake', members: ['Start', 'Process'] }] };
    if (env.drawGroups) env.drawGroups(g, S); S.shapes.forEach(s => env.drawShape(g, s));
  }, 'a group named Intake around Start and Process', 'mid')}
  <p>A group is drawn as a dashed frame with its name. Its name works like a shape name: you can move it, copy it, place things next to it. A shape is in one group at a time; groups cannot contain groups.</p>
  ${says(GROUP_PRE.concat([{ text: 'Move Intake to the bottom right', pre: GROUP_PRE }]))}`;

  /* ---- everything you can do (generated from the legend's action values) ---- */
  const acts = valuesOf(engine, 'action'), seen = new Set();
  const item = (key, type, x, extra) => {
    const ps = type === 'command' ? providers(engine, 'command', 'action', key) : providers(engine, key, null, null);
    return `<div class="hitem"><div class="ht"><b>${escH(x.t)}</b>${offNote(ps)}</div><p>${escH(x.d || '')}${extra || ''}</p>${says(x.ex)}</div>`;
  };
  h += `<h3 class="hh" id="h-do">Everything you can do</h3>
  <p>Point at shapes by name (“Done”), by description (“the yellow diamond”, “the newest circle”), or all at once (“all circles”, “everything”). One message can hold several requests: <q>draw a black circle named A, a white circle named B and connect A to B</q>.</p>`;
  for (const [title, keys] of ACTION_GROUPS) {
    const parts = keys.map(k => {
      if (WIRE_ITEMS[k]) return engine.wireTypes.has(k) ? item(k, k, WIRE_ITEMS[k]) : '';
      if (!acts.includes(k)) return '';
      seen.add(k);
      const x = ACTIONS[k], ex = k === 'arrange' ? ` Layouts: ${valuesOf(engine, 'layout').join(', ')}.` : '';
      return item(k, 'command', x, ex);
    }).join('');
    if (parts) h += `<h4 class="grp">${escH(title)}</h4>${parts}`;
  }
  const rest = acts.filter(a => !seen.has(a));
  if (rest.length) h += `<h4 class="grp">Other actions</h4>${rest.map(a => `<div class="hitem"><div class="ht"><b>${escH(words(a))}</b></div><p class="note">Words it is read from: ${escH(cuesOf(L('action'), a).join(', ') || a)}</p></div>`).join('')}`;

  /* ---- everything you can ask (generated from the legend's ask values) ---- */
  const asks = valuesOf(engine, 'ask');
  h += `<h3 class="hh" id="h-ask">Everything you can ask</h3><p>Questions never change the drawing. The shapes an answer is about light up for a few seconds.</p>`;
  for (const a of asks) {
    const x = ASKS[a] || { t: words(a), d: `Words it is read from: ${cuesOf(L('ask'), a).join(', ')}`, ex: [] };
    let extra = '';
    if (a === 'property' && L('property')) extra = ` About: ${valuesOf(engine, 'property').map(words).join(', ')}.`;
    if (a === 'extreme' && L('superlative')) extra = ` One of: ${valuesOf(engine, 'superlative').filter(v => !['closest', 'farthest'].includes(v)).map(words).join(', ')}.`;
    if (a === 'list') extra = ' Filter by kind, colour, “not” a colour, size, outline, label, position, or what it is connected to.';
    h += `<div class="hitem"><div class="ht"><b>${escH(x.t)}</b>${offNote(providers(engine, 'question', 'ask', a))}</div>${x.d || extra ? `<p>${escH(x.d || '')}${escH(extra)}</p>` : ''}${says(x.ex)}</div>`;
  }

  /* ---- reading the replies ---- */
  h += `<h3 class="hh" id="h-read">Reading the replies</h3>
  <p>Every reply has one line per reader:</p>
  <div class="hreply"><div class="rl"><b>Rules · 0.4 ms:</b> Drew Gem. Connected Check → Gem.</div><div class="rl"><b>VSS · 12 ms:</b> Drew Gem. Connected Check → Gem.</div><div class="rl"><b>Neural · 140 ms:</b> Drew star1. Connected Check → star1.</div><div class="meta"><span class="lnk">details</span></div></div>
  <ul>
    <li><b>The time</b> is how long that reader took to turn your message into SOP. Drawing is not counted. A reader that has not finished loading says so instead of answering.</li>
    <li><b>Different results</b>: here the Neural reader missed the name, so its star got an automatic name. Each reader changes only its own drawing.</li>
    <li><b>The tabs</b> above the drawing (Rules, VSS, Neural) show each reader’s own drawing. A dot on a tab means that drawing differs from the one on screen. Under each tab, <b>SOP</b> shows that drawing written as SOP and <b>Settings</b> shows the reader’s details.</li>
    <li><b>The copy button</b> <svg class="i inl" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg> appears when the drawings differ. It copies the drawing on screen, with its undo history, to the other tabs, so all readers start the next message from the same drawing.</li>
    <li><b>details</b> under a reply shows exactly what each reader wrote in SOP, what the engine changed, and for questions the logic query it ran.</li>
    <li><b>Buttons under a reply</b> answer a question the reader asked, e.g. “Which circle? Start or Done”.</li>
    <li><b>“I didn’t understand …”</b> is an honest refusal: the reader found no request it could read in that part. It still does every other part of your message. Try plainer words, with shapes and arrows: “connect Plankton to Krill” instead of “plankton feeds the krill”.</li>
    <li><b>A reason instead of a result</b> (“There is already a shape named Hub”, “I can't find a red square”) comes from the engine: the request was understood but could not be done as asked.</li>
  </ul>
  <p>A message that starts with <code>@</code> is not read by any reader: it is SOP, sent straight to the engine (see the SOP language tab). The + next to the message box has more examples and scripted scenarios; the Benchmark tab runs every reader on the same test sentences.</p>`;

  /* ---- what it cannot do ---- */
  h += `<h3 class="hh" id="h-cannot">What it cannot do</h3>
  <ul>
    <li>Only the ${kinds.length} shapes, ${colors.length} colours and ${sizes.length} sizes above: no free drawing, no curves, no images, no icons, no text without a shape around it.</li>
    <li>Arrows are straight lines between two shapes: no curved or bent arrows, no arrow to empty space, no arrow from a shape to itself. An existing arrow cannot be restyled; disconnect and connect again.</li>
    <li>No text formatting (font, size, bold), no line thickness, no transparency, no rotation.</li>
    <li>At most two positions next to shapes and one part of the canvas in one request; at most 12 new shapes in one request.</li>
    <li>Groups cannot be nested, and a shape is in one group at a time.</li>
    <li>English only. Words from other worlds (“the manager approves the budget”) are not translated into diagrams; say it with shapes and arrows.</li>
    <li>No saving, export or sharing: the drawing lives in this page until you reload it.</li>
    <li>The readers make mistakes, each in its own way. Undo fixes any change in one step.</li>
  </ul></div>`;
  return h;
}

/* ================================================================== SOP LANGUAGE ================================================================== */
let scratch = null;
function rulesSystem(env) { if (!scratch) scratch = env.K.createSystem(); return scratch; }
function formalize(env, text) {
  try { return rulesSystem(env).formalize(text, { names: NAMES_ON_START, last: [] }).nodes; } catch (e) { return []; }
}
function hlWire(env, n) {
  const { K } = env, line = K.serialize(n), toks = line.split(' ');
  const val = raw => K.fmtValue(raw).split(/(,)/).map(p => p === ',' ? '<span class="cm">,</span>' : p.startsWith('$') ? `<span class="rf">${escH(p)}</span>` : p.startsWith('"') ? `<span class="str">${escH(p)}</span>` : `<span class="v">${escH(p)}</span>`).join('');
  return `<span class="wid">@${escH(n.id)}</span> <span class="wt">${escH(n.type)}</span>` + toks.slice(2).map(t => t.split('=')[0]).map(k => ` <span class="k">${escH(k)}</span><span class="cm">=</span>${val(n.args[k])}`).join('');
}
/* what the engine did with the wires, run on a fresh copy of the opening drawing */
function engineRun(env, nodes) {
  const { K } = env; const s = K.createSystem();
  try { for (const t of env.startMessages || []) { const f = s.formalize(t, { names: s.world.state.shapes.map(x => x.name), last: [] }); s.engine.run(f.nodes); } } catch (e) { return []; }
  let r; try { r = s.engine.run(nodes); } catch (e) { return ['The engine stopped: ' + e.message]; }
  const out = [];
  for (const st of r.steps) {
    const id = '@' + st.node.id;
    if (st.error) { out.push(`${id}: not done: ${st.error.message}`); continue; }
    if (st.node.type === 'mention') { out.push(`${id}: “${listing(K.names(st.value))}” is the shape that fits the description.`); continue; }
    for (const p of st.patches) {
      if (p.op === 'add') out.push(`${id}: draws ${p.shape.name}, a ${K.sizeName(p.shape.size)} ${p.shape.color} ${p.shape.shape}, at (${p.shape.x}, ${p.shape.y}).`);
      else if (p.op === 'link') out.push(`${id}: connects ${K.edgeText(p.edge)}.`);
      else if (p.op === 'set') out.push(`${id}: changes ${p.name}.`);
      else out.push(`${id}: ${p.op} ${p.name || ''}.`);
    }
    if (st.answer) out.push(`${id}: answers “${st.answer}”`);
  }
  return out;
}
function explainWire(env, n) {
  return `<ul class="wkeys">${Object.keys(n.args).filter(k => n.args[k] != null).map(k => { const v = env.K.fmtValue(n.args[k]);
    return `<li><code>${escH(k)}=${escH(v)}</code> answers <i>${escH(askOf(env.engine, k) || k)}</i>${env.K.isRef(n.args[k]) ? ` (the shape found by wire <code>@${escH(n.args[k].ref)}</code>)` : ''}</li>`; }).join('')}</ul>`;
}
function sop(env) {
  const { K, engine } = env;
  let h = `<div class="help hdoc">
  <h3 class="hh">What SOP is</h3>
  <p>SOP is the small command language between the readers and the drawing engine. A reader’s only job is to turn your English into SOP; the engine only ever sees SOP. Because all three readers must write the same language, their results can be compared line by line.</p>
  <p>Each request becomes one line, called a <b>wire</b>:</p>
  <pre class="sop">${hlWire(env, { id: 's1', type: 'command', args: { action: 'create', shape: 'star', color: 'red', name: 'Gem' } })}</pre>
  <ul>
    <li><code>@s1</code> is the wire’s id. Another wire can use its result by writing <code>$s1</code>.</li>
    <li><code>command</code> is the wire’s type (the list is below).</li>
    <li>Each <code>key=value</code> answers one fixed question: <code>color=red</code> answers “What color is it?”. A wire answers only the questions your sentence touches; the engine fills in the rest with defaults.</li>
  </ul>
  <h4>Wire types</h4>
  <dl class="readers">${[...engine.wireTypes.entries()].map(([t, w]) => `<dt><code>${escH(t)}</code></dt><dd>${escH(WIRE_WORDS[t] || w.doc + '.')}</dd>`).join('')}</dl>`;

  /* worked examples: written by the Rules reader now, run on a copy of the opening drawing */
  WORKED.forEach((text, i) => {
    const nodes = formalize(env, text);
    h += `<h3 class="hh">Example ${i + 1}: from a sentence to the drawing</h3>
    <p class="egq">${say(text)}</p>
    <p>The Rules reader writes:</p>
    <pre class="sop">${nodes.map(n => hlWire(env, n)).join('\n') || '<span class="cm"># nothing</span>'}</pre>
    ${nodes.map(n => `<p class="wname"><code>@${escH(n.id)}</code> (${escH(n.type)})</p>${explainWire(env, n)}`).join('')}
    <p>The engine, on the drawing the page opens with:</p><ul class="wkeys">${engineRun(env, nodes).map(t => `<li>${escH(t)}</li>`).join('')}</ul>`;
    if (i === 1) h += `<p>The first wire is a <code>mention</code>: a description the engine resolves to a shape before the question runs. If two shapes fit, the reply asks which one.</p>`;
  });
  h += `<h4>Writing SOP yourself</h4>
  <p>A message that starts with <code>@</code> is read as SOP and goes to the engine without any reader. Several wires go on separate lines.</p>
  ${says(['@g1 command action=create shape=star color=gold name=Gem position=center'])}`;

  /* reference: every key of the legend, grouped by purpose */
  h += `<h3 class="hh">All keys and values</h3>
  <p>Every question the engine knows, with its possible answers. This list is read from the engine itself.</p>
  <input type="checkbox" id="cue-tog"><label class="cuetog" for="cue-tog">Show the words the Rules reader looks for</label>
  <div class="legend">`;
  const used = new Set(), ex = new Map();
  const row = k => {
    const q = engine.legend.get(k); if (!q) return ''; used.add(k);
    let eg = '';
    if (KEY_EX[k]) {
      if (!ex.has(KEY_EX[k])) ex.set(KEY_EX[k], formalize(env, KEY_EX[k]));
      const n = ex.get(KEY_EX[k]).find(n => n.args[k] != null);
      if (n) eg = `<div class="lex">${say(KEY_EX[k])} <span>→</span> <code>${escH(k)}=${escH(K.fmtValue(n.args[k]))}</code></div>`;
    }
    const vals = q.values ? `<div class="vals">${Object.entries(q.values).map(([v, c]) => `<span class="val"><b>${escH(v)}</b>${c && c.length ? `<em class="cues">${escH(c.join(', '))}</em>` : ''}</span>`).join('')}</div>` : '';
    return `<div class="lq2"><div class="lk"><code>${escH(k)}</code><span>${escH(askOf(engine, k))}</span></div><div class="lkind">${escH(KIND_WORDS[q.kind] || q.kind)}</div>${vals}${eg}</div>`;
  };
  for (const [title, sub, keys] of KEY_GROUPS) {
    const body = keys.map(row).join(''); if (!body) continue;
    h += `<h4>${escH(title)}</h4>${sub ? `<p class="note">${escH(sub)}</p>` : ''}${body}`;
  }
  const other = [...engine.legend.questions.keys()].filter(k => !used.has(k));
  if (other.length) h += `<h4>Other</h4>${other.map(row).join('')}`;
  h += `</div><p class="note">The words the Rules reader looks for are written by hand and extended with words found in the training messages. The VSS reader learns its own from those messages; the Neural reader uses none.</p></div>`;
  return h;
}

/* ================================================================== CAPABILITIES ================================================================== */
/* what stops working when plugin p is off: the action / ask values and wire types that no other switched-on plugin handles */
function lostWithout(engine, p) {
  const lost = [], still = [];
  const keyOf = { command: 'action', question: 'ask' };
  const mine = engine.handlers.filter(h => h.plugin === p);
  for (const h of mine) {
    const key = keyOf[h.type], vals = key && h.when && h.when[key] != null ? [].concat(h.when[key]) : [null];
    for (const v of vals) {
      if (h.when && Object.keys(h.when).some(k => k !== key)) continue;   // a narrower handler (e.g. ask=count kind=group) covers only part of a value
      const others = engine.handlers.filter(o => o.plugin !== p && o.plugin.enabled && o.type === h.type && !(o.when && Object.keys(o.when).some(k => k !== key)) && (v == null || (o.when && o.when[key] != null && [].concat(o.when[key]).includes(v))));
      const label = v == null ? ({ rule: 'rules for new shapes', fact: 'statements', mention: 'descriptions such as “the green circle”' }[h.type] || h.type) : h.type === 'command' ? (ACTIONS[v] ? ACTIONS[v].t.toLowerCase() : words(v)) : (ASKS[v] ? ASKS[v].t.toLowerCase() : words(v));
      if (others.length) { if (!still.some(x => x.label === label)) still.push({ label, by: others.map(o => (CAPS[o.plugin.name] || { t: o.plugin.title }).t) }); }
      else if (!lost.includes(label)) lost.push(label);
    }
  }
  return { lost, still: still.filter(s => !lost.includes(s.label)) };
}
function capabilities(env) {
  const { engine } = env;
  let h = `<div class="help hdoc"><p>The engine is built from separate parts, one per kind of thing it can do. Each card says what that part lets you do. Switch a part off and send one of its examples: the readers still understand your sentence and still write the SOP, but the engine answers that it cannot do it. That shows which part of the system did the work, and that it says so honestly when it cannot. Switches apply to all three readers until the page is reloaded.</p>`;
  for (const p of engine.plugins) {
    const c = CAPS[p.name] || { t: p.title, d: p.description, ex: [] };
    const { lost, still } = lostWithout(engine, p);
    let off = c.off || '';
    const q = t => `“${t}”`;
    if (!c.off) off = (lost.length ? `These stop working: ${listing(lost.map(q))}. ` : '') + (still.length ? [...new Set(still.map(s => listing([...new Set(s.by)].map(q))))].map(by => `Still answered, by ${by}: ${listing(still.filter(s => listing([...new Set(s.by)].map(q)) === by).map(s => q(s.label)))}. `).join('') : '') + (lost.length ? 'Asking for one of them gets the reply that this part is switched off.' : '');
    h += `<section class="plug cap${p.enabled ? '' : ' off'}"><header><h4>${escH(c.t)}</h4><label class="sw"><input type="checkbox" data-plug="${escH(p.name)}" ${p.enabled ? 'checked' : ''} ${p.locked ? 'disabled' : ''} aria-label="Switch ${escH(c.t)} on or off">${p.locked ? 'always on' : p.enabled ? 'on' : 'off'}</label></header>
    <p>${escH(c.d)}</p>${c.ex.length ? says(c.ex) : ''}${off ? `<p class="capoff"><b>When switched off:</b> ${escH(off)}</p>` : ''}</section>`;
  }
  return h + '</div>';
}

const HelpKit = { help, sop, capabilities, examples, ACTIONS, ASKS, CAPS };
if (typeof module !== 'undefined') module.exports = HelpKit; else root.HelpKit = HelpKit;
})(typeof window !== 'undefined' ? window : this);
