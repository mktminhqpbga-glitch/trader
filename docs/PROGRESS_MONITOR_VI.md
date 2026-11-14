# Giám sát tiến độ 120 giây/lần

Chương trình `scripts/progressMonitor.mjs` kiểm tra thực tế repository `trader` **khi có máy đang chạy script**. Đây không phải lịch nền của ChatGPT.

## Dữ liệu đọc mỗi lượt
- HEAD nhánh `feat/aiCanvasStudioFoundation` (GitHub API).
- GitHub Issue #1 AC-01 (GitHub API).
- `progressReport.html` tại nhánh làm việc và tại `main`.
- `docs/acceptance.md` tại nhánh làm việc, các mục PASS/PARTIAL/FAIL/NOT TESTED.

Kết quả từng lần vào `data/monitor/checks-YYYY-MM-DD.jsonl`, snapshot vào `data/monitor/latest.json`. Thư mục data đã được Git ignore. Script chỉ đọc GitHub và ghi log tại máy; không tự chỉnh Issue, không tạo commit và **không khởi chạy Codex hoặc tự giao AC-02**.

## Chạy với Bun

```bash
git clone https://github.com/mktminhqpbga-glitch/trader.git
cd trader
git switch feat/aiCanvasStudioFoundation
bun install
bun run monitor
```

Nên dùng GitHub CLI đã đăng nhập (`gh auth login`) để tránh giới hạn 60 request API/giờ đối với truy cập công khai:

```bash
GITHUB_TOKEN="$(gh auth token)" bun run monitor
```

Chỉ kiểm tra một lần:

```bash
GITHUB_TOKEN="$(gh auth token)" bun run monitor:once
```

Không lưu token vào repo, log hoặc Issue. Không dán token vào hội thoại.

## Giới hạn và vận hành

- Phải để Terminal/tiến trình đang chạy. Máy ngủ, đóng Terminal, tắt máy hoặc mất mạng sẽ ngừng/gián đoạn giám sát.
- Bộ hẹn giờ dùng chu kỳ 120 giây; nếu một lượt trước chưa xong sẽ bỏ qua lượt trùng.
- Đọc trạng thái PASS từ báo cáo không có nghĩa là trình giám sát đã tự kiểm thử lại chức năng.
- Khi có thay đổi, chương trình ghi phần việc chưa đạt và nhắc tiếp tục AC-01; không thể tự điều khiển Codex nếu chưa thiết lập agent riêng.
