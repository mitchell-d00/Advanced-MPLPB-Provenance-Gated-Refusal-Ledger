# Using Advanced MPLPB

Open the [console](https://mitchell-d00.github.io/Advanced-MPLPB-Provenance-Gated-Refusal-Ledger/web/#console).
Wait for Combined MPLPB to show **Connected** and Mitchell Tech **Verified**.
The full Python/WebAssembly runtime is bundled locally; no account, model,
API key or runtime CDN is used. Startup downloads the engine assets. A loaded
tab can perform local work offline, but closing or reloading it may need network.

## Project API hub

Open **Project API hub** for three project cards with live/repository/CI links.
Choose a project and fixed method, edit its JSON argument array and select
**Run API**. **Check project / Check all three** runs bounded smoke checks against
the bundled engines. Outputs and scope notices appear below the workbench.

**Deployment check** fetches the selected project's entry asset from its live URL
or a specified HTTPS/localhost base URL. A hash difference from the pinned copy
is reported separately from HTTP success. These checks do not execute the remote
API. Cross-origin local servers need CORS permission.

The release checklist belongs to the selected project. Save a status with a
commit, evidence link or concrete result; pass/fail requires evidence. These
entries are explicitly user-reported and saved independently from the ledger.
**Export hub report** downloads saved checklist entries and the latest 100
checks from this tab; the in-memory checks reset on reload. See [HUB_API.md](HUB_API.md).

## Choose a console mode

| Mode | Input and result |
| --- | --- |
| Retrieve page | Select corpus/profile and ask for a page. A unique eligible owner returns cited page text with `answer_supported:false`. Multiple owners stop; missing ownership refuses. |
| Supported answer | Uses MPLPB's narrower source-support contract and rechecks source identity and quoted body evidence. Unsupported questions refuse; there is no retrieval fallback. |
| Calculation | Enter an expression such as `sin(pi/2)+2^3`. The original calculator's finite real numeric path runs in radians after reference checks. No CAS or tutor call is made. |
| Dynamical check | Select 10, 30 or 60 simulated seconds and damping from 0 to 0.5 s⁻¹. Runs the fixed Pendulums configuration and reports normalized drift and constraint errors. |
| Composed run | First requires a supported source answer, then checks fixed initial energy/angular momentum expressions against the integrator and runs the conservation diagnostic. The equations are not inferred from the question. |

Try retrieval in the **studio** corpus with “what does it mean if the guard has
gone over”. For a supported-answer or composition example, select **logic** and
ask “What is Dungeons and Dragons?”. The latter demonstrates gate wiring and
independent numeric agreement; it provides no scientific relationship between
the game definition and pendulum motion.

Internal/external profiles control source eligibility. “Internal” is a delivery
policy selection, not a login or authorization boundary. Bundled source bytes
are already available to anyone who downloads this public app.

The dynamics fixture uses length 2.8 m, mass 1 kg, tilt 43°, initial tangential
speed 1.7 m/s and gravity 9.81 m/s². It integrates at 240 Hz. Maximum normalized
energy and vertical-angular-momentum drift must each be ≤ 10⁻⁵; relative length
and tangency errors must each be ≤ 10⁻⁹. Nonzero damping is expected to prune an
undamped conservation claim. Passing describes this finite run only.

## Inspect evidence

The decision receipt includes the original engine response, citation, gate and
options. A **retrieved** page is an inspection result, not a supported answer.
**Refused** includes ambiguity and missing ownership; inspect `kind` for the
engine's reason. **Pruned** means a check failed. **Error** means the path failed
to execute or returned malformed data.

Open **Declared pages** to list and inspect the current console corpus/profile.
Choose that scope in the console before opening the inventory. **Refusal ledger**
filters saved receipts by status or searches claim text/receipt IDs. Click a row
to inspect its JSON. **Run kill tests** executes 66 developer-authored checks,
including the exact frozen 56 retrieval probes and a deliberately damped negative
control. A pruned negative-control receipt is expected when that check passes.
**Human evaluation** contains protocols and proposed targets, not completed
independent results.

## Storage and export

Receipts are serialized to `localStorage` under `advanced-mplpb-ledger-v1` on
this origin in this browser profile. Writes are queued within one page. The
hidden MPLPB engine uses IndexedDB and holds the `mplpb-browser-save-v1` Web
Lock. Use one MPLPB tab per origin/profile; the console does not implement a
shared multi-user ledger.

The record cap is 2,000; browser quota may stop writes earlier. Composition
usually adds two receipts, so it can reach capacity between its stages. Storage
failures and startup failures cannot always be recorded. SHA-256 chaining checks
stored bytes on reload. It does not authenticate authorship, source truth or
tamper resistance against a script that can rewrite the whole chain.

Use **Export session / Export JSON** before clearing data or reaching quota.
The downloaded JSON includes `schema:1`, project, export time,
`independence_verified:false`, `chainIntact`, engine pins and complete receipts.
It does not include a backup of the MPLPB engine's IndexedDB, all corpus files,
or calculator notebooks. The page-local API export returns data with `chainValid`
instead of downloading a file; see the [API guide](AGENT_API.md).

There is no console import, merge, delete or reset control. Exporting does not
free capacity. To start a new ledger, first verify an export, close other MPLPB
tabs, then deliberately remove only `advanced-mplpb-ledger-v1` using browser
storage tools and reload. Removing it permanently discards this browser's active
ledger. Clearing all site data can also erase unrelated saves from other projects
on the same GitHub Pages origin. Another browser/profile, hostname, protocol or
port has separate storage. Private browsing and clearing browser data can erase it.

## Troubleshooting

- Serve the app over HTTPS or localhost. Opening `web/index.html` as `file://`
  cannot load the split runtime. Use `python -m http.server 8000 --directory web`.
- If startup stops, close other Advanced/Combined MPLPB tabs on this origin,
  enable browser storage and use a browser with Web Workers, WebAssembly,
  Web Locks and Web Crypto. Do not erase saves just to retry startup.
- If the chain reports an integrity failure, writes stop. Export retained records
  for inspection; `ready().ok` is engine readiness and does not certify the chain.
- At capacity or quota failure, export before changing storage. The app does not
  automatically discard old receipts or retry with a replacement source.
