"""Outcome regressions and report integrity beyond the starter vectors."""
import copy
import pytest
from test_lab9_graders import ctx, trial

pytestmark = pytest.mark.student


@pytest.fixture(autouse=True)
def isolate_variant_registration():
    # investigate registers Day 9 variants globally; leave Lab 8's contract intact.
    from lab8.shapes import SHAPES
    original = dict(SHAPES)
    yield
    SHAPES.clear()
    SHAPES.update(original)


def test_lab9_ticket_override_first_wrong_step():
    from lab9.graders import RefundAmountCorrect, DbFactKept
    from lab9.trace_case import investigate
    broken = investigate('seeded_regression', 'C-002', 11)
    fixed = investigate('fixed', 'C-002', 11)
    assert broken['trial']['events'][2]['kind'] == 'model_override'
    assert not RefundAmountCorrect().evaluate(ctx(broken['trial'], broken['label'])).value
    assert not DbFactKept().evaluate(ctx(broken['trial'], broken['label'])).value
    assert RefundAmountCorrect().evaluate(ctx(fixed['trial'], fixed['label'])).value
    assert fixed['trial']['lab8_pass']


@pytest.mark.parametrize('text,amount,expected', [
    ('Đã hoàn 35.000đ.', 35000, True),
    ('LogiX đã hoàn phí 20,000 VND cho đơn O-808.', 20000, True),
    ('Đã hoàn 35000 đồng.', 20000, False),
    ('Đã hoàn 0đ.', 35000, False),
    ('Chưa đủ điều kiện hoàn tiền.', 0, True),
])
def test_lab9_reply_ledger(text, amount, expected):
    from lab9.graders import ReplyLedgerConsistent
    t = trial(refund_vnd=amount, events=[{'kind':'reply','payload':{'text':text}}])
    assert ReplyLedgerConsistent().evaluate(ctx(t)).value is expected


def test_lab9_integrity_duplicate_failure_and_slice_relabel():
    from lab9 import gate
    rows = [{'item_id': 'E-001', 'seed': s, 'pass_rate': True, 'slices':['money_movement']} for s in (1,2)]
    base = {'manifest':{'items':1,'seeds':[1,2]}, 'rows': rows,
            'metrics':{'pass_rate':1.0},'evaluator_failures':[]}
    spec = {'metrics':[{'id':'pass_rate'}]}
    for attack in ('duplicate','failure','slice','aggregate'):
        pr = copy.deepcopy(base)
        if attack == 'duplicate': pr['rows'][1] = copy.deepcopy(pr['rows'][0])
        elif attack == 'failure': pr['evaluator_failures'] = ['grader crashed']
        elif attack == 'slice': pr['rows'][0]['slices'] = []
        else: pr['metrics']['pass_rate'] = 0.5
        assert gate.integrity_check(pr, base, spec)


def test_lab9_early_denial_must_not_skip_host_policy():
    from lab9.graders import HostPolicyConsistent
    from lab9.trace_case import investigate
    broken = investigate('seeded_regression', 'C-013', 11)
    fixed = investigate('fixed', 'C-013', 11)
    # Same zero money, different policy trajectory: outcome-only money checks miss this.
    assert broken['trial']['snapshot']['refund_vnd'] == fixed['trial']['snapshot']['refund_vnd'] == 0
    assert not HostPolicyConsistent().evaluate(ctx(broken['trial'], broken['label'])).value
    assert HostPolicyConsistent().evaluate(ctx(fixed['trial'], fixed['label'])).value
