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

## Methods and receipts (console 0.3.0)

For the three-project registry, deployment probes and release checklist, use
[`AdvancedMPLPBHub`](HUB_API.md). The original `AdvancedMPLPB` console API remains
available alongside it:

| Method | Options / result |
| --- | --- |
| `ready()` | Resolves `{ok:true,pins,independence_verified:false}` when engines/startup promises finish. This does not certify ledger integrity; inspect `exportSession().chainValid`. |
| `retrieve(question, options?)` | `{corpus,profile}`; defaults to the current UI selection. Returns a receipt, including `answer_supported:false` for a retrieved page. |
| `query(question, options?)` | Same scope defaults; strict supported answer, with source identity/body evidence checked again. Returns a receipt. |
| `calculate(expression)` | Original finite real calculator path in radians. Returns a `return` or `refused` receipt. |
| `checkDynamics(options?)` | `{duration:10|30|60,damping:0..0.5}`; defaults 10/0. Returns a `pass` or `pruned` receipt. Invalid specifications reject. |
| `compose(question, options?)` | Scope plus duration/damping. Adds the strict-source receipt and a composition receipt. Stops before numeric work on unsupported source output. |
| `runKillTests()` | Runs the UI suite (66 checks), updates its view and records results. Resolves after completion; inspect the UI summary or final ledger receipt for outcomes. A concurrent UI run is declined. |
| `exportSession()` | Returns a structured clone `{pins,records,chainValid,independence_verified:false}`. Does not download or clear anything. |
| `limits` | Energy/angular momentum normalized error `1e-5`; length/tangency error `1e-9`. |

Each saved receipt includes its ID, timestamp, surface, claim, status, pins,
`independence_verified:false`, previous hash and SHA-256. Operation-specific
fields retain responses, options, citations and gate evidence. Hashes cover
`JSON.stringify(body)` without the `hash` property, in its stored key order.

`retrieve`/`query`/`calculate`/`checkDynamics`/`compose` return Promises. Engine or
argument failures may reject rather than return an error envelope. The UI catches
those failures and attempts an error receipt. Programmatic callers should catch
rejections. Storage failure, the 2,000-record cap or a broken chain can reject a
write even if the engine calculation completed. Export does not free capacity.

The **UI download** is a separate schema: `{schema:1,project,exported,
independence_verified:false,chainIntact,pins,records}`. There is no console import
API. See [USER_GUIDE.md](USER_GUIDE.md) for storage ownership and recovery limits.
