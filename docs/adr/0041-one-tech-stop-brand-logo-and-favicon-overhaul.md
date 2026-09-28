# 0041: ONE Tech Stop (OTS) Brand Logo & Favicon Overhaul

## Status
Accepted (superseding ADR 0004 and extending ADR 0032, ADR 0034, ADR 0035)

## Context
Trước đây, Pointify sử dụng biểu tượng nhận diện ban đầu là monogram chữ **'P'** đa sắc Cyan-Indigo gradient kết hợp hình tượng lá bài poker (được định nghĩa tại ADR 0004). 

Khi nền tảng được chuẩn hóa và triển khai chính thức phục vụ các kỹ sư và Agile Squads trực thuộc **ONE Tech Stop (OTS)** và **Ocean Network Express (ONE)** (theo định hướng tại ADR 0032, 0034 và 0035), sự hiện diện của logo cũ tạo ra sự không đồng nhất về mặt thương hiệu giữa Cổng Quản trị (Admin Shell) và Giao diện Public (Header, Footer, Browser Tab). 

Do đó, toàn bộ logo ứng dụng và biểu tượng tab trình duyệt (Favicon) được tái thiết kế và cập nhật trực tiếp sang nhận diện chính thức của **ONE Tech Stop (OTS)**.

---

## Decision

Chúng tôi quyết định chuẩn hóa hệ thống Logo và Favicon cho Pointify như sau:

### 1. Logo Ứng Dụng (`<Logo />` Component)
- Thay thế hoàn toàn monogram chữ 'P' cũ bằng logo chính thức của **ONE Tech Stop** (`ots-logo.png`).
- **Tỉ lệ & Bố cục**: Sử dụng phiên bản ngang (aspect ratio ~2.61:1) tối ưu tuyệt đối cho chiều cao thanh điều hướng `PublicHeader` (`h-16`) và chân trang `PublicFooter`.
- **Màu sắc Nhận diện**: Giữ nguyên màu thương hiệu gốc của OTS (ONE Cherry Blossom Magenta `#E31C79`) trên cả chế độ Sáng (Light Mode) và Tối (Dark Mode), đồng bộ với tiêu chuẩn thiết kế công nghiệp.
- **Micro-interactions**: Tích hợp transition mượt mà (`duration-200`, `hover:scale-105 active:scale-95`) tuân thủ nghiêm ngặt chuẩn motion tại ADR 0035 (thời gian chuyển động $\le 200\text{ms}$).

### 2. Biểu tượng Tab Trình duyệt (Favicon)
- Tích hợp biểu trưng huy hiệu tròn chính thức của OTS từ `assets/favicon.ico` làm `public/favicon.ico` phục vụ các trình duyệt và bookmarks.
- Đồng thời cập nhật file vector `pointify-web/public/favicon.svg` nhúng biểu trưng tròn OTS sắc nét cao độ trong khung `viewBox="0 0 100 100"` kèm hiệu ứng bóng mờ nhẹ (`ots-emblem-shadow`).
- Đảm bảo hiển thị sắc nét ở mọi độ phân giải (từ 16×16, 32×32 đến các màn hình Retina cao cấp và chế độ pinned tab).

### 3. Tiêu đề Trang & Meta Tags (`index.html`)
- Chuẩn hóa thẻ `<title>` thành:
  ```html
  <title>ONE Tech Stop | Scrum Poker</title>
  ```
- Cập nhật thẻ `theme-color` sang màu nhận diện chuẩn của ONE:
  ```html
  <meta name="theme-color" content="#E31C79" />
  ```

### 4. Logo Cổng Quản Trị (`AppSidebarHeader`)
- Cập nhật đầu thanh điều hướng bên [AppSidebar](file:///d:/projects/pointify/pointify-web/src/components/admin/app-sidebar.tsx) chuyển từ logo ONE trắng cũ sang biểu trưng huy hiệu tròn OTS (`ots-emblem.png` trích xuất từ `favicon.ico`).
- **Trạng thái thu gọn (Collapsed)**: Hiển thị icon huy hiệu tròn OTS kích thước 32px (`size-8`) căn giữa cân đối trong dải icon rail.
- **Trạng thái mở rộng (Expanded)**: Kết hợp huy hiệu tròn OTS (`size-8.5`) đi cùng tiêu đề thương hiệu `"ONE TECH STOP"` và câu châm ngôn `"AS ONE, WE CAN"`.

---

## Consequences

### Ưu điểm
- Đồng bộ 100% nhận diện thương hiệu tập đoàn ONE và ONE Tech Stop trên toàn bộ các trang giao diện.
- Trải nghiệm thị giác nhất quán, chuyên nghiệp và loại bỏ hoàn toàn các asset thiết kế tạm thời.
- Giữ nguyên cấu trúc component `<Logo />` giúp các layout hiện tại (`PublicHeader`, `PublicFooter`) hoạt động mượt mà không bị lỗi giao diện (zero regression).

### Quy định
- Mọi màn hình mới cần hiển thị logo ứng dụng bắt buộc sử dụng component `<Logo />` hoặc tài nguyên chính thức tại `assets/ots-logo.png`.
