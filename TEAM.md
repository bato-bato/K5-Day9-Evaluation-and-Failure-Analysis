# Team

## Thông tin nhóm

- Tên nhóm: NhomNhomNhom
- Lớp: L3A
- Repo nhóm: `K5-L3A-DAY08-NhomNhomNhom-FromWorkflowsToAgents` (xem [SUBMISSION.md](SUBMISSION.md))
- URL repo, nhánh nộp, commit chốt: main

## Thành viên
| Người | Vai | Commit | Test đã thêm hoặc sửa |
| --- | --- | --- | --- |
| Tống Thiên Bảo | Workflow + tích hợp | 9805936 | src/tests/test_workflow_safety.py |
| Nguyễn Hoàng Việt | Single agent | 76f2ec1 | src/tests/test_single_agent_tv2.py |
| Trần Đăng Khoa | Orchestrator + handoff | a929cea | src/tests/test_team_orchestrator.py |
| Dương Quang Bảo | Kiểm thử chung + đánh giá | b113fa9 | src/tests/test_shapes_crash_tv4.py |

Gợi ý chia vai:

- Nhóm 6 người: integration; workflow; single agent; orchestrator; ledger/policy/crash; eval/report.
- Nhóm 4 người: workflow + integration; single; orchestrator + handoff; ledger + evaluation.

## Bảng đóng góp

`python -m lab8.check_submission` đọc bảng này bằng máy: giữ nguyên tiêu đề `## Bảng đóng góp` và các cột. Mỗi người một dòng: commit có nội dung và ít nhất một test đã thêm hoặc sửa.

| Người | Vai | Commit | Test đã thêm hoặc sửa |
| --- | --- | --- | --- |
| Nguyễn Hoàng Việt | Single Agent & ReAct | 76f2ec1 | test_single_agent_worker_cannot_call_write_tools, test_single_agent_prompt_injection_resistant, test_single_agent_order_already_refunded_cap, test_single_agent_trace_is_clean_and_valid |

## Cá nhân

Mỗi thành viên đồng thời tạo một báo cáo riêng trong `report/` theo dạng:

```text
report/team/MSSV_HoTen.md
```

Ví dụ: `report/team/20241234_NguyenVanAn.md`.

Sao chép mục dưới đây cho từng thành viên.

## 03487_NguyenHoangViet

### Phần việc phụ trách

- Cài đặt và tối ưu Shape B: Single Agent (`src/lab8/shapes/single.py`).
- Kiểm soát vòng lặp ReAct có chặn trên (`max_steps=8`), cô lập quyền hạn của Worker qua `READONLY_TOOLS`.
- Đảm bảo ranh giới an toàn cho Model: không bị dẫn dắt bởi prompt injection trong ticket, chỉ tin tưởng order ground-truth.
- Xử lý tích hợp trần hoàn tiền đơn hàng (per-order cap) và độ bền idempotency/crash (`issue_refund`).
- Viết test suite chuyên biệt cho Single Agent (`src/tests/test_single_agent_tv2.py`).

### Đóng góp cụ thể

- Commit: `76f2ec1` (feat(single): implement bounded ReAct single agent and safety tests)
- Tests: `test_single_agent_worker_cannot_call_write_tools`, `test_single_agent_prompt_injection_resistant`, `test_single_agent_trace_is_clean_and_valid`, `test_single_agent_order_already_refunded_cap` (100% pass trên 62 test cases student của Single Agent).

### Bằng chứng

- Commit hash: `76f2ec1`
- Test files: `src/tests/test_single_agent_tv2.py`
