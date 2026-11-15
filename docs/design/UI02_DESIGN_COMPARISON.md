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

## Lệnh 4/5 — Node Palette, Inspector, menu và Project Library A/B (15/11/2026)

**Phạm vi và nguồn:** nhánh `feat/aiCanvasStudioFoundation`, HEAD đầu vào `b7a3146`; đối chiếu `apps/web/src/designPreview/designPreview.vue`, `designPreview.css`, [kịch bản Chromium Lệnh 4](../../scripts/ui02-menu-library-qa.js) và [README bằng chứng](../evidence/ui02/command4/README.md). Đây là **design preview Vite DEV-only**, dữ liệu Vue **in-memory**; không sử dụng AI, API, SQLite hoặc Project Library production. Giữ nguyên các kết quả Lệnh 1–3 ở phần trên.

| Thành phần | A — LibTV-inspired Canvas | B — Cinematic Pro Studio | Hợp đồng chức năng trong mã |
|---|---|---|---|
| **Node Palette** | Popover tối nổi ở cạnh dock/toolbar, rộng tối đa **328px** | Cùng các node nhưng bề mặt graphite/đồng, vị trí hợp stage B | **P01 Văn bản, P02 Hình ảnh, P03 Video** có icon/mô tả, ô tìm lọc bằng `vi-VN` thật, tìm không khớp có empty message; mở tự focus search, `Escape`/click ngoài đóng; nút tạo thêm node vào Vue Flow thật |
| **Inspector desktop** | Floating **320px** ở bên phải Canvas, pan viewport khi cần để không che node chọn | **Dock 306px** ở cột riêng, không phủ Canvas; width responsive thu nhỏ 268/238px | Chọn node, sửa `node.data.prompt` hai chiều, đếm đầu vào/đầu ra theo edge trong bộ nhớ, nút đóng; không ghi SQLite |
| **Inspector mobile (390×844)** | **Bottom floating sheet** cao tối đa **308px / 43dvh**, sát đáy Canvas; khác floating desktop | **Bottom dock trong layout** dưới stage, không overlay Canvas | A vẫn floating, B là dock; mobile A có logic giữ node đang chọn trong vùng nhìn khi Inspector mở; không thay tọa độ node |
| **Project Library** | Trang thư viện quản lý dự án nhỏ, heading **“Dự án”**, tạo/tìm, cards 250–320px; biểu cảm màu A | Cùng kích thước và chức năng, palette màu B | Thumbnail tỷ lệ **16:10**, ba seed cover SVG khác nhau `streetFrame` / `portraitFrame` / `alleyFrame`; dự án tạo mới xoay thêm `flowerFrame`; tất cả có nhãn **ẢNH MINH HỌA · DEMO**, không phải kết quả AI |
| **Menu mỗi dự án** | Popover ba mục gọn tại card: **Mở dự án / Đổi tên / Xóa mềm** | Cùng 3 hành động, CSS màu B | Click cover/tên hoặc menu Open chuyển Canvas; Rename giữ ID; Delete mở native confirm, đưa dự án vào Trash; Restore khôi phục in-memory, reload trả lại seed |
| **Dialog & an toàn thao tác** | Modal native dùng cùng style A, focus đầu vào/nút Cancel | Cùng modal nhưng style B | Create/Rename/Delete có guard khi dialog đang mở, chặn submit trùng bằng đóng trước mutate; tên rỗng không tạo; Escape, Cancel, backdrop đóng; focus vào tên và select tên khi rename |
| **8 trạng thái chọn trên toolbar** | `normal` và **7 DEMO** alerts với nhãn trạng thái và dismiss | Cùng logic, phối màu status B | **`normal, empty, loading, saved, unsaved, offline, save503, conflict409`**. Normal không cảnh báo; mỗi trạng thái còn lại ghi rõ **“TRẠNG THÁI DEMO · ... · KHÔNG GỌI API”**. `Saved` không có lần ghi server; 503/409 không phải sự cố backend thật |

**Đã xác nhận bằng smoke thủ công A do prime thực hiện:** thao tác **tạo / đổi tên / xóa / hủy xóa / khôi phục / mở dự án**, mở/lọc Palette, `Escape`, thêm node, và trên **mobile A Inspector nổi gần đáy vẫn để node được chọn hiện trong vùng Canvas**. Đây là phạm vi **manual smoke A**, chưa đại diện cho toàn bộ kiểm thử A/B desktop/mobile.

### Kế hoạch ảnh kỹ thuật Lệnh 4 (không nhầm với bằng chứng đã chụp)

[`scripts/ui02-menu-library-qa.js`](../../scripts/ui02-menu-library-qa.js) dự kiến **48 PNG riêng biệt** cho **A/B**, mỗi phương án có **19 trạng thái desktop 1440×900** và **5 trạng thái mobile 390×844**. Desktop: `palette`, `palette-filter`, `palette-added`, `canvas-empty`, `node-menu`, `inspector`, `library-grid`, `library-search`, `library-empty`, `create-dialog`, `rename-dialog`, `project-trash` và **7 ảnh status** `status-empty/loading/saved/unsaved/offline/save503/conflict409`. Mobile: `palette`, `palette-filter`, `palette-added`, `mobile-inspector`, `mobile-library`. Mỗi ảnh có tên `A-<state>-1440x900.png`, `B-<state>-1440x900.png` hoặc tương ứng `390x844`.

**Kết quả Chromium Lệnh 4 do prime xác nhận: TECHNICAL PASS, 48/48 PNG thật (24 A + 24 B)**, đúng kích thước desktop/mobile; `scripts/ui02-menu-library-qa.js` chạy **exit 0, `result: PASS`, 18 cases, 16 nhóm checks**, tất cả 8 lựa chọn trạng thái (normal + 7 DEMO) có tên và nhãn rõ, không thiếu tính năng kiểm thử. Kết quả mạng `apiCalls=[]`, `pageErrors=[]`, chỉ có **22 Vite HMR WebSocket** của DEV; không phải AI/backend. QA kiểm đủ filter/focus/Escape/outside/click thêm không pan; node menu/delete Cancel/Confirm dọn edge; Inspector đồng bộ prompt, node tọa độ bất biến; card SVG khác nhau, mở/search; Create/Rename/DeleteSoft/Trash/Restore; dialog focus/ESC/backdrop/double-click đúng một lần và reload reset in-memory. **Bun frozen install/typecheck/build và backend 10/10 tests, 282 assertions PASS** theo prime.

**Lịch sử lỗi được giữ:** lượt chạy đầu **FAIL 10/48 ảnh** tại double-click Create: native dialog đóng quá sớm, click hai xuyên vào card. Sửa guard commit một lần và giữ native modal trong top-layer **240ms** trước khi đóng; lượt rerun mới **48/48 PASS** với assertion không ghost/double-submit vẫn giữ, không gán lượt FAIL là PASS.

### Liên kết đầy đủ 48 ảnh Chromium A/B Lệnh 4

| Viewport | State | A | B |
|---|---|---|---|
| Desktop 1440×900 | `palette` | [A](../evidence/ui02/command4/A-palette-1440x900.png) | [B](../evidence/ui02/command4/B-palette-1440x900.png) |
| Desktop 1440×900 | `palette-filter` | [A](../evidence/ui02/command4/A-palette-filter-1440x900.png) | [B](../evidence/ui02/command4/B-palette-filter-1440x900.png) |
| Desktop 1440×900 | `palette-added` | [A](../evidence/ui02/command4/A-palette-added-1440x900.png) | [B](../evidence/ui02/command4/B-palette-added-1440x900.png) |
| Desktop 1440×900 | `canvas-empty` | [A](../evidence/ui02/command4/A-canvas-empty-1440x900.png) | [B](../evidence/ui02/command4/B-canvas-empty-1440x900.png) |
| Desktop 1440×900 | `node-menu` | [A](../evidence/ui02/command4/A-node-menu-1440x900.png) | [B](../evidence/ui02/command4/B-node-menu-1440x900.png) |
| Desktop 1440×900 | `inspector` | [A](../evidence/ui02/command4/A-inspector-1440x900.png) | [B](../evidence/ui02/command4/B-inspector-1440x900.png) |
| Desktop 1440×900 | `library-grid` | [A](../evidence/ui02/command4/A-library-grid-1440x900.png) | [B](../evidence/ui02/command4/B-library-grid-1440x900.png) |
| Desktop 1440×900 | `library-search` | [A](../evidence/ui02/command4/A-library-search-1440x900.png) | [B](../evidence/ui02/command4/B-library-search-1440x900.png) |
| Desktop 1440×900 | `library-empty` | [A](../evidence/ui02/command4/A-library-empty-1440x900.png) | [B](../evidence/ui02/command4/B-library-empty-1440x900.png) |
| Desktop 1440×900 | `create-dialog` | [A](../evidence/ui02/command4/A-create-dialog-1440x900.png) | [B](../evidence/ui02/command4/B-create-dialog-1440x900.png) |
| Desktop 1440×900 | `rename-dialog` | [A](../evidence/ui02/command4/A-rename-dialog-1440x900.png) | [B](../evidence/ui02/command4/B-rename-dialog-1440x900.png) |
| Desktop 1440×900 | `project-trash` | [A](../evidence/ui02/command4/A-project-trash-1440x900.png) | [B](../evidence/ui02/command4/B-project-trash-1440x900.png) |
| Desktop 1440×900 | `status-empty` | [A](../evidence/ui02/command4/A-status-empty-1440x900.png) | [B](../evidence/ui02/command4/B-status-empty-1440x900.png) |
| Desktop 1440×900 | `status-loading` | [A](../evidence/ui02/command4/A-status-loading-1440x900.png) | [B](../evidence/ui02/command4/B-status-loading-1440x900.png) |
| Desktop 1440×900 | `status-saved` | [A](../evidence/ui02/command4/A-status-saved-1440x900.png) | [B](../evidence/ui02/command4/B-status-saved-1440x900.png) |
| Desktop 1440×900 | `status-unsaved` | [A](../evidence/ui02/command4/A-status-unsaved-1440x900.png) | [B](../evidence/ui02/command4/B-status-unsaved-1440x900.png) |
| Desktop 1440×900 | `status-offline` | [A](../evidence/ui02/command4/A-status-offline-1440x900.png) | [B](../evidence/ui02/command4/B-status-offline-1440x900.png) |
| Desktop 1440×900 | `status-save503` | [A](../evidence/ui02/command4/A-status-save503-1440x900.png) | [B](../evidence/ui02/command4/B-status-save503-1440x900.png) |
| Desktop 1440×900 | `status-conflict409` | [A](../evidence/ui02/command4/A-status-conflict409-1440x900.png) | [B](../evidence/ui02/command4/B-status-conflict409-1440x900.png) |
| Mobile 390×844 | `palette` | [A](../evidence/ui02/command4/A-palette-390x844.png) | [B](../evidence/ui02/command4/B-palette-390x844.png) |
| Mobile 390×844 | `palette-filter` | [A](../evidence/ui02/command4/A-palette-filter-390x844.png) | [B](../evidence/ui02/command4/B-palette-filter-390x844.png) |
| Mobile 390×844 | `palette-added` | [A](../evidence/ui02/command4/A-palette-added-390x844.png) | [B](../evidence/ui02/command4/B-palette-added-390x844.png) |
| Mobile 390×844 | `mobile-inspector` | [A](../evidence/ui02/command4/A-mobile-inspector-390x844.png) | [B](../evidence/ui02/command4/B-mobile-inspector-390x844.png) |
| Mobile 390×844 | `mobile-library` | [A](../evidence/ui02/command4/A-mobile-library-390x844.png) | [B](../evidence/ui02/command4/B-mobile-library-390x844.png) |

Đường dẫn/tên ảnh ở trên đã được kiểm trên disk: **chính xác 48 PNG**, desktop **1440×900**, mobile **390×844**. Xem [README báo cáo QA Lệnh 4](../evidence/ui02/command4/README.md).

**Ranh giới:** chỉ preview DEV / in-memory, hồi quy production **AC-02A/B/C chưa chạy lại riêng cho Lệnh 4**. **VISUAL APPROVAL NOT GIVEN / AWAITING OWNER**, không chọn A/B, [Issue #4](https://github.com/mktminhqpbga-glitch/trader/issues/4) **OPEN**, không sang **Lệnh 5/5**, không AI, SQLite, Asset Library production, Storyboard, Camera, Timeline, Export; **tổng dự án 40% không đổi**.

## Lệnh 5/5 — đối chiếu UI-02 production gốc với Preview A/B, phục vụ chủ dự án lựa chọn (15/11/2026)

**Nguồn đối chiếu đã mở xem trực tiếp:** [UI-02 production — Library](../evidence/ui02/UI02-project-library.png), [UI-02 production — Canvas ba node](../evidence/ui02/UI02-three-nodes.png); [A — Library Lệnh 4](../evidence/ui02/command4/A-library-grid-1440x900.png), [B — Library Lệnh 4](../evidence/ui02/command4/B-library-grid-1440x900.png), [A — Canvas Lệnh 3](../evidence/ui02/command3/A-three-connected-1440x900.png), [B — Canvas Lệnh 3](../evidence/ui02/command3/B-three-connected-1440x900.png), [A/B mobile Inspector](../evidence/ui02/command4/README.md). Các ảnh production là tư liệu UI-02 lịch sử; ảnh A/B Lệnh 3–4 là **DEV preview DEMO**. Prime đã kiểm chứng **QA Lệnh 5 fresh 68/68 PNG** trên [review-A](../evidence/ui02/review-A/README.md) / [review-B](../evidence/ui02/review-B/README.md), **34 ảnh/phương án** (20 ảnh tên `01`–`20`, bốn ảnh `21`–`24`, 10 ảnh responsive), xác thực chữ ký PNG và đúng kích thước pixel. Bộ ảnh này là nghiệm thu kỹ thuật sau Lệnh 4, **không phải phê duyệt thẩm mỹ**.

| Tiêu chí quan sát | Production UI-02 lịch sử | A — LibTV-inspired Canvas | B — Cinematic Pro Studio |
|---|---|---|---|
| **Canvas là trọng tâm** | Nền tối chấm rộng nhưng ba node compact nằm ở một hàng nhỏ trong nhiều khoảng trống | **Nổi bật nhất:** Canvas tràn chiều ngang, công cụ/Inspector nổi, ưu tiên trực tiếp kéo và nối workflow | Canvas là stage trong studio; scene rail trái và filmstrip đáy làm diện tích thao tác hẹp hơn A |
| **Kích thước và vai trò node** | Ba thẻ gần cùng kích thước, Image/Video là prompt + “Chưa kết nối AI”; ít phân cấp | Text là ghi chú, Image 345px, Video 375px theo CSS; media-first khi DEMO; thao tác trên canvas trực quan | Text 286px, Image 345px, Video 365px theo CSS; tại Fit 1440px màn B hiển thị các node nhỏ hơn vì vùng stage hẹp |
| **Nhấn mạnh media** | Library có bốn card cùng cover sơ đồ; Image/Video không có kết quả thật theo AC-02 | Ba cover SVG khác nhau, Image poster và Video CC0 bản DEMO lớn phía trên prompt | Ba cover và media DEMO như A; filmstrip cung cấp ngữ cảnh shot, **không phải Timeline hay Storyboard hoạt động** |
| **Cỡ chữ / độ rõ** | Nhãn header và nội dung phụ nhỏ; prompt node nhỏ và đôi khi bị cắt | Chữ node dễ phân nhóm hơn nhờ body rõ và tương phản; vẫn có label, nút menu và prompt dài nhỏ | Trên 1440px, mật độ nhiều vùng hơn; chữ shot/toolbar và các node Fit nhỏ, cần điều chỉnh zoom khi biên tập |
| **Panel và khoảng trắng** | Thư viện để trống phần dưới, hàng card lặp ảnh sơ đồ; Inspector production mở như panel cố định | Library card 250–320px/16:10 với cover riêng; Inspector nổi 320px có thể che một phần Canvas; không gian Canvas rộng | Library gần như cùng lưới với A, chỉ khác nhấn màu; Inspector dock 306px desktop, không phủ Canvas nhưng chiếm chiều ngang |
| **Cảm giác studio** | Tập trung workflow kỹ thuật hơn nội dung media | Không gian sáng tạo tự do, nhẹ, hợp thao tác đa node trên Canvas | Có scene navigator + shot filmstrip + bảng Inspector, nhiều ngữ cảnh dựng cảnh nhưng thêm độ phức tạp |
| **Responsive 390×844** | UI gốc compact; các thẻ có thể cần zoom/pan | Inspector thành floating bottom sheet, node phía sau còn hiện nhưng dễ bị phần panel che | Scene rail ngang và Inspector ở dưới Canvas; ít overlay nhưng stage thấp, Fit node/nhãn rất nhỏ |
| **Khả năng mở rộng tương lai** | Chưa bố trí chuyên biệt Storyboard, Camera, Timeline | Có thể thêm panel ngữ cảnh; cần thiết kế rõ vị trí để không phủ Canvas | Scene rail/filmstrip có vị trí trực quan để *thiết kế tương lai* cho Storyboard/Camera/Timeline; **chưa triển khai các tính năng đó** |

**Phân biệt A/B về cấu trúc:** khác biệt lớn nhất là toàn bộ trải nghiệm **Canvas tự do + dock nổi** của A so với **scene rail + stage + filmstrip + dock Inspector** của B; đây không chỉ là chuyển tím sang đồng. **Riêng màn Library**, hai bố cục có cấu trúc gần giống nhau (heading, search, ba card, Trash), chủ yếu khác accent; đây là điểm cần chủ dự án đánh giá trước khi chọn.

**Trạng thái nghiệm thu Lệnh 5 tại thời điểm ghi** (không ghi đè các kết quả kỹ thuật Lệnh 1–4):

| Kiểm tra | Trạng thái | Căn cứ / giới hạn |
|---|---|---|
| Screenshot Lệnh 1–4 đã có trên disk | **PASS — bằng chứng lịch sử** | 32 PNG A + 32 B Lệnh 1; ảnh Canvas/Library/Inspector Lệnh 3–4 và QA 48/48 Lệnh 4 đã ghi nhận |
| **Fresh** Chromium review-A/review-B `01`–`20` sau Lệnh 4; responsive Canvas + Library 1920×1080, 1440×900, 1280×800, 1024×768, 390×844 | **PASS — 68/68 PNG** | Third run `exit 0`, `result=PASS — TECHNICAL DEV PREVIEW ONLY`, **34 A + 34 B**, gồm 20 file `01`–`20`, bốn `21`–`24` và **5 viewport × Canvas/Library = 10 ảnh/phương án**; prime kiểm chữ ký PNG + chính xác kích thước |
| Hành vi đầy đủ Preview A/B sau Lệnh 4 (kéo/nối/pan/zoom/fit/prompt/dialog/CRUD/video Play–Pause, không request app API/pageerror) | **PASS — 98 checks; 44 edge probes** | Chromium tương tác thật trên hai preview, video CC0 phát/dừng thành công, Library CRUD in-memory và reset khi reload; `apiCalls=[]`, `errors=[]`, 6 WebSocket chỉ là Vite HMR DEV |
| Production AC-02C trên SQLite QA riêng, cổng `3114`/`5184` | **PASS 4 browser scripts theo prime** | Prime đã cập nhật: **main, restart, 409 conflict, UI-audit PASS** trên SQLite QA tạm; main/restart có 3 node/3 edge, ID, viewport, revision bền qua restart và 503 rollback. Không mặc nhiên coi là lần chạy lại đủ mọi script lịch sử 9/9 |
| `bun install --frozen-lockfile`, typecheck, build cho lượt cuối | **PASS theo prime** | Frozen install, typecheck, build và backend **10/10 tests, 282 assertions** PASS ở lượt Lệnh 5 |
| Visual A/B / chọn một phương án / tích hợp production | **AWAITING OWNER / NOT IMPLEMENTED** | Không tự chọn, không sửa production, [Issue #4](https://github.com/mktminhqpbga-glitch/trader/issues/4) **OPEN** |

**Hướng dẫn mở trên Mac — bản dự thảo dựa trên lệnh repo, chưa nghiệm chứng phiên Mac mới của Lệnh 5:** tại root repo chạy `bun install --frozen-lockfile`, `bun run dev:web`; mở `http://127.0.0.1:5173/?designPreview=A` hoặc `?designPreview=B` (Vite cổng 5173 nếu trống). Preview chỉ Vite DEV, dữ liệu bộ nhớ và DEMO, không đòi Bun API/SQLite; bản production chạy với server/DB riêng theo [hướng dẫn AC-02](../acceptance.md), không mở demo để thử lưu dữ liệu thực. Modern Web Guidance **CLI `search` + `retrieve`** đã có bằng chứng Lệnh 1 trong [báo cáo công cụ](../UI02_MODERN_WEB_GUIDANCE.md); **không có bằng chứng Codex plugin đã cài**, không nhận Popover API, Container Queries hay View Transitions là đã áp dụng.

**Bộ ảnh cuối Lệnh 5 để chủ dự án đối chiếu trực tiếp:** [A Library](../evidence/ui02/review-A/01-project-library.png) / [B Library](../evidence/ui02/review-B/01-project-library.png); [A workflow 3 node](../evidence/ui02/review-A/09-three-nodes-connected.png) / [B workflow 3 node](../evidence/ui02/review-B/09-three-nodes-connected.png); [A 7 node](../evidence/ui02/review-A/10-seven-nodes-workflow.png) / [B 7 node](../evidence/ui02/review-B/10-seven-nodes-workflow.png); [A Image DEMO](../evidence/ui02/review-A/07-image-node-with-demo-media.png) / [B Image DEMO](../evidence/ui02/review-B/07-image-node-with-demo-media.png); [A Video DEMO](../evidence/ui02/review-A/08-video-node-with-demo-media.png) / [B Video DEMO](../evidence/ui02/review-B/08-video-node-with-demo-media.png); [A Inspector](../evidence/ui02/review-A/15-inspector-open.png) / [B Inspector](../evidence/ui02/review-B/15-inspector-open.png); [A Canvas mobile](../evidence/ui02/review-A/responsive-canvas-390x844.png) / [B Canvas mobile](../evidence/ui02/review-B/responsive-canvas-390x844.png); [A Library 1440](../evidence/ui02/review-A/responsive-library-1440x900.png) / [B Library 1440](../evidence/ui02/review-B/responsive-library-1440x900.png).

**Chốt hồ sơ kỹ thuật, chưa chốt thiết kế:** **Lệnh 5 TECHNICAL DEV PREVIEW PASS 68/68**, có log tương tác và bằng chứng media thật; production AC-02C được kiểm riêng. **VISUAL AWAITING OWNER / NOT APPROVED**, [Issue #4](https://github.com/mktminhqpbga-glitch/trader/issues/4) **OPEN**, tổng dự án **40%**, không sang WF-01/AC-03, không đưa preview vào production hoặc tuyên bố có Storyboard/Camera/Timeline/AI.

### Lệnh 5 — nhật ký hai lượt Chromium FAIL và bản sửa Inspector A (15/11/2026)

| Lượt chạy 68 ảnh | Kết quả thực tế | Phân loại / biện pháp |
|---|---|---|
| **Lượt 1** | **FAIL ở 19/68** tại thao tác wheel trong long prompt A | **Thiết lập test:** textarea đã ở cuối (`scrollTop=390`, bằng `scrollHeight 486 − clientHeight 96`) sau khi nhập; đặt về `scrollTop=0` trước wheel, giữ assertion cuộn hơn 10px và zoom không đổi. Không suy luận ứng dụng bị lỗi từ FAIL này. |
| **Lượt 2** | **FAIL ở 21/68**: click đóng `previewStateAlert` góc phải trên của A bị floating Inspector chặn pointer | **Lỗi UI thật:** Inspector nổi che nút dismiss cảnh báo. Prime sửa CSS scoped trong `apps/web/src/designPreview/designPreview.css`: `.variantA.inspectorShown .previewStateAlert { right: 365px; width: min(430px, calc(100% - 390px)); }`, thêm override mobile; bản vá đã được kiểm chứng ở focused 6/6 và lượt đầy đủ lần ba. |
| **Kiểm tra tập trung sau CSS** | **PASS 6/6 responsive cases** | Prime xác nhận Chromium thật **A/B × 1440×900, 1024×768, 390×844**, click dismiss được và vùng giao Inspector/alert đo **0px²**. Kết quả này kiểm đúng lỗi vừa sửa, không thay thế toàn bộ vòng 68 ảnh. |
| **Lượt 3 — QA đầy đủ** | **PASS 68/68 — Chromium exit 0** | Prime xác nhận `result=PASS — TECHNICAL DEV PREVIEW ONLY`, `checks=98`, `edgeProbe=44`, `apiCalls=[]`, `errors=[]`; 34 A + 34 B, 6 Vite-only HMR WebSocket, video WebM CC0 play/pause A `0→0.931281s`, B `0→1.065729s`, cả hai `paused=true`, `readyState=4`, 16:9/contain. Không biến DEMO thành AI hay SQLite production. |

Hai lần FAIL có nguyên nhân khác nhau và được giữ nguyên trong lịch sử. Lỗi click Inspector A đã có **focused PASS 6/6** và **Chromium Lệnh 5 full PASS 68/68** sau bản vá; đây là **nghiệm thu kỹ thuật preview DEV**, không ảnh hưởng production AC-02C. **VISUAL NOT APPROVED / AWAITING OWNER**, Issue #4 **OPEN**, tiến độ **40%**.
