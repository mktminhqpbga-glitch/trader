# AI Canvas Studio — quy tắc làm việc cho Codex

## Phạm vi bắt buộc

- Repository chính là `mktminhqpbga-glitch/trader`; nhánh phát triển hiện tại là `feat/aiCanvasStudioFoundation`.
- Trước mỗi thay đổi, đọc toàn bộ [`CORE_REQUIREMENTS.md`](CORE_REQUIREMENTS.md) và tài liệu liên quan trong `docs/`.
- AC-01 đã đóng. Phạm vi commit hiện tại là AC-02A theo Issue #2: quản lý dự án, Canvas Vue Flow, Text Node và lưu SQLite có kiểm chứng.
- Không đọc, sửa, sao chép hoặc đồng bộ mã từ thư mục `ToonFlow-App`. Đây là repository độc lập.
- Không xóa hoặc reset dữ liệu dự án. Database, project, node, connection và kết quả đã lưu phải được bảo toàn.

## Quy tắc sản phẩm

- Mọi thành phần giao diện, chức năng và API phải có MapID ổn định theo dạng `AC.NHÓM.CHỨC_NĂNG.THÀNH_PHẦN`.
- Giao diện và hành vi phải đi cùng nhau. Không tạo nút trang trí hoặc trạng thái giả.
- Không dùng dữ liệu giả để tuyên bố chức năng đã chạy. Chỉ báo cáo PASS khi có thao tác thực tế và bằng chứng.
- Xây dựng tuần tự theo 3 giai đoạn: ứng dụng cơ bản, kết nối AI thật, hoàn thiện/đóng gói Desktop.
- AC-02A chỉ bật chức năng Text Node, quản lý dự án và lưu dữ liệu; Image/Video Node và AI sẽ nghiệm thu ở hạng mục sau. Đảm bảo đọc dữ liệu các loại node cũ không bị mất khi cập nhật hoặc migration.

## Công nghệ và phụ thuộc

- Giữ framework hiện tại: Vue 3, TypeScript, Vite, Element Plus, Vue Flow, Bun/Node.js và SQLite.
- Kiểm tra phụ thuộc đã có trước khi thêm thư viện. Không thêm Pinia, Dagre hoặc Zod chỉ để dự phòng; chỉ thêm khi mã AC-01 dùng trực tiếp và đã có tiêu chí nghiệm thu.
- Ưu tiên công cụ kiểm thử trình duyệt có thể chạy thật. Quy trình AC-01 dùng Playwright CLI; không coi Chrome DevTools MCP hoặc Context7 là dependency của ứng dụng.
- Không commit secret, `.env`, database runtime, `dist/`, `node_modules/` hoặc thư mục bằng chứng tạm.

## Lệnh kiểm tra chuẩn

```bash
bun install --frozen-lockfile
bun run typecheck
bun run build
bun run dev
npx --yes playwright@1.65.1 --version
npx --yes playwright@1.65.1 cli --help
```

Khi kiểm tra giao diện, tham khảo skill [ac01-browser-verification](.agents/skills/ac01-browser-verification/SKILL.md) để giữ hồi quy AC-01; AC-02 phải kiểm thử thao tác Canvas thật bằng Playwright (node, edge, pan/zoom, dự án A/B, refresh, restart và lỗi lưu). Luôn dùng database tạm và cổng thử nghiệm riêng; dừng các tiến trình thử nghiệm do mình khởi tạo.

## Báo cáo và bàn giao

- Cập nhật `docs/acceptance.md` và `progressReport.html` cùng một lần với bằng chứng mới.
- Ghi rõ công cụ đã kiểm chứng, công cụ chỉ có trong môi trường, công cụ chưa tích hợp, phiên bản, license, lệnh chạy và giới hạn.
- Giữ trạng thái `PARTIAL` hoặc `NOT TESTED` nếu thiếu kiểm tra thực tế. Không đánh dấu AC-02 hoàn thành chỉ vì đã có giao diện, code hoặc build thành công.
- Trước commit, xem `git diff`, chạy các lệnh kiểm tra phù hợp và chỉ stage file thuộc AC-02.
- Commit dùng Conventional Commits. Push chỉ lên nhánh phát triển đã được yêu cầu; không merge vào `main`, không force-push.
