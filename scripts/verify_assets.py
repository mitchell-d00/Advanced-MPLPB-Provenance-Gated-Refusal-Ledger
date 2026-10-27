#!/usr/bin/env python3
"""Verify packaged application assets against the release manifest."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'ASSET_SHA256.json').read_text());failed=[]
for relative,expected in m.items():
 p=ROOT/relative
 if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest()!=expected:failed.append(relative)
if failed:raise SystemExit('Asset verification failed: '+', '.join(failed))
print(f'{len(m)} packaged assets verified.')
