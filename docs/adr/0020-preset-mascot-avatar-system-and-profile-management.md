# ADR 0020: Hệ Thống Ảnh Đại Diện Linh Vật Cài Sẵn Và Quản Lý Hồ Sơ Tài Khoản

## Bối cảnh (Context)
Người dùng ứng dụng Pointify cần trang quản lý Hồ sơ tài khoản (Account Profile) cá nhân để xem thông tin tài khoản, cập nhật tên hiển thị, quản lý mật khẩu và lựa chọn ảnh đại diện. Trước đây, hệ thống chưa có trang `/profile` chuyên biệt, và ảnh đại diện chưa được hỗ trợ chọn lựa có hệ thống. Nếu cho phép người dùng tự do nhập URL ảnh từ internet hoặc upload ảnh nhị phân tùy ý, hệ thống sẽ đối mặt với các nguy cơ:
1. Rủi ro về nội dung phản cảm/độc hại không được kiểm duyệt (content safety).
2. Tình trạng "vỡ ảnh" do link ngoài bị xóa, hết hạn hoặc chặn CORS.
3. Làm vỡ tính đồng bộ và thẩm mỹ nhận diện thương hiệu độc đáo của Pointify.
4. Tốn chi phí lưu trữ/băng thông và độ phức tạp bảo trì hạ tầng file storage.

## Quyết định (Decision)

1. **Bộ Sưu Tập Preset Mascot Avatar Độc Quyền (Closed-Set Preset System)**:
   - Hồ sơ tài khoản chỉ được phép chọn ảnh đại diện từ bộ sưu tập Linh vật cài sẵn (Preset Mascot Avatars) của Pointify.
   - Mở rộng thư viện từ 18 linh vật lên **26 linh vật 3D** với 4 danh mục: Thú cưng (Pets), Rừng nhiệt đới & Hoang dã (Wild & Safari), Biển cả (Ocean), Thần thoại & Kỳ thú (Mythical & Fantasy).
   - Tuyệt đối không lưu URL ảnh bên ngoài vào trường `photoURL`. `photoURL` lưu đường dẫn chuẩn nội bộ `/assets/mascots/<mascot-id>-animated.png` hoặc định danh mascot.

2. **Đồng Bộ Linh Vật Cá Nhân Vào Bàn Ước Lượng (Personalized Mascot Projection)**:
   - Trong Room Canvas, khi thành viên ước lượng là người dùng đã xác thực và đã chọn Preset Mascot trong Profile, bàn chơi sẽ ưu tiên dùng chính linh vật này thay vì thuật toán hash ID ngẫu nhiên.
   - Thành viên khách (Guest) hoặc người dùng chưa chọn avatar riêng sẽ tiếp tục sử dụng thuật toán hash ID ngẫu nhiên đảm bảo tính đa dạng và không trùng lặp vô cớ.

3. **Kiến Trúc Trang Hồ Sơ Tài Khoản (`/profile`) Với Bố Cục 2 Tab**:
   - Sử dụng TanStack Router với route `/profile`, kế thừa `PublicHeader` và `PublicFooter`.
   - Bảo vệ bởi Auth Guard: Khách vãng lai chuyển hướng về `/auth?redirect=/profile`, Thành viên khách (Guest) nhận được thông báo phiên tạm thời kèm nút nâng cấp tài khoản chính thức.
   - Bố cục 2 Tab:
     - **Tab 1 - Hồ sơ & Avatar (Profile & Avatar)**: Cập nhật Tên hiển thị (`displayName`) bằng `@tanstack/react-form` + `zod`, hiển thị Avatar lớn hiện tại kèm nút mở Grid Modal chọn Avatar theo 4 danh mục.
     - **Tab 2 - Bảo mật & Đăng nhập (Security & Login)**:
       - Đối với tài khoản mật khẩu: Form đổi mật khẩu tại chỗ (Mật khẩu hiện tại ➔ Mật khẩu mới ➔ Xác nhận) với cơ chế re-authentication của Firebase Auth, kèm liên kết hỗ trợ gửi email khôi phục mật khẩu nếu quên.
       - Đối với tài khoản Google OAuth: Hiển thị badge phương thức bảo mật đã liên kết với Google.

4. **Đồng Bộ Dữ Liệu Hai Chiều (State Sync)**:
   - Cập nhật backend qua `PATCH /api/users/me` để đồng bộ Firestore.
   - Đồng bộ client đồng thời qua Firebase Auth `updateProfile(auth.currentUser)` và Zustand store `useAuthStore`.

## Hệ quả (Consequences)
- **Tích cực**:
  - Bảo đảm an toàn tuyệt đối về nội dung hình ảnh hiển thị trên toàn bộ các bàn chơi công cộng và riêng tư.
  - Nhận diện thương hiệu Pointify nổi bật, thú vị, nhất quán và gắn kết giữa tính năng cá nhân và phòng cộng tác Scrum Poker.
  - Tiết kiệm 100% chi phí lưu trữ ảnh và tối ưu thời gian tải (cache tĩnh CDN/local).
- **Cần lưu ý**:
  - Cần bảo đảm bộ tài nguyên hình ảnh 8 linh vật mới có chất lượng đồ họa và phong cách 3D tương đồng với 18 linh vật ban đầu.
