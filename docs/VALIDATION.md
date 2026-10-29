# Validation

The original 56 pass as provenance-gated page retrieval. This does not certify
semantic answers or independent human performance. Additional historical sets
retain 12 mismatches. The strict-answer contract remains separate. The full
historical evidence is in [RETRIEVAL_REPAIR.md](RETRIEVAL_REPAIR.md) and
`evaluation/retrieval-repair/`; its original browser-availability notes describe
that experiment, rather than all later checks.

## Current API hub review — 2026-10-29

Advanced MPLPB 0.3.0 adds a project API hub; hub facade version is 1.0.0. Engine
pins and the frozen benchmark are unchanged. This review adds automated Chromium
checks of candidate and deployed consoles. Execution is in progress; no new
browser pass is claimed until its workflow succeeds. The deployed version may
still be 0.2.0 during pre-merge testing, and its successful test does not mean
the candidate hub is already deployed.

`test.py` non-browser checks have passed during this review; the full 674-method
Python run and fresh historical evaluator are running. `verify_assets.py`
currently verifies all 35 listed source/shipped files. Current docs and results
will be updated after those checks complete.

The hub's **Check project** results cover bounded bundled smoke cases, not all
regressions. **Deployment check** fetches an entry asset and compares bytes,
without executing that remote API or certifying rendering. Release checklist
status is user-reported evidence and is not promoted into automatic validation.

See [TESTING.md](TESTING.md) for commands and exact Chromium scope. Independent
human evaluation remains pending. No Firefox/Safari, full persistence recovery,
offline reload or general cross-origin CORS certification is claimed.
