# Documentation and API hub review — 2026-10-29

This review began as documentation maintenance and expanded, at the owner's
request, into a JavaScript project API hub for MPLPB, Mitchell Tech and Pendulums.
The console release is 0.3.0; the hub facade is 1.0.0. Upstream pins, engines,
corpora and frozen historical evidence remain unchanged.

## Changes

- Add project cards with live/repository/CI links, a fixed-method JSON API
  playground, individual/all-project smoke checks and on-demand deployment-asset
  probes for HTTPS or local development servers.
- Add evidence-required per-project release checklists and a separate hub report
  export. Distinguish user reports, automated observations and hash differences.
- Retain the provenance-gated console and hash-linked refusal ledger. Retrieval
  still cannot authorize supported-answer composition.
- Refresh README, API/validation guidance and documentation index. Add user,
  development, testing and hub API guides; explain snapshot pins, single-writer
  locks, export/import limits, quota, offline behavior and deployment layouts.
- Add candidate/deployed Chromium CI with explicit browser installation,
  receipts, screenshots, reload and corruption checks.
- Preserve historical reports and release manifests as snapshots. Explain copied
  protocol working-directory/link context instead of modifying upstream sources.

## Verification

Current execution results and limitations are maintained in
[VALIDATION.md](VALIDATION.md). Initial live HTTP comparison confirmed the root
redirect, console HTML, `app.js` and `core.js` matched the baseline checkout.
This comparison alone did not exercise a browser or establish a new deployment.
