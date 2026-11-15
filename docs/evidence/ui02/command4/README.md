# UI-02 · Lệnh 4/5 — Node Palette, Menu, Inspector và Project Library

**QA KỸ THUẬT: PASS — Chromium thật, 15/11/2026. VISUAL APPROVAL: PENDING OWNER.**
Prime đã chạy lại cùng phiên Playwright `ui02shell2` trên Vite DEV port `5193`, kết quả `result: PASS`, **48/48 PNG thật** (24 A + 24 B) ở **1440×900** và **390×844**, đều xác minh header pixel đúng với tên ảnh. **18 trường hợp A/B PASS, 16 nhóm kiểm tra**, `apiCalls: []`, `pageErrors: []`, **22 Vite HMR WebSocket** được tách riêng (không phải kết nối ứng dụng). `unimplemented: []`, tất cả tám option trạng thái và bảy cảnh báo DEMO đã được đo thực tế.

**Lịch sử lỗi đã sửa, không che giấu:** lượt QA đầu **FAIL sau 10/48 ảnh** tại double-click Confirm Create: native dialog đóng ngay lần nhấn đầu khiến click thứ hai xuyên xuống card và mở Canvas. Mã Vue đã được sửa để thao tác commit đúng một lần và **giữ native dialog top-layer 240ms** trước khi đóng; script chờ dialog thực sự đóng tối đa 1.200ms trước khi tiếp tục. Chromium kiểm tra riêng sau sửa xác nhận từ ba dự án tạo chính xác bốn, dialog đóng và không bị click xuyên; lượt QA thứ hai **PASS đầy đủ 48/48**. Tất cả assertion chống ghost/double-submit/edge vẫn giữ nguyên.

## Chạy trong phiên trình duyệt hiện có

Tại repository `/kkk`, nhánh `feat/aiCanvasStudioFoundation`:

```bash
npx --yes playwright@1.65.1 cli -s=ui02shell2 run-code --filename scripts/ui02-menu-library-qa.js
```

Trước đó phải có tab Playwright cùng phiên mở **Vite DEV** `http://127.0.0.1:5193/?designPreview=A` (hoặc B). Script lấy origin từ `page.url()`, tự chuyển A/B và chỉ tạo ảnh trong thư mục **`docs/evidence/ui02/command4/`**. Không chạy browser/server riêng, không dùng AI, không gọi API, không ghi SQLite, không sửa mã nguồn production.

## Kiểm tra hành vi thực

| Vùng | Tiêu chí phải kiểm qua thao tác Chromium |
|---|---|
| Palette P01–P03 | Cả Text, Image, Video xuất hiện; tìm kiếm `hình`, `video`, `văn`, không khớp; gõ không đóng popup; Esc và click ngoài đóng; dialog không vượt stage/viewport; click mở/tìm không làm pan/zoom; click thêm Video tạo node mới thực `preview-video-added-4` và giữ 3 SVG edges ban đầu |
| Node menu | Menu header có Edit, Inspector, Delete; Edit focus textarea; Inspector mở được; Delete Cancel giữ 3 node/3 cạnh, Confirm xóa Text và hai cạnh liên quan, còn 2 node/1 cạnh |
| Inspector | A nổi bên phải desktop (~320px), **A mobile panel nổi thấp phía dưới** (~320×308px) để node đã chọn vẫn hiển thị, B dock phải desktop (~306px) và **B mobile bottom dock** không phủ Canvas. Mở Inspector không đổi tọa độ **node trong graph** (viewport có thể pan); prompt sửa hai chiều; đóng panel giữ selection và không để lại overlay |
| Library | Ba card với **ba SVG khác nhau** (naturalWidth/Height thật); cover theo khung **16:10**, desktop nhiều cột, mobile một cột; tìm dự án, không tìm thấy và Library Empty; **menu ba thao tác Open / Rename / DeleteSoft**, Open từ menu và card chuyển Canvas, Home trở lại Library |
| Project CRUD | Create có dialog thực, autofocus, không nhận tên rỗng; Cancel, Escape, backdrop không tạo ghost; double-click Confirm chỉ tạo **một** project, dialog giữ top-layer 240ms chống click-through; script **chờ close thực trước bước tiếp**; Rename giữ nguyên Project ID; Soft Delete có Confirm/Cancel, tự mở Trash, Restore; reload khôi phục ba seed projects vì mọi thứ chỉ lưu ở Vue in-memory |
| Trạng thái | Header có badge **DEMO**. `normal` không hiện cảnh báo; bảy trạng thái `empty`, `loading`, `saved`, `unsaved`, `offline`, `save503`, `conflict409` đều hiện thông báo với đúng tên trạng thái, nhãn **TRẠNG THÁI DEMO · KHÔNG GỌI API** và nút dismiss đưa về normal. Chụp riêng đủ bảy ảnh mỗi phương án |
| Hồi quy | Không có `/api` request, WebSocket ứng dụng hoặc `pageerror`. Vite DEV HMR WebSocket tại `/` của cùng host được đếm riêng. Kiểm tra trùng **literal DOM id**; MapID của cùng hành vi trên nhiều card/node có thể lặp hợp lệ |

### Hợp đồng cập nhật theo Vue hiện tại

Prime đã bổ sung sau HEAD đầu vào **b7a3146**: menu dự án có **3 mục**, hành vi xóa mềm tự động mở Trash; dropdown trạng thái có chính xác **8 option** gồm normal và bảy trạng thái nêu trên. Script hiện **bắt buộc** kiểm tra đủ tám option và bảy thông báo/ảnh thật; không còn nhánh `NOT IMPLEMENTED` cho các trạng thái này. Đây là các trạng thái **mô phỏng trong DEV preview**, không chứng minh luồng lưu thật/backend.

## Danh sách **48 ảnh thật đã chụp**

Hai phương án A và B dùng cùng viewport desktop **1440×900** và mobile **390×844**, cùng dữ liệu seed, cùng trạng thái giao diện khi so sánh.

| Cỡ | Trạng thái / tên giữa chuỗi | Nội dung |
|---|---|---|
| Desktop | `palette` | Palette đầy đủ ba mục |
| Desktop | `palette-filter` | Tìm kiếm lọc đúng P01 |
| Desktop | `palette-added` | Thêm Video thành node 4 thực |
| Desktop | `canvas-empty` | Canvas 0 node/0 cạnh, nút Add mở Palette |
| Desktop | `node-menu` | Node Text được chọn, menu có ba thao tác |
| Desktop | `inspector` | Image selected + Inspector đang mở |
| Desktop | `library-grid` | Ba card với cover SVG khác nhau |
| Desktop | `library-search` | Search Neon ra một card |
| Desktop | `library-empty` | Thư viện rỗng |
| Desktop | `create-dialog` | Dialog tạo dự án mẫu |
| Desktop | `rename-dialog` | Dialog đổi tên dự án mẫu |
| Desktop | `project-trash` | Dự án đã xóa mềm trong Trash |
| Desktop | `status-empty` | Trạng thái DEMO Empty |
| Desktop | `status-loading` | Trạng thái DEMO Loading |
| Desktop | `status-saved` | Trạng thái DEMO Saved (không ghi server) |
| Desktop | `status-unsaved` | Trạng thái DEMO Unsaved |
| Desktop | `status-offline` | Cảnh báo DEMO Offline |
| Desktop | `status-save503` | Cảnh báo DEMO Error 503 |
| Desktop | `status-conflict409` | Cảnh báo DEMO Conflict 409 |
| Mobile | `palette` | Palette trong stage 390×844 |
| Mobile | `palette-filter` | Tìm kiếm không đẩy palette ra ngoài |
| Mobile | `palette-added` | Thêm node thật trên màn hình nhỏ |
| Mobile | `mobile-inspector` | A floating / B bottom dock |
| Mobile | `mobile-library` | Project Library một cột |

**Đã xác minh 24 A + 24 B = 48 PNG thực tế**, mỗi file có kích thước pixel đúng với tên. Ví dụ:
`A-palette-1440x900.png`, `B-palette-1440x900.png`,
`A-status-empty-1440x900.png`, `B-status-loading-1440x900.png`,
`A-mobile-inspector-390x844.png`, `B-mobile-library-390x844.png`.
Script đã trả **chính xác 48 đường dẫn khác nhau**, đã đối chiếu đủ 48 file trên đĩa. Mỗi file dạng `docs/evidence/ui02/command4/{A|B}-<state>-{1440x900|390x844}.png`, có thể mở trực tiếp từ repository.

## Kết quả kỹ thuật và trách nhiệm

- `result: PASS`: tất cả assertions đạt, đầy đủ tám trạng thái, đủ 48 PNG.
- `result: PARTIAL`: chỉ dùng khi có thiếu bằng chứng hoặc chức năng thật chưa kiểm chứng; **script phiên này không tự gán PARTIAL khi thiếu option bắt buộc mà báo FAIL**.
- Bất cứ assertion thực tế nào sai: script ném **FAIL** với tên bước và số screenshot đã ghi; ảnh trước lỗi không thể coi là gói bằng chứng hoàn chỉnh.
- Kết quả cấu trúc gồm `cases`, `checks`, `screenshots`, `screenshotCount`, `unimplemented`, `apiCalls`, `pageErrors`, `hmrSockets`, `visualApproval`.

**Giới hạn:** đây là **DEV preview** hoàn toàn trong bộ nhớ. Các trạng thái Empty/Loading/Saved/Unsaved/Offline/503/409 không chứng minh có request/backend hoặc SQLite tương ứng. QA Lệnh 4 kiểm tra chính thức hai cỡ 1440×900 và 390×844; không tự nhận toàn bộ kích thước khác. Build còn cảnh báo bundle JavaScript trên 500kB. Chưa có phê duyệt visual từ chủ dự án, không sửa production, không thực hiện Lệnh 5.

**Đo responsive bổ sung riêng, không cộng ảnh vào bộ 48 PNG:** một smoke Chromium trên cùng phiên kiểm tra **A/B × 1920×1080, 1440×900, 1280×800, 1024×768, 390×844 (10 tổ hợp)**. Kết quả **10/10 tổ hợp đạt**: không overflow ngang tài liệu, menu ba chấm của card nằm trong viewport, Palette nằm trong Canvas stage và viewport, Inspector nằm trong viewport và **không giao vùng chọn node** (intersection 0px² ở cả 10 tổ hợp). Đây là đo DOM geometry/browser, không phải 10 screenshot mới và không mở rộng bài QA hành vi chính ngoài phạm vi đã chụp.

Worker phụ trách chuẩn bị chỉ tạo **`scripts/ui02-menu-library-qa.js`** và **`docs/evidence/ui02/command4/README.md`**; prime chạy Chromium, tạo/kiểm 48 ảnh, xác minh kết quả và commit/push. Không thay đổi bằng chứng Lệnh 1–3. **VISUAL APPROVAL: PENDING OWNER.**
