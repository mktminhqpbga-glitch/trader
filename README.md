# AI Canvas Studio

Ứng dụng AI Canvas Studio **được xây dựng mới hoàn toàn** trong repository này, độc lập với mã nguồn ToonFlow cũ.

## Trạng thái
- Đang triển khai **AC-01 — nền tảng chạy được** (Web Vue 3 + TypeScript, server Bun, SQLite, health endpoint).
- **Chưa nghiệm thu:** Canvas và node ảnh/video, kết nối AI, Chrome Extension, Desktop macOS.
- **Không đánh dấu hoàn thành** nếu chưa chạy thử chức năng thật.

## Theo dõi
- [Báo cáo tiến độ](./progressReport.html)
- [Tài liệu yêu cầu cốt lõi](./CORE_REQUIREMENTS.md)
- [Tài liệu kỹ thuật của ứng dụng mới](./docs/ARCHITECTURE.md)
- [Danh sách công việc](../../issues)

Các thay đổi chức năng được thực hiện tuần tự trên nhánh `feat/aiCanvasStudioFoundation`. Dự án không được thay bằng bản HTML mô phỏng; mỗi API/nút phải có tác dụng thực và có tiêu chí nghiệm thu.
