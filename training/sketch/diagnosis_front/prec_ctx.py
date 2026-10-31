from diag1 import *
d=[x for x in json.load(open("diag3.json")) if x["cls"].startswith("2") and "prec" in x["cls"]]
print(len(d),"requests in class 2 with prec failure")
rows=collections.OrderedDict()
for x in d:
    ph,p,n=x["ph"],x["p"],x["n"]
    g=keystat((ph,"*","*")); s=keystat((ph,p,n))
    rows[(ph,p,n)]=(x["ev"],g["n"],g["fp_chat"],g["fp_span"],s and (s["n"],round(s["prec"],2),s["fp_chat"],s["fp_span"]))
for k,v in rows.items(): print(k,v)
