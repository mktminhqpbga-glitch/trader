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

## AC-02B — MapID đã kiểm chứng trực tiếp với Playwright CLI

Kiểm tra ngày **15/11/2026** bằng Playwright CLI 1.65.1, backend Bun SQLite test riêng. Dòng AC-02A phía trên là **lịch sử** của đợt đó; Image/Video đã được bật và kiểm chứng trong AC-02B. Các MapID sau đây được dùng chung giữa nhiều instance node; **`data-node-id` và `edge.id` là ID duy nhất, không lấy MapID làm khóa SQLite**.

| MapID | Vai trò và hành vi | File | Selector | Nghiệm thu thực tế |
|---|---|---|---|---|
| AC.CANVAS.ADD.NODE.TEXT | Menu thêm Text | `apps/web/src/App.vue` | `[data-map-id="AC.CANVAS.ADD.NODE.TEXT"]` | **PASS** — click thêm Text, hồi quy AC-02A |
| AC.CANVAS.ADD.NODE.IMAGE | Menu thêm Image | `apps/web/src/App.vue` | `[data-map-id="AC.CANVAS.ADD.NODE.IMAGE"]` | **PASS** — click thêm đúng loại, SQLite type=image |
| AC.CANVAS.ADD.NODE.VIDEO | Menu thêm Video | `apps/web/src/App.vue` | `[data-map-id="AC.CANVAS.ADD.NODE.VIDEO"]` | **PASS** — click thêm đúng loại, SQLite type=video |
| AC.TEXT.NODE | Text node instance | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.TEXT.NODE"]` | **PASS** — kéo, chọn, lưu/refresh |
| AC.TEXT.PROMPT | Prompt Text | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.TEXT.PROMPT"]` | **PASS** — nhập/khôi phục nguyên văn |
| AC.TEXT.OUTPUT | Cổng ra Text | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.TEXT.OUTPUT"]` | **PASS** — kéo Text→Image, Text→Video |
| AC.IMAGE.NODE | Image node instance | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.IMAGE.NODE"]` | **PASS** — kéo, lưu/refresh/restart và xóa có xác nhận |
| AC.IMAGE.PROMPT | Prompt Image | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.IMAGE.PROMPT"]` | **PASS** — nhập/SQLite/khôi phục |
| AC.IMAGE.INPUT | Cổng vào Image | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.IMAGE.INPUT"]` | **PASS** — kéo từ Text output |
| AC.IMAGE.OUTPUT | Cổng ra Image | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.IMAGE.OUTPUT"]` | **PASS** — kéo tới Video input |
| AC.VIDEO.NODE | Video node instance | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.VIDEO.NODE"]` | **PASS** — kéo, lưu/refresh/restart |
| AC.VIDEO.PROMPT | Prompt Video | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.VIDEO.PROMPT"]` | **PASS** — nhập/SQLite/khôi phục |
| AC.VIDEO.INPUT | Cổng vào Video | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.VIDEO.INPUT"]` | **PASS** — nhận từ Text/Image output |
| AC.CANVAS.CONNECT | Canvas chứa đồ thị/edge | `apps/web/src/App.vue` | `[data-map-id="AC.CANVAS.CONNECT"]` | **PASS** — kéo bằng chuột 3 cặp và khôi phục dây SVG |
| AC.CANVAS.EDGE.DELETE | Xóa dây đã chọn | `apps/web/src/App.vue` | `[data-map-id="AC.CANVAS.EDGE.DELETE"]` | **PASS** — click dây thật, chỉ xóa đúng một cạnh |
| AC.CANVAS.NODE.DELETE | Xóa node có xác nhận | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.CANVAS.NODE.DELETE"]` | **PASS** — xóa Image, gỡ dây liên quan, giữ dây khác |
| AC.CANVAS.CONNECT.ERROR | Thông báo nối sai/trùng | `apps/web/src/App.vue` | `[data-map-id="AC.CANVAS.CONNECT.ERROR"]` | **PASS** — kéo dây sai/trùng thấy cảnh báo, không tạo cạnh |
| AC.IMAGE.RESULT | Trạng thái ảnh | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.IMAGE.RESULT"]` | **PASS (UI)** — hiển thị `Chưa kết nối AI`, không giả ảnh |
| AC.VIDEO.RESULT | Trạng thái video | `apps/web/src/components/StudioNode.vue` | `[data-map-id="AC.VIDEO.RESULT"]` | **PASS (UI)** — hiển thị `Chưa kết nối AI`, không giả video |

Các mục `AC.CANVAS.SAVE.STATUS`, `.ERROR`, `.RETRY`, `.CONFLICT` vẫn dùng và hoạt động theo AC-02A; không tạo MapID làm thay đổi nodeId/edgeId. Tham chiếu kết quả gồm script `scripts/ac02b-browser-flow.js`, `scripts/ac02b-browser-restart.js` và [bảng nghiệm thu](acceptance.md).

## AC-02C — Project CRUD và thùng rác (kiểm thử Playwright 15/11/2026)

Các MapID này nằm trên frontend thật `apps/web/src/App.vue`; logic API/SQLite ở `apps/web/src/composables/useStudioState.ts` và `apps/server/src/index.ts`. MapID là định danh hành vi; các thành phần lặp theo dự án dùng thêm thuộc tính `[data-project-id]` để chỉ định instance. Đã thao tác **click/fill thật** và đọc SQLite trên database thử nghiệm riêng; không dùng MapID làm khóa dữ liệu.

| MapID | Chức năng | Selector thực tế | File nguồn | Trạng thái và bằng chứng |
|---|---|---|---|---|
| AC.HOME.PROJECT.MENU | Mở menu của từng thẻ dự án | `[data-map-id="AC.HOME.PROJECT.MENU"][data-project-id]` | `apps/web/src/App.vue` | **PASS** — click menu A/B không mở nhầm dự án |
| AC.HOME.PROJECT.RENAME | Bắt đầu đổi tên | `[data-map-id="AC.HOME.PROJECT.RENAME"][data-project-id]` | `apps/web/src/App.vue` | **PASS** — mở dialog đúng dự án |
| AC.HOME.PROJECT.RENAME.DIALOG | Hộp thoại đổi tên | `[data-map-id="AC.HOME.PROJECT.RENAME.DIALOG"]` | `apps/web/src/App.vue` | **PASS** — hiển thị nhập tên, báo lỗi API |
| AC.HOME.PROJECT.RENAME.NAME | Ô nhập tên mới | `[data-map-id="AC.HOME.PROJECT.RENAME.NAME"]` | `apps/web/src/App.vue` | **PASS** — fill input, PATCH thành công và refresh |
| AC.HOME.PROJECT.RENAME.CONFIRM | Xác nhận đổi tên | `[data-map-id="AC.HOME.PROJECT.RENAME.CONFIRM"]` | `apps/web/src/App.vue` | **PASS** — PATCH 200 mới cập nhật tên; PATCH 503 giữ tên cũ |
| AC.HOME.PROJECT.RENAME.CANCEL | Hủy đổi tên | `[data-map-id="AC.HOME.PROJECT.RENAME.CANCEL"]` | `apps/web/src/App.vue` | **PASS logic/UI** — không gọi PATCH khi hủy; backend test kiểm tra không gửi request |
| AC.HOME.PROJECT.DELETE | Bắt đầu xóa mềm | `[data-map-id="AC.HOME.PROJECT.DELETE"][data-project-id]` | `apps/web/src/App.vue` | **PASS** — mở dialog xác nhận |
| AC.HOME.PROJECT.DELETE.DIALOG | Hộp thoại xác nhận xóa | `[data-map-id="AC.HOME.PROJECT.DELETE.DIALOG"]` | `apps/web/src/App.vue` | **PASS** — cảnh báo có thể khôi phục |
| AC.HOME.PROJECT.DELETE.CONFIRM | Xác nhận xóa mềm | `[data-map-id="AC.HOME.PROJECT.DELETE.CONFIRM"]` | `apps/web/src/App.vue` | **PASS** — DELETE 200, A chỉ rời danh sách active khi ACK; DELETE 503 không rời |
| AC.HOME.PROJECT.DELETE.CANCEL | Hủy xóa dự án | `[data-map-id="AC.HOME.PROJECT.DELETE.CANCEL"]` | `apps/web/src/App.vue` | **PASS** — click Hủy không có DELETE network |
| AC.HOME.PROJECT.TRASH.TOGGLE | Mở/đóng danh sách đã xóa | `[data-map-id="AC.HOME.PROJECT.TRASH.TOGGLE"]` | `apps/web/src/App.vue` | **PASS** — bấm mở và tải từ GET `status=deleted` |
| AC.HOME.PROJECT.TRASH.LIST | Danh sách đã xóa mềm | `[data-map-id="AC.HOME.PROJECT.TRASH.LIST"]` | `apps/web/src/App.vue` | **PASS** — dự án đã xóa xuất hiện đúng ID |
| AC.HOME.PROJECT.TRASH.RETRY | Tải lại thùng rác nếu lỗi | `[data-map-id="AC.HOME.PROJECT.TRASH.RETRY"]` | `apps/web/src/App.vue` | **PASS** — Playwright mô phỏng GET 503, nút hiện, click retry sau khi mạng phục hồi, danh sách tải lại |
| AC.HOME.PROJECT.RESTORE | Khôi phục dự án | `[data-map-id="AC.HOME.PROJECT.RESTORE"][data-project-id]` | `apps/web/src/App.vue` | **PASS** — click POST 200, A trở lại với tên/Canvas/Node/Edge/viewport/revision nguyên trạng |

**Các MapID cũ không thay đổi.** AC-02C chạy lại kịch bản Playwright AC-02A/02B và test health AC-01; `AC.CANVAS.SAVE.CONFLICT` hiển thị thật khi PUT 409. Script và kết quả chi tiết ở [acceptance.md](acceptance.md).
