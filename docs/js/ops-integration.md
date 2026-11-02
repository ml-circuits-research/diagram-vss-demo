# ops-integration.md: the change logic.js needs for the high-level layout operations and arrow restyling

Design: `training/sketch/ops/HIGH_LEVEL_OPS.md`. Geometry: `docs/js/auto-layout.js` (new file, already in place). This patch is **not
applied** (logic.js was being edited by another agent); it is ready to apply and was tested on a copy of logic.js as of 2026-11-02 (after
commit ca2850a: templates, help world, `edgeSet`, `edgesNamed`).

## Apply

```
node training/sketch/ops/apply_ops_patch.mjs docs/js/logic.js docs/js/logic.js --html docs/index.html docs/index.html
LOGIC=docs/js/logic.js node training/sketch/ops/test_auto_layout.mjs        # 309 checks, 18 of them end to end
bash training/sketch/regress.sh                                             # AGENTS.md: before committing reader code
```

The script reads the code from `training/sketch/ops/ops_patch_blocks.js` (one block per `//@@ NAME`) and applies 20 anchored edits. Each
anchor must occur exactly once, else it stops with the anchor's name (nothing is written). It refuses a file that already has `opsPlugin`.

## The edits (anchor -> change)

Engine
1. `const layoutPlugin = {` -> insert block **ENGINE_HELPERS** before it: `autoLayout()` (global `AutoLayout` or `optRequire('./auto-layout.js')`),
   `EDGE_PX`, `alShapes` / `alLinks` / `alRun` (shapes of the drawing's cell -> AutoLayout, positions -> `set` patches, LayoutError ->
   Clarify when it asks, else SOPError), `edgesOf`, `restyleEdges`, and **`opsPlugin`**: legend values (action improve, respace, snap,
   flip, reverse, sort, groupBy, equalize, straighten, untangle, fit; layout tree, layers, radial, organic; property name) and handlers
   `improve`, `respace`, `snap`, `flip`, `sort`, `groupBy`, `equalize`, `straighten`, `untangle`, `fit`, `align` + `direction`, `reverse`, and
   the arrow restyle `set|resize` with `from` / `to` / `kind=edge` (2 `when` keys: they win over the shapes' `set`).
2. layoutPlugin's whole `{ type: 'command', when: { action: 'arrange' }, ... notes: [`${lay} layout`] };\n    } }` -> block
   **ARRANGE_HANDLER**: every layout through `AutoLayout.layout` (`auto` when no layout / axis; a direction without links -> row / column);
   `anchor` = root; a tree / radial of unlinked named shapes falls back to the templates plugin's hierarchy / hub (`ctx.engine.match`).
   The templates plugin's `arrange template=…` handler is untouched (it has 2 `when` keys).
3. `arrange: ['arrange', 'layout', 'lay out', 'organize', 'organise', 'tidy']` -> without `tidy`, plus rearrange, re-arrange, relayout,
   re-layout, reorganize, reorganise, reformat.
4. `grid: ['grid', 'tidy']` -> `grid: ['grid']`.
5. layoutPlugin `description` -> mentions the new layouts.
6. `rulesPlugin, factsPlugin]` (createSystem's plugin list) -> `rulesPlugin, factsPlugin, opsPlugin]` (after queries: `property` keeps its
   ask and kind).

Rules reader
7. COMMON (`... stroke yourself up down unlabel`) + `clean cleaner neat neater tidier messy mess clutter cluttered nicer prettier tree trees
   flow layers lay good thin thick collect chart charts`: known words the spelling step must not "correct" (clean -> clear deleted
   everything; good -> gold; thin -> thing; lay -> Pay; chart -> Cart; collect -> connect).
8. `    const TPL_PART = '\u0001';` -> after it, block **FORMALIZER_MASK** (`opsMask`: known names masked for the ops readers).
9. sentence loop `templateOf(' ' + p + ' ') ? [TPL_PART + p]` -> block **SENTENCE_TEMPLATE_GUARD** (a re-layout by the links is not merged as
   one template piece, so "arrange as a tree and color the arrow from A to B red" is two requests).
10. `function makeFormalizer(engine) {` -> insert block **READER_HELPERS** before it: `OPS_LAYOUT`, `opsLayoutOf`, `opsDirection`,
    `opsSkipTemplate`, `opsRestyle`, `opsAction`, `opsArgs`, `opsVerbless`, `OPS_WHOLE`, `opsMaskWith` (pure functions of the clause text).
11. `if (templateClause(t.trim(), isQ)) return;` -> block **CLAUSE_TEMPLATE_GUARD** ("A->B" normalised to "A → B"; `tOps` = the masked clause;
    the template reader is skipped for a re-layout by the links).
12. `        else { F.notes.push(\`I couldn't find an action in` -> insert block **CLAUSE_VERBLESS** before it (short verbless requests; never a remark).
13. `      const isCmd = kind === 'command';` -> insert block **CLAUSE_ACTION** before it (`opsRestyle`, then `opsAction`, may replace the action).
14. `      // ---- roles that use prepositions ----` -> insert block **CLAUSE_ROOT** before it (root / centre / start of arrange, model of equalize,
    the whole-diagram words -> `mention(quantifier=all)`).
15. `      if (action === 'connect' || action === 'disconnect' || ask === 'path') {` -> also `|| C.restyle || action === 'reverse'` (the ends
    of an arrow are read like connect's).
16. the arrange line: `/\b(row|line|column|stack|grid|circle|ring|tidy)\b/` and `tidy: 'grid'` -> without tidy.
17. after that arrange line, block **CLAUSE_ARGS** (`opsArgs`: the parameters, after the existing arrange / align / distribute values so it
    can override them).
18. `... && args.from == null && args.to == null) F.notes.push(` -> also `&& args.kind == null` (no "no target found" note on an arrow restyle).
19. `/\bgrid|tidy\b/i.test(raw)) C.args.layout = 'grid';` -> `/\bgrid\b/i...`.

Page
20. `docs/index.html`: `<script src="js/auto-layout.js"></script>` before `<script src="js/logic.js"></script>` (node: logic.js requires
    `./auto-layout.js` itself).

No new legend key; `KEY_ORDER` is unchanged.

## Help text (docs/js/help.js, ACTIONS entries; not part of the script: help.js is another agent's file)

```js
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
```
and `arrange`: `d: 'Lay shapes out as a row, column, grid or circle, or by their links as a tree, layers (a flow), radial or organic layout; say a direction (left to right, top to bottom) and a root ("with Ceo at the top").'`, `ex: ['Arrange everything as a tree', 'Arrange in layers left to right', 'Radial layout around Hub']`; the 'Tidy up' group of help.js gets the new actions.

## Checked on a patched copy (2026-11-02)

- `test_auto_layout.mjs` with `LOGIC=`: 309/309 (18 end to end). Existing suites unchanged (HIGH_LEVEL_OPS.md section 5).
- check_rules.mjs on the existing synthetic data: the only lines whose reading changes are the 63 "tidy" lines (gold arrange grid ->
  now improve; relabel them, HIGH_LEVEL_OPS.md section 8).
- `formulations.jsonl`: the Rules read 703 / 744 exactly (unpatched: 92).
