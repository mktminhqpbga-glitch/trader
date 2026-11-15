# UI-02 · Lệnh 2/5 — QA App Shell, Canvas và Toolbar (Design Preview A/B)

**Trạng thái: TECHNICAL PASS (Chromium thực tế, 15/11/2026) · VISUAL APPROVAL: PENDING OWNER.** Prime đã chạy lại `scripts/ui02-shell-qa.js` trên phiên Chromium chung `ui02shell2` tại Vite DEV `127.0.0.1:5193`: **exit 0, 10/10 cặp viewport–phương án, 40/40 PNG (20 A, 20 B)**. Kết quả có `assertedApplicationRequests: 0`, `pageErrors: []`, các phép đo không tràn ngang/không chồng lấn, nút có tooltip và focus, menu/thư viện/Palette/Zoom/Fit thật, Vue Flow SVG 3/3 và 7/5 cạnh. Có 30 WebSocket HMR nội bộ Vite DEV, không phải WebSocket ứng dụng. Lượt đầu tạo 39 ảnh và FAIL do assertion cũ yêu cầu Inspector B mobile overlay; sau khi sửa assertion theo dock phía dưới đã có trong CSS thực tế, **lượt chạy lại PASS** mà không thay đổi bố cục ứng dụng để chiều theo phép thử lỗi thời.

## Phạm vi

- Preview chỉ chạy trong Vite DEV qua `?designPreview=A` hoặc `?designPreview=B`, dữ liệu mẫu chỉ ở bộ nhớ tab.
- Phương án A: Canvas rộng, dock nổi gồm **4 nút Add / Library / Fit / More**. More phải mở menu và thao tác thật: chuyển workflow sang 7 node, bật/tắt media DEMO. Inspector nổi.
- Phương án B: Scene Navigator, Canvas toolbar, filmstrip trên màn hình lớn, Inspector trong cột dock; tại 390px filmstrip ẩn và Inspector là **dock phía dưới Canvas**, không chồng lấp vùng Canvas có thể thao tác.
- Giữ đúng **3 node + 3 cạnh SVG** (Text → Image, Image → Video, Text → Video), **7 node + 5 cạnh SVG**, Canvas trống và thêm Text từ empty state. Kiểm tra việc chuyển A/B, mở/đóng Palette, nút phóng to/thu nhỏ/Fit bằng transform Vue Flow thật.
- Kiểm tra header có DEMO badge, tooltip/title, nhãn truy cập, điều hướng bằng focus, vùng nhấn không bị che, không tràn ngang và không chồng header/dock/toolbar. Inspector phải đóng được.
- Ghi lỗi JavaScript, request tới `/api`/`/ws`/`/socket.io` và WebSocket ứng dụng nếu phát sinh. Kết nối HMR trên đường dẫn `/` của chính máy chủ Vite DEV được ghi số lượng riêng vì đó là kết nối nội bộ của công cụ phát triển.

## Cách chạy

Khởi động bản Vite DEV tại cổng thử nghiệm riêng (ví dụ `5193`). Prime sử dụng phiên Chromium/Playwright chung của nhóm và chạy tại thư mục repository `/kkk`:

```bash
npx --yes playwright@1.65.1 cli -s=ui02shell open 'http://127.0.0.1:5193/?designPreview=A'
npx --yes playwright@1.65.1 cli -s=ui02shell run-code --filename scripts/ui02-shell-qa.js
```

Script lấy `origin` từ tab đã mở nên không cố định cổng. Nó chuyển lần lượt A/B ở từng kích thước, mỗi lần tải lại trạng thái mẫu qua query và chỉ chụp sau khi DOM Vue Flow đủ node và cạnh SVG. Không tạo browser/session riêng trong script, không ghi dữ liệu backend, không gửi tác vụ AI.

## Ma trận 40 ảnh đã chụp và xác minh

**Chính xác 5 viewport × 2 phương án × 4 trạng thái = 40 PNG.** Tất cả 40 file đã có trên đĩa sau khi Playwright trả PASS; tên `A|B-WIDTHxHEIGHT-STATE.png`, lưu ngay trong thư mục này. Ảnh A/B được chụp cùng trạng thái, cùng viewport để đối chiếu.

| Viewport | Phương án A (4 ảnh) | Phương án B (4 ảnh) |
|---|---|---|
| 1920 × 1080 | `A-1920x1080-{three,empty,seven,inspector}.png` | `B-1920x1080-{three,empty,seven,inspector}.png` |
| 1440 × 900 | `A-1440x900-{three,empty,seven,inspector}.png` | `B-1440x900-{three,empty,seven,inspector}.png` |
| 1280 × 800 | `A-1280x800-{three,empty,seven,inspector}.png` | `B-1280x800-{three,empty,seven,inspector}.png` |
| 1024 × 768 | `A-1024x768-{three,empty,seven,inspector}.png` | `B-1024x768-{three,empty,seven,inspector}.png` |
| 390 × 844 | `A-390x844-{three,empty,seven,inspector}.png` | `B-390x844-{three,empty,seven,inspector}.png` |

`three`: workflow chuẩn 3 node, 3 cạnh, media compact. `empty`: Canvas 0 node, 0 cạnh, empty call-to-action. `seven`: 7 node, 5 cạnh. `inspector`: trạng thái `seven` đã chọn scene thật và mở Inspector. Cả hai phương án dùng cùng bộ dữ liệu mẫu và cùng chế độ media compact.

Các thao tác có thay đổi trạng thái như thêm node, click More, đổi media, zoom và chuyển sang thư viện được kiểm chứng **sau ảnh trạng thái gốc**. Trước khi chuyển sang trạng thái ảnh tiếp theo, script tải lại trang DEV để không lẫn thay đổi thử nghiệm.

## Điều kiện nghiệm thu kỹ thuật

Script đã trả về `result: PASS — live DEV preview shell QA only; visual approval remains with project owner`, `cases: 10`, `screenshotCount: 40`, `assertedApplicationRequests: 0`, `pageErrors: []`, cùng ma trận 40 đường dẫn. Kịch bản sử dụng native Vue Flow transform và DOM, không kiểm tra giả bằng nhãn đếm; mỗi assertion sai sẽ khiến script dừng và trả exit code khác 0.

Browser QA không đủ quyền kết luận các file production của Git đã giữ nguyên. Prime cần xem `git diff --name-only` và `git status --short` để xác minh phạm vi thay đổi của cả Lệnh 2/5. Worker phụ trách phần này chỉ tạo `scripts/ui02-shell-qa.js` và README hiện tại; không sửa app, API, SQLite, QA cũ, không commit/push.

**Duyệt thẩm mỹ (VISUAL APPROVAL): PENDING OWNER.** Kể cả khi Playwright đạt đủ 40 ảnh, quyền lựa chọn/duyệt thiết kế A/B vẫn thuộc chủ dự án.
