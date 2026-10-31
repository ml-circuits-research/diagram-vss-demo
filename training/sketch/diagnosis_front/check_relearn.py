from common import *
fit = load("/tmp/claude-0/-home-claude/8941735c-db18-5907-b7c8-a224e2065054/scratchpad/fitset/fit.jsonl")
F = relearn(fit); S = json.load(open("/home/claude/diagram-vss-demo/docs/model/fix_p80_s0/front.json"))
print(len(fit), F["values"] == S["values"], F["triggers"] == S["triggers"], len(F["triggers"]), len(S["triggers"]))
