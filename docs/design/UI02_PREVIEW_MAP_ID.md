# UI-02 Design Preview — Danh sách MapID và chức năng

Các MapID dưới đây chỉ áp dụng cho bản Vue preview trong apps/web/src/designPreview. MapID AC-01/AC-02/UI-01/UI-02 production giữ nguyên. Với phần tử lặp (node/project), MapID biểu thị hành vi còn data-preview-node hoặc data-preview-project-id phân biệt instance. Native HTML5 video player có controls do browser render và không tự tạo MapID giả cho các nút trong shadow DOM.

**Lưu trữ:** tất cả là demo in-memory; cột Persistence “No” nghĩa là không lưu SQLite và không gọi API. **Trạng thái CODE:** source đã đăng ký hành vi; chỉ nâng PASS khi browser QA thực tế có bằng chứng.

| MapID | Tên (tiếng Việt) | Component | Vị trí | Icon | Click/hành vi | Hover / Disabled | Input | Output | Persistence | Ảnh kiểm | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|---|---|
| AC.UI02.PREVIEW.HOME | Logo / Trang mẫu | designPreview.vue | Header | ◈ | Về thư viện demo | Tên/click trạng thái | — | screen=library | No | 01 | CODE |
| AC.UI02.PREVIEW.MODE.A | Phương án A | designPreview.vue | Header | A | Chuyển layout A | pressed/focus | — | variant=A | No | 09 | CODE |
| AC.UI02.PREVIEW.MODE.B | Phương án B | designPreview.vue | Header | B | Chuyển layout B | pressed/focus | — | variant=B | No | 09 | CODE |
| AC.UI02.PREVIEW.PROJECTS | Thư viện dự án | designPreview.vue | Header/Dock | projects | Mở/đóng thư viện | hover/pressed | — | screen=library/canvas | No | 01 | CODE |
| AC.UI02.PREVIEW.SCENARIO | Số node minh họa | designPreview.vue | Review bar | select | 3/7/empty | selection | 3,7,empty | nodes/edges demo | No | 03,09,10 | CODE |
| AC.UI02.PREVIEW.MEDIA | Trạng thái media | designPreview.vue | Review bar | select | DEMO/compact | selection | demo/compact | media preview | No | 05–08 | CODE |
| AC.UI02.PREVIEW.STATUS | Mô phỏng trạng thái | designPreview.vue | Review bar | select | normal/offline/503/409 | selection | selected mode | status panel | No | 19,20 | CODE |
| AC.UI02.PREVIEW.STATUS.DISMISS | Đóng mô phỏng | designPreview.vue | Canvas | text | Đặt normal | hover/focus | status | Ẩn panel | No | 19,20 | CODE |
| AC.UI02.PREVIEW.LIBRARY.MODE | Chế độ thư viện | designPreview.vue | Review bar | select | Hiện/trống | selection | projects/empty | ProjectGrid | No | 01,02 | CODE |
| AC.UI02.PREVIEW.PROJECT.SEARCH | Tìm dự án mẫu | designPreview.vue | Library | search | Lọc project | focus | query | FilteredProjects | No | 01 | CODE |
| AC.UI02.PREVIEW.PROJECT.NEW | Tạo dự án mẫu | designPreview.vue | Library | plus | Mở dialog create | hover/focus | — | Dialog | No | 01,02 | CODE |
| AC.UI02.PREVIEW.PROJECT.OPEN | Mở card dự án | designPreview.vue | Library Card | cover | Mở Canvas mẫu | hover/focus | project.id | Canvas demo | No | 01,09 | CODE |
| AC.UI02.PREVIEW.PROJECT.MENU | Menu project | designPreview.vue | Project Card | ··· | Mở rename/delete | expanded/hover | project.id | Project menu | No | 01 | CODE |
| AC.UI02.PREVIEW.PROJECT.RENAME | Đổi tên mẫu | designPreview.vue | Project menu | text | Mở dialog rename | hover/focus | project.id | Dialog | No | 01 | CODE |
| AC.UI02.PREVIEW.PROJECT.DELETE | Xóa mềm mẫu | designPreview.vue | Project menu | text | Mở xác nhận | hover/focus | project.id | Dialog | No | 01 | CODE |
| AC.UI02.PREVIEW.PROJECT.TRASH | Đã xóa | designPreview.vue | Library | caret | Mở thùng rác mẫu | expanded | — | DeletedProjects | No | 02 | CODE |
| AC.UI02.PREVIEW.PROJECT.RESTORE | Khôi phục mẫu | designPreview.vue | Library | text | Đặt deleted=false | hover/focus | project.id | ProjectGrid | No | 02 | CODE |
| AC.UI02.PREVIEW.PROJECT.DIALOG.CONFIRM | Lưu tên demo | designPreview.vue | Dialog | text | Create/rename bộ nhớ | disabled khi rỗng | projectDraft | ProjectList | No | 01 | CODE |
| AC.UI02.PREVIEW.PROJECT.DIALOG.CANCEL | Hủy dự án | designPreview.vue | Dialog | text | Đóng dialog | hover/focus | — | Không cập nhật | No | 01 | CODE |
| AC.UI02.PREVIEW.ADD | Thêm node | designPreview.vue | Dock/Toolbar/Empty | plus | Mở Palette | expanded/hover | — | Palette | No | 03,14 | CODE |
| AC.UI02.PREVIEW.PALETTE.CLOSE | Đóng Palette | designPreview.vue | Palette | × | Ẩn Palette | hover/focus | — | Palette đóng | No | 14 | CODE |
| AC.UI02.PREVIEW.ADD.TEXT | Thêm Text | designPreview.vue | Palette | ✎ | Thêm Text preview | hover/focus | kind=text | nodes[] | No | 14 | CODE |
| AC.UI02.PREVIEW.ADD.IMAGE | Thêm Image | designPreview.vue | Palette | ▧ | Thêm Image preview | hover/focus | kind=image | nodes[] | No | 14 | CODE |
| AC.UI02.PREVIEW.ADD.VIDEO | Thêm Video | designPreview.vue | Palette | ▣ | Thêm Video preview | hover/focus | kind=video | nodes[] | No | 14 | CODE |
| AC.UI02.PREVIEW.FIT | Vừa Canvas | designPreview.vue | Canvas Toolbar | fit | fitView VueFlow | hover/focus | nodes bounds | viewport | No | 09,10 | CODE |
| AC.UI02.PREVIEW.FIT.DOCK | Vừa Canvas trong dock | designPreview.vue | Dock A | fit | fitView VueFlow | hover/focus | nodes bounds | viewport | No | 09 | CODE |
| AC.UI02.PREVIEW.ZOOM.IN | Phóng to | designPreview.vue | Canvas Toolbar | plus | zoomIn VueFlow | hover/focus | viewport | zoom | No | 09 | CODE |
| AC.UI02.PREVIEW.ZOOM.OUT | Thu nhỏ | designPreview.vue | Canvas Toolbar | minus | zoomOut VueFlow | hover/focus | viewport | zoom | No | 09 | CODE |
| AC.UI02.PREVIEW.SCENE.SELECT | Chọn scene | designPreview.vue | Scene Rail/Filmstrip B | card | Focus node + Inspector | current/hover | node.id | selection | No | 10,11 | CODE |
| AC.UI02.PREVIEW.NODE.TEXT.INPUT | Nhập ghi chú | designPreviewNode.vue | Text node | textarea | Chỉnh prompt demo | focus | input text | data.prompt | No | 04 | CODE |
| AC.UI02.PREVIEW.NODE.MEDIA.INPUT | Nhập prompt media | designPreviewNode.vue | Image/Video | textarea | Chỉnh prompt demo | focus | input text | data.prompt | No | 17 | CODE |
| AC.UI02.PREVIEW.NODE.PROMPT.EDIT | Mở prompt | designPreviewNode.vue | Media node | text | Focus expanded editor | hover/focus | node id | expanded=true | No | 05–08 | CODE |
| AC.UI02.PREVIEW.NODE.PROMPT.EXPAND | Mở/thu prompt | designPreviewNode.vue | Media node | caret | Toggle expanded | expanded | node id | textarea | No | 17 | CODE |
| AC.UI02.PREVIEW.NODE.EDIT | Chỉnh prompt | designPreviewNode.vue | Context Toolbar | ✎ | Mở editor và focus | hover/focus | node id | textarea | No | 12 | CODE |
| AC.UI02.PREVIEW.NODE.INSPECT | Inspector | designPreviewNode.vue | Context Toolbar | ☷ | Mở bảng chi tiết | hover/focus | node id | Inspector | No | 15 | CODE |
| AC.UI02.PREVIEW.NODE.MENU.TOGGLE | Tùy chọn node | designPreviewNode.vue | Node/Header | ··· | Mở/đóng menu | expanded/focus | node id | Menu | No | 13 | CODE |
| AC.UI02.PREVIEW.NODE.MENU.EDIT | Sửa prompt menu | designPreviewNode.vue | Node Menu | text | Focus prompt | hover/focus | node id | textarea | No | 13 | CODE |
| AC.UI02.PREVIEW.NODE.MENU.INSPECT | Inspector menu | designPreviewNode.vue | Node Menu | text | Mở inspector | hover/focus | node id | Inspector | No | 13 | CODE |
| AC.UI02.PREVIEW.NODE.MENU.DELETE | Xóa node menu | designPreviewNode.vue | Node Menu | text | Mở dialog confirm | hover/focus | node id | Dialog | No | 13 | CODE |
| AC.UI02.PREVIEW.INSPECTOR.PROMPT | Prompt Inspector | designPreview.vue | Inspector | textarea | Chỉnh prompt cùng node | focus | text | node.data.prompt | No | 15,17 | CODE |
| AC.UI02.PREVIEW.INSPECTOR.CLOSE | Đóng Inspector | designPreview.vue | Inspector header | × | Ẩn inspector | hover/focus | — | Không thay node | No | 16 | CODE |
| AC.UI02.PREVIEW.INSPECTOR.FOOTER.CLOSE | Đóng Inspector phụ | designPreview.vue | Inspector footer | text | Ẩn inspector | hover/focus | — | Không thay node | No | 16 | CODE |
| AC.UI02.PREVIEW.DELETE.CANCEL | Hủy xóa demo | designPreview.vue | Dialog | text | Không xóa | hover/focus | — | Dialog đóng | No | 13 | CODE |
| AC.UI02.PREVIEW.DELETE.CONFIRM | Xác nhận xóa demo | designPreview.vue | Dialog | text | Xóa node/project bộ nhớ | hover/focus | id | nodes/project list | No | 13 | CODE |

**Các trạng thái chỉ mang tính xem trước:** health offline, 503 và 409 được mô phỏng với nhãn MÔ PHỎNG; không làm lỗi backend thật. Bản preview không đăng ký taskId, projectId hay endpoint sản xuất. Không được tự coi bảng CODE là bằng chứng PASS của mọi MapID.

Bảng ảnh dự kiến: docs/evidence/ui02/review-A và docs/evidence/ui02/review-B; script scripts/ui02-design-preview-qa.js.
