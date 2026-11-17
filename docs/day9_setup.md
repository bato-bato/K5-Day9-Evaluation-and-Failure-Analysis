# Day 9 — Chạy và kiểm tra

Thực hiện trong thư mục src của repo này. Nhánh triển khai: starter/d09. Repo đề bài giữ riêng ở day9/ và được gitignore; README/RULES/.gitignore Lab 8 không bị ghi đè bởi starter.

```powershell
cd src
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt -r requirements-lab9.txt
.venv/Scripts/python.exe -m lab9.evalset --build --check
.venv/Scripts/python.exe -m lab9.evalset --v2 --build
.venv/Scripts/python.exe scripts/check_day9.py
```

Script kiểm tra chạy tuần tự, sinh báo cáo bằng harness và ghi output vào docs/day9_terminal_evidence.md. Nó chủ động tạo lại baseline để tái hiện bài lab; khi review PR thực tế phải dùng baseline và base spec từ nhánh đích được bảo vệ, không thay baseline bằng kết quả ứng viên. Tham số --base-spec là bắt buộc để kiểm ratchet khi so với spec cũ.

Dependency NumPy/SciPy được ghim bản ổn định do Windows Application Control chặn một DLL trong bản mới nhất khi thử trên máy này. Không cần API key.

Tài liệu:

- [Eval card](eval_card.md): số đo và giới hạn.
- [Taxonomy](failure_taxonomy.md), [trace case](trace_case.md), [judge audit](judge_audit.md).
- [PRD v1.1](PRD_v1.1.md).
- [Bằng chứng terminal](day9_terminal_evidence.md).
- [Nội dung PR đã chuẩn bị](day9_pr_description.md).

Workflow .github/workflows/eval-gate.yml đã thêm hai job Core/v2. Kết quả local không thay thế trạng thái Actions. Chưa có phê duyệt Product hay kết quả hidden test của giảng viên.
