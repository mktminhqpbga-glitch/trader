# Cài và chạy từ đầu (bản nền tảng AC-01)

## Yêu cầu
- Máy Mac Intel, macOS hoặc môi trường có thể chạy Bun. Chưa có bằng chứng kiểm thử thực tế trên macOS Ventura.
- Cài Bun từ trang chính thức: https://bun.sh/docs/installation
- Trong terminal kiểm tra `bun --version`.

## Cách chạy
```bash
git clone https://github.com/mktminhqpbga-glitch/trader.git
cd trader
git switch feat/aiCanvasStudioFoundation
bun install
bun run typecheck
bun run build
bun run dev
```
Mở `http://127.0.0.1:5173/`. Kiểm tra `http://127.0.0.1:3101/api/health` và nút **Kiểm tra lại** trên trang.

## Lưu trữ
SQLite được tạo tại `apps/server/data/studio.sqlite` khi chạy server từ workspace đó. Muốn kiểm tra mà không ảnh hưởng dữ liệu thường dùng: đặt `AC_DB_PATH=/tmp/acCanvasCheck/studio.sqlite` trước lệnh chạy. `data/` bị Git ignore.

## Xử lý lỗi
- Nếu báo không kết nối, kiểm tra server có đang chạy ở cổng 3101; mở URL health để đọc HTTP thực tế.
- Nếu cổng 5173/3101 đã dùng, dừng chương trình chiếm cổng; chưa có UI tự đổi cổng.
- Nếu SQLite lỗi quyền, kiểm tra đường dẫn `AC_DB_PATH`, đừng xóa DB đang có.
- Không có Bun hoặc build lỗi: ghi log và trạng thái NOT TESTED, không đánh dấu PASS.
