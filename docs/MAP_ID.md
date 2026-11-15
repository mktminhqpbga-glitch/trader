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

## UI-01 — MapID bố cục Studio mới (đã đối chiếu mã nguồn, **chưa nghiệm thu**)

Các ID sau được ghi lại từ mã Vue đang phát triển trên nhánh `feat/aiCanvasStudioFoundation`. **Trạng thái UI-01: PASS Playwright** cho shell/library, palette tìm kiếm, Inspector (sửa prompt, đóng), toolbar và panel toggle, với ảnh chụp thực tế. Bằng chứng và phạm vi cụ thể ở [acceptance.md](acceptance.md) và [evidence/ui01/README.md](evidence/ui01/README.md). Các mục AC-01/AC-02A/B/C phía trên giữ nguyên làm lịch sử nghiệm thu chức năng trước đợt đổi giao diện.

| MapID | Vai trò / hành động thực tế | Selector DOM | File chứa selector | Luồng kiểm tra UI-01 (chưa xác nhận PASS) |
|---|---|---|---|---|
| `AC.UI.TOPBAR` | Vỏ topbar: thương hiệu về Home, tên dự án, trạng thái health/save và nút lưu | `[data-map-id="AC.UI.TOPBAR"]` | `apps/web/src/App.vue` | Hiện ở cả Home/Canvas; không thay đổi khi pan/zoom |
| `AC.UI.LEFT.RAIL` | Rail công cụ bên trái: thư viện, tạo dự án, trở về Canvas, các nút roadmap bị vô hiệu hóa | `[data-map-id="AC.UI.LEFT.RAIL"]` | `apps/web/src/App.vue` | Rail có thể dùng để mở drawer khi có dự án |
| `AC.UI.PANEL.TOGGLE` | Nút rail `@click="toggleLibrary"`: bật/tắt `libraryOpen` và đóng palette khi có dự án; ở Home không toggle vì thư viện đang hiện | `[data-map-id="AC.UI.PANEL.TOGGLE"]` | `apps/web/src/App.vue` | Kiểm tra `aria-expanded` và mở/đóng drawer trong Canvas |
| `AC.UI.PROJECT.LIBRARY` | Component danh sách dự án dùng lại ở Home và trong `.canvasLibraryDrawer`: tìm tên, mở, tạo, menu đổi tên/xóa, thùng rác, khôi phục | `[data-map-id="AC.UI.PROJECT.LIBRARY"]` | `apps/web/src/components/ProjectLibrary.vue` (render từ `App.vue`) | Home: trong `[data-map-id="AC.HOME"]`; Canvas: xuất hiện khi mở drawer; `data-project-id` chỉ dự án cụ thể |
| `AC.UI.CANVAS.TOOLBAR` | Vỏ toolbar nổi của Canvas; chứa toolbar cũ `AC.CANVAS.TOOLBAR`, nút thu phóng, fit và thêm node | `[data-map-id="AC.UI.CANVAS.TOOLBAR"]` | `apps/web/src/App.vue` | Nằm ngoài transform node của Vue Flow, vẫn thấy khi zoom/pan |
| `AC.UI.NODE.PALETTE` | Dialog chọn loại node, hiển thị khi `showNodeMenu=true`, phát `create(type)` hoặc `close` | `[data-map-id="AC.UI.NODE.PALETTE"]` | `apps/web/src/components/NodePalette.vue` | Mở `AC.CANVAS.ADD.NODE`, chọn Text/Image/Video, đóng bằng nút X/Escape |
| `AC.UI.NODE.SEARCH` | Input `type=search` lọc ngay Text/Image/Video qua `query`, tự lấy focus sau khi palette mount | `[data-map-id="AC.UI.NODE.SEARCH"]` | `apps/web/src/components/NodePalette.vue` | Nhập loại node có/không có kết quả; không gọi API tìm kiếm |
| `AC.UI.INSPECTOR` | Panel thuộc tính của node đang chọn; render khi `selectedNode && !inspectorClosed`, chứa prompt, liên kết vào/ra, trạng thái lưu và thông tin kỹ thuật | `[data-map-id="AC.UI.INSPECTOR"][data-node-id]` | `apps/web/src/components/NodeInspector.vue` (render từ `App.vue`) | Click node mở đúng `data-node-id`; click nền bỏ chọn |
| `AC.UI.INSPECTOR.CLOSE` | Nút đóng panel, phát `close` về `App.vue` → `closeInspector()`, không xóa node hay nội dung | `[data-map-id="AC.UI.INSPECTOR.CLOSE"]` | `apps/web/src/components/NodeInspector.vue` | Click đóng; chọn lại node mở lại Inspector |
| `AC.UI.INSPECTOR.PROMPT` | Textarea thuộc tính có `data-node-id`, phát `update-prompt` cho `App.vue` cập nhật `node.data.content` | `[data-map-id="AC.UI.INSPECTOR.PROMPT"][data-node-id]` | `apps/web/src/components/NodeInspector.vue` | Sửa nội dung rồi đối chiếu prompt node và trạng thái lưu hiện hữu |
| `AC.UI.INSPECTOR.INPUTS` | Hiển thị số cạnh đi **vào** node khi node có cổng input (Image/Video) | `[data-map-id="AC.UI.INSPECTOR.INPUTS"]` | `apps/web/src/components/NodeInspector.vue` | Thêm/xóa edge đến node đã chọn để so khớp số lượng |
| `AC.UI.INSPECTOR.OUTPUTS` | Hiển thị số cạnh đi **ra** khi node có cổng output (Text/Image) | `[data-map-id="AC.UI.INSPECTOR.OUTPUTS"]` | `apps/web/src/components/NodeInspector.vue` | Thêm/xóa edge từ node đã chọn để so khớp số lượng |
| `AC.UI.INSPECTOR.SAVE.STATUS` | Hiển thị `saveStateText` từ luồng lưu Canvas hiện hữu, không phát sinh thao tác lưu riêng | `[data-map-id="AC.UI.INSPECTOR.SAVE.STATUS"]` | `apps/web/src/components/NodeInspector.vue` | Theo dõi trạng thái đang lưu/đã lưu/lỗi khi đổi prompt |
| `AC.UI.INSPECTOR.DETAILS` | `details` mở/đóng phần thông tin kỹ thuật, chứa Node ID thật | `[data-map-id="AC.UI.INSPECTOR.DETAILS"]` | `apps/web/src/components/NodeInspector.vue` | Mở thông tin, không thấy Node ID ở header node |
| `AC.UI.INSPECTOR.COPY.ID` | Sao chép ID node trong phần kỹ thuật qua `copyNodeId` | `[data-map-id="AC.UI.INSPECTOR.COPY.ID"]` | `apps/web/src/components/NodeInspector.vue` | Kiểm tra clipboard/thông báo lỗi hoặc thành công theo quyền trình duyệt |

**Định vị MapID AC-02 sau khi tách component (không đổi chính các ID):** các thao tác `AC.HOME.OPEN`, `AC.HOME.NEW`, `AC.HOME.PROJECT.MENU`, `AC.HOME.PROJECT.RENAME`, `AC.HOME.PROJECT.DELETE`, `AC.HOME.PROJECT.TRASH.TOGGLE`, `AC.HOME.PROJECT.TRASH.LIST`, `AC.HOME.PROJECT.TRASH.RETRY` và `AC.HOME.PROJECT.RESTORE` hiện render trong `ProjectLibrary.vue` rồi phát sự kiện cho `App.vue`; các dialog xác nhận vẫn nằm tại `App.vue`. Các nút `AC.CANVAS.ADD.NODE.TEXT`, `AC.CANVAS.ADD.NODE.IMAGE` và `AC.CANVAS.ADD.NODE.VIDEO` hiện render trong `NodePalette.vue`, thay vì markup menu trực tiếp trong `App.vue`. `AC.TEXT.NODE`, `AC.IMAGE.NODE`, `AC.VIDEO.NODE`, prompt, handles `input`/`output`, `AC.CANVAS.NODE.DELETE`, `AC.IMAGE.RESULT` và `AC.VIDEO.RESULT` vẫn do `StudioNode.vue` cung cấp. **Những file được ghi trong bảng AC-02 phía trên là dấu vết kiến trúc tại thời điểm nghiệm thu cũ**, không có nghĩa selector đã biến mất.

**Ranh giới giai đoạn:** `AC.UI.*` mô tả giao diện được viết bằng code, không xác nhận AI đã hoạt động. Các nút rail Kho tài sản, Storyboard, Camera Studio, Hậu kỳ, Hàng chờ và Cài đặt nâng cao hiện **disabled**, là roadmap, không có MapID chức năng hay backend tương ứng được nghiệm thu trong UI-01. Mọi phép kiểm thực tế, ảnh chụp và kết luận UI-01 thuộc trách nhiệm nhóm chính.

## UI-02 — MapID thiết kế lại media-first (Playwright kỹ thuật PASS, chờ chủ dự án duyệt thiết kế)

**Trạng thái được cập nhật theo quyết định chủ dự án:** UI-01 đã **PASS kỹ thuật/chức năng** nhưng **không được chủ dự án duyệt thẩm mỹ**. Các mục AC-01/02 và bảng UI-01 phía trên là lịch sử/contract, không bị xóa; các kết luận thiết kế cũ **không được hiểu là UI-01 được duyệt**. Phần UI-02 dưới đây đã **đối chiếu với template, handler thực tế và qua Playwright kỹ thuật PASS** (3 bộ UI-02, hồi quy AC-02A/B/C 9/9 và tương thích UI-01 2/2). **Chưa có duyệt visual từ chủ dự án**. Chỉ **chủ dự án** được xác nhận thẩm mỹ; Issue UI-02 **#4 vẫn mở**, chưa đóng bằng cập nhật tài liệu.

| MapID | DOM selector chính xác | File nguồn | Điều kiện hiện / hành động thật theo source | Trạng thái UI-02 |
|---|---|---|---|---|
| `AC.UI.NODE.ACTIONS` | `[data-map-id="AC.UI.NODE.ACTIONS"]` | `apps/web/src/components/StudioNode.vue` | Toolbar **nổi sát node**, `v-if="selected"`, chỉ chứa nút sửa và nút mở menu chức năng | Có trong code; **QA chờ** |
| `AC.UI.NODE.EDIT` | `[data-map-id="AC.UI.NODE.EDIT"]` | `StudioNode.vue` | Chỉ khi node được chọn; `@click="focusPrompt"`: mở rộng prompt nếu media, `nextTick` rồi focus textarea `data.content` thật | Có trong code; **QA chờ** |
| `AC.UI.NODE.CONTEXT.TOGGLE` | `[data-map-id="AC.UI.NODE.CONTEXT.TOGGLE"]` | `StudioNode.vue` | Nút tùy chọn trên toolbar nổi khi selected, `@click="toggleMenu"`; phản ánh `aria-expanded`, cùng menu với nút ba chấm trong header | Có trong code; **QA chờ** |
| `AC.UI.NODE.MENU.TOGGLE` | `[data-map-id="AC.UI.NODE.MENU.TOGGLE"]` | `StudioNode.vue` | Nút ba chấm trong `.nodeHeader.node-drag-handle`, luôn tồn tại trên node; click bật/tắt menu chứa chức năng thật, có `aria-controls`/`aria-expanded` | Có trong code; **QA chờ** |
| `AC.UI.NODE.MENU.EDIT` | `[data-map-id="AC.UI.NODE.MENU.EDIT"]` | `StudioNode.vue` | `role="menuitem"`, chỉ render khi `menuOpen`; click `focusPrompt` mở vùng media nếu cần và focus ô nhập hiện hữu | Có trong code; **QA chờ** |
| `AC.UI.NODE.PROMPT.EXPAND` | `[data-map-id="AC.UI.NODE.PROMPT.EXPAND"]` | `StudioNode.vue` | **Chỉ Image/Video**: nút click đổi `promptExpanded` / `aria-expanded`, mở khung nhiều dòng và focus; click lại thu gọn; `AC.IMAGE.PROMPT`/`AC.VIDEO.PROMPT` vẫn mount, hiển thị một dòng và editable khi thu gọn | Có trong code; **QA chờ** |
| `AC.UI.ROADMAP.TOGGLE` | `[data-map-id="AC.UI.ROADMAP.TOGGLE"]` | `apps/web/src/App.vue` | Nút SVG ba chấm riêng ở đáy rail, click `roadmapOpen = !roadmapOpen`; chỉ hiển thị chú thích các phần *sắp phát triển*, không gọi tính năng chưa có | Có trong code; **QA chờ** |
| `AC.UI.ROADMAP` | `[data-map-id="AC.UI.ROADMAP"]` | `App.vue` | `v-if="roadmapOpen"`, popover `role="note"` nêu Kho tài sản/Storyboard/Camera Studio/Hậu kỳ/Hàng chờ chưa có chức năng; không phải submenu điều hướng | Có trong code; **QA chờ** |
| `AC.UI.CANVAS.STAGE` | `[data-map-id="AC.UI.CANVAS.STAGE"]` | `App.vue` | `.canvasStage` bọc VueFlow, toolbar và thông báo; là sibling của `AC.UI.INSPECTOR` trên desktop, viewport pan chọn lọc khi node được chọn gần mép (giữ nguyên node ID/tọa độ) | Có trong code; **QA chờ** |
| `AC.UI.PROJECT.SEARCH` | `[data-map-id="AC.UI.PROJECT.SEARCH"]` | `apps/web/src/components/ProjectLibrary.vue` | `input type="search"`, `v-model="query"` lọc tên trên `filteredProjects` ở Home và drawer; không gọi API tìm kiếm | Có trong code; **QA chờ** |

**Các MapID cũ vẫn còn và được tái sử dụng trong UI-02:** `AC.UI.TOPBAR`, `AC.UI.LEFT.RAIL` là shell mới với `StudioIcon.vue` SVG; rail thực sự có **ba nút hành động** `AC.HOME.NEW` (tạo), `AC.UI.PANEL.TOGGLE` (mở/đóng thư viện), `AC.CANVAS.OPEN` (đóng drawer để về Canvas hiện tại); nút roadmap là **thông tin tách riêng**, không phải hành động thứ tư với tính năng giả. `AC.UI.CANVAS.TOOLBAR` bao `AC.CANVAS.TOOLBAR` và các nút zoom/fit/thêm node hoạt động; `AC.UI.NODE.PALETTE` và `AC.UI.NODE.SEARCH` chỉ tìm và chọn đúng Text/Image/Video qua `NodePalette.vue`. `AC.UI.PROJECT.LIBRARY` trong `ProjectLibrary.vue` nay dùng grid/card (và card thu nhỏ khi ở drawer), vẫn giữ `AC.HOME.OPEN`, các menu project, thùng rác và khôi phục AC-02C.

**Điểm đổi hành vi cần kiểm thử hồi quy:** `AC.CANVAS.NODE.DELETE` vẫn là selector/MapID chuẩn, **nhưng chỉ render khi menu node ba chấm đang mở**. Kiểm thử AC-02 cũ không thể click ngay nút xóa trên header: trước tiên dùng `[data-map-id="AC.IMAGE.NODE"] [data-map-id="AC.UI.NODE.MENU.TOGGLE"]` (hoặc node đích tương ứng), sau đó click `[data-map-id="AC.CANVAS.NODE.DELETE"]` trong chính node và xác nhận qua hộp thoại Element Plus. `AC.TEXT.PROMPT` là textarea một dòng tự giãn; `AC.IMAGE.PROMPT`/`AC.VIDEO.PROMPT` vẫn được mount/chỉnh sửa trực tiếp khi thu gọn nên `.fill()` hoặc `.inputValue()` vẫn có ý nghĩa. `AC.TEXT.OUTPUT`, `AC.IMAGE.INPUT`, `AC.IMAGE.OUTPUT`, `AC.VIDEO.INPUT`, `.node-drag-handle` và `data-node-id` không đổi; cổng vẫn có đúng `id="input"`/`id="output"`. `AC.IMAGE.RESULT`, `AC.VIDEO.RESULT` chỉ hiển thị **“Chưa có kết quả — Chưa kết nối AI”**.

**Inspector và viewport:** `AC.UI.INSPECTOR` vẫn có `AC.UI.INSPECTOR.CLOSE` và prompt/số kết nối/trạng thái lưu. Trong `App.vue`, khi `@node-click`, `handleNodeClick` chỉ dịch `getViewport() → setViewport()` nếu node vướng mép `AC.UI.CANVAS.STAGE` theo `getBoundingClientRect`; không gọi update tọa độ/ID node. CSS `apps/web/src/styles/studio-ui02.css` đặt Inspector thành cột sibling ở màn hình lớn nhưng chuyển sang overlay absolute ở màn hình nhỏ (tối đa 620px), cần QA responsive riêng. **Việc MapID có trong code không đồng nghĩa nút/luồng đã PASS browser**, và không có tuyên bố kết nối AI hoặc ảnh/video tạo thật.

## UI-02 Lệnh 1/5 — Preview A/B MapID (DEV/in-memory)

Các selector sau chỉ có trong preview khi query A/B đúng và `import.meta.env.DEV`. **Không thay MapID production hoặc database node/edge ID**; Playwright Chromium thực tế đã tương tác cả A/B:

| MapID trong `designPreview.vue` hoặc `designPreviewNode.vue` | Tác vụ thật ở preview |
|---|---|
| `AC.UI02.PREVIEW.ROOT`, `.MODE.A`, `.MODE.B`, `.SCENARIO`, `.MEDIA` | A/B, 3/7/empty node, DEMO/compact |
| `AC.UI02.PREVIEW.CANVAS`, `.STAGE`, `.FIT`, `.ZOOM.IN`, `.ZOOM.OUT` | VueFlow thực, 3/5 dây SVG, kéo node, pan/zoom/fit |
| `AC.UI02.PREVIEW.NODE.*`, `.NODE.PROMPT.EXPAND`, `.NODE.TOOLBAR` | Text/Image/Video, chọn, prompt, menu và toolbar |
| `AC.UI02.PREVIEW.INSPECTOR`, `.INSPECTOR.PROMPT`, `.INSPECTOR.CLOSE` | Inspector và nội dung đồng bộ, pan node sát mép phải |
| `AC.UI02.PREVIEW.PALETTE`, `.ADD.TEXT`, `.ADD.IMAGE`, `.ADD.VIDEO` | Tìm/Thêm node DEMO, Escape đóng |
| `AC.UI02.PREVIEW.LIBRARY`, `.PROJECT.OPEN`, `.PROJECT.NEW`, `.PROJECT.MENU`, `.PROJECT.RENAME`, `.PROJECT.DELETE`, `.PROJECT.RESTORE`, `.PROJECT.TRASH` | CRUD DEMO thuần bộ nhớ, reset reload |
| `AC.UI02.PREVIEW.SIMULATED.STATUS` | Màn hình mô phỏng offline/503/409, không gọi API |

Nguồn: `apps/web/src/designPreview/`, `scripts/ui02-design-preview-qa.js`, `docs/evidence/ui02/review-{A,B}/`. **Visual approval chưa có, Issue #4 OPEN.**

## UI-02 Lệnh 2/5 — MapID App Shell A/B DEV preview (QA kỹ thuật PASS, visual chưa duyệt)

Đây là **các selector mới có thật** trong `apps/web/src/designPreview/designPreview.vue`, style tại `designPreview.css`. Chúng thuộc `AC.UI02.PREVIEW.*` và chỉ xuất hiện khi DEV query `?designPreview=A|B` phù hợp; **không thay thế** các MapID AC-01/02/UI-01, cũng không phải nút thuộc `App.vue` production. Những trạng thái `DEMO`, offline, 503/409 hoặc media ở preview **không gọi API, SQLite hay AI**. **Prime đã xác nhận QA kỹ thuật Lệnh 2/5 PASS:** 40/40 PNG (20 A + 20 B), 5 viewport, 10 trường hợp, `apiCalls=0`, `pageErrors=0`; B mobile Inspector dock dưới không overlap. Đây là kết quả do prime thực hiện, không phải test mới của worker tài liệu; **duyệt visual vẫn chưa có**.

| MapID mới / bổ sung | Selector trong bản preview | File nguồn | Điều kiện và handler / ý nghĩa thực tế |
|---|---|---|---|
| `AC.UI02.PREVIEW.HEADER` | `[data-map-id="AC.UI02.PREVIEW.HEADER"]` | `designPreview.vue` | `header.previewTopbar` luôn có ở A/B, chứa `previewBrand` về thư viện mẫu (`openProjectLibrary`), `previewBreadcrumb` ghi Canvas Studio (A) / Scene Studio (B), `variantSwitch`, nhãn DEMO và nút Thư viện/Canvas (`toggleProjectLibrary`). |
| `AC.UI02.PREVIEW.DEMO.STATUS` | `[data-map-id="AC.UI02.PREVIEW.DEMO.STATUS"]` | `designPreview.vue` | `span.previewHeaderDemo` luôn hiện ở A/B, văn bản `DEMO`, tooltip xác nhận dữ liệu bộ nhớ, **chỉ hiển thị**, không phải trạng thái server/AI thật hoặc nút tương tác. |
| `AC.UI02.PREVIEW.DOCK` | `[data-map-id="AC.UI02.PREVIEW.DOCK"]` | `designPreview.vue` | `div.previewFloatDock[role="toolbar"]` **chỉ render khi `variant === 'A'` trong Canvas**, chứa nút `AC.UI02.PREVIEW.ADD` mở palette, `AC.UI02.PREVIEW.PROJECTS` mở library, `AC.UI02.PREVIEW.FIT.DOCK` và menu ba chấm; **B không có dock này**. |
| `AC.UI02.PREVIEW.DOCK.MORE` | `[data-map-id="AC.UI02.PREVIEW.DOCK.MORE"]` | `designPreview.vue` | `button.dockMore` trong dock A, `aria-haspopup="menu"`, `aria-expanded="dockMoreOpen"`; click `toggleDockMenu()` bật/tắt menu và đóng palette nếu bật menu. |
| `AC.UI02.PREVIEW.DOCK.MENU` | `[data-map-id="AC.UI02.PREVIEW.DOCK.MENU"]` | `designPreview.vue` | `div.previewDockMenu[role="menu"]` chỉ tồn tại khi `dockMoreOpen` (vì dock chỉ A nên chỉ A); nhấn Escape, click ngoài, chuyển variant đóng menu. |
| `AC.UI02.PREVIEW.DOCK.MENU.MEDIA` | `[data-map-id="AC.UI02.PREVIEW.DOCK.MENU.MEDIA"]` | `designPreview.vue` | Menu A đang mở; click `toggleDockMedia()`: `demo ↔ compact`, đóng menu, watcher cập nhật `node.data.demo` và gọi Fit. Chỉ đổi media **minh họa** trong preview. |
| `AC.UI02.PREVIEW.DOCK.MENU.SCENES` | `[data-map-id="AC.UI02.PREVIEW.DOCK.MENU.SCENES"]` | `designPreview.vue` | Menu A đang mở; click `showSevenScenes()` đặt `scenario='seven'`, đóng menu, watcher `applyScenario` dựng 7 node/5 edge của workflow DEMO; không tạo dữ liệu thật. |
| `AC.UI02.PREVIEW.DOCK.MENU.INSPECTOR` | `[data-map-id="AC.UI02.PREVIEW.DOCK.MENU.INSPECTOR"]` | `designPreview.vue` | **Có điều kiện kép:** dock A và menu đang mở **và** `selectedNodeId` khác null; click `openSelectedInspector()` mở Inspector của node đã chọn, đóng menu; khi chưa chọn node thì **không có mục** này. |
| `AC.UI02.PREVIEW.DOCK.MENU.VARIANT` | `[data-map-id="AC.UI02.PREVIEW.DOCK.MENU.VARIANT"]` | `designPreview.vue` | Menu A đang mở; click `selectVariant('B')` đóng menu, đổi class sang `.variantB`, cập nhật `?designPreview=B` bằng `history.replaceState`, gọi Fit; không gọi backend. |

**Fit và toolbar hiện hữu dùng chung:** `[data-map-id="AC.UI02.PREVIEW.FIT.DOCK"]` (nằm **chỉ** trong `AC.UI02.PREVIEW.DOCK` của A) và `[data-map-id="AC.UI02.PREVIEW.FIT"]` (thuộc `.previewCanvasToolbar` ở **cả A/B**) đều chạy `fitSoon()`, thực chất gọi `fitView({padding:0.2,maxZoom:1.05,duration:240})` trong VueFlow preview. Toolbar `AC.UI02.PREVIEW.TOOLBAR` vẫn có zoom ± và `AC.UI02.PREVIEW.ADD` mở cùng palette; khác nhau ở vị trí CSS: A ở mé trái dưới, B ở giữa dưới. Điều khiển chọn A/B trong header là các ID cũ `AC.UI02.PREVIEW.MODE.A` / `AC.UI02.PREVIEW.MODE.B` với `aria-pressed`.

**Hai cách bố trí riêng biệt:** A (`.variantA`) dùng Canvas full-bleed tối/tím, dock dọc và Inspector **overlay**; B (`.variantB`) dùng workspace **grid** với scene rail trái, Canvas giữa, shot strip phía dưới và Inspector ở cột riêng. Ở màn hình nhỏ B đổi scene rail thành danh sách ngang và Inspector thành bảng dưới; A chuyển dock xuống góc trái dưới. Các thay đổi là CSS/logic preview, **không phải chức năng production**. Dữ liệu và trạng thái chỉ trong bộ nhớ; preview không phát sinh cuộc gọi lưu hoặc AI. **QA kỹ thuật Lệnh 2/5 đã được prime xác nhận PASS; không có phê duyệt thẩm mỹ từ chủ dự án và Issue UI-02 #4 phải tiếp tục mở.**

## UI-02 Lệnh 3/5 — MapID các node Text/Image/Video DEMO (QA kỹ thuật PASS, chờ duyệt visual)

Các selector bên dưới được **đối chiếu trực tiếp** với `apps/web/src/designPreview/designPreviewNode.vue`, `designPreview.vue` và `designPreview.css` hiện tại. Chúng chỉ xuất hiện trong **DEV design preview A/B**, độc lập với `AC.TEXT/IMAGE/VIDEO.*` của production; node, edge, prompt và kết quả media **chỉ là dữ liệu thử trong bộ nhớ, không gửi API/SQLite/AI**. Bảng giữ nguyên mọi lịch sử MapID ở trên.

| MapID | Selector thực tế | Nơi tạo | Điều kiện / hành động đúng theo code |
|---|---|---|---|
| `AC.UI02.PREVIEW.NODE.TEXT` | `[data-map-id="AC.UI02.PREVIEW.NODE.TEXT"][data-preview-node]` | `designPreviewNode.vue` | `article.previewNode.type-text` khi `type=text`: note sáng tạo 274px A / 286px B, không có khung media. |
| `AC.UI02.PREVIEW.NODE.IMAGE` | `[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE"][data-preview-node]` | `designPreviewNode.vue` | `article.previewNode.type-image` gồm media-first DEMO (nếu `data.demo`) hoặc prompt/status compact; card 345px. |
| `AC.UI02.PREVIEW.NODE.VIDEO` | `[data-map-id="AC.UI02.PREVIEW.NODE.VIDEO"][data-preview-node]` | `designPreviewNode.vue` | `article.previewNode.type-video`, có trình phát DEMO HTML5 khi `data.demo`; 375px A / 365px B. |
| `AC.UI02.PREVIEW.NODE.HEADER` | `[data-map-id="AC.UI02.PREVIEW.NODE.HEADER"]` | `designPreviewNode.vue` | `header.previewNodeHeader.node-drag-handle` luôn hiện trên cả ba loại; đây là vùng kéo node, khác với textarea `nodrag nowheel`. |
| `AC.UI02.PREVIEW.NODE.TEXT.INPUT` | `[data-map-id="AC.UI02.PREVIEW.NODE.TEXT.INPUT"]` | `designPreviewNode.vue` | Text `textarea v-model="prompt"` luôn mount, `resizeText()` auto-grow theo scrollHeight (68–170px, tối đa 320px khi `expanded`); cập nhật `data.prompt` của node DEMO. |
| `AC.UI02.PREVIEW.NODE.PROMPT.EXPAND` | `[data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EXPAND"]` | `designPreviewNode.vue` | **Cả ba loại** đều có nút mở rộng: Text thay giới hạn chiều cao; Image/Video `toggleExpand()` mở/đóng textarea bằng `v-show`. `aria-expanded` phản ánh `expanded`. |
| `AC.UI02.PREVIEW.NODE.PROMPT.EDIT` | `[data-map-id="AC.UI02.PREVIEW.NODE.PROMPT.EDIT"]` | `designPreviewNode.vue` | Nút summary **chỉ ở Image/Video khi `!expanded`**; click `focusPrompt()` mở editor media và focus ô nhập, không gửi tác vụ AI. |
| `AC.UI02.PREVIEW.NODE.MEDIA.INPUT` | `[data-map-id="AC.UI02.PREVIEW.NODE.MEDIA.INPUT"]` | `designPreviewNode.vue` | Textarea Image/Video (`v-show="expanded"`) vẫn trong DOM nhưng **không hiển thị khi thu gọn**; `v-model="prompt"`, `updateNodeData(props.id,{prompt})`, chỉnh sửa/resize vertical khi mở. |
| `AC.UI02.PREVIEW.NODE.TOOLBAR` | `[data-map-id="AC.UI02.PREVIEW.NODE.TOOLBAR"]` | `designPreviewNode.vue` | `.previewContextToolbar[role=toolbar]` chỉ hiện khi node được chọn (`v-if="selected"`), nằm nổi cạnh thẻ; ba hành động **N01/N02/N03** dưới đây, không có nút giả. |
| `AC.UI02.PREVIEW.NODE.EDIT` | `[data-map-id="AC.UI02.PREVIEW.NODE.EDIT"]` | `designPreviewNode.vue` | **N01**, nút toolbar được chọn: gọi `focusPrompt()`, mở media nếu cần, focus editor; Text giữ hành vi ghi chú. |
| `AC.UI02.PREVIEW.NODE.INSPECT` | `[data-map-id="AC.UI02.PREVIEW.NODE.INSPECT"]` | `designPreviewNode.vue` | **N02**, nút toolbar được chọn: phát `inspect(id)` đến `designPreview.vue:openInspector(id)`, panel sửa `selectedPrompt` cùng dữ liệu node. |
| `AC.UI02.PREVIEW.NODE.MENU.TOGGLE` | `[data-map-id="AC.UI02.PREVIEW.NODE.MENU.TOGGLE"]` | `designPreviewNode.vue` | **N03**: nút mở menu trong toolbar **khi selected** và nút ba chấm trong header **luôn hiện**, do đó một node được chọn có **2 phần tử cùng MapID**. Cả hai `toggleMenu()`, `aria-expanded=menuOpen`. Khi viết QA phải scope vào toolbar hoặc header. |
| `AC.UI02.PREVIEW.NODE.MENU` | `[data-map-id="AC.UI02.PREVIEW.NODE.MENU"]` | `designPreviewNode.vue` | Menu `role=menu` chỉ render nếu `menuOpen`; Escape, click ngoài hoặc bỏ chọn đóng. |
| `AC.UI02.PREVIEW.NODE.MENU.EDIT` | `[data-map-id="AC.UI02.PREVIEW.NODE.MENU.EDIT"]` | `designPreviewNode.vue` | Menuitem **chỉnh sửa prompt** gọi `focusPrompt()`, menu đóng và editor được focus. |
| `AC.UI02.PREVIEW.NODE.MENU.INSPECT` | `[data-map-id="AC.UI02.PREVIEW.NODE.MENU.INSPECT"]` | `designPreviewNode.vue` | Menuitem **mở Inspector** phát `inspect(id)`, không đổi node ID/vị trí. |
| `AC.UI02.PREVIEW.NODE.MENU.DELETE` | `[data-map-id="AC.UI02.PREVIEW.NODE.MENU.DELETE"]` | `designPreviewNode.vue` → `designPreview.vue` | Menuitem **xóa node DEMO**: phát `delete(id)` → `requestDelete('node',id)` → native `<dialog>`; xác nhận `AC.UI02.PREVIEW.DELETE.CONFIRM` mới lọc node và các edge liên quan trong bộ nhớ; Hủy không xóa. |
| `AC.UI02.PREVIEW.NODE.IMAGE.OPEN` | `[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.OPEN"]` | `designPreviewNode.vue` | Chỉ Image `data.demo=true`: nút chứa ảnh SVG `data.poster`, click gọi `openImage()` → `imageDialog.showModal()`; không giả tác vụ tạo ảnh. |
| `AC.UI02.PREVIEW.NODE.IMAGE.DIALOG` | `[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.DIALOG"]` | `designPreviewNode.vue` | Native `<dialog>` dành cho Image, tồn tại theo `v-if="type==='image'"`, chỉ `showModal()` nếu DEMO; hiển thị ảnh bằng `object-fit:contain` và chú thích nguồn DEMO. |
| `AC.UI02.PREVIEW.NODE.IMAGE.CLOSE` | `[data-map-id="AC.UI02.PREVIEW.NODE.IMAGE.CLOSE"]` | `designPreviewNode.vue` | Nút đóng trong dialog gọi `imageDialog.close()`; click đúng backdrop cũng đóng. Native dialog có xử lý Escape của trình duyệt. |
| `AC.UI02.PREVIEW.NODE.VIDEO.PLAYER` | `[data-map-id="AC.UI02.PREVIEW.NODE.VIDEO.PLAYER"]` | `designPreviewNode.vue` | Chỉ Video `data.demo=true`: **native `<video controls playsinline muted preload="metadata">`**, nguồn local `/designPreview/flower-cc0.webm` (clip CC0), poster DEMO; **runtime play/pause PASS theo prime** (A: `0→0.842s`, B: `0→1.027s`, sau đó `paused=true`). |

**Tỷ lệ ảnh là dữ liệu UI, không phải MapID điều khiển:** Image DEMO có `.previewImageMedia[data-aspect="1:1"|"16:9"|"9:16"]` (giá trị từ `data.aspectRatio`; ba node mẫu trong `designPreview.vue` lần lượt thể hiện **16:9 / 9:16 / 1:1**). CSS thiết lập `aspect-ratio` theo giá trị và `object-fit:contain; object-position:center` để **không crop** ảnh minh họa; Video cố định `16:9`. Chế độ `compact` bỏ vùng `v-if="data.demo"`, chỉ giữ prompt và dòng **“Chưa có ảnh/video · Chưa kết nối AI”** (không có ảnh/video AI thật).

**Handle không có MapID riêng:** `designPreviewNode.vue` gắn VueFlow `Handle[id="input"][type=target]` **chỉ** ở Image/Video và `Handle[id="output"][type=source]` **chỉ** ở Text/Image, với class `.previewHandle.previewInput` và `.previewHandle.previewOutput`. `designPreview.vue:isValidConnection()` yêu cầu `sourceHandle === "output"`, `targetHandle === "input"`, cấm tự nối/trùng và chỉ cho phép **Text→Image, Text→Video, Image→Video**; khi hydrate cạnh cũ thì bỏ qua đúng `edge.id` của cạnh đang xét. `onConnect()` tạo `sourceHandle:"output"`/`targetHandle:"input"` trong mảng cạnh preview, không lưu backend.

**Selection/pane:** `@nodeClick` gọi `focusScene(node.id,false)` — chỉ chọn node và mở toolbar N01/N02/N03, **không tự mở Inspector**. `AC.UI02.PREVIEW.NODE.INSPECT` hoặc scene navigation sẽ gọi Inspector; `@paneClick="onPaneClick"` đóng palette/dock menu, xóa `selectedNodeId`, đóng Inspector và đặt `selected:false` cho tất cả node, toolbar biến mất. Các chức năng thuộc **DEV preview/in-memory**; không được đánh đồng với các MapID production phía trên.

**Tình trạng Lệnh 3/5 — QA kỹ thuật PASS do prime xác nhận:** Browser Node QA `exit 0`, **20/20 PNG A/B (1440px)**, edge SVG thật **3/3 và 7/5**, kiểm tra handle/kéo node, nối sai hoặc trùng bị từ chối, menu/xóa, ảnh `contain` đủ tỷ lệ **1:1/16:9/9:16**, HTML5 CC0 video **Play → Pause thật** (A `0→0.842s`, B `0→1.027s`, sau Pause `paused=true`), **0 API calls / 0 JavaScript page errors**. Hồi quy baseline preview **64/64 PASS**; Bun full install/typecheck/build và server tests **10/10 với 282 expects PASS**, tất cả theo báo cáo nhóm chính. Worker tài liệu không chạy lại test/browser và không thay production code. **Visual approval vẫn PENDING, chỉ chủ dự án quyết định; Issue UI-02 #4 OPEN**. Không ghi nhận hay triển khai Lệnh 4/5 ở đây.
