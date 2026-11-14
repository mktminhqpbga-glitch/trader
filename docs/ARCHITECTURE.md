# AC-01 — Kiến trúc nền tảng

Ứng dụng AI Canvas Studio được viết mới hoàn toàn trong repository `trader`, không sao chép logic ToonFlow.

```text
Trình duyệt → Vue 3/Vite (127.0.0.1:5173)
                ↓ proxy /api
           Bun HTTP (127.0.0.1:3101)
                ↓ bun:sqlite
           SQLite local (data/studio.sqlite)
```

- `apps/web`: Vue 3, TypeScript, Element Plus và thư viện Vue Flow (Canvas chưa hiện thực ở AC-01).
- `apps/server`: Bun và SQLite nội bộ, `GET /api/health` truy vấn DB thật.
- `data/`: nằm ngoài public và bị Git ignore, đường dẫn có thể đổi bằng `AC_DB_PATH`.
- Chỉ bind loopback; không cung cấp server công khai hoặc mở CORS tùy ý.
- **Chưa triển khai:** project CRUD, Canvas vô hạn, node, media, task manager, adapter AI, extension, desktop. Mỗi hạng mục sẽ có nhiệm vụ và kiểm thử riêng.

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
