# UI-02 — Modern Web Guidance, khả năng tương thích và kiểm chứng

**Ngày:** 15/11/2026. **Phạm vi:** hai Vue preview A/B trong apps/web/src/designPreview và entrypoint DEV ở apps/web/src/main.ts.

## Nguồn và trạng thái cài đặt

- Hướng dẫn chính thức: https://github.com/GoogleChrome/modern-web-guidance/blob/main/README.md và https://developer.chrome.com/docs/modern-web-guidance/get-started.
- Lệnh chính thức hiện tại cho Codex: 
  - codex plugin marketplace add GoogleChrome/modern-web-guidance
  - codex plugin add modern-web-guidance@googlechrome
- Lệnh CLI khác để tìm/retrieve nội dung mà không cài: npx modern-web-guidance@latest search "animate a dialog modal backdrop" và npx modern-web-guidance@latest retrieve "animate-to-from-top-layer".
- Môi trường sửa lần này đang sử dụng GitHub connector và CI, không được cấp terminal Codex của chủ dự án; **chưa xác minh đã cài Modern Web Guidance vào Codex**, chưa chạy tìm và retrieve từng guide. Các mục dưới đây là ứng dụng web-platform tương thích với định hướng README; không tự nhận đã thực thi plugin/guide cụ thể.

## Hướng dẫn áp dụng vào mã, hỗ trợ trình duyệt và fallback

| Chủ đề | Nguồn | Vấn đề | File/đoạn giao diện | Browser support và fallback | Bằng chứng |
|---|---|---|---|---|---|
| CSS Grid | Modern Web Guidance README, CSS Grid https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout | Hai phương án khác cấu trúc; B có ba cột + filmstrip | designPreview.css: variantB .previewWorkspace; project grid | CSS Grid ổn trên Chrome/Edge/Firefox/Safari hiện đại; media queries chuyển sang flex trên mobile | CI screenshot responsive, kết quả chờ kiểm tra |
| Flexbox | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout | Toolbar, header, shotstrip co giãn | designPreview.css: previewTopbar, previewCanvasToolbar, previewShotStrip | Tính năng cơ bản phổ biến; min-width:0 và overflow:auto tránh tràn | 390×844, 1024×768 screenshot chờ QA |
| Container queries | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries | Điều chỉnh theo vùng chứa khi Inspector mở | Chưa triển khai, vì các phần hiện tại có breakpoint viewport đơn giản hơn | Fallback bằng @media; dùng khi có bằng chứng cần độc lập viewport | NOT IMPLEMENTED |
| Native dialog / focus | Modern Web Guidance README, https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog | Tránh backdrop click-through, có xác nhận xóa/cancel và ESC native | designPreview.vue: deleteDialog, projectDialog; designPreview.css: ::backdrop | showModal và dialog hỗ trợ các browser hiện đại; không thêm polyfill nếu target chỉ bản Chrome QA | Cần kiểm tra Escape, focus, backdrop thực tế |
| Popover positioning | https://developer.mozilla.org/en-US/docs/Web/API/Popover_API | Không cắt menu ở mép viewport | designPreview.vue: palette/node menus; CSS overlay, responsive | Popover API chưa đưa vào preview; dùng panel CSS cũ cùng close/ESC, QA riêng chống cắt | PARTIAL; chưa xác minh vị trí sát mép |
| Focus management | https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus | Nhập tìm kiếm sau mở menu, focus editor khi chọn node | designPreview.vue: nextTick focus palette; designPreviewNode.vue: focusPrompt | Native focus(), button, textarea, dialog showModal; không phụ thuộc external JS | QA keyboard/ESC chờ |
| View transitions | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API | Chuyển A/B nhẹ | Chưa dùng API; dùng CSS transition nhỏ | Không cần polyfill, ưu tiên giảm chuyển động | NOT IMPLEMENTED, chủ đích |
| Animation performance | https://web.dev/articles/animations-guide | Không layout thrashing khi hover, ưu tiên opacity/transform/border | designPreview.css: hover, card images và selected | CSS transition phổ biến; prefers-reduced-motion tắt animation | QA ảnh, profiler chưa chạy |
| Responsive | https://web.dev/learn/design | Màn 1440,1920,1280,1024,390 | designPreview.css: @media 1300/1024/760/540; flexible main | Media queries phổ biến; menu có overflow và scroll khi cần | Playwright định hướng chụp đủ viewport |
| Accessibility | https://www.w3.org/WAI/WCAG22/quickref/ | Nút có label, keyboard, focus, contrast, DEMO phân biệt | designPreview.vue, designPreviewNode.vue, designPreview.css | Dùng button/label/textarea/video controls thật; browser accessibility mặc định | Keyboard và contrast cần kiểm định thủ công; không tự báo WCAG PASS |

## Các nguyên tắc quan trọng

- Sử dụng mặc định browser controls đối với video phát/tạm dừng. Video tham khảo CC0 của MDN: https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm. Không khẳng định nội dung video là cảnh phố đêm; mô tả rõ DEMO thiên nhiên.
- Popup xác nhận dùng HTML dialog showModal() để tránh tạo logic focus trap riêng; chỉ có dữ liệu bộ nhớ thay đổi.
- Các ảnh SVG của preview do dự án tạo riêng và đặt dưới apps/web/public/designPreview. Chúng không lấy từ LibTV.
- Không tạo request API hoặc socket trong preview. Dev-only import.meta.env.DEV ở apps/web/src/main.ts, nên production build không cung cấp đường preview qua query.
- Các kết luận browser support tham chiếu MDN/web.dev; cần xem lại bằng công cụ Modern Web Guidance khi Codex terminal có quyền chạy CLI.

## Các lệnh kiểm chứng

Tại repository:
1. bun install --frozen-lockfile
2. bun run typecheck
3. bun run build
4. bun test apps/server/src/index.test.ts
5. bun run dev:web
6. npx --yes playwright@1.65.1 cli -s=ui02preview open http://127.0.0.1:5173/?designPreview=A
7. npx --yes playwright@1.65.1 cli -s=ui02preview run-code --filename scripts/ui02-design-preview-qa.js

CI tương ứng: .github/workflows/ui02-design-preview.yml. Cần xem log Actions trước khi đánh dấu PASS; chỉ commit ảnh do browser chụp thành công. Hệ thống frontend production và DB không nằm trong preview.

## Xác minh CLI thực tế trong Lệnh 1/5 — 15/11/2026

Đã đối chiếu [README chính thức](https://github.com/GoogleChrome/modern-web-guidance) tại thời điểm thực hiện. Cách cài qua wizard là `npx modern-web-guidance@latest install`; đường cài plugin **Codex** chính thức là `codex plugin marketplace add GoogleChrome/modern-web-guidance`, sau đó `codex plugin add modern-web-guidance@googlechrome`. **Không tự động chạy lệnh cài plugin** vào cấu hình Codex của người dùng.

Đã **thực sự chạy thành công** trong terminal ở checkout `/kkk`:

```bash
DISABLE_TELEMETRY=1 npx --yes modern-web-guidance@latest search 'responsive CSS layout grid and flex, native dialog keyboard focus popover, reduced motion'
DISABLE_TELEMETRY=1 npx --yes modern-web-guidance@latest retrieve css-layout
DISABLE_TELEMETRY=1 npx --yes modern-web-guidance@latest retrieve dialog
DISABLE_TELEMETRY=1 npx --yes modern-web-guidance@latest retrieve natural-interactions
```

Lệnh `search` trả về các ID `css-layout`, `natural-interactions`, `motion`, `dialog`, `menu`, `toolbar` và các guide khác; cả ba lệnh `retrieve` đã tạo kết quả văn bản guide. Đây là **bằng chứng CLI hoạt động**, **không phải bằng chứng plugin Codex đã cài/đang kích hoạt**.

Áp dụng có chọn lọc, không viết lại preview: CSS Grid/Flex và `min-width:0` cho cấu trúc A/B và thư viện, breakpoint mobile và `100dvh` đã có; ring `:focus-visible` và `prefers-reduced-motion` đã có; native `<dialog>.showModal()` cho xác nhận xóa/đổi tên đã có; bổ sung `overscroll-behavior: contain` trên modal và backdrop để giảm cuộn xuyên phía sau. Palette/menu vẫn dùng CSS + JS đóng bằng Escape/click ngoài; **chưa áp dụng Popover API hoặc anchor positioning** do không cần thay đổi cấu trúc khi chưa có bằng chứng lỗi, không tự nhận đã triển khai. QA tương tác và screenshot được ghi riêng sau khi Playwright chạy thành công.

**Trạng thái plugin Codex:** NOT VERIFIED / chưa cài trong phiên này. **CLI search/retrieve:** VERIFIED; không suy diễn đây là phê duyệt thẩm mỹ UI-02.
