# Testing and evidence

Run commands from this repository's root unless noted. Python 3.10+ and Node
18+ are sufficient for non-browser suites; CI uses Python 3.13 and Node 22.

```sh
python scripts/test.py
python scripts/test.py --full
python scripts/verify_assets.py
python scripts/evaluate_retrieval.py --output /tmp/advanced-retrieval.json
```

`test.py` runs six composition tests, 19 upstream retrieval test methods (18
adversarial methods plus a frozen-score check), real-engine Node integration,
eight non-browser calculator suites, MPLPB's public API suite and 18 Pendulums
Node tests. `--full` additionally runs all 674 upstream MPLPB Python test methods.
Counts within a suite may be overlapping assertions, not unique test cases.
The integration harness uses the actual Python bridge, calculator, physics and
orchestrator, with DOM/storage stubs. It is not browser evidence.

The evaluator verifies frozen probe hashes and reports 56/56, 22/30 and 16/20
provenance-gated retrieval outcomes for the three historical sets. The latter
two still have 12 mismatches. These are page-selection scores, not semantic
answer accuracy. See [RETRIEVAL_REPAIR.md](RETRIEVAL_REPAIR.md).

## Chromium

GitHub Actions' **Composition regression checks** has separate non-browser and
Chromium jobs. The browser job installs Playwright 1.58.0 and its matching
Chromium with Linux dependencies before launching tests. Browser installation
is a test dependency, not a change to the application's runtime.

Equivalent local setup, outside the checkout:

```sh
npm install --prefix /tmp/advanced-browser-tools --no-save --package-lock=false playwright@1.58.0
export CODEX_PRIMARY_RUNTIME_NODE_MODULES=/tmp/advanced-browser-tools/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/tmp/advanced-browser-binaries
node "$CODEX_PRIMARY_RUNTIME_NODE_MODULES/playwright/cli.js" install --with-deps chromium
ADVANCED_REQUIRE_HUB=1 node tests/browser.cjs
```

The test starts/stops an ephemeral local HTTP server and uses a fresh browser
profile. Optional environment variables:

| Variable | Meaning |
| --- | --- |
| `ADVANCED_BASE_URL` | Existing served app directory, trailing slash; skips local server |
| `ADVANCED_BROWSER_OUTPUT` | Directory for JSON exports, results and screenshots; default is outside checkout |
| `ADVANCED_REQUIRE_HUB=1` | Require the new hub interface; CI enables this for candidate bytes |
| `CODEX_PRIMARY_RUNTIME_NODE_MODULES` | Parent directory containing the Playwright package; omit for normal module resolution |
| `PLAYWRIGHT_BROWSERS_PATH` | Browser install directory; use the same value for install and test |

CI tests the candidate app locally and the current deployed `/web/` console
separately. A pre-merge live run observes the deployed version, which may not yet
contain the hub. It exercises hub checks too whenever that global is present.
Candidate testing always requires it. The artifact **advanced-chromium-evidence**
retains JSON, receipts and desktop/mobile screenshots.

The browser suite covers real bundled Python/WebAssembly startup, calculator
startup, five console modes, exact retrieval owner/unsupported flag, supported
composition and unsupported stop, page inspection, all 66 built-in kill tests,
receipt inspection/filter/download/hash chain, ledger reload, IndexedDB
initialization, warmed-tab offline retrieval, 390/1366 console layout, and writes
stopping after deliberate ledger corruption. It rejects page errors and
cross-origin HTTP requests during these default local operations.

For hub-enabled builds it also checks three project adapters, JSON playground,
unknown method/invalid arguments/network-option rejection, a same-origin
deployment asset/hash comparison, evidence-required checklist persistence,
hub report download and 390/1366 hub layout. Local-server CORS failures and all
three upstream sites' remote APIs are not covered by that asset comparison.
The test does not certify Firefox/Safari, full IndexedDB recovery, offline
reload, arbitrary cross-origin CORS or independent human performance.

If the Chromium executable is missing, run the browser installation command
with the same package version and browser-path variable. If this environment
cannot launch Chromium, use the hosted CI result and report the local limit;
do not count a stubbed DOM or a downloaded binary as a browser pass.

## Historical and packaging evidence

`evaluation/retrieval-repair/` and the repair report describe the original
0.2.0 experiments. Do not overwrite those logs to make them look current.
`node scripts/test_wasm.mjs /path/to/verified/pyodide /tmp/wasm-results.json`
checks the actual packaged engine in Node with verified runtime/source hashes;
it separately states that it does not test browser UI or persistence.

Review calculator-generated JSON differences after tests. The asset manifest
checks listed `web/`/`src/` bytes only. `RELEASE_SHA256.json` is the historical
packaged-release snapshot, not an assertion that later documentation and hub
files match the old release. Current run status belongs in
[VALIDATION.md](VALIDATION.md).
