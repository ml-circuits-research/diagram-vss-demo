/* The pages of the Help overlay that introduce the demo and describe the editor and its language (docs/js/docs.js shows them): Start here
   (the introduction: what the demo shows and who made it), Using the demo, What you can draw, Arrows and lines, Where things go, Everything you can do, Everything you can ask, What it cannot do, SOP Lang and Capabilities.
   Every list here (shape kinds, colours, sizes, line styles, arrow heads, positions, actions, questions, SOP Lang keys and values,
   capabilities) is read at run time from the engine's legend and plugins (docs/js/logic.js), so the reference cannot drift from what the
   engine does. The prose, the example sentences and the drawings around those lists are written here. A legend value without a
   description here is still listed (with its cue words), so a new action or value shows up even before anyone documents it.
   Every example sentence is meant to work with the Rules reader on the drawing the page opens with (Start, Process, Check, Done);
   an example with `pre` needs the sentences in `pre` first (they are shown next to it). A button with data-quick sends its sentence. */
(function (root) {
'use strict';
const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NS = 'http://www.w3.org/2000/svg';
const words = v => String(v).replace(/([A-Z])/g, ' $1').toLowerCase();
const listing = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const GROUP_PRE = ['Group Start and Process as Intake'];

/* the toolbar icons, drawn as in docs/index.html, for the page that explains the screen */
const ICON = {
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  view: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  clear: '<path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M6 7l1 13h10l1-13"/><path d="M9 7V4h6v3"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5"/><path d="M12 16.8v.2"/>',
  more: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>'
};
const icon = k => `<svg class="i inl" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

/* ---------------- what each action and question is, in plain words ---------------- */
const ACTIONS = {
  create: { t: 'Draw', d: 'Add one or more shapes (up to 12 at once). Say the kind, colour, size, name, label and place you want; whatever you leave out gets a default: a medium white circle in a free spot, named circle1, circle2…. Several new shapes can be laid out together: “in a row” (also “side by side”, “in a line”), “in a column” (“stacked”), “in a grid”, “in a circle” (“as a ring”), next to a shape or in a part of the canvas.', ex: ['Draw a red circle named Hub in the center', 'Add three small squares in a row below Process', 'Add 6 triangles in a circle layout', 'Add 5 red stars arranged in a grid', 'Draw a gold star named Gem with a black outline in the top right'] },
  delete: { t: 'Delete', d: 'Remove shapes together with their arrows.', ex: ['Delete Done', 'Delete the yellow diamond', 'Clear the canvas'] },
  duplicate: { t: 'Copy', d: 'Make copies next to the original, with the same look.', ex: ['Copy Check', 'Duplicate Done twice'] },
  move: { t: 'Move', d: 'Put a shape next to another one, in a part of the canvas, at x,y coordinates, or a distance in a direction (80 pixels if you give no distance).', ex: ['Move Done to the top right', 'Move Done left by 100', 'Put Done between Start and Check'] },
  swap: { t: 'Swap', d: 'Two shapes trade places.', ex: ['Swap Start and Done'] },
  set: { t: 'Change', d: 'Change the colour, the kind of shape, the size or the outline. “all” changes every shape that fits.', ex: ['Make Done red', 'Turn Done into a star', 'Give Process a red outline', 'Make all circles red'] },
  resize: { t: 'Resize', d: 'Make a shape bigger or smaller. “Bigger” alone means one and a half times; you can also say a factor or a size name.', ex: ['Make Process bigger', 'Shrink Start', 'Make Check twice as big'] },
  label: { t: 'Label', d: 'Write text inside a shape. Put the text in quotes. Long text is shortened with “…” to fit. “Remove the label” takes it away again. A shape can also be named with its kind in front: “the shape Process”, “the box Process”, “the circle named Done”.', ex: ['Label Done "finish"', 'Label the shape Process as "Great"', 'Remove the label of Process'] },
  rename: { t: 'Rename', d: 'Give a shape (or a group) a new name. Arrows stay attached.', ex: ['Rename Done to End'] },
  connect: { t: 'Connect', d: 'Draw arrows or lines between shapes. One shape can connect to several at once, and a list can be joined as a chain.', ex: ['Connect Start to Done with a dashed arrow', 'Connect Start to Process, Check and Done', 'Connect Start, Check and Done in a chain'] },
  disconnect: { t: 'Disconnect', d: 'Remove the arrows between two shapes, all arrows of one shape, or every arrow.', ex: ['Disconnect Start from Process', 'Remove all connections'] },
  align: { t: 'Align', d: 'Put shapes on one horizontal line (the default) or one vertical line, without overlapping.', ex: ['Align Start, Process and Check', 'Align Check and Done vertically'] },
  distribute: { t: 'Space evenly', d: 'Put equal gaps between the shapes, left to right (or top to bottom); the first and last stay where they are when the others fit between them, else the span grows, so no two touch (needs three or more).', ex: ['Distribute the shapes evenly', 'Space Start, Process and Check evenly'] },
  arrange: { t: 'Arrange', d: 'Lay shapes out as a row, column, grid or circle, or by their links as a tree, layers (a flow), radial or organic layout; say a direction (left to right, top to bottom) and a root ("with Ceo at the top"). “Everything” means every shape, across zones (the answer says which shapes left their zone); titles and captions stay where they are, or move aside when a shape needs their place.', ex: ['Arrange everything as a tree', 'Arrange in layers left to right', 'Radial layout around Hub'] },
  improve: { t: 'Tidy up', d: 'Make the layout better by a measured score (fewer overlaps and crossings, shapes on the canvas, even spacing, aligned shapes, arrows one way): it tries removing overlaps, straightening, untangling and the layout the links ask for, and keeps the best only if it scores higher.', ex: ['Tidy up', 'Clean up the diagram', 'Make it look better'] },
  respace: { t: 'More or less space', d: 'Spread the shapes out or bring them closer, keeping the layout.', ex: ['More space between the shapes', 'Make it more compact', 'Space them 50 px apart'] },
  snap: { t: 'Snap to grid', d: 'Put every shape on the grid (20 px, or the size you say).', ex: ['Snap everything to the grid'] },
  flip: { t: 'Flip', d: 'Mirror the drawing left to right (or top to bottom).', ex: ['Flip the diagram horizontally', 'Flip it upside down'] },
  reverse: { t: 'Reverse arrows', d: 'Turn arrows around: the start becomes the end.', ex: ['Reverse the arrow from Check to Done', 'Reverse all the arrows'] },
  sort: { t: 'Sort', d: 'Put the shapes in order by name, colour, size, shape or label, in their current places or in a row, column or grid.', ex: ['Sort by name', 'Sort by size, biggest first, in a row'] },
  groupBy: { t: 'Group by', d: 'Gather shapes of the same colour (or kind, or size) together.', ex: ['Group them by colour'] },
  equalize: { t: 'Same size', d: 'Give shapes the same size, colour, shape or outline (the most common one, or that of a shape you name).', ex: ['Make them all the same size', 'Make everything the same colour as Hub'] },
  straighten: { t: 'Straighten', d: 'Make nearly straight links exactly horizontal or vertical.', ex: ['Straighten the arrows'] },
  untangle: { t: 'Untangle', d: 'Swap shapes to reduce arrow crossings without changing the layout.', ex: ['Untangle the arrows'] },
  fit: { t: 'Fit and centre', d: 'Bring everything onto the canvas, or centre the drawing.', ex: ['Fit everything on the canvas', 'Center the diagram'] },
  toFront: { t: 'Bring to front', d: 'Draw a shape on top of the ones it overlaps.', ex: ['Bring Start to the front'] },
  toBack: { t: 'Send to back', d: 'Draw a shape behind the ones it overlaps.', ex: ['Send Process to the back'] },
  group: { t: 'Group', d: 'Give several shapes one name. The group then moves, copies, aligns and is deleted as one block, and its name works anywhere a shape name does. A dashed frame shows it.', ex: GROUP_PRE.slice() },
  ungroup: { t: 'Ungroup', d: 'Dissolve a group (its shapes stay), or take one shape out of its group.', ex: [{ text: 'Ungroup Intake', pre: GROUP_PRE }] },
  undo: { t: 'Undo', d: 'Step back one change. The arrow buttons above the drawing do the same.', ex: ['Undo'] },
  redo: { t: 'Redo', d: 'Put back what undo took away.', ex: [{ text: 'Redo', pre: ['Make Done red', 'Undo'] }] },
  forget: { t: 'Forget the rules', d: 'Drop every “from now on” rule.', ex: [{ text: 'Forget the rules', pre: ['From now on, circles are orange'] }] }
};
/* the label of an arrow already drawn: action=label with from= / to= (its two ends) instead of target= (listed under Arrows and lines) */
const EDGE_LABEL = { t: 'Label an arrow', d: 'Write, change or remove the text next to an arrow or line that is already drawn. Name the arrow by its two ends: “the arrow between Process and Check”, “the arrow from Check to Done”, “the link Process–Check”. Text without spaces needs no quotes. If one end has several arrows, the reply asks which one; if there is no such arrow, it says so.', ex: ['Label the arrow between Process and Check as Valid', 'Put the label "maybe" on the arrow from Check to Done', 'Name the link Start–Process Begin', 'Remove the label of the arrow between Check and Done', 'What does the arrow from Check to Done say?'] };
/* the look of an arrow already drawn: action=set|resize with from= / to= (its two ends) or kind=edge (every arrow) */
const EDGE_STYLE = { t: 'Change an arrow', d: 'Change the line style (solid, dashed, dotted), the colour, the arrow heads (two-way, none) or the thickness of an arrow or line that is already drawn. Name it by its two ends: “the arrow from Start to Process”, “the line between Process and Check”; “all the arrows” changes every one. To remove an arrow, disconnect its two ends.', ex: ['Make the arrow from Start to Process red', 'Make the arrow between Process and Check two-way', 'Make all the arrows thicker'] };
/* requests that are not an action: a rule for new shapes, and a statement of fact (wire types `rule` and `fact`) */
const WIRE_ITEMS = {
  rule: { t: 'Rules for new shapes', d: '“From now on …” sets a default for shapes drawn later. It fills in only what you leave out, and it does not change shapes already drawn.', ex: ['From now on, circles are orange', 'From now on, new shapes are small and purple'] },
  fact: { t: 'Statements', d: 'A sentence that says how things are is treated as a wish: if it is already true nothing changes; if not, the drawing is changed until it is true.', ex: ['Check is above Process', 'Done is red', 'Done is connected to Start'] }
};
const ACTION_GROUPS = [
  ['Draw, copy, delete', ['create', 'duplicate', 'delete']],
  ['Move and swap', ['move', 'swap']],
  ['Change how it looks', ['set', 'resize', 'label', 'rename']],
  ['Arrows and lines', ['connect', 'disconnect', 'labelEdge', 'styleEdge']],
  ['Tidy up', ['align', 'distribute', 'arrange', 'improve', 'respace', 'snap', 'flip', 'sort', 'groupBy', 'equalize', 'straighten', 'untangle', 'fit', 'reverse', 'toFront', 'toBack']],
  ['Groups', ['group', 'ungroup']],
  ['Rules and statements', ['rule', 'forget', 'fact']],
  ['Undo', ['undo', 'redo']]
];
const ASKS = {
  count: { t: 'How many', ex: ['How many circles are there?', 'How many connections are there?', 'How many groups are there?'] },
  list: { t: 'Which ones', ex: ['Which shapes are green?', 'Which shapes are below Start?', 'Which circles are not blue?'] },
  exists: { t: 'Is there…', ex: ['Is there a red shape?', 'Are there any stars?'] },
  property: { t: 'What colour, where, how big, what text', d: 'Of a shape, or the text of an arrow (named by its two ends).', ex: ['What color is Check?', 'Where is Done?', 'How big is Start?', 'What does Process say?', 'What does the arrow from Check to Done say?'] },
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
  rules: { t: 'Which rules are on', ex: [{ text: 'What rules are there?', pre: ['From now on, circles are orange'] }] },
  help: { t: 'Help: what can I do, and how?', d: 'A question about the editor itself, not the drawing: what it can do, how to do something, which values there are, or an example. The answer is put together from the legend and these pages, so it lists exactly what the editor knows; the example sentences under it are buttons. Nothing is drawn.', ex: ['help', 'How do I connect two shapes?', 'What colours can I use?', 'Can I group things?', 'What can you do with arrows?', 'How do I make a timeline?'] }
};
/* help topics that are a value rather than an action or a question (help-answers.js uses them for topic=<value>), keyed key:value */
const TOPICS = {
  'shape:text': { t: 'Free text', d: 'A text of its own on the canvas (a title, a heading, a note), not inside a shape. Say the words in quotes (after title, heading, caption, note or text they need none: “add a big title Roadmap”, “add a note saying check later”), and if you like a size for the letters (tiny to huge), a colour and a place; without a place it goes near the top. It is moved, recoloured, resized, relabelled, deleted and brought to the front like a shape, but it has no outline and arrows do not attach to it. A label is different: it is written inside a shape and moves with it. A name is the handle above a shape that you use to point at it.', ex: ['Add a title "Q3 roadmap" at the top in big red letters', 'Write "Draft" in the bottom right', 'Move MainTitle to the bottom'] }
};

/* ---------------- capabilities (the engine's plugins) in plain words ---------------- */
const CAPS = {
  core: { t: 'Pointing at shapes', d: 'Lets you name shapes by what they look like instead of by name: “the green circle”, “all squares”, “the newest star”. When a description fits more than one shape, the reply asks which one you mean and offers buttons.', ex: ['Make the green circle bigger', 'Make all circles red'], off: 'It cannot be switched off: every other capability needs it.' },
  history: { t: 'Undo and redo', d: 'Steps back through your changes and forward again. The arrow buttons above the drawing use it too.', ex: ['Undo', { text: 'Redo', pre: ['Make Done red', 'Undo'] }] },
  shapes: { t: 'Shapes', d: 'Drawing, deleting, moving, copying, swapping, recolouring, resizing, labelling and renaming shapes, and placing them by position.', ex: ['Draw a red circle named Hub in the center', 'Move Done to the top right', 'Turn Done into a star'] },
  groups: { t: 'Groups', d: 'Several shapes under one name, handled as one block.', ex: GROUP_PRE.concat([{ text: 'Move Intake to the bottom right', pre: GROUP_PRE }]) },
  connections: { t: 'Arrows and lines', d: 'Connecting and disconnecting shapes, with a line style, arrow heads, a colour and a label; writing, changing or removing the label of an arrow already drawn, and saying what an arrow says. The style, colour, arrow heads and thickness of an arrow already drawn are changed by naming its two ends (“make the arrow from Start to Process red”).', ex: ['Connect Start to Done with a dashed arrow', 'Disconnect Start from Process', 'Label the arrow between Process and Check as Valid', 'Make the arrow from Start to Process red', 'What does the arrow from Check to Done say?'] },
  layout: { t: 'Tidying up', d: 'Aligning, spacing evenly, arranging as a row, column, grid or circle, and bringing to the front or sending to the back.', ex: ['Arrange everything in a circle', 'Align Start, Process and Check'] },
  queries: { t: 'Questions about the drawing', d: 'Answers questions by looking at the drawing: how many, which, where, what colour, what is connected, biggest, closest, and so on.', ex: ['How many circles are there?', 'Describe Check', 'Which shape is the biggest?'] },
  reasoning: { t: 'Paths and cycles', d: 'Follows the arrows from shape to shape to answer whether there is a path, what can be reached and whether there are loops.', ex: ['Is there a path from Start to Done?', 'Are there any cycles?'] },
  logic: { t: 'Answers checked by logic (Datalog)', d: 'A second way to answer questions. The drawing is written as logical facts, such as color(Done, green) and above(Check, Done), and your question as a query over those facts; a small logic engine (Datalog) solves it. Under “details” you can read the facts and the query.', ex: ['Which shapes are below Start?', 'Is Check above Done?'], off: 'The plain question code answers instead, so the answers should stay the same: switching it off is a way to check that both give the same answer.' },
  rules: { t: 'Rules for new shapes', d: '“From now on …” defaults for shapes drawn later, and forgetting them.', ex: ['From now on, circles are orange', { text: 'What rules are there?', pre: ['From now on, circles are orange'] }] },
  facts: { t: 'Statements', d: 'Sentences that say how things are (“Check is above Process”): if already true nothing changes, otherwise the drawing is changed until it is true.', ex: ['Check is above Process', 'Done is red'] },
  templates: { t: 'Templates', d: 'Ready-made diagram forms: a list of texts becomes a process, a cycle, a timeline, a pyramid, an org chart, or a form that recalls something felt (a heart, a mountain, a sunrise, a bridge…), in one step, as one group. Existing shapes can be laid out in such a form too.', ex: ['Make a timeline of Kickoff, Design, Build and Launch titled "2027"', 'Draw a heart of Trust, Care and Joy in warm colours', 'Arrange Start, Process, Check and Done as a cycle'] },
  help: { t: 'Help in the chat', d: 'Answers questions about the editor itself (“how do I…?”, “what colours can I use?”, “can I group things?”) from the legend and these pages; it never draws.', ex: ['help', 'How do I connect two shapes?', 'What colours can I use?'] }
};

/* ---------------- the SOP Lang keys, grouped by what they are for, each with one English example ---------------- */
const KEY_GROUPS = [
  ['What to do', 'The kind of request.', ['action', 'ask', 'property', 'kind', 'superlative', 'comparison']],
  ['Which shapes', 'Who the request is about.', ['target', 'name', 'quantifier', 'count', 'recency', 'notColor', 'linked', 'members']],
  ['How it looks', '', ['shape', 'color', 'size', 'scale', 'outline', 'label', 'fill', 'width', 'height', 'layer']],
  ['Where', '', ['position', 'anchor', 'at', 'direction', 'distance']],
  ['Arrows and lines', '', ['from', 'to', 'style', 'arrow', 'pairing']],
  ['Layout', '', ['axis', 'layout']],
  ['Templates', 'A ready-made form from a list of texts.', ['template', 'items', 'items2', 'title', 'parents', 'scheme']],
  ['Help', 'A question about the editor itself.', ['topic', 'aspect', 'about']]
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
  axis: 'Align Check and Done vertically', layout: 'Arrange everything in a circle',
  template: 'Make a timeline of Kickoff, Design, Build and Launch', items: 'Make a timeline of Kickoff, Design, Build and Launch', title: 'Draw a cycle of Plan, Do, Check and Act titled "PDCA"',
  items2: 'Draw a balance of Cost and Risk against Speed', scheme: 'Draw a heart of Trust, Care and Joy in warm colours',
  topic: 'How do I connect two shapes?', aspect: 'What colours can I use?', about: 'Can I add images?'
};
const KIND_WORDS = { enum: 'one of these values', names: 'one or more shape names, or $id of another wire', name: 'a name', number: 'a number', text: 'text, in quotes when it has spaces', point: 'x,y in pixels' };
const WIRE_WORDS = {
  command: 'A request to change the drawing: “Make Done red”.',
  question: 'A question; it never changes the drawing: “Is there a path from Start to Done?”',
  fact: 'A statement of how things are; if it is not true yet, the drawing is changed until it is: “Check is above Process”.',
  rule: 'A default for shapes drawn from now on: “From now on, circles are orange”.',
  mention: 'A description that points at existing shapes: “the green circle” in “make the green circle bigger”.'
};
const NAMES_ON_START = ['Backdrop', 'IntakeZone', 'ReviewZone', 'Start', 'Process', 'Check', 'Done', 'MainTitle', 'IntakeCaption', 'ReviewCaption', 'Intake', 'Review'];
const TK = () => root.TemplateKit || (typeof require === 'function' ? (() => { try { return require('./templates.js'); } catch (e) { return null; } })() : null);

/* every clickable example, for the test (training-free check that each one works with the Rules reader) */
const START_EX = ['Draw a red circle named Hub in the center', 'Connect Done to Start with a dotted line', 'Is there a path from Start to Done?'];
function examples() {
  const out = [], add = e => out.push(typeof e === 'string' ? { text: e, pre: [] } : { text: e.text, pre: e.pre || [] });
  Object.values(ACTIONS).concat(Object.values(WIRE_ITEMS), [EDGE_LABEL, EDGE_STYLE], Object.values(ASKS), Object.values(CAPS), Object.values(TOPICS)).forEach(x => x.ex.forEach(add));
  Object.values(KEY_EX).forEach(add);
  START_EX.forEach(add); WORKED.forEach(add);
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
const go = (id, text) => `<a href="#help/${id}">${escH(text)}</a>`;

/* drawings: the canvas's own drawing code (ui.js drawShape / drawEdge / drawGroups), into a detached SVG */
function pic(env, vb, fn, label, cls) {
  if (typeof document === 'undefined') return '';
  const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', vb); s.setAttribute('class', 'hsvg' + (cls ? ' ' + cls : ''));
  s.setAttribute('role', 'img'); s.setAttribute('aria-label', label);
  const g = document.createElementNS(NS, 'g'); s.appendChild(g); fn(g, (tag, a, txt) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; g.appendChild(e); return e; });
  return s.outerHTML;
}
const shp = (K, o) => Object.assign({ name: '', shape: 'circle', color: 'white', size: K.SIZE_PX.medium, x: 0, y: 0, label: null, outline: null }, o, o.size && typeof o.size === 'string' ? { size: K.SIZE_PX[o.size] } : {});
const mbText = b => b ? `about ${Math.round(b / 1e6)} MB` : '';

/* ================================================================== START HERE ================================================================== */
/* The introduction (owner, 2026-11-03 11:19): what the demo shows, the three techniques it compares, VSS-BERT, what it is for, the
   neurosymbolic split, the goal (cautious by design), the synthetic data, and who made it. Plain and short: the numbers are on the later
   pages (one fact here, with a link). The names and links of Axiologic Research and the Achilles project are exactly the owner's; nothing
   else is said about either. How to use the editor is the next page, Using the demo (its old links #help/start/<section> are sent there by
   docs.js ALIASES). */
const CREDIT = 'This is research by <a href="https://www.axiologic.net">Axiologic Research</a>, part of the <a href="https://www.achilles-project.eu/">Achilles project</a>.';
function start() {
  return `<p class="lead">This demo shows that natural-language understanding can run in the browser. You write to a diagram editor in plain English; small language models running in this page turn your words into commands, and nothing is sent to a server.</p>
  <p class="callout" id="in-credit">${CREDIT}</p>

  <h2 id="in-compare">Three techniques, compared</h2>
  <p>Three major techniques read the same messages, and you can see what each one does with them:</p>
  <dl class="readers">
    <dt>Rules</dt><dd>Hand-written code that looks for known words and their order, like the chatbots before LLMs. Exact on the phrasings it was written for, but it cannot tell when it is wrong. ${go('rules-vs-learned', 'The Rules, as a comparison')}</dd>
    <dt>SOP-BERT</dt><dd>A BERT model (DistilBERT, a transformer) that we fine-tuned on example messages for this editor. ${go('bert', 'SOP-BERT')}</dd>
    <dt>VSS</dt><dd><b>VSA Semantic Space</b>: a language model developed by us, built on VSA (vector symbolic architectures), not on transformers, and dedicated to formalization: turning a sentence into a precise command. It reads in named steps, so it can show its reasons: which word or which step it doubts; its confidence is built from those same steps. It is small enough to run in this page, each of its worlds trains in about ten minutes on a laptop GPU, and it is half of VSS-BERT, the reader that answers. VSS is also inspired by <i>A Thousand Brains</i> by Jeff Hawkins: many small worlds, each modelling part of the language, combine into one reading. ${go('vss-worlds', 'What a VSS world is')}</dd>
  </dl>

  <h2 id="in-vss-bert">VSS-BERT: the two learned readers combined</h2>
  <p>The interface shows how VSS and SOP-BERT are combined into <b>VSS-BERT</b>, the reader that answers in the chat. Both read every request. When they read it the same way, it is done; when they do not, it is held back, with the reason and a clearer command to write. That gives a balance between capability and fewer mistakes: of what VSS-BERT does, 1.8% is wrong, and it holds back about half of the requests. ${go('research-question/precision-result', 'The numbers')} · ${go('two-readers', 'How VSS-BERT works')}</p>

  <h2 id="in-uses">What it is for</h2>
  <p><b>Work where a mistake is expensive.</b> A system that knows when it does not know is worth most where a confident mistake costs far more than a question: highly regulated industries, and research, where it can filter material and hand people less work, more reliably than an LLM, which tends to answer confidently even when it is wrong. VSS-BERT is built for that, and so is VSS alone, whose confidence comes from its own named steps.</p>
  <p>Cautious by design, and the demo shows it: here one confident mistake is counted as costly as 10 right answers; VSS-BERT is confidently wrong in 1.8% of what it does; for every request it holds back it says why and hands it to you with a clearer command; and because of the neurosymbolic split (below) the models never act directly: a symbolic engine carries out only actions it knows. ${go('research-question', 'The goal')}</p>
  <p>It also replaces LLMs where a sufficiently capable LLM would be too expensive or too slow: these models are small enough to run in a browser tab.</p>

  <h2 id="in-neuro">Neurosymbolic: the models understand, a symbolic layer acts</h2>
  <p>The whole approach is neurosymbolic. The language models (VSS, BERT) understand the intent: they turn your words into a short formal command in ${go('sop-lang', 'SOP Lang')}. A symbolic layer does the execution: an engine that knows exactly which actions exist (the legend), carries out the commands and answers questions with a small logic engine. The models never change the drawing themselves. This split makes the architecture useful for a large class of agentic applications: the drawing here is the test bench.</p>

  <h2 id="in-goal">The main goal: cautious by design</h2>
  <p>Avoid claiming to know, and avoid destructive actions. The system should be useful enough, but cautious by design. A request is done only when the reader is sure enough of it (one confident mistake is counted as costly as 10 right answers); the rest is held back, and the reply says why. A request that removes something (delete, disconnect, forget the rules, clear, ungroup) is more careful still: it needs the safety threshold even when you choose a bolder level, and when it describes what to remove instead of naming it, it lists what it would remove and waits for you. Every change can be undone in one step. ${go('using/delete-careful', 'Deleting: cautious by design')} ${go('research-question', 'The goal')} · ${go('asking', 'When it is not sure, it asks')}</p>

  <h2 id="in-data">The data</h2>
  <p>The data used to fine-tune BERT and to train the VSS worlds is synthetic: messages written by AI agents, and short commands generated from the Rules. Many of the current problems come from its poor quality and repetitiveness. ${go('reliability/r-synthetic', 'The data, and its limits')}</p>

  <h2 id="in-next">Where to go next</h2>
  <div class="cards">
    <a class="card" href="#help/using"><b>Using the demo</b><span>How to write to the editor, who answers, the replies, Settings</span></a>
    <a class="card" href="#help/research-question"><b>The goal</b><span>Do only what you are sure of, ask about the rest</span></a>
    <a class="card" href="#help/two-readers"><b>VSS-BERT</b><span>SOP-BERT paired with VSS: fewer confident mistakes</span></a>
    <a class="card" href="#help/vss-worlds"><b>What a VSS world is</b><span>The small models VSS is made of</span></a>
    <a class="card" href="#help/reliability/r-synthetic"><b>The data</b><span>Synthetic, and the main limit today</span></a>
    <a class="card" href="#help/architecture"><b>How it works inside</b><span>Every part, model and number</span></a>
  </div>`;
}

/* ================================================================== USING THE DEMO ================================================================== */
/* the former Start here (until 2026-11-03): how to use the editor, who answers, the replies, the screen and Settings */
function using(env) {
  const { K } = env;
  const vb = mbText(env.vssBytes), nb = mbText(env.neuralBytes);
  let h = `<p class="lead">A diagram editor you talk to in plain English. You write what you want, for example <q>draw a red circle named Hub and connect Start to it</q>, and it draws it, changes it, or answers questions about the drawing.</p>
  <p>The reader that answers is <b>VSS-BERT</b>. It does only what it is sure of; when it is not sure, it does not guess and asks no questions: it says which part it held back, why, and the clearer command to write. ${icon('more')} Settings let you see the other readers’ replies too, and each tab’s Settings choose how bold that reader is. ${go('using/readers', 'More below')}</p>
  <p>You can also ask the editor about itself in the chat: <q>help</q>, <q>how do I connect two shapes?</q>, <q>what colours can I use?</q>. It answers from the same lists as these pages, with example sentences you can send. ${go('templates', 'Templates')} turn a list of texts into a process, a timeline, a heart or a mountain in one step.</p>
  <p>Every sentence marked ▸ in this help is a button: it sends that sentence to the editor and closes the help, so you can see what it does. Try one:</p>
  ${says(START_EX)}

  <h2 id="readers">Who answers: VSS-BERT</h2>
  <p>VSS-BERT does a request only when it is sure of it. For a request it holds back, the reply lists the reasons and the request written as a clearer command, with <b>Do it anyway</b> and <b>Edit</b> (the clearer command into the message box, to complete and send). ${icon('more')} Settings › Replies in the chat lets the other readers reply too; VSS-BERT › Settings chooses how bold it is. ${go('asking', 'When it is not sure, it asks')}</p>
  <p>Every reader turns your sentence into the same small command language, <b>SOP Lang</b>, and one drawing engine carries out the commands. “Draw a red circle named Hub” becomes this line, called a <i>wire</i>:</p>
  <pre class="sop">${hlWire(env, { id: 's1', type: 'command', args: { action: 'create', shape: 'circle', color: 'red', name: 'Hub' } })}</pre>
  <dl class="readers">
    <dt>VSS-BERT</dt><dd>The two learned readers below, reading the same requests. When they read a request the same way, it is right about 95 times in 100, so it is done; when they disagree, or only one of them found the request, it is held back and you are told why. ${go('two-readers', 'How VSS-BERT works')}</dd>
    <dt>SOP-BERT</dt><dd>A transformer of the BERT family, the kind of model behind many language tools: one DistilBERT model we fine-tuned on example messages written for this editor. It cuts a message into requests and reads each one. ${nb ? nb[0].toUpperCase() + nb.slice(1) + ', loaded' : 'Loaded'} from this site, kept in your browser’s cache after the first visit.</dd>
    <dt>VSS</dt><dd>Nine small models we trained on the same messages, one per family of actions. VSS stands for VSA Semantic Space; VSA are vector symbolic architectures: each word becomes a long list of numbers (a vector), and the model combines these vectors to find the action and its details. Not a transformer, and built so differently that its agreement with SOP-BERT means something. ${vb ? vb[0].toUpperCase() + vb.slice(1) + ', loaded' : 'Loaded'} from this site.</dd>
    <dt>Rules</dt><dd>Hand-written code that looks for known words (“draw”, “red”, “below”) and their order: a comparison. Instant and exact on the phrasings it was written for, but it has no confidence, so it cannot tell when it is wrong. ${go('rules-vs-learned', 'The Rules, as a comparison')}</dd>
  </dl>
  <p>Why it is built this way: a reader should do only what it is sure of and ask about the rest. In a drawing a confident mistake costs one undo; where actions have serious consequences it is what matters most. ${go('research-question', 'The goal')}</p>

  <h2 id="steps">How one message is read</h2>
  <ol class="steps">
    <li><b>Spelling.</b> A spell checker corrects near misses (“gree circle” → “green circle”). Your message shows what it changed. ${go('spelling', 'How it works')}</li>
    <li><b>Cutting.</b> The message is cut into requests: “draw a red circle named Hub” and “connect Start to it” are two. Each tab cuts with its own cutter, the one its confidence was fitted on: VSS-BERT and SOP-BERT with SOP-BERT’s cutter, VSS with its own, the Rules with theirs. ${go('cutting', 'Each tab’s cutter')}</li>
    <li><b>Reading.</b> Each reader turns each request into one wire of SOP Lang, with a confidence.</li>
    <li><b>Doing or asking.</b> The engine carries out the wires the reader is sure of on that reader’s drawing; the others are held back with a reason. A wire the engine cannot carry out gets a reason too (“There is already a shape named Hub”).</li>
  </ol>
  <p>Nothing you type leaves your browser: every reader runs in this page (the one exception is speech, see ${go('using/voice', 'Voice, languages and collected requests')}). The drawings are not saved: reloading the page starts again from the example drawing.</p>

  <h2 id="replies">Reading the replies</h2>
  <p>A reply is VSS-BERT’s, with its time beside it. To <q>Make Check red and put Done below it</q> it answers:</p>
  <div class="hreply"><div class="rl">Check is now red.<div class="hh">Not done, because I am not sure what you meant:</div><div class="hheld"><div>“put Done below it”</div><div class="hw">– “it” was taken to mean Check; the name was not written</div><div>Write it with the name instead of the word, like this: “Move Done below Check.”, or press Do it anyway.</div><div><span class="lnk">Do it anyway</span> · <span class="lnk">Edit</span></div></div></div><div class="meta"><span class="lnk">VSS-BERT · 152 ms</span> <span class="lnk">details</span></div></div>
  <ul>
    <li><b>The time</b> is how long the reader took to turn your message into SOP Lang. Drawing is not counted. A reader that has not finished loading says so instead of answering.</li>
    <li><b>“Not done, because I am not sure what you meant”</b>: the requests it held back, each with its words, up to three plain reasons (the two readers read a value differently, only one of them found the request, it needs another request that was not done, which shape “it” was taken to mean) and the clearer command: with ‹a gap› where the readers disagree on a value, the name instead of “it”, or both commands when they read different actions. <b>Edit</b> puts that command in the message box without sending it; <b>Do it anyway</b> does that one reading now, as one step you can undo, and says what it ran. A held request stays held until you write it again (then it shows “replaced by your later command”) or press Do it anyway; a bare “yes” is not read as an answer. No numbers in the chat: they are in <b>details</b>. Held back is never counted as an error; a change you did not ask for is. ${go('asking', 'When it is not sure, it asks')}</li>
    <li><b>details</b> under a reply shows how each tab cut the message, what every reader wrote in SOP Lang (all the tabs, not only the ones shown in the chat), what the engine changed, and for questions the logic query it ran.</li>
    <li><b>Buttons under a reply</b> answer the engine’s own question, e.g. “Which circle? Start or Done”: a name answers it.</li>
    <li><b>“I didn’t understand …”</b> is an honest refusal: no request could be read in that part. Every other part of your message is still done. Try plainer words, with shapes and arrows: “connect Plankton to Krill” instead of “plankton feeds the krill”.</li>
    <li><b>A reason instead of a result</b> (“There is already a shape named Hub”, “I can't find a red square”) comes from the engine: the request was understood but could not be done as asked.</li>
    <li><b>Replies of other readers.</b> ${icon('more')} Settings › Replies in the chat lets the Rules, VSS and SOP-BERT reply too, one line each; each changes only its own drawing.</li>
  </ul>

  <h2 id="delete-careful">Deleting: cautious by design</h2>
  <p>A request that removes something (delete, disconnect, forget the rules, clear, and ungroup when it removes a group) is never done by accident. Three rules hold in every tab:</p>
  <ul>
    <li><b>It needs the safety threshold.</b> Even when a tab is set to a bolder level or to <q>execute all</q>, a removing request is done only when its confidence reaches that tab’s default level, the safety threshold. Below it, it is held back with the reason <q>a deleting request needs the safety threshold</q>.</li>
    <li><b>A description that matches several items asks first.</b> <q>Delete the circles</q> names no shape: when it would remove more than one, nothing is removed, and the reply lists them: <q>Delete Start and Done? Write their names, or press Do it anyway.</q> This holds for the Rules too, and at every level. Requests that name what to remove (<q>Delete Start and Done</q>) are not affected, and neither is <q>Clear the canvas</q> (or <q>delete everything</q>): it says exactly what goes, and one <q>Undo</q> brings it all back.</li>
    <li><b>You see exactly what Do it anyway would remove</b>, the links that go with the shapes included: <q>Do it anyway would delete Start and Done, and the links Start → Process and Check → Done.</q></li>
  </ul>
  <p>Why: in the first real session with this demo, <q>Delete background boxes</q> was read as <q>delete every rectangle</q> with high confidence and removed the background, both zones and Process with its links; and at <q>execute all</q> a delete of the title was read as <q>forget the rules</q>, twice. A wrong removal is the mistake that costs most, so these requests ask more often. When a tab is not at its safety threshold, a badge in the chat’s header says so, and one click brings it back.</p>

  <h2 id="screen">What is on the screen</h2>
  <ul class="screen">
    <li><b>The tabs VSS-BERT, Rules, VSS, SOP-BERT</b> above the drawing show each reader’s own drawing: VSS-BERT first, then the Rules as a comparison, then the two parts of VSS-BERT alone (${go('parts-alone', 'The VSS and SOP-BERT tabs')}). A dot on a tab means that drawing differs from the one on screen.</li>
    <li><b>Under each tab</b>: <i>Drawing</i>; <i>SOP Lang</i>, that drawing written as SOP Lang wires; and <i>Settings</i>, the reader’s models, sizes and state, and for the learned readers how bold it is (from more careful to the boldest level, or execute all).</li>
    <li>${icon('copy')} <b>Copy</b> appears when the drawings differ. It copies the drawing on screen, with its undo history, to the other tabs, so every reader starts the next message from the same drawing.</li>
    <li>${icon('view')} <b>Whole canvas / zoom</b>, ${icon('undo')} <b>Undo</b>, ${icon('redo')} <b>Redo</b>, ${icon('clear')} <b>Clear</b> act on every reader’s drawing. ${icon('help')} opens this help.</li>
    <li><b>Zoom and pan.</b> Under the drawing, <b>−</b> and <b>+</b> zoom (the percentage is shown) and <b>fit</b> returns to the automatic view, which always fits the drawing, centred. Ctrl+wheel or a pinch zooms around the pointer; dragging the empty canvas (or one finger) moves the view, while dragging a shape still moves the shape; with the canvas focused, the arrow keys move the view and + / − / 0 zoom and fit. The zoom is the same on every tab. When a change puts shapes outside a zoomed view, <b>fit</b> lights up; the view does not jump by itself.</li>
    <li><b>While the readers load</b>, a panel over the drawing shows each step (VSS, SOP-BERT, the confidence files, a first check) and goes away by itself when VSS-BERT is ready. If a step fails it says why and offers <b>Continue with Rules only</b>.</li>
    <li>${icon('plus')} next to the message box: example sentences and scripted scenarios. ↑ and ↓ in the box bring back earlier messages. Under the drawing, the dictation bar (${icon('mic')}) takes your own language, spoken or typed (below).</li>
    <li>${icon('more')} at the top: <b>Settings</b>: whose replies the chat shows, the collected requests, the spell checker and the capability switches.</li>
    <li><b>Editing on the drawing.</b> A click selects a shape, a text or an arrow (a dashed frame, or a highlighted line); a click on the empty canvas or Esc clears it. <b>Delete</b> or <b>Backspace</b> (when you are not typing in a box) deletes the selected item. A <b>double-click</b> on a shape, a free text or an arrow opens a small box over its text, also on a shape with no label yet: Enter saves, Esc cancels. Each edit is sent as a command (it shows in the chat, e.g. <q>Delete Check</q> → <q>Deleted Check.</q>), every tab does it, and Undo takes it back in one step. Dragging a shape moves it.</li>
    <li><b>A tab not at its safety threshold</b> shows an amber badge at the top of the chat, e.g. <q>VSS-BERT: execute all</q>: a click opens that tab’s Settings; <b>Back to the safety threshold</b> resets every tab in one click. ${go('using/delete-careful', 'Deleting: cautious by design')}</li>
    <li>A message that starts with <code>@</code> is not read by any reader: it is SOP Lang, sent straight to the engine (${go('sop-lang', 'SOP Lang')}).</li>
  </ul>

  <h2 id="voice">Voice, languages and collected requests</h2>
  <p><b>The dictation bar</b> sits under the drawing, beside the message box (on a phone, just above it). It is one row: the microphone, the language code and what the browser understood in your language (Romanian by default), live; you can edit it in place. The English translation goes straight into the message box as soon as it is translated: that is where you read it and, if you want, correct it before sending. Every reader reads English, so the English in the message box is what is sent; the chat shows it with your original words under it in small text. A short note at the end of the row says what the bar is doing (translating, no translation, the microphone not allowed).</p>
  <ul>
    <li>${icon('mic')} <b>The microphone</b> turns listening on or off. Once on, it stays on, through pauses and silences, until you say <q>stop listening</q> or click it again; a green line along the bar shows it is listening. After a reload it does not start by itself (the browser needs a click): <b>Resume listening</b> brings it back in one tap.</li>
    <li><b>The language code</b> (<code>RO</code>) opens a small settings panel: the language (any other as a tag such as <code>pt-BR</code>), send after a pause, read replies aloud, the optional online translation, and what this browser supports. A click elsewhere or Esc closes it.</li>
    <li><b>Spoken commands</b>, said alone or at the end of what you say, in your language or in English: <q>trimite</q> / <q>send</q> sends; <q>șterge</q> or <q>anulează</q> / <q>clear</q> empties the bar and the message box; <q>oprește</q> / <q>stop listening</q> turns the microphone off; <q>fă-o oricum</q> / <q>do it anyway</q> presses the last <b>Do it anyway</b>; <q>editează</q> / <q>edit</q> presses the last <b>Edit</b>. The command word is never part of the message: <q>fă Done roșu trimite</q> sends <q>make Done red</q>. A command in the middle of a sentence is just a word (<q>send Start to the back</q> is a message). <q>Undo</q> is a normal message to the readers. A short note on the bar confirms each command.</li>
    <li><b>The names on the drawing</b> are small buttons under the bar, on one line you can scroll: a tap puts the name into what you said, where the cursor is. Speech recognition often mangles English names (<q>Diamond One</q> for diamond1), so tap the name instead.</li>
    <li><b>I speak English</b> (in the settings panel): the microphone listens in English (en-US) and nothing is translated; your language stays chosen for when you turn it off.</li>
    <li><b>Translation with context.</b> Your words are translated as a sentence in a diagram editor (the translator is given <q>In a diagram editor:</q> in your language before them, and that part is taken off again), so <q>așezarea</q> becomes <q>the layout</q> rather than <q>the settlement</q>. When that does not work, the words are translated alone.</li>
    <li><b>Speech to text</b> is your browser’s own (the Web Speech API), not ours. Chrome may send the audio to its vendor’s servers (Google) to recognise it. Browsers without it (Firefox, for example) let you type in the bar instead.</li>
    <li><b>Translation</b> uses the browser’s built-in translator, which runs on your device (Chrome; the language model downloads once). <b>Text that could not be translated is never sent</b>: the readers would misread it. The note on the bar says so and the bar keeps your words; write the English yourself in the message box, or turn on the online translation (MyMemory, free) in the settings, which sends your text to it. A message typed straight into the message box that does not look like English gets a one-time hint about the bar; it is still sent.</li>
    <li><b>Reading the reply aloud</b> (off by default) reads VSS-BERT’s reply in your language when the browser can translate it on the device, else in English. Listening pauses while it speaks, so the bar does not hear its own voice, and resumes after. Your choices are remembered in this browser.</li>
  </ul>
  <p><b>Collected requests.</b> Every message you send is kept in this browser, with the names on the drawing, the versions of the models, what VSS-BERT did or held back and how sure it was, and what you did next (Do it anyway, Edit, a later command that replaced it, undo right after). The readers’ full readings are not stored: the text, the drawing and the model versions reproduce them. These are the best signals of where a reading was wrong, and they become test data once someone writes the right answer for them. <b>Nothing leaves your browser unless you download the file:</b> ${icon('more')} Settings › Collected requests shows how many there are and the last few, and has <b>Download as JSONL</b>, <b>Clear</b> and a switch to stop collecting (on by default; at most the last 5000 are kept).</p>

  <h2 id="next">Where to go next</h2>
  <div class="cards">
    <a class="card" href="#help/draw"><b>What you can draw</b><span>Shapes, colours, sizes, outlines, labels</span></a>
    <a class="card" href="#help/do"><b>Everything you can do</b><span>Every action, with examples</span></a>
    <a class="card" href="#help/ask"><b>Everything you can ask</b><span>Every question, with examples</span></a>
    <a class="card" href="#help/sop-lang"><b>SOP Lang</b><span>The language the readers write</span></a>
    <a class="card" href="#help/research-question"><b>The goal</b><span>Do only what you are sure of, ask about the rest</span></a>
    <a class="card" href="#help/two-readers"><b>VSS-BERT</b><span>SOP-BERT paired with VSS: fewer confident mistakes</span></a>
    <a class="card" href="#help/asking"><b>When it is not sure, it asks</b><span>What you see, and what you can do</span></a>
    <a class="card" href="#help/architecture"><b>How it works inside</b><span>Every part, model and number</span></a>
  </div>`;
  return h;
}

/* ================================================================== WHAT YOU CAN DRAW ================================================================== */
function draw(env) {
  const { K, engine } = env, L = k => engine.legend.get(k);
  const kinds = valuesOf(engine, 'shape').filter(v => v !== 'any');
  let h = `<p class="lead">Shapes come in ${kinds.length} kinds, with a colour, a size, a name, and optionally a label and an outline. Say any of them when you draw a shape, or change them later.</p>
  ${says(['Draw a gold star named Gem with a black outline in the top right', 'Turn Done into a star'])}
  <h2 id="kinds">${kinds.length} kinds of shape</h2>
  <div class="kinds">${kinds.map(k => { const s = shp(K, { shape: k, color: 'white' }), d = K.dims(s); s.x = d.w / 2 + 4; s.y = d.h / 2 + 4;
    return `<figure>${pic(env, `0 0 ${d.w + 8} ${d.h + 8}`, g => env.drawShape(g, s), k)}<figcaption><b>${escH(k)}</b><span>${escH(alsoText(L('shape'), k, 3))}</span></figcaption></figure>`; }).join('')}</div>
  <p class="note">Any other kind (a cloud, an arrow shape, a cylinder) is not available; the reply says so.</p>`;
  const colors = valuesOf(engine, 'color');
  h += `<h2 id="colours">${colors.length} colours</h2><div class="swatches">${colors.map(c => `<span class="sw8"><i style="background:${K.COLOR_HEX[c] || 'transparent'}"></i><b>${escH(c)}</b>${alsoText(L('color'), c, 2) ? `<em>${escH(alsoText(L('color'), c, 2).replace(/^also: /, ''))}</em>` : ''}</span>`).join('')}</div>
  <p class="note">Only these names; codes such as #ff8800 are not understood. A shape drawn without a colour is white.</p>`;
  const sizes = valuesOf(engine, 'size');
  { let x = 8; const row = sizes.map(z => { const s = shp(K, { size: z, color: 'blue' }); s.x = x + s.size / 2; x += s.size + 22; s.y = 130 - s.size / 2; return s; });
    h += `<h2 id="sizes">${sizes.length} sizes</h2>${pic(env, `0 0 ${x - 14} 152`, (g, add) => row.forEach((s, i) => { env.drawShape(g, s); add('text', { x: s.x, y: 148, 'text-anchor': 'middle', class: 'hcap' }, sizes[i]); }), 'sizes from ' + sizes[0] + ' to ' + sizes[sizes.length - 1], 'wide')}
    <p>Medium is the default. “Bigger” and “smaller” multiply the size (by 1.5 and by two thirds), and “twice as big” by 2.</p>
    ${says(['Make Process bigger', 'Make Check twice as big'])}`; }
  h += `<h2 id="outline">Name, label and outline</h2>
  ${pic(env, '0 0 420 120', g => {
    env.drawShape(g, shp(K, { name: 'Process', shape: 'rectangle', label: 'Validate', x: 70, y: 66 }));
    env.drawShape(g, shp(K, { name: 'Hub', color: 'teal', outline: 'black', x: 210, y: 66 }));
    env.drawShape(g, shp(K, { name: 'Gem', shape: 'star', color: 'gold', outline: 'red', x: 340, y: 66 }));
  }, 'a rectangle named Process labeled Validate, a teal circle with a black outline, a gold star with a red outline', 'mid')}
  <ul>
    <li><b>Name</b>: the small text above a shape. You use it to point at the shape later. Letters, digits, - and _, starting with a letter; no spaces. Names are not case-sensitive. ${say('Rename Done to End')}</li>
    <li><b>Label</b>: text written inside the shape, put in quotes. ${say('Label Done "finish"')}</li>
    <li><b>Outline</b>: a thick border in any of the colours above, or none. ${say('Give Process a red outline')} ${say('Give Process no outline')}</li>
  </ul>
  <h2 id="free-text">Free text</h2>
  <p>${escH(TOPICS['shape:text'].d)}</p>
  ${says(TOPICS['shape:text'].ex)}
  <h2 id="panels">Backgrounds and zones</h2>
  <p>A rectangle can be any size (width and height in pixels), see-through (fill light, faint or none) and a <b>background</b> or a <b>zone</b>: new shapes are placed on it rather than around it, and it stays behind the shapes. The drawing the page opens with has a background (Backdrop), two zones (IntakeZone, ReviewZone) and the shapes on them; each zone with its shapes and caption is a group (Intake, Review). Newer shapes go on top; “bring to the front” and “send to the back” change that.</p>
  ${says(['Send Start to the back', 'Bring Backdrop to the front', 'Move Review to the bottom right'])}
  <h2 id="common-sense">What it fills in by itself</h2>
  <p>Whatever you leave out gets a sensible choice, never one that overrides what you said. A shape for something it knows takes its usual look and place: <q>draw a sun</q> is a large gold circle in the top right, a cloud a white ellipse at the top, the sky a light-blue band across the top behind everything, the ground or grass a band across the bottom, water blue, a tree green. Something drawn <b>inside</b> a shape (<q>two small circles inside Head</q>) is sized to fit it and placed within it, side by side when there are several; something drawn <b>on</b> a shape (<q>a triangle on House</q>) sits on its top edge, and a roof gets the width of the house. New shapes never land on top of others unless you put them inside one.</p>
  ${says(['Draw a sun', 'Draw a circle in Process', 'Draw a triangle on Process'])}
  <h2 id="describe">Pointing at shapes by their look</h2>
  <p>You do not need names: “the green circle”, “all squares”, “the newest star”, “every circle that is not blue” point at shapes by what they look like. If a description fits more than one shape, the reply asks which one you mean.</p>
  ${says(['Make the green circle bigger', 'Make all circles red', 'Delete the yellow diamond'])}`;
  return h;
}

/* ================================================================== ARROWS AND LINES ================================================================== */
function arrows(env) {
  const { K, engine } = env, L = k => engine.legend.get(k);
  const styles = valuesOf(engine, 'style'), heads = valuesOf(engine, 'arrow'), HEADW = { forward: 'arrow (one way)', both: 'two-way arrow', none: 'plain line' };
  return `<p class="lead">A connection always goes between two shapes, as a straight line. You choose its style, its arrow heads, a colour and a label.</p>
  ${says(['Connect Start to Done with a dashed arrow'])}
  <h2 id="styles">Styles and heads</h2>
  ${pic(env, `0 0 ${110 + styles.length * 150} ${34 + heads.length * 54}`, (g, add) => {
    styles.forEach((st, j) => add('text', { x: 110 + j * 150 + 70, y: 18, 'text-anchor': 'middle', class: 'hcap' }, st));
    heads.forEach((hd, i) => {
      const y = 52 + i * 54; add('text', { x: 4, y: y + 5, class: 'hcap' }, HEADW[hd] || words(hd));
      styles.forEach((st, j) => { const a = shp(K, { size: 'tiny', x: 110 + j * 150 + 16, y }), b = shp(K, { size: 'tiny', x: 110 + j * 150 + 124, y }); env.drawEdge(g, { id: 'x', from: '', to: '', style: st, arrow: hd }, a, b, 0); env.drawShape(g, a); env.drawShape(g, b); });
    });
  }, 'connection styles: ' + styles.join(', ') + '; arrow heads: ' + heads.join(', '), 'wide')}
  <ul>
    <li><b>Styles</b>: ${styles.map(s => `<code>${escH(s)}</code>`).join(', ')}. Solid is the default.</li>
    <li><b>Heads</b>: ${heads.map(s => `<code>${escH(HEADW[s] || words(s))}</code>`).join(', ')}. A one-way arrow is the default; “line” means no heads. ${say('Connect Start and Check with a two-way arrow')} ${say('Connect Done to Start with a dotted line')}</li>
    <li><b>Colour and label</b>: any colour of the shapes, and text in quotes written next to the line. ${say('Connect Start to Done with a red arrow labeled "skip"')}</li>
  </ul>
  <h2 id="many">Several shapes at once</h2>
  ${pic(env, '0 0 420 96', g => {
    const a = shp(K, { name: 'A', size: 'small', x: 40, y: 56 }), b = shp(K, { name: 'B', size: 'small', x: 210, y: 56 }), c = shp(K, { name: 'C', size: 'small', x: 380, y: 56 });
    env.drawEdge(g, { id: 'x1', from: 'A', to: 'B', style: 'solid', arrow: 'forward' }, a, b, 0); env.drawEdge(g, { id: 'x2', from: 'B', to: 'C', style: 'solid', arrow: 'forward', label: 'yes' }, b, c, 0);
    [a, b, c].forEach(s => env.drawShape(g, s));
  }, 'a chain A to B to C', 'mid')}
  <p>One shape to several, or a list joined as a chain: ${escH(listing(valuesOf(engine, 'pairing').map(v => `“${cuesOf(L('pairing'), v)[0] || words(v)}”`)))}.</p>
  ${says(['Connect Start, Check and Done in a chain', 'Connect Start to Process, Check and Done'])}
  <h2 id="edge-labels">Labels on arrows already drawn</h2>
  <p>Name the arrow by its two ends (${['the arrow between Process and Check', 'the arrow from Check to Done', 'the link Process–Check', 'the Process→Check line'].map(x => `“${escH(x)}”`).join(', ')}) and say the text. A new label replaces the old one; “remove the label” takes it away. With only one end (“the arrow from Process”) it works when that shape has one arrow; with several the reply asks which one. If there is no arrow between the two shapes, the reply says so and nothing changes.</p>
  ${says(['Label the arrow between Process and Check as Valid', 'Put the label "maybe" on the arrow from Check to Done', 'Name the link Start–Process Begin', 'Remove the label of the arrow between Check and Done', 'What does the arrow from Check to Done say?'])}
  <h2 id="remove">Removing connections</h2>
  <p>Between two shapes, all arrows of one shape, or every arrow.</p>
  ${says(['Disconnect Start from Process', 'Remove all connections'])}
  <p class="note">The label of an arrow can be changed (above); to change its style or colour, disconnect it and connect again. A shape cannot be connected to itself.</p>`;
}

/* ================================================================== WHERE THINGS GO ================================================================== */
function where(env) {
  const { K, engine } = env;
  const pos = valuesOf(engine, 'position'), rel = pos.filter(v => !isSpot(v)), spots = pos.filter(isSpot), dirs = valuesOf(engine, 'direction');
  return `<p class="lead">A new or moved shape can go next to another shape, in a named part of the canvas, at exact coordinates, or a distance away. Without a place, a new shape goes to a free spot.</p>
  <h2 id="next-to">Next to another shape</h2>
  <p>${rel.map(v => `<code>${escH(words(v))}</code>`).join(', ')}. The shape goes on that side with a gap, moved a little if the spot is taken. “Near” or “next to” picks a free side.</p>
  ${pic(env, '0 0 440 250', g => {
    const hub = shp(K, { name: 'Hub', color: 'blue', x: 220, y: 128 }); env.drawShape(g, hub);
    [['left of', 110, 128], ['right of', 330, 128], ['above', 220, 42], ['below', 220, 218]].forEach(([n, x, y]) => env.drawShape(g, shp(K, { name: n, size: 'small', x, y })));
  }, 'positions around a shape named Hub: left of, right of, above, below', 'mid')}
  ${says(['Draw a tiny orange triangle named T1 next to Start', 'Add a white ellipse named Note labeled "draft" below Done', 'Draw a teal square named Box between Start and Done'])}
  <h2 id="canvas-parts">A part of the canvas</h2>
  <p>The canvas is 800 × 500 pixels. ${spots.map(v => `<code>${escH(words(v))}</code>`).join(', ')}; or exact coordinates, x from the left and y from the top.</p>
  ${pic(env, '0 0 800 500', (g, add) => {
    add('rect', { x: 2, y: 2, width: 796, height: 496, rx: 14, class: 'hcanvas' });
    spots.forEach(v => { const x = /Left$|^left$/.test(v) ? 110 : /Right$|^right$/.test(v) ? 690 : 400, y = /^top/.test(v) ? 80 : /^bottom/.test(v) ? 420 : 250;
      add('circle', { cx: x, cy: y, r: 9, class: 'hdot' }); add('text', { x, y: y + 42, 'text-anchor': 'middle', class: 'hcap big' }, words(v)); });
  }, 'the canvas with its named places', 'canvas')}
  ${says(['Draw a huge purple hexagon named Big in the bottom right', 'Draw a circle named Hub at 400, 250', 'Move Done to the top right'])}
  <h2 id="distance">By a distance</h2>
  <p>Move ${dirs.map(v => `<code>${escH(v)}</code>`).join(', ')}, by a number of pixels (80 if you say none).</p>
  ${says(['Move Done left by 100', 'Move Check down'])}
  <h2 id="two">Two conditions at once</h2>
  ${pic(env, '0 0 300 250', g => {
    env.drawShape(g, shp(K, { name: 'Check', shape: 'diamond', color: 'yellow', x: 150, y: 50 }));
    env.drawShape(g, shp(K, { name: 'Q', shape: 'diamond', color: 'pink', size: 'small', x: 150, y: 128 }));
    env.drawShape(g, shp(K, { name: 'Done', color: 'green', x: 150, y: 210 }));
  }, 'a pink diamond Q placed below Check and above Done', 'small')}
  <p>Up to two positions next to shapes, plus one part of the canvas. If no free spot satisfies all of them, the shape goes where most of them hold and the reply says which one was not met.</p>
  ${says(['Draw a pink diamond named Q below Check but above Done', 'Draw a navy rectangle named Side left of Done and in the bottom left'])}
  <h2 id="groups">Groups</h2>
  ${pic(env, '0 0 320 120', g => {
    const S = { shapes: [shp(K, { name: 'Start', color: 'blue', x: 60, y: 70 }), shp(K, { name: 'Process', shape: 'rectangle', label: 'Validate', x: 200, y: 70 })], groups: [{ name: 'Intake', members: ['Start', 'Process'] }] };
    if (env.drawGroups) env.drawGroups(g, S); S.shapes.forEach(s => env.drawShape(g, s));
  }, 'a group named Intake around Start and Process', 'mid')}
  <p>A group is drawn as a dashed frame with its name. Its name works like a shape name: you can move it, copy it, place things next to it. A shape is in one group at a time; groups cannot contain groups.</p>
  ${says(GROUP_PRE.concat([{ text: 'Move Intake to the bottom right', pre: GROUP_PRE }]))}`;
}

/* ================================================================== EVERYTHING YOU CAN DO ================================================================== */
function doPage(env) {
  const { engine } = env, L = k => engine.legend.get(k);
  const acts = valuesOf(engine, 'action'), seen = new Set();
  const item = (key, type, x, extra) => {
    const ps = type === 'command' ? providers(engine, 'command', 'action', key) : providers(engine, key, null, null);
    return `<div class="hitem"><div class="ht"><b>${escH(x.t)}</b>${offNote(ps)}</div><p>${escH(x.d || '')}${extra || ''}</p>${says(x.ex)}</div>`;
  };
  let h = `<p class="lead">Every action the engine knows, with sentences to try. Point at shapes by name (“Done”, or with its kind in front: “the shape Done”, “the circle named Done”), by description (“the yellow diamond”, “the newest circle”), or all at once (“all circles”, “everything”).</p>
  <p>One message can hold several requests: <q>draw a black circle named A, a white circle named B and connect A to B</q>.</p>
  <nav class="jump" aria-label="On this page">${ACTION_GROUPS.map(([t], i) => `<a href="#help/do/g${i}">${escH(t)}</a>`).join('')}</nav>`;
  ACTION_GROUPS.forEach(([title, keys], i) => {
    const parts = keys.map(k => {
      if (WIRE_ITEMS[k]) return engine.wireTypes.has(k) ? item(k, k, WIRE_ITEMS[k]) : '';
      if (k === 'labelEdge') return acts.includes('label') && engine.handlers.some(h => h.type === 'command' && h.when && h.when.action === 'label' && (h.when.from || h.when.to)) ? item('label', 'command', EDGE_LABEL) : '';
      if (k === 'styleEdge') return acts.includes('set') && engine.handlers.some(h => h.type === 'command' && h.when && [].concat(h.when.action).includes('set') && (h.when.from || h.when.to)) ? item('set', 'command', EDGE_STYLE) : '';
      if (!acts.includes(k)) return '';
      seen.add(k);
      const x = ACTIONS[k], ex = k === 'arrange' ? ` Layouts: ${valuesOf(engine, 'layout').join(', ')}.` : '';
      return item(k, 'command', x, ex);
    }).join('');
    if (parts) h += `<h2 id="g${i}">${escH(title)}</h2>${parts}`;
  });
  const rest = acts.filter(a => !seen.has(a));
  if (rest.length) h += `<h2 id="other">Other actions</h2>${rest.map(a => `<div class="hitem"><div class="ht"><b>${escH(words(a))}</b></div><p class="note">Words it is read from: ${escH(cuesOf(L('action'), a).join(', ') || a)}</p></div>`).join('')}`;
  return h;
}

/* ================================================================== TEMPLATES ================================================================== */
function templates(env) {
  const T = TK(); if (!T) return '<p class="note">The templates are not loaded.</p>';
  const cat = T.catalogue(), fam = f => cat.filter(c => c.family === f);
  const item = c => `<div class="hitem" id="t-${escH(c.name)}"><div class="ht"><b>${escH(c.t)}</b> <code>template=${escH(c.name)}</code></div><p>Good for ${escH(c.good)}. ${escH(cap1(c.how))}. ${c.min === c.max ? c.min : `${c.min} to ${c.max}`} items${c.uses2 ? ', and a second list' : ''}.</p>${says([c.ex])}</div>`;
  return `<p class="lead">A template turns a list of texts into a whole diagram in one step: the shapes, their texts and their arrows, placed in a free part of the drawing (or a new frame when there is none). It is drawn as one group, so it moves, copies and is undone as one block; its items are named after their texts.</p>
  <p>Say the form and the items: <q>make a timeline of Kickoff, Design, Build and Launch</q>. You can add a title (<q>titled "2027"</q>), a colour scheme (<q>in warm colours</q>: ${escH(listing(Object.keys(T.SCHEMES)))}) or one colour (<q>in blue</q>), a size (small to huge), a place (<q>in the bottom half</q>, <q>below Done</q>) and, for some, a second list (<q>against …</q>, <q>with roots …</q>). Without items you get placeholders: <q>a 5-step process</q>. Shapes you already have can be laid out in a form: <q>arrange Start, Process, Check and Done as a cycle</q>.</p>
  <h2 id="structure">Structure (${fam('structure').length})</h2>${fam('structure').map(item).join('')}
  <h2 id="emotion">Forms with a feeling (${fam('emotion').length})</h2><p>Forms that recall something people feel, made only of the usual shapes, texts and arrows.</p>${fam('emotion').map(item).join('')}`;
}
const cap1 = x => x ? x[0].toUpperCase() + x.slice(1) : x;

/* ================================================================== EVERYTHING YOU CAN ASK ================================================================== */
function askPage(env) {
  const { engine } = env, L = k => engine.legend.get(k);
  const asks = valuesOf(engine, 'ask');
  let h = `<p class="lead">Questions never change the drawing. The shapes an answer is about light up for a few seconds.</p>`;
  for (const a of asks) {
    const x = ASKS[a] || { t: words(a), d: `Words it is read from: ${cuesOf(L('ask'), a).join(', ')}`, ex: [] };
    let extra = '';
    if (a === 'property' && L('property')) extra = ` About: ${valuesOf(engine, 'property').map(words).join(', ')}.`;
    if (a === 'extreme' && L('superlative')) extra = ` One of: ${valuesOf(engine, 'superlative').filter(v => !['closest', 'farthest'].includes(v)).map(words).join(', ')}.`;
    if (a === 'list') extra = ' Filter by kind, colour, “not” a colour, size, outline, label, position, or what it is connected to.';
    h += `<div class="hitem" id="q-${escH(a)}"><div class="ht"><b>${escH(x.t)}</b>${offNote(providers(engine, 'question', 'ask', a))}</div>${x.d || extra ? `<p>${escH(x.d || '')}${escH(extra)}</p>` : ''}${says(x.ex)}</div>`;
  }
  h += `<p class="note">How the answers are computed (plain code, or logical facts and a Datalog query): ${go('capabilities', 'Capabilities')}.</p>`;
  return h;
}

/* ================================================================== WHAT IT CANNOT DO ================================================================== */
function limits(env) {
  const { engine } = env;
  const kinds = valuesOf(engine, 'shape').filter(v => v !== 'any'), colors = valuesOf(engine, 'color'), sizes = valuesOf(engine, 'size');
  return `<p class="lead">What the editor does not do, by design or not yet. The readers’ own weak spots are in ${go('limits-today', 'Where it is weak today')}.</p>
  <ul>
    <li>Only the ${kinds.length} shapes, ${colors.length} colours and ${sizes.length} sizes of ${go('draw', 'What you can draw')}: no free drawing, no curves, no images, no icons. Free text and templates are made of these same shapes, texts and arrows.</li>
    <li>Arrows are straight lines between two shapes: no curved or bent arrows, no arrow to empty space, no arrow from a shape to itself. An existing arrow cannot be restyled (only its label can be changed); disconnect and connect again.</li>
    <li>No text formatting beyond a size and a colour (no fonts, no bold), no line thickness, no rotation; transparency only as the fills solid, light, faint and none.</li>
    <li>At most two positions next to shapes and one part of the canvas in one request; at most 12 new shapes in one request.</li>
    <li>Groups cannot be nested, and a shape is in one group at a time.</li>
    <li>English only. Words from other worlds (“the manager approves the budget”) are not translated into diagrams; say it with shapes and arrows. A part of a message it cannot map to a request gets “I didn’t understand …”, and the rest of the message is still done.</li>
    <li>No saving, export or sharing: the drawing lives in this page until you reload it.</li>
    <li>The readers make mistakes. VSS-BERT does a request only when it is sure of it, and still about 2 in 100 of what it does are wrong; it holds back about half of the requests and says why (${go('asking', 'When it is not sure, it asks')}). Undo fixes any change in one step. ${say('Undo')}</li>
  </ul>`;
}

/* ================================================================== SOP LANG ================================================================== */
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
  try { for (const t of env.startMessages || []) { const f = t.trim().startsWith('@') ? { nodes: K.parse(t) } : s.formalize(t, { names: s.world.state.shapes.map(x => x.name), last: [] }); s.engine.run(f.nodes); } } catch (e) { return []; }
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
  let h = `<p class="lead">SOP Lang is the small command language between the readers and the drawing engine. A reader’s only job is to turn your English into SOP Lang; the engine only ever sees SOP Lang. Because every reader must write the same language, their readings can be compared line by line, which is how VSS-BERT checks that its two readers agree.</p>
  <h2 id="wire">One request, one wire</h2>
  <p>Each request becomes one line, called a <b>wire</b>:</p>
  <pre class="sop">${hlWire(env, { id: 's1', type: 'command', args: { action: 'create', shape: 'star', color: 'red', name: 'Gem' } })}</pre>
  <ul>
    <li><code>@s1</code> is the wire’s id. Another wire can use its result by writing <code>$s1</code>.</li>
    <li><code>command</code> is the wire’s type (the list is below).</li>
    <li>Each <code>key=value</code> answers one fixed question: <code>color=red</code> answers “What color is it?”. A wire answers only the questions your sentence touches; the engine fills in the rest with defaults.</li>
  </ul>
  <h2 id="types">Wire types</h2>
  <dl class="readers">${[...engine.wireTypes.entries()].map(([t, w]) => `<dt><code>${escH(t)}</code></dt><dd>${escH(WIRE_WORDS[t] || w.doc + '.')}</dd>`).join('')}</dl>`;

  /* worked examples: written by the Rules reader now, run on a copy of the opening drawing */
  WORKED.forEach((text, i) => {
    const nodes = formalize(env, text);
    h += `<h2 id="example${i + 1}">Example ${i + 1}: from a sentence to the drawing</h2>
    <p class="egq">${say(text)}</p>
    <p>The Rules reader writes:</p>
    <pre class="sop">${nodes.map(n => hlWire(env, n)).join('\n') || '<span class="cm"># nothing</span>'}</pre>
    ${nodes.map(n => `<p class="wname"><code>@${escH(n.id)}</code> (${escH(n.type)})</p>${explainWire(env, n)}`).join('')}
    <p>The engine, on the drawing the page opens with:</p><ul class="wkeys">${engineRun(env, nodes).map(t => `<li>${escH(t)}</li>`).join('')}</ul>`;
    if (i === 1) h += `<p>The first wire is a <code>mention</code>: a description the engine resolves to a shape before the question runs. No reader needs to see the drawing; if two shapes fit, the reply asks which one.</p>`;
  });
  h += `<h2 id="yourself">Writing SOP Lang yourself</h2>
  <p>A message that starts with <code>@</code> is read as SOP Lang and goes to the engine without any reader. Several wires go on separate lines.</p>
  ${says(['@g1 command action=create shape=star color=gold name=Gem position=center'])}`;

  /* reference: every key of the legend, grouped by purpose */
  h += `<h2 id="keys">All keys and values</h2>
  <p>Every question the engine knows (the <b>legend</b>), with its possible answers. This list is read from the engine itself, so it is always complete.</p>
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
    h += `<h3>${escH(title)}</h3>${sub ? `<p class="note">${escH(sub)}</p>` : ''}${body}`;
  }
  const other = [...engine.legend.questions.keys()].filter(k => !used.has(k));
  if (other.length) h += `<h3>Other</h3>${other.map(row).join('')}`;
  h += `</div><p class="note">The words the Rules reader looks for are written by hand and extended with words found in the training messages. The VSS reader learns its own from those messages; SOP-BERT uses none. How the engine is built from the legend and its plugins: ${go('engine', 'The engine and the legend')}.</p>`;
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
const switchHTML = (p, c) => `<label class="sw"><input type="checkbox" data-plug="${escH(p.name)}" ${p.enabled ? 'checked' : ''} ${p.locked ? 'disabled' : ''} aria-label="Switch ${escH(c.t)} on or off">${p.locked ? 'always on' : p.enabled ? 'on' : 'off'}</label>`;
function capabilities(env) {
  const { engine } = env;
  let h = `<p class="lead">The engine is built from separate parts, one per kind of thing it can do. Each card says what that part lets you do, and what stops working without it.</p>
  <p>Switch a part off and send one of its examples: the readers still understand your sentence and still write the SOP Lang, but the engine answers that it cannot do it. That shows which part of the system did the work, and that it says so honestly when it cannot. Switches apply to every reader until the page is reloaded; the same switches are in ${icon('more')} Settings › Capabilities.</p>`;
  for (const p of engine.plugins) {
    const c = CAPS[p.name] || { t: p.title, d: p.description, ex: [] };
    const { lost, still } = lostWithout(engine, p);
    let off = c.off || '';
    const q = t => `“${t}”`;
    if (!c.off) off = (lost.length ? `These stop working: ${listing(lost.map(q))}. ` : '') + (still.length ? [...new Set(still.map(s => listing([...new Set(s.by)].map(q))))].map(by => `Still answered, by ${by}: ${listing(still.filter(s => listing([...new Set(s.by)].map(q)) === by).map(s => q(s.label)))}. `).join('') : '') + (lost.length ? 'Asking for one of them gets the reply that this part is switched off.' : '');
    h += `<section class="plug cap${p.enabled ? '' : ' off'}" id="cap-${escH(p.name)}"><header><h3>${escH(c.t)}</h3>${switchHTML(p, c)}</header>
    <p>${escH(c.d)}</p>${c.ex.length ? says(c.ex) : ''}${off ? `<p class="capoff"><b>When switched off:</b> ${escH(off)}</p>` : ''}</section>`;
  }
  return h;
}
/* the switches alone, for ⋮ Settings › Capabilities (the explanation is the Help page above) */
function capSwitches(env) {
  const { engine } = env;
  return `<p class="intro">Switch a part of the engine off to see which part does the work: the readers still write the SOP Lang, and the engine says it cannot do it. What each part does and what stops without it: <button type="button" class="btn" data-help="capabilities">Help › Capabilities</button></p>
  <div class="capsw">${engine.plugins.map(p => { const c = CAPS[p.name] || { t: p.title, d: p.description }; return `<div class="plug${p.enabled ? '' : ' off'}"><header><h4>${escH(c.t)}</h4>${switchHTML(p, c)}</header><p>${escH(c.d)}</p></div>`; }).join('')}</div>`;
}

/* the pages, by the id docs/js/docs.js shows them under (#help/<id>) */
const pages = { start, using, draw, arrows, where, do: doPage, templates, ask: askPage, limits, 'sop-lang': sop, capabilities };
const HelpKit = { pages, CREDIT, capSwitches, examples, hlWire, ACTIONS, ASKS, CAPS, EDGE_LABEL, EDGE_STYLE, TOPICS };
if (typeof module !== 'undefined') module.exports = HelpKit; else root.HelpKit = HelpKit;
})(typeof window !== 'undefined' ? window : this);
