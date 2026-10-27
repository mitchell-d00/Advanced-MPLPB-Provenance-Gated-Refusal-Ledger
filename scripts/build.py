#!/usr/bin/env python3
"""Rebuild web/ from vendored source. Initial build downloads pinned Pyodide unless --core-archive is supplied."""
import argparse,json,re,shutil,subprocess,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--core-archive',type=Path)
a=p.parse_args();web=ROOT/'web';web.mkdir(exist_ok=True)
for f in (ROOT/'src').iterdir():
 if f.is_file():shutil.copy2(f,web/f.name)
calc=web/'vendor/calculator';calc.mkdir(parents=True,exist_ok=True)
for name in ('index.html','LICENSE','THIRD-PARTY-NOTICES.md'):shutil.copy2(ROOT/'upstream/MitchellTech'/name,calc/name)
for origin,target in [('Pendulums/physics.js','physics.js'),('Pendulums/LICENSE','PENDULUMS-LICENSE'),('MPLPB/LICENSE','MPLPB-LICENSE')]:shutil.copy2(ROOT/'upstream'/origin,web/'vendor'/target)
protocols=web/'protocols';protocols.mkdir(exist_ok=True)
for origin,target in [('evaluation/contextual/PROTOCOL.md','contextual.md'),('docs/CHAT_EVALUATION.md','conversation.md'),('killtest/probes.json','kill-probes.json')]:shutil.copy2(ROOT/'upstream/MPLPB'/origin,protocols/target)
output=web/'vendor/mplpb/index.html'
command=[sys.executable,str(ROOT/'upstream/MPLPB/tools/build_browser_runtime.py'),'--output',str(output)]
if a.core_archive:command.extend(['--core-archive',str(a.core_archive.resolve())])
subprocess.run(command,cwd=ROOT/'upstream/MPLPB',check=True)
html=output.read_text();m=re.search(r'<script id="mplpb-runtime-bundle" type="application/json">(.*?)</script>',html,re.S)
if not m:raise ValueError('Upstream bundle changed; stop rather than substitute an engine')
blob=m.group(1);names=[]
for start in range(0,len(blob),4_000_000):
 name=f'bundle-{start//4_000_000}.txt';(output.parent/name).write_text(blob[start:start+4_000_000]);names.append(name)
html=html[:m.start()]+html[m.end():]
html=html.replace('<script>\n','<script type="module">\n',1)
old="JSON.parse(document.getElementById('mplpb-runtime-bundle').textContent)"
new='JSON.parse((await Promise.all('+json.dumps(names)+'.map(async name=>{const r=await fetch(name);if(!r.ok)throw Error("Bundle load failed");return r.text();}))).join(""))'
if old not in html:raise ValueError('Upstream client changed')
output.write_text(html.replace(old,new))
print('Built web/. Serve with python -m http.server 8000 --directory web')
