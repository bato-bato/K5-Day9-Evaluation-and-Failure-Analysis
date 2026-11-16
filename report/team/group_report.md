
# Báo cáo nhóm — Lab 8 LogiX-VN

## 1. Thông tin nhóm

- Tên nhóm: NhomNhomNhom
- Lớp: L3A
- Repo: https://github.com/bato-bato/K5-L3A-DAY08-NhomNhomNhom-FromWorkflowsToAgents
- Nhánh nộp: main
- Commit dẫn chứng, trùng với decision_adr.md: [COMMIT_HASH]

| Thành viên         | Vai trò                                           |
| -------------------- | -------------------------------------------------- |
| Tống Thiên Bảo    | Workflow, tích hợp và tổng hợp báo cáo      |
| Nguyễn Hoàng Việt | Single agent và vòng lặp ReAct                  |
| Trần Đăng Khoa    | Orchestrator, handoff và bảo mật trace          |
| Dương Quang Bảo   | Kiểm thử ledger, approval, crash và đánh giá |

Thông tin thành viên và bằng chứng đóng góp được ghi trong TEAM.md và báo cáo cá nhân.

## 2. Mục tiêu và cách tiếp cận

Nhóm triển khai quy trình xử lý claim của công ty giả lập LogiX-VN bằng ba kiến trúc: workflow, single agent và orchestrator. Swarm tham chiếu được giữ làm đối chứng. Mục tiêu là chọn kiến trúc ít tự chủ nhất vẫn đáp ứng yêu cầu nghiệp vụ và an toàn, dựa trên kết quả đo.

Ba shape nhóm viết dùng chung chữ ký run_claim và trả về RunResult. Việc tính tiền dựa trên dữ liệu order có cấu trúc và policy hiện hành. Host chịu trách nhiệm kiểm approval, giới hạn tiền hoàn theo đơn và chống ghi trùng. Nội dung ticket được coi là dữ liệu không đáng tin cậy, không có quyền thay đổi policy hoặc cấp approval.

Nhóm triển khai các shape song song, bổ sung test theo phần việc, rồi tích hợp và chạy lại toàn bộ ma trận public. Benchmark sử dụng cùng corpus, seed, MockLLM, pricing và evaluator. Mỗi trial có SQLite mới để tránh hưởng trạng thái từ trial trước.

## 3. Giải pháp

### 3.1. Workflow

Workflow xử lý theo các bước cố định:

1. Đọc claim bằng get_claim_view.
2. Claim không tồn tại trả failed; thiếu order_id trả needs_info.
3. Lấy order bằng lookup_order theo principal của claim.
4. Không tìm thấy hoặc không được xem order trả escalated.
5. Tính quote từ order có cấu trúc bằng compute_compensation.
6. Quote bằng 0 trả denied; quote dương được chuyển cho issue_refund.
7. Host chấp nhận thì resolved; từ chối thì denied; xung đột số tiền thì failed.

Workflow không gọi model và không lấy số ngày trễ hoặc mã đơn từ câu chữ trong ticket. Các nhánh trả kết quả dùng finish để tạo RunResult và ghi trace.

### 3.2. Single agent

Single agent sử dụng run_react với max_steps=8 và worker=True. Bộ quyết định chọn tool đọc theo observation, gồm lookup_order, lookup_refund_history và compute_compensation. Các lời gọi MockLLM được ghi nhận trong Budget.

Sau vòng lặp, code của shape xử lý quote và gọi issue_refund. Model không được gọi tool ghi, tạo approval hoặc tự quyết số tiền. Nếu chạm giới hạn bước, shape trả failed với lý do step_cap.

Trong triển khai hiện tại, lựa chọn tool được điều khiển chủ yếu bằng code trong decider; kết quả MockLLM không trực tiếp quyết định hành động. Vì vậy đây là mô phỏng vòng ReAct có giới hạn, chưa đại diện đầy đủ cho agent dùng model sản xuất.

### 3.3. Orchestrator và handoff

Orchestrator đọc claim, kiểm tra order_id rồi tạo handoff bằng make_handoff. Handoff dùng task cố định, facts rỗng và chỉ cấp lookup_order, lookup_policy cho investigator.

Investigator chạy qua run_readonly_investigators trong phạm vi principal. Orchestrator lấy order có cấu trúc từ kết quả điều tra, tính quote bằng compute_compensation rồi gọi host ghi refund. Investigator không được cấp tool ghi.

Handoff không chứa ticket, parent context, secret hoặc raw headers. Trace chỉ ghi handoff đã sanitize và các field được chọn rõ ràng, không dump toàn bộ kết quả investigator.

### 3.4. Ranh giới code, model và host

| Công việc                                                   | Thành phần chịu trách nhiệm |
| ------------------------------------------------------------- | -------------------------------- |
| Kiểm phạm vi principal và đọc dữ liệu order            | Tool/code                        |
| Chọn policy hiện hành và tính entitlement                | compute_compensation             |
| Mô phỏng lời gọi model, soạn câu trả lời              | MockLLM                          |
| Kiểm approval đúng claim, trạng thái và hạn hiệu lực | Host                             |
| Áp trần tiền theo đơn và khoản đã hoàn trước      | Host                             |
| Ghi refund, chống trùng và audit committed                 | Host/ledger                      |

Shape truyền quote đầy đủ vào issue_refund, không tự trừ phần đã hoàn. Ví dụ T14 có entitlement 150.000 VND và khoản hoàn trước 30.000 VND: shape truyền 150.000, host chỉ ghi thêm 120.000. T13 đã hoàn đủ thì host từ chối và ghi policy_denied.

### 3.5. Durability và bảo mật trace

Các shape truyền crash_at xuống host và để InjectedCrash lan ra ngoài. Kết nối SQLite được đóng khi kết thúc, kể cả khi crash.

Host dùng idempotency key refund:{claim_id}. Refund và audit refund_committed được ghi cùng transaction, nên retry sau crash không tạo thêm refund. Checkpoint riêng không thay thế ledger.

Trace được ghi đúng contract v1 với run_id và events. Nhóm tránh ghi ticket, parent_secret, raw headers, số điện thoại, địa chỉ, tên hàng và ghi chú nội bộ. Các nhánh trả về sớm vẫn có trace.

## 4. Kết quả

### 4.1. Môi trường và kiểm thử

Kết quả chạy lại trên máy nhóm trưởng:

- Python 3.11.9, Windows AMD64.
- lab8.smoke: pass.
- Host và test bổ sung: 101 passed, 248 deselected.
- Ma trận student: 248 passed, 101 deselected.
- Crash suite: 20/20.

Các lệnh chạy trong src/:

```powershell
python -m lab8.smoke
python -m pytest -q
python -m pytest -q -m student -o addopts=
python -m lab8.crash_test --count 20 --out reports/crash.json
```

Bộ test bổ sung của TV4 kiểm cả ba shape tại ba điểm crash, trên claim hoàn ship và claim chỉ hoàn phần chênh. Các trường hợp approval thiếu, sai claim, bị thu hồi, hết hạn, ticket injection và claim không tồn tại cũng được kiểm tra.

Không phát hiện bypass approval hoặc rò secret trong phạm vi các test đã chạy. Nhóm chưa có số đếm hoặc kết quả chấm hidden chính thức.

### 4.2. Benchmark bốn kiến trúc

Nguồn số liệu: src/reports/benchmark.json.

Điều kiện đo: 14 claim public × 5 seed 11,22,33,44,55 × 4 shape, tổng cộng 280 trial. Mỗi trial dùng SQLite mới, cùng MockLLM, pricing, evaluator và ngày nghiệp vụ 2026-11-15.

```powershell
python -m lab8.benchmark --shapes workflow,single,orchestrator,swarm --cases data/public_claims.jsonl --seeds 11,22,33,44,55 --out reports/benchmark.json
```

| Shape        | Pass rate |   Pass^5 | Seed min–max      |    Variance | Cost/success VND mô phỏng | Mean/p95 steps |
| ------------ | --------: | -------: | ------------------ | ----------: | --------------------------: | -------------- |
| workflow     |  1.000000 | 1.000000 | 1.000000–1.000000 |           0 |                   27.857143 | 4.428571 / 5   |
| single       |  1.000000 | 1.000000 | 1.000000–1.000000 |           0 |                   39.291429 | 3.714286 / 4   |
| orchestrator |  1.000000 | 1.000000 | 1.000000–1.000000 |           0 |                   47.447143 | 4.357143 / 5   |
| swarm        |  0.985714 | 0.928571 | 0.928571–1.000000 | 0.000816327 |                   49.566957 | 2.800000 / 3   |

Workflow, single và orchestrator đều đạt 70/70 trial public. Swarm đạt 69/70, sai ở T02 seed 55 do điểm yếu cố ý lấy số ngày trong ticket thay vì order có cấu trúc.

Run id dẫn chứng của workflow: R-workflow-C-001-s11. Các trial còn lại được lưu trong benchmark.json.

Steps là số event trong trace, không phải latency hoặc số thao tác thực tế. Khác biệt cách ghi trace giữa các shape giới hạn ý nghĩa của việc so sánh chỉ số này.

### 4.3. Ablation: bỏ bước draft của single

Nguồn số liệu: src/reports/research_ablation.json.

Nhóm so single với single_no_draft, chỉ bỏ lời gọi model có purpose=draft. Model, tools, corpus, seed, pricing và evaluator được giữ nguyên.

```powershell
python -m lab8.benchmark --shapes single,single_no_draft --extra-shape single_no_draft=bonus.single_no_draft:run_claim --cases data/public_claims.jsonl --seeds 11,22,33,44,55 --out reports/research_ablation.json
```

| Biến thể      | Pass rate | Pass^5 | Variance | Cost/success VND mô phỏng |
| --------------- | --------: | -----: | -------: | --------------------------: |
| single          |     1.000 |  1.000 |        0 |                       39.29 |
| single_no_draft |     1.000 |  1.000 |        0 |                       38.36 |

Bỏ draft không làm thay đổi kết quả được grader chấm và giảm chi phí khoảng 2,37%, tính từ số hiển thị đã làm tròn. Kết quả ủng hộ giả thuyết rằng draft có thể được bỏ để giảm chi phí trong phạm vi chấm của lab.

Grader không đánh giá chất lượng câu trả lời khách hàng, nên thí nghiệm không chứng minh draft không có giá trị trong sản phẩm thực tế.

### 4.4. Quyết định kiến trúc

Nhóm chọn workflow vì đạt độ đúng ngang single và orchestrator trên public với chi phí thấp nhất. Luật nghiệp vụ rõ và dữ liệu có cấu trúc cho phép xử lý bằng các bước cố định.

Quyết định chi tiết nằm trong decision_adr.md. Nhóm sẽ cân nhắc đổi kiến trúc nếu dữ liệu mới cho thấy các tác vụ điều tra hoặc xử lý mơ hồ vượt quá khả năng workflow, và kiến trúc khác cải thiện kết quả đủ để bù chi phí mà vẫn đạt safety.

## 5. Khó khăn và cách xử lý

### 5.1. Chạy lệnh ngoài thư mục src

Nhóm gặp ModuleNotFoundError: No module named 'lab8' khi chạy crash_test và benchmark. Pytest cũng xuất hiện cảnh báo không nhận marker student.

Cách xử lý: chuyển vào src/ trước khi chạy lệnh. Sau đó smoke, host test, student matrix, crash suite và benchmark đều chạy thành công.

### 5.2. Test toàn nhóm đỏ khi chưa tích hợp đủ shape

Sau khi workflow hoàn thành, ma trận toàn nhóm còn 124 test fail thuộc single và orchestrator. Nhóm đối chiếu tên shape trong log, xác nhận workflow đạt 62 test, rồi tích hợp code hai shape còn lại. Kết quả sau tích hợp là 248 passed.

### 5.3. Git mở Vim khi merge

Git mở trình soạn thảo thông điệp merge; lệnh terminal bị nhập nhầm vào nội dung commit. Nhóm mở PowerShell mới, kiểm tra git status và kết thúc merge bằng git commit -m với thông điệp rõ ràng.

### 5.4. Phân biệt crash suite host với kiểm thử từng shape

Crash suite 20/20 chủ yếu kiểm host và swarm, chưa đủ chứng minh ba shape nhóm viết truyền crash_at và resume đúng. TV4 bổ sung test chạy run_claim thật của từng shape, kiểm crash tại ba điểm và xác nhận đúng một refund, một audit committed sau resume.

## 6. Tổng hợp đóng góp

| Thành viên         | Đóng góp chính                                     | Commit kỹ thuật | Bằng chứng test         |
| -------------------- | ------------------------------------------------------ | ----------------- | ------------------------- |
| Tống Thiên Bảo    | Workflow, tích hợp và kiểm thử lại toàn nhóm   | 9805936           | test_workflow_safety.py   |
| Nguyễn Hoàng Việt | Single agent, ReAct giới hạn và budget              | 76f2ec1           | test_single_agent_tv2.py  |
| Trần Đăng Khoa    | Orchestrator, handoff allowlist và trace an toàn     | a929cea           | test_team_orchestrator.py |
| Dương Quang Bảo   | 36 test chung về crash, approval, injection và trace | b113fa9           | test_shapes_crash_tv4.py  |

Tên file test trong bảng nằm dưới src/tests/. Bảng đóng góp đầy đủ ở TEAM.md; báo cáo cá nhân ghi công cụ AI đã dùng, cách tự kiểm tra và tự đánh giá của từng người.

## 7. Hạn chế và hướng cải thiện

- Public chỉ có 14 claim; kết quả 100% chưa chứng minh đạt ngưỡng hidden trên 40 claim × 5 seed. Nhóm chưa có kết quả chấm hidden chính thức trong bằng chứng của báo cáo này.
- MockLLM cố định theo seed, không đại diện cho năng lực, lỗi và độ biến động của model sản xuất.
- Cost là giá mô phỏng, không phải hóa đơn API. Latency được ghi unavailable.
- Pass^5 và variance bằng 0 chỉ mô tả corpus và năm seed đã đo, không bảo đảm mọi đầu vào đều đúng.
- So sánh bốn shape chưa cô lập hoàn toàn tác động topology vì số lời gọi, cách điều phối và cách ghi trace khác nhau.
- Ablation draft chỉ kiểm một thành phần của single, không đánh giá chất lượng văn bản trả lời khách.
- Biến thể single_no_draft dùng patch tạm thời và được chạy tuần tự trong benchmark; chưa được thiết kế cho thực thi đồng thời.
- Kiểm thử public và test an toàn không thay thế kiểm toán bảo mật toàn diện.

Hướng tiếp theo là tự kiểm trên student_drop khi được cung cấp, mở rộng case đối kháng với nhãn viết tay, đo chất lượng câu trả lời khách và kiểm tra lại quyết định kiến trúc trên dữ liệu rộng hơn.

## 8. Tài liệu tham khảo

1. README.md — mục tiêu và kiến trúc bài lab.
2. CHECKPOINTS.md — yêu cầu CP1–CP5.
3. RULES.md, RUBRIC.md, SUBMISSION.md — quy định, tiêu chí chấm và bài nộp.
4. docs/business_rules.md — luật nghiệp vụ và trần hoàn tiền.
5. docs/contracts.md — RunResult và Trace contract v1.
6. docs/architecture.md — ranh giới code/model/host và handoff.
7. docs/metrics.md — công thức metric và điều kiện so sánh.
8. report/team/research_card.md — câu hỏi nghiên cứu và ablation của nhóm.
9. src/reports/benchmark.json, crash.json, research_ablation.json — bằng chứng do công cụ sinh ra.

Các tài liệu và bằng chứng trên thuộc repo:
https://github.com/bato-bato/K5-L3A-DAY08-NhomNhomNhom-FromWorkflowsToAgents
