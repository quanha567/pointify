# ADR 0038: Story Backlog Drawer & beUI Shared Layout Motion System

## Status
Accepted (superseding canvas-based placement of User Story sticky notes in ADR 0031 & ADR 0037)

## Context
Trong các phiên bản trước (ADR 0031 và ADR 0037), các User Stories nhập từ Jira Sprint được đưa lên mặt bảng trắng vô cực (`@xyflow/react`) dưới dạng các `UserStoryStickyNote` bố trí thành các cột dọc bên trái bàn poker. Mặc dù thẻ đã được chuẩn hóa nhận diện ONE Container Frame $180 \times 180\,\text{px}$, mô hình đặt trực tiếp toàn bộ danh sách ticket lên canvas bộc lộ các nhược điểm trong vận hành thực tế:
1. **Làm chật chội không gian phòng**: Khi sprint có từ 15 - 30+ tickets, hàng chục thẻ nốt dán chiếm phần lớn diện tích canvas, che khuất tầm nhìn của các thành viên (`ParticipantNode`) và gây phân tâm khỏi Bàn ước lượng (`TableArenaNode`).
2. **Khó theo dõi tổng quan Sprint**: Người dùng phải pan/zoom canvas liên tục để đọc từng ticket trong danh sách.
3. **Trải nghiệm thiếu đồng nhất khi chọn Story**: Việc bấm nút trên từng thẻ dán trên canvas không mang lại cảm giác của một danh sách công việc (backlog queue) liền mạch.

Sau phiên phỏng vấn thiết kế 3 vòng (**Grilling & Domain Modeling**), đội ngũ đã thống nhất di chuyển toàn bộ User Stories của Sprint vào **Story Backlog Drawer (Ngăn kéo Hàng đợi Story)** bên trái màn hình.

---

## Decision

### 1. Giải phóng Không gian Canvas & Tinh giản Bảng trắng
- **Canvas chỉ dành cho Bàn Arena & Thành viên**: Loại bỏ toàn bộ các node User Story Jira rải rác trên canvas. Canvas trở nên thoáng đãng, sạch sẽ, chỉ tập trung vào `TableArenaNode` và các `ParticipantNode`.
- **Hiển thị Story Đang ước lượng trực tiếp trên Bàn Poker**: Thông tin User Story đang active (`currentRound.linkedJiraIssue`) được thể hiện trang trọng ở phần đầu của Bàn Arena (Mã Jira, Tiêu đề, Loại issue và link mở Jira).
- **Bảo toàn Ghi chú Brainstorming tự do**: Xấp giấy note Miro (`StickyNoteStack`) ở góc dưới trái vẫn được duy trì độc lập cho các ghi chú thảo luận tự do của thành viên khi có nhu cầu.

### 2. Story Backlog Drawer Nổi (Floating Non-modal HUD Drawer)
- **Hình thái hiển thị**: Khung trượt nổi từ cạnh trái màn hình (độ rộng ~380px) nằm trên lớp HUD (z-index cao hơn canvas), **không sử dụng backdrop che mờ** để người tham gia vừa xem backlog vừa quan sát được diễn biến bàn poker và hành vi chọn bài của đồng đội.
- **Left Floating Trigger Tab**: Một nút tab tinh tế ghim cố định ở mép trái màn hình (`top-20 left-0`), hiển thị icon Backlog, tên Sprint rút gọn và huy hiệu số lượng ticket (`📋 1/12 Story`), hỗ trợ click hoặc phím tắt `B` để toggle đóng/mở nhanh.

### 3. Hiệu ứng Lướt Mượt mà với beUI `SharedLayoutBg`
- Danh sách User Stories trong Drawer áp dụng component `SharedLayoutBg` từ thư viện **beUI** (`@beui/shared-layout-bg` via `motion/react`).
- Khi rê chuột (hover) qua các story, một pill nền mờ bo góc (`rounded-xl bg-primary/[0.07]`) sẽ lướt mượt mà giữa các mục theo hiệu ứng shared layout với vật lý lò xo (`SPRING_LAYOUT`), mang lại trải nghiệm tương tác cao cấp, đẳng cấp doanh nghiệp.

### 4. Nhận diện Active User Story & Khởi tạo Mặc định Story #1
- **Tự động Active Story Đầu tiên**: Khi phòng được khởi tạo cùng một Jira Sprint mục tiêu, Backend nguyên tử (`CreateRoomUseCase`) sẽ tự động gán Story đầu tiên của danh sách vào `currentRound.linkedJiraIssue` và `currentRound.topic`. Khi mọi người bước vào phòng, Story #1 đã sẵn sàng để ước lượng ngay lập tức mà không cần thêm thao tác phụ.
- **Trạng thái Active trong Drawer**: Story đang được ước lượng mang đường viền trên 3px ONE Magenta (`#E31C79`), nền tint nhẹ thương hiệu và huy hiệu *"Đang ước lượng"* (`Estimating`).
- **Story đã hoàn thành**: Tự động hiển thị huy hiệu Story Points đồng thuận (ví dụ `5 pts font-mono` màu xanh lá) kèm biểu tượng `CheckCircle2`.

### 5. Phân quyền Thao tác
- **Mọi thành viên (Estimator & Spectator)**: Đều có thể mở Drawer để đọc mô tả, xem danh sách backlog và theo dõi tiến độ sprint.
- **Chỉ Người điều phối (Facilitator)**: Mới có các nút hành động *"Ước lượng"* hoặc *"Ước lượng lại"* để phát tín hiệu socket đổi `currentRound` sang User Story được chọn.

---

## Consequences
### Tích cực
- **Không gian Bàn Poker thoáng đãng**: Trả lại toàn bộ canvas cho trải nghiệm ước lượng và linh vật 3D suy nghĩ.
- **Trải nghiệm duyệt Backlog đỉnh cao**: Thanh trượt bên trái với `SharedLayoutBg` đem lại cảm giác mượt mà, chuyên nghiệp chuẩn SaaS B2B hiện đại.
- **Tối ưu hóa thao tác (Zero Friction)**: Story đầu tiên tự động sẵn sàng ngay khi tạo phòng, Facilitator chỉ việc bấm bắt đầu vote.

### Cần lưu ý
- Cần đảm bảo phím tắt `B` không bị kích hoạt ngoài ý muốn khi người dùng đang nhập liệu trong các ô `input` hay `textarea`.
