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
