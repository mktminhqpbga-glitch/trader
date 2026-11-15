# UI-02 — Reference Direction: Home / Canvas / Global Composer

**QA Chromium: VERIFIED TECHNICAL DEV PREVIEW PASS — 12/12 PNG. VISUAL APPROVAL: PENDING OWNER.**

Đây là bằng chứng kiểm thử hướng giao diện tham chiếu mới (ảnh Tổng, Canvas, thanh công cụ và composer). Không thay thế hoặc sửa lịch sử **UI-02 Lệnh 1–5**, không phải bằng chứng production hay xác nhận AI đã sinh ảnh/video. Script `scripts/ui02-reference-qa.js` kiểm tra bản `referenceDirection` chạy bằng Vue/VueFlow thật và chỉ sử dụng dữ liệu DEMO trong bộ nhớ. **Prime đã chạy lại sau khi sửa bước tải ảnh: kết quả kỹ thuật PASS, nhưng chưa duyệt thẩm mỹ A/B.**

## Kết quả đã xác minh — lần chạy Chromium thứ hai

Nguồn kiểm chứng: **`scripts/ui02-reference-qa.js`** chạy trong phiên Chromium Playwright CLI `ui02shell2` do prime quản lý; log **`/tmp/ui02-reference-qa-run2.log`** ghi `result: "PASS — REFERENCE-DIRECTION TECHNICAL DEV PREVIEW ONLY"`. Bản JSON kết quả được lưu cùng bằng chứng tại **[qa-results.json](qa-results.json)**. Đã đối chiếu dữ liệu JSON cuối log với các file trong `docs/evidence/ui02/reference/`: **12 đường dẫn duy nhất đều tồn tại, chữ ký PNG đúng, kích thước pixel khớp 1440×900 hoặc 390×844**.

- **12/12 ảnh**: A = 6, B = 6 (Home, Canvas 7 node, Composer có ảnh tham chiếu; desktop và mobile).
- **60 checks PASS; 40 graph probes PASS** (bao gồm Canvas gốc 3 node/3 cạnh và workflow 7 node/5 cạnh).
- **4 lượt phát/tạm dừng WebM CC0 thật**, `readyState: 4`, `paused: true`: A desktop **0→1.008694 giây**, A mobile **0→0.983742 giây**, B desktop **0→0.995014 giây**, B mobile **0→1.025113 giây**.
- `apiCalls: []`, `appSockets: []`, `pageErrors: []`; `hmrSockets: 28` là **Vite HMR**, không phải kết nối tác vụ AI.

Kết quả này chỉ xác nhận **giao diện DEV preview và tương tác dữ liệu trong bộ nhớ**, không có kiểm thử backend production, gọi AI hoặc kiểm tra ghi/đọc SQLite trực tiếp. **VISUAL APPROVAL: PENDING OWNER**; không tự chọn A/B và không mở Lệnh 6.

## Chạy trong phiên Chromium hiện có

Prime đã sử dụng tab Vite DEV `http://127.0.0.1:5193/?designPreview=A&screen=home` hoặc `?designPreview=B&screen=home` bằng phiên Playwright CLI **`ui02shell2` hiện có**; script lấy origin từ tab và tự kiểm cả A/B. Lệnh tái lập trong thư mục `/kkk`:

```bash
npx --yes playwright@1.65.1 cli -s=ui02shell2 run-code --filename scripts/ui02-reference-qa.js
```

Worker viết script **không tự khởi chạy browser/server**, không gọi API, không thay đổi Vue/CSS, không commit/push. Prime đã thực thi và lưu 12 ảnh thật; log nêu trên và file PNG là bằng chứng nghiệm thu kỹ thuật.

## 12 ảnh đã chụp và xác minh

| Phương án | Desktop 1440×900 | Mobile 390×844 |
|---|---|---|
| A · Tổng | [A-home-1440x900.png](A-home-1440x900.png) | [A-home-390x844.png](A-home-390x844.png) |
| A · Canvas 7 node | [A-canvas7-1440x900.png](A-canvas7-1440x900.png) | [A-canvas7-390x844.png](A-canvas7-390x844.png) |
| A · Composer và ảnh tham chiếu | [A-composer-1440x900.png](A-composer-1440x900.png) | [A-composer-390x844.png](A-composer-390x844.png) |
| B · Tổng | [B-home-1440x900.png](B-home-1440x900.png) | [B-home-390x844.png](B-home-390x844.png) |
| B · Canvas 7 node | [B-canvas7-1440x900.png](B-canvas7-1440x900.png) | [B-canvas7-390x844.png](B-canvas7-390x844.png) |
| B · Composer và ảnh tham chiếu | [B-composer-1440x900.png](B-composer-1440x900.png) | [B-composer-390x844.png](B-composer-390x844.png) |

Mọi ảnh ghi vào **`docs/evidence/ui02/reference/`** và đã được kiểm đủ kích thước viewport (không dùng `fullPage`). Kết quả kiểm tra thực tế xác nhận **12 đường dẫn duy nhất** từ lần chạy mới.

## Các assertion đã được Chromium xác nhận

- **Home thật:** root `.referenceDirection`; `?designPreview=A|B&screen=home`; sidebar Tổng/Dự án/Canvas/Tạo ảnh/Tạo video/Viết ý tưởng, hero tạo Canvas trống thật với Composer, ba dự án mẫu và tám shortcut có hành vi thực; chuyển qua Home, Library, Canvas không làm gọi API.
- **Tám Home shortcut:** Ghi chú, Tạo hình ảnh, Tạo video tạo node VueFlow thật; Canvas mở Canvas; 7 phân cảnh hiện đủ **7 node/5 cạnh SVG**; Prompt mở và focus composer; Dự án mở Library; Media DEMO chuyển sang trạng thái compact với thông báo chưa kết nối thật.
- **Canvas:** mặc định `?designPreview=A|B` vẫn vào Canvas; các **3 node/3 cạnh** gốc và 7 node/5 cạnh kiểm qua DOM VueFlow SVG path/ID, không chỉ nhãn số; thanh công cụ Zoom+/Zoom-/Fit/Add cũ còn hoạt động; chuột pan thật; **Quickbar tám nút** mở Palette, Fit, tạo Text/Image/Video, ẩn/hiện media, workflow 7 node và mở composer.
- **Global composer:** input được focus, nút Submit disabled khi rỗng; Escape và Close đóng mà **giữ bản nháp** trong tình huống chưa chọn node; ba preset SVG thật; thử tải `reference-qa.svg` cục bộ vào file input bằng Playwright, kiểm tra hai ảnh tham chiếu đã giải mã (preset `/designPreview/`, upload `blob:`), nút đánh dấu toggles; chọn loại Image/Video/Text và tỷ lệ 16:9/1:1/9:16; Submit **tạo node Image mới có prompt và aspect 9:16** khi chưa chọn node, hoặc **cập nhật nội dung Text node đã chọn** mà không tăng số node hay xóa cạnh.
- **Media và responsive:** Video local CC0 `/designPreview/flower-cc0.webm` Play/Pause thật, thời gian phát tiến lên; ảnh SVG và video được ghi rõ là DEMO, không nhận là kết quả AI. 1440×900 và 390×844 không tràn chiều ngang document/root; Canvas toolbar, Quickbar và Composer nằm trong viewport, nội dung Composer không tràn ngang.
- **An toàn kiểm thử:** `apiCalls: []`, `appSockets: []`, `pageErrors: []`; Vite HMR WebSocket đếm riêng. Trạng thái và ảnh upload chỉ nằm trong bộ nhớ, không gọi SQLite trực tiếp hay kết nối AI.

**Nghiệm thu kỹ thuật đạt:** Script đã trả `result: PASS — REFERENCE-DIRECTION TECHNICAL DEV PREVIEW ONLY`, `count: 12`, đầy đủ screenshot paths, 60 checks, 40 graph probes và 4 lần đo Play/Pause. Ảnh và đường dẫn đã được xác minh ngoài script. **Chờ chủ dự án duyệt thẩm mỹ A/B; không mở Lệnh 6.**
