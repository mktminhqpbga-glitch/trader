# UI-02 — Đợt chỉnh thẩm mỹ sau phản hồi của người dùng

**Trạng thái: TECHNICAL QA PASS · VISUAL APPROVAL PENDING OWNER · DEV PREVIEW ONLY.**

Sau khi người dùng báo giao diện chưa ổn, đã đối chiếu lại các ảnh Home, Canvas và Composer do Chromium chụp. Bản cũ có thanh công cụ trùng vai trò (dock trái + thanh zoom có Add + quickbar), dải DEMO làm Home mất chiều cao, gallery chưa chiếm đủ chiều ngang, node có hai badge DEMO và quá nhiều đường viền. Khi Fit bảy node, tỷ lệ ~52% desktop / ~21% mobile khiến node khó đọc. Đợt chỉnh này **không thay VueFlow, IDs production, AI, API hoặc SQLite**.

## Những thay đổi đã thực hiện

- Trang **Tổng** bỏ dải thông báo xem trước thứ hai; sidebar 176px desktop vẫn có nhãn điều hướng; gallery gần đây và gallery sáng tạo dùng ba cột ảnh lớn hơn. Có các lối tắt thực đã có từ trước.
- **Canvas** chỉ còn một thanh thao tác sáng tạo tám nút giữa đáy; cụm zoom bên trái chỉ còn `− / tỷ lệ / + / Fit`. Dock trái trùng vai trò được ẩn về mặt giao diện, nhưng DOM/MapID cũ không bị xóa. Header và các công cụ có sẵn phía trên vẫn được giữ.
- Bảy node khi **mở để làm việc** được định khung ở **94% desktop / 84% mobile**, tập trung vào các cảnh mở đầu để có thể đọc; nút **Fit** vẫn thu toàn bộ graph khi người dùng yêu cầu. Chọn node ở mức zoom tổng quan thấp sẽ tự đưa node về tỷ lệ đọc được. Zoom +/− phản hồi tức thì để tránh đua hoạt ảnh khi tiếp tục bấm Fit.
- Các node media-first giữ image lightbox, HTML5 video CC0, prompt, menu/Inspector, handles/edges, delete/confirm và dữ liệu minh họa trung thực; thêm viền xanh cho trạng thái chọn, giảm đường viền lồng nhau, badge DEMO trùng và nút thứ cấp gây rối. Nút thứ cấp vẫn hiển thị khi hover/focus/được chọn hoặc trên thiết bị cảm ứng.
- Composer giữ tham chiếu ảnh tải lên/preset, textarea nhiều dòng, loại node, tỷ lệ và nút Submit **chỉ sửa/tạo node DEMO trong bộ nhớ**. Hàng công cụ mobile gọn vào một hàng, thông tin DEMO vẫn thể hiện ở header/gợi ý.

## 8 ảnh kiểm tra cách hiển thị khi làm việc

| Màn hình | Desktop 1440 × 900 | Mobile 390 × 844 |
|---|---|---|
| Tổng | [Tổng desktop](A-home-1440x900.png) | [Tổng mobile](A-home-390x844.png) |
| Canvas 3 node | [Canvas 3 desktop](A-canvas3-1440x900.png) | [Canvas 3 mobile](A-canvas3-390x844.png) |
| Canvas 7 node, zoom làm việc | [Canvas 7 desktop](A-canvas7-working-1440x900.png) | [Canvas 7 mobile](A-canvas7-working-390x844.png) |
| Composer | [Composer desktop](A-composer-1440x900.png) | [Composer mobile](A-composer-390x844.png) |

File [qa-smoke.json](qa-smoke.json) ghi kết quả Playwright **PASS 8 screenshot**, Home desktop sidebar `176px`, initial seven-node zoom `0.94` và `0.84`, không có `pageerror` hoặc document/root horizontal overflow; composer và quickbar nằm trong viewport. Một smoke riêng xác nhận sau khi nhấn Fit xuống `52.5%`, click Image Node tăng zoom lên `84%` và node giữ trạng thái được chọn.

## Kiểm thử chức năng đầy đủ sau tinh chỉnh

Rerun `scripts/ui02-reference-qa.js` tại Vite `127.0.0.1:5193` trong Chromium CLI session `ui02shell2`; dữ liệu mới tại [reference/qa-results.json](../reference/qa-results.json): **PASS 12/12 ảnh, 60 checks, 40 graph probes, bốn lần CC0 WebM play/pause thật**; `apiCalls=[]`, `appSockets=[]`, `pageErrors=[]`. Bộ kiểm thử từng phát hiện một lần nhấn Zoom In → Fit khi chuyển động còn chạy làm Fit chưa đạt; sửa Zoom +/− tức thì và rerun thành công. 12 ảnh QA mới của A/B là ảnh sau tinh chỉnh trong thư mục [reference](../reference/README.md).

**Giới hạn:** Kiểm thử chỉ xác nhận DEV preview, không phải tích hợp AI hoặc kiểm thử production. Người dùng chưa duyệt thẩm mỹ cuối cùng; không tự coi QA PASS là chấp thuận thiết kế hay tự đổi giao diện production.
