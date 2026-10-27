#!/usr/bin/env python3
"""Run non-browser suites. --full includes all 674 upstream MPLPB Python tests.
Browser UI tests require separate Playwright/Chromium setup; see README.
"""
from pathlib import Path
import argparse,subprocess,sys
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--full',action='store_true');a=p.parse_args()
commands=[(ROOT,['node','--test','tests/composition.cjs']),(ROOT/'upstream/MPLPB',[sys.executable,'-m','unittest','tests.test_page_retrieval','-v']),(ROOT,['node','tests/integration.cjs'])]
commands += [(ROOT/'upstream/MitchellTech',['node','tests/'+f.name]) for f in sorted((ROOT/'upstream/MitchellTech/tests').glob('*.cjs')) if 'browser' not in f.name]
commands += [(ROOT/'upstream/MPLPB',['node','tests/javascript-api.cjs']),(ROOT/'upstream/Pendulums',['node','--test',*['tests/'+f.name for f in sorted((ROOT/'upstream/Pendulums/tests').glob('*.cjs'))]])]
if a.full:commands.append((ROOT/'upstream/MPLPB',[sys.executable,'-m','unittest','discover','-s','tests','-q']))
for cwd,args in commands:
 print('\nRunning '+' '.join(args)+' in '+str(cwd.relative_to(ROOT)),flush=True)
 subprocess.run(args,cwd=cwd,check=True)
