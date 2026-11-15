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
