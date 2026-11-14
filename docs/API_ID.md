# Danh mục API — AC-01

| API ID | Phương thức | URL | Thành công | Lỗi | File |
|---|---|---|---|---|---|
| AC.API.SYSTEM.HEALTH | GET | /api/health | 200 `{"ok":true,"server":"connected","database":"connected","schemaVersion":1}` sau `SELECT 1` SQLite | 503 DB lỗi; 403 origin lạ; 405 method khác; 404 đường dẫn khác | apps/server/src/index.ts |

API chỉ sử dụng mạng loopback và không trả thông tin bí mật hoặc đường dẫn DB cho trình duyệt.

## AC-02A — Dự án và Canvas (đã kiểm chứng)

| API ID | Phương thức | URL | Thành công | Lỗi | File |
|---|---|---|---|---|---|
| AC.API.HOME.PROJECTS | GET | /api/projects | 200, `{ok,projects}` sắp xếp cập nhật mới trước | 503 database; 405 method | apps/server/src/index.ts |
| AC.API.HOME.CREATE | POST | /api/projects | 201, `{ok,project,canvas}` với Canvas mới, revision 0 | 400 tên không hợp lệ; 503 database | apps/server/src/index.ts |
| AC.API.HOME.OPEN | GET | /api/projects/:projectId | 200, `{ok,project,canvas}` | 404 ID không có; 503 database | apps/server/src/index.ts |
| AC.API.CANVAS.CREATE | POST | /api/projects/:projectId/canvas | 200, `{ok,created:false,canvas}` khi đã có Canvas; 201, `created:true` khi tạo Canvas còn thiếu | 404 project không có; 500/503 SQLite lỗi | apps/server/src/index.ts |
| AC.API.CANVAS.READ | GET | /api/projects/:projectId/canvas | 200, `{ok,canvas}` và `canvas.revision` | 404 không có; 503 database | apps/server/src/index.ts |
| AC.API.CANVAS.SAVE | PUT | /api/projects/:projectId/canvas | 200, `{ok,project,canvas}`; tăng `revision` sau transaction SQLite | 400 body sai; 404 không có; **409 revision cũ**; 503/500 lỗi hệ thống | apps/server/src/index.ts |

Lưu Canvas là thao tác snapshot gồm `revision` hiện tại, `nodes[]`, `edges[]` và `viewport`. Backend kiểm tra dữ liệu trước transaction, dùng transaction ghi đồng bộ và từ chối yêu cầu có revision cũ. Tạo dự án tự tạo Canvas trong cùng transaction, còn POST Canvas bổ sung cho ứng dụng khác gọi lại an toàn hoặc khôi phục dự án cũ thiếu Canvas. API health gốc AC-01 ở bảng trên được giữ làm lịch sử; phiên bản schema thực tế hiện là **3**. Bằng chứng AC-02A tại [acceptance.md](acceptance.md).

## AC-02B — Quy tắc payload workflow tại `AC.API.CANVAS.SAVE`

Không có endpoint AI hoặc endpoint kết nối riêng: Vue Flow lưu cả node và edge thông qua **PUT Canvas hiện hữu**. Backend yêu cầu node trong cùng Canvas snapshot, node type trong `text|image|video`, ID duy nhất, tọa độ hợp lệ, prompt hợp lệ; mỗi edge có ID riêng, `source` và `target` hiện hữu, không tự nối, không trùng cặp nguồn-đích và thuộc duy nhất ba chiều `text→image`, `text→video`, `image→video`.

Cổng đích là `input`, cổng nguồn là `output`; `sourceHandle:null` được chấp nhận chỉ cho các kết nối lịch sử đúng cặp loại và đúng đích. Payload giả mạo sai loại, sai cổng, sai ID, trùng dây trả **HTTP 400** cùng thông báo tiếng Việt; snapshot không được ghi một phần. `revision` cũ hợp lệ trả **409**; hệ thống autosave AC-02A giữ bản nháp để xử lý lại. Không tự nâng `schemaVersion` chỉ vì bổ sung validation. Xem test định lượng tại [acceptance.md](acceptance.md).
