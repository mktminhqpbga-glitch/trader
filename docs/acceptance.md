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
| Backend tắt → Web báo lỗi → bật lại phục hồi | PASS | Playwright CLI đã bấm `Kiểm tra lại`: DOM hiển thị `Không kết nối`/`Máy chủ phản hồi HTTP 502`; sau khi bật Bun API và bấm lại, DOM hiển thị `Đã kết nối` |
| DB sai đường dẫn trả 503 | PASS | Dùng `AC_DB_PATH=/tmp/acCanvasBad4` là thư mục; HTTP 503, `database:"unavailable"` |
| Restart bảo toàn DB | PASS | Health 200 trước/sau restart; file SQLite vẫn tồn tại, inode và kích thước giữ nguyên; schemaVersion vẫn 1 |
| MapID hiển thị thực tế | PASS | Playwright snapshot đọc vùng `AC.SYSTEM.HEALTH`, nút `AC.SYSTEM.HEALTH.RETRY` và status kết nối trên DOM |
| Playwright CLI mở và thao tác DOM | PASS | Playwright CLI 1.65.1: `open`, `snapshot`, `click`, `console`, `requests`; trang AI Canvas Studio mở tại `http://127.0.0.1:5173/` |

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

Playwright CLI đã cung cấp kiểm tra DOM thực tế cho AC-01. Sau khi bổ sung favicon SVG và link tĩnh, lượt mở online sạch có `0 errors`; lượt backend tắt giữ lại đúng một lỗi HTTP 502 dự kiến trong console và sau đó request retry trả 200. AC-01 vẫn chưa được đánh dấu hoàn thành vì Canvas, node, project persistence và MapID đầy đủ của ứng dụng còn nằm trong phạm vi triển khai tiếp theo.
