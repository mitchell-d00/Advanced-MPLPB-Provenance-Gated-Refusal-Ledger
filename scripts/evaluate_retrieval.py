#!/usr/bin/env python3
"""Replay unchanged historical probes against one engine checkout.
Run each checkout in a fresh process to prevent Python import-cache contamination.
"""
import argparse,hashlib,json,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PIN='fd0f8b1d61a206dcbb612fdc7503ab339a09ec02aebf576b27554c1fb4cb9076'
p=argparse.ArgumentParser(description=__doc__);p.add_argument('--engine-root',type=Path,default=ROOT/'upstream/MPLPB');p.add_argument('--output',type=Path,required=True);a=p.parse_args();engine=a.engine_root.resolve();sys.path.insert(0,str(engine))
from mplpb_combined import reader as R
from mplpb_combined.provenance_gate import gather
from mplpb_combined.ledger import Ledger
from tools.ledger_ui import App
try:from mplpb_combined.retrieval import retrieve
except ImportError:retrieve=None

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def correct(expected,got):return got['kind']==expected['expect'] and (expected['expect']!='return' or got.get('id')==expected.get('doc'))
root=engine/'examples/studio';corpus_hashes={x.relative_to(root).as_posix():digest(x) for x in sorted(root.rglob('*')) if x.is_file()}
result={'benchmark_contract':'one-owner page retrieval, not semantic answer accuracy','independence_verified':False,'engine_root':str(engine),'corpus_hashes':corpus_hashes,'engine_hashes':{x.relative_to(engine).as_posix():digest(x) for folder in ['mplpb_combined','mplpb_answers','browser'] for x in sorted((engine/folder).glob('*.py'))},'sets':{}}
with tempfile.TemporaryDirectory() as d:
 app=App(topic_base=Path(d)/'topics')
 for name in ['probes','probes_heldout','probes_adjacent']:
  path=engine/'killtest'/(name+'.json');want=path.with_suffix('.sha256').read_text().split()[0];actual=digest(path)
  if actual!=want or (name=='probes' and actual!=PIN):raise SystemExit('Frozen benchmark hash changed: '+name)
  spec=json.loads(path.read_text());rows=[]
  for probe in spec['probes']:
   legacy=R.answer(root,probe['q'],R.PROFILES['internal']).to_dict()
   strict=app.query({'corpus':'studio','profile':'internal','question':probe['q']})['reader']
   gated=app.retrieve({'corpus':'studio','profile':'internal','question':probe['q']}) if retrieve else None
   # A new API result counts only if it really carries the selected intact page.
   decision=gated['decision'] if gated else legacy
   row={'probe':probe,'retrieval':legacy,'strict':strict,'gated':gated,'strict_correct':correct(probe,strict),'retrieval_correct':correct(probe,legacy),'gated_correct':correct(probe,decision) if gated else None}
   if gated and decision['kind']=='return':
    source=gated['source'];assert gated['kind']=='retrieved' and gated['answer_supported'] is False
    assert source and decision['id']==source['id'] and decision['hash']==source['hash']
    assert source['text']==gated['reply']==decision['text']
    assert all(source['verification'][k] for k in ['hash_intact','lineage_pinned','origin_explicit'])
   rows.append(row)
  result['sets'][name]={'sha256':actual,'count':len(rows),'strict_correct':sum(r['strict_correct'] for r in rows),'retrieval_correct':sum(r['retrieval_correct'] for r in rows),'gated_correct':sum(r['gated_correct'] for r in rows) if retrieve else None,'retrieval_wrong_returns':sum(r['retrieval']['kind']=='return' and not r['retrieval_correct'] for r in rows),'rows':rows}
a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({name:{k:v for k,v in values.items() if k!='rows'} for name,values in result['sets'].items()},indent=2))
