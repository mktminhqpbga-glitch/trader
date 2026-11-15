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

## UI-02 — Kiến trúc bố cục media-first (mã đang phát triển, chưa duyệt thẩm mỹ)

**Đính chính trạng thái so với ghi chép lịch sử UI-01 phía trên:** UI-01 **PASS các kiểm tra chức năng/kỹ thuật** (Playwright, hồi quy AC-02, lưu trữ và lỗi đã có bằng chứng) nhưng **chủ dự án KHÔNG DUYỆT tính thẩm mỹ**. Các câu “nghiệm thu UI” trong mục UI-01 là kết quả kiểm tra tại thời điểm trước phản hồi của chủ dự án, **không phải xác nhận thiết kế được duyệt**. UI-02 là đợt thiết kế lại thực sự; **QA kỹ thuật UI-02 còn chờ kết quả**, và **quyền duyệt giao diện cuối cùng thuộc chủ dự án**. Issue UI-02 **#4 phải tiếp tục mở** cho đến khi được xác nhận theo quy trình; tài liệu này không đóng Issue hoặc tuyên bố PASS.

UI-02 **không mở rộng schema/API**, vẫn dùng Vue 3 + Vue Flow + `useStudioState.ts` để lưu `node.data.content`, các cạnh, viewport và `revision` vào SQLite theo AC-02A/B/C. Dưới đây là cấu trúc *đối chiếu trực tiếp* với các file UI-02 đang sửa:

```text
App.vue: AC.APP
├─ Topbar (AC.UI.TOPBAR) — thương hiệu FRAMESPACE, dự án,
│  trạng thái health/save thật, retry và nút lưu
└─ .appBody
   ├─ Rail trái (AC.UI.LEFT.RAIL) — đảo công cụ SVG nhỏ
   │  ├─ tạo dự án (AC.HOME.NEW)
   │  ├─ thư viện / drawer (AC.UI.PANEL.TOGGLE)
   │  ├─ Canvas hiện tại (AC.CANVAS.OPEN)
   │  └─ nút ... (AC.UI.ROADMAP.TOGGLE)
   │     └─ popover “Sắp phát triển” (AC.UI.ROADMAP) — chỉ thông tin
   ├─ Home (AC.HOME)
   │  └─ ProjectLibrary.vue (AC.UI.PROJECT.LIBRARY)
   │     ├─ tìm tên (AC.UI.PROJECT.SEARCH), thẻ dự án dạng lưới
   │     └─ thao tác AC-02C: mở/đổi tên/xóa mềm/thùng rác/khôi phục
   └─ Canvas (AC.CANVAS)
      └─ .canvasViewport (AC.CANVAS.CONNECT): flex ngang
         ├─ .canvasStage (AC.UI.CANVAS.STAGE): VueFlow và đồ thị
         │  ├─ .canvasToolbar (AC.UI.CANVAS.TOOLBAR)
         │  │  └─ NodePalette.vue (AC.UI.NODE.PALETTE, AC.UI.NODE.SEARCH)
         │  ├─ StudioNode.vue: Text / Image / Video dạng compact
         │  │  ├─ header kéo .node-drag-handle, input/output VueFlow
         │  │  ├─ textarea thật, media prompt mở rộng bằng nút
         │  │  ├─ kết quả chỉ có dòng trạng thái “Chưa kết nối AI”
         │  │  └─ khi chọn: action bar (AC.UI.NODE.ACTIONS) + menu ba chấm
         │  └─ trạng thái nối dây và cảnh báo/lưu cũ
         ├─ NodeInspector.vue (AC.UI.INSPECTOR), sibling của .canvasStage
         │  └─ panel dành riêng chiều ngang; không đè lên stage desktop
         └─ .canvasLibraryDrawer → ProjectLibrary.vue (khi libraryOpen)
```

| Khu vực | File nguồn thực tế | Cấu trúc và chức năng UI-02 |
|---|---|---|
| Shell / SVG / topbar | `apps/web/src/App.vue`, `apps/web/src/components/StudioIcon.vue`, `apps/web/src/styles/studio-ui02.css` | Topbar 48px vẫn gọi đúng các chức năng quay về dự án, hiển thị health, retry và save. `StudioIcon.vue` dùng SVG với `name` được định nghĩa sẵn (plus, projects, canvas, more, search, text, image, video, refresh, zoom/fit...). Rail có **3 nút chức năng thật** trong `.railActiveActions`; nút `AC.UI.ROADMAP.TOGGLE` riêng ở dưới chỉ mở/đóng `role="note"`, không điều hướng đến tính năng chưa xây dựng. |
| Thư viện dạng grid/cards | `apps/web/src/components/ProjectLibrary.vue`, `studio-ui02.css` | `.projectList` là grid `repeat(auto-fill, minmax(235px, 1fr))`; từng `.projectRow` có hình đồ họa Canvas **trang trí bằng CSS, không phải media AI đã tạo**, tên, thời gian cập nhật và menu dự án thật. `AC.UI.PROJECT.SEARCH` gắn `v-model="query"`, lọc tên ở client, không gọi API tìm kiếm. Trong drawer dùng cùng component với thẻ rút gọn, giữ nguyên các thao tác AC-02C. |
| Palette và Canvas | `apps/web/src/App.vue`, `apps/web/src/components/NodePalette.vue`, `studio-ui02.css` | `AC.UI.CANVAS.STAGE` bao `VueFlow`, thanh zoom/fit và nút Thêm ở góc stage; palette là danh sách **3 loại node thực** Text/Image/Video và ô lọc `AC.UI.NODE.SEARCH`, phát sự kiện `create`/ `close` về App. Không có nút mô hình AI hay xử lý media giả. |
| Node compact media-first | `apps/web/src/components/StudioNode.vue` (CSS **scoped**) | Text rộng khoảng **270px**, textarea 1 dòng tăng chiều cao theo `scrollHeight` tối đa **172px**. Image/Video rộng khoảng **276px**, textarea prompt 1 dòng **luôn hiện và sửa được** (`AC.IMAGE.PROMPT`/`AC.VIDEO.PROMPT`); nút `AC.UI.NODE.PROMPT.EXPAND` mở vùng soạn lớn rồi focus, nhấn lại thu gọn. Kết quả `AC.IMAGE.RESULT`/`AC.VIDEO.RESULT` là dòng trạng thái đúng **“Chưa có kết quả — Chưa kết nối AI”**, **không có khung ảnh/video trống lớn, media mẫu, nút play hoặc nút gửi AI giả**. |
| Context toolbar và menu node | `apps/web/src/components/StudioNode.vue` | Chỉ khi node được chọn, action bar nổi nhỏ cạnh node (`AC.UI.NODE.ACTIONS`) có **Sửa** để focus prompt (`AC.UI.NODE.EDIT`) và nút `AC.UI.NODE.CONTEXT.TOGGLE` mở tùy chọn. Header cũng có nút ba chấm `AC.UI.NODE.MENU.TOGGLE`. Menu mở thực sự chứa `AC.UI.NODE.MENU.EDIT` và `AC.CANVAS.NODE.DELETE`: xóa qua hộp xác nhận Element Plus rồi `removeNodes`, không xóa nếu Hủy. **Nút xóa chỉ hiện khi menu mở**, nên kịch bản AC-02 cũ phải bấm ba chấm trước. |
| Inspector dành vùng riêng và pan chọn lọc | `apps/web/src/App.vue`, `apps/web/src/components/NodeInspector.vue`, `studio-ui02.css` | `.canvasViewport` dùng flex ngang; `.canvasStage` là một phần tử, `NodeInspector` là **sibling** chỉ render khi chọn node và chưa đóng. Desktop dành cột khoảng 292px (260px khi hẹp, 238px ở breakpoint kế tiếp); **ở tối đa 620px CSS chuyển Inspector sang absolute overlay**, không thể coi mọi cỡ màn hình đều không chồng. `handleNodeClick` dùng `getBoundingClientRect()` của stage/node, margin 30px, **chỉ gọi** `setViewport({x+dx,y+dy,zoom})` khi node bị mép stage che; không viết lại `node.position`, `node.id`, `edge.id`. Đây là điều chỉnh viewport hiển thị (có thể thuộc snapshot viewport được lưu sau đó), **không phải di chuyển node trong dữ liệu**. Inspector tiếp tục sửa `data.content` và hiển thị số kết nối, trạng thái lưu, ID kỹ thuật. |

**Ranh giới chức năng/QA:** Header kéo `.node-drag-handle`, textarea `nodrag nowheel`, cổng `input` (Image/Video) và `output` (Text/Image), MapID AC-01/02 và validation/save `revision` vẫn giữ nguyên trong mã. CSS UI-02 tải sau `studio.css` qua `<style src="./styles/studio-ui02.css">`, đồng thời node dùng scoped CSS; màu sắc và chi tiết hiển thị mới **chưa thay thế yêu cầu QA chạy thực tế**. Những tính năng kho tài sản, Storyboard, Camera Studio, hậu kỳ, hàng chờ chỉ được nêu trong roadmap, không có AI đang chạy hay kết quả media thật. Bảng MapID mới ở [MAP_ID.md](MAP_ID.md); đối chiếu ảnh/kịch bản UI-02 do nhóm chính thực hiện, **chưa khẳng định PASS UI-02**.

## UI-02 Lệnh 1/5 — A/B Design Preview DEV-only

`apps/web/src/main.ts` chỉ dynamic-import `designPreview/designPreview.vue` khi `import.meta.env.DEV` **và** query là `designPreview=A|B`. Production build không bundle marker `AC.UI02.PREVIEW.ROOT`, `DEMO — DESIGN PREVIEW`, demo-edge ID; Chromium trên production URL `?designPreview=A` vẫn render App production. Bản preview độc lập dùng VueFlow `id=design-preview-flow`, node/edge DEMO chỉ trong bộ nhớ, SVG poster tại `apps/web/public/designPreview/`, HTML5 video controls với nguồn CC0 ngoài mạng. Không gọi `useStudioState`, backend, SQLite hay AI Task; không sửa ID dữ liệu thật.

VueFlow v1.48.2 hydrate edge đã có qua `isValidConnection`. Bản cũ tính chính edge là duplicate của chính nó nên store 0 dù dữ liệu 3. Đã sửa validator bỏ qua **chính edge ID** khi nạp, vẫn từ chối dây nối trùng mới. B dock Inspector làm hẹp stage; khi chọn node mép phải, `ensureNodeVisible` pan *viewport* theo DOM stage/selected node bounds, **không đổi tọa độ hoặc ID** node. A giữ Inspector nổi và cách tránh overlap ban đầu. Lệnh 1/5 QA Chromium trên cổng DEV riêng đã PASS: 3 node/3 SVG edge, 7 node/5 edge, drag/pan/zoom/fit, DEMO/compact/Inspector/Library, 64 ảnh thật 32 A + 32 B, `apiCalls=[]`, `pageErrors=[]`. CI chỉ upload artifact PASS và không tự push. Xem [so sánh bằng ảnh](design/UI02_DESIGN_COMPARISON.md), Issue #4 phải OPEN chờ chủ dự án duyệt thẩm mỹ.
