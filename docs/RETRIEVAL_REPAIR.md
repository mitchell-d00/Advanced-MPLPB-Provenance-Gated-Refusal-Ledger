# Retrieval repair: evidence and limits

## Outcome

The actual Python retrieval reader was repaired. Provenance-gated retrieval now
passes all 56 original cases, including exact expected owner IDs, with the
original corpus bytes and probe bytes unchanged. This result was reproduced
through the public JavaScript facade and orchestrator with the real Python
bridge, and again using the packaged Python engine in actual Pyodide/WebAssembly.

This is source-page selection, not proof that all 56 questions can receive a
supported factual answer. The strict-answer path still refuses the 32 historical
questions expecting page returns. It is intentionally not replaced by retrieval.

## Reconstructing the original benchmark

The benchmark was reconstructed from the original distributed v0.1 release ZIP,
SHA-256 `c8da45b90d24314c578c314153713dd448db4808ca12036ed3b6626665db436b`.
It contained the original probes, expected IDs, profiles, studio corpus, historical
results, prior reader implementations, and the current upstream reader.

The GitHub history for `killtest/probes.json` identifies its original upload at
commit `2af5a58711783ecffc95acb4b6113832c40d2780`. The file fetched at that commit
is byte-identical to the packaged original. No historical case was invented,
relabelled, removed, or replaced. No original material required to run the 56
cases is missing. `reconstruction.json` records the exact provenance.

The archived `killtest/results.txt` reports 50/56 for its scoped retrieval arm.
The previous Advanced MPLPB console instead called `MPLPB.relay`'s strict
supported-answer mode. That reproduces 20/56 and explains the largest discrepancy:
32 expected page returns were outside the finite statement-answer grammar, while
four ambiguity/refusal outcomes differed. It was an integration-contract error,
not a 20/56 score achieved by the original upstream retrieval reader.

## Diagnosis of actual retrieval failures

The unmodified retrieval reader scores 50/56. No indexing loss, wrong-page return
or provenance-pin mismatch caused those six misses. Expected target pages are
intact, current and eligible. The failures are deterministic query matching and
ownership-boundary failures:

| Case | Expected | Before | Root cause | Repair |
| --- | --- | --- | --- | --- |
| `op02` | `STUDIO-0006` | Refusal | The wrapper “what does it mean if” leaves `mean` as a required prose term although the conditional clause appears on the cones page. | Strip only that discourse wrapper for ownership lookup; retain the complete clause. |
| `om03` | `STUDIO-0007` | Refusal | “sagging coils” is a complete declared situation but descriptive location/modifier words dilute the scope majority. | Match complete multi-term `when-to-use` clauses only after original matching fails. |
| `om04` | `STUDIO-0014` | Refusal | “recycling trimmings” is declared; yesterday/session context prevents a strict majority. | Same complete-source-clause rule, without inventing temporal advice. |
| `om08` | `STUDIO-0016` | Refusal | “covering with plastic” is declared; teapot/weekend terms are not a scope majority. | Retrieve the declaring page only; do not claim it answers the specific time/entity question. |
| `ot04` | Refusal | Ambiguous | Generic firing/kiln pages claim overlap while none of the proposed owners covers the explicitly excluded glass subject. | Refuse an unowned excluded subject; do not globally ban a genuine glass owner. |
| `ot07` | Refusal | Ambiguous | Generic cone/firing pages claim overlap while none covers the explicitly excluded porcelain subject. | Same conservative unowned-exclusion guard. |

Intended ambiguity remains a stop; legitimate out-of-corpus and profile-withheld
cases remain refusals. The new retrieval path also explicitly rejects a selected
owner if the stronger provenance gate rejects its identity, seal, explicit origin,
lineage, dependency status or delivery profile. No substitute is searched for.

The situation-clause extension changes the ownership matcher, not the benchmark
or corpus. It requires at least two content terms from one complete source-authored
clause, never joins partial clauses from different pages, and preserves all
matching owners. It makes a topic-page inspection possible despite contextual
words; it does not establish entailment for those words. This distinction is
why it is kept outside the supported-answer/composition authority.

## Before and after

| Set | Previous strict console | Legacy page retrieval | Repaired gated page retrieval | New regressions |
| --- | ---: | ---: | ---: | ---: |
| Original `probes.json` | 20/56 | 50/56 | 56/56 | 0 |
| `probes_heldout.json` | 11/30 | 22/30 | 22/30 | 0 |
| `probes_adjacent.json` | 10/20 | 15/20 | 16/20 | 0 |

All six original retrieval misses improve. Adjacent case `a07` also improves:
a cone-6 recipe request now refuses a schedule page that does not own recipes.
The original strict-answer path improves from 20/56 to 22/56 solely through two
more accurate refusal outcomes (`ot04`, `ot07`). All 32 expected page-return
questions still refuse as semantic answers. This is a remaining capability limit,
not a source-support gate weakened to force a score.

The 56 development probes were inspected to design the patch. The other frozen
sets are historical developer-authored artifacts, not newly independent or
untouched holdouts. There was no tuning to remove their remaining failures.

## Remaining mismatches outside the original 56

- The 30-case set still misses `h01`, `h10`, `h11`, `h14`, `h15`, `h16`, `h21`,
  and `h29`. `h01`/`h10` stop as ambiguous; five cases refuse despite expected
  retrieval; `h29` retrieves a drying page for a handle-pulling question.
- The adjacent 20 still misses `a03`, `a04`, `a10`, and `a12`. Two stop as
  ambiguous; `a04` and `a10` retrieve topical pages for unsupported questions.
- These three wrong page retrievals existed before the patch. They are visibly
  labelled page inspections with `answer_supported:false`. Strict factual
  answers and composition cannot be unlocked by them. They still matter as
  retrieval limitations and must not be described as successes.

## Test evidence

- The same 655 upstream MPLPB Python unittests passed before and after the patch,
  without changing their assertions. Both logs are included.
- All eight non-browser Mitchell Tech Node suites passed, including its API,
  application, full-spectrum, unique-benchmark, CAS, worker and tutor checks.
- The original MPLPB JavaScript API regression suite passed.
- All 18 Pendulums Node tests passed, including conservation, damping, patterns
  and studio checks. The original engine file is unchanged.
- All six original composition guards passed, unchanged.
- All 18 new adversarial Python tests passed: multiple owners, absent support,
  changed seals, duplicate IDs, missing origins, stale dependencies, depth policy,
  excluded subjects, quantity/polarity preservation, malformed arguments,
  attempted network authority, escaping symlinks, and pointer boundaries.
- The new Node integration executes the actual MPLPB public facade and Python
  bridge, the actual calculator source, the original physics engine, and the
  actual orchestration code. It checks 56/56 retrieval, strict support/refusal,
  initial E/Jz agreement, damped negative control, forged/missing evidence,
  network-option rejection and receipt-chain integrity. Only the DOM is stubbed.
- The packaged-source WebAssembly test passes 56/56 through actual Pyodide and
  the original public facade, with original runtime/source hashes verified.
- The original upstream WebAssembly smoke was also run; see its complete log.

Browser-only calculator and Pendulums tests were attempted. The Python Playwright
module and required Chromium executable were absent; the Node browser launch also
failed in the release test environment. Browser rendering, IndexedDB, Web Locks and CORS are
therefore **unverified**, rather than counted as passing. Independent human
retrieval and conversation evaluation remains pending.

## Artifacts and reproduction

`evaluation/retrieval-repair` contains:

- `original-probes.json`: exact benchmark fetched at the original upstream commit.
- `reconstruction.json`: archive/commit/hash identity and corpus invariance.
- `before-full.json` and `after-full.json`: all 106 cases with raw decisions.
- `historical-56.csv`: a readable row for each unchanged original probe.
- `case-changes.json`: improved, regressed and remaining cases per frozen set.
- `upstream-before.log`, `upstream-after.log`, `node-suites.json` and per-suite logs.
- `adversarial.log`, `composition.log`, `integration.log`, `wasm-results.json`,
  `wasm.log`, `upstream-wasm.log`, and `browser-availability.json`.

Run `python scripts/test.py --full`, then
`python scripts/evaluate_retrieval.py --output evaluation/current-retrieval.json`.
For a historical before replay, run that evaluator in a new process with
`--engine-root /path/to/unmodified/MPLPB` at base commit
`8c8de379b906f0be246ee692de1b4140b19684dd`. The evaluator fails if frozen probe
hashes differ. The reviewable source diff is `patches/retrieval-repair.patch`.

No source claims are authenticated by this work. No model, new external corpus,
permission inference, calculator shortcut or replacement integrator was added.
