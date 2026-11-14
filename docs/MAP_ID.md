# Bảng MapID — AC-01

| MapID | Tên | Hành vi | File | Selector | Trạng thái | Cách xác minh |
|---|---|---|---|---|---|---|
| AC.APP | Khung ứng dụng | Hiển thị Web độc lập | apps/web/src/App.vue | [data-map-id="AC.APP"] | Đã viết, chưa kiểm thử | Mở URL Web |
| AC.HOME | Trang nền tảng | Giới thiệu tình trạng xây dựng | apps/web/src/App.vue | [data-map-id="AC.HOME"] | Đã viết, chưa kiểm thử | Kiểm tra DOM |
| AC.SYSTEM.HEALTH | Bảng kết nối | Hiển thị kết quả GET health thật | apps/web/src/App.vue | [data-map-id="AC.SYSTEM.HEALTH"] | Đã viết, chưa kiểm thử | Bật/tắt API |
| AC.SYSTEM.HEALTH.RETRY | Kiểm tra lại | Gửi GET /api/health mỗi lần bấm | apps/web/src/App.vue | [data-map-id="AC.SYSTEM.HEALTH.RETRY"] | Đã viết, chưa kiểm thử | Bấm và xem Network |

**Quy ước:** MapID khác với API ID, taskId, nodeId, tabId. Các thành phần Canvas/node chưa xuất hiện không được đánh dấu hoàn thành.
