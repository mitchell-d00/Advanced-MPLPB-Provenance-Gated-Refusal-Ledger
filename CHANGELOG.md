# Changelog

## 0.3.0 — Project API hub — 2026-10-29

- Add a JavaScript project hub for the three pinned engines: project links, JSON
  playground, bounded smoke checks, on-demand deployment-asset hashes and
  evidence-required release checklists with report export.
- Preserve source-support gates and the original console/ledger. Upstream engine
  pins, corpus bytes and historical benchmark artifacts remain unchanged.
- Add candidate and live Chromium automation with explicit browser installation.
- Refresh operational documentation and distinguish current checks, historical
  evidence, manual reports and deployment verification.


## Retrieval repair upstreamed — 2026-10-27

- The retrieval repair was merged into Combined MPLPB as pull request #18
  (commit `d2f92a8`), after its full suite (674 tests), WebAssembly build and
  live-site Chromium checks passed there.
- Re-pinned Combined MPLPB from `8c8de37` plus local patches to `d2f92a8`
  unchanged. `upstream/MPLPB/` now matches that commit exactly, except the
  archive listed in `UPSTREAM_OMISSIONS.json`. The two language zips that
  upstream rebuilds from byte parts and ignores are no longer committed.
- Removed `patches/retrieval-repair.patch` and `tests/retrieval_repair_test.py`.
  `scripts/test.py` now runs upstream's `tests/test_page_retrieval.py`.
- Rebuilt `web/`. The engine bundles and MPLPB page are byte-identical. Only
  `.well-known/mplpb.json` changed, gaining the `page_retrieval` method.
- `src/pins.json` records the new commit with `local_modifications: false`.
- Verified: `test.py --full` (including 674 upstream Python tests), packaged
  WebAssembly 56/56, and the site in Chromium.

## Repository and website — 2026-10-27

No engine, corpus, benchmark or test changes.

- Published the 0.2.0 release to GitHub and restored the 15 large files that were
  missing from the first import (the MPLPB runtime bundles, the calculator page and
  the upstream calculator test data). CI is green and every file matches its release hash.
- Added the GitHub Pages site: the root `index.html` forwards to the app in `web/`,
  and `.nojekyll` makes Pages serve dot-folders such as `.well-known/` unchanged.
- Rewrote the README for the published repository: live site link, pinned upstream
  commits and what changed in each, why this is a separate project, and the
  current test and website setup. Removed the manual-upload instructions.
- Corrected the Mitchell Tech console card from “Verified symbolic & numeric
  paths” to “Verified numeric path”. The console only calls `calculate`.
  Regenerated `ASSET_SHA256.json` and `RELEASE_SHA256.json`.
- Reworded session-specific phrasing in `docs/RETRIEVAL_REPAIR.md`.

## 0.2.0 — 2026-10-27

### Retrieval implementation

- Reconstructed the exact historical 56-case benchmark from the original release
  and the original upstream commit; verified its unchanged frozen SHA-256.
- Corrected the 0.1 integration that evaluated page retrieval using the strict
  statement-answer API. Both contracts remain separately available.
- Patched the Python ownership reader to unwrap one discourse form, recognize
  complete multi-term source-authored situation clauses, and reject unowned
  explicitly excluded subjects hidden by generic-topic matches.
- Added a provenance-gated one-owner retrieval implementation and desktop/browser
  `/api/retrieve` transport. It never follows pointers or selects another owner
  after provenance rejection.
- Added `window.MPLPB.retrieve` and `window.AdvancedMPLPB.retrieve`.

### Verification boundaries

- Retrieved page text is explicitly marked `answer_supported:false` and receives
  its own UI mode/status. It cannot satisfy the supported-answer composition gate.
- Supported-answer orchestration now checks selected identity, source hashes,
  structural verification flags and body evidence. Missing, malformed or
  mismatched source evidence prunes the result.
- Calculator reference checks, numeric parser rejection and Pendulums conservation
  tolerances remain intact. Original composition tests were not rewritten.
- Rebuilt the actual bundled Python/WebAssembly engine with the patched source.

### Results and packaging

- Historical retrieval: 50/56 legacy reader to 56/56 repaired gated retrieval.
  The prior console's 20/56 was a different, incompatible strict-answer contract.
- Additional frozen sets: 22/30 unchanged; adjacent set 15/20 to 16/20. No new
  retrieval regressions across the 106 recorded cases; 12 extra-set mismatches remain.
- All 655 existing upstream Python tests pass before and after. All non-browser
  calculator Node suites, MPLPB API suite, and 18 Pendulums Node tests pass.
- Six existing composition guards and 18 added adversarial tests pass. Real-engine
  facade/orchestration and actual packaged WebAssembly each pass the original 56.
- Browser-only checks were attempted but blocked by unavailable browser/runtime
  dependencies; no browser UI or independent human validation is claimed.
- Added complete raw evaluation files, per-case CSV, reviewable source patch,
  source pins, local run instructions, CI, and manually triggered Pages deployment.
- README describes all three upstream repos with their live GitHub Pages links.
  No repository was created or pushed for the user.
