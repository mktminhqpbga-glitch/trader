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
