# LogiX Evaluation Studio — UI/UX prototype

Mở **MO-DEMO.cmd**, hoặc mở trực tiếp `dist/index.html` bằng Chrome/Edge. Không cần cài Node, chạy server hay có API key. JavaScript, CSS và snapshot dữ liệu đều nằm trong thư mục `dist`; font web có fallback hệ thống khi offline.

Bản Sites riêng tư: https://logix-eval-lab-nhomnhomnhom.khakigame2.chatgpt.site

## Demo trước lớp trong 3–5 phút

1. Bấm **Trình chiếu**, rồi **Bắt đầu demo**. Có thể dùng mũi tên phải để sang bước kế tiếp; Esc để đóng hướng dẫn.
2. **fixed**: pass rate 100%, baseline 98,57%; gate exit 0. Giải thích so sánh cùng item và seed.
3. **seeded_regression**: pass rate 71,43%; CI của hiệu hoàn toàn dưới 0. Mở “Xem quyết định chi tiết” để thấy metric nào chặn.
4. **Phân tích trace**: C-002@11, event 3 tin ticket hơn DB, hoàn sai 20.000đ. Bấm “Bản sửa” để thấy ledger 0đ và denied.
5. **slice_regression**: tổng vẫn 93,57%, nhưng slice quan trọng không đạt. Gate vẫn chặn.
6. **Judge audit**: tone đạt calibration; helpful recall chỉ 0,30 nên bị loại. Tiền và approval luôn dùng code grader.

Các màn hình còn có bảng metric, xuất report JSON, tìm/lọc 9 failure mode và audit 7 bất đồng. `honest_refactor` được merge; `flaky_regression` bị chặn. Giao diện responsive, có kiểm tra mobile 390px.

## Dữ liệu và giới hạn

Đây là prototype tương tác từ **snapshot report thực đo**, không chạy agent hay Python trực tiếp trên trình duyệt. Số 383 test / 26 bước kiểm tra là kết quả kiểm chứng Day 9 trước khi thêm giao diện. Gate trong snapshot được tính bằng `lab9.gate.check`, không suy diễn từ tên variant.

`src/scripts/build_demo_data.py` đọc baseline/candidate report, chạy các variant còn thiếu và xuất dữ liệu đã chọn field an toàn vào `dist/data.js`. Không xuất blob, raw claim hay API key. Các ca Core dùng v1; Advanced dùng v2 và baseline tương ứng.

Sinh lại snapshot từ thư mục `src/`:

```powershell
.venv/Scripts/python.exe scripts/build_demo_data.py
```

Kiểm thử UI: `src/scripts/qa_demo.mjs` dùng Chrome CDP tại localhost:9229 và preview localhost:8099; 16/16 kiểm tra đạt, kết quả tại `prototype-qa/checks.json`. Screenshot desktop/mobile đã kiểm tra, không commit ảnh runtime.

## Mã nguồn Sites

Site ID nằm trong `.openai/hosting.json`. Source đã publish có commit `c670d94b8e630c792e7ca231d68155702da4c2b8`.

Checkout Git riêng của Sites được giữ ở `../.sites-logix-source/` và được gitignore. Thư mục `prototype/` là bản mã nguồn thường để review trên GitHub Day 9; không phải Git submodule. Khi cập nhật Sites, dùng lại project ID và checkout Sites đó, không tạo Site mới. Quyền truy cập bản hosted hiện là riêng tư; demo trên máy chiếu có thể dùng bản offline.
