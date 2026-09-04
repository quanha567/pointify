# 0025. Hộp thoại Mời Thành viên, Mã QR Độ Tương Phản Cao và Thẻ Mời Kỹ Thuật Số (Room Participant Invite Dialog & Digital Invite Card)

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày:** 2026-09-04
- **Người quyết định:** Tech Lead, Frontend Team, Core Systems Guild

## Ngữ cảnh & Vấn đề

Trước đây trong Phòng ước lượng (Room), nút "Mời" (`t('room.invite')`) trên thanh tiêu đề nổi (`RoomFloatingHeader`) chỉ thực hiện một tác vụ đơn lẻ là sao chép URL hiện tại vào clipboard (`window.location.href`). Cách tiếp cận này bộc lộ nhiều hạn chế:
1. **Trải nghiệm kém trên thiết bị di động / máy tính bảng**: Thành viên trong các buổi họp trực tiếp (in-person / hybrid) không thể quét nhanh mã QR từ màn hình của đồng nghiệp hoặc màn hình trình chiếu trong phòng họp để vào phòng ngay lập tức.
2. **Thiếu ngữ cảnh khi chia sẻ qua các kênh chat (Slack / Microsoft Teams / Zalo)**: Chỉ gửi một đường link trần không có thông tin định danh phòng, mã phòng hoặc lời kêu gọi hành động (Call to Action) rõ ràng, khiến đồng nghiệp khó phân biệt phòng họp Scrum nào.
3. **Vấn đề tương phản khi quét mã QR trên Dark Mode**: Nếu hiển thị mã QR đảo màu theo Dark theme (nền đen mã trắng) hoặc viền mờ tối, các camera điện thoại thông thường sẽ gặp khó khăn khi nhận diện hoặc quét chậm, gây ức chế trong các buổi họp Agile cần tốc độ.

## Quyết định Kiến trúc

1. **Chuẩn hóa Thuật ngữ & Bounded Context (`CONTEXT.md`)**:
   - Định danh chính thức: **Hộp thoại mời thành viên** (*Invite Participant Dialog*) và **Mã QR phòng** (*Room QR Code*).
   - Quyền truy cập: Mọi **Thành viên** (*Participant* - gồm Facilitator, Estimator, Spectator) đều có quyền mở hộp thoại để mời đồng đội.

2. **Thư viện Sinh Mã QR Phía Client (`qrcode.react`)**:
   - Tích hợp thư viện gọn nhẹ `qrcode.react` (khoảng 15KB) để sinh mã QR vector (SVG) hoặc Canvas trực tiếp trên trình duyệt, không phụ thuộc vào bất kỳ API của bên thứ 3 nào.
   - Nhúng logo biểu trưng của Pointify ở trung tâm mã QR với độ an toàn sửa lỗi mức cao (`level="H"`) để đảm bảo quét mượt mà dù có logo.

3. **Thẻ QR Độ Tương Phản Cao (High-Contrast QR Card Container)**:
   - Mã QR luôn được đặt bên trong một thẻ Card nền trắng thuần khiết (`bg-white text-black p-4 rounded-2xl shadow-sm border border-border/40`), bất kể ứng dụng đang ở chế độ Sáng hay Tối (Dark / Light Mode). Điều này cam kết 100% camera điện thoại và ứng dụng quét QR nhận diện tức thì trong mili-giây.

4. **Thiết kế Tinh gọn Một Màn hình (Streamlined Single-View Modal) & Sao chép Tin nhắn Tích hợp**:
   - Loại bỏ cơ chế phân tab rườm rà và lược bỏ chức năng download ảnh không cần thiết để giữ dung lượng nhẹ và thao tác siêu tốc.
   - Hiển thị trực tiếp:
     - **Mã QR phòng**: Đặt trên thẻ trắng tương phản cao có mã phòng nổi bật bên dưới để quét camera trực tiếp.
     - **Liên kết phòng & Nút Sao chép**: Khi người dùng nhấn nút "Sao chép link", hệ thống tự động copy toàn bộ nội dung tin nhắn mời hoàn chỉnh kèm tên phòng, mã phòng và link (định dạng tối ưu cho Slack / Teams) vào clipboard.
     - Toast thông báo tức thì: `Đã sao chép tin nhắn mời và liên kết phòng!`.

5. **Đóng gói Component theo Chuẩn React 19 Native**:
   - Xây dựng component `src/features/room/components/dialogs/invite-participant-dialog.tsx` độc lập, đóng gói logic sao chép, tạo ảnh canvas và quản lý trạng thái hiển thị.

## Hệ quả & Đánh giá

### Tích cực:
- Trải nghiệm onboard vào phòng họp Scrum Poker nhanh chóng và linh hoạt vượt trội cho cả hình thức họp online và trực tiếp.
- Ảnh thẻ mời và tin nhắn mời định dạng sẵn giúp thông tin gửi lên Slack/Teams chuyên nghiệp, đồng bộ thương hiệu Pointify.
- Đảm bảo tính khả dụng tuyệt đối khi quét mã QR trên mọi điều kiện ánh sáng và chế độ giao diện.
- Tuân thủ 100% i18n đa ngôn ngữ cho toàn bộ các nhãn, thông báo sao chép và nội dung template mời.
