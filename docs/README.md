# Documentation

These guides describe Advanced MPLPB 0.3.0 and its pinned engines. Upstream
repositories may have newer documentation without changing this composition.

| Guide | Purpose |
| --- | --- |
| [Project overview](../README.md) | Architecture, pins, results and quick start |
| [User guide](USER_GUIDE.md) | Console modes, evidence, storage, exports and troubleshooting |
| [Hub API](HUB_API.md) | Three-project playground, smoke checks, deployment probes and release checklist |
| [Agent API](AGENT_API.md) | Page-local methods, options, receipts and failures |
| [Development](DEVELOPMENT.md) | Source layout, rebuilds, asset manifests and deployment |
| [Testing](TESTING.md) | Reproducible checks, Chromium setup and measured scope |
| [Validation](VALIDATION.md) | Current evidence and remaining limits |
| [Retrieval repair](RETRIEVAL_REPAIR.md) | Historical 0.2.0 research evidence and remaining mismatches |
| [Documentation audit](DOCUMENTATION_AUDIT_2026-10-29.md) | Changes and verification for this documentation review |
| [Changelog](../CHANGELOG.md) | Dated changes; earlier entries describe their own release |
| [Third-party notices](../THIRD_PARTY_NOTICES.md) | Original licenses and exact engine versions |

The [contextual protocol](../web/protocols/contextual.md) and
[conversation protocol](../web/protocols/conversation.md) are copied from pinned
MPLPB. Their commands assume an MPLPB working directory, not this repository's
root. Use `upstream/MPLPB/` for those commands and its
[conversation report](../upstream/MPLPB/evaluation/conversation-repairs/results.json)
and [class table](../upstream/MPLPB/evaluation/conversation-repairs/README.md)
for the report links in the copied conversation protocol.

`upstream/` documentation describes the original projects at their pins; it is
preserved as snapshot evidence. Advanced MPLPB does not expose the full MPLPB
chat/collection editor, calculator tutor/CAS, or Pendulums art studio in its console.
