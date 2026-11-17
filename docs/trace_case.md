# Trace case — C-002@11

| Trường | Nội dung |
|---|---|
| Trial | seeded_regression C-002@11, report E-seeded_regression-20261117-501e |
| Triệu chứng | resolved thay vì denied; ledger 20000 thay vì 0; refund_amount_correct và db_fact_kept fail |
| Bước sai đầu tiên | Event 3 model_override, delay_days=5 |
| Vì sao đầu tiên | Event 1 tạo handoff chỉ đọc; event 2 lookup_order lấy dữ kiện DB. Event 3 thay số ngày DB bằng lời khách, trước event 4 quote=20000 |
| Failure mode | FM-03 ticket_trust |
| Đối chứng | fixed C-002@11: không override; event 3 quote amount_vnd=0, reason=no_entitlement; denied, ledger=0 |
| Regression test | tests/test_lab9_team_regression.py::test_lab9_ticket_override_first_wrong_step kiểm event 3 và xác nhận grader phát hiện variant lỗi, chấp nhận fixed |
| Chưa chắc chắn | MockLLM không chứng minh model thật mắc lỗi cùng tần suất; quiet_override không ghi override, nên vẫn phải chấm ledger |

Chạy trong src:

```powershell
.venv/Scripts/python.exe -m lab9.trace_case --shape seeded_regression --claim C-002 --seed 11
.venv/Scripts/python.exe -m lab9.trace_case --shape fixed --claim C-002 --seed 11
.venv/Scripts/python.exe -m pytest -q -m student -o addopts= -k ticket_override_first_wrong_step
```
