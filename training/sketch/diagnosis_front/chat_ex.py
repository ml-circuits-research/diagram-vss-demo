from diag1 import *
import re
for ph in ["feeds","goes to","leads to","goes","talks to","links to","name","front"]:
    pt=ph.split(); ex=[]
    for (s,names),toks in zip(chatter,chat):
        for i in range(len(toks)-len(pt)+1):
            if toks[i:i+len(pt)]==pt: ex.append(s.strip()); break
    print(f"== {ph!r}: {len(ex)} chatter sentences")
    for e in ex[:4]: print("    ",e[:140])
