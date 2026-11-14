# AC-01 — Kiến trúc nền tảng

Ứng dụng AI Canvas Studio được viết mới hoàn toàn trong repository `trader`, không sao chép logic ToonFlow.

```text
Trình duyệt → Vue 3/Vite (127.0.0.1:5173)
                ↓ proxy /api
           Bun HTTP (127.0.0.1:3101)
                ↓ bun:sqlite
           SQLite local (data/studio.sqlite)
```

- `apps/web`: Vue 3, TypeScript, Element Plus và Vue Flow. Trong lịch sử AC-01 Canvas chưa hiện thực; hiện Canvas thật đã qua nghiệm thu AC-02A.
- `apps/server`: Bun và SQLite nội bộ, `GET /api/health` truy vấn DB thật.
- `data/`: nằm ngoài public và bị Git ignore, đường dẫn có thể đổi bằng `AC_DB_PATH`.
- Chỉ bind loopback; không cung cấp server công khai hoặc mở CORS tùy ý.
- **Tại thời điểm AC-01:** project CRUD, Canvas vô hạn và node chưa triển khai. Hiện AC-02A đã nghiệm thu Project/Canvas/Text/SQLite; AC-02B mở rộng Image/Video và workflow, không bao gồm task manager, AI, extension hoặc desktop.

## AC-02A — Kiến trúc Canvas và lưu dữ liệu (đã kiểm chứng)

AC-02 mở rộng ứng dụng hiện hữu:

```text
Trang dự án (apps/web/src/App.vue)
    │ GET/POST /api/projects
    └── Workspace → @vue-flow/core → StudioNode.vue
         │ Text Node, viewport (edge schema giữ tương thích)
         │ autosave có phiên bản (revision)
         ▼
     PUT /api/projects/:projectId/canvas
         │ expected revision, transaction, kiểm tra 409
         ▼
  Bun HTTP → bun:sqlite → projects, canvases, canvas_nodes, canvas_edges
```

- Mỗi dự án có một Canvas được tạo trong cùng transaction khi tạo dự án; node/edge gắn riêng theo Canvas. SQLite giữ nguyên `schemaVersion` cũ và chỉ migration tăng phiên bản.
- Bản ghi Canvas mang `revision` bắt đầu từ 0, mỗi PUT hợp lệ tăng đúng 1. Backend từ chối bản ghi cũ với HTTP 409 để bảo vệ dữ liệu mới. Client chỉ hiển thị **Đã lưu** sau khi nhận xác nhận cho phiên bản nội dung tương ứng.
- Node có `nodeId` riêng duy nhất, loại Text được bật ở AC-02A, vị trí và nội dung. Schema vẫn tương thích các giá trị `text | image | video` và edge cũ để không làm mất dữ liệu của bản đang phát triển; chức năng tạo Image/Video được để cho phần tiếp theo của AC-02. Viewport lưu `x/y/zoom`. MapID xác định **chức năng giao diện**, không phải khóa dữ liệu node.
- Thanh công cụ và trạng thái lưu nằm ngoài biến đổi zoom của Vue Flow; node/prompt và dây kết nối nằm trong mặt phẳng Canvas.
- Dữ liệu thử nghiệm AC-02A dùng `AC_DB_PATH` riêng và chạy `bun run dev` với `AC_PORT=3112`, `AC_WEB_PORT=5182`, `AC_WEB_ORIGIN=http://127.0.0.1:5182`. Cả Web và API đều bind loopback.
- POST Canvas là thao tác idempotent: tạo dự án đã tự tạo Canvas, POST trở lại trả đúng Canvas ID cũ; với project đời trước thiếu Canvas mới bổ sung trong transaction.
- Chỉ có Text Node được bật trong UI AC-02A. Chưa tích hợp AI, tạo hình, video hoặc adapter.

Các bảng API, MapID và kết quả chạy thực tế được ghi riêng tại [API_ID.md](API_ID.md), [MAP_ID.md](MAP_ID.md), [acceptance.md](acceptance.md). Phần AC-01 ở trên được giữ làm lịch sử kiến trúc ban đầu.

## AC-02B — Cấu trúc node và kết nối workflow (cùng Canvas/SQLite AC-02A)

AC-02B **không tạo lưu trữ mới, không đổi loại cơ sở dữ liệu và không kết nối AI**. Thành phần `StudioNode.vue` dùng chung cho ba loại; `useStudioState.ts` tiếp tục điều phối `VueFlow`, autosave có `revision` và trạng thái lưu. Khu vực Image/Video chỉ cho nhập prompt và hiển thị chưa có kết quả, không tạo media giả.

```text
Text Node   [output] ───────────────→ [input] Image Node [output]
      │                                         │
      └──────────────→ [input] Video Node ←─────┘

Vue Flow mouse drag → kiểm tra client → edges[] → snapshot PUT
                       ↘ phản hồi rõ khi sai          │
                     Bun validation: node/handle/type/duplicate/self-loop
                                                  │
                        transaction SQLite: canvases.revision + nodes + edges + viewport
```

- Quy tắc hợp lệ duy nhất: `text→image`, `text→video`, `image→video`; nguồn là cổng `output`, đích là `input`. `text` không có input, `video` không có output.
- Node ID và Edge ID là khóa duy nhất của **instance**; các `data-map-id` là ID chức năng chung cho nhiều instance, không phải khóa database. Edge lưu `source`, `target`, `sourceHandle`, `targetHandle` trong `canvas_edges`.
- Backend phải kiểm tra payload toàn diện *trước khi* ghi và từ chối toàn snapshot nếu sai (400); `revision` mismatch trả 409; SQLite giữ dữ liệu đã hợp lệ. Các edge lịch sử hợp lệ với `sourceHandle=null` vẫn được đọc/ghi theo quy tắc tương thích, không xoá khi migration.
- Nghiệm thu gồm kéo cổng thực qua Playwright, truy vấn SQLite, refresh, restart, API negative tests, delete edge/node và hồi quy AC-02A; trạng thái PASS/NOT TESTED theo bằng chứng trong [acceptance.md](acceptance.md).

## AC-02C — Project CRUD, xóa mềm và kiểm toán AC-02

Phần Project được mở rộng **trên SQLite và Canvas đã tồn tại**, không xây dựng lại Vue Flow hay thay đổi API AC-02A/B. Bổ sung trạng thái xóa mềm `projects.deletedAt` nullable bằng migration giao dịch từ schema v3 lên v4; tất cả dự án cũ mặc định đang hoạt động, giữ nguyên ID, node, cạnh, prompt và revision. `DELETE` chỉ đánh dấu bản ghi, không xóa project/canvas/node/edge khỏi SQLite. UI có danh sách đang hoạt động và mục đã xóa mềm để khôi phục.

```text
Sidebar project card ── đổi tên ── PATCH /api/projects/:id ──→ projects.name, updatedAt
                   ├─ xóa mềm ── DELETE /api/projects/:id ─→ projects.deletedAt
                   └─ Thùng rác ─ GET /api/projects?status=deleted
                                           └─ khôi phục ─ POST /api/projects/:id/restore

Canvas GET/PUT hiện hữu ── không can thiệp project đã xóa mềm
                       └─ restore: Canvas ID/revision/node/edge giữ nguyên
```

- Đổi tên và xóa đều thực hiện sau khi người dùng tương tác, xác thực đầu vào và nhận ACK thành công; lỗi API không được thay tên hoặc báo thành công giả. Hộp thoại xác nhận xóa có nút Hủy thực sự.
- Không có chức năng xóa vĩnh viễn. Phục hồi dự án là thao tác đảo trạng thái `deletedAt` về `NULL`; bảo vệ các dự án khác, không làm đổi Canvas snapshot.
- Nghiệm thu dùng database riêng, kiểm tra A/B, refresh/restart, lỗi mạng/API, xác thực MapID, unit tests backend và Playwright kéo dây thật. Bằng chứng và trạng thái kết luận được ghi trong [acceptance.md](acceptance.md).

## UI-01 — App Shell và bố cục Studio (đã kiểm thử và nghiệm thu UI)

UI-01 thay đổi **bố cục frontend hiện có**, không tạo một backend mới, không đổi hợp đồng dữ liệu AC-02A/B/C và không thay SQLite. Mục tiêu thiết kế tham khảo giao diện ứng dụng sáng tạo AI kiểu LibTV; các thành phần dưới đây đã được triển khai và đối chiếu bằng Playwright thật ở bốn kích thước; hồi quy AC-02A/B/C, 409/503, dữ liệu SQLite qua refresh/restart đều PASS. Bằng chứng và giới hạn ở [acceptance.md](acceptance.md) và `progressReport.html`.

```text
apps/web/src/App.vue                       AC.APP
├─ Topbar                                   AC.UI.TOPBAR
│  ├─ thương hiệu → thư viện                AC.HOME.PROJECTS
│  ├─ tên dự án / trạng thái lưu Canvas     AC.CANVAS.SAVE.STATUS
│  └─ health, retry, lưu Canvas             AC.SYSTEM.HEALTH, AC.SYSTEM.HEALTH.RETRY, AC.CANVAS.SAVE
└─ App body
   ├─ Left tool rail                        AC.UI.LEFT.RAIL
   │  ├─ bật/tắt thư viện dự án              AC.UI.PANEL.TOGGLE
   │  ├─ tạo dự án                          AC.HOME.NEW
   │  └─ về Canvas hiện tại                 AC.CANVAS.OPEN
   ├─ Khi chưa chọn dự án: Home AC.HOME
   │  └─ ProjectLibrary.vue                 AC.UI.PROJECT.LIBRARY
   └─ Khi có dự án: Canvas AC.CANVAS
      └─ Canvas viewport / Vue Flow         AC.CANVAS.CONNECT
         ├─ toolbar nổi                     AC.UI.CANVAS.TOOLBAR
         │  ├─ zoom/fit                     AC.CANVAS.ZOOM.IN/OUT, AC.CANVAS.FIT
         │  └─ thêm node                    AC.CANVAS.ADD.NODE
         │     └─ NodePalette.vue           AC.UI.NODE.PALETTE
         │        └─ tìm Text/Image/Video  AC.UI.NODE.SEARCH
         ├─ StudioNode.vue                  AC.TEXT.NODE, AC.IMAGE.NODE, AC.VIDEO.NODE
         │  └─ prompt, cổng input/output, trạng thái kết quả (chưa có AI)
         ├─ NodeInspector.vue (khi chọn)    AC.UI.INSPECTOR
         │  └─ đóng bảng                    AC.UI.INSPECTOR.CLOSE
         └─ drawer thư viện (khi mở)        AC.UI.PROJECT.LIBRARY
            └─ ProjectLibrary.vue (dùng lại, không sao dữ liệu)
```

### Thành phần, trạng thái và hành vi đã kiểm thử

| Thành phần | File / CSS | Trách nhiệm và tín hiệu |
|---|---|---|
| App Shell, topbar, rail | `apps/web/src/App.vue`, `apps/web/src/styles/studio.css` | Hiển thị thương hiệu, tên dự án, kết nối API, nút lưu; rail chứa hành động đã hoạt động và nút **disabled** cho tính năng giai đoạn sau. Nút mở thư viện `AC.UI.PANEL.TOGGLE` gọi `toggleLibrary()` khi đã có dự án; trong Home thư viện hiển thị sẵn. |
| Thư viện / drawer | `apps/web/src/components/ProjectLibrary.vue`, chủ sở hữu trạng thái `App.vue` | Cùng một component xuất hiện ở Home hoặc drawer bên Canvas; tìm dự án theo tên ngay trên frontend, phát sự kiện tạo/mở/đổi tên/xóa mềm/mở thùng rác/khôi phục. Drawer mở bằng `libraryOpen`, đóng bằng nút Đóng thư viện hoặc Escape; `useStudioState.ts` thực hiện API AC-02C. |
| Canvas / toolbar | `apps/web/src/App.vue`, `apps/web/src/composables/useStudioState.ts` | `VueFlow` quản lý node, edge, pan/zoom; toolbar nổi nằm **ngoài viewport transform của node** với zoom ±, fit và mở palette. Giữ `AC.CANVAS.TOOLBAR` trên lớp trong, thêm `AC.UI.CANVAS.TOOLBAR` cho vỏ mới. |
| Node Palette | `apps/web/src/components/NodePalette.vue` | Chỉ render khi `showNodeMenu`; lọc client-side theo `query` của Text/Image/Video, nút tạo phát `create(type)` đến `App.vue` rồi `addNode(type)`. Nút X/Escape phát `close`, ô tìm kiếm dùng `AC.UI.NODE.SEARCH`. |
| Node thực | `apps/web/src/components/StudioNode.vue` | Text/Image/Video dùng chung node có header kéo `.node-drag-handle` (không hiển thị Node ID ở header), textarea `nodrag nowheel` sửa `node.data.content`, cổng `input` trên Image/Video và `output` trên Text/Image. Preview Image/Video chỉ hiển thị `Chưa có kết quả — Chưa kết nối AI`. Giữ MapID AC-02 của node, prompt, handle và xóa có xác nhận. |
| Inspector | `apps/web/src/components/NodeInspector.vue`, trạng thái chọn trong `App.vue` | Render khi `selectedNode && !inspectorClosed`; `@node-click` mở Inspector, `@pane-click` bỏ chọn, nút `AC.UI.INSPECTOR.CLOSE` đóng bảng. Hiển thị loại node, textarea prompt, số edge vào/ra, trạng thái lưu; phần kỹ thuật có Node ID và nút sao chép. Sự kiện `update-prompt` cập nhật `node.data.content` được lưu qua luồng Canvas AC-02 sẵn có. |
| Design tokens | `apps/web/src/styles/tokens.css` | Khai báo `--ac-bg`, `--ac-surface*`, `--ac-line`, `--ac-text`, `--ac-muted`, `--ac-accent`, `--ac-accent-soft`, `--ac-radius`, `--ac-shadow` và `--ac-font`; được các lớp giao diện tham chiếu. |

**Ranh giới dữ liệu:** `useStudioState.ts` vẫn là nơi quản lý danh sách dự án, thay đổi node/edge, API và trạng thái lưu/revision; `App.vue` chủ yếu sắp xếp component và quản lý trạng thái trình bày `libraryOpen`, `selectedNodeId`, `inspectorClosed`. `data-map-id` chỉ định chức năng và selector kiểm thử, không thay `project.id`, `node.id`, `edge.id` hoặc `canvas.revision`. Không coi ảnh mẫu, video, trình phát hay trạng thái AI kết nối là dữ liệu đã tạo.

**Chưa nằm trong UI-01:** kho tài sản, storyboard, Camera Studio, hậu kỳ, hàng chờ, cài đặt nâng cao đang là **nút disabled / lộ trình**; kết nối nhà cung cấp AI, Task ID, Chrome Extension, tác vụ tạo ảnh/video và đóng gói desktop vẫn thuộc các giai đoạn tương lai. Không dùng các mục đó để tuyên bố chức năng đã chạy. Selector và hành động chi tiết ở [MAP_ID.md](MAP_ID.md); trạng thái nghiệm thu UI-01 cùng ảnh và script Playwright thật đã được xác nhận trong [acceptance.md](acceptance.md).
