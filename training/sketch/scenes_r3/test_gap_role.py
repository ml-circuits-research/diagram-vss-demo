"""scenes_r3/test_gap_role.py: GAP_ROLE=1 (llm_to_world.py) carries the gap of a relation into the role `amount`, off by default nothing
changes, and docs/js/vss-adapter.js reads it back as `distance` beside the relation (ROOT_CAUSES.md). Run:
  python3 training/sketch/scenes_r3/test_gap_role.py"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__)); SK = os.path.dirname(HERE); REPO = os.path.dirname(os.path.dirname(SK))
ROWS = [
    ({"text": "put Bar 20 px below Trio", "names": ["Bar", "Trio"],
      "wire": {"type": "command", "args": {"action": "move", "target": "Bar", "distance": "20", "position": "below", "anchor": "Trio"}}}, "20"),
    ({"text": "add a tiny yellow circle 2 px above Tower, called Lamp", "names": ["Tower"],
      "wire": {"type": "command", "args": {"action": "create", "size": "tiny", "color": "yellow", "shape": "circle", "position": "above", "anchor": "Tower", "distance": "2", "name": "Lamp"}}}, "2"),
    ({"text": "move Bar right by 40 px", "names": ["Bar"],   # a gap with a direction: unchanged by the switch
      "wire": {"type": "command", "args": {"action": "move", "target": "Bar", "direction": "right", "distance": "40"}}}, "40"),
]


def roles(gap):
    code = ("import json,sys; sys.path.insert(0, %r); from llm_to_world import convert\n"
            "rows = json.loads(sys.stdin.read())\n"
            "print(json.dumps([convert(r, soft=True)[1] for r in rows]))") % SK
    env = dict(os.environ, GAP_ROLE="1" if gap else "", LEGEND_EXT="1", DIAGRAM_OPS="1")
    out = subprocess.run([sys.executable, "-c", code], input=json.dumps([r for r, _ in ROWS]), capture_output=True, text=True, env=env, cwd=SK, check=True)
    return json.loads(out.stdout)


def main():
    off, on = roles(False), roles(True)
    ok = True
    for (row, d), a, b in zip(ROWS, off, on):
        direction = "direction" in row["wire"]["args"]
        want_off = d if direction else None
        if a.get("amount") != want_off: ok = False; print("FAIL off", row["text"], a)
        if b.get("amount") != d: ok = False; print("FAIL on", row["text"], b)
        if {k: v for k, v in b.items() if k != "amount"} != {k: v for k, v in a.items() if k != "amount"}: ok = False; print("FAIL other roles changed", row["text"])
    # the adapter: a relation with amount -> distance; without amount -> no distance
    js = ("import('%s/docs/js/vss-adapter.js').then(A => {"
          "const r = (R) => A.toNodes({event: 'move', roles: R, verb: 'move', tokens: []}, {names: {}}, {names: ['Bar', 'Trio'], last: []}).nodes.pop().args;"
          "console.log(JSON.stringify([r({object: {head: 'n_bar'}, relation: 'below', landmark: {head: 'n_trio'}, amount: '20'}),"
          "r({object: {head: 'n_bar'}, relation: 'below', landmark: {head: 'n_trio'}}), r({object: {head: 'n_bar'}, direction: 'right', amount: '40'})]))})") % REPO
    x, y, z = json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, check=True).stdout)
    if x.get("distance") != 20 or x.get("position") != "below": ok = False; print("FAIL adapter amount", x)
    if "distance" in y: ok = False; print("FAIL adapter without amount", y)
    if z.get("distance") != 40 or z.get("direction") != "right": ok = False; print("FAIL adapter direction", z)
    print("test_gap_role:", "ok" if ok else "FAILED")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
