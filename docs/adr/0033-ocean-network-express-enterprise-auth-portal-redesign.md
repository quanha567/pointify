# ADR 0033: Ocean Network Express (ONE) Enterprise Auth Portal Redesign

## Status
Accepted (refining and superseding public authentication layout decisions in ADR 0005)

## Context
Trang xác thực (`/auth`) trước đây của Pointify được thiết kế theo dạng thẻ nổi thông thường lồng bên trong `PublicHeader` và `PublicFooter` với hai cột: một cột trình bày tính năng chung (Cloud Sync, Mascots, v.v.) và một cột form đăng nhập có tùy chọn Thành viên khách (Guest Participant).

Nhằm đồng bộ trải nghiệm thị giác và thương hiệu xuyên suốt với hệ sinh thái **Ocean Network Express (ONE)** và **ONE Tech Stop (OTS)** (tiếp nối ADR 0032 cho ONE Admin Portal), đội ngũ quyết định tái thiết kế giao diện Xác thực (`ONE Enterprise Auth Portal`) dựa trên bản thiết kế nhận diện thương hiệu chính thức của ONE.

## Decision

Chúng tôi quyết định chuẩn hóa giao diện Xác thực thành **Cổng Xác thực Doanh nghiệp ONE (ONE Enterprise Auth Portal)** với các quyết định kiến trúc sau:

### 1. Bố cục Toàn màn hình Độc lập (Fullscreen Immersive Shell)
- Trang `/auth` được cấu hình độc lập với `PublicHeader` và `PublicFooter` (cùng cơ chế như `/admin` và `/rooms/$roomId` trong `src/routes/__root.tsx`), mang lại trải nghiệm thương hiệu liền mạch, không bị phân mảnh bởi 2 tầng header.
- Nền toàn màn hình sử dụng hình ảnh chiến hạm container viễn dương biểu tượng của Ocean Network Express (`src/assets/hero/one-container-ship.webp`) rẽ sóng đại dương dưới ánh hoàng hôn hồng magenta đặc trưng.
- Lớp phủ gradient thông minh bảo đảm độ tương phản cao cho typography thương hiệu và thẻ Form trên cả Light và Dark mode.

### 2. Thanh Thương hiệu Cấp cao (Corporate Brand Bar)
- Góc trên bên trái hiển thị Logo chính thức của **ONE** (`Ocean Network Express`).
- Góc trên bên phải hiển thị câu khẩu hiệu bất hủ: **"As ONE, We Can"** kèm thanh gạch chỉ báo sắc hồng ONE Magenta.
- Tích hợp cụm tiện ích tinh tế: Bộ chuyển đổi Ngôn ngữ (`LanguageToggle` VI / EN) và Chuyển giao diện sáng/tối (`ThemeToggle`) dưới dạng nút kính mờ (frosted ghost buttons) hài hòa tuyệt đối với nền trời hoàng hôn.

### 3. Khẩu hiệu Tinh gọn và Thẻ Xác thực Chuẩn Doanh nghiệp
- Cột bên trái hiển thị Typography sắc nét:
  - Tiêu đề cấp 1: **"Scrum Poker"**
  - Khẩu hiệu hành động: **"Estimate. Align. Deliver."**
- Cột bên phải hiển thị Thẻ Xác thực tinh khiết (`rounded-2xl`, viền mờ cao cấp, đổ bóng nổi bật `shadow-2xl`):
  - Tiêu đề đón chào: *"Welcome back!"* / *"Chào mừng trở lại!"*
  - Phụ đề: *"Sign in to continue to Scrum Poker"* / *"Đăng nhập để tiếp tục vào Scrum Poker"*
  - Trường nhập liệu: *Email address* (placeholder gợi ý nội bộ `you@one-line.com`), *Password* (kèm nút ẩn/hiện mật khẩu).
  - Checkbox *"Remember me"* kết hợp liên kết *"Forgot password?"* sắc hồng ONE Magenta.
  - Nút tác vụ chính CTA *"Sign in"* phủ màu thương hiệu ONE Magenta sống động (`bg-primary` / `#cf0072`).
  - Đường phân cách *"Or continue with"* kết hợp nút *"Continue with Google"*.

### 4. Cơ chế Chuyển đổi Đăng nhập / Đăng ký Mượt mà (Smooth Morphing)
- Giữ vững khả năng Đăng ký tài khoản tự do nhưng mặc định mở ra ở trạng thái Đăng nhập 100% giống bản thiết kế mẫu.
- Chân thẻ hiển thị liên kết chuyển đổi: *"Don't have an account? Sign up"* / *"Chưa có tài khoản? Đăng ký ngay"*.
- Khi chuyển sang chế độ Đăng ký, thẻ chuyển động mượt mà (`motion/react`) mở rộng thêm trường *Họ và tên (Display Name)* và đổi nút CTA thành *"Sign up"*, chân thẻ chuyển thành *"Already have an account? Sign in"*.

### 5. Ghi nhớ Phiên Đăng nhập & Bảo mật Thiết bị Dùng chung (Session Persistence)
- Tích hợp trực tiếp checkbox `Remember me` với Firebase Auth Persistence API:
  - Khi được tick chọn: Lưu email vào `localStorage` và áp dụng `browserLocalPersistence` (duy trì trạng thái đăng nhập lâu dài).
  - Khi bỏ tick: Xóa email đã nhớ khỏi `localStorage` và áp dụng `browserSessionPersistence` (phiên đăng nhập sẽ bị hủy ngay khi đóng tab/trình duyệt, bảo đảm an toàn dữ liệu trên máy tính dùng chung tại văn phòng).

### 6. Tối ưu Công thái học Di động (Mobile Ergonomics)
- Trên màn hình nhỏ (< 1024px), hình ảnh chiến hạm chuyển thành background chìm với lớp phủ tối dịu, cụm typography *"Scrum Poker"* tinh chỉnh tỷ lệ đặt phía trên thẻ form căn giữa, đảm bảo thao tác nhập liệu không bị che khuất và không gây giật lag (CLS).

### 7. Loại bỏ Lối vào Thành viên Khách tại Trang Xác thực
- Loại bỏ hoàn toàn nút và dialog Thành viên khách (`GuestDialog`) tại `/auth` để giữ đúng bản chất trang xác thực doanh nghiệp chuẩn hóa. Thành viên khách chỉ được khởi tạo khi trực tiếp tham gia phòng ước lượng qua liên kết chia sẻ nội bộ.

## Consequences
- **Ưu điểm**:
  - Giao diện đạt độ hoàn thiện cao cấp, đồng bộ 100% với ngôn ngữ thiết kế của Ocean Network Express.
  - Phân tách rõ ràng giữa xác thực tài khoản chính thống và tính năng vãng lai của phòng.
  - Bảo mật doanh nghiệp được nâng cao nhờ chiến lược Session Persistence linh hoạt.
- **Lưu ý**:
  - Đảm bảo token màu Tailwind v4 trong `src/style.css` phản ánh trung thực sắc hồng ONE Magenta (`#cf0072` hoặc `--primary`) trên cả Light và Dark mode.
