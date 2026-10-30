// vss-adapter.js: from a VSS reading of one clause (an event wire with its entity wires, or a gold frame from the generator) to the
// SOP Sketchpad's own wires (command / question / fact / rule, plus mention wires for descriptions), so that every formalizer feeds
// the same engine and the same reasoner. Pure functions; no DOM.

const REL = { left_of: "leftOf", right_of: "rightOf", above: "above", below: "below", next_to: "near", between: "between" };
const REGION = { center: "center", top: "top", bottom: "bottom", left_side: "left", right_side: "right", top_left: "topLeft", top_right: "topRight", bottom_left: "bottomLeft", bottom_right: "bottomRight" };
const SHAPES = { circle: "circle", circles: "circle", square: "square", squares: "square", rectangle: "rectangle", rectangles: "rectangle", triangle: "triangle",
  triangles: "triangle", diamond: "diamond", diamonds: "diamond", ellipse: "ellipse", ellipses: "ellipse", hexagon: "hexagon", hexagons: "hexagon", star: "star", stars: "star" };
const PLURAL = new Set(["circles", "squares", "rectangles", "triangles", "diamonds", "ellipses", "hexagons", "stars", "shapes"]);
const PROPERTY = { what_color: "color", where_is: "position", how_big: "size", what_shape: "shape", what_says: "label" };
const COMMANDS = new Set(["create", "delete", "move", "set", "resize", "rename", "label", "duplicate", "swap", "connect", "disconnect", "align", "arrange", "distribute", "toFront", "toBack", "undo", "redo", "forget"]);
const QUESTIONS = new Set(["count", "exists", "list", "property", "describe", "neighbors", "path", "reachable", "cycle", "check", "extreme", "nearest", "connected", "degree"]);
const SUPER = { biggest: "biggest", smallest: "smallest", leftmost: "leftmost", rightmost: "rightmost", topmost: "topmost", bottommost: "bottommost", mostconnected: "mostConnected", leastconnected: "leastConnected", closest: "closest", farthest: "farthest" };

/** VSS wires -> { event, roles, verb }; roles: role -> string | {head, attr, det} */
export function readingFromWires(wires, verb) {
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
  return { event: top.type, roles, verb: verb || top.value("_verb"), offered };
}
const ENTITY_ROLES = new Set(["object", "landmark", "landmark2", "source", "target", "edge"]);

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
    const all = h === "everything" || h === "canvas" || PLURAL.has(h) || ["all", "every", "each"].includes(en.det);
    if (all) a.quantifier = "all";
    if (SHAPES[h]) a.shape = SHAPES[h];
    if (en.attr) a.color = en.attr;
    if (en.det === "newest" || en.det === "oldest") { a.recency = en.det; delete a.quantifier; }
    if (R.notcolor && !negUsed) { a.notColor = String(R.notcolor).replace(/^not_/, ""); negUsed = true; }
    const id = "m" + (++seq.m); nodes.push({ id, type: "mention", args: a }); return { ref: id };
  };
  const place = (args) => {
    if (R.region && REGION[R.region]) args.position = REGION[R.region];
    else if (R.relation && REL[R.relation]) {
      args.position = REL[R.relation];
      const anc = [ref(R.landmark), R.landmark2 ? ref(R.landmark2) : undefined].filter((x) => x !== undefined);
      if (anc.length) args.anchor = anc.length === 1 ? anc[0] : anc;
    }
  };
  const list = (v) => { const xs = [].concat(v || []).map((e) => ref(e)).filter((x) => x !== undefined); return xs.length ? xs : undefined; };
  const ev = reading.event, args = {};
  let type = COMMANDS.has(ev) ? "command" : QUESTIONS.has(ev) ? "question" : ev === "fact" ? "fact" : ev === "rule" ? "rule" : null;
  if (!type) return { nodes, notes: [`unknown event ${ev}`] };
  if (type === "command") args.action = ev;
  if (type === "question") args.ask = ev;
  const obj = R.object;
  const shapeOf = (en) => (en && typeof en === "object" && SHAPES[en.head]) || undefined;
  const withMembers = () => { if (R.members && !["connect", "disconnect", "path"].includes(ev)) args.target = list(R.members); };
  switch (ev) {
    case "create": {
      args.shape = shapeOf(obj) || "circle"; if (obj && obj.attr) args.color = obj.attr; if (R.color) args.color = R.color;
      if (R.size) args.size = R.size; if (R.quantity) args.count = +R.quantity; if (R.name) args.name = plainName(R.name); if (R.text) args.label = textOf(R.text);
      place(args); break;
    }
    case "delete": case "duplicate": case "neighbors": case "describe": case "property":
      if (obj && !(obj.head === "canvas" && ev === "describe")) args.target = ref(obj);
      if (ev === "duplicate" && R.quantity) args.count = +R.quantity;
      if (ev === "property") args.property = PROPERTY[reading.verb] || "color";
      break;
    case "move": {
      args.target = ref(obj);
      if (R.direction) { args.direction = R.direction; if (R.amount) args.distance = +R.amount; } else place(args);
      break;
    }
    case "set": {
      args.target = ref(obj); if (R.color) args.color = R.color; if (R.shape) args.shape = R.shape;
      if (R.size === "bigger" || R.size === "smaller") { args.action = "resize"; args.scale = R.size === "bigger" ? 1.5 : 0.67; }
      else if (R.size) args.size = R.size;
      break;
    }
    case "resize": args.target = ref(obj); if (R.size && R.size !== "bigger" && R.size !== "smaller") args.size = R.size; else args.scale = reading.verb === "smaller_v" || R.size === "smaller" ? 0.67 : 1.5; break;
    case "rename": args.target = ref(obj); if (R.name) args.name = plainName(R.name); break;
    case "label": args.target = ref(obj); if (R.text) args.label = textOf(R.text); break;
    case "swap": { const a = ref(obj), b = ref(R.target); args.target = [a, b].filter((x) => x !== undefined); break; }
    case "connect": case "disconnect": case "path": {
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
    case "align": case "distribute": args.target = ref(obj); if (R.axis) args.axis = R.axis === "vertically" ? "vertical" : "horizontal"; break;
    case "toFront": case "toBack": args.target = ref(obj); break;
    case "arrange": args.target = ref(obj); if (R.layout) args.layout = R.layout === "ring" ? "circle" : R.layout; break;
    case "count": case "exists": case "list": {
      if (obj && obj.head === "rules") { args.ask = "rules"; break; }
      if (obj) { const s = shapeOf(obj); if (s) args.shape = s; if (obj.attr) args.color = obj.attr; }
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
    case "degree": args.target = ref(obj); break;
    case "rule": { const s = shapeOf(obj); if (s) args.shape = s; if (R.color) args.color = R.color; if (R.size) args.size = R.size; break; }
    default: break;
  }
  withMembers();
  for (const k of Object.keys(args)) if (args[k] === undefined) delete args[k];
  nodes.push({ id: (type === "rule" ? "r" : "s") + (++seq.s), type, args });
  return { nodes, notes };
}
