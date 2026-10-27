(function(root){
'use strict';
const LIMITS=Object.freeze({energy:1e-5,angularMomentum:1e-5,length:1e-9,tangency:1e-9});
function calculatorChecks(api){
 const cases=[['Exponent precedence','2^3^2',512],['Radian trigonometry','sin(pi/2)',1],['Square root','sqrt(81)',9]];
 return [...cases.map(([name,input,value])=>{const response=api.calculate(input,{angle:'rad'});return {name,input,pass:response.ok===true&&Number.isFinite(response.value)&&Math.abs(response.value-value)<1e-12,response};}),...['sqrt(-1)','alert(1)'].map(input=>{const response=api.calculate(input);return {name:'Reject '+input,input,pass:response.ok===false,response};})];
}
function dynamics(physics,options={}){
 const duration=Number(options.duration??10),damping=Number(options.damping??0);
 if(![10,30,60].includes(duration))throw Error('Duration must be 10, 30 or 60 seconds');
 if(!Number.isFinite(damping)||damping<0||damping>.5)throw Error('Damping must be between 0 and 0.5 s⁻¹');
 const config={id:0,length:2.8,mass:1,theta:43,phi:0,spin:1.7,push:0};
 const p=physics.makePendulum(config),initial=physics.measures(p),dt=physics.FIXED_DT;
 const scaleE=Math.max(Math.abs(initial.total),1e-9),scaleJ=Math.max(Math.abs(initial.angularMomentumZ),p.mass*p.length*initial.speed,1e-9);
 const maxima={energy:0,angularMomentum:0,length:0,tangency:0};let allFinite=true;const samples=[];
 for(let n=1;n<=Math.round(duration/dt);n++){
  physics.step(p,dt,9.81,damping);const m=physics.measures(p);
  const errors={energy:Math.abs(m.total-initial.total)/scaleE,angularMomentum:Math.abs(m.angularMomentumZ-initial.angularMomentumZ)/scaleJ,length:Math.abs(Math.hypot(...p.r)-p.length)/p.length,tangency:Math.abs(p.r.reduce((v,x,i)=>v+x*p.v[i],0))/Math.max(p.length*m.speed,1e-9)};
  for(const key in maxima){if(!Number.isFinite(errors[key]))allFinite=false;maxima[key]=Math.max(maxima[key],errors[key]);}
  if(n%240===0)samples.push({time:n*dt,energy:m.total,Jz:m.angularMomentumZ,x:p.r[0],y:p.r[1],z:p.r[2]});
 }
 const pass=allFinite&&Object.keys(LIMITS).every(key=>maxima[key]<=LIMITS[key]);
 return {pass,claim:'Energy and vertical angular momentum remain within the registered conservation limits',duration,damping,config,gravity:9.81,dt,steps:Math.round(duration/dt),limits:LIMITS,normalization:{energy:scaleE,angularMomentum:scaleJ,length:'L',tangency:'max(L × speed, 1e-9)'},maxima,initial,final:physics.measures(p),samples,notice:'Finite numerical behavior for this run only; RK4 with projection is not exactly conservative. Drag is expected to violate an undamped conservation claim.'};
}
function sourceDecision(response){
 if(!response||response.ok!==true) return {status:'error',text:response?.error||'Source engine failed'};
 const d=response.data;
 if(!d||typeof d.kind!=='string'||typeof d.reply!=='string')return {status:'error',text:'Invalid MPLPB relay response; source path stopped.'};
 if(d.kind==='return'&&!d.citation)return {status:'pruned',text:'Return withheld: MPLPB provided no citation. Source path failed its declared gate.'};
 return {status:d.kind==='return'?'return':'refused',text:d.reply,kind:d.kind,citation:d.citation,gate:d.gate};
}
function sameSource(d){
 const r=d?.decision;
 if(!r||!r.id||!r.path||!r.hash||!d.citation)return null;
 const sources=Array.isArray(d?.gate?.sources)?d.gate.sources:[];
 const matches=sources.filter(s=>s.id===r.id&&s.path===r.path&&s.hash===r.hash&&s.verification?.hash_intact===true&&s.verification?.lineage_pinned===true&&s.verification?.origin_explicit===true);
 return matches.length===1?matches[0]:null;
}
function sourceEvidenceDecision(response){
 const out=sourceDecision(response);
 if(out.status!=='return')return out;
 const d=response.data,r=d.decision,source=sameSource(d),support=r?.answer_support;
 const spans=support?.spans;
 const quoted=Array.isArray(spans)&&spans.length>0&&spans.every(x=>typeof x.quote==='string'&&x.quote.length>0&&typeof source?.text==='string'&&source.text.includes(x.quote));
 const procedure=support?.procedure;
 const procedural=procedure?.status==='supported'&&procedure.source?.id===source?.id&&procedure.source?.hash===source?.hash&&Array.isArray(procedure.steps)&&procedure.steps.length>0&&procedure.steps.every(x=>x.source?.hash===source?.hash&&typeof x.source?.quote==='string'&&typeof source?.text==='string'&&source.text.includes(x.source.quote));
 if(d.answer_supported===false||r?.kind!=='return'||support?.status!=='supported'||!source||(!quoted&&!procedural)||d.reply!==r.text){
  return {status:'pruned',text:'Supported-answer gate failed: intact cited source and explicit body evidence are required. No retrieval fallback was used.'};
 }
 return out;
}
function retrievalDecision(response){
 if(response?.ok!==true)return {status:'error',text:response?.error||'Retrieval engine failed'};
 const d=response.data;
 if(!d||typeof d.kind!=='string')return {status:'error',text:'Invalid retrieval response'};
 if(d.kind!=='retrieved')return {status:'refused',kind:d.kind,text:d.decision?.reason||d.notice||'No unique eligible page'};
 const source=sameSource(d);
 if(d.answer_supported!==false||d.authority!=='source_page_retrieval'||d.decision?.kind!=='return'||!source||d.source?.id!==source.id||d.source?.path!==source.path||d.source?.hash!==source.hash||d.reply!==source.text||d.decision?.text!==source.text){
  return {status:'pruned',text:'Retrieved page failed its identity, byte or provenance checks. No replacement owner was chosen.'};
 }
 return {status:'retrieved',kind:'retrieved',text:d.reply,citation:d.citation,gate:d.gate,answer_supported:false};
}
const api=Object.freeze({LIMITS,calculatorChecks,dynamics,sourceDecision,sourceEvidenceDecision,retrievalDecision});
if(typeof module==='object'&&module.exports)module.exports=api;root.AdvancedMPLPBCore=api;
})(typeof globalThis!=='undefined'?globalThis:this);
