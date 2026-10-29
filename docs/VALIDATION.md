# Validation

The original 56 pass as provenance-gated page retrieval. This does not certify
semantic answers or independent human performance. Additional historical sets
retain 12 mismatches. The strict-answer contract remains separate. The full
historical evidence is in [RETRIEVAL_REPAIR.md](RETRIEVAL_REPAIR.md) and
`evaluation/retrieval-repair/`; its original browser-availability notes describe
that experiment, rather than all later checks.

## Current API hub review — 2026-10-29

Advanced MPLPB 0.3.0 adds a project API hub; hub facade version is 1.0.0. Engine
pins and the frozen benchmark are unchanged. Both jobs passed in [GitHub Actions run 40887912028](https://github.com/mitchell-d00/Advanced-MPLPB-Provenance-Gated-Refusal-Ledger/actions/runs/40887912028)
on candidate `d1c0768397fddf938b6362b6d5a606b981b8e0ff`:

- Non-browser composition, upstream retrieval, real-engine integration, eight
  calculator suites, MPLPB API and 18 Pendulums Node tests passed in CI.
- Chromium 145.0.7632.6 with Playwright 1.58.0 passed against candidate bytes and
  the current deployed console in isolated browser profiles. Each run passed all
  66 built-in kill tests, the five console modes, receipt/export/reload integrity,
  warmed-tab offline retrieval and corruption stop. Candidate testing also passed
  hub adapters/playground, method/input boundaries, deployment hash comparison,
  checklist/report/reload checks and 390/1366 hub layout. No page errors or
  cross-origin HTTP requests occurred in these default test operations.
- The uploaded `advanced-chromium-evidence` artifact contains candidate/live
  receipts, JSON results and screenshots. The exported sessions contained 80
  candidate and 75 deployed receipts; these are records, not unique test counts.

Local Python 3.12 execution separately passed all 674 upstream MPLPB test methods
in 596.760 seconds. Current orchestrator integration was rerun after hub changes
and passed 56/56 through the real Python bridge and public facade. Fresh frozen
replay reproduced 56/56, 22/30 and 16/20, with all original probe hashes intact.
All 35 asset-manifest entries verify; six source/shipped console files match,
and all 23 preexisting engine/protocol asset hashes are unchanged. All 39 local
links across 12 maintained documentation files resolve.

The live console was still 0.2.0 during this pre-merge run. Its success does not
mean the 0.3.0 candidate hub was deployed. Chromium tested the new hub using a
local HTTP server in CI. Local Chromium launch in the editing environment was
not required or claimed.

Separate HTTP fetches returned 200 for all three linked project entry assets.
Calculator `index.html` and Pendulums `physics.js` match the bundled snapshots.
Combined MPLPB's live standalone `index.html` differs from the hub's split-runtime
HTML, as expected from its hosting packaging. These HTTP observations do not
execute those projects' remote APIs.

The hub's **Check project** results cover bounded bundled smoke cases, not all
regressions. **Deployment check** fetches an entry asset and compares bytes,
without executing that remote API or certifying rendering. Release checklist
status is user-reported evidence and is not promoted into automatic validation.

See [TESTING.md](TESTING.md) for commands and exact Chromium scope. Independent
human evaluation remains pending. No Firefox/Safari, full persistence recovery,
offline reload or general cross-origin CORS certification is claimed.
