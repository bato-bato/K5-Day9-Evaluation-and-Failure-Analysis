# Báo cáo cá nhân — 2A202603364_TranDangKhoa

## 1. Thông tin thành viên

- Họ tên: Trần Đăng Khoa
- MSSV: 2A202603364
- GitHub: khoatran134563-2k3
- Vai trò: Orchestrator, handoff và bảo mật trace.

## 2. Phần việc phụ trách

- Triển khai Shape C trong `src/lab8/shapes/orchestrator.py`.
- Tạo handoff theo allowlist và gọi investigator chỉ sử dụng tool đọc.
- Kiểm soát dữ liệu được ghi vào trace.
- Thêm test bảo mật riêng cho Orchestrator.
- Chuẩn bị phần mô tả kiến trúc và bảo mật để nhóm tổng hợp báo cáo.

## 3. Đóng góp cụ thể

Commit chính: `a929cea` — Implement orchestrator with safe handoff and security regression test.

### Triển khai Orchestrator

- Đọc claim bằng `get_claim_view`; xử lý claim không tồn tại và thiếu order_id.
- Tạo handoff bằng `make_handoff`, với task cố định, facts rỗng và các tool đọc `lookup_order`, `lookup_policy`.
- Gọi `run_readonly_investigators` theo principal của claim; chuyển xử lý sang `escalated` nếu order không hiển thị trong phạm vi đó.
- Tính quote bằng `compute_compensation` từ order có cấu trúc, không sử dụng số tiền hoặc số ngày do ticket yêu cầu.
- Khi quote dương, truyền quote đầy đủ vào `issue_refund`; host kiểm approval, giới hạn theo đơn và idempotency.
- Truyền `crash_at` vào host và để `InjectedCrash` lan ra.
- Dùng `finish` để tạo RunResult; ghi trace và đóng kết nối trong `finally`.

### Bảo mật và test

- Không đưa ticket, parent context, secret hay raw headers vào handoff.
- Trace chỉ ghi các field được chọn thay vì dump nguyên claim hoặc kết quả investigator.
- Thêm file `src/tests/test_team_orchestrator.py`.
- Test cấy dữ liệu nhạy cảm vào database tạm, kiểm tra handoff chỉ cấp tool đọc và dữ liệu nhạy cảm không xuất hiện trong handoff, RunResult, trace hoặc stdout.
- Kiểm tra ticket injection không thay đổi khoản hoàn hợp lệ của claim C-001.

## 4. Bằng chứng

- Nhánh làm việc: `feat/orchestrator`.
- Commit: [a929cea](https://github.com/bato-bato/K5-L3A-DAY08-NhomNhomNhom-FromWorkflowsToAgents/commit/a929cea).
- Test bổ sung:
  `test_orchestrator_blocks_ticket_secret_from_handoff_and_trace`
  trong `src/tests/test_team_orchestrator.py`.

Các lệnh đã chạy trong thư mục `src/`:

```powershell
.\.venv\Scripts\python.exe -m pytest -q -m student -o addopts= -k orchestrator --tb=short
.\.venv\Scripts\python.exe -m pytest -q tests/test_team_orchestrator.py --tb=short
.\.venv\Scripts\python.exe -m pytest -q