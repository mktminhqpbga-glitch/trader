# UI-02 — Review A

Đây là thư mục dành cho ảnh chụp **Vue chạy trong Chromium thật** bằng `scripts/ui02-design-preview-qa.js`. Bản A có URL `http://127.0.0.1:5173/?designPreview=A` trên Vite DEV. Bản build production không mở preview và không ghi SQLite trong các thao tác preview.

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
