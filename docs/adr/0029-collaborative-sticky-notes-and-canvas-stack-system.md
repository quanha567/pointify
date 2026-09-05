# ADR 0029: Collaborative Sticky Notes & Canvas Stack System

## Status
Accepted

## Context
Trong các phiên họp Scrum Poker trực tuyến (`Room`), các thành viên thường có nhu cầu trao đổi nhanh, liệt kê tiêu chí chấp nhận (Acceptance Criteria), ghi chú các giả định kỹ thuật (Assumptions), hoặc chỉ ra các trở ngại (Blockers) liên quan đến User Story đang được ước lượng.
Trước đây, ứng dụng Pointify tập trung thuần túy vào việc chọn lá bài và lật điểm, thiếu một không gian ghi chú linh hoạt dạng bảng trắng (Whiteboard). Người dùng mong muốn có tính năng **Thẻ ghi chú dán (Sticky Note)** tương tự Miro trực tiếp trên canvas của phòng:
1. **Bảo toàn bố cục trọng tâm (Viewport Integrity)**: Khung hình của Pointify cần giữ cố định (`Fixed Viewport`), không cho phép pan/zoom tự do làm trôi bàn Poker trung tâm và các vị trí ngồi của thành viên, nhưng các thẻ ghi chú dán phải được tự do kéo thả (`Draggable`) linh hoạt xung quanh bàn.
2. **Cộng tác mở & Trải nghiệm thời gian thực sống động (Collaborative Open & Realtime Motion)**: Mọi thành viên trong phòng đều có thể đóng góp ý kiến, tạo note, kéo note và chỉnh sửa. Khi một người di chuyển note, các thành viên khác cần nhìn thấy note lướt chuyển động mượt mà theo thời gian thực (chuẩn cảm giác Miro / FigJam) thay vì chỉ nhảy cóc tọa độ khi thả chuột.
3. **Tránh xung đột ghi đè đồng thời (Concurrent Conflict Mitigation)**: Khi nhiều thành viên cùng tương tác, cần cơ chế hiển thị trạng thái đang soạn thảo (`Typing Presence`) và khóa mềm (`Soft Lock`) để không xảy ra tình trạng ghi đè văn bản của nhau.
4. **Vòng đời kép: Ghim cố định vs Lưu trữ theo vòng (Pinned Persistence vs Round Archiving)**: Có những ghi chú mang tính toàn cục cho cả buổi họp (ví dụ: Definition of Done, lưu ý môi trường) cần được ghim (`Pinned`) để tồn tại xuyên suốt các vòng; trong khi các ghi chú thảo luận riêng cho từng Story cần được dọn sạch khỏi Live Canvas khi sang vòng mới và tự động lưu trữ (`Archived`) vào lịch sử của vòng đó kèm tọa độ không gian chính xác.

## Decision
Chúng tôi quyết định thiết kế và hiện thực hóa tính năng **Thẻ ghi chú dán & Xấp thẻ ghi chú (Collaborative Sticky Notes & Canvas Stack)** theo các nguyên tắc kiến trúc sau:

1. **Mô hình Dữ liệu DDD trong `pointify-backend` (Clean Architecture Entity)**:
   - Mô hình hóa `StickyNote` là một Entity con trực thuộc `RoomAggregate`:
     - `id`: Định danh duy nhất (UUID).
     - `roomId`: Khóa ngoại liên kết phòng.
     - `text`: Nội dung văn bản ghi chú.
     - `color`: Mã màu thuộc bảng 5 màu pastel (`yellow`, `blue`, `green`, `pink`, `orange`).
     - `position`: Tọa độ không gian `{ x: number, y: number }` trên `@xyflow/react` canvas.
     - `authorId` & `authorName`: Thông tin thành viên khởi tạo note.
     - `isPinned`: Cờ xác định ghi chú có được ghim qua các vòng hay không (`boolean`).
     - `editingBy`: Thông tin thành viên đang focus soạn thảo (dùng cho soft-lock realtime).
     - `createdAt` & `updatedAt`: Dấu thời gian.
   - Khi kết thúc vòng ước lượng và bắt đầu vòng mới (`round:reset` / `round:start-new`), `RoomAggregate` sẽ:
     - Đóng gói toàn bộ các thẻ ghi chú không ghim (`isPinned: false`) vào mảng `archivedStickyNotes` của thực thể `Round` vừa kết thúc, bảo toàn nguyên vẹn tọa độ `(x, y)` và nội dung.
     - Giữ lại các thẻ ghi chú đã ghim (`isPinned: true`) trên Live Canvas của `Room`.

2. **Giao diện Xấp Thẻ Ghi Chú Nổi (Sticky Note Stack Dock)**:
   - Đặt tại góc dưới bên trái màn hình (`bottom-left`), tạo hình một xấp giấy dán nhiều lớp chuẩn phong cách Miro.
   - Tích hợp thanh palette 5 màu pastel cho phép người dùng chọn màu trực tiếp từ xấp rồi kéo thả (`drag-and-drop`) lên canvas, hoặc click nhanh để sinh note mới tại vị trí trống cạnh bàn.
   - Thẻ ghi chú trên canvas trang bị thanh công cụ mini cho phép đổi màu linh hoạt, nút ghim/bỏ ghim (`Pin / Unpin`), nút xóa nhanh tức thì (`Instant Delete`), và hiển thị tên tác giả ở chân thẻ.
   - Font chữ trong thẻ tự động co giãn (`Responsive dynamic font sizing`) theo độ dài văn bản để tối ưu khả năng đọc.

3. **Đồng bộ Thời gian thực & Chuyển động Kéo thả (Realtime Drag Motion & Typing Lock)**:
   - Kéo thả mượt mà: Khi người dùng kéo thả note, sự kiện `room:sticky-note-moving` được phát qua WebSocket Socket.io (throttled ~60ms) để mọi người cùng phòng thấy note chuyển động lướt mượt mà trên canvas.
   - Tránh xung đột: Khi một người click focus vào ô soạn thảo, client phát `room:sticky-note-editing-start`. Thẻ ghi chú trên màn hình của những người khác hiển thị viền sáng kèm nhãn `"[Tên] đang gõ..."` và tạm thời vô hiệu hóa ô nhập cho đến khi người đó blur (`room:sticky-note-editing-end`).
   - Xóa tức thời: Thao tác xóa được thực hiện ngay lập tức không cần popup xác nhận, giữ nhịp độ tương tác nhanh và tự nhiên.

4. **Tái hiện Không gian Lịch sử Vòng (Spatial Round History Snapshot)**:
   - Khi xem lại chi tiết lịch sử một vòng đã kết thúc, hệ thống cho phép xem lại toàn bộ các thẻ ghi chú đã thảo luận trong vòng đó tại đúng vị trí tọa độ `(x, y)` ban đầu.

5. **Bảo toàn Bố cục Trọng tâm Khung nhìn & Giới hạn Không gian Thẻ ghi chú (Strict Viewport Centering & Spatial Note Clamping)**:
   - Nhằm đảm bảo Bàn ước lượng (`Table Arena Node`) luôn luôn nằm cố định ở trung tâm hoàn hảo `(0, 0)` của màn hình, mọi tính toán `fitView` của `@xyflow/react` (lúc mount ban đầu lẫn khi số lượng thành viên thay đổi) chỉ tính toán bounding box bao gồm duy nhất cụm Bàn ước lượng và Ghế thành viên (`table-arena-node`, `participant-*`, `spectator-*`).
   - Loại trừ 100% các `StickyNoteNode` khỏi mảng `nodes` của `fitViewOptions`. Điều này ngăn chặn triệt để hiện tượng camera bị trôi lệch, giật hoặc co nhỏ chiếc bàn khi có các thẻ ghi chú dán được tạo hoặc kéo thả bất đối xứng xung quanh.
   - **Giới hạn không gian an toàn (Boundary Clamping)**: Toàn bộ quá trình tạo mới từ xấp note (`handleDrop`), kéo rê trực tiếp trên canvas (`handleNodesChange`), và phát chuyển động realtime (`handleNodeDrag`) đều được giới hạn tự động (`clampToViewport`) trong phạm vi an toàn của khung nhìn (cách lề ngang 16px, cách thanh Header ở trên 76px, và cách thanh Dock chọn bài ở dưới 130px), triệt để ngăn chặn thẻ ghi chú bị kéo thả thất lạc ra ngoài tầm mắt của thành viên.
   - **Vô hiệu hóa tính năng tự động trượt khung hình (`autoPanOnNodeDrag: false`, `autoPanOnConnect: false`)**: Mặc định `@xyflow/react` tự động cuộn khung nhìn khi con trỏ kéo sát góc/mép màn hình. Cần tắt hoàn toàn tính năng này để người dùng có kéo thẻ ghi chú sát góc tới đâu thì camera vẫn đứng im tuyệt đối, không bị trượt sang khu vực khác.
   - **Cô lập chu kỳ `fitView` bằng Participant Fingerprint**: Tránh trigger `fitView` liên tục khi có các cập nhật socket thời gian thực của thẻ ghi chú (gây xung đột animation d3-zoom và vỡ ma trận hiển thị màn hình trắng). `fitView` chỉ được phép kích hoạt duy nhất khi tải trang hoặc khi danh sách thành viên thực sự có biến động (`participantFingerprint`).
   - **Triệt tiêu Render Thrashing & Bảo toàn Tham chiếu Node**: Chỉ cập nhật cache toàn cục TanStack Query khi kết thúc thao tác kéo (`isFinal: true`), thay vì cập nhật trên từng pixel chuột di chuyển; đồng thời bảo toàn tham chiếu đối tượng (`reference equality`) cho `table-arena-node` và `participant-*` trong quá trình đồng bộ, tránh làm gián đoạn chu kỳ render của `Framer Motion` / `Lottie` (nguyên nhân khiến linh vật, thẻ bài và các chi tiết bàn bị biến mất khi kéo nhanh).

## Consequences
- **Ưu điểm**:
  - Trực quan hóa trọn vẹn buổi thảo luận Scrum Poker, kết hợp hoàn hảo giữa tính nghiêm túc của ước lượng điểm và sự sáng tạo của bảng trắng Miro.
  - Phân tách rõ ràng giữa ghi chú bền vững toàn phòng (`Pinned`) và ghi chú ngữ cảnh của từng User Story (`Archived`).
  - Trải nghiệm cộng tác thời gian thực cực kỳ sống động và chống xung đột ghi đè hiệu quả.
  - Duy trì sự gọn gàng và ổn định của khung hình Poker Arena trung tâm.
- **Thách thức**:
  - Cần tối ưu xử lý tọa độ chuyển đổi từ màn hình sang canvas (`screenToFlowPosition`) khi kéo từ Xấp note ở ngoài ReactFlow vào trong canvas.
  - Cần throttle tần suất phát socket khi di chuyển note để không gây nghẽn đường truyền mạng.
