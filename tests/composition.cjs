'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const C=require('../src/core.js'),P=require('../upstream/Pendulums/physics.js');
test('completion does not promote non-answers into support',()=>{
 for(const kind of ['ambiguous','not_in_corpus','candidate_only','help']){
  const r=C.sourceDecision({ok:true,data:{kind,reply:'Original text',citation:null}});
  assert.equal(r.status,'refused');assert.equal(r.text,'Original text');
 }
});
test('citation loss prunes returns; supported text stays verbatim',()=>{
 assert.equal(C.sourceDecision({ok:true,data:{kind:'return',reply:'quote'}}).status,'pruned');
 const r=C.sourceDecision({ok:true,data:{kind:'return',reply:' exact quote\n',citation:'[page / hash]'}});
 assert.equal(r.status,'return');assert.equal(r.text,' exact quote\n');
});
test('transport failures and malformed completions stop',()=>{
 assert.equal(C.sourceDecision({ok:false,error:'offline'}).status,'error');
 assert.equal(C.sourceDecision({ok:true,data:{}}).status,'error');
});
test('original undamped integrator survives registered limits',()=>{
 for(const duration of [10,30,60]){const r=C.dynamics(P,{duration,damping:0});assert.equal(r.pass,true);assert.equal(r.steps,duration*240);}
});
test('negative control prunes damped conservation',()=>{
 const r=C.dynamics(P,{duration:10,damping:.1});assert.equal(r.pass,false);assert(r.maxima.energy>r.limits.energy);
});
test('invalid specifications fail before simulation',()=>{
 for(const o of [{duration:Infinity},{duration:11},{damping:-1},{damping:NaN},{damping:3}])assert.throws(()=>C.dynamics(P,o));
});
