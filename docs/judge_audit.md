# Judge audit

Replay CSV, FAIL là lớp dương. Output đầy đủ: [terminal evidence](day9_terminal_evidence.md).

| Tiêu chí | n | TP/FP/FN/TN | κ | Precision | Recall | Floors | Quyết định |
|---|---|---|---|---|---|---|---|
| tone_ok | 100 | 24/4/6/66 | 0.757 | 0.857 | 0.800 | Đạt | Dùng đánh giá tone, không chấm tiền |
| helpful | 100 | 9/0/21/70 | 0.375 | 1.000 | 0.300 | Không đạt | Loại khỏi gate |

Observed failure rate tone=0.28, helpful=0.09; Rogan–Gladen đều hiệu chỉnh về 0.30. Hiệu chỉnh không biến judge recall thấp thành judge đáng dùng cho từng case.

## Audit bất đồng

Review rubric dựa trên nhãn người công khai, chưa phải vòng gán nhãn người độc lập mới.

| Case | Judge | Người | Quyết định review | Hành động sửa rubric |
|---|---|---|---|---|
| H-008 | PASS | FAIL | Theo người: giọng thân mật quá mức với khách | Nêu rõ “anh rồi nha, anh check” không phù hợp giọng hỗ trợ chuyên nghiệp |
| H-017 | PASS | FAIL | Theo người: “Dạ” nhưng xưng hô thiếu nhất quán | Không cho PASS chỉ vì có từ lịch sự; xem toàn câu |
| H-029 | PASS | FAIL | Theo người: “không cần nhắn thêm” gạt bỏ khách | Thêm fail về mệnh lệnh làm khách mất quyền hỏi |
| H-042 | FAIL | PASS | Theo người: lịch sự, thời gian 3–5 ngày không phải lỗi tone | Tách tính đúng của số tiền/thời hạn khỏi tone; tiền chuyển sang code |
| H-051 | FAIL | PASS | Theo người: “refund” tự nó không bất lịch sự | Không FAIL chỉ do thuật ngữ tiếng Anh |
| H-063 | PASS | FAIL | Theo người: hứa hoàn thêm không có căn cứ | Thêm ví dụ hứa ngoài thẩm quyền; review lại ranh giới tone/helpfulness |
| H-070 | PASS | FAIL | Theo người: emoji cười không phù hợp tình huống | Thêm ví dụ emoji làm giảm tính nghiêm túc là FAIL |

Helpfulness có 21 false negative: câu dài và lời xin lỗi không chứng minh đã giúp khách giải quyết vấn đề. Rubric mới cần kiểm xử lý đúng yêu cầu và bước tiếp theo cụ thể. Sau sửa rubric phải gán nhãn và đo lại; không gán số đo rubric cũ cho bản mới.

Tiền, approval, ledger và bảo mật luôn dùng code. Judge tone chỉ được dùng trong phạm vi calibration này. CSV đã công khai, chưa có held-out độc lập, chưa đo với khách thật.
