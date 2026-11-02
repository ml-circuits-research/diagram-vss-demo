import json,glob,re,collections
import os
H=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))+'/'
DIRS=["llm_train/sonnet_msg","llm_train/haiku_msg","llm_train/sonnet_msg2","llm_train/haiku_msg2","llm_train/sonnet_long","llm_bench/fresh1/sonnet","llm_bench/fresh1/haiku","llm_bench/sonnet_spans","llm_bench/haiku_spans"]
SYN={'shape':{'circle':['dot','dots','ball','balls'],'rectangle':['rect','box','boxes','block','blocks'],'diamond':['rhombus'],'ellipse':['oval','ovals']},
 'color':{'red':['crimson','scarlet'],'yellow':['amber'],'gold':['golden'],'teal':['turquoise'],'cyan':['aqua'],'purple':['violet','lilac'],'magenta':['fuchsia'],'pink':['rose'],'gray':['grey','silver']},
 'size':{'tiny':['minuscule'],'small':['little'],'medium':['normal','regular','average'],'large':['big'],'huge':['giant','enormous','massive']}}
CANON={'shape':{'circle':['circle','circles'],'rectangle':['rectangle','rectangles'],'diamond':['diamond','diamonds'],'ellipse':['ellipse','ellipses']},'color':{v:[v] for v in SYN['color']},'size':{v:[v] for v in SYN['size']}}
spans=[]
for d in DIRS:
    for f in glob.glob(H+d+'/msg_*.jsonl')+glob.glob(H+d+'/batch_*.jsonl'):
        for l in open(f):
            if l.strip():
                m=json.loads(l)
                for w in m.get('wires',[]):
                    if w.get('span'): spans.append((w['span'].lower(), json.dumps(w['args']).lower()))
def has(sp,word): return re.search(r'\b'+re.escape(word)+r'\b',sp) is not None
print("question value: canonical-word spans with the gold value | synonym-word spans with the gold value (per synonym)")
for q in SYN:
    for v,ss in SYN[q].items():
        gv=lambda a: (f'"{q}": "{v}"' in a) or (f'{q}={v}' in a)
        c=sum(1 for sp,a in spans if gv(a) and any(has(sp,x) for x in CANON[q][v]))
        syn={s:sum(1 for sp,a in spans if gv(a) and has(sp,s)) for s in ss}
        print(f"  {q:5s} {v:9s} canonical {c:4d} | "+", ".join(f"{s} {n}" for s,n in syn.items()))
