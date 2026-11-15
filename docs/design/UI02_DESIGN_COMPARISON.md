# UI-02 — So sánh hai phương án Design Preview Vue

**Repository:** mktminhqpbga-glitch/trader · **Nhánh:** feat/aiCanvasStudioFoundation · **Baseline UI-02:** 8efc9aa202a0b08688cee34e1d1120fe79af68b7.

**Trạng thái duyệt:** CẢ HAI PHƯƠNG ÁN ĐANG CHỜ CHỦ DỰ ÁN XEM VÀ CHỌN. Không coi build, Playwright hoặc screenshot PASS là phê duyệt thẩm mỹ.

## Mở bản xem trước tương tác

Khởi chạy Web dev:

    bun install --frozen-lockfile
    bun run dev:web

Mở trong trình duyệt:

- **A — LibTV-inspired Canvas:** http://127.0.0.1:5173/?designPreview=A
- **B — Cinematic Pro Studio:** http://127.0.0.1:5173/?designPreview=B
- **A · 7 node:** http://127.0.0.1:5173/?designPreview=A&scenario=seven
- **B · không có media:** http://127.0.0.1:5173/?designPreview=B&media=compact
- **A · thư viện:** http://127.0.0.1:5173/?designPreview=A&screen=library

Chế độ designPreview chỉ được mount khi import.meta.env.DEV. Với URL thường hoặc bản production, entrypoint mount ứng dụng chính. Chọn A/B bằng nút trên header ngay trong trang. Không cần bật Bun server/SQLite cho bản xem trước.

## Hai phương án khác nhau về cấu trúc

| Quyết định | A — LibTV-inspired Canvas | B — Cinematic Pro Studio |
|---|---|---|
| Trọng tâm | Không gian tự do, node nổi trên Canvas tối toàn màn | Studio dựng cảnh: cột danh sách shot, vùng Canvas, dải ảnh xem cảnh |
| Điều hướng | Dock nổi ở mép trái và cụm zoom/Add góc trái dưới | Scene navigator bên trái, zoom/Add giữa cạnh dưới, filmstrip phía đáy |
| Inspector | Floating 320px ở góc phải, tự pan viewport khi che node được chọn | Inspector dock 306px trên desktop, chiếm một vùng riêng; mobile mở dạng bảng |
| Chuyển trạng thái | Thao tác trực tiếp trên Canvas, panels chỉ mở khi cần | Người dùng có thể chọn cảnh từ scene rail hoặc filmstrip |
| Ngôn ngữ màu | Charcoal / graphite / tím xám nhẹ (#A99AF0) | Graphite xanh than / kem đồng trầm (#D9B79C) |
| Text node | Ghi chú sáng tạo, nhẹ, rộng 274px | Thẻ văn bản của cảnh, rộng 286px và chỉ báo bên trái |
| Image node | Khung ảnh trung tâm, rộng 345px | Thẻ shot gọn góc hơn, rộng 345px |
| Video node | Khung phát 16:9, rộng 375px | Thẻ video của studio dựng cảnh, rộng 365px |
| Roadmap | Dễ bổ sung panel nổi mà không thu hẹp Canvas | Có vị trí trực quan cho Storyboard, Camera và Timeline trong các giai đoạn tương lai |
| Hạn chế | Nhiều node dễ cần zoom/pan và mở Inspector overlay | Với màn nhỏ cột và dải shot chiếm diện tích, nên tự ẩn/thu gọn responsive |

Các kích thước trên là số khai báo trong CSS preview, chưa phải số đo phê duyệt từ ảnh browser.

## Nội dung chung để so sánh công bằng

- 3 node có kết nối: Text → Image → Video, đồng thời Text → Video.
- Bộ 7 node: 2 Text, 3 Image, 2 Video, cùng dữ liệu minh họa cho A/B.
- Chế độ compact: Image/Video chỉ có prompt và trạng thái "Chưa kết nối AI".
- Chế độ media DEMO: các poster SVG do dự án tạo riêng, HTML5 video có controls và ghi nguồn CC0.
- Thư viện card nhận diện theo poster thay vì lặp một placeholder.
- Cùng tương tác: chọn node, kéo node, pan/zoom, fit view, menu, palette tìm kiếm, sửa prompt, Inspector đồng bộ, xác nhận xóa, dự án mẫu, trạng thái lỗi hiển thị.
- Toàn bộ dữ liệu DEMO nằm trong bộ nhớ Vue: khi reload mất các thay đổi thử nghiệm; không gọi SQLite hay AI.

**Cảnh báo nội dung video DEMO:** video hoa từ MDN CC0 là clip thử play/pause; không giả là kết quả AI của prompt phố đêm. Link gốc: https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm.

## Đường dẫn bằng chứng trực quan

Thư mục của các ảnh chụp do Chromium QA tạo:

- [Phương án A](../evidence/ui02/review-A/)
- [Phương án B](../evidence/ui02/review-B/)
- [Giao diện UI-02 lịch sử, chưa được duyệt thẩm mỹ](../evidence/ui02/)
- [Ảnh ba node lịch sử](../evidence/ui02/UI02-three-nodes.png)
- [Ảnh thư viện lịch sử](../evidence/ui02/UI02-project-library.png)

Mỗi phương án yêu cầu ít nhất 20 ảnh chụp cùng viewport 1440×900 theo tên 01–20 (library, empty, node, media, menu, Inspector, lỗi), cộng các ảnh responsive 1920×1080, 1280×800, 1024×768, 390×844. Kịch bản tạo ảnh: scripts/ui02-design-preview-qa.js. Workflow CI: .github/workflows/ui02-design-preview.yml.

Các file ở trên chỉ được coi là ảnh kiểm chứng khi chúng **thực sự tồn tại sau Playwright thành công**. Thư mục có thể chưa có ảnh trong lần xem đầu nếu CI đang thất bại. Không thay tên ảnh UI02 cũ để giả bản mới.

## Phần đã tạo / chưa tạo

| Hạng mục | Trạng thái |
|---|---|
| Vue component cho hai bố cục | IMPLEMENTED in repository |
| Dữ liệu DEMO tách biệt | IMPLEMENTED, in-memory |
| SVG có nguồn gốc rõ ràng | IMPLEMENTED, ảnh do dự án tạo |
| Điều khiển video HTML5 | IMPLEMENTED, cần QA tải và phát qua mạng |
| Inspector/Palette/Menu/Zoom/Pan | IMPLEMENTED in code, BROWSER QA pending |
| Thêm node và kiểm tra kết nối hợp lệ trong preview | IMPLEMENTED in-memory, QA pending |
| Production Vue/SQLite | KHÔNG THAY chức năng, cần chạy regression sau preview |
| Modern Web Guidance plugin trong Codex | Chưa xác minh cài đặt/guide retrieval |
| Ảnh Live Playwright A/B | Chờ kiểm tra workflow CI thực tế |
| VISUAL APPROVAL từ chủ dự án | PENDING |
| AI Bridge, Storyboard, Camera, Timeline, Export | OUT OF SCOPE |

## Quyết định lựa chọn

Sau khi cả hai bản chạy thật, gửi hình A và B ở cùng viewport cho chủ dự án. Chỉ khi được chọn rõ A hoặc B mới chỉnh ứng dụng production. Không tự gộp hai phương án, không tự kết luận đẹp và không đóng Issue #4.

## Kết quả Lệnh 1/5 — Chromium A/B thực tế (15/11/2026)

Checkout nhánh `feat/aiCanvasStudioFoundation` tại HEAD gốc `58fb078` và browser Chromium Playwright CLI 1.65.1 dùng Vite DEV riêng trên cổng `5193`, không chạy backend. Kịch bản `scripts/ui02-design-preview-qa.js` **exit 0: PASS về kỹ thuật**, tạo **64 PNG thật (32 A + 32 B)**. Kết quả `apiCalls: []`, `errors: []` (JavaScript pageerror); các warnings DEV không phải pageerror. Đây không phải phê duyệt mỹ thuật.

| Kiểm tra | Phương án A | Phương án B |
|---|---|---|
| 3 node và 3 SVG edge đúng ID, đường path thật | PASS | PASS |
| 7 node và 5 SVG edge đúng ID | PASS | PASS |
| Empty/three/seven và DEMO/compact | PASS | PASS |
| Kéo node và Pan, Zoom In/Out, Fit bằng chuột/nút thật | PASS | PASS |
| Inspector, prompt đồng bộ, toolbar, menu, Palette, Escape | PASS | PASS |
| Tạo, đổi tên, xóa mềm, khôi phục dự án mẫu trong memory; reset sau reload | PASS | PASS |
| Inspector không che Video sát mép phải | PASS | PASS |
| Responsive 1920×1080, 1280×800, 1024×768, 390×844 không tràn trang | PASS | PASS |
| Request ghi SQLite, AI task, `/api`/websocket trong preview | 0 | 0 |
| VISUAL APPROVAL của chủ dự án | **PENDING** | **PENDING** |

### Đường dẫn ảnh Chromium thật để đối chiếu A/B

| Màn hình | A — LibTV-inspired Canvas | B — Cinematic Pro Studio |
|---|---|---|
| Thư viện dự án | [Ảnh A](../evidence/ui02/review-A/01-project-library.png) | [Ảnh B](../evidence/ui02/review-B/01-project-library.png) |
| 3 node / 3 dây | [Ảnh A](../evidence/ui02/review-A/09-three-nodes-connected.png) | [Ảnh B](../evidence/ui02/review-B/09-three-nodes-connected.png) |
| 7 node / 5 dây | [Ảnh A](../evidence/ui02/review-A/10-seven-nodes-workflow.png) | [Ảnh B](../evidence/ui02/review-B/10-seven-nodes-workflow.png) |
| Image Node có DEMO | [Ảnh A](../evidence/ui02/review-A/07-image-node-with-demo-media.png) | [Ảnh B](../evidence/ui02/review-B/07-image-node-with-demo-media.png) |
| Video Node có DEMO | [Ảnh A](../evidence/ui02/review-A/08-video-node-with-demo-media.png) | [Ảnh B](../evidence/ui02/review-B/08-video-node-with-demo-media.png) |
| Inspector đang mở | [Ảnh A](../evidence/ui02/review-A/15-inspector-open.png) | [Ảnh B](../evidence/ui02/review-B/15-inspector-open.png) |
| Inspector và node sát mép phải | [Ảnh A](../evidence/ui02/review-A/18-right-edge-node-selected.png) | [Ảnh B](../evidence/ui02/review-B/18-right-edge-node-selected.png) |
| Màn hình di động 390×844 | [Ảnh A](../evidence/ui02/review-A/responsive-canvas-390x844.png) | [Ảnh B](../evidence/ui02/review-B/responsive-canvas-390x844.png) |

**Sửa đúng nguyên nhân:** Vue Flow gọi validator cho edge mẫu ngay khi hydrate. Predicate cũ tự coi chính edge có cùng `id` là cạnh trùng, bỏ toàn bộ dây khỏi store (GitHub Actions cũ [run 43682513204](https://github.com/mktminhqpbga-glitch/trader/actions/runs/43682513204): 0 SVG edge khi model 3). Predicate mới bỏ qua self-ID khi nạp edge, vẫn chặn nối trùng mới. B sửa cơ chế pan viewport khi Inspector dock thu hẹp stage, không thay tọa độ node. QA sửa selector Pan từ `.vue-flow__viewport` sang transform thực `.vue-flow__transformationpane`, giữ phép đo mouse drag. Workflow Actions đã đổi quyền read-only, chỉ upload artifact sau QA PASS và không tự commit/push.

**Giới hạn:** Có controls HTML5 và nguồn video DEMO CC0 ngoài mạng nhưng **chưa kiểm chứng play/pause thực qua mạng**; không coi clip là sản phẩm AI. 390×844 khi Fit cả workflow thì node rất nhỏ, cần zoom/pan để chỉnh sửa. **Không tự chọn A/B, không đóng Issue #4, không sang Lệnh 2.**

## Lệnh 2/5 — App Shell, Canvas và Toolbar A/B (15/11/2026)

**Đây là phần bổ sung sau Lệnh 1/5, không thay đổi lịch sử nghiệm thu ở trên.** Mã được đối chiếu từ `apps/web/src/designPreview/designPreview.vue` và `designPreview.css`; ảnh thực tế ở [thư mục QA Lệnh 2](../evidence/ui02/command2/README.md). Lệnh này chỉ chỉnh **preview Vue DEV** (`?designPreview=A|B`), không chuyển A/B vào ứng dụng production, không gửi AI, không tạo tác vụ và không gọi backend API/SQLite.

| Cấu trúc thực tế | A — LibTV-inspired Canvas | B — Cinematic Pro Studio |
|---|---|---|
| App Shell / Header | Header mỏng, breadcrumb `Canvas Studio`, công tắc A/B, chấm **DEMO**, nút thư viện | Header studio xám than/đồng, breadcrumb `Scene Studio`, cùng nút A/B và trạng thái DEMO |
| Tổ chức workspace | Một Canvas tự do rộng, các công cụ nổi bên trên vùng nhìn | **Scene Navigator** bên trái + Canvas ở giữa + **filmstrip** phía dưới trên desktop |
| Điều hướng chính | Dock nổi dọc có **4 nút: Add, Library, Fit, More**. `More` mở menu thao tác thật: bật/tắt media DEMO, xem 7 node, mở Inspector khi đã chọn node, chuyển sang B | Scene Navigator chọn cảnh, nút Add; filmstrip cũng chọn cảnh, không dùng dock nổi A |
| Canvas toolbar dùng chung | Zoom Out, % zoom, Zoom In, Fit, Add ở góc trái dưới | Cùng các thao tác Zoom/Fit/Add nhưng thanh nằm giữa cạnh dưới Canvas |
| Empty state | Nội dung rút gọn “Bắt đầu với một node” và nút Add thật trên vùng Canvas trống | Empty state đặt trong khung studio, cùng hành vi Add thật |
| Inspector desktop | Panel **nổi** khoảng 320px ở bên phải Canvas; có xử lý để node được chọn không nằm dưới panel | Panel **dock** khoảng 306px (thu hẹp theo breakpoint), trong cột riêng ngoài Canvas |
| Mobile **390×844** | Dock A chuyển xuống mép trái gần đáy; toolbar nằm trong Canvas; Inspector A là overlay | Scene Navigator chuyển thành dải ngang trên Canvas; filmstrip ẩn; **Inspector B là bottom dock `position:relative`, nằm bên dưới stage**, không phải overlay lên Canvas |
| Khả năng/giới hạn | Phù hợp thao tác tự do, nhưng trên mobile Fit nhiều node khiến nội dung nhỏ; overlay Inspector có thể giảm diện tích nhìn | Giúp duyệt các cảnh tuần tự, nhưng navigator và bottom Inspector giảm chiều cao Canvas ở mobile; khi Fit 7 node chữ nhỏ |

**Cùng điều kiện so sánh:** 5 viewport **1920×1080, 1440×900, 1280×800, 1024×768, 390×844** × 2 phương án × 4 trạng thái **`three` (3 node/3 edge), `empty` (0/0), `seven` (7 node/5 edge), `inspector` (trên 7 node, chọn cảnh và mở Inspector)**. Cả hai dùng **`media=compact`** cho ảnh ma trận, không giả media sinh từ AI. Shell có status DEMO, `title`/aria-label, menu và Palette thật trong preview. Các trạng thái Offline/503/409 trong dải điều khiển chỉ mô phỏng giao diện và không gọi API.

### 40 ảnh Chromium A/B — ma trận 5 viewport × 4 trạng thái

Các liên kết dưới đây đều trỏ đến PNG đã có trong repository; mỗi ô chứa **three / empty / seven / inspector** theo đúng thứ tự:

| Viewport | A — 4 ảnh | B — 4 ảnh |
|---|---|---|
| **1920×1080** | [three](../evidence/ui02/command2/A-1920x1080-three.png) · [empty](../evidence/ui02/command2/A-1920x1080-empty.png) · [seven](../evidence/ui02/command2/A-1920x1080-seven.png) · [inspector](../evidence/ui02/command2/A-1920x1080-inspector.png) | [three](../evidence/ui02/command2/B-1920x1080-three.png) · [empty](../evidence/ui02/command2/B-1920x1080-empty.png) · [seven](../evidence/ui02/command2/B-1920x1080-seven.png) · [inspector](../evidence/ui02/command2/B-1920x1080-inspector.png) |
| **1440×900** | [three](../evidence/ui02/command2/A-1440x900-three.png) · [empty](../evidence/ui02/command2/A-1440x900-empty.png) · [seven](../evidence/ui02/command2/A-1440x900-seven.png) · [inspector](../evidence/ui02/command2/A-1440x900-inspector.png) | [three](../evidence/ui02/command2/B-1440x900-three.png) · [empty](../evidence/ui02/command2/B-1440x900-empty.png) · [seven](../evidence/ui02/command2/B-1440x900-seven.png) · [inspector](../evidence/ui02/command2/B-1440x900-inspector.png) |
| **1280×800** | [three](../evidence/ui02/command2/A-1280x800-three.png) · [empty](../evidence/ui02/command2/A-1280x800-empty.png) · [seven](../evidence/ui02/command2/A-1280x800-seven.png) · [inspector](../evidence/ui02/command2/A-1280x800-inspector.png) | [three](../evidence/ui02/command2/B-1280x800-three.png) · [empty](../evidence/ui02/command2/B-1280x800-empty.png) · [seven](../evidence/ui02/command2/B-1280x800-seven.png) · [inspector](../evidence/ui02/command2/B-1280x800-inspector.png) |
| **1024×768** | [three](../evidence/ui02/command2/A-1024x768-three.png) · [empty](../evidence/ui02/command2/A-1024x768-empty.png) · [seven](../evidence/ui02/command2/A-1024x768-seven.png) · [inspector](../evidence/ui02/command2/A-1024x768-inspector.png) | [three](../evidence/ui02/command2/B-1024x768-three.png) · [empty](../evidence/ui02/command2/B-1024x768-empty.png) · [seven](../evidence/ui02/command2/B-1024x768-seven.png) · [inspector](../evidence/ui02/command2/B-1024x768-inspector.png) |
| **390×844** | [three](../evidence/ui02/command2/A-390x844-three.png) · [empty](../evidence/ui02/command2/A-390x844-empty.png) · [seven](../evidence/ui02/command2/A-390x844-seven.png) · [inspector](../evidence/ui02/command2/A-390x844-inspector.png) | [three](../evidence/ui02/command2/B-390x844-three.png) · [empty](../evidence/ui02/command2/B-390x844-empty.png) · [seven](../evidence/ui02/command2/B-390x844-seven.png) · [inspector](../evidence/ui02/command2/B-390x844-inspector.png) |

**QA kỹ thuật Lệnh 2: PASS sau chạy lại (prime xác nhận).** `scripts/ui02-shell-qa.js` đã chạy Chromium thật, trả **10 cases / 40 ảnh đầy đủ**, kiểm tra SVG edge IDs/path, kích thước viewport, overflow ngang, hình học header/dock/toolbar, Inspector B bottom dock ở mobile, focus/aria-label/tooltip, hành vi các nút và **0 request API ứng dụng / 0 JavaScript pageerror**. Lượt đầu có **39/40 ảnh** vì một assertion cũ đòi Inspector B 390px thành overlay, trái với thiết kế bottom dock; script được chỉnh assertion để kiểm *đúng* bố cục bottom dock (không `absolute`, top ≥ stage.bottom, không giao cắt stage) mà **không nới điều kiện không chồng lấp**, sau đó rerun PASS. Bun frozen install, typecheck, build và backend test **10/10, 282 assertions** cũng được prime xác nhận; production bundle không có preview markers. Xem [README kỹ thuật Lệnh 2](../evidence/ui02/command2/README.md).

**Hồi quy preview baseline riêng đã PASS:** prime chạy lại `scripts/ui02-design-preview-qa.js` ở môi trường tách biệt, chuyển **chỉ thư mục screenshot sang `/tmp`**, exit 0 và đủ **64/64 ảnh tạm (32 A + 32 B)**. **64 ảnh Lệnh 1 trong Git không bị ghi đè.** Kết quả này xác nhận hợp đồng tương tác preview cũ; không suy ra là hồi quy production AC-02A/B/C hoặc chức năng AI/SQLite.

**Ranh giới nghiệm thu:** hồi quy production AC-02A/B/C **chưa có kết quả mới dành riêng cho Lệnh 2 trong báo cáo này**; kết quả PASS trước đó vẫn thuộc lịch sử UI-02 production. **VISUAL APPROVAL chưa được chủ dự án cấp; A/B đều là phương án để chọn**, không có kết luận phương án nào đẹp hơn. [Issue UI-02 #4](https://github.com/mktminhqpbga-glitch/trader/issues/4) **OPEN**. **Tổng tiến độ 40% không đổi**; không AI/Storyboard/Camera/Timeline/Export và không tự sang Lệnh 3/5.

## Lệnh 3/5 — thiết kế riêng Text / Image / Video Node, giữ bố cục A/B (15/11/2026)

**Phạm vi hiện tại:** nhánh `feat/aiCanvasStudioFoundation`, HEAD đầu vào `ffed3c7`. Đối chiếu `apps/web/src/designPreview/designPreviewNode.vue`, `designPreview.vue` và `designPreview.css`. Cả A và B dùng **cùng logic Vue Flow, node/edge mẫu và MapID**, nhưng khác shell, màu, bo góc và bố trí Inspector như Lệnh 1/2; **không sửa production, không gọi API/SQLite, không AI thật**. Dữ liệu prompt và DEMO chỉ ở bộ nhớ Vue.

| Node / khu vực | A — LibTV-inspired Canvas | B — Cinematic Pro Studio | Cấu trúc và hành vi thực sự có trong code |
|---|---|---|---|
| Shell chung | Card radius 14px, ngôn ngữ graphite/tím; Text 274px, Image 345px, Video 375px | Card radius 12px, xanh than/đồng; Text 286px (thanh nhấn trái), Image 345px, Video 365px | Header kéo node 42px, glyph 26px, tên node; cổng kết nối bên trái/phải theo loại, selected stroke, menu ba chấm |
| **Text** | Ghi chú sáng tạo tương phản tím nhạt trên nền riêng | Ghi chú cảnh với cạnh nhấn trái, nền xám than | **Không dùng khung media**. Textarea sửa thật, chiều cao tự co giãn theo nội dung (68–170px gọn, tối đa 320px khi mở rộng), đếm ký tự, có Mở rộng/Thu gọn; giữ prompt qua đổi selection |
| **Image compact** | Chỉ prompt/summary và nhãn chưa có ảnh, không khung rỗng lớn | Cùng trạng thái logic, style B riêng | **Không render `.previewMedia`** khi `data.demo=false`; prompt dạng bản tóm tắt, click Mở prompt hiện textarea 4 dòng |
| **Image DEMO** | Khung media đặt **trước** prompt, viền và badge DEMO | Khung media-first với bề mặt B, cùng tỷ lệ | Poster SVG local do dự án cung cấp, image modal native `<dialog>` để xem lớn; ảnh dùng `object-fit:contain`, ba khung **1:1 / 16:9 / 9:16** theo `data.aspectRatio` — không crop, không nhận là ảnh AI |
| **Video compact** | Thẻ video gọn không player | Cùng trạng thái compact, style B | Không có thẻ `<video>` khi chưa có DEMO, hiển thị **Chưa có video · Chưa kết nối AI** |
| **Video DEMO** | Player 16:9 đứng trước prompt, badge DEMO / CC0 | Cùng HTML5 player, diện mạo cinematic | `<video controls playsinline muted preload=metadata>`, poster SVG local, `object-fit:contain`; source local `/designPreview/flower-cc0.webm` lấy từ [MDN CC0](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm), không phải video AI tạo |
| **Selected/context** | Toolbar nổi Edit / Inspector / Menu, menu ba chấm tại header | Cùng handler, màu và geometry B | Edit tập trung textarea; Inspector đọc/ghi prompt cùng node; menu Edit / Inspector / Delete (xóa cần confirm ở preview). Chọn node mới không làm mất nội dung cũ |
| **Graph/handles** | Workflow 3 node/3 edge, 7 node/5 edge | Cùng dữ liệu/validator, không phát sinh node AI | Text **source phải**; Image **target trái + source phải**; Video **target trái**. Cho phép kéo node mà đường SVG cạnh nối di chuyển theo, không thêm edge sai/trùng |

### Bằng chứng và trạng thái kỹ thuật

**Smoke thủ công đã xác nhận riêng (không thay cho script QA):** 7 node/5 edge render; ba tỷ lệ Image **1:1, 16:9, 9:16** đều `object-fit:contain`; Text/Image/Video chọn node và giữ nội dung prompt; video **WebM cục bộ** chạy được lệnh `play()`/ `pause()`, metadata **duration 5,059 giây**, khung nội dung **960×540**; frontend **typecheck/build PASS** tại lượt kiểm tra sớm. Clip demo có nguồn MDN CC0, nhưng **không phải kết quả do mô hình AI sinh**.

**QA Chromium đã được prime xác nhận PASS:** [`scripts/ui02-node-qa.js`](../../scripts/ui02-node-qa.js), [Command 3 evidence README](../evidence/ui02/command3/README.md), **20/20 PNG thực ở 1440×900** (**10 A + 10 B**), `result: PASS (browser node checks + real video playback)`, **15 nhóm assertion**. Script đã kiểm play/pause thực theo từng variant, image source/aspect/contain, SVG paths, handle positions, node drag/edge-follow, chặn invalid/duplicate/self-loop, prompt giữ sau chọn/thu mở, long textarea wheel không zoom Canvas, menu/Inspector và delete Cancel/Confirm; **0 app API requests, 0 JS pageerrors**. Có **20 Vite HMR WebSocket** thuộc môi trường DEV, không phải kết nối ứng dụng/AI.

### 20 ảnh thật A/B Lệnh 3 — 10 trạng thái × 1440×900

| Trạng thái | A | B |
|---|---|---|
| Text | [A text](../evidence/ui02/command3/A-text-1440x900.png) | [B text](../evidence/ui02/command3/B-text-1440x900.png) |
| Image compact | [A image compact](../evidence/ui02/command3/A-image-compact-1440x900.png) | [B image compact](../evidence/ui02/command3/B-image-compact-1440x900.png) |
| Image DEMO | [A image demo](../evidence/ui02/command3/A-image-demo-1440x900.png) | [B image demo](../evidence/ui02/command3/B-image-demo-1440x900.png) |
| Video compact | [A video compact](../evidence/ui02/command3/A-video-compact-1440x900.png) | [B video compact](../evidence/ui02/command3/B-video-compact-1440x900.png) |
| Video DEMO | [A video demo](../evidence/ui02/command3/A-video-demo-1440x900.png) | [B video demo](../evidence/ui02/command3/B-video-demo-1440x900.png) |
| 3 node/3 edge | [A three connected](../evidence/ui02/command3/A-three-connected-1440x900.png) | [B three connected](../evidence/ui02/command3/B-three-connected-1440x900.png) |
| 7 node/5 edge | [A seven nodes](../evidence/ui02/command3/A-seven-nodes-1440x900.png) | [B seven nodes](../evidence/ui02/command3/B-seven-nodes-1440x900.png) |
| Selected/Inspector | [A selected](../evidence/ui02/command3/A-selected-1440x900.png) | [B selected](../evidence/ui02/command3/B-selected-1440x900.png) |
| Toolbar/menu | [A context](../evidence/ui02/command3/A-context-toolbar-1440x900.png) | [B context](../evidence/ui02/command3/B-context-toolbar-1440x900.png) |
| Prompt dài | [A long prompt](../evidence/ui02/command3/A-long-prompt-1440x900.png) | [B long prompt](../evidence/ui02/command3/B-long-prompt-1440x900.png) |

**Video HTML5 thực tế ở từng phương án:** `play()` → `currentTime` tăng **A: 0→0,842243s**, **B: 0→1,027371s**, sau `pause()` thì `paused=true` ở cả hai; player dùng **WebM local 960×540** có nguồn MDN CC0, không phải media do AI sinh. **Hồi quy design preview baseline** chạy lại riêng **64/64 ảnh tạm trong `/tmp` PASS**, không ghi đè ảnh lịch sử Lệnh 1. **Bun frozen install/typecheck/build PASS; backend 10/10 tests, 282 assertions PASS**; production bundle không có preview markers (prime xác nhận).

**Nghiệm thu:** Lệnh 3 **TECHNICAL QA PASS (20/20 Playwright + video A/B thật)**; hồi quy **production AC-02A/B/C chưa được chạy lại riêng cho Lệnh 3**. Chủ dự án **chưa duyệt thẩm mỹ** bất kỳ A/B nào; [Issue #4](https://github.com/mktminhqpbga-glitch/trader/issues/4) vẫn **OPEN**, **không thực hiện Lệnh 4/5**. Tổng tiến độ toàn dự án **40% không đổi**; AI/Storyboard/Library/Camera/Timeline/Export ngoài phạm vi.
