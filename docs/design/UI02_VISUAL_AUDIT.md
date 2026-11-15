# UI-02 Visual Audit — AI Creative Canvas Studio

**Ngày thực hiện:** 15/11/2026. **Repo:** mktminhqpbga-glitch/trader, nhánh feat/aiCanvasStudioFoundation. **Baseline trước preview:** 8efc9aa202a0b08688cee34e1d1120fe79af68b7.

**Nhận xét của chủ dự án có hiệu lực cao nhất:** UI-01 và UI-02 đạt kiểm tra kỹ thuật trước đó nhưng đều không đạt thẩm mỹ. Không đánh dấu VISUAL APPROVED khi chưa có lựa chọn của chủ dự án.

## Phạm vi bằng chứng

- Đã đối chiếu mã thực tế: apps/web/src/App.vue, apps/web/src/components/StudioNode.vue, NodeInspector.vue, NodePalette.vue, ProjectLibrary.vue, apps/web/src/styles/studio.css, studio-ui02.css, tokens.css và docs/evidence/ui02/README.md.
- Tệp hình UI-02 được xác nhận tồn tại trong GitHub: UI02-three-nodes.png, UI02-multiple-nodes.png, UI02-project-library.png, UI02-image-selected.png, UI02-node-menu.png, UI02-video-selected.png, UI02-node-context-menu.png.
- **Giới hạn nguồn ảnh:** kênh GitHub hiện tại từ chối tải binary ảnh PNG (UnicodeDecodeError). Vì vậy chưa trực tiếp xem từng ảnh lịch sử trong phiên này. Nhận xét hiện trạng dựa trên CSS, Vue và README bằng chứng trước đó; không nói đã phân tích trực quan pixel từng ảnh UI-02.
- Tham khảo LibTV có thể kiểm chứng: ảnh UI không gian Canvas và node ảnh/video ở https://www.aitntnews.com/newDetail.html?newId=23267. Ảnh cho thấy nền tối chiếm gần toàn khung, dock trái nổi, thumbnail làm trung tâm và kết nối cong giữa các node; nguồn này không xác nhận các chi tiết UI bị che hoặc hành vi chưa được quay.
- Không sao chép logo, tên, ảnh, code, menu nội bộ hoặc branding LibTV. Thiết kế mới là Vue/CSS tự xây.

## Kiểm tra theo khu vực

| Thành phần | Hiện trạng UI-02 từ mã / hạn chế | Đặc điểm tham khảo kiểm chứng | Cải thiện trong A/B | Nguồn frontend | Đánh giá chờ nghiệm thu |
|---|---|---|---|---|---|
| Header | Logo và trạng thái hiển thị nhỏ, font cỡ 10–11px | Header ngắn, hình ảnh chính nổi bật | A: header mỏng với project breadcrumb; B: header như bộ dựng | App.vue, studio-ui02.css → designPreview.vue, designPreview.css | Dễ đọc, trạng thái DEMO không lẫn saved thật |
| Canvas | Nền chấm có nhưng nhiều khoảng trống vì node không mang media | Full-bleed tối và kết nối cong | A: canvas rộng, lưới rất nhẹ và nổi có chiều sâu; B: stage trong studio 3 vùng | App.vue, studio-ui02.css → designPreview.vue | Pan/zoom không ảnh hưởng tọa độ |
| Thanh trái | Rail luôn chiếm 51px, các nút thiên thao tác dữ liệu | Dock nhỏ nổi ở trái trong ảnh tham khảo | A: dock dạng đảo dọc ở trên canvas; B: scene rail có danh sách cảnh hành động thật | App.vue → designPreview.vue | Tìm thấy nút bằng keyboard/tooltip |
| Canvas toolbar | Nhiều nút nhỏ cỡ 31–32px, thứ bậc chưa rõ | Dock và điều khiển zoom tách rời | A: viên công cụ góc trái dưới; B: ở chính giữa đáy stage | App.vue → designPreview.vue | Fit/zoom chạy thật trong preview |
| Text node | StudioNode dùng cùng body textarea với Image/Video; label phụ 8px | Text không lấy mất diện tích media | A: ghi chú ý tưởng mở ngay trong node; B: thẻ script cùng tên cảnh | StudioNode.vue → designPreviewNode.vue | Text đủ lớn, gõ giữ nguyên trong tab |
| Image node | Trong nguồn hiện tại chỉ prompt và trạng thái chưa có AI; width 276px | Khung ảnh chiếm đa số node ở ảnh LibTV | Preview DEMO chứa hình điện ảnh tự vẽ, giữ tỷ lệ, prompt ngắn phía dưới; compact giữ ít nội dung | StudioNode.vue → designPreviewNode.vue | Ảnh DEMO có nhãn rõ, không giả API |
| Video node | Nhìn khá giống Image, chỉ khác biểu tượng và placeholder | Clip/poster lớn gắn với kết nối | Preview DEMO video HTML5 có controls, poster tự vẽ; compact không có video/play | StudioNode.vue → designPreviewNode.vue | Play/pause thật nếu URL video tải thành công |
| Prompt | CSS nguồn dùng font 11px trong node, nhãn 10px | Prompt thuộc vùng phụ dưới media | Cỡ 13px, 2 dòng compact, mở editor khi click | StudioNode.vue → designPreviewNode.vue | Gõ/chỉnh từ Inspector không mất text |
| Toolbar node | Toolbar hiện khi selected; nút/label font 10px | Toolbar nhỏ xuất hiện lúc chọn | Toolbar 40px có chỉnh prompt và Inspector thật, menu với xác nhận xóa mẫu | StudioNode.vue → designPreviewNode.vue | Không hiển thị trên node không chọn |
| Dây nối/handle | Nối dựa trên Vue Flow, edge mảnh | Đường cong giữa các thumbnail | Dùng nguyên Vue Flow, chỉ tô lại màu/độ tương phản; kiểm tra 3 cặp hợp lệ | App.vue/useStudioState.ts → designPreview.vue | Không nối sai/trùng, không sửa DB |
| Node palette | Mỗi mục là một dòng nhỏ, font 10–12px | Công cụ phụ xuất hiện theo ngữ cảnh | Palette cao vừa đủ, tìm kiếm, click tạo node mẫu trong bộ nhớ | NodePalette.vue → designPreview.vue | ESC đóng, tìm kiếm hoạt động |
| Inspector | Source CSS ép Inspector thành cột cố định 292px, 238px ở màn hình nhỏ | Công cụ chỉnh sửa tạm thời trong UI | A: floating 320px có pan viewport nếu chồng node; B: Inspector dock, không overlay stage desktop | NodeInspector.vue → designPreview.vue | Node không bị che, tọa độ không đổi |
| Thư viện dự án | Card chia sẻ chung sơ đồ minh họa, mỗi card trông giống nhau | Media rõ trong không gian sáng tạo | Card có cover SVG riêng, tìm kiếm, nút dự án mẫu, rename/xóa mềm/restore chỉ trong bộ nhớ | ProjectLibrary.vue → designPreview.vue | Phân biệt ảnh với dữ liệu thực, ảnh có DEMO |
| Dialog và menu | Element Plus hỗ trợ dialog thật, style nguồn nhiều border | Popover tối gọn | Preview dùng dialog native showModal, menu có click/ESC, xác nhận trước xóa | App.vue/StudioNode.vue → designPreview.vue | Focus/ESC, không double action |
| Trạng thái lưu, offline | Luồng SQLite 503/409 thật đã được nghiệm thu kỹ thuật ở UI-02 | Không có chứng cứ trực quan trạng thái lỗi LibTV | Preview chỉ mô phỏng layout trạng thái với nhãn MÔ PHỎNG; ứng dụng thật vẫn giữ logic thật | App.vue → designPreview.vue | Không có request /api và không báo saved giả |
| Microinteraction & responsive | CSS hiện tại có hover, nhưng typography nhỏ và card mỏng | Chuyển động nhẹ không lấn át media | 120–200ms hover, panel responsive, prefers-reduced-motion | studio-ui02.css → designPreview.css | Kiểm 1440,1920,1280,1024,390 |

## Quy tắc đề xuất duyệt

1. Phương án phải khác cấu trúc thật, đặc biệt A là không gian sáng tạo trực tiếp còn B là nơi quản lý cảnh.
2. Khi không có media, ba loại node vẫn đọc được và không tạo placeholder lớn.
3. Khi có DEMO, mỗi Image/Video đặt media phía trước, nút Play thật và nhãn DEMO rõ.
4. Inspector, palette, toolbar hoạt động nhưng không kích hoạt AI hoặc SQLite.
5. Hình chụp mới phải lấy từ browser Vue thật; không sử dụng ảnh cũ hoặc mockup tĩnh.
6. Sau kiểm tra kỹ thuật, chỉ chủ dự án có quyền chọn A hay B.

**Trạng thái tại lúc viết:** CODE PREVIEW đang được tích hợp; ảnh live QA và duyệt thẩm mỹ chưa được xác nhận trong tài liệu này. Tham khảo kỹ thuật/bằng chứng ở docs/evidence/ui02 và docs/design/UI02_DESIGN_COMPARISON.md.

## Bổ sung quan sát screenshot Playwright thật — Lệnh 1/5 (15/11/2026)

Báo cáo ban đầu ghi chưa xem trực tiếp pixel ảnh. Hiện đã **mở và xem trực tiếp** ảnh Chromium: `review-A/09-three-nodes-connected.png`, `review-B/09-three-nodes-connected.png`, `review-B/18-right-edge-node-selected.png`, `review-B/responsive-canvas-390x844.png` và các ảnh cùng trạng thái. Xem đầy đủ [A](../evidence/ui02/review-A/), [B](../evidence/ui02/review-B/).

- **A:** Canvas full-bleed, dock nổi; Text/Image/Video với DEMO watermark, ảnh minh họa và video có controls; dây SVG thực sự xuất hiện trên không gian tối. Inspector dạng nổi; các thao tác theo node.
- **B:** Scene rail bên trái, Canvas trung tâm, filmstrip đáy và Inspector riêng bên phải; dây SVG được render, khi chọn Video sát mép phải có viewport pan nên node đang sửa nằm trọn bên trái Inspector. Khi tập trung video ngoài mép, một số node khác có thể tạm ra ngoài vùng nhìn — có thể Fit để trở lại.
- **390×844:** B chuyển scene rail thành dải ngang. Fit cả workflow làm node/chữ rất nhỏ. Không thể coi đây là UX mobile hoàn thiện; muốn chỉnh prompt cần zoom/pan.
- Không đánh đồng việc có poster/video DEMO với tác vụ AI, không coi test PASS là đẹp/giống LibTV, không khẳng định CC0 playback đã được kiểm chứng qua mạng.

Ảnh thật **32 A + 32 B**, trong Playwright `apiCalls=[]`, `pageErrors=[]`; Chromium production có `?designPreview=A` vẫn mount App chính, không mount preview. **TECHNICAL PASS / VISUAL APPROVAL PENDING**.

## Lệnh 2/5 — quan sát shell A/B bằng ảnh Chromium và mã preview (15/11/2026)

**Cập nhật nguồn bằng chứng:** đã trực tiếp xem ảnh mới [A 1440×900 · 3 node](../evidence/ui02/command2/A-1440x900-three.png), [B 1440×900 · 3 node](../evidence/ui02/command2/B-1440x900-three.png), [A 390×844 · Inspector](../evidence/ui02/command2/A-390x844-inspector.png), [B 390×844 · 3 node](../evidence/ui02/command2/B-390x844-three.png) và [B 390×844 · Inspector](../evidence/ui02/command2/B-390x844-inspector.png), đối chiếu với `apps/web/src/designPreview/designPreview.vue`, `designPreview.css` và `scripts/ui02-shell-qa.js`. Ma trận ảnh đầy đủ [5 viewport × 2 phương án × 4 trạng thái](UI02_DESIGN_COMPARISON.md#40-ảnh-chromium-ab--ma-trận-5-viewport--4-trạng-thái) / [README QA](../evidence/ui02/command2/README.md).

| Vùng giao diện | Quan sát A thực tế | Quan sát B thực tế | Đánh giá kỹ thuật / giới hạn |
|---|---|---|---|
| Shell 1440 | Header gọn, Canvas tràn vùng, dock 4 nút ở mép trái, toolbar Fit/Zoom/Add trái dưới | Header Cinematic, Scene Navigator trái, Canvas trong khung giữa, filmstrip dưới, toolbar ở giữa đáy stage | **Hai bố cục khác cấu trúc**, không chỉ đổi màu; header có DEMO và dải cảnh báo preview |
| Workflow 3 node | Text bên trái, Image giữa, Video phải; SVG 3 cạnh thực sự hiện | Cùng 3 node/3 cạnh nhưng lưới Canvas hẹp hơn do Scene Navigator và filmstrip | Các ảnh 1440×900 thể hiện rõ khác biệt bố cục, không phải media AI thật |
| Empty state | Thông điệp ngắn giữa Canvas, nút Add thật | Empty state đặt trong khung trên Canvas B | Nút có handler mở Palette, không phải nút trang trí |
| Workflow 7 node | Giữ vùng Canvas tự do; thao tác Fit thu nhỏ tùy viewport | Scene Navigator và filmstrip cho điều hướng cảnh, Fit trong vùng stage nhỏ hơn | Ở 390px node/chữ rất nhỏ khi Fit nhiều node; cần zoom/pan |
| Inspector | A là overlay nổi bên phải, trên 390px chiếm một vùng lớn của Canvas và phần node ở phía sau bị khuất khi mở | B desktop dock trong cột riêng; **B mobile bottom dock** chiếm phần thấp cửa sổ, stage phía trên vẫn riêng và có thể click | QA kiểm không giao cắt stage/Inspector B; trên 390×844 một phần nội dung Inspector ở dưới màn hình, phải cuộn để xem toàn bộ |
| Công cụ & hành vi | Dock A `More` có menu thật (Media, Scenes, Inspector khi chọn node, chuyển B); thao tác Fit/Zoom/Add ở toolbar | Navigator chọn scene thật, nút Add, toolbar Fit/Zoom, filmstrip desktop; mobile scene rail ngang | Giao diện hỗ trợ focus/tooltip/aria-label; không có hành vi API/AI |

**Tình trạng QA sau sửa:** lượt đầu `scripts/ui02-shell-qa.js` tạo **39/40 PNG** và FAIL do **assertion stale** bắt Inspector B mobile phải là overlay. CSS thực là `position:relative` bottom dock; sửa assertion cho đúng `inspector.top >= stage.bottom - 3`, vị trí không `absolute` và `intersection < 2`, giữ kiểm tra không chồng lấp. **Prime xác nhận rerun Chromium exit 0: TECHNICAL PASS, đầy đủ 40/40 PNG, 10 cases**, 5 viewport (1920×1080, 1440×900, 1280×800, 1024×768, 390×844), mỗi phương án 4 trạng thái (`three`, `empty`, `seven`, `inspector`), không tràn ngang, không JS pageerror, không request API ứng dụng. `bun install --frozen-lockfile`, typecheck, build, server tests **10/10/282 assertions** PASS theo kết quả prime; production bundle không chứa marker preview.

**Kiểm thử độc lập khác:** prime cũng xác nhận kịch bản baseline preview `scripts/ui02-design-preview-qa.js` chạy lại trong môi trường riêng, chuyển **chỉ output ảnh sang /tmp**, exit 0 **64/64 screenshot A/B**; không ghi đè 64 ảnh Lệnh 1 đã lưu. Đây là kiểm tra hồi quy **design preview**, không phải chứng cứ cho các tác vụ AI/SQLite production hay giấy phép thẩm mỹ.

**Chưa phê duyệt:** tiêu chí lựa chọn A/B, màu sắc, nhịp chữ, tương tác mobile thực tế và chất lượng thẩm mỹ vẫn **AWAITING OWNER**. Không tuyên bố UI này đã đạt chuẩn WCAG, không suy luận video CC0 phát thành công qua mạng hoặc media AI sinh thật. Preview **DEV-only/in-memory**, trạng thái offline/503/409 là mô phỏng UI; không API/SQLite. [Issue #4](https://github.com/mktminhqpbga-glitch/trader/issues/4) **OPEN**, không tiến hành Lệnh 3/5; **tiến độ toàn bộ dự án 40% giữ nguyên**.

## Lệnh 3/5 — kiểm toán cấu trúc Node media-first A/B (15/11/2026)

**Nguồn:** đã kiểm tra mã `apps/web/src/designPreview/designPreviewNode.vue`, `designPreview.vue`, `designPreview.css`, script `scripts/ui02-node-qa.js` và các [ảnh Lệnh 3 thực tế](../evidence/ui02/command3/README.md). Prime đã xác nhận Chromium **20/20 PNG A/B (1440×900), 15 nhóm assertion, 0 app requests, 0 pageerrors**. Đánh giá hình thức vẫn **chưa phải phê duyệt mỹ thuật của chủ dự án**; ảnh Lệnh 1/2 được giữ nguyên để so sánh lịch sử.

| Tiêu chí hình thức / tương tác | Thực tế mã Lệnh 3 | Điều kiện QA/chưa được duyệt |
|---|---|---|
| Phân biệt 3 loại node | Text có `.previewTextBody` và textarea/đếm ký tự; Image/Video có `.previewMediaBody` media-first. Text rộng 274px A/286px B; Video 375px A/365px B | **Đã có trong code**; cần ảnh 1440 A/B để chủ dự án đánh giá mật độ/typography, chưa kết luận đẹp |
| Gọn khi chưa có media | `data.demo=false` loại bỏ khung `.previewMedia`, hiện prompt ngắn và nhãn `Chưa kết nối AI` — không có ảnh/video giả | **QA PASS A/B:** chụp `image-compact`, `video-compact` và xác nhận không có media/player |
| Image DEMO | Media trước prompt, poster SVG local, badge **DEMO**, modal native mở ảnh lớn; khung **16:9, 9:16, 1:1** theo dữ liệu, `object-fit:contain` | **QA PASS A/B:** đã đo geometry/aspect, contain; ảnh mở lớn và đóng bằng native dialog thật |
| Video DEMO | HTML5 `<video controls playsinline muted>` 16:9, local `/designPreview/flower-cc0.webm`, poster riêng và nhãn **CC0/DEMO** | **QA playback PASS cả A/B:** `currentTime` tăng **A 0→0,842243s / B 0→1,027371s**, rồi `paused=true`; WebM **960×540**, metadata duration **5,059s** (smoke). [Nguồn MDN CC0](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm), không phải video AI |
| Prompt/selection | Text autosize, Image/Video có prompt summary và mở editor; cập nhật dữ liệu `node.data.prompt` trong VueFlow; chọn node khác/thu gọn/mở lại không làm mất prompt | **QA PASS A/B:** Text/media prompt giữ sau đổi selection và collapse/reopen; wheel trong textarea dài không zoom Canvas |
| Ngữ cảnh / menu | Selected toolbar có Edit/Inspector/Menu; menu header có Edit/Inspector/Delete; dialog xóa do `designPreview.vue` quản lý | **QA PASS A/B:** Edit/Inspector, menu đóng/mở, xóa Cancel giữ graph và Confirm loại node/cạnh liên quan |
| Dây nối | Text output bên phải, Image input trái/output phải, Video input trái, SVG edge 3/3 và 7/5; `Handle` đúng Vue Flow | **QA PASS A/B:** ID/path SVG đúng, kéo node giữ edges và cập nhật path; nối invalid/duplicate/self-loop bị chặn |
| Khác biệt A/B | Giữ shell Lệnh 2: A Canvas/dock nổi và Inspector overlay; B Scene Navigator/filmstrip và Inspector dock; node dùng cùng logic nhưng style khác | A/B vẫn đang **để chủ dự án chọn**, không gọi một phương án đạt thẩm mỹ |

**Bằng chứng Lệnh 3 đã tạo:** [thư mục 20 PNG](../evidence/ui02/command3/README.md), toàn bộ tên có trong [bảng so sánh A/B](UI02_DESIGN_COMPARISON.md#20-ảnh-thật-ab-lệnh-3--10-trạng-thái--1440900). Đủ **10 state × A/B = 20 ảnh ở 1440×900**: `text`, `image-compact`, `image-demo`, `video-compact`, `video-demo`, `three-connected`, `seven-nodes`, `selected`, `context-toolbar`, `long-prompt`. QA xác nhận 3 node/3 cạnh, 7 node/5 cạnh, zoom/pan/drag, video thật A/B, **15 nhóm kiểm tra**, không JS pageerror hoặc request API. Có **20 Vite HMR WebSocket** nội bộ DEV, không coi là AI/backend.

**Quan sát trực tiếp PNG mới:** [A Image DEMO](../evidence/ui02/command3/A-image-demo-1440x900.png) / [B Image DEMO](../evidence/ui02/command3/B-image-demo-1440x900.png) cho thấy Text là thẻ ghi chú riêng, Image poster chiếm phần trên với nhãn DEMO và prompt dưới, Video có khung clip hoa/CC0 tách biệt. [A Video DEMO](../evidence/ui02/command3/A-video-demo-1440x900.png) / [B Video DEMO](../evidence/ui02/command3/B-video-demo-1440x900.png) cho thấy frame phát clip thật (không phải ảnh kết quả AI), 3 cạnh SVG vẫn nối theo workflow; toolbar chọn node nằm ở phía trên. B có Scene Navigator + filmstrip nên node nhỏ hơn A ở cùng 1440×900. **Điểm cần chủ dự án xem:** tên node trên header Image/Video có ellipsis, chữ prompt/toolbar trong B khá nhỏ; ảnh đẹp hay thuận tiện để chỉnh dài chưa thể kết luận từ screenshot hoặc Playwright PASS.

**Ranh giới:** trình xem trước chỉ chạy **DEV-only, dữ liệu in-memory**, không AI task, không request backend, không SQLite/Library thật. Prime xác nhận **Bun frozen install/typecheck/build PASS, backend 10 tests/282 assertions PASS**, production bundle không chứa preview markers. Hồi quy baseline design preview chạy lại **64/64 ảnh tạm PASS** không ghi đè bằng chứng cũ; **production AC-02 regression chưa chạy lại riêng cho Lệnh 3**. **TECHNICAL QA Lệnh 3 PASS, nhưng Issue [#4](https://github.com/mktminhqpbga-glitch/trader/issues/4) OPEN**, visual approval **NOT GIVEN**, **không sang Lệnh 4**, tiến độ tổng thể **40%**.

## Lệnh 4/5 — kiểm toán từ mã Palette, Inspector, Library, dialog và trạng thái DEMO (15/11/2026)

**Nguồn:** `apps/web/src/designPreview/designPreview.vue`, `designPreview.css`, [kịch bản kiểm thử Lệnh 4](../../scripts/ui02-menu-library-qa.js), [README QA](../evidence/ui02/command4/README.md). Đã trực tiếp xem các ảnh Chromium thật: [A Palette 1440×900](../evidence/ui02/command4/A-palette-1440x900.png), [A Library](../evidence/ui02/command4/A-library-grid-1440x900.png), [B Library](../evidence/ui02/command4/B-library-grid-1440x900.png), [A Inspector 390×844](../evidence/ui02/command4/A-mobile-inspector-390x844.png) và [B Inspector 390×844](../evidence/ui02/command4/B-mobile-inspector-390x844.png). **Prime đã xác nhận toàn bộ kịch bản Lệnh 4 PASS 48/48 ảnh (24 A, 24 B)**, nhưng không coi QA kỹ thuật hay ảnh chụp là chấp thuận thẩm mỹ. Bằng chứng và nhận xét Lệnh 1–3 phía trên vẫn nguyên.

| Hạng mục | Có trong mã Lệnh 4 | Bằng chứng / rủi ro còn lại |
|---|---|---|
| Palette P01–P03 | Popover khoảng **328px**, icon+nhãn+mô tả, lọc `Văn bản/Hình ảnh/Video` theo query `vi-VN` và empty state; khi mở focus search, Esc/ngoài đóng, nút tạo node Vue Flow thật | **Smoke A:** lọc, Escape, thêm node PASS; QA tự động cần đo popover không bị cắt ở viewport 1440/390, click/gõ không pan Canvas |
| Inspector A desktop | Floating **320px** trên Canvas, cho phép sửa prompt chọn node, nút đóng và thống kê cổng từ edges | Code có pan viewport để tránh che selected node; script A/B cần xác nhận graph node tọa độ không thay đổi |
| Inspector A mobile | Floating **bottom sheet** `width:min(320px,100vw-18px)`, `height:min(308px,43dvh)`, neo dưới thay vì full-height overlay | **Smoke A mobile:** selected node vẫn hiện; cần ảnh 390×844 và kiểm không che nút chủ chốt, phần panel phải cuộn được |
| Inspector B | Dock **306px** bên phải desktop, 268/238px tại breakpoint; mobile là **bottom dock nằm dưới Canvas** | Khác hẳn cơ chế A, không gọi B là floating; QA A/B + viewport đo lại vị trí thật |
| Project Library | Heading **“Dự án”**, tạo/tìm, card **250–320px**, cover **16:10**, ba seed SVG khác nhau; dự án mới dùng thêm flowerFrame SVG, nhãn DEMO trên mọi ảnh minh họa | **Smoke A:** create/open/rename/delete/restore PASS; script cần kiểm cover natural size và ba URL khác nhau, layout 1 cột ở 390px |
| Project menu và Trash | Ba mục **Mở / Đổi tên / Xóa mềm** mở popover; Delete đóng dialog trước mutate, mở Trash, Restore không đổi project ID | Script phải kiểm Cancel, soft delete, restore, reload reset seeds; các thao tác in-memory, không khẳng định SQLite |
| Native dialogs | `showModal()`, autofocus tên; Rename select nội dung; Confirm/Create ngăn tên rỗng, đóng modal trước cập nhật chống double-submit, Escape/backdrop/Cancel | **Smoke A:** xóa/hủy/khôi phục có hành vi; các trường hợp lặp submit/focus/trap/ESC cần kết quả QA browser |
| Trạng thái trạng thái UI | Selector **8 lựa chọn** `normal` + **7 DEMO** `empty, loading, saved, unsaved, offline, save503, conflict409`, nhãn `TRẠNG THÁI DEMO · … · KHÔNG GỌI API`, nút đóng mô phỏng | Chưa có bằng chứng screenshot 7 trạng thái A/B tại thời điểm ghi; **Saved/503/409 chỉ là trình diễn trạng thái**, không ghi server hay lỗi API |

**Bộ QA Chromium Lệnh 4 PASS thực tế:** [`docs/evidence/ui02/command4/`](../evidence/ui02/command4/README.md) có **48 ảnh = 2 phương án × (19 desktop 1440×900 + 5 mobile 390×844)**, bao gồm **bảy status screenshot mỗi phương án**. Prime xác nhận `scripts/ui02-menu-library-qa.js` **exit 0, result PASS, 18 cases, 16 distinct checks**, Palette/filter/focus/Escape/ngoài/không pan; node menu+delete Cancel/Confirm; Inspector prompt sync/không đổi tọa độ node; Library grid/card cover khác nhau, search/open; Create/Rename/DeleteSoft/Trash/Restore, dialog focus/Escape/backdrop/double-click một commit và reload reset memory; đủ tám option status. **`apiCalls=[]`, `pageErrors=[]`, 22 Vite HMR WebSocket nội bộ**, không phải WebSocket của AI/ứng dụng. Bun install/typecheck/build, backend 10/10 tests/282 assertions PASS theo prime.

**Lưu lịch sử lỗi:** lượt QA đầu FAIL sau **10/48 ảnh** tại double-click Confirm Create: modal đóng ngay nên click thứ hai lọt xuống card. Prime sửa guard commit một lần + giữ native dialog top-layer **240ms** rồi mới đóng, script chờ modal đóng thật (không bỏ phép kiểm), **rerun 48/48 PASS**. Không gộp lượt FAIL vào kết quả PASS.

**Quan sát ảnh A/B trực tiếp:** Palette A là popover tối tại mép trái dưới Canvas, search có viền focus, ba hàng Văn bản/Hình ảnh/Video có icon và dấu cộng, không bị cắt ở khung 1440×900. Library A và B có tiêu đề “Dự án”, search/tạo và **ba ảnh bìa khác nhau** (phố đêm, chân dung, ngõ neon) nằm trong card hàng ngang, badge **ẢNH MINH HỌA · DEMO**, thanh Thùng rác dưới grid; B đổi sắc accent sang đồng. Mobile **A Inspector là panel nổi sát đáy trên Canvas**, các node phía sau vẫn thấy nhưng khi fit cả workflow chữ nhỏ; **B Inspector là dock bên dưới Canvas**, không đè vùng stage, làm stage thấp hơn. Những khác biệt này hữu ích cho chủ dự án chọn phong cách, **không thay thế visual approval**.

**Kết luận:** **Lệnh 4 TECHNICAL QA PASS**, nhưng design preview vẫn **DEV-only/in-memory**; dữ liệu dự án minh họa không lưu API/SQLite, không AI, không Asset Library production. **VISUAL APPROVAL NOT GIVEN**; [Issue #4](https://github.com/mktminhqpbga-glitch/trader/issues/4) **OPEN**, **không sang Lệnh 5/5**; production AC-02A/B/C chưa hồi quy mới cho Lệnh 4; tiến độ dự án **40% giữ nguyên**.
