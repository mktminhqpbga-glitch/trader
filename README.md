# AI Canvas Studio

Ứng dụng AI Canvas Studio **được xây dựng mới hoàn toàn** trong repository này, độc lập với mã nguồn ToonFlow cũ.

## Trạng thái
- **AC-01 đã đóng:** Nền tảng Web Vue 3, TypeScript, backend Bun, SQLite và health endpoint đã được kiểm chứng.
- **AC-02A đã qua kiểm thử thực tế trên môi trường thử nghiệm (Issue #2 còn mở):** Trang dự án, Text Node trên Canvas Vue Flow, pan/zoom/fit, autosave SQLite và refresh/restart giữ dữ liệu. Xem bằng chứng trong `docs/acceptance.md`.
- **AC-02 phần tiếp theo chưa bắt đầu theo yêu cầu mới:** Bật tạo Image/Video Node và các nghiệp vụ tiếp theo.
- **Chưa triển khai trong AC-02A:** kết nối AI, Chrome Extension, Desktop macOS.
- **Không đánh dấu hoàn thành** nếu chưa chạy thử chức năng thật.

## Theo dõi
- [Báo cáo tiến độ](./progressReport.html)
- [Tài liệu yêu cầu cốt lõi](./CORE_REQUIREMENTS.md)
- [Tài liệu kỹ thuật của ứng dụng mới](./docs/ARCHITECTURE.md)
- [Danh sách công việc](../../issues)

Các thay đổi chức năng được thực hiện tuần tự trên nhánh `feat/aiCanvasStudioFoundation`. Dự án không được thay bằng bản HTML mô phỏng; mỗi API/nút phải có tác dụng thực và có tiêu chí nghiệm thu.
