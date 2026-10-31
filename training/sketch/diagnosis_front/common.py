import sys, json, collections
sys.path.insert(0, "/home/claude/diagram-vss-demo/training/sketch")
import front
P = json.load(open("/home/claude/diagram-vss-demo/training/sketch/front_params.json"))
VT = set(front.value_kinds())
def load(p): return [json.loads(l) for l in open(p) if l.strip()]
def relearn(msgs, params=None):
    return front.learn(msgs, params or P)
