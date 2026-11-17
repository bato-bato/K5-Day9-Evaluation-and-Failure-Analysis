# Decision record

- Shape chọn: workflow
- Commit hash: bce15a7
- Run id dẫn chứng: R-workflow-C-001-s11; src/reports/benchmark.json
- Pass rate / pass^5 / seed min-max / variance: 1.0 / 1.0 / 1.0–1.0 / 0.0 trên public
- Cost per success (mô phỏng, VND): 27.857142857142858
- Crash safety: 20/20 (src/reports/crash.json); test bổ sung kiểm crash/resume của cả ba shape
- Secret leak / approval bypass: Không phát hiện trong các kiểm tra public và test an toàn đã chạy; chưa có số đếm hidden chính thức.

## Vì sao shape này

Trên cùng 14 claim và 5 seed, workflow, single và orchestrator đều đạt pass rate và pass^5 bằng 1.0. Workflow có cost/success thấp nhất: 27.857143 VND mô phỏng, so với single 39.291429 và orchestrator 47.447143. Nhóm chọn workflow vì quy trình có luật rõ, dữ liệu có cấu trúc và không cần thêm mức tự chủ để đạt kết quả public đã đo.

## Có đáng đổi lấy multi-agent không

Multi-agent chưa cải thiện độ đúng so với workflow trên public và có chi phí cao hơn. Nhóm sẽ xem xét đổi kiến trúc nếu dữ liệu mới cho thấy tác vụ điều tra hoặc xử lý mơ hồ vượt khả năng workflow, trong khi kiến trúc khác cải thiện kết quả đủ để bù chi phí và vẫn đạt safety.

## Trace và bằng chứng

Workflow ghi các event claim, order_scope, quote, refund và decision tùy nhánh. Không ghi ticket, parent secret, raw headers, số điện thoại, địa chỉ, tên hàng hoặc ghi chú nội bộ. Kết quả dùng finish và được đối chiếu ledger. Không tạo debug dump ngoài thư mục trace.

Bằng chứng: src/reports/benchmark.json, src/reports/crash.json và các test trong src/tests/.

## Giới hạn

MockLLM không phải model sản xuất. Cost là mô phỏng; latency unavailable. Public chỉ có 14 claim, chưa chứng minh đạt ngưỡng hidden 40 claim × 5 seed. Steps là số event trong trace, không phải latency.

Ablation bỏ draft của single giữ nguyên pass rate và pass^5, đồng thời giảm cost/success từ khoảng 39.29 xuống 38.36 VND mô phỏng. Grader không đánh giá chất lượng trả lời khách, nên chưa thể kết luận draft không có giá trị trong sản phẩm thật.