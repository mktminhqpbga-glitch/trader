# Bảng MapID — AC-01

| MapID | Tên | Hành vi | File | Selector | Trạng thái | Cách xác minh |
|---|---|---|---|---|---|---|
| AC.APP | Khung ứng dụng | Hiển thị Web độc lập | apps/web/src/App.vue | [data-map-id="AC.APP"] | HTTP đã kiểm tra; DOM chưa kiểm thử | Mở URL Web và kiểm tra DOM |
| AC.HOME | Trang nền tảng | Giới thiệu tình trạng xây dựng | apps/web/src/App.vue | [data-map-id="AC.HOME"] | HTTP đã kiểm tra; DOM chưa kiểm thử | Kiểm tra DOM |
| AC.SYSTEM.HEALTH | Bảng kết nối | Hiển thị kết quả GET health thật | apps/web/src/App.vue | [data-map-id="AC.SYSTEM.HEALTH"] | API đã kiểm tra; DOM chưa kiểm thử | Bật/tắt API |
| AC.SYSTEM.HEALTH.RETRY | Kiểm tra lại | Gửi GET /api/health mỗi lần bấm | apps/web/src/App.vue | [data-map-id="AC.SYSTEM.HEALTH.RETRY"] | Mã nguồn đã kiểm tra; thao tác DOM chưa kiểm thử | Bấm và xem Network |

**Quy ước:** MapID khác với API ID, taskId, nodeId, tabId. Các thành phần Canvas/node chưa xuất hiện không được đánh dấu hoàn thành.

## AC-02A — MapID trên giao diện Canvas

Kiểm tra Playwright CLI ngày 14/11/2026 trên Canvas Vue Flow chạy thật; dữ liệu đối chứng và kết quả SQLite ở [acceptance.md](acceptance.md). ID dùng chung cho mọi instance node, còn `data-node-id` riêng xác định node cụ thể.

| MapID | Tên | Chức năng | File nguồn | Selector | Trạng thái | Kiểm chứng |
|---|---|---|---|---|---|---|
| AC.HOME.NEW | Tạo dự án | Mở hộp thoại đặt tên dự án | apps/web/src/App.vue | `[data-map-id="AC.HOME.NEW"]` | PASS AC-02A | Click → nhập tên → POST 201 |
| AC.HOME.PROJECTS | Danh sách dự án | Danh sách và điều hướng về trang chủ | apps/web/src/App.vue | `[data-map-id="AC.HOME.PROJECTS"]` | PASS AC-02A | Tạo A, B, GET danh sách |
| AC.HOME.OPEN | Mở dự án | Nạp dữ liệu Canvas đúng ID | apps/web/src/App.vue | `[data-map-id="AC.HOME.OPEN"]` | PASS AC-02A | Chuyển A → B → A |
| AC.CANVAS | Workspace | Canvas vô hạn Vue Flow | apps/web/src/App.vue | `[data-map-id="AC.CANVAS"]` | PASS AC-02A | Pan và kéo node thực |
| AC.CANVAS.TOOLBAR | Thanh công cụ | Nhóm nút cố định trên màn hình | apps/web/src/App.vue | `[data-map-id="AC.CANVAS.TOOLBAR"]` | PASS AC-02A | So sánh kích thước trước/sau zoom |
| AC.CANVAS.ADD.NODE | Thêm node | Mở menu tạo Text Node | apps/web/src/App.vue | `[data-map-id="AC.CANVAS.ADD.NODE"]` | PASS AC-02A | Click → Text Node xuất hiện |
| AC.CANVAS.ZOOM.IN | Phóng to | Tăng tỷ lệ Canvas | apps/web/src/App.vue | `[data-map-id="AC.CANVAS.ZOOM.IN"]` | PASS AC-02A | So sánh transform Vue Flow |
| AC.CANVAS.ZOOM.OUT | Thu nhỏ | Giảm tỷ lệ Canvas | apps/web/src/App.vue | `[data-map-id="AC.CANVAS.ZOOM.OUT"]` | PASS AC-02A | Zoom out sau zoom in |
| AC.CANVAS.FIT | Vừa khung | Fit toàn bộ node trong viewport | apps/web/src/App.vue | `[data-map-id="AC.CANVAS.FIT"]` | PASS AC-02A | Click, chờ animation và đọc transform |
| AC.CANVAS.CONNECT | Container đồ thị | Chứa Canvas Vue Flow | apps/web/src/App.vue | `[data-map-id="AC.CANVAS.CONNECT"]` | PASS container; nối dây hoãn | Kiểm tra DOM của workspace |
| AC.CANVAS.SAVE | Lưu Canvas | Ghi nội dung và viewport vào SQLite, retry | apps/web/src/App.vue | `[data-map-id="AC.CANVAS.SAVE"]` | PASS AC-02A | Chờ PUT 200, SQLite revision và refresh |
| AC.TEXT.NODE | Node văn bản | Node dữ liệu text, kéo/chọn/xóa | apps/web/src/components/StudioNode.vue | `[data-map-id="AC.TEXT.NODE"]` | PASS AC-02A | Thêm, kéo, click xóa và xác nhận SQLite nodes=[] |
| AC.TEXT.PROMPT | Nội dung text | Chỉnh sửa và lưu văn bản | apps/web/src/components/StudioNode.vue | `[data-map-id="AC.TEXT.PROMPT"]` | PASS AC-02A | Điền Kiem thu du an A và refresh |
| AC.IMAGE.NODE | Node hình ảnh | Node soạn prompt ảnh (tương thích dữ liệu cũ) | apps/web/src/components/StudioNode.vue | `[data-map-id="AC.IMAGE.NODE"]` | Chưa bật AC-02A | Bổ sung kiểm thử ở AC-02 tiếp theo |
| AC.IMAGE.PROMPT | Prompt ảnh | Chỉnh sửa và lưu prompt ảnh (tương thích dữ liệu cũ) | apps/web/src/components/StudioNode.vue | `[data-map-id="AC.IMAGE.PROMPT"]` | Chưa bật AC-02A | Bổ sung kiểm thử ở AC-02 tiếp theo |
| AC.VIDEO.NODE | Node video | Node soạn prompt video (tương thích dữ liệu cũ) | apps/web/src/components/StudioNode.vue | `[data-map-id="AC.VIDEO.NODE"]` | Chưa bật AC-02A | Bổ sung kiểm thử ở AC-02 tiếp theo |
| AC.VIDEO.PROMPT | Prompt video | Chỉnh sửa và lưu prompt video (tương thích dữ liệu cũ) | apps/web/src/components/StudioNode.vue | `[data-map-id="AC.VIDEO.PROMPT"]` | Chưa bật AC-02A | Bổ sung kiểm thử ở AC-02 tiếp theo |

MapID bổ sung đang hoạt động AC-02A: `AC.HOME.NEW.DIALOG`, `AC.HOME.NEW.NAME`, `AC.HOME.NEW.CREATE`, `AC.HOME.NEW.CANCEL`, `AC.CANVAS.ADD.NODE.TEXT`, `AC.CANVAS.SAVE.STATUS`, `AC.CANVAS.SAVE.ERROR`, `AC.CANVAS.SAVE.RETRY`, `AC.CANVAS.SAVE.CONFLICT`. Các MapID của Image/Video chỉ dành cho tương thích và chưa xuất hiện trong menu AC-02A. Nhận diện node riêng bằng `[data-node-id]`, API dùng ID trong bảng API; tuyệt đối không lấy MapID làm khóa SQLite.
