import json, sys, collections
FAM9 = {"W1 place": ["create", "move"], "W2 object-only": ["degree", "delete", "describe", "duplicate", "label", "neighbors", "property", "rename", "swap", "toBack", "toFront"],
        "W3 attributes": ["check", "fact", "rule", "set"], "W4 layout": ["align", "arrange", "distribute", "resize"], "W5 connect": ["connect"],
        "W6 graph": ["disconnect", "path", "reachable"], "W7 no-role": ["cycle", "forget", "redo", "undo"], "W8 scene sets": ["connected", "count", "exists", "list"],
        "W9 superlatives": ["extreme", "nearest"]}
E2F = {e: f for f, es in FAM9.items() for e in es}
def gold_ev(w):
    a = w["args"]; t = w["type"]
    return a.get("action") if t == "command" else ({"rules": "list"}.get(a.get("ask"), a.get("ask")) if t == "question" else t)
