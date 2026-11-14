# UI-02 — bằng chứng thiết kế lại AI Canvas Studio

**Ngày:** 15/11/2026 · **Repo:** `mktminhqpbga-glitch/trader` · **Nhánh:** `feat/aiCanvasStudioFoundation` · **HEAD đầu vào:** `72c47566b9b17e46eef3e1e1073c9f99581fb862`.

## Trạng thái nghiệm thu

- **UI-01: TECHNICAL PASS nhưng VISUAL NOT APPROVED.** UI-01 đã qua các ca chức năng trước đây nhưng **chủ dự án không duyệt thẩm mỹ**. Không hiểu kết quả kỹ thuật UI-01 là phê duyệt thiết kế.
- **UI-02: TECHNICAL PASS; VISUAL APPROVAL awaiting owner.** Ba bộ kiểm thử UI-02 bên dưới **đã chạy thật và PASS** trên Web/API/SQLite thử nghiệm tách biệt; hồi quy AC-02A/B/C **9/9 PASS** sau khi chạy thực tế, bao gồm restart server với cùng SQLite QA. Không đánh dấu UI-02 là nghiệm thu thẩm mỹ.
- **Tổng tiến độ dự án: 40% (không thay đổi)**. Chưa triển khai AI gửi/nhận tác vụ thật, Storyboard, Camera, Asset Library, Timeline, hậu kỳ, xuất video hoặc Desktop. Không có media/AI output giả.

UI-02 dùng trang **LibTV công khai làm tham chiếu định hướng thị giác** (nhịp bố cục Canvas, mật độ các node, panel thuộc tính và thư viện) nhưng **không sao chép mã nguồn, hình ảnh, logo, phông chữ hay asset của LibTV**. Đây là screenshot của ứng dụng `trader` thật, không phải mockup. Việc mô phỏng trạng thái lỗi 503 chỉ thực hiện trên phiên QA và request test; không chứng tỏ dịch vụ AI đã kết nối.

## Bộ 1 — `scripts/ui02-visual-qa.js` (PASS)

Playwright CLI **1.65.1**, Web thử nghiệm `http://127.0.0.1:5184/`, API thử nghiệm cổng `3114`, SQLite QA riêng biệt. Bộ script đã thao tác trên giao diện thật và tạo **17 ảnh PNG**, gồm 6 ảnh responsive tại **1280×800, 1024×768, 390×844**. Đã xác nhận:

- Tạo và tìm kiếm dự án thật, mở Canvas, dùng Node Palette tìm/lọc loại node.
- Tạo **7 node**, nối **3 edge bằng chuột thật** và đối chiếu dữ liệu Canvas qua SQLite/API.
- Chọn Image/Video, mở/đóng Inspector; Inspector nằm ở **cột dành riêng bên phải**, không phủ Canvas; sửa prompt trong Inspector cập nhật nội dung node tương ứng.
- So sánh **chính xác snapshot SQLite** gồm Canvas ID, revision, viewport, node ID, loại, tọa độ, nội dung và edge IDs/handles **sau reload**; kiểm tra không có JavaScript page errors.

| Ảnh chụp thật | Tình huống |
|---|---|
| [UI02-project-library-empty.png](UI02-project-library-empty.png) | Thư viện khi chưa tạo dự án QA |
| [UI02-canvas-empty.png](UI02-canvas-empty.png) | Canvas trống sau khi tạo dự án |
| [UI02-project-library.png](UI02-project-library.png) | Thư viện có các dự án QA |
| [UI02-node-menu.png](UI02-node-menu.png) | Menu thêm node và tìm loại node |
| [UI02-one-node.png](UI02-one-node.png) | Canvas một node |
| [UI02-three-nodes.png](UI02-three-nodes.png) | Text/Image/Video cùng workflow |
| [UI02-image-selected.png](UI02-image-selected.png) | Node Image được chọn |
| [UI02-inspector-open.png](UI02-inspector-open.png) | Inspector đang mở |
| [UI02-inspector-closed.png](UI02-inspector-closed.png) | Inspector được đóng bằng nút thật |
| [UI02-video-selected.png](UI02-video-selected.png) | Node Video được chọn |
| [UI02-multiple-nodes.png](UI02-multiple-nodes.png) | Canvas 7 node, 3 edge |
| [UI02-multiple-nodes-1280x800.png](UI02-multiple-nodes-1280x800.png) | Canvas responsive 1280×800 |
| [UI02-project-library-1280x800.png](UI02-project-library-1280x800.png) | Thư viện responsive 1280×800 |
| [UI02-multiple-nodes-1024x768.png](UI02-multiple-nodes-1024x768.png) | Canvas responsive 1024×768 |
| [UI02-project-library-1024x768.png](UI02-project-library-1024x768.png) | Thư viện responsive 1024×768 |
| [UI02-multiple-nodes-390x844.png](UI02-multiple-nodes-390x844.png) | Canvas responsive 390×844 |
| [UI02-project-library-390x844.png](UI02-project-library-390x844.png) | Thư viện responsive 390×844 |

## Bộ 2 — `scripts/ui02-states-qa.js` (PASS)

Script đã chạy trên phiên QA tách biệt, kiểm tra **7 trạng thái bổ sung**, tạo **7 ảnh PNG**:

| Ảnh chụp thật | Tình huống được kiểm thử |
|---|---|
| [UI02-text-selected.png](UI02-text-selected.png) | Node Text được chọn và Inspector xuất hiện |
| [UI02-long-prompt.png](UI02-long-prompt.png) | Prompt dài vẫn chỉnh sửa được, node không phình quá giới hạn đã kiểm |
| [UI02-node-context-menu.png](UI02-node-context-menu.png) | Menu ⋯ của node với hành động xóa thật; mở rồi đóng |
| [UI02-inspector-right-edge.png](UI02-inspector-right-edge.png) | Node Video ở mép phải vẫn hiển thị trong vùng Canvas, Inspector không che phủ |
| [UI02-roadmap-menu.png](UI02-roadmap-menu.png) | Roadmap hiển thị tính năng `Sắp phát triển` đúng sự thật |
| [UI02-api-disconnected.png](UI02-api-disconnected.png) | Phản hồi health 503 mô phỏng, trạng thái mất kết nối, rồi Retry thành công |
| [UI02-save-error.png](UI02-save-error.png) | PUT 503 mô phỏng, bản nháp còn nguyên; Retry ghi nhận nội dung vào SQLite |

Ảnh [UI02-inspector-edge-check.png](UI02-inspector-edge-check.png) cũng tồn tại trong thư mục bằng chứng, **không nằm trong danh sách 17 + 7 ảnh do hai script trên ghi nhận**; giữ riêng như tài liệu bổ sung, không tính thành ca PASS của các script trên.

## Bộ 3 — `scripts/ui02-right-edge-qa.js` (PASS, ba node sát mép phải)

Sau hai bộ trên, kịch bản Playwright bổ sung tạo một **project thật** với đúng **Text/Image/Video**, dùng `PUT /api/projects/:id/canvas` của ứng dụng thật trên **SQLite QA riêng** để lưu tọa độ ba node sát mép phải ở viewport 1440×900, sau đó **reload** và click chọn từng node trong UI mới. Kiểm tra đủ cả 3 node nằm trọn trong vùng `.canvasStage`, Inspector chiếm cột riêng không che node, đóng Inspector không làm mất lựa chọn/dữ liệu; đối chiếu bằng API chứng minh **không thay đổi tọa độ của cả ba node** sau khi chọn. **PASS 3/3 lần chọn**, SQLite readback PASS. [Ảnh Playwright UI02-three-nodes-right-edge.png](UI02-three-nodes-right-edge.png) chụp trạng thái chọn Video, cả ba node sát mép phải vẫn nhìn thấy. Đây là test setup vị trí qua API thật, không mô phỏng ảnh/AI hay thay SQLite người dùng.

## Cách kiểm tra lại / giới hạn

Ba script được viết cho Playwright CLI dùng **một browser session QA**, tại Web `5184` và API `3114`. Chúng **tạo dữ liệu dự án thử nghiệm và ảnh chụp** tại chính thư mục này, và `ui02-states-qa.js` / `ui02-right-edge-qa.js` chạy sau `ui02-visual-qa.js`. Chỉ chạy khi Web/API dùng **`AC_DB_PATH` trỏ tới SQLite QA tạm riêng biệt**; không trỏ vào database người dùng, không chạy đồng thời nhiều phiên Playwright điều khiển cùng cửa sổ, không chiếm cổng `5182/3112` của ứng dụng đang sử dụng.

```bash
# Sau khi khởi chạy QA Web/API với DB riêng ở cổng 5184/3114:
npx --yes playwright@1.65.1 cli -s=ui02 run-code --filename scripts/ui02-visual-qa.js
npx --yes playwright@1.65.1 cli -s=ui02 run-code --filename scripts/ui02-states-qa.js
npx --yes playwright@1.65.1 cli -s=ui02 run-code --filename scripts/ui02-right-edge-qa.js
```

**Đã xác minh tiếp:** 9/9 kịch bản browser AC-02A/B/C PASS (bao gồm restart thực và 409/503), thêm hai script UI-01 compatibility PASS trên bản UI-02, không ghi đè ảnh UI-01 gốc. **Chỉ còn phê duyệt thẩm mỹ trực tiếp của chủ dự án là CHƯA CÓ.** Không suy ra visual approval từ technical PASS. Giữ các nghiệm thu AC-01/AC-02 và kết quả hồi quy UI-01 trong [biên bản lịch sử](../../acceptance.md), không thay thế bằng bằng chứng UI-02.
