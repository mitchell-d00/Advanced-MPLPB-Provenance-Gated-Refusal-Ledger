# Browser-local agent interface

Call these in the served Advanced MPLPB page, after startup:

```js
await AdvancedMPLPB.ready();
const page = await AdvancedMPLPB.retrieve('what does it mean if the guard has gone over', {
  corpus: 'studio', profile: 'internal'
});
// page.status === 'retrieved'; page.answer_supported === false
const answer = await AdvancedMPLPB.query('What is Dungeons and Dragons?', {
  corpus: 'logic', profile: 'internal'
});
const calculation = await AdvancedMPLPB.calculate('sin(pi/2)+2^3');
const dynamics = await AdvancedMPLPB.checkDynamics({duration:10,damping:0});
const run = await AdvancedMPLPB.compose('What is Dungeons and Dragons?', {
  corpus:'logic',profile:'internal',duration:10,damping:0
});
const snapshot = AdvancedMPLPB.exportSession();
```

This is a local JavaScript API, not a network service. Giving an agent a URL
does not grant access to another browser's data. Pass corpus/profile explicitly.

`retrieve` returns a cited page for inspection with no claim of answer support.
The original engine extension is `window.MPLPB.retrieve(question,{corpus,profile})`
in the MPLPB iframe's own context. Its top-level kind is `retrieved`; the
underlying `decision.kind` retains the historical `return`/`ambiguous`/
`not_in_corpus` retrieval vocabulary for mechanical comparisons.

`query` uses strict source support, never falls back to retrieval, and verifies
source identity and body evidence at the outer gate. `compose` calls this strict
path before any calculator/physics diagnostics. A page inspection cannot unlock
it. The game-definition example tests wiring, not a source-backed connection to
pendulum dynamics. All replies retain the original engine text.

Calculations use Mitchell Tech's verified numeric path in radians. Dynamics uses
the unchanged original 240-Hz engine and the declared finite-run error limits.
There is no new CAS authority or generated equation inference from source prose.

Receipts are browser-local, hash-linked and exportable. They are not externally
signed or automatically published. Export significant runs; quota and the
2,000-record cap can stop further recording. `runKillTests()` records its
outcomes, including failed or intentionally pruned negative controls.
