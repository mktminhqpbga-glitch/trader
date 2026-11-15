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

## UI-02 Lệnh 5/5 — Kiểm toán cuối Modern Web Guidance (source audit và kết quả QA cuối)

**Phạm vi và thời điểm kiểm toán:** repository `/kkk`, nhánh `feat/aiCanvasStudioFoundation`, `HEAD 08f636e`; chỉ đọc `apps/web/src/main.ts`, `apps/web/src/designPreview/{designPreview.vue,designPreviewNode.vue,designPreview.css}` và các tài liệu nghiệm thu hiện có. **Không chạy lại Modern Web Guidance CLI, Codex plugin, browser, build hoặc test trong Lệnh 5 của worker tài liệu**; nội dung dưới đây phân biệt rõ bằng chứng lịch sử và xác nhận từ mã đang có.

### Nguồn gốc guide: đã chạy CLI, chưa xác minh cài plugin

Theo **biên bản Lệnh 1/5 ngay phía trên** và `docs/acceptance.md` (mục Modern Web Guidance), tại `/kkk` đã thực sự chạy thành công lệnh tìm kiếm với `DISABLE_TELEMETRY=1 npx --yes modern-web-guidance@latest search 'responsive CSS layout grid and flex, native dialog keyboard focus popover, reduced motion'`, sau đó chạy `DISABLE_TELEMETRY=1 npx --yes modern-web-guidance@latest retrieve` riêng cho **`css-layout`**, **`dialog`**, **`natural-interactions`**. Bản ghi Lệnh 1 xác nhận search trả ID guide và ba lần retrieve trả văn bản: **CLI search/retrieve VERIFIED theo hồ sơ Lệnh 1, không phải test thực hiện lại tại Lệnh 5**. Không có bằng chứng cài thành công hoặc kích hoạt **Codex plugin**: **Codex plugin installation NOT VERIFIED**. Lệnh `codex plugin marketplace add` và `codex plugin add` ở phần đầu chỉ là **hướng dẫn**, không phải lệnh đã thực thi.

**Ranh giới provenance:** Đã có hồ sơ `retrieve` cho ba ID trên; **không suy diễn** các guide khác (ví dụ `motion`, `menu`, `toolbar`) đã được retrieve chỉ vì search trả tên. Hồ sơ hiện tại mô tả kết quả CLI, **không đính kèm nguyên văn output chi tiết của từng guide** trong tài liệu này; do đó không trích dẫn một quy tắc cụ thể như thể đã trực tiếp kiểm chứng trong output, không khẳng định mọi quyết định CSS đều phát sinh từ guide. `docs/acceptance.md` ghi việc bổ sung `overscroll-behavior: contain` ở native modal/backdrop theo hướng dẫn phù hợp; mã CSS thực tế xác nhận có thuộc tính đó, còn quan hệ nhân-quả của các thay đổi khác không tự suy ra.

| Năng lực web-platform | Xác minh **mã đang có** | Kết luận Lệnh 5 |
|---|---|---|
| **CSS Grid, Flexbox, responsive** | `designPreview.css`: `.variantB .previewWorkspace` dùng Grid (scene rail / stage / Inspector + shotstrip), `.previewProjectGrid` dùng Grid card 250–320px; `.previewTopbar`, dock/toolbar, shotstrip dùng Flex; `min-width: 0`, `overflow`, media queries tại 1300/1024/900/760/540px; mobile B đổi workspace thành Flex dọc và Inspector thành panel dưới | **IMPLEMENTED trong preview A/B**; không khẳng định Container Queries |
| **Native dialog, top-layer/backdrop** | `designPreview.vue`: project Create/Rename và Delete `<dialog>` với `showModal()`, `@cancel`, `@click` backdrop; `designPreviewNode.vue`: Image `<dialog>` phóng lớn; `designPreview.css`: `.previewDialog::backdrop`, `:modal`, `overscroll-behavior: contain` | **IMPLEMENTED**; dialog Create/Rename/Delete có guard chống double-submit và giữ top-layer **240ms** sau confirm tránh click-through (theo mã và QA Lệnh 4, không phải tính năng Popover API) |
| **Focus, keyboard, tương tác tự nhiên** | `togglePalette` focus ô search sau `nextTick`, `closePalette` khôi phục focus trigger ở thao tác đóng thích hợp, node `focusPrompt`, dialog focus Hủy/input và select tên khi rename; click ngoài/Escape xử lý điều kiện; CSS `:focus-visible` cho input, handle và media | **IMPLEMENTED trong phạm vi handler đã kiểm tra**; không tuyên bố WCAG 2.2 hoàn tất hoặc hỗ trợ tất cả browser nếu chưa kiểm thử |
| **Reduced motion** | `designPreview.css` có `@media (prefers-reduced-motion: reduce)` giảm animation/transition; layout vẫn dùng transition nhỏ trong trạng thái bình thường | **IMPLEMENTED** theo CSS; không dùng View Transitions |
| **Popover API / CSS Anchor Positioning** | Palette `section[role=dialog]` và menu `div[role=menu]` dùng CSS absolute/overflow và JS Escape/click ngoài; **không có** `popover` attribute, `showPopover()`, `anchor-name` hoặc `position-anchor` | **NOT IMPLEMENTED**; gọi panel “popover” trong mô tả UI không phải browser Popover API |
| **Container Queries** | Preview dùng viewport `@media`, không có `@container` / `container-type` | **NOT IMPLEMENTED** |
| **View Transitions API** | A/B đổi biến thể qua Vue state + CSS; không có `document.startViewTransition` / `view-transition` | **NOT IMPLEMENTED** |

### Ranh giới nghiệm thu và bàn giao

- Entrypoint `apps/web/src/main.ts` chỉ import preview khi `import.meta.env.DEV` và query `?designPreview=A|B`; MapID preview có namespace `AC.UI02.PREVIEW.*`, tách khỏi MapID production. Node, dự án và 8 trạng thái `normal/empty/loading/saved/unsaved/offline/save503/conflict409` đều DEMO/in-memory; **không gọi API/SQLite/AI, không chủ động tạo lỗi backend**. Xem phụ lục kiểm toán MapID Lệnh 5 tại `docs/MAP_ID.md`.
- Bằng chứng QA **Lệnh 1–4** được giữ trong `docs/acceptance.md` và các tài liệu thiết kế trước đó (bao gồm PASS browser 48/48 Lệnh 4 sau bản vá double-click); **không đánh đồng với QA cuối Lệnh 5**. **Final technical acceptance QA Lệnh 5: PASS 68/68 PNG ở lượt Chromium thứ ba** sau hai lượt đầu FAIL được giữ trong lịch sử; 34 ảnh mỗi phương án (20 tên bắt buộc, 4 bổ sung, 10 responsive), 98 checks và 44 graph probes, `apiCalls=[]`, `errors=[]`, 6 Vite-only HMR sockets. Video CC0 thực sự phát/tạm dừng trên A và B. Hồi quy AC-02C gồm 4 browser scripts riêng trên SQLite QA PASS; Bun frozen install, typecheck, build và backend 10 tests/282 assertions PASS. Worker kiểm toán guide **không tự chạy** các phép thử này; đây là kết quả cuối do prime xác minh và ghi trong `docs/acceptance.md`. **Kết quả kỹ thuật không đồng nghĩa phê duyệt thẩm mỹ**.
- **Phê duyệt visual A/B: PENDING, chỉ chủ dự án quyết định; Issue UI-02 #4 OPEN**. Chưa mở hoặc triển khai **WF01/AC03**; không sửa production, Vue/CSS/assets, không commit/push.
