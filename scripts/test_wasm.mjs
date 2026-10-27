// Real packaged Python/WebAssembly and public facade. No browser/IndexedDB claim.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const core=path.resolve(process.argv[2]||'');
if(!process.argv[2])throw Error('Usage: node scripts/test_wasm.mjs /path/to/verified/pyodide [results.json]');
const dir=path.join(root,'web/vendor/mplpb'),hash=b=>createHash('sha256').update(b).digest('hex');
const parts=fs.readdirSync(dir).filter(n=>/^bundle-\d+\.txt$/.test(n)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
const bundle=JSON.parse(parts.map(n=>fs.readFileSync(path.join(dir,n),'utf8')).join(''));
for(const [name,expected] of Object.entries(bundle.runtime_manifest))assert.equal(hash(fs.readFileSync(path.join(core,name))),expected,'Runtime pin '+name);
for(const [name,expected] of Object.entries(bundle.manifest))assert.equal(hash(Buffer.from(bundle.files[name],'base64')),expected,'Source pin '+name);
const {loadPyodide}=await import(pathToFileURL(path.join(core,'pyodide.mjs')));
const py=await loadPyodide({indexURL:core+path.sep,enableRunUntilComplete:false});
for(const [name,b64] of Object.entries(bundle.files)){const p='/app/'+name;py.FS.mkdirTree(path.dirname(p));py.FS.writeFile(p,Buffer.from(b64,'base64'));}
await py.runPythonAsync("import sys,os\nsys.path.insert(0,'/app')\nos.chdir('/app')\nfrom browser.bridge import call_json");
const context=vm.createContext({URLSearchParams,api:async(url,options)=>{py.globals.set('_u',url);py.globals.set('_d',options?.body||'');const result=JSON.parse(await py.runPythonAsync('await call_json(_u,_d)'));if(result._browser_transport_error)throw Error(result._browser_transport_error);return result;}});
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');vm.runInContext(html.match(/\/\/ BEGIN MPLPB PUBLIC API[^\n]*\n([\s\S]*?)\/\/ END MPLPB PUBLIC API/)[1],context);
const api=context.MPLPB;assert((await api.ready()).ok);
const C=createRequire(import.meta.url)('../src/core.js');
const raw=fs.readFileSync(path.join(root,'upstream/MPLPB/killtest/probes.json'));
assert.equal(hash(raw),'fd0f8b1d61a206dcbb612fdc7503ab339a09ec02aebf576b27554c1fb4cb9076');
const rows=[];
for(const p of JSON.parse(raw).probes){const r=await api.retrieve(p.q,{corpus:'studio',profile:'internal'});const decision=C.retrievalDecision(r);const pass=r.ok&&r.data.decision.kind===p.expect&&(p.expect!=='return'||(r.data.decision.id===p.doc&&decision.status==='retrieved'));rows.push({id:p.id,pass,response:r});assert(pass,p.id);}
const supported=await api.relay('What is Dungeons and Dragons?',{corpus:'logic'});assert.equal(C.sourceEvidenceDecision(supported).status,'return');
const unsupported=await api.relay('Prove retrocausal communication.',{corpus:'logic'});assert.equal(C.sourceEvidenceDecision(unsupported).status,'refused');
const invalid=await api.retrieve('kit',{corpus:'studio',allowNetwork:true});assert.equal(invalid.ok,false);
const result={runtime:'Pyodide '+bundle.runtime_version,source_manifest:bundle.manifest,benchmark_sha256:hash(raw),passed:rows.filter(r=>r.pass).length,total:rows.length,independence_verified:false,scope:'Actual packaged Python/WebAssembly and original public JavaScript facade in Node; no browser UI, CORS, Web Locks or IndexedDB test.',rows};
if(process.argv[3])fs.writeFileSync(path.resolve(process.argv[3]),JSON.stringify(result,null,2)+'\n');
console.log('PASS packaged WebAssembly: 56/56 retrieval cases, supported-answer/refusal gates, and network-option rejection.');
