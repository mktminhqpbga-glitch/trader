# AI Canvas Studio — quy tắc làm việc cho Codex

## Phạm vi bắt buộc

- Repository chính là `mktminhqpbga-glitch/trader`; nhánh phát triển hiện tại là `feat/aiCanvasStudioFoundation`.
- Trước mỗi thay đổi, đọc toàn bộ [`CORE_REQUIREMENTS.md`](CORE_REQUIREMENTS.md) và tài liệu liên quan trong `docs/`.
- AC-01 đã đóng. AC-02A/B/C theo Issue #2 đã được kiểm chứng về Canvas, Text/Image/Video Node, workflow, revision, SQLite và Project CRUD (đổi tên, xóa mềm, khôi phục). Issue #2 đã đóng với lý do `completed` sau nghiệm thu AC-02C. Không làm lại các đợt A/B/C hoặc tự chuyển sang AC-03 khi chưa có nhiệm vụ mới.
- Khi nhiệm vụ chỉ yêu cầu **rà soát công cụ AC-01**, giới hạn thay đổi ở công cụ kiểm tra, `AGENTS.md`, Skills, tài liệu và script smoke không ghi dữ liệu; không sửa ứng dụng/Canvas hay mở lại Issue AC-01/02.
- Không đọc, sửa, sao chép hoặc đồng bộ mã từ thư mục `ToonFlow-App`. Đây là repository độc lập.
- Không xóa hoặc reset dữ liệu dự án. Database, project, node, connection và kết quả đã lưu phải được bảo toàn.

## Quy tắc sản phẩm

- Mọi thành phần giao diện, chức năng và API phải có MapID ổn định theo dạng `AC.NHÓM.CHỨC_NĂNG.THÀNH_PHẦN`.
- Giao diện và hành vi phải đi cùng nhau. Không tạo nút trang trí hoặc trạng thái giả.
- Không dùng dữ liệu giả để tuyên bố chức năng đã chạy. Chỉ báo cáo PASS khi có thao tác thực tế và bằng chứng.
- Xây dựng tuần tự theo 3 giai đoạn: ứng dụng cơ bản, kết nối AI thật, hoàn thiện/đóng gói Desktop.
- AC-02A đã bật Text Node và lưu SQLite; AC-02B bật Image/Video Node chỉ để soạn prompt và nối workflow (Text→Image, Text→Video, Image→Video). Không gửi tác vụ AI, không giả lập media; bảo toàn node/edge cũ khi nâng cấp.
- AC-02C chỉ mở rộng quản lý dự án, giữ nguyên Canvas/Node/Edge và các ID khi đổi tên, xóa mềm, khôi phục. Không triển khai xóa vĩnh viễn; dự án đã xóa mềm phải khôi phục được. Phải có kiểm thử UI thật, SQLite migration và hồi quy AC-02A/B trước nghiệm thu.

## Công nghệ và phụ thuộc

- Giữ framework hiện tại: Vue 3, TypeScript, Vite, Element Plus, Vue Flow, Bun/Node.js và SQLite.
- Kiểm tra phụ thuộc đã có trước khi thêm thư viện. Không thêm Pinia, Dagre hoặc Zod chỉ để dự phòng; chỉ thêm khi mã AC-01 dùng trực tiếp và đã có tiêu chí nghiệm thu.
- Ưu tiên công cụ kiểm thử trình duyệt có thể chạy thật. Quy trình AC-01 dùng Playwright CLI; không coi Chrome DevTools MCP hoặc Context7 là dependency của ứng dụng.
- `npm ls` có thể báo thiếu workspace link trong dự án Bun; kết luận cài đặt phải dựa trên `bun install --frozen-lockfile`, `bun.lock`, import được từ đúng workspace và typecheck/build. Không tự sửa npm cache toàn cục bằng `sudo`, `--force` hay cài thư viện khi chỉ gặp lỗi cache.
- Không commit secret, `.env`, database runtime, `dist/`, `node_modules/` hoặc thư mục bằng chứng tạm.

## Lệnh kiểm tra chuẩn

```bash
bun install --frozen-lockfile
bun run typecheck
bun run build
bun test apps/server/src/index.test.ts
bun run dev
# Trong terminal khác, khi Web/API đang chạy:
bun run tooling:smoke # mặc định Web :5173; hỗ trợ AC_WEB_URL để đổi cổng
npx --yes playwright@1.65.1 --version
npx --yes playwright@1.65.1 cli --help
```

Khi kiểm tra môi trường, dùng skill [ac01-tooling-qa](.agents/skills/ac01-tooling-qa/SKILL.md) và [ac01-browser-verification](.agents/skills/ac01-browser-verification/SKILL.md) để giữ hồi quy AC-01; AC-02 phải kiểm thử thao tác Canvas thật bằng Playwright (node, edge, pan/zoom, dự án A/B, refresh, restart và lỗi lưu). Luôn dùng database tạm và cổng thử nghiệm riêng khi **ghi dữ liệu hoặc mô phỏng lỗi**; chỉ dừng các tiến trình thử nghiệm do mình khởi tạo. Nếu ứng dụng người dùng đã mở, không làm gián đoạn phiên đó chỉ để chạy audit.

## Báo cáo và bàn giao

- Cập nhật `docs/acceptance.md` và `progressReport.html` cùng một lần với bằng chứng mới.
- Ghi rõ công cụ đã kiểm chứng, công cụ chỉ có trong môi trường, công cụ chưa tích hợp, phiên bản, license, lệnh chạy và giới hạn.
- Giữ trạng thái `PARTIAL` hoặc `NOT TESTED` nếu thiếu kiểm tra thực tế. Không đánh dấu AC-02 hoàn thành chỉ vì đã có giao diện, code hoặc build thành công.
- Trước commit, xem `git diff`, chạy các lệnh kiểm tra phù hợp và chỉ stage file thuộc **phạm vi nhiệm vụ được giao**.
- Commit dùng Conventional Commits. Push chỉ lên nhánh phát triển đã được yêu cầu; không merge vào `main`, không force-push.
