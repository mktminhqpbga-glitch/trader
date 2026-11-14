# AI Canvas Studio

Ứng dụng AI Canvas Studio **được xây dựng mới hoàn toàn** trong repository này, độc lập với mã nguồn ToonFlow cũ.

## Trạng thái
- **AC-01 đã đóng:** Nền tảng Web Vue 3, TypeScript, backend Bun, SQLite và health endpoint đã được kiểm chứng.
- **AC-02A đã PASS trong môi trường thử nghiệm:** Trang dự án, Text Node trên Canvas Vue Flow, pan/zoom/fit, autosave SQLite và refresh/restart giữ dữ liệu. Issue #2 đã được đóng sau nghiệm thu tổng thể AC-02C.
- **AC-02B đã PASS:** Image/Video Node dùng để nhập prompt và kết nối Text→Image, Text→Video, Image→Video; kiểm tra dữ liệu hai phía và SQLite trên cùng Canvas.
- **AC-02C và toàn bộ AC-02 đã PASS trên môi trường thử nghiệm; Issue #2 CLOSED/completed:** Đổi tên project, xóa mềm/khôi phục qua menu và API, giữ nguyên Canvas/Node/Edge ID, revision và dữ liệu qua refresh/restart. Đã chạy lại AC-01/02A/02B, gồm lỗi API và xung đột phiên bản. Xem bằng chứng trong `docs/acceptance.md`.
- **Chưa triển khai trong AC-02:** sinh media bằng AI, Chrome Extension, Desktop macOS.
- **Không đánh dấu hoàn thành** nếu chưa chạy thử chức năng thật.

## Theo dõi
- [Báo cáo tiến độ](./progressReport.html)
- [Tài liệu yêu cầu cốt lõi](./CORE_REQUIREMENTS.md)
- [Tài liệu kỹ thuật của ứng dụng mới](./docs/ARCHITECTURE.md)
- [Danh sách công việc](../../issues)

Các thay đổi chức năng được thực hiện tuần tự trên nhánh `feat/aiCanvasStudioFoundation`. Dự án không được thay bằng bản HTML mô phỏng; mỗi API/nút phải có tác dụng thực và có tiêu chí nghiệm thu.
