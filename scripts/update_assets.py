#!/usr/bin/env python3
"""Explicitly record a new manifest after an intentional source/build change."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
manifest={p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for folder in ['web','src'] for p in sorted((ROOT/folder).rglob('*')) if p.is_file()}
(ROOT/'ASSET_SHA256.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Recorded {len(manifest)} asset hashes.')
