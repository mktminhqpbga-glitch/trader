# UI-02 — Review B

Đây là thư mục dành cho ảnh chụp **Vue chạy trong Chromium thật** bằng `scripts/ui02-design-preview-qa.js`. Bản B có URL `http://127.0.0.1:5173/?designPreview=B` trên Vite DEV. Bản build production không mở preview và không ghi SQLite trong các thao tác preview.

Mỗi ảnh dưới đây chỉ được coi là bằng chứng khi file `.png` thực sự xuất hiện sau QA. **README không tự xác nhận ảnh PASS hay phê duyệt mỹ thuật.**

1. 01-project-library.png
2. 02-project-library-empty.png
3. 03-canvas-empty.png
4. 04-text-node.png
5. 05-image-node-compact.png
6. 06-video-node-compact.png
7. 07-image-node-with-demo-media.png
8. 08-video-node-with-demo-media.png
9. 09-three-nodes-connected.png
10. 10-seven-nodes-workflow.png
11. 11-node-selected.png
12. 12-node-context-toolbar.png
13. 13-node-menu.png
14. 14-node-palette.png
15. 15-inspector-open.png
16. 16-inspector-closed.png
17. 17-long-prompt.png
18. 18-right-edge-node-selected.png
19. 19-save-error.png
20. 20-revision-conflict.png

Viewport chính 1440×900. Ảnh responsive bổ sung: `responsive-canvas-1920x1080.png`, `responsive-canvas-1280x800.png`, `responsive-canvas-1024x768.png`, `responsive-canvas-390x844.png` và các ảnh `responsive-library-*` cùng kích thước.

Ảnh SVG ở `apps/web/public/designPreview` là minh họa tự tạo; video mẫu dùng nguồn CC0 của MDN: https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm. Trạng thái 503/409 là layout **mô phỏng có nhãn** để chụp, không phải sự kiện lỗi SQLite thật.

Trạng thái duyệt: **AWAITING OWNER SELECTION**, chưa VISUAL APPROVED.

## QA Chromium thực tế — Lệnh 1/5

Đã tạo **32 PNG thật** qua Playwright CLI 1.65.1, gồm 01–20, `21-node-dragged.png`, `22-canvas-panned.png`, `23-canvas-fitted.png`, `24-offline-demo.png` và 8 screenshot `responsive-canvas-*` / `responsive-library-*` tại 1920×1080, 1280×800, 1024×768, 390×844. PASS kỹ thuật: node/edge VueFlow, Canvas, Inspector, prompt, palette, menu, DEMO/compact và thư viện chỉ trong bộ nhớ. **Không gọi `/api` hoặc SQLite**. Video DEMO có native controls, nhưng phát trực tuyến CC0 thực tế chưa được kiểm tra trong QA. **CHỜ DUYỆT THẨM MỸ**, không nhận là visual PASS.

## Lệnh 5/5 — nghiệm thu cuối cùng B: FINAL TECHNICAL PASS

**FINAL TECHNICAL PASS — prime xác nhận lượt Chromium thứ ba exit 0, `result: PASS — TECHNICAL DEV PREVIEW ONLY`.** Lịch sử Lệnh 1 phía trên được giữ nguyên. Script `scripts/ui02-design-preview-qa.js` đã được chạy trong phiên Chromium hiện có `ui02shell2`, Vite DEV port 5193; số ảnh và kết quả mới được nghiệm thu theo lượt thứ ba.

Lượt Chromium đầu **FAIL tại ảnh thứ 19/68 (A · long prompt wheel)** do textarea đã ở `scrollTop=390`, bằng giới hạn cuộn với `scrollHeight=486`, `clientHeight=96` sau khi nhập và đặt caret ở cuối. Đây là **lỗi chuẩn bị kiểm thử**, chưa có bằng chứng lỗi cuộn của ứng dụng. Script đã sửa: đặt `scrollTop=0` trước wheel, bắt buộc `scrollHeight > clientHeight + 20`, sau đó vẫn yêu cầu wheel cuộn xuống hơn 10px và mức zoom không đổi. **Lượt đầu FAIL; assertion cuộn đã PASS ở lượt hai và lượt ba.**

Lượt Chromium thứ hai **FAIL tại ảnh thứ 21/68 (A · DEMO status dismiss)**, sau khi kiểm tra cuộn textarea thật **PASS**: nút `AC.UI02.PREVIEW.STATUS.DISMISS` trên `.previewStateAlert` bị Inspector A dạng nổi che; Chromium báo click bị `.inspectorTop` chặn. Đây là **lỗi UI thật**, không phải lỗi thiết lập test. Prime đã sửa CSS có phạm vi hẹp ở `designPreview.css`: khi A mở Inspector, dời `.previewStateAlert` sang trái bằng `right:365px; width:min(430px,calc(100% - 390px))`, kèm override cho mobile ≤540px. **Giữ nguyên click và assertion dismiss của Playwright**, không dùng force-click, không đóng Inspector chỉ để vượt test. Bản vá sau đó qua **6/6 focused responsive smoke** và toàn bộ lượt Chromium thứ ba **68/68 PASS**. **QA KỸ THUẬT LỆNH 5: FINAL PASS; VISUAL: PENDING OWNER.**

**Lượt Chromium thứ ba — FINAL PASS (theo xác minh của prime):** A **34/34 PNG**, B **34/34 PNG**, tổng **68/68**. Chính xác 20 ảnh `01–20`, 4 ảnh `21–24` và 10 ảnh responsive Canvas/Library mỗi phương án tại **1920×1080, 1440×900, 1280×800, 1024×768, 390×844**. Prime xác minh **chữ ký PNG và kích thước pixel của cả 68 file**. Kết quả **98 checks**, **44 graph probes**, `apiCalls: []`, `errors: []`, chỉ **6 Vite HMR WebSocket**. Video WebM CC0 phát/tạm dừng thật: **A 0 → 0.931281 giây**, **B 0 → 1.065729 giây**, cả hai `paused: true`, `readyState: 4`. Project CRUD/Restore và tải lại trở về **3 seed projects** đã được kiểm chứng. Kết luận chỉ áp dụng cho **DEV preview**, chưa phải duyệt mỹ thuật hay xác nhận DB production.

```bash
npx --yes playwright@1.65.1 cli -s=ui02shell2 run-code --filename scripts/ui02-design-preview-qa.js
```

**Ảnh đã được prime nghiệm thu tại 1440×900:** tên chính xác **01–20** ở danh sách đầu README này; thêm `21-node-dragged.png`, `22-canvas-panned.png`, `23-canvas-fitted.png`, `24-offline-demo.png`. Đã xác minh đủ tên file, chữ ký PNG và kích thước pixel ở lượt chạy Chromium thứ ba.

**Responsive B Canvas và Library, 5 viewport × 2 màn hình = 10 PNG:**
`responsive-canvas-1920x1080.png`, `responsive-library-1920x1080.png`;
`responsive-canvas-1440x900.png`, `responsive-library-1440x900.png`;
`responsive-canvas-1280x800.png`, `responsive-library-1280x800.png`;
`responsive-canvas-1024x768.png`, `responsive-library-1024x768.png`;
`responsive-canvas-390x844.png`, `responsive-library-390x844.png`.

**Tổng B đã xác minh 34 PNG duy nhất** (24 chính/phụ + 10 responsive). Cặp A/B đã có **68 PNG**, tên chính xác. Lệnh 5 kiểm qua Vue thực: nút Add/Palette, menu Edit/Inspector/Delete, native dialog Cancel/Confirm và chống double-submit sau giữ top-layer 240ms, Canvas node drag/edge-follow, pan/zoom/fit, **kết nối mới từ handle thật** và chặn nối trùng, prompt Text/Image và Inspector đồng bộ, Library search/Open/Create/Rename/DeleteSoft/Trash/Restore, ba tỉ lệ ảnh SVG 16:9/9:16/1:1 và `object-fit: contain`, tám trạng thái với nhãn **DEMO**, mobile Palette focus/containment/no pan/overflow, Inspector B mobile **bottom dock không phủ Canvas**. Video DEMO dùng clip **CC0 cục bộ** `/designPreview/flower-cc0.webm` (nguồn MDN), phải đo `play()`, `paused`, `currentTime` tăng, rồi `pause()`; không được tuyên bố PASS chỉ vì thấy nút Play/poster.

Output lượt ba đã trả `count: 68`, đầy đủ đường dẫn PNG và `videoPlayback` đo thật A/B, `apiCalls: []`, `errors: []`; Vite HMR WebSocket được phân loại riêng. Browser không gọi API/SQLite nhưng **không kiểm tra DB trực tiếp** trong kịch bản DEV này. **FINAL TECHNICAL PASS — VISUAL APPROVAL: PENDING OWNER — ISSUE #4: OPEN — KHÔNG CÓ LỆNH 6.** Không tự chọn phương án B.
