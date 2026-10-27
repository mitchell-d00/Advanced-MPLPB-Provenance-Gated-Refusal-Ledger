# Advanced MPLPB — provenance-gated refusal ledger

**Version 0.2.0 · retrieval repair**

Advanced MPLPB composes three existing Mitchell projects in one browser-local
console. It retrieves declared pages with provenance, offers a separate strict
supported-answer path, runs numeric calculations through Mitchell Tech, and
checks finite conservation claims against the original Pendulums integrator.
Decisions and failures are retained in an exportable, hash-linked local ledger.

## The three upstream projects

| Project | Role in Advanced MPLPB | Repository | Live GitHub Pages site |
| --- | --- | --- | --- |
| Combined MPLPB | Closed-corpus ownership, sealed pages, provenance, profiles and explicit refusals. Advanced MPLPB includes local retrieval repairs to its pinned Python engine. | [Combined MPLPB repository](https://github.com/mitchell-d00/Combined-MPLPB-A-closed-local-ledger-of-pages-that-answers-only-from-those-pages) | [Open Combined MPLPB](https://mitchell-d00.github.io/Combined-MPLPB-A-closed-local-ledger-of-pages-that-answers-only-from-those-pages/) |
| Mitchell Tech | Scientific/graphing calculator and agent-callable `window.MitchellTech`. This release uses its numeric `calculate` path; its bundled symbolic/CAS capabilities remain upstream features. | [Mitchell Tech repository](https://github.com/mitchell-d00/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-) | [Open Mitchell Tech](https://mitchell-d00.github.io/Mitchell-Tech-V120.2-A-self-teaching-scientific-and-graphing-calculator-/) |
| Pendulums | Original spherical-pendulum RK4 engine, projected constraints, measured energy and vertical angular momentum Jz. | [Pendulums repository](https://github.com/mitchell-d00/Pendulums) | [Open Pendulums](https://mitchell-d00.github.io/Pendulums/) |

All three live links returned HTTP 200 on 2026-10-27. That verifies availability,
not their current UI behavior or that upstream has adopted these local repairs.
Advanced MPLPB uses the bundled same-origin engines; it does not call those
remote sites to execute queries or calculations. Browser API objects are
page-local JavaScript interfaces, not remotely callable HTTP services.

## What was actually fixed

The previous package scored 20/56 because its new console sent the historical
**page-retrieval** benchmark through MPLPB's narrower **supported-answer** API.
That was an integration error. Replaying the unmodified legacy retrieval reader
on exactly the same questions reproduces 50/56, also recorded upstream.

This release repairs the retrieval implementation as well as the integration:

1. A discourse wrapper such as “what does it mean if …” no longer adds the
   irrelevant word “mean” to the contained page-lookup clause. Quantities,
   polarity, subjects and other modifiers remain intact.
2. If majority-scope and full-prose matching find no owner, a complete
   multi-term semicolon-delimited `when-to-use` situation may select its declaring
   page. All matching owners are retained. No ranking, synonym generator,
   external source, probe-ID lookup or answer synthesis is used.
3. Generic-topic matches refuse when their proposed owners omit a requested
   term explicitly excluded by eligible pages. This is not a global exclusion:
   a real owner containing that term can still claim it.
4. The new `MPLPB.retrieve` API checks the selected page against the existing
   provenance gate. Rejection stops; it does not choose a replacement owner.
5. The console distinguishes **Retrieve page** from **Supported answer**.
   A retrieved page is marked `answer_supported:false` and cannot unlock the
   composition path. Supported answers additionally require intact source
   identity and quoted body evidence at the outer orchestration gate.

The corpus, all 56 questions, expected owner IDs, frozen hashes and existing test
assertions were not changed to obtain the result.

## Measured results

| Frozen set | Previous console on strict-answer path | Original retrieval reader | Repaired provenance-gated retrieval |
| --- | ---: | ---: | ---: |
| Historical 56 | 20/56 | 50/56 | **56/56** |
| Additional historical 30 | 11/30 | 22/30 | **22/30** |
| Adjacent historical 20 | 10/20 | 15/20 | **16/20** |

The six repaired cases are `op02`, `om03`, `om04`, `om08`, `ot04`, and `ot07`.
No previously correct retrieval case regressed across these 106 frozen probes.
The additional sets still contain 12 mismatches, including three wrong page
retrievals. They are listed individually in the report; they are not supported
answers or hidden successes. The development set was used to design this repair,
so 56/56 is a regression result, not independent generalization evidence.

The strict-answer path scores 22/56 after the repair because two ambiguity/refusal
outcomes improve. It still declines all 32 historical questions expecting a page
return. **56/56 does not mean 56 supported semantic answers.**

The exact benchmark was recovered from the distributed ZIP and verified against
upstream commit `2af5a58711783ecffc95acb4b6113832c40d2780`:

```text
fd0f8b1d61a206dcbb612fdc7503ab339a09ec02aebf576b27554c1fb4cb9076
```

Read [the full repair report](docs/RETRIEVAL_REPAIR.md),
[the changelog](CHANGELOG.md), and the raw files under
[evaluation/retrieval-repair](evaluation/retrieval-repair/).

## Run locally

Requires Python 3 for the local server and a current browser with WebAssembly,
IndexedDB, Web Locks and local storage. No API key, npm install, CDN or build step
is needed to run the included application.

```sh
python -m http.server 8000 --directory web
```

Open http://localhost:8000. Use HTTPS for remote hosting. Opening `index.html`
directly as a file does not support the split runtime's local fetches.

## Test and rebuild

Tests require Python 3.10+ and Node.js 18+; Node 22 is used by CI.

```sh
python scripts/test.py
python scripts/test.py --full
python scripts/evaluate_retrieval.py --output evaluation/current-retrieval.json
python scripts/verify_assets.py
```

`--full` includes all upstream MPLPB Python unittests and takes several minutes.
Browser-only upstream suites require separately installed Playwright and Chromium;
the included browser-availability report records the execution blockers here.
The Node integration test executes the real Python bridge, calculator code and
physics engine with DOM stubs. It does not test rendering or persistence APIs.

```sh
python scripts/build.py
```

The first rebuild downloads the upstream hash-pinned Pyodide archive. For an
offline rebuild, pass `--core-archive /path/to/pyodide-core-314.0.7.tar.bz2`.
Build-time network access is separate from app execution. The generated bundle
contains actual patched Python files with a verified source manifest.
After an intentional rebuild or edit, regenerate `ASSET_SHA256.json` using
`python scripts/update_assets.py` before verifying the new release.

To exercise the packaged engine in actual WebAssembly, extract that same verified
Pyodide archive and run:

```sh
node scripts/test_wasm.mjs /path/to/pyodide evaluation/current-wasm.json
```

## Create your GitHub repository by hand

Create an empty repository on GitHub, extract this ZIP, and upload the contents
of its `Advanced-MPLPB` folder. Preserve all subdirectories and hidden workflow
files. The archive has no `.git` history, private hosting identity, credentials,
saved user sessions or installed packages. One bulky archived upstream live-HTTP
replay tar is omitted; `UPSTREAM_OMISSIONS.json` records its exact hash and source
URL. All code, required corpora/runtime assets, original 56 probes, and repair
evaluation results are included.

If using Git locally after creating the empty repository:

```sh
git init
git add .
git commit -m "Add Advanced MPLPB retrieval repair"
git branch -M main
git remote add origin YOUR_REPOSITORY_GIT_URL
git push -u origin main
```

The included CI runs tests on pushes and pull requests. It does not push source
or publish a website for you. To host this new repo with GitHub Pages, choose
**Settings → Pages → Source: GitHub Actions**, then manually run the
**Publish GitHub Pages manually** workflow. It publishes `web/` as the site root;
it does not rebuild or download the runtime. No new Advanced MPLPB live URL is
claimed until you publish it.

## Repository layout

- `src/`: editable console and orchestration.
- `web/`: complete ready-to-serve application and embedded engines.
- `upstream/`: upstream source snapshots; MPLPB has explicitly recorded local patches.
- `tests/`: original composition guards, added adversarial tests and real-engine integration.
- `scripts/`: build, regression, benchmark and asset-verification commands.
- `evaluation/retrieval-repair/`: original benchmark, complete before/after outputs, case-level changes and test logs.
- `docs/`: repair report, validation limits and API reference.
- `patches/`: reviewable source patch against the original distributed ZIP.
- `.github/workflows/`: test CI and manually triggered GitHub Pages deployment.

## Boundaries and remaining work

One owner retrieves; two owners stop; no owner refuses. Retrieval does not prove
semantic support, source truth or authenticated authorship. Composition still
requires a supported source answer before calculator/physics work. The bundled
D&D example exercises control flow and independent numerical checks; it is not
a scientific relationship between a game definition and pendulum dynamics.

The ledger is browser-local and exportable, not a public multi-user service or
an externally authenticated log. A same-origin script can rewrite local storage;
hash chains demonstrate byte consistency, not who created the content. Export
significant runs. Browser quota and the 2,000-record application cap limit storage.

Independent human conversation/retrieval evaluation remains pending. The upstream
protocols are included verbatim under `web/protocols/`. Browser UI, CORS,
IndexedDB and Web Locks must be tested separately from Node/Python/WASM evidence.

## License and provenance

Original orchestration files use the included MIT license. Upstream software,
source corpora, embedded Python/Pyodide and other resources retain their original
licenses; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The MPLPB base commit
is not represented as unmodified: `src/pins.json` records the local source hashes.
