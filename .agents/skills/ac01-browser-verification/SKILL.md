---
name: ac01-browser-verification
description: Kiểm chứng thực tế giao diện, MapID, API health và retry của AI Canvas Studio AC-01 bằng Playwright CLI.
---

# AC-01 Browser Verification

Skill này dùng để kiểm tra hành vi thật của nền tảng AC-01. Không thay thế kiểm thử bằng việc đọc file hoặc nhìn thấy package trong `node_modules`.

## Điều kiện

1. Đọc `CORE_REQUIREMENTS.md`, `AGENTS.md` và `docs/acceptance.md`.
2. Xác nhận branch hiện tại là `feat/aiCanvasStudioFoundation` hoặc branch được người dùng chỉ định.
3. Dùng database tạm khi cần kiểm tra lỗi SQLite; không xóa hay reset `data/studio.sqlite`, `apps/server/data/studio.sqlite` hoặc database người dùng đang test.
4. Mặc định Web/API ở `127.0.0.1:5173`/`3101`, hoặc lấy đúng cổng đã đặt qua `AC_WEB_PORT`/`AC_PORT` (ví dụ `5182`/`3112`). Xác định tiến trình trước khi thao tác; không dừng server hay Chrome của người dùng.

## Quy trình

```bash
npx --yes playwright@1.65.1 --version
npx --yes playwright@1.65.1 cli --help
npx --yes playwright@1.65.1 cli -s=ac01 open http://127.0.0.1:5173/
npx --yes playwright@1.65.1 cli -s=ac01 snapshot
npx --yes playwright@1.65.1 cli -s=ac01 console
npx --yes playwright@1.65.1 cli -s=ac01 requests
```

Đổi URL trong ví dụ theo cổng thực tế nếu không dùng 5173. Chỉ mở một browser session cho một đợt; đóng session do mình mở sau khi kiểm tra. Kiểm tra tối thiểu:

- Trang có tiêu đề `AI Canvas Studio` và hiển thị `AC.SYSTEM.HEALTH`.
- Snapshot có nút `Kiểm tra lại`, status và thông báo backend/SQLite.
- API `/api/health` trả JSON `ok: true`, `database: connected` khi backend đang chạy.
- **Chỉ ở môi trường test biệt lập** khi backend do mình tạo tắt, bấm `Kiểm tra lại` và snapshot phải hiển thị trạng thái lỗi cùng thông báo HTTP 502/503.
- Bật lại backend, bấm lại đúng nút và snapshot phải trở về `Đã kết nối`.
- Ghi console errors và nguyên nhân; lỗi favicon hoặc tài nguyên phụ phải được phân biệt với lỗi ứng dụng.

## Bằng chứng

Ghi ngày giờ, phiên bản Bun/Node/Playwright, URL, lệnh đã chạy, kết quả snapshot và các request quan trọng vào `docs/acceptance.md`. Có thể lưu snapshot/screenshot tạm ngoài Git; không commit `.playwright-cli/`.

Không tuyên bố AC-01 PASS nếu MapID hoặc luồng retry chưa được quan sát trên trình duyệt. Nếu Playwright không khởi chạy browser, ghi `PARTIAL` và nguyên nhân cụ thể.
