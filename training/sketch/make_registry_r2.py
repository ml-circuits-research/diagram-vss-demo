#!/usr/bin/env python3
"""make_registry_r2.py: write docs/model/micro/registry_r2.json = registry.json with the round-2 models (ROUND2.md section 5.4):
the 7 worlds as micro/<world>r2 (the names of ROUND2.md section 4), manage += group, ungroup, questions += members, groupOf (the
events of worlds_micro/GROUPS_7r2.json), the round-2 cutters; there is NO fallback (removed 2026-11-02: it read no request). It does not touch registry.json. Then stamp:
  python3 training/sketch/make_registry_r2.py && python3 training/sketch/stamp_models.py
(stamp_models.py stamps registry_r2.json too once every model it names exists; until then it prints "skipped".)
"""
import argparse, json, os
HERE = os.path.dirname(os.path.abspath(__file__)); MICRO = os.path.join(HERE, "..", "..", "docs", "model", "micro")
reg = json.load(open(os.path.join(MICRO, "registry.json")))
g = json.load(open(os.path.join(HERE, "worlds_micro", "GROUPS_7r2.json")))
old = {w["world"]: w for w in reg["worlds"]}
assert set(old) == {k for k in g if not k.startswith("_")}, "registry.json worlds are not the GROUPS_7r2 worlds"
for w in reg["worlds"]:
    w["events"] = list(g[w["world"]])
    # shapes7c is the default shapes model today; its round-2 successor is shapes7r2 like the other six
    w["model"] = "micro/" + {"shapes": "shapes7", "links": "links7", "position": "position7", "graphq": "graphq7", "questions": "questions7", "manage": "manage7", "history": "history7"}[w["world"]] + "r2"
    w.pop("version", None)
reg["cutter"] = "micro/cutter_worlds7r2.json"; reg["event_cutter"] = "micro/cutter_events_r2.json"
for k in ("cutter_version", "event_cutter_version", "context_version", "fallback", "fallback_version"): reg.pop(k, None)   # no fallback
reg["about"] = "Round-2 composer (ROUND2.md, built by make_registry_r2.py): the 7 worlds retrained once with every fix (N_CAL, CREATE_COLOR, VAL_SUB, VAL_PREC, SHORT, OPS, DIAGRAM_OPS), the groups events, cutters cutter_worlds7r2 / cutter_events_r2, no fallback. Measures: ROUND2.md section 6."
json.dump(reg, open(os.path.join(MICRO, "registry_r2.json"), "w"), indent=1, ensure_ascii=False); open(os.path.join(MICRO, "registry_r2.json"), "a").write("\n")
print("docs/model/micro/registry_r2.json:", [(w["world"], w["model"], len(w["events"])) for w in reg["worlds"]])
