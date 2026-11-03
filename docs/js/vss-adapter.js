// vss-adapter.js: from a VSS reading of one clause (an event wire with its entity wires, or a gold frame from the generator) to the
// SOP Sketchpad's own wires (command / question / fact / rule, plus mention wires for descriptions), so that every formalizer feeds
// the same engine and the same reasoner. Pure functions; no DOM.

const REL = { left_of: "leftOf", right_of: "rightOf", above: "above", below: "below", next_to: "near", between: "between" };
const REGION = { center: "center", top: "top", bottom: "bottom", left_side: "left", right_side: "right", top_left: "topLeft", top_right: "topRight", bottom_left: "bottomLeft", bottom_right: "bottomRight" };
export const SHAPES = { circle: "circle", circles: "circle", square: "square", squares: "square", rectangle: "rectangle", rectangles: "rectangle", triangle: "triangle",
  triangles: "triangle", diamond: "diamond", diamonds: "diamond", ellipse: "ellipse", ellipses: "ellipse", hexagon: "hexagon", hexagons: "hexagon", star: "star", stars: "star",
  text: "text", texts: "text" };   // text: a free text (shape=text, LEGEND_EXT.md; worlds built with LEGEND_EXT=1)
const PLURAL = new Set(["circles", "squares", "rectangles", "triangles", "diamonds", "ellipses", "hexagons", "stars", "shapes"]);
export const PROPERTY = { what_color: "color", where_is: "position", how_big: "size", what_shape: "shape", what_says: "label" };
// the layout operations of HIGH_LEVEL_OPS.md and reverse (worlds built with LEGEND_EXT=1, training/sketch/TRAIN_PLAN_1103.md)
const OPS = new Set(["improve", "respace", "snap", "fit", "flip", "sort", "groupBy", "equalize", "straighten", "untangle"]);
const COMMANDS = new Set(["create", "delete", "move", "set", "resize", "rename", "label", "duplicate", "swap", "connect", "disconnect", "align", "arrange", "distribute", "toFront", "toBack", "undo", "redo", "forget", "group", "ungroup", "reverse", ...OPS]);
const QUESTIONS = new Set(["count", "exists", "list", "property", "describe", "neighbors", "path", "reachable", "cycle", "check", "extreme", "nearest", "connected", "degree", "members", "groupOf", "help"]);
// LEGEND_EXT value tokens -> legend values: the world token is a prefix + the value, a capital written as "_" + the letter (training/sketch/front.py
// PREFIX / ext_token: topic toFront -> tp_to_front). The tables are legend key -> token prefix, not words.
const EXT_PREFIX = { template: "tpl_", scheme: "sch_", fill: "fill_", layer: "layer_", topic: "tp_", aspect: "asp_", property: "prop_", kind: "kind_" };
export function extValue(key, tok) {
  const p = EXT_PREFIX[key], t = String(tok);
  if (!p || !t.startsWith(p)) return undefined;
  return t.slice(p.length).replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}
const SUPER = { biggest: "biggest", smallest: "smallest", leftmost: "leftmost", rightmost: "rightmost", topmost: "topmost", bottommost: "bottommost", mostconnected: "mostConnected", leastconnected: "leastConnected", closest: "closest", farthest: "farthest" };

/** VSS wires -> { event, roles, verb }; roles: role -> string | {head, attr, det} */
export function readingFromWires(wires, verb, tokens = null) {
  const top = wires[0]; if (!top) return null;
  const byId = new Map(wires.map((w) => [w.id, w])), roles = {};
  for (const l of top.lines) {
    if (l.key.startsWith("_")) continue;
    const refs = l.refs();
    if (refs.length > 1) roles[l.key] = refs.map((id) => byId.get(id)).filter(Boolean).map((en) => ({ head: en.value("head") }));   // a set role: a list of shapes
    else if (refs.length) {
      const en = byId.get(refs[0]); if (!en) continue;
      roles[l.key] = { head: en.value("head"), attr: en.value("attr"), det: en.value("det") };
    } else roles[l.key] = l.text;
  }
  // offers (`_offer.<role>=<word>`): a word the reader placed nowhere that exactly one empty role of the event admits. The vss-demo app
  // asks the user to confirm them; this demo accepts them and History lists them.
  const offered = {};
  for (const l of top.lines) {
    if (!l.key.startsWith("_offer.")) continue;
    const role = l.key.slice(7), word = String(l.text);
    if (roles[role] != null) continue;
    roles[role] = ENTITY_ROLES.has(role) ? { head: word } : word; offered[role] = word;
  }
  return { event: top.type, roles, verb: verb || top.value("_verb"), offered, tokens };
}
const ENTITY_ROLES = new Set(["object", "landmark", "landmark2", "landmark3", "source", "target", "edge", "linked"]);

/** the gold frame of an eval row -> the same shape */
export function readingFromGold(row, normalizedTokens, verbsOfEvent) {
  const verb = (normalizedTokens || []).find((t) => (verbsOfEvent[row.event] || []).includes(t)) || null;
  return { event: row.event, roles: row.roles, verb };
}

/** reading -> { nodes, notes } in the demo's SOP Lang (ids s<k> / m<k>) */
export function toNodes(reading, info, ctx, seq) {
  seq = seq || { s: 0, m: 0 }; const nodes = [], notes = [];
  if (!reading || !reading.event) return { nodes, notes: ["no reading"] };
  const names = new Map((ctx.names || []).map((n) => [n.toLowerCase(), n]));
  const refs = ctx.refs || new Map();   // names created earlier in the same message -> {ref: id}
  const nameOf = (tok) => { const raw = (info.names && info.names[tok]) || tok.replace(/^n_/, ""); const k = String(raw).toLowerCase(); return refs.get(k) || names.get(k) || raw; };
  const plainName = (tok) => { const raw = (info.names && info.names[tok]) || tok.replace(/^n_/, ""); return names.get(String(raw).toLowerCase()) || raw; };
  const textOf = (tok) => (info.texts && info.texts[tok]) || (info.names && info.names[tok]) || String(tok).replace(/^[tn]_/, "").replace(/_/g, " ");   // labelled Rocks: an unquoted label is a name token
  const R = reading.roles || {}; let negUsed = false;
  const ref = (en) => {
    if (en == null) return undefined;
    if (typeof en === "string") en = { head: en };
    const h = en.head || "";
    if (h.startsWith("n_")) return nameOf(h);
    if (h === "it" || h === "them") {
      const last = ctx.last || [];
      if (!last.length) { notes.push(`couldn't tell what “${h}” refers to`); return undefined; }
      return last.length === 1 ? last[0] : last.slice();
    }
    const a = {};
    const all = h === "everything" || h === "canvas" || h === "all" || PLURAL.has(h) || ["all", "every", "each"].includes(en.det);   // head "all": "the whole diagram" (LEGEND_EXT)
    if (all) a.quantifier = "all";
    if (SHAPES[h]) a.shape = SHAPES[h];
    if (en.attr) a.color = en.attr;
    if (en.det === "newest" || en.det === "oldest") { a.recency = en.det; delete a.quantifier; }
    if (R.notcolor && !negUsed) { a.notColor = String(R.notcolor).replace(/^not_/, ""); negUsed = true; }
    const id = "m" + (++seq.m); nodes.push({ id, type: "mention", args: a }); return { ref: id };
  };
  // a position: a canvas region, up to two relations, or a region with relations (training/sketch/DIAGRAM_OPS.md). Roles: region;
  // relation + landmark (+ landmark2 for between); relation2 + landmark3 (the second relation's shape; a second `between` is not read).
  // One role alone gives the old single position (position=<region> or position=<relation> anchor=...).
  // A value is placed by what it IS, not by the role that holds it: the reader sometimes puts a relation value in the region role ("put
  // Check to the right of Done" -> region=right_of, landmark=Done) or a region value in the relation role ("Move Process to the top left"
  // -> relation=top_left). Both roles map to the same SOP arg `position`; before, such a value matched neither table and was dropped
  // silently (SHORT2.md, H2). The value tables REL / REGION are legend value -> SOP value, not words.
  const isRel = (v) => v != null && Object.hasOwn(REL, v), isReg = (v) => v != null && Object.hasOwn(REGION, v);
  const rel1 = isRel(R.relation) ? R.relation : isRel(R.region) ? R.region : null;
  const regV = isReg(R.region) ? R.region : isReg(R.relation) ? R.relation : isReg(R.relation2) ? R.relation2 : null;
  const place = (args) => {
    const reg = regV && REGION[regV], rels = [];
    if (rel1) rels.push({ p: REL[rel1], anc: [ref(R.landmark), R.landmark2 ? ref(R.landmark2) : undefined] });
    if (R.relation2 && REL[R.relation2]) rels.push({ p: REL[R.relation2], anc: [R.landmark3 ? ref(R.landmark3) : (rels.length ? undefined : ref(R.landmark))] });
    if (!rels.length) { if (reg) args.position = reg; return; }
    const set = (pk, ak, r) => { args[pk] = r.p; const anc = r.anc.filter((x) => x !== undefined); if (anc.length) args[ak] = anc.length === 1 ? anc[0] : anc; };
    set("position", "anchor", rels[0]);
    if (rels[1]) set("position2", "anchor2", rels[1]);
    if (reg) args.region = reg;
  };
  // a VSS set role is unordered; a list's order is the order of its members in the text (the reader knows the tokens)
  const pos = (e) => { const h = e && (e.head || e); const i = (reading.tokens || []).indexOf(h); return i < 0 ? 1e9 : i; };
  const list = (v) => { const xs = [].concat(v || []).slice().sort((a, b) => pos(a) - pos(b)).map((e) => ref(e)).filter((x) => x !== undefined); return xs.length ? xs : undefined; };
  const ev = reading.event, args = {};
  let type = COMMANDS.has(ev) ? "command" : QUESTIONS.has(ev) ? "question" : ev === "fact" ? "fact" : ev === "rule" ? "rule" : null;
  if (!type) return { nodes, notes: [`unknown event ${ev}`] };
  if (type === "command") args.action = ev;
  if (type === "question") args.ask = ev;
  const obj = R.object;
  const shapeOf = (en) => (en && typeof en === "object" && SHAPES[en.head]) || undefined;
  const withMembers = () => { if (R.members && !["connect", "disconnect", "path", "reverse"].includes(ev)) args.target = list(R.members); };
  // an existing arrow named by its ends (set / resize / label / property, LEGEND_EXT): the roles source / target -> from / to
  const ends = () => { if (R.source) args.from = ref(R.source); if (R.target) args.to = ref(R.target); };
  const arrowArgs = () => { if (R.style) args.style = R.style; if (R.arrow === "two_way") args.arrow = "both"; else if (R.arrow === "plain") args.arrow = "none"; else if (R.arrow === "forward") args.arrow = "forward"; };
  switch (ev) {
    case "create": {
      if (!(R.template || R.items || R.title) || shapeOf(obj)) args.shape = shapeOf(obj) || "circle";   // a template (its form, items or title read) names no shape (LEGEND_EXT)
      if (obj && obj.attr) args.color = obj.attr; if (R.color) args.color = R.color;
      if (R.layout) args.layout = R.layout === "ring" ? "circle" : R.layout;   // several new shapes in a layout
      if (R.size) args.size = R.size; if (R.quantity) args.count = +R.quantity; if (R.name) args.name = plainName(R.name); if (R.text) args.label = textOf(R.text);
      place(args); break;
    }
    case "delete": case "duplicate": case "neighbors": case "describe": case "property":
      if (obj && !(obj.head === "canvas" && ev === "describe")) args.target = ref(obj);
      if (ev === "duplicate" && R.quantity) args.count = +R.quantity;
      if (ev === "property") { args.property = PROPERTY[reading.verb] || "color"; ends(); }
      break;
    case "move": {
      args.target = ref(obj);
      if (R.direction) { args.direction = R.direction; if (R.amount) args.distance = +R.amount; } else place(args);
      break;
    }
    case "set": {
      args.target = ref(obj); if (R.color) args.color = R.color; if (R.shape) args.shape = R.shape; ends(); arrowArgs();
      if (R.size === "bigger" || R.size === "smaller") { args.action = "resize"; args.scale = R.size === "bigger" ? 1.5 : 0.67; }
      else if (R.size) args.size = R.size;
      break;
    }
    case "resize": args.target = ref(obj); ends(); if (R.size && R.size !== "bigger" && R.size !== "smaller") args.size = R.size; else args.scale = reading.verb === "smaller_v" || R.size === "smaller" ? 0.67 : 1.5; break;
    case "rename": args.target = ref(obj); if (R.name) args.name = plainName(R.name); break;
    case "label": args.target = ref(obj); ends(); if (R.text) args.label = R.text === "no_label" ? "" : textOf(R.text); break;   // no_label: remove the label (LEGEND_EXT)
    case "swap": { const a = ref(obj), b = ref(R.target); args.target = [a, b].filter((x) => x !== undefined); break; }
    case "connect": case "disconnect": case "path": case "reverse": {
      if (ev === "reverse" && obj && !R.source && !R.target) args.target = ref(obj);   // the arrows at a shape
      if (R.source) args.from = ref(R.source); if (R.target) args.to = ref(R.target);
      if (R.members) args.from = list(R.members);          // "connect A, B and C in a chain", "connect A and B to C"
      if (R.targets) args.to = list(R.targets);            // "link Hub to A, B and C"
      if (ev === "connect") {
        if (R.style) args.style = R.style;
        if (R.arrow === "two_way") args.arrow = "both"; else if (R.arrow === "plain" || (R.edge && R.edge.head === "line")) args.arrow = "none";
        if (R.edge && R.edge.attr) args.color = R.edge.attr;
        if (R.text) args.label = textOf(R.text);
        if (R.pairing) args.pairing = R.pairing === "each_other" ? "all" : R.pairing;
      }
      break;
    }
    case "reachable": if (R.source) args.from = ref(R.source); break;
    case "align": case "distribute": args.target = ref(obj); if (R.axis) args.axis = R.axis === "vertically" ? "vertical" : "horizontal"; if (R.direction) args.direction = R.direction; break;
    case "toFront": case "toBack": args.target = ref(obj); break;
    case "arrange": args.target = ref(obj); if (R.layout) args.layout = R.layout === "ring" ? "circle" : R.layout; if (R.direction) args.direction = R.direction; if (R.landmark) args.anchor = ref(R.landmark); break;
    // the layout operations (HIGH_LEVEL_OPS.md section 3): target, axis (flip), comparison and distance (respace, snap), a canvas place (fit
    // position=center), superlative and layout (sort), the model or root (anchor); property is read below with the other LEGEND_EXT keys
    case "improve": case "respace": case "snap": case "fit": case "flip": case "sort": case "groupBy": case "equalize": case "straighten": case "untangle":
      if (obj) args.target = ref(obj);
      if (R.axis) args.axis = R.axis === "vertically" ? "vertical" : "horizontal";
      if (R.comparison) args.comparison = R.comparison; if (R.amount) args.distance = +R.amount;
      if (R.superlative) args.superlative = SUPER[R.superlative] || R.superlative; if (R.layout) args.layout = R.layout === "ring" ? "circle" : R.layout;
      if (R.landmark) args.anchor = ref(R.landmark);
      place(args); break;
    case "help": break;   // topic, aspect: below
    case "count": case "exists": case "list": {
      if (obj && obj.head === "rules") { args.ask = "rules"; break; }
      if (obj && (obj.head === "groups" || obj.head === "group")) { args.kind = "group"; break; }   // "what groups are there?"
      if (obj) { const s = shapeOf(obj); if (s) args.shape = s; if (obj.attr) args.color = obj.attr; }
      if (R.color && !args.color) args.color = R.color;      // a colour without a shape word (world built with QCOLOR=1, CAPACITY.md S7); inert for a model whose count / exists / list take no `color` role
      if (R.notcolor) args.notColor = String(R.notcolor).replace(/^not_/, "");
      place(args); break;
    }
    case "check": case "fact": {
      args.target = ref(obj); if (R.color) args.color = R.color; if (R.size) args.size = R.size; if (R.shape) args.shape = R.shape;
      if (R.notcolor && !negUsed) args.notColor = String(R.notcolor).replace(/^not_/, "");
      if (R.comparison) { args.comparison = R.comparison; if (R.landmark) args.anchor = ref(R.landmark); }
      else place(args);
      break;
    }
    case "extreme": case "nearest": {
      if (obj) { const s = shapeOf(obj); if (s) args.shape = s; if (obj.attr) args.color = obj.attr; }
      if (R.superlative) args.superlative = SUPER[R.superlative] || R.superlative;
      if (ev === "nearest" && R.landmark) args.anchor = ref(R.landmark);
      break;
    }
    case "connected": args.target = ref(obj); if (R.landmark) args.anchor = ref(R.landmark); break;
    // groups (DIAGRAM_OPS.md): group = members (set role) or object, + name; ungroup / members / groupOf = object (a group or shape name)
    case "group": if (obj) args.target = ref(obj); if (R.name) args.name = plainName(R.name); break;
    case "ungroup": case "members": case "groupOf": if (obj) args.target = ref(obj); break;
    case "degree": args.target = ref(obj); break;
    case "rule": { const s = shapeOf(obj); if (s) args.shape = s; if (R.color) args.color = R.color; if (R.size) args.size = R.size; break; }
    default: break;
  }
  withMembers();
  // LEGEND_EXT keys of any event (templates, panels, help, arrows): value tokens -> legend values, lists of texts in their order in the text
  for (const k of ["template", "scheme", "fill", "layer", "topic", "aspect", "kind"]) if (R[k] != null && extValue(k, R[k]) !== undefined) args[k] = extValue(k, R[k]);
  if (R.property != null && ev !== "property" && extValue("property", R.property) !== undefined) args.property = extValue("property", R.property);
  if (R.quantifier === "all") args.quantifier = "all";
  for (const k of ["width", "height"]) if (R[k] != null && /^\d+$/.test(String(R[k]))) args[k] = +R[k];
  for (const k of ["items", "items2", "parents"]) if (R[k] != null) {
    const xs = [].concat(R[k]).slice().sort((a, b) => pos(a) - pos(b)).map((e) => textOf(typeof e === "string" ? e : e.head)).filter((x) => x);
    if (xs.length) args[k] = xs.join(",");
  }
  if (R.title != null) args.title = textOf(typeof R.title === "string" ? R.title : R.title.head);
  // the keys that had no role before 2026-11-03 (training/sketch/synth/CONVERT_FIX.md; worlds built with LEGEND_EXT=1): outline (a colour
  // token, or no_outline = "none"), at = x,y (two number roles), linked (a shape), the count of undo / redo (role quantity)
  if (R.outline != null) args.outline = R.outline === "no_outline" ? "none" : String(R.outline);
  else if (args.color === "no_outline") { args.outline = "none"; delete args.color; }   // a value placed by what it IS (as region / relation above): no_outline is never a colour
  if (R.x != null && R.y != null && /^\d+$/.test(String(R.x)) && /^\d+$/.test(String(R.y))) args.at = `${R.x},${R.y}`;
  if (R.linked != null) args.linked = ref(R.linked);
  if ((ev === "undo" || ev === "redo") && R.quantity != null && /^\d+$/.test(String(R.quantity))) args.count = +R.quantity;
  for (const k of Object.keys(args)) if (args[k] === undefined) delete args[k];
  nodes.push({ id: (type === "rule" ? "r" : "s") + (++seq.s), type, args });
  return { nodes, notes };
}
