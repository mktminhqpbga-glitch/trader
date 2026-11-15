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
