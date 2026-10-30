# training/vss: the VSS training tool, copied

Copied on 2026-10-30 from ml-circuits-research/vss-demo at commit 9c85649 (MIT, LICENSE in this folder), so that this repository trains
its own models without a vss-demo checkout. Only what `sop train`, `sop check` and `sop export-web` load:

| here | from vss-demo | change |
|---|---|---|
| `tool/sop/*.py`, `tool/bin/sop` | `tool/sop/`, `tool/bin/sop` | `train.py`: the calibration patch (`../sketch/patches/vss-demo_calibrate_attr_all.patch`, ISSUES_OTHER_REPOS.md item 2) |
| `experiment/{camp,guard,trainer,v2,v4,v4_torch,v5_scale,v6_left,v7_nested,v8_gates}.py` | `experiment/` | none |

The list of experiment modules is the set a training run actually imports (measured with a smoke run). Everything else in vss-demo
(the paper's experiments, worlds, the app) is not copied. The browser reader is in `docs/js/vss.js` and `docs/js/vss/` (from vss-demo
`app/src`, same commit). Changes made here from now on are ordinary commits of this repository.
