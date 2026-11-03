# RESEARCH.md: the layout operations real diagram editors offer (2026-11-02)

Goal (owner): find the simple, high-level commands people give a diagram editor ("improve all", "arrange all as a tree", ...), from the
documentation of real editors, and support the useful ones. This file lists what each editor documents, with links, then a merged
catalogue ranked by how often people would ask for it in a short command. The design is in `HIGH_LEVEL_OPS.md`.

How it was gathered: web search + the editors' own help pages (fetched 2026-11-02). Where a page did not list items, that is said; nothing
below is filled in from memory without a source, except where marked "(general knowledge)".

## 1. Per editor

### draw.io / diagrams.net
- **Arrange > Layout** ([manual: arrange layout menu](https://www.drawio.com/docs/manual/editor/menus/arrange-layout-menu/)):
  Horizontal flow / Vertical flow (re-arranges by the connections, for processes and maps); Horizontal tree / Vertical tree / Radial tree
  (from a root; a spacing value; "work best when all connectors move outward from the root"); Circle (evenly spaced circle); Organic
  (clusters, for mind maps and networks); Org Chart (linear, hanger, fishbone, single column, smart; parent/child and sibling spacing);
  Parallels (separates overlapping connectors); Custom (a JSON list of layouts run in order).
- **Layouts page** ([manual: layouts](https://www.drawio.com/docs/manual/layouts/)): Flow, Tree, Radial Tree, Organic (all on the Eclipse
  Layout Kernel), Org Chart, Orthogonal Routing (re-routes connectors only, shapes do not move), Circle, Parallel. Shared options: edge
  style, corners, resize nodes (off), **preserve origin (on)**, **use selection as root(s)**.
- FAQ ([apply layouts](https://www.drawio.com/doc/faq/apply-layouts)): "arrange a diagram into flows, trees, organic and circular layouts".
- Align / Distribute / Same size / Flip / To front (Arrange menu): not listed on the fetched pages (general knowledge: draw.io's Arrange
  menu has them).

### yEd (yWorks)
- **Layout menu** ([manual: layout algorithms](https://yed.yworks.com/support/manual/layout.html)): Hierarchical, Organic, Orthogonal
  (Classic, UML style, Compact), Circular, Tree, Balloon, Radial, Compact Disk, Series-Parallel, Selection (partial layout), Component
  Arrangement, Random, Hierarchic / Organic Swimlane, Tabular, Flowchart, BPMN, SBGN, Family Tree, Tree Map, **One-Click Layout**.
  Edge routing: Polyline, Orthogonal (Channel, Bus-style), Organic, Straight Line, Edge Bundling, Curve Routing. Labeling.
- **Tools menu** ([manual: tools](https://yed.yworks.com/support/manual/yed_tools.html)): Reverse Selected Edges, Layout Parallel Edges,
  Transform Graph (mirror, rotate, scale), Snap To Grid, Fit Node to Label, Fit Label to Node, Colorize Graph, Select Elements, Analyze Graph.
- **Menu bar** ([manual: menu](https://yed.yworks.com/support/manual/yedmenu.html)): Edit > Align Nodes (submenu), Raise / Lower Selection;
  Grouping menu (group hierarchy).
- Product page ([features](https://www.yworks.com/products/yed/applicationfeatures)): hierarchical, orthogonal, organic (constrained to a
  rectangle / circle), circular (ring and star topologies), tree, radial, swimlane, flowchart; re-route only the edges.

### Microsoft Visio
- **Re-Layout Page** ([re-layout a diagram](https://support.microsoft.com/en-us/office/re-layout-a-diagram-in-visio-abfd3fbd-c2a8-4c11-bc4c-789466e6aedb)):
  Flowchart, Hierarchy, Compact Tree, Radial, Circular; applies to the selection, or to the whole page when nothing is selected; live preview.
- **Auto Align & Space** ([auto-align and space](https://support.microsoft.com/en-us/visio/auto-align-and-space-the-shapes-in-a-diagram)):
  aligns connected shapes and evens the spacing; **no selection = the whole page**.
- **Align / Position** ([align and position shapes](https://support.microsoft.com/en-au/visio/align-and-position-shapes-in-a-diagram)):
  Align; Auto Align (straightens connectors); Auto Space; Spacing Options (exact distance); Distribute horizontally / vertically; Move off
  Page Breaks; Rotate Shapes (rotate / flip); Rotate Diagram (rotate or flip the layout without turning the shapes).

### Lucidchart / Lucidspark
- **Organize and arrange** ([help](https://help.lucid.co/hc/en-us/articles/14589107304468)): Align left / right / center / top / bottom /
  middle; Distribute horizontally / vertically (3+ objects); **Quick cleanup: Tidy up, Cluster**; Bring to front / Send to back /
  forward / backward; Lock; Snap to objects / Snap objects to grid.
- **Grid layout** (formerly assisted layout) ([help](https://help.lucid.co/hc/en-us/articles/34727996594324)): Tidy up arranges 3+ selected
  shapes into a grid (adjustable spacing); Cluster gathers spread-out shapes into a condensed grid in one spot; "Quick cleanup lines" tidies
  lines once.

### PowerPoint
- **Align** ([align and arrange objects](https://support.microsoft.com/en-us/office/align-and-arrange-objects-on-a-slide-5f961535-a2ae-4914-a24a-94c669903ae3)):
  Align Left / Center / Right / Top / Middle / Bottom, relative to the selection or to the slide; Distribute Horizontally / Vertically.
- SmartArt ([choose a SmartArt graphic](https://support.microsoft.com/en-US/Office/graphics-visuals/choose-a-smartart-graphic), search result;
  general knowledge for the rest): Convert to SmartArt turns a list into a form (process, cycle, hierarchy, relationship, matrix, pyramid).
  In this repository that is the **templates** work (`docs/js/templates.js`), not a re-layout.

### Figma (tidy up), tldraw, Miro, Excalidraw
- Figma ([alignment, rotation, position](https://help.figma.com/hc/en-us/articles/360039956914-Adjust-alignment-rotation-position-and-dimensions)):
  Align left / horizontal centres / right / top / vertical centres / bottom; Distribute horizontal / vertical spacing; **Tidy up** (one
  dimension: along the axis, spacing = the most common gap; two dimensions: a grid aligned to the selection's top-left); Flip horizontal /
  vertical.
- tldraw ([align and distribute](https://tldraw.dev/examples/align-and-distribute-shapes)): alignShapes left, center-horizontal, right, top,
  center-vertical, bottom, center; distributeShapes horizontal, vertical.
- Miro: only community threads were found (align, distribute horizontally / vertically; requests for "quick align" of stickies), e.g.
  [align objects in Miro](https://supademo.com/blog/how-to-align-objects-in-miro). No official page fetched.
- Excalidraw: only a shortcut list mirror was found (bring to front / send to back, zoom); align / distribute / flip are in its context
  menu (general knowledge). No official page fetched.

### Text-to-diagram tools
- Mermaid ([flowchart syntax](https://mermaid.js.org/syntax/flowchart.html)): direction **TB / TD** (top to bottom), **BT**, **RL**, **LR**;
  layout engines ELK (default) and dagre.
- Graphviz ([layout engines](https://graphviz.org/docs/layouts/)): **dot** (layered, directed graphs), **neato** (spring model, undirected,
  ~100 nodes), **fdp** / **sfdp** (force-directed, large), **circo** (circular, cyclic structures), **twopi** (radial, rings by distance from
  a root), osage, patchwork. [rankdir](https://graphviz.org/docs/attrs/rankdir/): TB (default), BT, LR, RL.
- ELK ([algorithms](https://eclipse.dev/elk/reference/algorithms.html)): Layered, Mr. Tree, Radial, Force, Stress, Box, Rectangle Packing,
  DisCo, SPOrE compaction / overlap removal, ...; [direction](https://eclipse.dev/elk/reference/options/org-eclipse-elk-direction.html):
  RIGHT, LEFT, DOWN, UP.

### What "a good layout" means (for the quality score)
- Purchase, "Which aesthetic has the greatest effect on human understanding?" (1997,
  [Springer](https://link.springer.com/doi/10.1007/3-540-63938-1_67)): **reducing edge crossings has by far the greatest effect**; fewer bends
  and symmetry matter less; minimum angle and an orthogonal grid had no significant effect.
- Layered drawing (Sugiyama) ([Wikipedia](https://en.wikipedia.org/wiki/Layered_graph_drawing)): cycle removal, layer assignment, dummy
  vertices, crossing reduction by barycenter / median, coordinate assignment. `docs/js/auto-layout.js` follows these steps.

## 2. Merged catalogue, ranked by how often people would ask for it in a short command

The rank is a judgement, not a measurement: an operation every editor puts in its main menu, and that has a one-word name people know
("tidy up", "align", "tree"), ranks high. A check against data: the blind set `llm_bench/short3` (read: only its `pending` / `intent` fields)
has 44 pending re-layout requests (11 tidy / improve / automatic layout, 8 more or less spacing, 7 layered, 5 tree, 4 untangle, 3 straighten,
3 radial, 3 centre / fit) and 11 arrow restyles (3 colour, 3 dashed / dotted, 2 reverse, 2 arrowheads, 1 thickness).

| rank | operation | editors (section 1) | status here |
|---|---|---|---|
| 1 | tidy up / improve / auto layout | Lucid Tidy up, Figma Tidy up, Visio Auto Align & Space, yEd One-Click Layout | new: `improve` (measured score) |
| 2 | align (edges, centres) | all | existing `align` (axis); new: edges via `direction` |
| 3 | distribute / space evenly | all | existing `distribute` |
| 4 | tree / hierarchy / org chart (up, down, left, right) | draw.io, yEd, Visio, ELK Mr. Tree, Mermaid TD/LR | new layout `tree` + `direction` |
| 5 | more / less space, compact | draw.io spacing, Visio Spacing Options, Lucid spacing | new: `respace` |
| 6 | grid / row / column / circle | all (Lucid grid layout, draw.io circle, yEd circular) | existing layouts (now overlap-free, reading order) |
| 7 | layered flow (follows the arrows) | draw.io Flow, yEd Hierarchical / Flowchart, Visio Flowchart, Graphviz dot, ELK Layered | new layout `layers` |
| 8 | restyle an arrow (dashed, colour, heads, thickness) | all | new: `set` / `resize` with `from` / `to` or `kind=edge` |
| 9 | centre / fit on the page | Visio Move off page breaks, every editor's "fit" (view) | new: `fit` (+ position=center) |
| 10 | untangle crossings | yEd edge routing, draw.io Parallels | new: `untangle` |
| 11 | straighten links | Visio Auto Align, draw.io Orthogonal Routing | new: `straighten` |
| 12 | reverse an arrow | yEd Reverse Selected Edges | new: `reverse` |
| 13 | radial | draw.io Radial Tree, yEd Radial / Balloon, Visio Radial, twopi | new layout `radial` (+ centre `anchor`) |
| 14 | snap to grid | yEd Snap To Grid, Lucid snap to grid | new: `snap` |
| 15 | same size / same colour | yEd Fit node to label (sizes), Visio / PowerPoint match size (general knowledge) | new: `equalize` |
| 16 | flip / mirror | Figma, yEd Transform Graph, Visio Rotate Diagram | new: `flip` |
| 17 | organic / force-directed | draw.io Organic, yEd Organic, neato / fdp, ELK Force | new layout `organic` |
| 18 | cluster / group by colour or kind | Lucid Cluster | new: `groupBy` |
| 19 | sort (by name, colour, size) | none as a menu item; people ask for it ("alphabetically") | new: `sort` |
| 20 | front / back | all | existing `toFront` / `toBack` |
| - | rotate the diagram 90° | Visio Rotate Diagram, yEd Transform | not supported: rare; "sideways" maps to a tree / layers direction |
| - | swimlanes, orthogonal edge routing, label placement | yEd, draw.io, Visio | not supported: the engine draws straight links and has no lanes |
| - | zoom to fit | every editor (a view command) | not a diagram change; the canvas has no zoom; "fit" moves shapes instead |
| - | create a form from a list (SmartArt) | PowerPoint, Visio templates | the templates work (`docs/js/templates.js`), not these operations |
