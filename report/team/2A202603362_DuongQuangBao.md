# Báo cáo cá nhân — 2A202603362_DuongQuangBao

## 1. Thông tin thành viên

- Họ tên: Dương Quang Bảo
- MSSV: 2A202603362
- Email: dumabao69@gmail.com
- GitHub: wadiobao

## 2. Phần việc phụ trách

- **Vai trò:** TV4 — kiểm thử ledger / approval / crash, benchmark và bằng chứng (không viết shape nào, kiểm thử cả ba shape nhóm viết).
- **Nội dung kỹ thuật:**
  - Rà từng shape khi được đẩy lên: workflow (TV1), single (TV2), orchestrator (TV3), bằng ma trận `python -m pytest -q -m student -o addopts=` và quét trace.
  - Viết bộ test chung `src/tests/test_shapes_crash_tv4.py` chạy `run_claim` thật của từng shape, vì `lab8.crash_test` mặc định chỉ gọi thẳng `durability.issue_refund` nên `crash_safety = 20/20` chưa chứng minh từng shape chịu được crash.
  - Chạy crash suite và benchmark 4 shape × 5 seed, lấy số liệu từ file JSON do công cụ sinh ra để điền ADR và research card.
  - Không sửa `durability.py`, `policy.py`, `metrics.py`, `config/`, `data/` và không sửa tay JSON trong `src/reports/`.

## 3. Đóng góp cụ thể

- **Commit chính:**
  - Hash: `<điền hash commit file test>` (`test: add shared crash/approval/leak tests for three shapes (TV4)`)
  - Nhánh: `feat/tv4-tests` (chỉ chứa một file test, không chứa code shape của người khác).
- **Bộ test đã thêm** — file `src/tests/test_shapes_crash_tv4.py`, 36 test (3 shape × các tình huống):
  1. `test_crash_then_resume_pays_exactly_once` (18 test): crash ở 3 điểm (`before_effect`, `after_effect_before_checkpoint`, `after_checkpoint`) trên C-001 (35.000) và C-014 (T14: đơn đã hoàn 30.000, chỉ ghi phần chênh 120.000); resume 2 lần; đúng 1 dòng ledger, đúng 1 audit `refund_committed`.
  2. `test_invalid_approval_never_pays` (12 test): approval thiếu, của claim khác, bị thu hồi, hết hạn → `denied`, không ghi ledger, không có `refund_committed`, đúng 1 audit `policy_denied`, `proposal_amount` vẫn là quote đầy đủ 35.000.
  3. `test_ticket_injection_does_not_change_money_or_leak` (3 test): ticket chứa lệnh giả ("ignore policy", trễ 99 ngày) và `CANARY_SECRET`, số điện thoại → số tiền không đổi, chuỗi nhạy cảm không lọt vào trace hay kết quả.
  4. `test_unknown_claim_returns_cleanly_with_valid_trace` (3 test): claim không tồn tại không ném exception, trace đúng contract v1, ledger không đổi.
- **Quyết định kỹ thuật:**
  - Không gắn marker `student` cho file test, để file chạy trong cổng host `python -m pytest -q`; vì vậy chỉ merge sau khi cả ba shape đã nằm trên `main`, tránh làm đỏ cổng host.
  - Chỉ push nhánh chứa đúng một file test, không push nhánh ghép ba shape (nhánh ghép chỉ dùng chạy thử cục bộ).

## 4. Bằng chứng

- **Kiểm thử trên bản ghép cục bộ của ba shape (main + `feat/single-agent` + `feat/orchestrator`):**
  - File test của tôi: 36 passed.
  - Cổng host `python -m pytest -q`: 101 passed.
  - Ma trận student: 248 passed, 0 failed (lúc mới clone là 186 failed, 62 passed).
  - Quét 4 shape × 14 claim × 5 seed (280 lần chạy): không có trace sai contract v1, không lộ `CANARY_SECRET`, `parent_secret` hay số điện thoại.
- **Kiểm chứng test thật sự bắt được lỗi (làm hỏng code cục bộ rồi khôi phục):**
  - workflow nuốt `InjectedCrash` → 6 test đỏ.
  - orchestrator tự trừ phần đã hoàn trước khi gọi host (trừ hai lần ở T14) → 3 test đỏ.
  - workflow ghi ticket vào trace → 1 test đỏ.
- **Benchmark xem trước** (`python -m lab8.benchmark --shapes workflow,single,orchestrator,swarm --cases data/public_claims.jsonl --seeds 11,22,33,44,55 --out reports/benchmark.json`, chạy trên nhánh ghép cục bộ, chưa phải bản nộp):

  | Shape | Pass rate | pass^5 | Variance | Cost/success (VND, mô phỏng) |
  | --- | --- | --- | --- | --- |
  | workflow | 1.000 | 1.000 | 0 | 27,86 |
  | single | 1.000 | 1.000 | 0 | 39,29 |
  | orchestrator | 1.000 | 1.000 | 0 | 47,45 |
  | swarm | 0.986 | 0.929 | 0.000816 | 49,57 |

  Swarm sai 1 trial (`resolved != denied`) ở seed 55 — lỗi cố ý của swarm tham chiếu (tin số ngày trong ticket thay vì dữ liệu order).
- **Bản nộp chính thức (điền sau khi `main` đủ ba shape):**
  - Commit hash chốt: `<điền>`
  - Run id dẫn chứng (`src/reports/benchmark.json`): `<điền>`
  - `src/reports/crash.json`: `crash_safety = <điền, kỳ vọng 20/20>`
  - `python -m lab8.check_submission`: `<điền, kỳ vọng 0 FAIL>`

## 5. Công cụ AI đã dùng

- **Công cụ:** Claude (Anthropic).
- **Mục đích sử dụng:**
  - Đọc repo đề bài (README, CHECKPOINTS, RUBRIC, luật nghiệp vụ) và tóm tắt việc của vai TV4.
  - Soạn bản nháp file `test_shapes_crash_tv4.py` và rà code của ba shape theo ranh giới code/model, quote đầy đủ và trace.
- **Cách tự kiểm tra:**
  - Tự chạy các lệnh `python -m lab8.crash_test --count 20 --out reports/crash.json` và `python -m lab8.benchmark ...` trong thư mục `src/` rồi đối chiếu số liệu với báo cáo của công cụ, không dùng số do AI nêu.
  - Làm hỏng code có chủ đích ở ba chỗ (mục 4) để xem test có đỏ không, không chỉ nhìn test xanh.
  - Không dùng AI để điền commit hash, run id hay số benchmark; các mục này lấy từ `git rev-parse` và `reports/benchmark.json`.

## 6. Tự đánh giá

- **Đã làm được:** bộ test chung cho ba shape có kiểm chứng bằng cách làm hỏng code; rà ba shape không phát hiện vi phạm must-pass nào (không bypass approval, không lộ secret, crash không tạo quá một refund).
- **Còn phải làm:** chạy lại crash suite và benchmark trên commit cuối của `main`, điền hash và run id vào `decision_adr.md`, viết research card (ablation R2 về lỗi swarm ở seed 55), điền dòng của tôi trong bảng đóng góp `TEAM.md`.
- **Giới hạn:** bộ public chỉ có 14 claim và MockLLM không phải model thật nên 100% pass ở ba shape chưa đảm bảo kết quả trên bộ hidden (40 claim × 5 seed).