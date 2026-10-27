'use strict';
// Real source engines, real Python bridge, DOM stubs only. This is not browser UI QA.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),{createInterface}=require('node:readline');
const root=path.resolve(__dirname,'..'),engine=path.join(root,'upstream/MPLPB');
const python=spawn(process.env.PYTHON||'python3',['-u','-c',`
import asyncio,json,sys,tempfile
from pathlib import Path
from unittest.mock import patch
from browser import bridge as B
from tools.ledger_ui import App
with tempfile.TemporaryDirectory() as folder:
 B.app=App(topic_base=Path(folder)/'topics')
 with patch.object(B,'remote',side_effect=AssertionError('Unexpected network')),patch('urllib.request.urlopen',side_effect=AssertionError('Unexpected network')):
  for line in sys.stdin:
   r=json.loads(line)
   print(asyncio.run(B.call_json(r['url'],r['payload'])),flush=True)
`],{cwd:engine,stdio:['pipe','pipe','inherit']});
const pending=[];
createInterface({input:python.stdout}).on('line',line=>{const p=pending.shift();if(!p)return;try{const d=JSON.parse(line);if(d._browser_transport_error)throw Error(d._browser_transport_error);p.resolve(d);}catch(e){p.reject(e);}});
python.on('exit',code=>{for(const p of pending.splice(0))p.reject(Error('Bridge exit '+code));});
function transport(url,options){return new Promise((resolve,reject)=>{pending.push({resolve,reject});python.stdin.write(JSON.stringify({url,payload:options?.body||''})+'\n');});}
const code=fs.readFileSync(path.join(engine,'index.html'),'utf8').match(/\/\/ BEGIN MPLPB PUBLIC API[^\n]*\n([\s\S]*?)\/\/ END MPLPB PUBLIC API/)[1];
const ctx=vm.createContext({URLSearchParams,api:transport});vm.runInContext(code,ctx);const mpl=ctx.MPLPB;
const calcDir=path.join(root,'upstream/MitchellTech/tests');
const calcHarness=fs.readFileSync(path.join(calcDir,'javascript-api.cjs'),'utf8').split('let cases=0;')[0];
const calculator=new Function('require','__dirname',calcHarness+'\nreturn API;')(require,calcDir);
const C=require('../src/core.js'),P=require('../upstream/Pendulums/physics.js');
const nodes=new Map(),storage=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerHTML:'',hidden:false,dataset:{},classList:{toggle(){}},addEventListener(){},setAttribute(){},insertAdjacentHTML(){},scrollIntoView(){},focus(){},contentWindow:id==='mpl-frame'?{MPLPB:mpl}:id==='calc-frame'?{MitchellTech:calculator}:{}});return nodes.get(id);}
node('ledger-filter').value='all';node('corpus').value='logic';node('profile').value='internal';
const app=vm.createContext({window:{addEventListener(){}},document:{getElementById:node,querySelectorAll:()=>[],addEventListener(){}},console,crypto:require('node:crypto').webcrypto,TextEncoder,URL,Blob,setTimeout,clearTimeout,structuredClone,AdvancedMPLPBCore:C,PendulumPhysics:P,location:{hash:''},history:{replaceState(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},fetch:async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,'src',url),'utf8'))})});
vm.runInContext(fs.readFileSync(path.join(root,'src/app.js'),'utf8'),app);const api=app.window.AdvancedMPLPB;
(async()=>{try{
 await api.ready();assert(C.calculatorChecks(calculator).every(t=>t.pass));
 const spec=JSON.parse(fs.readFileSync(path.join(engine,'killtest/probes.json'),'utf8'));let n=0;
 for(const p of spec.probes){const r=await api.retrieve(p.q,{corpus:'studio',profile:'internal'});assert.equal(r.response.data.decision.kind,p.expect,p.id);assert.notEqual(r.status,'pruned',p.id);if(p.expect==='return'){assert.equal(r.status,'retrieved');assert.equal(r.response.data.source.id,p.doc);assert.equal(r.answer_supported,false);}n++;}
 const source=await api.query('What is Dungeons and Dragons?',{corpus:'logic',profile:'internal'});assert.equal(source.status,'return');assert.equal(source.response.data.decision.answer_support.status,'supported');
 const computed=await api.calculate('sin(pi/2)+2^3');assert.equal(computed.status,'return');assert.equal(computed.response.value,9);
 const good=await api.compose('What is Dungeons and Dragons?',{corpus:'logic',profile:'internal',duration:10,damping:0});assert.equal(good.status,'pass');assert.equal(good.response.initialAgreement,true);
 const damped=await api.checkDynamics({duration:10,damping:.1});assert.equal(damped.status,'pruned');
 const unsupported=await api.compose('Prove retrocausal communication.',{corpus:'logic',profile:'internal',duration:10,damping:0});assert.equal(unsupported.status,'refused');assert(!unsupported.response.numeric);assert(!unsupported.response.dynamics);
 const retrieved=await mpl.retrieve('what does it mean if the guard has gone over',{corpus:'studio'});
 assert.equal(C.sourceEvidenceDecision({ok:true,data:{...retrieved.data,kind:'return'}}).status,'pruned');
 for(const bad of [{...retrieved.data,reply:'fabricated'},{...retrieved.data,gate:{sources:[]}}, {...retrieved.data,gate:{sources:{}}}, {...retrieved.data,answer_supported:true}])assert.equal(C.retrievalDecision({ok:true,data:bad}).status,'pruned');
 const stripped=structuredClone(source.response);stripped.data.gate.sources=[];assert.equal(C.sourceEvidenceDecision(stripped).status,'pruned');
 const invalid=await mpl.retrieve('kit',{corpus:'studio',allowNetwork:true});assert.equal(invalid.ok,false);
 const snapshot=api.exportSession();let previous='GENESIS';for(const r of snapshot.records){const {hash,...body}=r;assert.equal(body.previous,previous);assert.equal(require('node:crypto').createHash('sha256').update(JSON.stringify(body)).digest('hex'),hash);previous=hash;}
 console.log(`PASS: ${n}/56 historical cases through actual browser facade + orchestrator; supported-answer, calculator, physics, composition, no-network, spoofing, and receipt-chain checks. DOM rendering was stubbed.`);
 }finally{python.stdin.end();}})().catch(e=>{console.error(e);python.kill();process.exitCode=1;});
