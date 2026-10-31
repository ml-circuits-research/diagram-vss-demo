const fs=require("fs");
const a=JSON.parse(fs.readFileSync("all.json"));
const act=(t,x)=>`${t}:${x.action||x.ask||""}`;
const isList=v=>typeof v==="string"&&v.includes(",")&&!v.startsWith("mention(")||Array.isArray(v);
const G=JSON.parse(fs.readFileSync("G3.json"));
const nm=s=>s.replace(/^n_/,"");
function parseRaw(raw){const o={};for(const p of raw.split(" | ")){const m=/^(\w+)=\[(.*)\]$/.exec(p);if(m)o[m[1]]=m[2].split("&").map(s=>s.replace(/\/.*/,""));}return o;}
const lc=s=>String(s||"").toLowerCase();
const goldSet=v=>v==null?null:String(v).toLowerCase().split(",");
const out=[];
for(const x of G){
  const R=parseRaw(x.raw), N=k=>(R[k]||[]).map(s=>nm(s).toLowerCase());
  const gnames=new Set(); for(const k of ["from","to","target","anchor"]) if(x.gold[k]&&!String(x.gold[k]).startsWith("mention(")) String(x.gold[k]).toLowerCase().split(",").forEach(n=>gnames.add(n));
  const toks=x.tokens.split(" ").filter(t=>t.startsWith("n_")).map(t=>t.slice(2));
  const missing=[...gnames].filter(n=>n!=="$new"&&!toks.includes(n.replace(/[^a-z0-9]+/g,"_")));
  const hasPron=/\b(them|it|both|those|four|three|each)\b/.test(x.tokens)&&missing.length>0;
  const ev=x.gold.action||x.gold.ask;
  let cls;
  if(missing.length) cls="R context/pronoun (gold names not in span: "+missing.join("/")+")";
  else {
    const mem=N("members"),tgs=N("targets"),src=N("source"),tg=N("target"),obj=N("object");
    const fromG=goldSet(x.gold.from), toG=goldSet(x.gold.to), tarG=goldSet(x.gold.target);
    const same=(A,B)=>A&&B&&A.length===B.length&&A.every((v,i)=>v===B[i]);
    const cands=(arr)=>arr.some(c=>same(c.slice().sort(),null)||false);
    const eqs=(A,B)=>A&&B&&A.slice().sort().join()===B.slice().sort().join();
    const uni=(...ls)=>[...new Set(ls.flat())];
    let fromOK=null,toOK=null;
    if(["connect","disconnect","path"].includes(ev)){
      if(fromG) fromOK=[eqs(fromG,src)&&"source",eqs(fromG,mem)&&"members",eqs(fromG,uni(src,mem))&&"src+mem"].filter(Boolean);
      if(toG) toOK=[eqs(toG,tg)&&"target",eqs(toG,tgs)&&"targets",eqs(toG,uni(tg,tgs))&&"tgt+tgts"].filter(Boolean);
      const conflict=(src.length&&mem.length)||(tg.length&&tgs.length);
      const okF=!fromG||fromOK.length, okT=!toG||toOK.length;
      cls=(okF&&okT)?(conflict?"M2 wires hold the gold only among filled twin roles":"C conversion"):"M1 gold set not in wires";
      x._d={src,tg,mem,tgs,fromOK,toOK};
    } else {
      const c=[eqs(tarG,mem)&&"members",eqs(tarG,uni(obj,mem))&&"obj+mem",eqs(tarG,obj)&&"object"].filter(Boolean);
      x._d={obj,mem,c};
      cls=c.length?(c.includes("obj+mem")&&!c.includes("members")?"C-union object+members":"C conversion"):"M1 gold set not in wires";
    }
  }
  out.push([cls,x]);
}
const cnt={};out.forEach(([c])=>cnt[c]=(cnt[c]||0)+1);console.log(cnt);
fs.writeFileSync("G3cls.json",JSON.stringify(out));
for(const [c,x] of out){ if(c.startsWith("C")) console.log(c,"|",x.id,x.span,"|",JSON.stringify(x._d),"| bad",x.bad.join(";"));}
