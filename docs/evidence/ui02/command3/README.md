# UI-02 · Lệnh 3/5 — Text / Image / Video Node & Connection QA

**TRẠNG THÁI: TECHNICAL PASS — CHROMIUM THẬT, 15/11/2026; VISUAL APPROVAL: CHỜ CHỦ DỰ ÁN.** Prime đã chạy `scripts/ui02-node-qa.js` trên phiên Playwright Chromium chung `ui02shell2` tại DEV Vite `http://127.0.0.1:5193`: **exit 0**, kết quả `PASS (browser node checks + real video playback)`, **20/20 PNG thật** (10 A + 10 B), toàn bộ ảnh đúng kích thước 1440×900. Kết quả xác minh `applicationRequests: 0`, `pageErrors: []`, 20 kết nối WebSocket nội bộ Vite HMR (không phải WebSocket ứng dụng). Đã thử kéo/nối thực, reject nối sai/trùng/self-loop, prompt dài, toolbar/menu và xác nhận xóa.

## Phạm vi

- Bản Vue Design Preview A/B chỉ chạy trong Vite DEV, không chạm API/SQLite/AI thật, dữ liệu chỉ trong bộ nhớ của tab.
- Text: textarea nội dung thực, auto-size, expand/collapse giữ prompt. Image: compact và DEMO, mở ảnh lớn bằng dialog, mở/thu prompt. Video: compact không có player, DEMO có HTML5 controls thật và poster nguồn.
- Canvas: 3 node/3 cạnh, 7 node/5 cạnh; xác nhận **ID và đường SVG thực**, các handle Text output phải, Image input trái + output phải, Video input trái. Kéo Text cập nhật cạnh nhưng không mất kết nối. Thử nối trùng Image→Video, self-loop Image, và Image→Image không hợp lệ; số ID cạnh không được tăng.
- Prompt: cập nhật Text/Image, chọn node khác rồi quay lại, thu/mở editor giữ trọn nội dung; cuộn textarea dài bằng wheel không được làm zoom Canvas. Node toolbar Edit/Inspector/Menu hoạt động, menu Edit/Inspector/Delete, dialog xóa Cancel giữ graph, Confirm loại node và cạnh liên quan.
- Zoom In/Out, pan chuột và Fit phải chạy trên transform Vue Flow thực; không coi click một nút là đủ bằng chứng.
- Ảnh: script kiểm tra source poster SVG bằng naturalWidth/naturalHeight (760×470), node aspectRatio tại data-aspect (16:9, 9:16, 1:1), frame aspect đo bằng browser và object-fit: contain để tránh crop. Video DEMO dùng frame 16:9 với poster SVG 760×470 (không suy từ khung 16:9 rằng poster cũng 16:9).
- Video CC0: source của preview là file local apps/web/public/designPreview/flower-cc0.webm, xuất xứ MDN https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm. Nó chỉ là clip minh họa, không phải sản phẩm AI. QA thật gọi video.play(), kiểm tra video không paused, currentTime tăng, và gọi pause() rồi kiểm tra paused. Nếu clip tải lỗi, video.play() lỗi hoặc timeout thì kết luận **NOT TESTED** với lý do; nếu play() thành công nhưng thời gian không tăng hoặc không pause được thì **FAIL**. Không giả PASS chỉ từ controls/poster. Kết quả chung PARTIAL nếu browser QA khác đạt nhưng video NOT TESTED.
- Không /api requests, application WebSocket, JavaScript pageerrors; Vite HMR WebSocket tại đường dẫn / trên cùng DEV host được đếm riêng.

## Chạy bởi prime trên phiên Playwright chung

Đã mở tab trong phiên ui02shell2 ở cổng DEV 5193, URL có ?designPreview=A hoặc ?designPreview=B, rồi từ /kkk chạy:

~~~bash
npx --yes playwright@1.65.1 cli -s=ui02shell2 run-code --filename scripts/ui02-node-qa.js
~~~

Script lấy origin từ page.url(), dùng **1440×900** cho mọi ảnh, mở lại trang DEV giữa các trạng thái để không lẫn thao tác test. Không tự tạo browser/server/session. Đường dẫn xuất: docs/evidence/ui02/command3/.

## Ma trận **20 PNG Chromium đã chụp và kiểm tra**

Hai phương án A và B, mỗi phương án 10 trạng thái, tên theo mẫu **A-STATE-1440x900.png / B-STATE-1440x900.png**:

| # | STATE | Nội dung kiểm tra |
|---|---|---|
| 01 | text | Text đang chọn, chỉnh textarea, mở/thu và giữ prompt |
| 02 | image-compact | Image trống media và trạng thái rõ |
| 03 | image-demo | Image có media DEMO, contain, dialog ảnh lớn mở/đóng |
| 04 | video-compact | Video chưa có player |
| 05 | video-demo | Video HTML5, play/pause kiểm chứng thực tế |
| 06 | three-connected | Text→Image→Video và Text→Video: 3 SVG edges |
| 07 | seven-nodes | 7 node/5 SVG edges và ảnh DEMO 16:9, 9:16, 1:1 |
| 08 | selected | Selected node và Inspector sync |
| 09 | context-toolbar | Context toolbar/menu, Edit/Inspector/Delete, Cancel/Confirm |
| 10 | long-prompt | Long textarea, giữ text sau chọn/thu/mở, wheel không zoom |

Ví dụ A-text-1440x900.png, B-text-1440x900.png, A-long-prompt-1440x900.png, B-long-prompt-1440x900.png.

**Nghiệm thu thực tế:** script trả `screenshotCount: 20`, 10 trạng thái cho mỗi phương án, `graphCases` 3 node/3 SVG edge và 7 node/5 SVG edge, 15 nhóm assert tương tác, `applicationRequests: 0`, `pageErrors: []`. Mỗi ảnh đã xác minh kích thước pixel qua `sips` (20/20 đúng 1440×900). Video DEMO **PASS phát/tạm dừng thật trên cả A và B**, nguồn local 960×540, `readyState=4`, sau `play()` thời gian phát A `0 → 0,842243s`, B `0 → 1,027371s`, sau `pause()` cả hai `paused=true`. Clip dài xấp xỉ 5,059s (smoke riêng). Không phải video do AI tạo.

**Kiểm tra bổ sung trên Chromium cùng phiên:** click trực tiếp cạnh `preview-edge-01` cho class Vue Flow `selected`, stroke đo từ `1.7px` (màu trung tính) thành `2.5px` (màu accent). Click nền Canvas sau khi chọn Text làm toolbar ngữ cảnh giảm từ 1 xuống 0 và Inspector vẫn đóng. Đây là smoke riêng ngoài 15 nhóm assertion trong `ui02-node-qa.js`, không cộng thêm ảnh vào 20 PNG.

**Hồi quy riêng:** kịch bản A/B baseline `scripts/ui02-design-preview-qa.js` đã chạy lại `exit 0`, **64/64 ảnh A/B tạm tại `/tmp/ui02-command3-regression-{A,B}/`**, không ghi đè ảnh theo dõi Lệnh 1/2. `bun install --frozen-lockfile`, `bun run typecheck`, `bun run build`, `bun test apps/server/src/index.test.ts` PASS (10/10 test, 282 assertions); build vẫn cảnh báo bundle JS lớn. Chỉ thay các file preview node, CSS, asset CC0 và tài liệu/QA Lệnh 3; **không chạy hồi quy production AC-02A/B/C trên DB mới ở lệnh này** và không suy ra đạt accessibility hay visual approval. Ở màn 390px Fit nhiều node có thể khiến chữ nhỏ, cần zoom/pan; command3 chụp 20 ảnh desktop 1440×900, không tự nhận đã thực hiện ma trận 5 viewport ở đây.

**VISUAL APPROVAL: PENDING OWNER.** Kết quả Playwright không thay thế chủ dự án duyệt phương án thẩm mỹ. Prime đối chiếu git status/diff trước commit/push. Worker-4 chỉ tạo NEW scripts/ui02-node-qa.js và README này; không sửa các ảnh/tài liệu Lệnh 1/2, không mở Chromium, không commit/push.
