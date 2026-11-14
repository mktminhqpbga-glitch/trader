# UI-01 — Bằng chứng giao diện và kịch bản tái lập

**Phạm vi:** AI Canvas Studio trên repository `trader`, nhánh `feat/aiCanvasStudioFoundation`. Bộ ảnh **before/after** và ảnh lỗi **503/409** tại thư mục này được nhóm chính chụp bằng Playwright trên giao diện thật; đây **không phải ảnh, mã nguồn, hoặc tài sản lấy từ LibTV**. LibTV chỉ là tham khảo về phong cách. Các script được chuyển thể từ kịch bản đã chụp ảnh, và **đã chạy lại PASS trong một phiên Playwright CLI thực tế** trên DB QA tách biệt. Ảnh lịch sử không bị ghi đè khi kiểm tra lại: kết quả screenshot mới tạm đặt ở `/tmp/ui01-evidence-test/qa-after/`. Kết luận nghiệm thu UI-01 tổng hợp ở `docs/acceptance.md`.

## Ảnh bằng chứng chính

| Mục | Trước UI-01 | Sau UI-01 |
|---|---|---|
| Thư viện dự án (desktop) | [before-library-1440x900.png](./before-library-1440x900.png) | [after-library-1440x900.png](./after-library-1440x900.png) |
| Thư viện dự án (mobile) | [before-library-390x844.png](./before-library-390x844.png) | [after-library-390x844.png](./after-library-390x844.png) |
| Canvas trống (desktop) | [before-canvas-empty-1440x900.png](./before-canvas-empty-1440x900.png) | [after-canvas-empty-1440x900.png](./after-canvas-empty-1440x900.png) |
| Canvas workflow (desktop) | [before-workflow-1440x900.png](./before-workflow-1440x900.png) | [after-workflow-1440x900.png](./after-workflow-1440x900.png) |
| Canvas workflow (mobile) | [before-workflow-390x844.png](./before-workflow-390x844.png) | [after-workflow-390x844.png](./after-workflow-390x844.png) |
| Chọn node | — | [after-image-selected-inspector-1440x900.png](./after-image-selected-inspector-1440x900.png), [after-video-selected-inspector-1440x900.png](./after-video-selected-inspector-1440x900.png) |
| Palette / tìm node | [before-node-menu-1440x900.png](./before-node-menu-1440x900.png) | [after-node-palette-1440x900.png](./after-node-palette-1440x900.png), [after-palette-search-1440x900.png](./after-palette-search-1440x900.png) |
| Drawer / hộp thoại / đóng panel | — | [after-project-drawer-1440x900.png](./after-project-drawer-1440x900.png), [after-rename-dialog-1440x900.png](./after-rename-dialog-1440x900.png), [after-delete-dialog-1440x900.png](./after-delete-dialog-1440x900.png), [after-panels-closed-1440x900.png](./after-panels-closed-1440x900.png) |
| API lưu lỗi / xung đột | — | [after-api-503-1440x900.png](./after-api-503-1440x900.png), [after-api-409-1440x900.png](./after-api-409-1440x900.png) |

Ngoài các ảnh trên còn có các kích thước **1280×800** và **1024×768** cho thư viện, Canvas trống và workflow. Tên ảnh theo mẫu `before-*` và `after-*` để đối chiếu; bản `before` là ảnh lịch sử, script UI-01 chỉ tạo lại ảnh `after`.

## Cách chạy lại an toàn

Chạy từ **thư mục gốc repository**. Dùng **database thử nghiệm tách biệt** và port Web `5184` / API `3114` để không truy cập DB thủ công hoặc phiên ứng dụng của người dùng (đặc biệt không dùng port `5182` vốn có thể đã được dùng cho các bài AC-02). Kiểm tra hai port đang rảnh trước khi chạy. Playwright CLI `run-code` sandbox **không có `process.env`**: hai script chủ động dùng URL cố định `http://127.0.0.1:5184/`, không sử dụng biến môi trường trong callback.

Terminal 1 — tạo DB tạm mới và chạy Web/API trên loopback:

```bash
cd /duong-dan-den/trader
QA_DIR="$(mktemp -d /tmp/ui01-qa-XXXXXX)"
AC_DB_PATH="$QA_DIR/studio.sqlite" \
AC_PORT=3114 AC_WEB_PORT=5184 \
AC_WEB_ORIGIN=http://127.0.0.1:5184 \
bun run dev
```

Terminal 2 — Playwright CLI 1.65.1, dùng **một session**:

```bash
cd /duong-dan-den/trader
npx --yes playwright@1.65.1 cli -s=ui01qa open http://127.0.0.1:5184/
npx --yes playwright@1.65.1 cli -s=ui01qa run-code --filename scripts/ui01-visual-qa.js
npx --yes playwright@1.65.1 cli -s=ui01qa run-code --filename scripts/ui01-failover.js
npx --yes playwright@1.65.1 cli -s=ui01qa close
```

Nếu port `5184` đã bận thì **không chạy đè lên ứng dụng sẵn có**: chọn port thử nghiệm khác, sửa hằng `webUrl` trong cả hai script và thay `AC_WEB_PORT`/`AC_WEB_ORIGIN` cùng URL `cli open` cho nhất quán. Không chạy Playwright đồng thời với session của nhóm chính; chỉ kiểm thử khi có quyền sử dụng phiên thử nghiệm. Kết thúc thì dừng **đúng** tiến trình dev do mình đã khởi tạo. Thư mục `$QA_DIR` giữ dữ liệu phục vụ đối chứng đến khi người chạy chủ động xóa.

**Hành vi của hai script:**

- `scripts/ui01-visual-qa.js` tạo **dự án có tên duy nhất** cho mỗi lượt chạy, thử lọc danh sách dự án theo chính tên đó, chụp ảnh ở 1440×900, 1280×800, 1024×768 và 390×844; tìm/tạo Text/Image/Video, nối 3 dây thực, sửa prompt bằng Inspector, mở/đóng drawer và dialog, kiểm tra nút Hủy không gửi PATCH/DELETE, đối chiếu Canvas snapshot (ID, revision, viewport, prompt và edge) sau reload. Ghi đè **chỉ** ảnh `after-` tương ứng trong thư mục bằng chứng.
- `scripts/ui01-failover.js` chạy độc lập bằng một **dự án khác có tên duy nhất**: tạo Text/Image và xác nhận SQLite đã lưu, giả lập HTTP **503 cho PUT Canvas của dự án thử nghiệm**, chụp trạng thái lỗi và kiểm tra prompt chưa lưu vẫn còn; bỏ chặn và bấm Retry để nhận ACK SQLite; tạo PUT thành công từ “tab khác” để tăng revision rồi sửa prompt local, kiểm tra UI báo **409** và cả local draft lẫn bản server mới được giữ. Ghi đè riêng hai ảnh `after-api-503-1440x900.png` và `after-api-409-1440x900.png`.

Kết quả script phải trả `result: 'PASS'` và không ném exception. Hai script **ghi dữ liệu thử nghiệm và ảnh**, không chỉ đọc; vì vậy bắt buộc dùng `AC_DB_PATH` tạm. Không có lệnh gọi AI trả phí, tạo media thật, extension hay asset LibTV. Nếu test thất bại thì giữ lỗi/ảnh để QA phân tích; không gắn nhãn nghiệm thu hoàn tất nếu chưa có bằng chứng của nhóm chính.

## Kiểm tra tĩnh script (không mở browser)

```bash
node --check scripts/ui01-visual-qa.js
node --check scripts/ui01-failover.js
git diff --check
```

**Đã kiểm chứng runtime:** `scripts/ui01-visual-qa.js` trả `result: PASS` (4 viewports, 3 edge, tìm kiếm, Inspector, project dialogs, reload snapshot, không có `pageerror`); `scripts/ui01-failover.js` trả `result: PASS` (503 giữ local draft và Retry lưu, revision 409 giữ hai phiên bản), khi chạy trong session `ui01` trên DB QA riêng. Báo cáo tổng hợp nằm ở `docs/acceptance.md` và `progressReport.html`.
