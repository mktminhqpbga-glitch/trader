# Danh mục API — AC-01

| API ID | Phương thức | URL | Thành công | Lỗi | File |
|---|---|---|---|---|---|
| AC.API.SYSTEM.HEALTH | GET | /api/health | 200 `{"ok":true,"server":"connected","database":"connected","schemaVersion":1}` sau `SELECT 1` SQLite | 503 DB lỗi; 403 origin lạ; 405 method khác; 404 đường dẫn khác | apps/server/src/index.ts |

API chỉ sử dụng mạng loopback và không trả thông tin bí mật hoặc đường dẫn DB cho trình duyệt.
