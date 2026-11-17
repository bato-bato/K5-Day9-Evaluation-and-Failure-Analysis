"""Build a sanitized offline UI snapshot from the actual Python evaluation/gate."""
from pathlib import Path
import json
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from lab9 import variants, gate
from lab9.eval import run_eval, load_spec
from lab9.trace_case import investigate


def main():
    variants.register()
    specs = {v: load_spec(Path(f'config/metric_spec{"_v2" if v == "v2" else ""}.yaml')) for v in ('v1', 'v2')}
    bases = {v: json.loads(Path(f'reports/baseline_{v}.json').read_text(encoding='utf-8')) for v in specs}
    scenarios = {}
    for name in ('fixed', 'seeded_regression', 'slice_regression', 'flaky_regression', 'honest_refactor'):
        version = 'v1' if name in ('fixed', 'seeded_regression') else 'v2'
        spec = specs[version]
        path = Path(f'reports/eval_{name}.json')
        report = json.loads(path.read_text(encoding='utf-8')) if path.is_file() else run_eval(name, spec)
        if report['manifest']['eval_set_sha'] != bases[version]['manifest']['eval_set_sha']:
            raise ValueError(f'Stale snapshot for {name}')
        blocked, lines = gate.check(report, bases[version], spec, spec)
        scenarios[name] = dict(report=report, baseline=bases[version], spec=spec, blocked=blocked, lines=lines, version=version)
        print(f'{name}: {"BLOCK" if blocked else "MERGE"}', flush=True)
    traces = {}
    for name, shape in [('broken', 'seeded_regression'), ('fixed', 'fixed')]:
        case = investigate(shape, 'C-002', 11)
        trial = case['trial']
        # Export only known safe fields, never the artifact blob or raw claim.
        traces[name] = dict(events=trial['events'], snapshot=trial['snapshot'],
                            result={'status': trial['result']['status']}, expected=case['label']['refund_vnd'])
    payload = dict(scenarios=scenarios, traces=traces, generated='2026-11-17', source_commit='2b0fbe0',
                   test_count=383, checks=26, mutation={'blocked':3,'total':3,'false_alarms':0})
    out = Path('../prototype/dist/data.js')
    out.write_text('window.DEMO_DATA = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
    print(f'Wrote {out}', flush=True)


if __name__ == '__main__':
    main()
