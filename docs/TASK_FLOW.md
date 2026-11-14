# Task ID — đặc tả giai đoạn sau

Chưa có AI task thật tại AC-01. Khi triển khai, mỗi lần gửi tạo UUID `taskId` duy nhất cùng `workspaceId`, `canvasId`, `nodeId`, `providerId`, `modelId`, `tabId`, trạng thái và đường dẫn kết quả.

Không dùng MapID cho Task ID. Không tự gửi lại khi mất kết nối. `RECHECK` chỉ tra cứu task đã gửi; chỉ đưa media về đúng project/node sau khi khớp taskId. Không được lấy media cuối tab làm kết quả mặc định.
