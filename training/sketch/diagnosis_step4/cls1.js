const fs=require("fs"),L=JSON.parse(fs.readFileSync("/home/claude/diagram-vss-demo/training/sketch/worlds/real/legend.json"));
const verbs={};L.events.forEach(e=>verbs[e.id]=e.verbs);
const a=JSON.parse(fs.readFileSync("all.json"));
const act=(t,x)=>`${t}:${x.action||x.ask||""}`;
const evId=(t,x)=>t==="command"?x.action:t==="question"?x.ask:t;   // fact / rule
const B=a.filter(x=>!x.ok&&x.verb&&x.got&&act(x.got.type,x.got)!==act(x.goldType,x.gold));
const out=[];
for(const x of B){
  const g=evId(x.goldType,x.gold), gv=(verbs[g]||[]);
  const toks=x.tokens.split(" ");
  const present=gv.filter(v=>toks.includes(v));
  let cls;
  const rawEv=x.rawEvent;
  if(rawEv===g) cls="C conversion (wire event = gold event)";
  else if(!present.length) cls="F front end: no token of the gold event ("+gv.join("/")+")";
  else cls="M model: gold verb token present ("+present.join("/")+"), wire event "+rawEv;
  out.push([cls,x,g]);
}
const c={};out.forEach(([k])=>{const kk=k.split(":")[0].split(" (")[0];c[kk]=(c[kk]||0)+1});console.log(B.length,c);
fs.writeFileSync("B1cls.json",JSON.stringify(out));
for(const [k,x,g] of out) console.log(k.slice(0,1),x.id,"|",x.span.slice(0,60),"|",x.tokens.slice(0,70),"| gold",g,"| wire",x.rawEvent,"|",k.slice(2,60));
