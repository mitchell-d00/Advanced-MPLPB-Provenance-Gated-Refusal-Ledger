# JavaScript project API hub

Advanced MPLPB 0.3.0 adds `window.AdvancedMPLPBHub` version 1.0.0. Open the
[hosted hub](https://mitchell-d00.github.io/Advanced-MPLPB-Provenance-Gated-Refusal-Ledger/web/#hub)
or serve the same `web/` locally. Its adapters execute the bundled, pinned
engines in the current page. It is a browser-local JavaScript API, not a hosted
REST service. No key, model, arbitrary code evaluation or application server is
required. Remote clients cannot call a page global just by knowing its URL.

```js
await AdvancedMPLPBHub.ready();
const registry = await AdvancedMPLPBHub.describe();
const calculation = await AdvancedMPLPBHub.call('calculator', 'calculate', ['sin(pi/2)+2^3']);
const page = await AdvancedMPLPBHub.call('mplpb', 'retrieve', [
  'what does it mean if the guard has gone over',
  {corpus:'studio', profile:'internal'}
]);
const conservation = await AdvancedMPLPBHub.call('pendulums', 'checkDynamics', [
  {duration:10, damping:0}
]);
const checks = await AdvancedMPLPBHub.checkAll();
const report = AdvancedMPLPBHub.exportReport();
```

## Methods

| Method | Result and side effects |
| --- | --- |
| `ready()` | Engine readiness; same contract as `AdvancedMPLPB.ready()` |
| `describe()` | Version, execution notice, project URLs, pinned commits, method examples and dynamics limits |
| `call(project, method, args=[])` | Calls a fixed adapter with a JSON argument array; rejects unknown projects/methods and invalid top-level arguments |
| `checkProject(project)` | One bounded bundled check; returns `{project,time,pass,scope,...}` and retains it in this tab's check history |
| `checkAll()` | Sequentially checks all three adapters and returns three result rows |
| `checkDeployment(project, baseURL?)` | Fetches the selected deployment asset and compares SHA-256 to the bundled asset; default URL is the project's published site |
| `getChecklist()` | Independent snapshot of the saved checklist |
| `setChecklist(project, stage, {status,evidence})` | Saves a user report to local storage; returns the saved entry |
| `exportReport()` | Independent data snapshot of checklist and latest 100 tab-local checks; no file download |

Project IDs are `mplpb`, `calculator` and `pendulums`. The fixed adapters are:

| Project | Allowed methods and argument array |
| --- | --- |
| `mplpb` | `retrieve` or `query`: `[question, {corpus,profile}]`; defaults are studio/internal. `query` uses strict supported answers. |
| `mplpb` | `listCorpora`: `[]`; `listPages`: `[{corpus,profile}]`; `readPage`: `[path,{corpus,profile}]`. Inspect the inventory for a real path before calling `readPage`. These return the upstream `{ok,data,error?}` envelope. |
| `calculator` | `calculate`: `[expression]`, always radians and finite real numeric results |
| `pendulums` | `checkDynamics`: `[{duration,damping}]`; duration is 10/30/60 seconds and damping 0–0.5. `negativeControl` uses the same options but forces damping 0.1. |

Retrieval, supported query, calculation and dynamics return the existing console
receipt and add records to its hash chain. Inventory calls do not add receipts.
`negativeControl` is expected to return a **pruned** conservation receipt. The
Pendulums smoke check passes only when the undamped fixture passes and this
negative control is pruned. Each smoke check describes its own scope; none is a
replacement for the complete automated or browser suites.

## Deployment checks

```js
await AdvancedMPLPBHub.checkDeployment('calculator');
await AdvancedMPLPBHub.checkDeployment('pendulums', 'http://localhost:8080/');
```

The base URL must point to the project's served directory, not this hub's root.
Use HTTPS or HTTP on localhost/127.0.0.1/::1, without credentials. The checker
fetches `index.html` for MPLPB/calculator and `physics.js` for Pendulums. It uses
no credentials, requests fresh bytes with a 45-second timeout and reports the
HTTP status, byte length, SHA-256 and whether bytes match the bundled snapshot.
Queries and calculations never switch to a remote engine through this method.

`pass:true` here means a nonempty deployment asset was fetched and compared. A
changed hash is reported separately as `matchesBundled:false`, because upstream
can legitimately advance. It does not certify the remote JavaScript API, all
assets, rendering, scientific results or deployment commit. Network/CORS failures
return `pass:false` with an error and scope notice; they do not prove an outage.
Cross-origin local servers must send an appropriate CORS header. The hub performs
no deployment request until the user invokes a deployment check. These requests
contact the chosen server and may appear in its logs.

## Release evidence and exports

Stages are `docs`, `automated`, `browser`, `deployment`. Status is `pending`,
`pass` or `fail`; pass/fail requires nonempty evidence text of at most 2,000
characters. Record the tested commit/version and a CI/report/deployment URL or
concrete observation. Entries carry a timestamp and `authority:'user-reported'`.
The hub does not infer independent verification from a manual checklist.

```js
AdvancedMPLPBHub.setChecklist('calculator','browser', {
  status:'pass', evidence:'Commit <sha>; CI run <URL>; 82 Chromium checks passed'
});
```

Checklist entries persist in `advanced-mplpb-hub-checklist-v1` in this origin and
browser profile. Automated check history is bounded to 100 rows and lives only
in memory until export; it resets on reload. UI **Export hub report** downloads
`advanced-mplpb-hub-report.json` with schema 1, hub/console versions, engine pins, export time, checklist, check rows
and `independence_verified:false`. This report is separate from the refusal
ledger export and is not hash-linked or signed. There is no report import.
Storage errors are displayed rather than treated as successful saves.

To support another project, add a reviewed adapter and card in `src/hub.js`,
method examples and a bounded test. Rebuild the source copies and asset manifest
as described in [DEVELOPMENT.md](DEVELOPMENT.md). The UI intentionally exposes
fixed methods rather than arbitrary evaluation or a credential-bearing proxy.
