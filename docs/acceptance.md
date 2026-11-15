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

---

## AC-02B — Nghiệm thu Image Node, Video Node và kết nối workflow

**Ngày kiểm tra:** 15/11/2026, nhánh `feat/aiCanvasStudioFoundation`, HEAD trước sửa `02f7746458919a14d70889cd66686b39f996af50`, working tree ban đầu sạch. Issue [#2](https://github.com/mktminhqpbga-glitch/trader/issues/2) vẫn **OPEN**. Không lấy mã ToonFlow, không viết lại AC-02A, không kết nối AI hoặc tạo media. Công cụ: Bun **1.4.3**, Vue Flow **1.48.2**, Vite **8.3.8**, Playwright CLI **1.65.1**, macOS. Máy chủ thử nghiệm `127.0.0.1:3112`, Web `127.0.0.1:5182`, database duy nhất cho lượt nghiệm thu `/tmp/ac02b-verify-HPB7C9SK/studio.sqlite`, khác database thực của ứng dụng.

### Kiểm thử build và backend

| Nội dung | Kết quả | Bằng chứng |
|---|---|---|
| `bun install --frozen-lockfile` | **PASS** | 95 installs / 126 packages, no changes |
| `bun run typecheck` | **PASS** | TypeScript web/server đều hoàn tất |
| `bun run build` | **PASS** | Vite 1591 modules; build xong, chỉ còn warning chunk JS 1,165.58 KB |
| `bun test apps/server/src/index.test.ts` | **PASS** | 7/7 tests, 0 fail, **173 assertions**, SQLite test thực |
| API xác minh ba kiểu cạnh và cổng | **PASS** | `text→image`, `text→video`, `image→video`; `output→input`; `sourceHandle:null` legacy được bảo toàn khi đọc/ghi/restart |
| API từ chối kết nối sai và nguyên vẹn dữ liệu | **PASS** | HTTP 400 cho sai loại/hướng/cổng, node thiếu, self-loop, trùng cạnh; toàn bộ request không ghi một phần |
| Autosave/revision cũ | **PASS (hồi quy)** | Cơ chế PUT revision 409 giữ nguyên; không request cũ nào ghi đè snapshot mới |

### Playwright CLI — 22 bước AC-02B

Kịch bản `scripts/ac02b-browser-flow.js` và `scripts/ac02b-browser-restart.js` đều chạy **PASS** bằng chuột thật. Kịch bản chỉ dùng `page.evaluate` để **đọc** API/DOM hoặc gửi payload âm tính vào backend; **không tạo edge bằng JavaScript**. Đã gặp một lỗi riêng trong kịch bản test: click tâm bounding box của SVG wire bị node che; sửa kịch bản tìm điểm path đang nhìn thấy và click bằng chuột thật. Bản sửa đã PASS. Khi thử xóa Image, kịch bản ban đầu nhầm kỳ vọng mọi cạnh đều biến mất; đã sửa đúng điều kiện giữ lại Text→Video và chạy PASS.

| Bước | Kiểm tra | Kết quả thực tế |
|---|---|---|
| 1–2 | Tạo `AC02B Test`, mở Canvas | **PASS** — POST project 201, GET Canvas 200 |
| 3–5 | Thêm Text, Image, Video từ menu | **PASS** — mỗi loại có node với ID thực duy nhất |
| 6 | Nhập ba prompt khác nhau | **PASS** — đọc lại API/SQLite khớp nguyên văn |
| 7 | Kéo cả ba node đến tọa độ khác nhau | **PASS** — thao tác chuột và lưu vị trí |
| 8 | Kéo cổng Text output → Image input | **PASS** — 1 edge hiện trên SVG |
| 9 | Kéo Image output → Video input | **PASS** — 2 edges hiện trên SVG |
| 10 | Kéo Text output → Video input | **PASS** — 3 edges hiện trên SVG |
| 11 | Kiểm tra cặp source/target và handle | **PASS** — 3 cặp đúng, ID cạnh duy nhất |
| 12 | Kéo Video input → Text output | **PASS** — không phát sinh cạnh mới, giao diện có cảnh báo |
| 13 | Thử kéo Text→Image lần thứ hai | **PASS** — không có cạnh trùng, có cảnh báo |
| 14 | PUT API sai loại/nguồn/đích/cổng/self-loop/trùng | **PASS** — 6 payload, HTTP 400 và snapshot không đổi; unit tests mở rộng thêm trường hợp dữ liệu giả mạo |
| 15 | Click vào dây Image→Video và xóa | **PASS** — số dây 3→2, đúng ID của hai dây còn lại |
| 16 | Đợi autosave + UI xác nhận đã lưu | **PASS** — PUT 200 và trạng thái `saved` |
| 17 | Đọc trực tiếp SQLite | **PASS** — 3 node/3 prompt/2 edge, `revision=5`, tọa độ, viewport và handle khớp |
| 18 | Refresh, so sánh node/edge ID, prompt, vị trí, viewport | **PASS** — JSON snapshot và DOM viewport transform không đổi |
| 19 | Dừng hẳn dev rồi restart cùng SQLite | **PASS** — toàn snapshot 3 node/2 edge được khôi phục |
| 20 | Xóa Image Node có xác nhận | **PASS** — Image và Text→Image mất; Text/Video/Text→Video còn đúng ID; SQLite `revision=6`, refresh vẫn đúng |
| 21 | Console, Network và MapID | **PASS** — 0 lỗi JS ngoài dự kiến; GET 200, POST 201, PUT 200, các PUT 400 cố ý; các MapID bắt buộc có DOM |
| 22 | Chạy lại AC-02A | **PASS** — `ac02a-browser-flow.js` và `ac02a-browser-restart-failure.js` đều PASS, A/B tách biệt và lỗi PUT 503 giữ bản nháp, retry thành công |

### Bằng chứng SQLite theo ID thực

**Bổ sung kiểm thử chuyển động với edge đang tồn tại:** `scripts/ac02b-browser-connected-drag.js` **PASS** trên dự án trên: cuộn ô prompt không làm zoom Canvas; kéo chọn chữ trong prompt không kéo node; kéo Text Node đã nối Video khiến SVG path của dây dịch chuyển cùng node, Edge ID không đổi; SQLite autosave đúng vị trí mới và tăng revision **6→7**, refresh vẫn giữ cùng dây. Mục dưới đây ghi lại snapshot ở từng mốc *trước* và *sau* thao tác xóa Image, trước kiểm thử bổ sung này.

Trước restart và xóa Image, dự án `project_mwgovngl_1_lzhucdkm`, Canvas `canvas_mwgovngl_2_ufmqx2ec` có **revision 5**, `viewport={x:-146.29271758436948, y:-48.23476909413853, zoom:1.0942273534635878}` và 3 node:

| Node ID | Loại | Prompt SQLite | Tọa độ (x,y) |
|---|---|---|---|
| `node_mwgovnse_1_bp1jb7` | text | `AC02B - Chu de bai viet ve bien` | 245.189, 247.270 |
| `node_mwgovnvm_2_67tcc6` | image | `AC02B - Anh bau troi bien luc binh minh` | 598.883, 311.234 |
| `node_mwgovnye_3_dy7miw` | video | `AC02B - Canh may quay luot ngang bo bien` | 979.604, 328.351 |

Ba cạnh tạo bằng thao tác kéo cổng trong trình duyệt gồm Text→Image, Image→Video, Text→Video; sau xóa cạnh Image→Video còn:

- `edge_mwgovqzm_dd7adu`: Text→Image, `sourceHandle=output`, `targetHandle=input`.
- `edge_mwgovspl_o55fgw`: Text→Video, `sourceHandle=output`, `targetHandle=input`.

**Sau restart và xóa Image Node qua UI**, lệnh `sqlite3 -json` trả **revision 6**, 2 node còn lại là `node_mwgovnse_1_bp1jb7` và `node_mwgovnye_3_dy7miw`, cùng đúng duy nhất `edge_mwgovspl_o55fgw` Text→Video. Prompt, tọa độ, viewport vẫn giữ; không có dangling edge. Trước khi xóa node đã so sánh JSON snapshot và DOM sau restart. Đây là database thử nghiệm được giữ ngoài repository, **không phải dữ liệu của người dùng**.

### Cách chạy lại trên bản mã hiện tại

```bash
export PATH=/Users/phamminh/.bun/bin:$PATH
bun install --frozen-lockfile
bun run typecheck
bun run build
bun test apps/server/src/index.test.ts
AC_DB_PATH=/tmp/ac02b-mytest/studio.sqlite AC_PORT=3112 AC_WEB_PORT=5182 AC_WEB_ORIGIN=http://127.0.0.1:5182 bun run dev
# Terminal khác trong cùng repository:
npx --yes playwright@1.65.1 cli -s=ac02b open http://127.0.0.1:5182/
npx --yes playwright@1.65.1 cli -s=ac02b run-code --filename scripts/ac02b-browser-flow.js
# Dừng riêng Bun dev thử nghiệm, chạy lại cùng AC_DB_PATH rồi:
npx --yes playwright@1.65.1 cli -s=ac02b run-code --filename scripts/ac02b-browser-restart.js
# Sau kiểm thử restart và xóa Image Node, kiểm tra dây khi kéo node đã nối:
npx --yes playwright@1.65.1 cli -s=ac02b run-code --filename scripts/ac02b-browser-connected-drag.js
# Kiểm tra hồi quy AC-02A trên cùng cổng test:
npx --yes playwright@1.65.1 cli -s=ac02b run-code --filename scripts/ac02a-browser-flow.js
# Restart server cùng DB trước khi chạy script sau:
npx --yes playwright@1.65.1 cli -s=ac02b run-code --filename scripts/ac02a-browser-restart-failure.js
```

**Giới hạn:** Chưa có thao tác sinh ảnh/video bằng AI theo đúng phạm vi AC-02B. Khu vực kết quả ghi `Chưa kết nối AI`, không giả media. Bộ build còn cảnh báo kích thước chunk nhưng không lỗi. **AC-02B đã nghiệm thu PASS; Issue #2 (AC-02 tổng thể) vẫn mở để xác nhận toàn bộ AC-02, không tự chuyển AC-03.** Giữ tiến độ tổng thể **40%**, không tăng vì chỉ thêm giao diện.

---

## AC-02C — Project CRUD và nghiệm thu toàn bộ AC-02

**Kiểm thử mới ngày 15/11/2026 (giờ Việt Nam).** HEAD đầu vào `e76487f234cd0c905f07de9775215cad20b52e82`, nhánh `feat/aiCanvasStudioFoundation`, working tree đầu vào sạch; Issue #2 được đọc và trạng thái ban đầu OPEN. AC-02A/B giữ nguyên mã chức năng đã nghiệm thu, chỉ bổ sung Project CRUD. Bun 1.4.3, Vite 8.3.8, Playwright CLI 1.65.1, SQLite thực tại **`/tmp/ac02c-verify-jNi3NouX/studio.sqlite`**, API `127.0.0.1:3112`, Web `127.0.0.1:5182`; không dùng hoặc xóa database người dùng.

### Project CRUD mới, schema và trạng thái API

- SQLite **schema v4** thêm trường nullable `projects.deletedAt` bằng migration transaction không phá dữ liệu. Các bảng `canvases`, `canvas_nodes`, `canvas_edges` và `revision` không đổi. Unit tests bao phủ upgrade v1/v2/v3 → v4 và restart vẫn giữ dữ liệu cũ.
- `PATCH /api/projects/:id` `{name}`: trim và kiểm tra 1–100 ký tự, cập nhật `name`/`updatedAt`; không thay `id` hoặc `canvas.revision`; 200 `{ok,project}`. Tên không hợp lệ trả 400; tên không đổi không tự tăng thời điểm.
- `DELETE /api/projects/:id`: **chỉ xóa mềm** bằng `deletedAt` và `updatedAt`, phản hồi 200 sau transaction; dữ liệu project, canvas, node, edge vẫn trong SQLite. Xóa lặp trả 409. Không có endpoint xóa vĩnh viễn.
- `GET /api/projects` trả các dự án chưa xóa mềm; `GET /api/projects?status=deleted` trả mục đã xóa mềm; status không hợp lệ 400.
- `POST /api/projects/:id/restore`: bỏ cờ xóa mềm, dự án hiện lại trong danh sách, response 200. Khôi phục lặp 409. Đọc project hoặc GET/POST/PUT Canvas của project đang xóa trả 404 (không cho ghi chéo).

### Kết quả 16 bước Playwright AC-02C

Script chính: `scripts/ac02c-browser-flow.js`, **PASS**. Mọi tạo project, thêm node, nhập prompt, nối dây, menu, đổi tên, xóa, khôi phục và hủy đều được Playwright click/fill/drag trên giao diện; gọi API trực tiếp chỉ để **đọc dữ liệu đối chứng** hoặc tạo điều kiện kiểm tra âm tính, không thay hành động UI. Kết quả:

| Bước | Kiểm tra | Trạng thái | Bằng chứng |
|---|---|---|---|
| 1 | Tạo Project A | **PASS** | POST 201, Project ID riêng |
| 2 | Thêm Text/Image/Video Node | **PASS** | 3 node loại khác nhau trong DOM và SQLite |
| 3 | Nhập ba prompt | **PASS** | 3 prompt khớp nội dung lưu, không media giả |
| 4 | Kéo node và nối dây bằng chuột | **PASS** | Kéo Text→Image, Image→Video, Text→Video; 3 SVG edges |
| 5 | Autosave SQLite | **PASS** | PUT 200, trạng thái `Đã lưu`, revision 4; Node/Edge/viewport khớp |
| 6 | Đổi tên A qua menu | **PASS** | PATCH 200, tên mới ở danh sách và header; PATCH 503 mô phỏng không đổi tên cũ |
| 7 | Refresh, kiểm tra tên/workflow | **PASS** | Tên mới, Canvas ID, cả 3 Node/Edge ID, prompt, viewport, revision giữ nguyên |
| 8 | Tạo Project B | **PASS** | B có prompt khác và ID riêng, lưu revision 1 |
| 9 | Xóa mềm A sau xác nhận | **PASS** | DELETE 200, A khỏi danh sách active, vào danh sách đã xóa, `deletedAt` ISO |
| 10 | B không ảnh hưởng | **PASS** | B giữ nguyên prompt, Canvas và node khi A xóa mềm |
| 11 | Khôi phục A qua UI | **PASS** | Click Restore, POST 200, `deletedAt:null`, A hiện lại |
| 12 | Mở lại A | **PASS** | So sánh chính xác ID, ba prompt, ba edge, viewport, revision 4 |
| 13 | Restart backend cùng SQLite | **PASS** | `ac02c-browser-restart.js`: A 3 node/3 edge và tên mới; B độc lập; schema v4 |
| 14 | Thử xóa rồi chọn Hủy | **PASS** | Không có DELETE trong Network, A nguyên vẹn; kiểm tra cả khi A đang mở |
| 15 | Mô phỏng lỗi API | **PASS** | PATCH 503 giữ tên cũ, DELETE 503 không ẩn dự án; thùng rác GET 503 cho Retry chạy được |
| 16 | Console, Network, MapID | **PASS** | Không có JavaScript `pageerror`; PATCH/DELETE/RESTORE 200, lỗi 503 có chủ ý và các MapID mới tương ứng |

**Kiểm thử bổ sung `scripts/ac02c-browser-ui-audit.js` PASS:** Hủy đổi tên không gửi PATCH, nhập tên chỉ có khoảng trắng không gửi PATCH, GET trash lỗi 503 có nút Retry thật và phục hồi sau click, xóa mềm **dự án đang mở** chỉ điều hướng về trang chủ sau ACK 200, hủy xóa giữ Canvas, phục hồi giữ nguyên snapshot. Bài kiểm tra dùng `page.route` chỉ để mô phỏng phản hồi lỗi, không tạo/xóa dự án thay cho thao tác UI.

**Revision conflict `scripts/ac02c-browser-revision-conflict.js` PASS:** một PUT hợp lệ khác tăng revision **1→2**; người dùng sửa prompt trên UI sau đó gặp **409** và thấy `AC.CANVAS.SAVE.CONFLICT`. Bản nháp trên màn hình được giữ, bản mới trên SQLite không bị ghi đè. Hủy hộp thoại nạp lại giữ draft; chỉ sau khi người dùng xác nhận `Nạp lại` mới thay nội dung UI bằng dữ liệu mới trên server. Refresh sau đó khớp. Đây là kiểm thử xung đột trên giao diện thật, khác với unit test revision AC-02A/B.

### SQLite trực tiếp: bằng chứng tên + dữ liệu được bảo toàn

Truy vấn thật bằng `sqlite3 -json` sau khi hoàn thành xóa mềm → khôi phục, trước/sau restart (sau khi xóa mềm và khôi phục lần thứ hai trong UI audit cũng đối chiếu toàn snapshot):

| Thuộc tính | Project A |
|---|---|
| Project ID | `project_mwgps6vf_3_nr3m0nfg` |
| Tên sau PATCH | `AC02C Du an A da doi ten` |
| deletedAt sau restore | `NULL` |
| Canvas ID | `canvas_mwgps6vf_4_qf4txyn4` |
| Revision | **4**, không tăng do rename/delete/restore |
| Viewport (x, y, zoom) | `-121.90866141732283, -10.57598425196852, 1.0779527559055118` |
| Text Node | `node_mwgps7h2_1_4vnd3o` — `AC02C A: cau chuyen san sang` |
| Image Node | `node_mwgps7qe_2_82zg5h` — `AC02C A: binh minh tren bien` |
| Video Node | `node_mwgps7xa_3_ugbdw8` — `AC02C A: camera bay ngang qua bien` |
| Edge Text→Image | `edge_mwgpsa6q_k2i6u9` — `output→input` |
| Edge Image→Video | `edge_mwgpsb41_24qadl` — `output→input` |
| Edge Text→Video | `edge_mwgpscib_2p48d6` — `output→input` |

Project B `project_mwgpsgp5_5_lzhxjw9h`, Canvas `canvas_mwgpsgp5_6_nmrlkxgk`, revision **1**, có một Text Node và prompt `AC02C B doc lap` riêng, hoàn toàn không đổi khi thao tác A. Bản DB này nằm trong thư mục `/tmp`, không được commit.

### Kiểm toán hồi quy toàn bộ AC-02

| Phạm vi Issue #2 | Kiểm thử lại trên code AC-02C | Trạng thái |
|---|---|---|
| Canvas vô hạn, pan/zoom/fit, toolbar cố định | `ac02a-browser-flow.js`: kéo node, pan/zoom/fit, so sánh toolbar | **PASS** |
| Text/Image/Video, prompt chỉnh sửa, chọn/kéo/xóa node | `ac02c-browser-flow.js` + `ac02b-browser-restart.js` | **PASS** |
| Ba hướng edge đúng; sai/trùng bị từ chối có thông báo | `ac02b-browser-flow.js`: kéo cổng bằng chuột thật, 6 payload API 400 | **PASS** |
| Chọn và xóa một dây, xóa node chỉ xóa dây liên quan | `ac02b-browser-flow.js` + `ac02b-browser-restart.js` | **PASS** |
| Kéo node đang nối không lệch dây; prompt không kích hoạt pan/zoom | `ac02b-browser-connected-drag.js`, revision 6→7 | **PASS** |
| Autosave, revision, không ghi đè bản cũ | AC-02A/B và `ac02c-browser-revision-conflict.js` thấy 409 thật | **PASS** |
| Refresh/restart khôi phục node, edge, ID, prompt, viewport | AC-02A/B/C browser flow + restart, so sánh JSON và DOM | **PASS** |
| Project A/B độc lập, đổi tên, xóa mềm, khôi phục | `ac02c-browser-flow.js`, `ac02c-browser-restart.js`, `ac02c-browser-ui-audit.js` | **PASS** |
| API lỗi và xử lý bản nháp | PATCH/DELETE/Trash 503, AC-02A PUT 503 retry, AC-02C PUT 409 | **PASS** |
| Health AC-01 và SQLite | API health 200 schema 4; **thực sự dừng Bun API**: Web 502, click Retry báo Không kết nối; bật API lại cùng DB, click Retry hiện Đã kết nối | **PASS** |
| MapID chức năng và bộ API | DOM Playwright; [MAP_ID.md](MAP_ID.md), [API_ID.md](API_ID.md) | **PASS** |
| Không có nút AI giả hoặc media giả | Image/Video chỉ là prompt, status `Chưa kết nối AI`, không có nút gọi AI | **PASS phạm vi AC-02** |

**Build/test mới:** `bun install --frozen-lockfile` PASS (95 installs, 126 packages, no changes); `bun run typecheck` web/server PASS; `bun run build` PASS (Vite 1591 modules, cảnh báo chunk >500 KB); `bun test apps/server/src/index.test.ts` **10/10 tests, 282 assertions, 0 fail** trên Bun 1.4.3. Unit test bao phủ migration v1/v2/v3, CRUD, A/B, lỗi 400/404/409/503/500, edge legacy sourceHandle:null và SQLite durability. Kết quả Playwright được thu trên database riêng và browser thật, không suy luận từ báo cáo cũ.

### Chạy lại AC-02C trên cơ sở dữ liệu thử nghiệm riêng

```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install --frozen-lockfile
bun run typecheck
bun run build
bun test apps/server/src/index.test.ts
AC_DB_PATH=/tmp/ac02c-mytest/studio.sqlite AC_PORT=3112 AC_WEB_PORT=5182 AC_WEB_ORIGIN=http://127.0.0.1:5182 bun run dev
# Terminal khác trong repo, không mở browser/profile mới cho từng script:
npx --yes playwright@1.65.1 cli -s=ac02c open http://127.0.0.1:5182/
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02c-browser-flow.js
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02c-browser-revision-conflict.js
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02b-browser-flow.js
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02a-browser-flow.js
# Dừng Bun dev của TEST; khởi động lại VỚI CHÍNH AC_DB_PATH ở trên, rồi:
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02c-browser-restart.js
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02b-browser-restart.js
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02b-browser-connected-drag.js
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02a-browser-restart-failure.js
npx --yes playwright@1.65.1 cli -s=ac02c run-code --filename scripts/ac02c-browser-ui-audit.js
```

**Giới hạn cuối:** chưa sinh ảnh/video bằng AI, chưa có Chrome Extension hay Desktop, đây là phần sau AC-02 và không được giả định đã làm. Vite còn cảnh báo chunk ~1.17 MB, không chặn build. **Toàn bộ tiêu chí AC-02 đã được kiểm thử PASS trong môi trường thử nghiệm riêng.** Code AC-02C đã push tại commit [`86ca1ff322331ad27e1b8cb04522d40da951c83c`](https://github.com/mktminhqpbga-glitch/trader/commit/86ca1ff322331ad27e1b8cb04522d40da951c83c), và [Issue #2](https://github.com/mktminhqpbga-glitch/trader/issues/2) đã được đóng với lý do **completed** sau khi đăng bình luận nghiệm thu. Không tự bắt đầu AC-03. Giữ phần trăm tổng thể ở mốc lịch sử **40%** do chưa có tiêu chí tính lại toàn 3 giai đoạn.

---

## Rà soát bộ công cụ AC-01 (15/11/2026, không thay đổi nghiệm thu AC-02)

Đây là **lượt kiểm toán công cụ bổ sung** trên branch `feat/aiCanvasStudioFoundation`, HEAD đầu vào `afcd347c0b9e36160844a47543a6e5b2d4e448a6`. Issue #1 và #2 đã CLOSED/completed trước lần rà soát này. Không phát triển lại tính năng, không nâng tỷ lệ 40%, không thêm thư viện trùng chức năng.

| Kiểm tra công cụ chạy thực tế | Kết quả |
|---|---|
| `bun --version`, `node --version`, `codex --version` | **PASS** — Bun 1.4.3, Node 22.23.3, Codex CLI 0.167.0 |
| Playwright CLI 1.65.1 `--version`, `cli --help` | **PASS** — các lệnh thực sự chạy, không chỉ đọc manifest |
| Playwright CLI `open`/`snapshot`/`click`/`requests`/`console` trên Web `127.0.0.1:5182` đang chạy | **PASS** — trang `AI Canvas Studio`, DOM có `AC.SYSTEM.HEALTH.RETRY`, click thật; Network có GET health **200** và GET projects **200**, console **0 errors, 0 warnings** |
| HTTP health qua Vite proxy | **PASS** — `{ok:true,server:"connected",database:"connected",schemaVersion:4}` |
| `chrome-devtools-mcp@1.13.0 --version/--help` | **PASS CLI ONLY** — Codex chưa đăng ký DevTools MCP, không có bằng chứng MCP integration |
| `@upstash/context7-mcp@4.7.0 --help` | **PASS CLI ONLY** — cache npm mặc định báo EACCES, tạm dùng `npm_config_cache=/tmp/trader-tooling-npm-...` thì lệnh help chạy; **chưa** gọi API tài liệu qua MCP |
| `codex mcp list` | **PASS kiểm tra tên** — `cua_repl`, `node_repl` enabled; `codex_app` disabled; không có Chrome DevTools MCP hoặc Context7 được kết nối |
| `AC_WEB_URL=http://127.0.0.1:5182 bun run tooling:smoke` | **PASS** — Web HTTP 200, API HTTP 200, SQLite connected, v4; chỉ đọc, không thay SQLite |
| Negative validation của script smoke | **PASS** — URL ngoài localhost bị chặn, script trả exit code 1; không gọi network ra ngoài |

Danh sách package/phiên bản/license, những công cụ chỉ mới xem `--help`, lý do không thêm Dagre/Pinia/Zod, hướng dẫn Codex Skills và cách tái kiểm thử được ghi tại [TOOLING_AC01.md](TOOLING_AC01.md). Các thay đổi thuộc tooling/Skills/docs; không ghi dữ liệu test vào workspace, không thay Canvas/API hay kết nối AI. Những bài kiểm thử AC-01 gốc về HTTP 502/503, khởi động lại và SQLite vẫn giữ nguyên ở phần lịch sử phía trên, không lấy lần click health mới này thay thế các bài kiểm tra đó.

---

## UI-01 — AI Creative Studio: nghiệm thu giao diện thật (15/11/2026)

**Issue:** [UI-01 #3](https://github.com/mktminhqpbga-glitch/trader/issues/3) · **Repo/nhánh:** `mktminhqpbga-glitch/trader` / `feat/aiCanvasStudioFoundation` · **HEAD gốc:** `a10d932c946eb53a13569fc7ea57aef407d16b8d`. Đây là redesign **thực sự trên Vue 3/Vue Flow**, không phải mockup và không sao chép mã, logo hoặc ảnh của LibTV. Các trạng thái ảnh/video chưa có kết quả được hiển thị trung tính; không gọi AI trả phí.

### Giao diện và trạng thái đã kiểm tra bằng Playwright

| Thành phần / hành vi | Kiểm chứng | Trạng thái |
|---|---|---|
| Topbar tối giản (~54px), rail biểu tượng (~58px), Canvas tối vô hạn, floating toolbar | DOM thực, tooltip, các nút zoom/fit/thêm node, rail thu gọn | **PASS** |
| Project Library và drawer | Dữ liệu từ API thật, tìm theo tên dự án thật, mở/đóng, menu ⋯, tạo, đổi tên, xóa mềm, khôi phục | **PASS** |
| Node Palette | `AC.UI.NODE.SEARCH` lọc thật Text/Image/Video; tạo node, đóng popover sau chọn | **PASS** |
| Text/Image/Video node | Prompt chỉnh sửa thật, `.node-drag-handle`, đúng cổng `input`/`output`; placeholder chưa kết nối AI | **PASS** |
| Node Inspector | Chọn Image/Video thấy Inspector, chỉnh nội dung cập nhật ngay node và autosave, đóng trở lại Canvas | **PASS** |
| Bàn phím/hộp thoại/trạng thái | Cancel rename/delete không gửi PATCH/DELETE; dialog và overlay đóng được; tương tác prompt không kéo node | **PASS** |
| Responsive 1440×900, 1280×800, 1024×768, 390×844 | Screenshot thật trước/sau ở cùng viewport cho thư viện, Canvas trống và 3 node | **PASS (desktop/thu gọn)**; mobile Canvas dùng pan/zoom, chưa tối ưu trình biên tập workflow toàn màn hình |
| Trạng thái mất lưu 503 | Mô phỏng PUT 503 chỉ trên dự án thử nghiệm, giữ prompt local, Retry lưu được SQLite | **PASS** |
| Revision conflict 409 | PUT phiên bản khác tăng revision, local draft giữ nguyên, server snapshot không bị overwrite | **PASS** |
| Dữ liệu qua refresh/restart | So sánh đúng Canvas ID, Node ID, Edge ID, nội dung, vị trí, viewport, revision bằng API và UI thực tế | **PASS** |

**Hai kịch bản QA tái lập đã chạy lại trên browser thật và PASS:** `scripts/ui01-visual-qa.js` — responsive 4 kích thước, tạo project riêng, tìm node, ba dây, Inspector, dialogs, snapshot; `scripts/ui01-failover.js` — local draft qua 503, Retry SQLite, conflict 409 không ghi đè. Khi tái chạy để tránh làm thay đổi ảnh bằng chứng, screenshot output được chuyển sang `/tmp/ui01-evidence-test/qa-after/`; hai script chính trong repo giữ output ở `docs/evidence/ui01/`.

**Ảnh thật (35 PNG, ~4.1MB, không có asset LibTV):** [thư mục bằng chứng và hướng dẫn tái lập](evidence/ui01/README.md). Các cặp trước/sau tiêu biểu: [Library 1440 trước](evidence/ui01/before-library-1440x900.png) / [sau](evidence/ui01/after-library-1440x900.png); [Canvas workflow 1440 trước](evidence/ui01/before-workflow-1440x900.png) / [sau](evidence/ui01/after-workflow-1440x900.png); [Library mobile trước](evidence/ui01/before-library-390x844.png) / [sau](evidence/ui01/after-library-390x844.png); [Inspector Image](evidence/ui01/after-image-selected-inspector-1440x900.png); [Node Palette](evidence/ui01/after-node-palette-1440x900.png); [Lỗi lưu HTTP 503](evidence/ui01/after-api-503-1440x900.png) và [revision 409](evidence/ui01/after-api-409-1440x900.png).

### Hồi quy AC-02A/B/C thực hiện lại trên giao diện UI-01

Chạy Playwright CLI 1.65.1 **một browser session `ui01`** trên Web `http://127.0.0.1:5184` và API `3114`, SQLite riêng `/tmp/ui01-evidence-test/studio.sqlite`; không tắt, sửa hoặc ghi vào phiên người dùng `5182/3112` hay file `manual-testing.sqlite`. Các regression script được sửa selector để **click thật rail mở drawer thư viện**, thay vì phụ thuộc sidebar cũ; mọi assertion dữ liệu, 400/409/503, cạnh nối, revision vẫn giữ nguyên. `run-code` Playwright không có `process.env`, nên các script target cổng thử nghiệm cố định 5184 (đổi script khi cần cổng QA khác).

| Bài Playwright | Kết quả |
|---|---|
| `scripts/ac02a-browser-flow.js` | **PASS** — A/B, Text, pan/zoom/fit, autosave, refresh, IDs/viewport |
| `scripts/ac02a-browser-restart-failure.js` | **PASS** — restart đúng DB, PUT 503/retry, local draft, SQLite |
| `scripts/ac02b-browser-flow.js` | **PASS** — 3 node, 3 kết nối đúng, sai/trùng từ chối, API 400, xóa dây, UI+SQLite |
| `scripts/ac02b-browser-restart.js` | **PASS** — restart, xóa Image node, giữ Text→Video và ID dây/viewport |
| `scripts/ac02b-browser-connected-drag.js` | **PASS** — node kéo không rời dây, textarea wheel/drag không zoom/pan, refresh |
| `scripts/ac02c-browser-flow.js` | **PASS** — CRUD, PATCH lỗi, sửa tên, xóa mềm/khôi phục, A/B |
| `scripts/ac02c-browser-ui-audit.js` | **PASS** — hủy thao tác không gửi API, trash 503/retry, active delete an toàn |
| `scripts/ac02c-browser-revision-conflict.js` | **PASS** — 409, local draft, hủy reload, nạp server có xác nhận |
| `scripts/ac02c-browser-restart.js` | **PASS** — A/B và Canvas IDs, edges, prompt, revision giữ nguyên sau restart |

Khi thực thi `ac02b-browser-connected-drag.js` trước `ac02b-browser-restart.js`, precondition 2-node sau xóa Image không đạt (test-order error); sau khi chạy **đúng thứ tự** B restart → connected-drag, script **PASS**, không nới lỏng assertion.

### Lệnh build / unit / smoke sau triển khai

```text
bun install --frozen-lockfile           PASS — 95 installs / 126 packages, no changes
bun run typecheck                       PASS — @ac/web + @ac/server
bun run build                           PASS — Vite 1597 modules
bun test apps/server/src/index.test.ts  PASS — 10 tests, 282 expect, 0 fail
AC_WEB_URL=http://127.0.0.1:5184 bun run tooling:smoke
                                       PASS — Web 200, API 200, SQLite schema 4
git diff --check                         PASS
```

Vite tiếp tục cảnh báo chunk JS >500KB (~1.19MB), **không chặn build**. Backend/API, schema SQLite v4, `bun.lock`, project/node/edge/canvas IDs **không thay đổi trong UI-01**. Các MapID lịch sử AC-01/AC-02 vẫn dùng được; MapID UI-01 và selector/file/hành vi ở [MAP_ID.md](MAP_ID.md).

**Chưa triển khai / NOT TESTED vì ngoài UI-01:** gửi/nhận AI thật, Chrome Extension, tạo media, camera, Storyboard, Asset Library, hàng chờ, Timeline, Lip-Sync, export, desktop packaging; không hiển thị các công cụ này như đã hoạt động. Roadmap tiếp theo chỉ ghi chú: WF-01, SB-01, AS-01, AI-03, CAM-01, POST-01, OUT-01. Tiến độ **toàn bộ 3 giai đoạn vẫn giữ 40%** theo mốc lịch sử; UI-01 PASS không tương đương dự án AI hoàn tất.

**Chạy lại trên Mac (không đụng DB người dùng):** tạo DB QA riêng bằng `mktemp`, dùng `AC_PORT=3114 AC_WEB_PORT=5184 AC_WEB_ORIGIN=http://127.0.0.1:5184 bun run dev` (kèm `AC_DB_PATH` trỏ vào DB QA), mở `http://127.0.0.1:5184/` và chạy một Playwright CLI session theo [hướng dẫn](evidence/ui01/README.md). Khi ứng dụng thủ công đã chạy ở `http://127.0.0.1:5182/`, chỉ cần refresh trang để nhận HMR; không chạy thêm tiến trình trên hai cổng đang dùng.

## UI-02 — Thiết kế lại lần hai, bằng chứng kỹ thuật và trạng thái duyệt thẩm mỹ (15/11/2026)

**Tách biệt kỹ thuật và thẩm mỹ:** **UI-01 TECHNICAL PASS nhưng VISUAL NOT APPROVED.** Các kết quả PASS của UI-01 ở phía trên là **nghiệm thu kỹ thuật/hành vi tại thời điểm kiểm thử**, **không phải phê duyệt giao diện từ chủ dự án**. Chủ dự án đã xem ảnh UI-01 và xác nhận chưa đạt yêu cầu thẩm mỹ; UI-02 là lần thiết kế lại, không chỉ đổi màu hoặc bo góc. Kết luận này bổ sung cho lịch sử UI-01, không xóa bằng chứng kỹ thuật và nghiệm thu AC-02 đã có.

**Hiện trạng UI-02: TECHNICAL PASS; VISUAL APPROVAL awaiting owner.** Repo `mktminhqpbga-glitch/trader`, nhánh `feat/aiCanvasStudioFoundation`, HEAD đầu vào `72c47566b9b17e46eef3e1e1073c9f99581fb862`. Tham khảo **trực quan từ trang LibTV công khai**, nhưng **không sao chép code, hình ảnh, logo, font hay asset LibTV**. Thay đổi hướng tới Canvas là vùng chính, node media-first gọn, Project Library dạng lưới dự án nhỏ, Inspector trong cột phải riêng; không dựng output ảnh/video giả hoặc điều khiển AI chưa hoạt động.

### Ba bộ Playwright UI-02 đã chạy thật — PASS (phạm vi riêng)

| Bộ kiểm thử | Kết quả thực tế / giới hạn | Trạng thái |
|---|---|---|
| `scripts/ui02-visual-qa.js` | **17 screenshot thật**, trong đó có 6 ảnh responsive Canvas/Library ở **1280×800**, **1024×768**, **390×844**; tương tác create/open/search, palette, **7 node / 3 edge**, chọn/đóng Inspector ở cột phải riêng, cập nhật prompt đồng bộ giữa Inspector và node; **snapshot SQLite chính xác sau reload** bao gồm ID, revision, position, viewport, edge/handle | **PASS (đã chạy)** |
| `scripts/ui02-states-qa.js` | **7 screenshot bổ sung**: chọn Text, prompt dài, menu node, Video ở mép phải vẫn hiển thị không bị Inspector che, Roadmap trung thực, health **503 giả lập → Retry**, PUT **503 giả lập → Retry và bảo toàn draft** | **PASS (đã chạy)** |
| `scripts/ui02-right-edge-qa.js` | **PASS** — tạo 3 node thật, lưu cả 3 sát mép phải bằng API và SQLite QA, reload, click chọn từng Text/Image/Video và kiểm tra inspector không che node, đóng panel vẫn đúng; xác minh tọa độ node **không đổi** qua 3 lần chọn. [Ảnh Playwright](evidence/ui02/UI02-three-nodes-right-edge.png). | **PASS — 3/3 node** |
| Hồi quy **AC-02A/B/C** trên phiên bản UI-02 | **9/9 script Playwright PASS** trên cùng SQLite QA, bao gồm **restart thực tế** với cùng DB: tạo/mở dự án A/B, 3 node/3 edge, nối đúng/sai, xóa dây, xóa node qua menu ba chấm, bảo toàn edge còn lại, pan/zoom/fit, prompt scroll/drag không pan, lỗi SQLite PUT 503/retry, xóa mềm/restore, HTTP 409/revision, so sánh Canvas/Node/Edge IDs, prompt, tọa độ và viewport | **PASS — thực tế** |
| Phê duyệt chất lượng thẩm mỹ UI-02 từ chủ dự án | Chưa được người sở hữu dự án xem và phê duyệt theo tiêu chí thị giác | **AWAITING OWNER — không nhận là aesthetic PASS** |

**Danh mục ảnh thật (17 + 7 PNG từ hai bộ chính và 1 PNG riêng cho mép phải)** tại [docs/evidence/ui02/README.md](evidence/ui02/README.md); các tên ảnh quan trọng để đối chiếu:

- Library và Canvas: [UI02-project-library-empty.png](evidence/ui02/UI02-project-library-empty.png), [UI02-project-library.png](evidence/ui02/UI02-project-library.png), [UI02-canvas-empty.png](evidence/ui02/UI02-canvas-empty.png), [UI02-node-menu.png](evidence/ui02/UI02-node-menu.png), [UI02-one-node.png](evidence/ui02/UI02-one-node.png), [UI02-three-nodes.png](evidence/ui02/UI02-three-nodes.png), [UI02-multiple-nodes.png](evidence/ui02/UI02-multiple-nodes.png).
- Inspector: [UI02-image-selected.png](evidence/ui02/UI02-image-selected.png), [UI02-inspector-open.png](evidence/ui02/UI02-inspector-open.png), [UI02-inspector-closed.png](evidence/ui02/UI02-inspector-closed.png), [UI02-video-selected.png](evidence/ui02/UI02-video-selected.png).
- Responsive **1280×800**: [UI02-project-library-1280x800.png](evidence/ui02/UI02-project-library-1280x800.png), [UI02-multiple-nodes-1280x800.png](evidence/ui02/UI02-multiple-nodes-1280x800.png); **1024×768**: [UI02-project-library-1024x768.png](evidence/ui02/UI02-project-library-1024x768.png), [UI02-multiple-nodes-1024x768.png](evidence/ui02/UI02-multiple-nodes-1024x768.png); **390×844**: [UI02-project-library-390x844.png](evidence/ui02/UI02-project-library-390x844.png), [UI02-multiple-nodes-390x844.png](evidence/ui02/UI02-multiple-nodes-390x844.png).
- Kiểm tra trạng thái bổ sung: [UI02-text-selected.png](evidence/ui02/UI02-text-selected.png), [UI02-long-prompt.png](evidence/ui02/UI02-long-prompt.png), [UI02-node-context-menu.png](evidence/ui02/UI02-node-context-menu.png), [UI02-inspector-right-edge.png](evidence/ui02/UI02-inspector-right-edge.png), [UI02-roadmap-menu.png](evidence/ui02/UI02-roadmap-menu.png), [UI02-api-disconnected.png](evidence/ui02/UI02-api-disconnected.png), [UI02-save-error.png](evidence/ui02/UI02-save-error.png).

Ảnh [UI02-inspector-edge-check.png](evidence/ui02/UI02-inspector-edge-check.png) cũng có trong thư mục, là **tư liệu bổ sung không thuộc 17 + 7 screenshot của hai script trên**, không suy diễn thành một testcase PASS. Hai script chạy tại Web QA **5184**, API QA **3114** và SQLite thử nghiệm riêng, không chạm phiên người dùng `5182/3112`; 503 ở các bước lỗi chỉ được **mô phỏng trên request QA**. Chưa có tác vụ AI/AI output, Storyboard, Asset Library, Camera, hàng chờ, hậu kỳ, export hay Desktop hoạt động. **Tổng tiến độ 3 giai đoạn giữ nguyên 40%.**


### Kết quả cập nhật sau khi chạy hồi quy UI-02 (15/11/2026)

**TECHNICAL PASS — đã kiểm chứng:** trên nhánh `feat/aiCanvasStudioFoundation` sau thay giao diện, một Playwright session `ui02` dùng Web `127.0.0.1:5184`, API `3114`, SQLite thử nghiệm riêng `/tmp/ui02-qa/studio.sqlite`. Các bài **9/9 PASS** thực sự (không lấy lại kết quả UI-01):

| Script hồi quy UI-02 | Trạng thái và bằng chứng |
|---|---|
| `ac02a-browser-flow.js` | **PASS** — Project A/B, Text, drag, pan/zoom/fit, autosave/refresh/viewport |
| `ac02b-browser-flow.js` | **PASS** — Text/Image/Video, ba dây hợp lệ, HTTP 400 cho dây sai/trùng, xóa edge, SQLite |
| `ac02c-browser-flow.js` | **PASS** — rename/soft-delete/restore, project A/B độc lập, 3 edges và revision không đổi khi CRUD |
| `ac02c-browser-ui-audit.js` | **PASS** — Cancel không gọi PATCH/DELETE, Trash 503 và retry, xóa dự án đang mở/restore |
| `ac02c-browser-revision-conflict.js` | **PASS** — 409 giữ local draft và bản lưu mới phía server, chỉ reload khi xác nhận |
| `ac02a-browser-restart-failure.js` | **PASS sau restart thực** — cùng SQLite QA, lỗi PUT 503 giữ bản nháp, retry ghi thành công |
| `ac02b-browser-restart.js` | **PASS sau restart thực** — mở menu ⋯ thật rồi xác nhận xóa Image, giữ đúng Text→Video Edge ID/positions |
| `ac02b-browser-connected-drag.js` | **PASS sau restart thực** — node kéo vẫn nối dây, prompt scroll/mousedown không kéo/zoom Canvas, revision tăng |
| `ac02c-browser-restart.js` | **PASS sau restart thực** — dự án A/B, Canvas/node/edge IDs, viewport, revision, 3 edge sau reload giữ nguyên |

**Hồi quy UI-01 trên UI-02 cũng PASS:** chạy lại `scripts/ui01-visual-qa.js` và `scripts/ui01-failover.js` bằng bản script tạm trong `/tmp/ui02-qa/`, đổi **chỉ thư mục ảnh output sang `/tmp/ui02-qa/compat-ui01`** để không ghi đè 35 ảnh UI-01. Kết quả: thư viện và Node Palette tìm kiếm, 3 edge thật, Inspector cập nhật dữ liệu, dialogs Cancel, reload SQLite snapshot, 503 retry, 409 conflict đều **PASS**. Không có pageerror. Các screenshot UI-01 lịch sử vẫn nguyên vẹn.

**Lưu ý:** Có một lỗi CSS thực của UI-02 ban đầu khiến Drawer ẩn dù DOM hiện diện. Đã tìm đúng nguyên nhân: selector `:global(...)` trong `ProjectLibrary.vue` phát sinh `.canvasLibraryDrawer {display:none}` ngoài ý muốn; đã sửa selector và kiểm tra trực tiếp lại Playwright Drawer hiển thị ở x=51, width=346 với danh sách dự án. Sau sửa, 9/9 hồi quy chạy PASS. Không sửa backend/schema/API. Tương tác delete node vẫn dùng MapID cũ `AC.CANVAS.NODE.DELETE`, nhưng được mở qua menu ba chấm thật, test được cập nhật thao tác tương ứng mà **không giảm assertion**.

**VISUAL APPROVAL: CHỜ CHỦ DỰ ÁN DUYỆT**. Đây là điều kiện tách biệt với TECHNICAL PASS; Issue [UI-02 #4](https://github.com/mktminhqpbga-glitch/trader/issues/4) phải giữ **OPEN**. Không suy diễn "đẹp" hoặc "giống LibTV" từ screenshot hay build. Các tính năng AI/media provider, Storyboard, Camera, Timeline, Queue, Lip-Sync, Export, Desktop vẫn ngoài phạm vi và **NOT TESTED**.

## UI-02 — Lệnh 1/5: Kiểm tra và chuẩn bị phương án A/B (15/11/2026)

**Phạm vi:** chỉ sửa hai preview đã tồn tại và QA/CI/tài liệu, không viết lại production, không chuyển Lệnh 2, không đổi API/SQLite/ID thật. Đầu vào branch `feat/aiCanvasStudioFoundation` commit `58fb07895926b125825baae5eb8eac22f9b59ad8`.

**Bằng chứng Chromium:** `scripts/ui02-design-preview-qa.js` chạy Playwright 1.65.1 trên Vite DEV riêng `127.0.0.1:5193` (không chạy backend), **exit 0**, tạo **64 screenshot thật — 32 A và 32 B**; kiểm tra **34 lần** trạng thái graph SVG trong DOM và **40 bước** tương tác, `apiCalls=[]`, `errors=[]` (JavaScript pageerrors). Không coi đây là owner visual approval.

| Trạng thái thực | A | B |
|---|---|---|
| Đúng 3 node + 3 path SVG edge có ID thật | PASS | PASS |
| Chuyển 7 node + 5 edge, về 3 node, empty | PASS | PASS |
| Image/Video DEMO và compact, có poster và native controls | PASS UI | PASS UI |
| Kéo node bằng chuột, Pan, Zoom, Fit | PASS | PASS |
| Toolbar, menu mở/đóng, palette search/add, Escape | PASS | PASS |
| Inspector mở/đóng, prompt đồng bộ, Video sát mép phải không bị che | PASS | PASS |
| Library DEMO: nhiều/trống, tìm, tạo, đổi tên, thùng rác, khôi phục, reset sau reload | PASS | PASS |
| Responsive 1920,1280,1024,390, không tràn trang | PASS | PASS |
| Request `/api` hoặc websocket/ghi SQLite | **0** | **0** |
| VISUAL APPROVAL chủ dự án | CHỜ DUYỆT | CHỜ DUYỆT |

**Lỗi được sửa đúng nguyên nhân:** VueFlow kiểm tra `isValidConnection` khi hydrate edge; đoạn chống trùng cũ từ chối chính edge vì source/target bằng một item đã có (cùng ID), làm 3 demo edges không xuất hiện. Validator mới bỏ qua chính ID trong hydrate nhưng tiếp tục từ chối nối trùng mới. Inspector dock B thu hẹp stage; `ensureNodeVisible` mới dịch *viewport* khi node được chọn ra khỏi stage, giữ nguyên node tọa độ/ID. Script QA trước đó đọc transform từ `.vue-flow__viewport` (không có style) gây timeout Pan giả; sửa theo DOM `.vue-flow__transformationpane` và xác nhận drag chuột đổi transform thực >12px.

**Bun:** `bun install --frozen-lockfile` PASS (95 installs, no changes), `bun run typecheck` PASS cả web/server; `bun run build` PASS (Vite chunk-size warning >500kB); `bun test apps/server/src/index.test.ts` **10 PASS, 282 assertions**; `git diff --check` PASS. Production output không chứa marker preview, Chromium production URL `?designPreview=A` mount App thật, không có `AC.UI02.PREVIEW.ROOT`. Production health hiển thị mất kết nối vì không chạy backend trong phép kiểm riêng này, **không có sửa API/database**.

**Modern Web Guidance:** `npx modern-web-guidance@latest search/retrieve` đã chạy thành công cho `css-layout`, `dialog`, `natural-interactions`; **không xác minh cài Codex plugin**. CSS `:focus-visible`, native dialog, responsive/reduced-motion đã có; chỉ bổ sung modal/backdrop `overscroll-behavior` theo guide phù hợp. Không nhận đạt WCAG nếu chưa audit đầy đủ.

**Ngoài phạm vi/chưa xác minh:** playback thực sự của video CC0 từ MDN chưa kiểm tra qua mạng (chỉ controls và poster), khi Fit 3 node trên mobile 390px thì chữ nhỏ, cần zoom/pan; media AI chưa có, status offline/503/409 trong preview chỉ mô phỏng UI. GitHub Actions cũ [43682513204](https://github.com/mktminhqpbga-glitch/trader/actions/runs/43682513204) FAILED trước sửa, run sau push phải kiểm tra riêng (không tự nhận PASS). Workflow mới chỉ upload artifact khi QA PASS và không tự push. Bằng chứng: [32 ảnh A](evidence/ui02/review-A/README.md), [32 ảnh B](evidence/ui02/review-B/README.md), [bảng so sánh](design/UI02_DESIGN_COMPARISON.md). **Issue #4 OPEN; CHỜ CHỦ DỰ ÁN DUYỆT / CHỌN A HOẶC B; dừng sau Lệnh 1.**
