# Development and deployment

The console is plain HTML/CSS/JavaScript. Python 3.10+ and Node 18+ run its
non-browser tooling; CI uses Python 3.13 and Node 22. Chromium setup is separate
and described in [TESTING.md](TESTING.md). The served app has no npm installation
step or runtime package dependency.

## Source and engine boundaries

Edit `src/hub.js` for project adapters, deployment checks and checklist UI.
Edit `src/app.js`, `src/core.js`, `src/index.html` and `src/style.css` for console
changes. `src/pins.json` declares engine versions. `scripts/build.py` copies them
to `web/`, copies the unchanged calculator/physics assets and protocols, invokes
MPLPB's standalone builder, and splits its runtime JSON into ten local text
assets. It changes hosting packaging, not the Python engine rules.

`upstream/` contains snapshots, not Git submodules and not live upstream branches.
Keep the exact pins, omission declaration, licenses and benchmark bytes intact
during documentation maintenance. Upgrading a pin is a separate engine update:
review upstream changes, rebuild, rerun gates and remeasure results.

```sh
python scripts/build.py
# Or use the verified pinned core archive without a download:
python scripts/build.py --core-archive /path/to/pyodide-core-314.0.7.tar.bz2
python scripts/update_assets.py
python scripts/verify_assets.py
```

Review source and build diffs before recording new hashes. `update_assets.py`
approves the bytes it sees; it is not a test. `verify_assets.py` verifies the 35
entries in `ASSET_SHA256.json`, not upstream history or the deployed site. Pure
repository documentation edits do not require rebuilding the app or this manifest.

## Tests and generated files

Run the [documented checks](TESTING.md). Calculator suites rewrite these tracked
reports under `upstream/MitchellTech/tests/`: `full-spectrum-results.json`,
`mr-e-results.json` and `unique-benchmarks-results.json`. Inspect their differences
before restoring only these generated files if they are incidental to your work.
Do not discard intentional test changes. Keep logs, screenshots and new evaluation
outputs outside the repository or in a designated ignored location unless they
are intentionally reviewed evidence.

## Release packaging

`RELEASE_SHA256.json` describes a packaged repository snapshot. It is not checked
by the asset verifier and is not automatically refreshed after commits. Historical
release hashes and benchmark artifacts keep their original meaning.

For an intentional new ZIP, start from a reviewed clean checkout and run:

```sh
python scripts/package_release.py --output /path/outside/repo/Advanced-MPLPB.zip
```

This rewrites `RELEASE_SHA256.json` and verifies the new ZIP's entries. The
packager walks the working tree, rather than tracked files only. Remove or review
untracked artifacts first: it excludes some local state but is not a general
secret/generated-file filter. Use an output path outside the checkout so old
archives cannot enter the new package.

## Hosting

The current root-hosted GitHub Pages layout uses **main / (root)**. Root
`index.html` redirects to `web/` and preserves query/hash in its JavaScript
redirect. `.nojekyll` preserves dot-folders and the committed assets are served
without rebuilding. The regression workflow does not deploy.

The manually triggered **Publish GitHub Pages manually** workflow is an
alternative deployment mode requiring Pages **Source: GitHub Actions**. It
uploads `web/` directly as the root; the console URL is then `/#console`, rather
than `/web/#console`. If switching layout or hostname, update documented links
and the live Chromium target in `.github/workflows/tests.yml`. Keep all runtime
assets on the same origin, and provide correct HTML/JS/CSS/text MIME types.

The live-site check validates the currently deployed build. Before merge it
does not prove that a PR's changes are deployed; the separate local Chromium
check tests candidate bytes.
