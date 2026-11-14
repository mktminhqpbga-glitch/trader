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

## AC-02 toàn phần — danh mục kiểm thử các phần tiếp theo (Issue #2 vẫn mở)

Ghi chú trạng thái: AC-01 đã được người giao nhiệm vụ đóng trước khi bắt đầu AC-02; nhận định lịch sử ở đoạn trên thuộc thời điểm ghi báo cáo AC-01. AC-02 phải có bằng chứng trình duyệt thật, SQLite thật và restart trước khi được công nhận.

Các ca dưới đây là phạm vi AC-02 rộng hơn hiện chưa được đưa vào đợt phát hành AC-02A. Các lệnh **đã chạy thật** cùng đường dẫn kịch bản đang tồn tại được ghi trong phần AC-02A phía dưới.

| Kiểm tra theo Issue #2 | Trạng thái | Bằng chứng |
|---|---|---|
| `bun install --frozen-lockfile` | PASS | Bun 1.4.3; checked 95 installs, 126 packages, không thay đổi lockfile |
| `bun run typecheck` | PASS AC-02A | Web/Server TypeScript đều thành công; kiểm tra tiếp khi mở rộng AC-02 |
| `bun run build` | PASS AC-02A | Vite build 1591 modules; cảnh báo chunk lớn chưa cản build |
| Tạo dự án A và ba node Text/Image/Video | NOT TESTED | Chờ Playwright |
| Prompt từng loại khác nhau được lưu SQLite | NOT TESTED | Chờ Playwright và truy vấn SQLite |
| Kéo, chọn, xóa node; tạo/xóa edge hợp lệ | NOT TESTED | Chờ Playwright |
| Pan, Zoom In/Out, Fit View, toolbar cố định | NOT TESTED | Chờ Playwright |
| Autosave có xác nhận SQLite, revision chống ghi đè cũ | NOT TESTED | Chờ thử GET/PUT và Playwright |
| Refresh và so sánh ID/prompt/vị trí/edge/viewport | NOT TESTED | Chờ Playwright |
| Tạo B, chuyển A→B→A, không trộn dữ liệu | NOT TESTED | Chờ Playwright |
| Restart backend giữ nguyên dữ liệu | NOT TESTED | Chờ server SQLite test |
| Lỗi lưu hiển thị, giữ dữ liệu và thử lại thành công | NOT TESTED | Chờ Playwright mô phỏng PUT lỗi |
| Console, Network, các MapID, health AC-01 | NOT TESTED | Chờ snapshot/requests/console |

**Các hàng còn NOT TESTED thuộc AC-02 đầy đủ và không nằm trong đợt AC-02A này.** SQLite test nằm ngoài repository; không commit dữ liệu thử nghiệm vào Git.

## AC-02A — Nghiệm thu Project + Canvas + Text Node + SQLite

Kiểm thử thật ngày **14/11/2026**, nhánh `feat/aiCanvasStudioFoundation`, Bun 1.4.3, Playwright CLI 1.65.1, Vite 8.3.8, Vue Flow 1.48.2. Cổng riêng Web `5182`, API `3112`; SQLite riêng tại `/tmp/ac02a-verify-20261114-new/test.sqlite`. Không dùng hoặc xóa database của người dùng. Đã dừng và khởi động lại tiến trình `bun run dev` trên chính đường dẫn SQLite này.

| Hạng mục AC-02A | Kết quả | Bằng chứng thật |
|---|---|---|
| Git HEAD/branch trước sửa | PASS | `b7bc1feb83bafb8760c64b3fe6bdec3e429abdb0`, branch `feat/aiCanvasStudioFoundation` |
| `bun install --frozen-lockfile` | PASS | Bun 1.4.3: 95 installs / 126 packages, không thay đổi lockfile |
| `bun run typecheck` | PASS | `@ac/server` và `@ac/web` đều thành công |
| `bun run build` | PASS | Vite build 1591 modules, bundle tạo thành công; cảnh báo chunk JS lớn khoảng 1.16 MB |
| `bun run dev` | PASS | API `127.0.0.1:3112`, Web `127.0.0.1:5182` chạy được qua Bun |
| Tạo/mở/danh sách Project A | PASS | POST `/api/projects` HTTP 201, GET danh sách và mở 200 |
| POST tạo Canvas, gọi lại an toàn | PASS | POST `/api/projects/:id/canvas` 200 `created:false`, Canvas ID không đổi |
| Thêm Text Node, nhập `Kiem thu du an A` | PASS | Playwright thao tác textarea `AC.TEXT.PROMPT`; API/SQLite giữ đúng văn bản |
| Chọn/kéo node, pan, zoom in/out, fit | PASS | Thao tác chuột thật, vị trí/transform đổi; thanh công cụ giữ cùng kích thước |
| Autosave SQLite và revision | PASS | Trạng thái `Đã lưu` chỉ sau PUT 200; SQLite `revision = 1`, vị trí và viewport đã lưu |
| Refresh + so sánh nodeId, nội dung, tọa độ, viewport | PASS | Playwright so sánh snapshot API và transform giao diện trước/sau refresh |
| Tạo Project B, chuyển A→B→A | PASS | Project B có `Kiem thu du an B`, nodeId khác; Project A giữ nguyên |
| Restart backend rồi đọc lại A/B | PASS | Dừng hẳn `bun run dev`, chạy lại cùng SQLite; snapshot cả hai dự án khớp |
| Lỗi lưu an toàn, giữ bản nháp, retry | PASS | Intercept PUT trả 503, `AC.CANVAS.SAVE.ERROR` hiện, bản nháp còn; retry PUT 200 rồi refresh phục hồi |
| Xóa Text Node | PASS | Click xóa, xác nhận; API đọc lại `nodes:[]`, SQLite tăng `revision` lên 2 |
| Chặn request cũ/kiểm tra lỗi HTTP | PASS | Unit test backend: 5/5 test, 72 assertions; PUT cũ 409, payload sai 400, DB unavailable 503 |
| Console, Network, MapID và AC-01 health | PASS | Playwright console 0 errors/0 warnings trong lượt kiểm tra; Network POST 201, GET 200, PUT 200 và lỗi 503 mô phỏng; health 200 schemaVersion 3 |

**Dữ liệu SQLite đối chiếu trực tiếp sau luồng chính** (trước khi thử lại nội dung khi lỗi lưu):

| Project | Canvas ID | Node ID | Node type | Nội dung | Vị trí (x,y) | Viewport (x,y,zoom) | Revision |
|---|---|---|---|---|---|---|---|
| A: `project_mwgnj6tj_9_f4cerk9t` | `canvas_mwgnj6tj_a_a668l3t5` | `node_mwgnj75a_1_agghf4` | text | Kiem thu du an A | 303, 303 | -170, -387, 2 | 1 |
| B: `project_mwgnj9zb_b_dy8ium9t` | `canvas_mwgnj9zb_c_vg2jdwyv` | `node_mwgnjadh_1_k7slsx` | text | Kiem thu du an B | 216, 237 | 0, 0, 1 | 1 |

Sau khi thử lỗi và retry, Project A tăng revision và nội dung trở thành `Kiem thu du an A - luu lai thanh cong`; đây là chỉnh sửa hợp lệ đã được xác minh sau refresh.

Chạy lại (với một thư mục test SQLite mới, chưa có dữ liệu):

```bash
export PATH=/Users/phamminh/.bun/bin:$PATH
bun install --frozen-lockfile
bun run typecheck
bun run build
bun test apps/server/src/index.test.ts
AC_DB_PATH=/tmp/ac02a-test/studio.sqlite AC_PORT=3112 AC_WEB_PORT=5182 AC_WEB_ORIGIN=http://127.0.0.1:5182 bun run dev
# Trong terminal khác, ở thư mục gốc repository:
npx --yes playwright@1.65.1 cli -s=ac02final open http://127.0.0.1:5182/
npx --yes playwright@1.65.1 cli -s=ac02final run-code --filename scripts/ac02a-browser-flow.js
# Dừng server dev và chạy lại cùng AC_DB_PATH, sau đó:
npx --yes playwright@1.65.1 cli -s=ac02final run-code --filename scripts/ac02a-browser-restart-failure.js
```

**Giới hạn còn lại:** Đây chỉ là nghiệm thu **AC-02A**. Các thao tác tạo Image/Video Node, dây kết nối toàn phần, kết nối AI, Extension và Desktop chưa thuộc phạm vi chốt này; Issue #2 phải tiếp tục mở. Cảnh báo bundle >500 KB là cải thiện hiệu năng về sau, không làm thất bại build.
