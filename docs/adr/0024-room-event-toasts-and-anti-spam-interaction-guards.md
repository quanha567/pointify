# 0024. Chuẩn hóa Thông báo Sự kiện Phòng và Cơ chế Khóa Thao tác Chống Spam (Room Presence Toasts & Anti-Spam Interaction Guards)

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày:** 2026-09-04
- **Người quyết định:** Tech Lead, Frontend Team, Core Systems Guild

## Ngữ cảnh & Vấn đề

Trong quá trình sử dụng thực tế tính năng Phòng ước lượng (Room), hệ thống gặp hai vấn đề nghiêm trọng về trải nghiệm người dùng (UX) và hiệu năng tải mạng WebSocket:
1. **Ô nhiễm thông báo Toast (Notification Fatigue)**:
   - Mỗi lần nhấp chọn hoặc hủy chọn lá bài ước lượng đều kích hoạt một Toast (`Đã chọn lá bài X`, `Đã hủy chọn lá bài`). Trong phiên họp nhanh, các thành viên liên tục đổi lá bài khiến màn hình bị che khuất bởi hàng loạt toast xếp chồng.
   - Ngược lại, khi có Thành viên (Participant) mới gia nhập hoặc rời phòng/mất kết nối, hệ thống lại chỉ âm thầm cập nhật node trên bàn mà không có thông báo hiện diện (presence notification) cho đồng đội.
2. **Nguy cơ Spam click gây nghẽn Server và Race Conditions**:
   - Các nút hành động của Người điều phối (*Lật bài ngay*, *Vòng tiếp theo*, *Bỏ phiếu lại*, *Nhận quyền điều phối*) và nút *Đổi vai trò* không có trạng thái loading in-flight. Người dùng có thể click liên tục nhiều lần trong khi gói tin WebSocket đang trên đường truyền tới server, gây ra hiện tượng xung đột state và quá tải xử lý.
   - Thao tác nhấp chọn lá bài trên Thanh Dock chưa có cơ chế throttle chống double-click.

## Quyết định Kiến trúc

1. **Tinh giản Toast & Phản hồi Thị giác Thay thế**:
   - Lược bỏ hoàn toàn toast chọn và hủy lá bài ước lượng. Thay vào đó, dựa 100% vào phản hồi thị giác trực quan tức thì: thẻ bài tự động nhấc bổng 3D, viền sáng màu Primary, chấm tròn Active trên thanh dock và Linh vật/Badge trạng thái trên Bàn ước lượng cập nhật ngay lập tức (Optimistic UI).
   - Duy trì toast hệ thống cần thiết: Sao chép mã/liên kết phòng (thao tác clipboard hệ điều hành) và toast cảnh báo lỗi (mất mạng, quyền hạn).

2. **Thông báo Hiện diện với Bộ đệm Trễ (Presence Notifications with 3s Debounce)**:
   - Khi có Thành viên khác tham gia phòng: Hiển thị toast thông báo ngắn gọn (`{name} đã tham gia phòng`).
   - Bỏ qua lần khởi tạo đầu tiên (initial hydration) để tránh bùng nổ thông báo hàng loạt khi người dùng mới vào phòng đã có sẵn người.
   - Áp dụng bộ đệm trễ 3 giây (`leaveDebounceTimersRef`) cho sự kiện ngắt kết nối (`isOnline: false` hoặc biến mất khỏi danh sách):
     - Nếu thành viên F5 / tải lại trang và kết nối lại trong vòng 3 giây, bộ đệm sẽ tự động hủy timer và không phát thông báo rời phòng.
     - Nếu thành viên thực sự mất kết nối hoặc thoát ra quá 3 giây, toast `{name} đã rời phòng` mới được kích hoạt.

3. **Cơ chế Khóa Thao tác In-Flight & Anti-Spam Guard**:
   - Đối với các nút Điều phối (*Lật bài*, *Vòng tiếp theo*, *Bỏ phiếu lại*, *Nhận quyền điều phối*) và nút *Đổi vai trò*:
     - Thiết lập cờ trạng thái `isActionLoading` / `isSwitchingRole`.
     - Vô hiệu hóa nút (`disabled`) và hiển thị icon xoay `Loader2` ngay khi click.
     - Tự động mở khóa khi nhận được sự kiện `room:state` cập nhật từ server.
     - Thiết lập timer fallback timeout 4.000ms nhằm tự động giải phóng giao diện nếu xảy ra sự cố rớt gói tin socket.
   - Đối với thao tác chọn bài ước lượng: Bổ sung bộ lọc cooldown 400ms (`lastEstimateTimeRef`) ngăn chặn nhấp liên tục gây ngập lụt kênh socket `room:estimate`.

## Hệ quả & Đánh giá

### Tích cực:
- Giao diện phòng ước lượng trở nên tinh gọn, sạch sẽ, không còn bị xao nhãng bởi các toast thừa thãi.
- Cả phòng nắm bắt được biến động thành viên vào/ra một cách chính xác mà không bị spam toast giả khi reload trang.
- Triệt tiêu hoàn toàn lỗi double-click/spam click vào các hành động chuyển vòng và lật bài của Facilitator.
- Tuân thủ nghiêm ngặt chuẩn i18n đa ngôn ngữ và nguyên tắc phân tầng State của dự án.
