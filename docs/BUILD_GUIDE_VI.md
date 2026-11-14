# YÊU CẦU XÂY DỰNG ỨNG DỤNG AI CANVAS STUDIO

## 1. Mục tiêu dự án

Hãy hướng dẫn và xây dựng một ứng dụng AI Canvas Studio có chức năng tương tự ToonFlow: tạo ảnh, tạo video, quản lý nội dung AI bằng các node trên Canvas và kết nối với AI bên ngoài.

**Yêu cầu quan trọng:**
- Hướng dẫn từng bước bằng tiếng Việt, dễ hiểu cho người chưa biết lập trình.
- Ưu tiên ứng dụng Desktop chạy trên macOS Intel, có thể phát triển thêm bản Web.
- Giao diện tối giản, màu tối, chuyên nghiệp, có thể kéo thả và phóng to/thu nhỏ.
- Các nút của node phải cân đối và không che nội dung Canvas.
- Không xây dựng tất cả chức năng cùng lúc; hoàn thiện phần cơ bản trước.
- Mọi thành phần giao diện, API và chức năng phải có ID để quản lý thống nhất.
- Không tự ý thay đổi hoặc xóa dữ liệu người dùng.

## 2. Công nghệ đề xuất

Sử dụng công nghệ dễ tìm tài liệu, dễ bảo trì:

- **Vue 3 + TypeScript:** xây dựng giao diện.
- **Vue Flow:** tạo Canvas, node và dây kết nối.
- **Element Plus:** nút, bảng chọn, menu và hộp thoại.
- **Bun hoặc Node.js:** chạy backend.
- **SQLite:** lưu dự án và lịch sử tác vụ ở giai đoạn đầu.
- **Chrome Extension Manifest V3:** kết nối với các trang AI được hỗ trợ.
- **WebSocket:** trao đổi thông tin giữa Extension và backend.
- **Ứng dụng Desktop:** sử dụng lớp đóng gói phù hợp macOS.

Giải thích rõ công dụng của từng công nghệ trước khi hướng dẫn cài đặt.

## 3. Cấu trúc giao diện và ID

Quy tắc đặt ID:

`AC.NHÓM.CHỨC_NĂNG.THÀNH_PHẦN`

Ví dụ:

- `AC.IMAGE.NODE`: node tạo ảnh.
- `AC.IMAGE.PROMPT`: ô nhập prompt ảnh.
- `AC.IMAGE.MODEL`: bộ chọn AI.
- `AC.IMAGE.SEND`: nút tạo ảnh.
- `AC.IMAGE.TAB.TRIGGER`: nút mở danh sách tab và kiểm tra tác vụ cũ.

**Cây giao diện cần xây dựng:**

```text
AC.APP                              ỨNG DỤNG
│
├── AC.HOME                         TRANG CHỦ
│   ├── AC.HOME.NEW                 Tạo dự án
│   ├── AC.HOME.PROJECTS            Danh sách dự án
│   └── AC.HOME.OPEN                Mở dự án
│
├── AC.CANVAS                       KHÔNG GIAN LÀM VIỆC
│   ├── AC.CANVAS.TOOLBAR           Thanh công cụ
│   ├── AC.CANVAS.ZOOM              Thu phóng
│   ├── AC.CANVAS.ADD.NODE          Thêm node
│   ├── AC.CANVAS.CONNECT           Kết nối node
│   └── AC.CANVAS.SAVE              Lưu Canvas
│
├── AC.IMAGE                        NODE TẠO ẢNH
│   ├── AC.IMAGE.NODE               Thẻ node
│   ├── AC.IMAGE.PREVIEW            Xem ảnh
│   ├── AC.IMAGE.PROMPT             Nhập prompt
│   ├── AC.IMAGE.UPLOAD             Tải ảnh
│   ├── AC.IMAGE.REFERENCE          Ảnh tham chiếu
│   ├── AC.IMAGE.MODEL              Chọn AI
│   │   ├── AC.IMAGE.MODEL.PROVIDER Nhà cung cấp
│   │   └── AC.IMAGE.MODEL.ITEM     Mô hình AI
│   ├── AC.IMAGE.SETTINGS           Cài đặt ảnh
│   │   ├── AC.IMAGE.SETTINGS.RATIO Tỷ lệ
│   │   ├── AC.IMAGE.SETTINGS.SIZE  Độ phân giải
│   │   ├── AC.IMAGE.SETTINGS.QUALITY
│   │   └── AC.IMAGE.SETTINGS.COUNT Số lượng
│   ├── AC.IMAGE.TOOLS              Nhóm công cụ ảnh
│   ├── AC.IMAGE.TAB.TRIGGER        Chọn tab AI
│   ├── AC.IMAGE.TASK.RECHECK       Kiểm tra kết quả cũ
│   └── AC.IMAGE.SEND               Tạo ảnh
│
├── AC.VIDEO                        NODE TẠO VIDEO
│   ├── AC.VIDEO.NODE
│   ├── AC.VIDEO.PREVIEW
│   ├── AC.VIDEO.PROMPT
│   ├── AC.VIDEO.REFERENCE
│   ├── AC.VIDEO.MODEL
│   ├── AC.VIDEO.SETTINGS
│   │   ├── AC.VIDEO.SETTINGS.RATIO
│   │   ├── AC.VIDEO.SETTINGS.RESOLUTION
│   │   └── AC.VIDEO.SETTINGS.DURATION
│   ├── AC.VIDEO.TOOLS
│   ├── AC.VIDEO.TAB.TRIGGER
│   └── AC.VIDEO.SEND
│
├── AC.AI                           KẾT NỐI AI
│   ├── AC.AI.PROVIDERS             Danh sách AI
│   ├── AC.AI.STATUS                Trạng thái kết nối
│   └── AC.AI.MODELS                Danh sách mô hình
│
├── AC.EXT                          CHROME EXTENSION
│   ├── AC.EXT.DOWNLOAD             Tải tiện ích
│   ├── AC.EXT.PAIR.CODE            Nhập mã kết nối
│   ├── AC.EXT.CONNECT              Kết nối
│   ├── AC.EXT.STATUS               Trạng thái
│   └── AC.EXT.TABS                 Danh sách tab
│
├── AC.TASK                         QUẢN LÝ TÁC VỤ
│   ├── AC.TASK.CREATE              Tạo Task ID
│   ├── AC.TASK.QUEUE               Hàng chờ
│   ├── AC.TASK.STATUS              Trạng thái
│   ├── AC.TASK.RESULT              Kết quả
│   ├── AC.TASK.RECHECK             Kiểm tra lại
│   └── AC.TASK.HISTORY             Lịch sử
│
└── AC.SETTINGS                     CÀI ĐẶT
    ├── AC.SETTINGS.GENERAL
    ├── AC.SETTINGS.EXTENSION
    ├── AC.SETTINGS.AI
    └── AC.SETTINGS.STORAGE
```

## 4. Yêu cầu bố cục

**Canvas**
- Cho phép kéo thả node, nối dây, di chuyển tự do.
- Lưu vị trí, kích thước và các kết nối.
- Thu phóng Canvas nhưng các thanh công cụ nổi vẫn có kích thước dễ thao tác.

**Node tạo ảnh và tạo video**
- Khung xem ảnh/video giữ đúng tỷ lệ.
- Thanh công cụ dưới prompt phải nằm trên một hàng.
- Nếu chiều ngang không đủ, nhóm tùy chọn cuộn ngang, không đẩy nút Gửi xuống hàng khác.
- Ô prompt chỉ xuất hiện khi chọn node tương ứng.
- Có menu thả đa cấp để chọn nhà cung cấp AI → mô hình AI.
- Bảng cài đặt phải nhỏ gọn, có menu con, không tràn ra khỏi màn hình.

**Mọi nút phải có bốn trạng thái:** chưa có dữ liệu, đang xử lý, thành công và lỗi hoặc không khả dụng.

## 5. Hướng dẫn kết nối AI đơn giản

Giai đoạn đầu chỉ kết nối **một nhà cung cấp AI** để hoàn thiện toàn bộ quy trình. Sau đó mới mở rộng sang các nhà cung cấp khác.

Ưu tiên API chính thức khi được hỗ trợ. Với AI chạy qua Chrome, chỉ dùng tiện ích và các thao tác được trang đó cho phép.

**Sơ đồ kết nối:**

```text
AC.IMAGE.SEND
       │
       ▼
AC.TASK.CREATE
Tạo Task ID duy nhất
       │
       ▼
AC.SERVER.TASK
Backend nhận yêu cầu
       │
       ▼
AC.EXT.CONNECT
Chrome Extension đã ghép nối
       │
       ▼
AC.EXT.TABS
Tab AI được chọn
       │
       ▼
AC.TASK.STATUS
Theo dõi đúng Task ID
       │
       ▼
AC.TASK.RESULT
Nhận kết quả đã xác minh
       │
       ▼
AC.CANVAS.SAVE
Lưu ảnh/video vào dự án
       │
       ▼
AC.IMAGE.PREVIEW
Hiển thị kết quả
```

**Cách kết nối Extension cho người dùng:**

1. Mở `AC.SETTINGS.EXTENSION`.
2. Bấm `AC.EXT.DOWNLOAD` để cài tiện ích Chrome.
3. ToonFlow tạo một mã ghép nối dùng riêng cho ứng dụng.
4. Người dùng dán mã vào `AC.EXT.PAIR.CODE`.
5. Bấm `AC.EXT.CONNECT`.
6. Khi `AC.EXT.STATUS` hiển thị **Đã kết nối**, các tab AI sẽ xuất hiện trong `AC.EXT.TABS`.
7. Chọn tab và thực hiện tác vụ.

Không yêu cầu người dùng nhập IP, cổng WebSocket hoặc Extension ID thủ công.

Giai đoạn đầu kết nối Extension và backend trên cùng máy qua localhost. Khi cần kết nối máy khác, bổ sung máy chủ trung gian bảo mật và mã ghép nối tương ứng.

## 6. Quy định Task ID và lấy lại kết quả cũ

Mỗi lần tạo ảnh hoặc video phải có một `taskId` duy nhất.

Dữ liệu tối thiểu:

```text
taskId       ID lần gửi
workspaceId  ID dự án
canvasId     ID Canvas
nodeId       ID node
providerId   ID nhà cung cấp AI
modelId      ID mô hình AI
tabId        ID tab trình duyệt
status       Trạng thái xử lý
resultPath   Đường dẫn kết quả
createdAt    Thời điểm tạo
```

Quy định:

- Mỗi Task ID chỉ được gửi một lần.
- Khi mất kết nối, không tự gửi lại prompt.
- `AC.TASK.RECHECK` chỉ kiểm tra lần gửi trước, không tạo tác vụ mới.
- Chỉ lấy ảnh/video khi kết quả khớp Task ID và đúng node/Canvas.
- Nếu đã có tệp kết quả được lưu và xác minh, cho phép khôi phục vào node.
- Nếu không tìm thấy hoặc không xác định được kết quả, hiển thị trạng thái rõ ràng.
- Không lấy ảnh cuối cùng trong tab AI rồi mặc định đó là kết quả của Task ID đang cần.
- Không dùng MapID của nút giao diện thay cho Task ID.

## 7. Cấu trúc thư mục dự án

```text
ai-canvas-studio/
│
├── apps/
│   ├── web/                  Giao diện Vue
│   ├── server/               Backend API
│   └── desktop/              Ứng dụng Mac
│
├── packages/
│   ├── canvas/               Canvas và dây nối
│   ├── nodes/
│   │   ├── image/            Node tạo ảnh
│   │   └── video/            Node tạo video
│   ├── ui/                   Thành phần dùng chung
│   ├── ai-adapters/          Kết nối từng AI
│   └── task-manager/         Task ID và trạng thái
│
├── chrome-extension/
│   ├── popup/                Màn hình mã kết nối
│   ├── background/           WebSocket và hàng chờ
│   └── content/              Tương tác trang AI
│
├── docs/
│   ├── ARCHITECTURE.md       Sơ đồ kiến trúc
│   ├── MAP_ID.md             Danh sách ID giao diện
│   ├── API_ID.md             Danh sách API
│   ├── TASK_FLOW.md          Quy trình Task ID
│   └── SETUP_VI.md           Hướng dẫn cài đặt
│
└── tests/                    Kiểm thử
```

## 8. Quy định quản lý ID bắt buộc

Mọi thành phần mới phải đăng ký vào `docs/MAP_ID.md`.

Mỗi dòng phải có:

| Trường | Nội dung |
|---|---|
| ID | Mã duy nhất, cố định |
| Tên | Tên tiếng Việt của thành phần |
| Chức năng | Bấm vào sẽ thực hiện điều gì |
| File | Đường dẫn mã nguồn |
| Selector | Vị trí phần tử giao diện |
| Trạng thái | Chưa làm / Đang làm / Hoàn thành |
| Kiểm thử | Cách xác nhận hoạt động |

Trên giao diện, các nút phải khai báo `data-map-id`, chẳng hạn:

`data-map-id="AC.IMAGE.SEND"`

**Phân biệt rõ:** MapID giao diện, API ID, Task ID, Node ID và Chrome Tab ID là những loại ID khác nhau.

Khi chỉnh sửa về sau, phải giữ nguyên MapID đã công bố. Nếu bắt buộc thay đổi, cần có bảng đối chiếu ID cũ → ID mới.

Xây dựng thêm chế độ **Chọn thành phần theo ID**: người dùng bấm vào một nút bất kỳ, ứng dụng cho sao chép MapID, tên, file nguồn và selector, nhưng không sao chép prompt, token hoặc dữ liệu riêng tư.

## 9. Thứ tự xây dựng

**Giai đoạn 1 — Ứng dụng cơ bản**
1. Tạo cấu trúc dự án và hướng dẫn chạy.
2. Tạo trang chủ và Canvas.
3. Tạo node ảnh, node video, prompt.
4. Thêm chọn AI đa cấp và bộ cài đặt gọn.
5. Thực hiện thử một tác vụ giả lập từ lúc gửi đến khi hiển thị kết quả.

**Giai đoạn 2 — Kết nối AI thật**
1. Tạo backend quản lý tác vụ.
2. Tạo Chrome Extension nhập một mã kết nối.
3. Quét các tab AI được hỗ trợ.
4. Gửi một tác vụ có Task ID.
5. Nhận, kiểm tra và lưu kết quả.
6. Hỗ trợ kiểm tra lại tác vụ cũ.

**Giai đoạn 3 — Hoàn thiện**
1. Lịch sử ảnh/video.
2. Thư viện tư liệu và nhân vật.
3. Công cụ Camera và phong cách.
4. Batch ảnh/video.
5. Đóng gói bản Desktop.

## 10. Quy định bàn giao cho AI lập trình

Sau mỗi giai đoạn, bắt buộc cung cấp:

- Các ID đã tạo và chức năng tương ứng.
- Những file đã thêm hoặc chỉnh sửa.
- Chức năng đã thực sự hoạt động.
- Những chức năng đang dùng dữ liệu giả lập.
- Kết quả kiểm thử và những phần chưa kiểm chứng.
- Cách mở ứng dụng để tôi tự kiểm tra.
- Các lỗi còn tồn tại.

Không được báo hoàn thành nếu chỉ viết xong mã mà chưa chạy kiểm thử.

**Hãy bắt đầu bằng việc lập sơ đồ kiến trúc, bảng MapID, và hướng dẫn cài đặt dự án từ con số 0. Sau khi hoàn thành từng giai đoạn, mới tiếp tục xây dựng chức năng tiếp theo. Giải thích mọi bước bằng tiếng Việt đơn giản.**