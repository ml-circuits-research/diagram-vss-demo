# checks/: data checks to run BEFORE a training run (no training, CPU, minutes)

Why: `scenes_r3/ROOT_CAUSES.md` found that many reader mistakes on the scenes were decided before the GPU: SOP-BERT had no width / height
heads, `fill` had only `light` and `create` never read `distance`, because the data list had none of them; half of the scenes' gold could not
reach a VSS world row. These checks make that visible for any data list or new folder (`PREPROCESS_FIXES.md`, check 1 and 2).
Both print a report and exit 0; they exit non-zero only with an explicit `--gate`.

## legend_coverage.py: what of the legend can each reader learn from a data list?

```
python3 training/sketch/checks/legend_coverage.py --registry docs/model/micro/registry.json        # the shipped data list and fronts
EXTRA_DIRS="<round-3 list>" LEGEND_EXT=1 DIAGRAM_OPS=1 VAL_PICK=specific DATA=spans python3 training/sketch/checks/legend_coverage.py   # a new list (fronts learned here, ~1 min)
    [--fronts DIR] [--near 5] [--ref-min 3] [--no-vss] [--json out.json] [--gate]
```
Per reader, the zeros and near-zeros (< `--near` requests) of: SOP-BERT acts; legend keys (0 = no head, no tag); enum values (0 = no class);
act x key (keys an act takes somewhere in the repository's annotated folders, the reference, that the data list lacks: never in act_keys);
VSS: per world, the legend value tokens its requests carry that never reach a row (no word of the request becomes the token with the
world's front end), and the number keys written as words. `--gate`: exit 1 when a zero is found that the reference has >= `--ref-min` times.

On the shipped data list (2026-11-03) it flags, among others: `width`, `height` 0 requests (no head / no tag); `fill` faint / none / solid 0
(no class), `fill` light 4; `create.width`, `create.height`, `create.distance` 0 (never read for create; reference 111 / 111 / 61);
`create.fill`, `create.layer` 3; VSS shapes world: `fill_light`, `layer_background`, `layer_zone` never reach a row, `fill_faint` has no
request. Also `undo.count`, `redo.count`, `check.region`, `resize.scale` 0 for SOP-BERT, and notColor values / templates that never reach a
row in some VSS worlds (the full output: run it).

## form_audit.py: how much of a data folder can survive each reader's data path?

```
python3 training/sketch/checks/form_audit.py llm_bench/scenes_test llm_bench/collected_1 [--registry REG | --learn] [--sop-extra-dirs "..."]
    [--no-vss] [--no-sop] [--work DIR] [--top 8] [--gate PCT]
```
Runs the existing oracles on every request of the folders and groups the failures by first cause: VSS `convert_check.py` (the world row,
back through the adapter; fronts of a registry or learned with `--learn` and the environment's EXTRA_DIRS and switches), SOP-BERT
`roles_roundtrip.py` (the gold as labels of the layout of a data list, decoded by docs/js/neural.js; `ONLY_ALSO=1` decodes only the audited
folders). A failing request cannot be learned right by that reader even with a perfect model. `--gate PCT`: exit 1 when a folder fails an
oracle for more than PCT % of its requests.

Set the same switches as the training run to audit what it will see: `GAP_ROLE=1`, `FRONT_NAMEDIGIT=1 FRONT_NUMWORDS=1` (VSS, with
`--learn`), `NUM_WORDS=table` (SOP-BERT).
