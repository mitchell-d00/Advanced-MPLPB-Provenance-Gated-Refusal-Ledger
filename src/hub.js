/* Project API hub: fixed adapters, deployment probes and evidence checklist. */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const owner = 'https://github.com/mitchell-d00/';
const pages = 'https://mitchell-d00.github.io/';
const projects = [
 {id:'mplpb',name:'Combined MPLPB',role:'Source ownership, provenance and explicit refusals',repo:'Combined-MPLPB-A-closed-local-ledger-of-pages-that-answers-only-from-those-pages',asset:'index.html',local:'vendor/mplpb/index.html',methods:{retrieve:['what does it mean if the guard has gone over',{corpus:'studio',profile:'internal'}],query:['What is Dungeons and Dragons?',{corpus:'logic',profile:'internal'}],listCorpora:[],listPages:[{corpus:'studio',profile:'internal'}],readPage:['',{corpus:'studio',profile:'internal'}]}},
 {id:'calculator',name:'Mitchell Tech',role:'Scientific expressions through the verified numeric API',repo:'Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-',asset:'index.html',local:'vendor/calculator/index.html',methods:{calculate:['sin(pi/2)+2^3']}},
 {id:'pendulums',name:'Pendulums',role:'Fixed-step dynamics, conservation and negative controls',repo:'Pendulums',asset:'physics.js',local:'vendor/physics.js',methods:{checkDynamics:[{duration:10,damping:0}],negativeControl:[{duration:10,damping:0.1}]}}
];
const stages = [{id:'docs',label:'Current documentation'},{id:'automated',label:'Automated tests'},{id:'browser',label:'Browser checks'},{id:'deployment',label:'Deployment verification'}];
const key = 'advanced-mplpb-hub-checklist-v1';
let checklist = {}, savedError = '', latest = [], busy = false;
try { const raw = JSON.parse(localStorage.getItem(key) || '{}'); if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Invalid checklist'); checklist = raw; } catch (e) { savedError = 'Checklist could not be read. Export retained browser data before replacing it. ' + e.message; }
const getProject = id => { const p = projects.find(p => p.id === id); if (!p) throw Error('Unknown project: ' + id); return p; };
function cleanURL(value) {
 const u = new URL(value);
 if (u.username || u.password || !((u.protocol === 'https:') || (u.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(u.hostname)))) throw Error('Use HTTPS or a localhost HTTP URL without credentials');
 u.hash = ''; u.search = ''; if (!u.pathname.endsWith('/')) u.pathname += '/'; return u;
}
async function sha(bytes) { return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), x => x.toString(16).padStart(2,'0')).join(''); }
async function call(id, method, args = []) {
 const p = getProject(id);
 if (!Object.hasOwn(p.methods,method)) throw Error('Method is not exposed for this project');
 if (!Array.isArray(args) || args.length > 2) throw Error('Arguments must be a JSON array with at most two entries');
 const api = window.AdvancedMPLPB;
 await api.ready();
 if (id === 'calculator') { if (typeof args[0] !== 'string') throw Error('calculate requires an expression string'); return api.calculate(args[0]); }
 if (id === 'pendulums') {
  const options = args[0] ?? {};
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw Error('Dynamics options must be an object');
  if (method === 'negativeControl') return api.checkDynamics({...options,damping:0.1});
  return api.checkDynamics(options);
 }
 if (method === 'query' || method === 'retrieve') {
  if (typeof args[0] !== 'string') throw Error('A question string is required');
  const o = args[1] ?? {};
  if (!o || typeof o !== 'object' || Array.isArray(o) || Object.keys(o).some(k => !['corpus','profile'].includes(k))) throw Error('Only corpus and profile options are supported');
  return api[method](args[0],{corpus:o.corpus || 'studio',profile:o.profile || 'internal'});
 }
 const mpl = $('mpl-frame').contentWindow.MPLPB;
 return mpl[method](...args);
}
async function checkProject(id) {
 let result;
 try {
  if (id === 'mplpb') { const r = await call(id,'retrieve',projects[0].methods.retrieve); result = {pass:r.status === 'retrieved' && r.answer_supported === false && r.response?.data?.source?.id === 'STUDIO-0006',receipt:r.id,observed:r.status,scope:'Bundled page retrieval; expected STUDIO-0006, never a supported answer'}; }
  else if (id === 'calculator') { const r = await call(id,'calculate',['sin(pi/2)+2^3']); result = {pass:r.status === 'return' && r.response?.value === 9,receipt:r.id,observed:r.response?.value,scope:'Bundled radian numeric expression; expected 9'}; }
  else { getProject(id); const a = await call(id,'checkDynamics',[{duration:10,damping:0}]); const b = await call(id,'negativeControl',[{duration:10}]); result = {pass:a.status === 'pass' && b.status === 'pruned',receipts:[a.id,b.id],observed:[a.status,b.status],scope:'Bundled 10-second conservation and damped negative control'}; }
 } catch (e) { result = {pass:false,error:e.message,scope:'Bundled API check'}; }
 const row = {project:id,time:new Date().toISOString(),...result}; latest.push(row); latest = latest.slice(-100); return structuredClone(row);
}
async function checkDeployment(id, base) {
 const p = getProject(id), target = cleanURL(base || pages+p.repo+'/'), url = new URL(p.asset,target).href;
 const row = {project:id,time:new Date().toISOString(),url,scope:'Deployment asset HTTP status and SHA-256; does not execute the remote API or certify UI behavior'};
 try {
  const response = await fetch(url,{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(45000)});
  row.httpStatus = response.status;
  if (!response.ok) throw Error('HTTP '+response.status);
  const bytes = await response.arrayBuffer();
  if (!bytes.byteLength) throw Error('Empty deployment asset');
  row.bytes = bytes.byteLength; row.sha256 = await sha(bytes);
  const local = await fetch(p.local,{credentials:'omit'});
  if (!local.ok) throw Error('Bundled comparison asset HTTP '+local.status);
  row.bundledSha256 = await sha(await local.arrayBuffer()); row.matchesBundled = row.sha256 === row.bundledSha256;
  row.pass = true; row.notice = row.matchesBundled ? 'Reachable asset matches the bundled snapshot.' : 'Reachable asset differs from the bundled snapshot. Review version changes; a difference is not a failed deployment.';
 } catch (e) { row.pass = false; row.error = e.message; row.notice = 'Could not verify from this browser. Check the URL, network and CORS; this does not prove the site is down.'; }
 latest.push(row); latest = latest.slice(-100); return structuredClone(row);
}
function setChecklist(id, stage, value) {
 getProject(id); if (!stages.some(s => s.id === stage)) throw Error('Unknown checklist stage');
 if (!value || !['pending','pass','fail'].includes(value.status) || typeof value.evidence !== 'string' || value.evidence.length > 2000) throw Error('Supply status pending/pass/fail and evidence text up to 2,000 characters');
 if (value.status !== 'pending' && !value.evidence.trim()) throw Error('Add evidence or a reason before marking pass/fail');
 if (savedError) throw Error(savedError);
 const next = {...checklist,[id]:{...checklist[id],[stage]:{status:value.status,evidence:value.evidence.trim(),time:new Date().toISOString(),authority:'user-reported'}}};
 localStorage.setItem(key,JSON.stringify(next)); checklist = next; return structuredClone(checklist[id][stage]);
}
async function describe() {
 const ready = await AdvancedMPLPB.ready();
 return {version:'1.0.0',execution:'page-local JavaScript; works on HTTPS or localhost; not an HTTP server',projects:projects.map(p=>({id:p.id,name:p.name,repository:owner+p.repo,live:pages+p.repo+'/',pin:ready.pins.engines[p.id].commit,methods:structuredClone(p.methods)})),limits:AdvancedMPLPB.limits};
}
const api = Object.freeze({version:'1.0.0',ready:()=>AdvancedMPLPB.ready(),describe,call,checkProject,checkAll:async()=>{const rows=[];for(const p of projects) rows.push(await checkProject(p.id));return rows;},checkDeployment,getChecklist:()=>structuredClone(checklist),setChecklist,exportReport:()=>structuredClone({schema:1,project:'Advanced MPLPB project API hub',exported:new Date().toISOString(),independence_verified:false,checklist,checks:latest})});
window.AdvancedMPLPBHub = api;
function output(value) { $('hub-output').textContent = JSON.stringify(value,null,2); }
function methods() {
 const p = getProject($('hub-project').value);
 $('hub-method').replaceChildren(...Object.keys(p.methods).map(m=>new Option(m,m)));
 example(); renderChecklist(); $('hub-deployment-url').value = pages+p.repo+'/';
}
function example() { const p=getProject($('hub-project').value); $('hub-arguments').value=JSON.stringify(p.methods[$('hub-method').value],null,2); $('hub-snippet').textContent=`await AdvancedMPLPBHub.call(${JSON.stringify(p.id)}, ${JSON.stringify($('hub-method').value)}, ${JSON.stringify(p.methods[$('hub-method').value])});`; }
function renderChecklist() {
 const id=$('hub-project').value;
 $('hub-checklist').innerHTML=stages.map(s=>{const v=checklist[id]?.[s.id]||{status:'pending',evidence:''};return `<div class="hub-check-row"><label for="hub-stage-${s.id}">${s.label}</label><select id="hub-stage-${s.id}" data-stage="${s.id}" aria-label="${s.label} status"><option value="pending">Pending</option><option value="pass">Pass · reported</option><option value="fail">Fail · reported</option></select><input id="hub-evidence-${s.id}" aria-label="${s.label} evidence" maxlength="2000" placeholder="Evidence URL, commit, result or reason" value="${esc(v.evidence)}"><button class="secondary" data-save-stage="${s.id}">Save</button><small id="hub-saved-${s.id}">${v.time?'User reported · '+esc(v.time):'No evidence saved'}</small></div>`;}).join('');
 for(const s of stages) $('hub-stage-'+s.id).value=checklist[id]?.[s.id]?.status||'pending';
 $('hub-storage-status').textContent=savedError||'Saved in this browser. Pass/fail requires evidence. These are user reports, separate from automated test results.';
}
async function action(fn) { if(busy)return;busy=true;document.querySelectorAll('[data-hub-action]').forEach(b=>b.disabled=true);$('hub-run-status').textContent='Running…';try{const result=await fn();output(result);$('hub-run-status').textContent='Complete · inspect the result and its scope';}catch(e){output({error:e.message});$('hub-run-status').textContent='Stopped · '+e.message;}finally{busy=false;document.querySelectorAll('[data-hub-action]').forEach(b=>b.disabled=false);} }
$('hub-project').replaceChildren(...projects.map(p=>new Option(p.name,p.id)));
$('hub-cards').innerHTML=projects.map((p,i)=>`<article class="hub-card"><span class="eyebrow">PROJECT 0${i+1}</span><h3>${p.name}</h3><p>${p.role}</p><p class="hub-pin" id="hub-pin-${p.id}">Reading source pin…</p><div class="hub-links"><a href="${pages+p.repo}/" target="_blank" rel="noopener noreferrer">Live site ↗</a><a href="${owner+p.repo}" target="_blank" rel="noopener noreferrer">Repository ↗</a><a href="${owner+p.repo}/actions" target="_blank" rel="noopener noreferrer">CI ↗</a></div><button class="secondary" data-select-project="${p.id}">Use API →</button></article>`).join('');
methods();
$('hub-method').onchange=example;$('hub-project').onchange=methods;
$('hub-call').onclick=()=>action(()=>api.call($('hub-project').value,$('hub-method').value,JSON.parse($('hub-arguments').value)));
$('hub-check').onclick=()=>action(()=>api.checkProject($('hub-project').value));
$('hub-check-all').onclick=()=>action(()=>api.checkAll());
$('hub-live-check').onclick=()=>action(()=>api.checkDeployment($('hub-project').value,$('hub-deployment-url').value));
$('hub-export').onclick=()=>{const blob=new Blob([JSON.stringify(api.exportReport(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='advanced-mplpb-hub-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('view-hub').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.selectProject){$('hub-project').value=b.dataset.selectProject;methods();$('hub-project').focus();}if(b.dataset.saveStage){const stage=b.dataset.saveStage;try{api.setChecklist($('hub-project').value,stage,{status:$('hub-stage-'+stage).value,evidence:$('hub-evidence-'+stage).value});renderChecklist();$('hub-storage-status').textContent='Evidence saved for '+getProject($('hub-project').value).name+'. User-reported status.';}catch(error){$('hub-storage-status').textContent=error.message;}}});
api.describe().then(d=>{for(const p of d.projects)$('hub-pin-'+p.id).textContent='Bundled pin · '+p.pin.slice(0,8);$('hub-ready').textContent='Bundled engines ready';$('hub-ready').className='status ready';}).catch(e=>{$('hub-ready').textContent='Startup stopped';$('hub-ready').className='status error';output({error:e.message});});
})();
