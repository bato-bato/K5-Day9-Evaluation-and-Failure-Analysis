# Research card

File này nằm cố định ở `report/team/research_card.md`; `python -m lab8.check_submission` đọc cột "Nhóm điền" bằng máy.

Phần này nối tiếp phần mini research ở buổi lý thuyết (slide 62–63). Chọn **một** câu R1–R4, điền 6 dòng, rồi biến nó thành **một ablation** chạy được trong lab: giữ nguyên model (MockLLM), tool, seed, corpus và giá, chỉ thay đổi một biến.

| Câu | Nguồn (thư viện tham khảo, slide 68–69) | Câu hỏi gợi ý cho lab |
| --- | --- | --- |
| R1 · Scaling | Google Research 2026, *Towards a Science of Scaling Agent Systems* | Task claims chủ yếu tuần tự hay song song được? Dự đoán thêm investigator sẽ làm pass rate và cost/success thay đổi thế nào. |
| R2 · Failure taxonomy | MAST, NeurIPS 2025, *Why Do Multi-Agent LLM Systems Fail?* | Các trial fail của swarm (seed 55) thuộc nhóm nào: lỗi giao việc, lệch mục tiêu, hay lỗi kiểm chứng? |
| R3 · Architecture choices | AgentArch, AACL 2026 | Nếu đổi topology mà giữ nguyên mọi thứ khác, biến nào phải cố định để kết luận còn đúng? |
| R4 · Evaluation confounders | EMNLP 2026, *Rethinking Evaluation of MAS Efficiency* | Làm sao chứng minh chênh lệch giữa A/B/C/D là do topology, không phải do prompt, tool hay seed? |

## Phiếu của nhóm

Điền vào cột cuối. Không xóa hai cột đầu.

| Field | Hướng dẫn | Nhóm điền |
| --- | --- | --- |
| CÂU | R1 / R2 / R3 / R4 | R4 — Evaluation confounders |
| SOURCE | Paper/blog, năm, URL, loại bằng chứng | Tài liệu lab: docs/metrics.md và report/team/research_card.md trong repo nhóm, https://github.com/bato-bato/K5-L3A-DAY08-NhomNhomNhom-FromWorkflowsToAgents. Đây là tài liệu hướng dẫn thí nghiệm; nhóm không coi lần chạy này là tái lập paper gốc. |
| CLAIM | Một kết luận gốc của nguồn | Theo quy định đo của lab, muốn so sánh công bằng cần giữ cố định corpus, seed, model, tool, pricing và evaluator. |
| BOUNDARY | Model / dataset / setup giới hạn kết luận | LogiX-VN public: 14 claim, 5 seed, MockLLM và giá mô phỏng. Grader chấm quyết định, ledger và trace; không chấm chất lượng văn bản trả lời khách. |
| HYPOTHESIS | Metric sẽ thay đổi thế nào | Bỏ lời gọi draft của single giữ nguyên pass rate và pass^5, đồng thời giảm cost/success. |
| METHOD | Biến cố định / biến thay đổi | Giữ nguyên single agent, tools, evaluator, corpus, seed 11/22/33/44/55 và pricing. Chỉ bỏ model call có purpose=draft qua biến thể single_no_draft. |
| FAILURE / METRIC | Lỗi dự kiến và cách đo | So pass rate, pass^5, seed variance và cost/success. Kiểm tra việc bỏ draft có làm thay đổi quyết định cuối hay không. |

## Kết quả ablation

- Lệnh đã chạy:
  python -m lab8.benchmark --shapes single,single_no_draft --extra-shape single_no_draft=bonus.single_no_draft:run_claim --cases data/public_claims.jsonl --seeds 11,22,33,44,55 --out reports/research_ablation.json
- File report: src/reports/research_ablation.json
- Kết quả: cả hai biến thể đạt pass rate 1.0, pass^5 1.0 và seed variance 0. Cost/success giảm từ khoảng 39.29 xuống 38.36 VND mô phỏng, tương đương khoảng 2.37%.
- Kết luận: kết quả ủng hộ hypothesis trên bộ public. Bước draft làm tăng chi phí nhưng không đổi quyết định được grader chấm.
- Giới hạn: MockLLM không phải model sản xuất; latency unavailable. Grader không đánh giá chất lượng trả lời khách, nên không kết luận bước draft vô ích trong sản phẩm thật. Thí nghiệm không chứng minh mọi chênh lệch giữa bốn shape đều do topology.

Muốn đi xa hơn một ablation để lấy điểm cộng thì xem [docs/bonus_topics.md](../../docs/bonus_topics.md).
