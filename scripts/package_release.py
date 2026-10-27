#!/usr/bin/env python3
"""Create a clean repository ZIP; exclude Git metadata and local test/save state."""
import argparse,hashlib,json,re,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path,required=True);a=p.parse_args();output=a.output.resolve()
def eligible(path):
 relative=path.relative_to(ROOT)
 if not path.is_file() or path.resolve()==output:return False
 if len(relative.parts)>2 and relative.parts[:2]==('upstream','MPLPB') and re.fullmatch(r'tmp[a-z0-9_]{8}',relative.parts[2]):return False
 if any(part in {'.git','__pycache__','node_modules','local','.openai'} for part in relative.parts):return False
 if any(part.startswith(('mplpb-eval-','mplpb-context-eval-')) for part in relative.parts):return False
 return path.suffix!='.pyc' and relative.as_posix()!='RELEASE_SHA256.json'
files=[f for f in sorted(ROOT.rglob('*')) if eligible(f)]
manifest={f.relative_to(ROOT).as_posix():hashlib.sha256(f.read_bytes()).hexdigest() for f in files}
(ROOT/'RELEASE_SHA256.json').write_text(json.dumps(manifest,indent=2)+'\n');files.append(ROOT/'RELEASE_SHA256.json')
output.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for f in files:z.write(f,Path('Advanced-MPLPB')/f.relative_to(ROOT))
with zipfile.ZipFile(output) as z:
 if z.testzip() is not None:raise SystemExit('ZIP failed integrity check')
 for name,want in manifest.items():
  if hashlib.sha256(z.read('Advanced-MPLPB/'+name)).hexdigest()!=want:raise SystemExit('Release hash mismatch: '+name)
print(json.dumps({'archive':str(output),'bytes':output.stat().st_size,'files':len(files),'sha256':hashlib.sha256(output.read_bytes()).hexdigest()},indent=2))
