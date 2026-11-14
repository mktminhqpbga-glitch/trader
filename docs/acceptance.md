# AC-01 — Nhật ký nghiệm thu

Kiểm tra thực tế được chạy ngày 14/11/2026 trên nhánh `feat/aiCanvasStudioFoundation`, Bun 1.4.3, macOS. Database kiểm tra dùng đường dẫn tạm `/tmp/acCanvasCheck2/studio.sqlite`; không xóa database của dự án.

| Kiểm tra | Trạng thái hiện tại | Bằng chứng |
|---|---|---|
| GitHub chứa mã nguồn Web/Server mới | PASS | Nhánh `feat/aiCanvasStudioFoundation` trong repo `trader` |
| `bun install` | PASS | Bun 1.4.3; 92 packages installed; tạo `bun.lock` |
| `bun run typecheck` | PASS | `@ac/server:typecheck` và `@ac/web:typecheck` đều hoàn tất |
| `bun run build` | PASS | Vite build hoàn tất; tạo `apps/web/dist` |
| `bun run dev` mở Web thật | PASS (HTTP) | Vite trả HTTP 200 tại `http://127.0.0.1:5173/` |
| API GET `/api/health` trả 200 và SQLite `SELECT 1` | PASS | HTTP 200; JSON có `ok:true`, `database:"connected"`, `schemaVersion:1` |
| Backend tắt → Web báo lỗi → bật lại phục hồi | PARTIAL | Proxy trả HTTP 502 khi backend tắt và HTTP 200 sau restart; chưa quan sát trực tiếp DOM trên trình duyệt |
| DB sai đường dẫn trả 503 | PASS | Dùng `AC_DB_PATH=/tmp/acCanvasBad4` là thư mục; HTTP 503, `database:"unavailable"` |
| Restart bảo toàn DB | PASS | Health 200 trước/sau restart; file SQLite vẫn tồn tại, inode và kích thước giữ nguyên; schemaVersion vẫn 1 |
| MapID hiển thị thực tế | PARTIAL | 4 MapID trong mã nguồn khớp `docs/MAP_ID.md`; chưa kiểm tra DOM trực tiếp |

## Lệnh và bằng chứng chính

```text
bun --version                         1.4.3
bun install                           PASS
bun run typecheck                     PASS
bun run build                         PASS
GET 127.0.0.1:3101/api/health        200 + SQLite connected
GET 127.0.0.1:5173/api/health        200 qua Vite proxy
Backend tắt, GET qua proxy           502 Bad Gateway
Backend bật lại, GET qua proxy       200
DB path là thư mục                   503 Service Unavailable
```

Phần còn `PARTIAL` cần kiểm tra bằng trình duyệt có khả năng chạy JavaScript và đọc DOM. Dịch vụ điều khiển trình duyệt trong môi trường hiện tại không khả dụng, nên không đánh dấu AC-01 hoàn thành.
