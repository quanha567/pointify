# ADR 0032: Ocean Network Express (ONE) Admin Portal & OTS Visual System

## Status
Accepted (refining and superseding layout decisions in ADR 0009, 0010, 0022)

## Context
Pointify được định vị và triển khai là nền tảng Scrum Poker & Ước lượng độ phức tạp User Story nội bộ cho các kỹ sư và Agile Squads trực thuộc **Ocean Network Express (ONE)** cùng công ty thành viên phụ trách chuyển đổi số **ONE Tech Stop (OTS)** (trụ sở Singapore cùng các trung tâm phát triển tại Đà Nẵng và TP.HCM).

Trước đây, giao diện quản trị (`Admin Shell` và `Admin Overview Dashboard`) sử dụng bảng màu trung tính mặc định của Shadcn UI (Slate/Zinc) với cấu trúc cơ bản, chưa thể hiện được bản sắc tập đoàn hàng hải hàng đầu thế giới cũng như văn hóa kỹ thuật số của ONE Tech Stop. Sau khi nghiên cứu kiến trúc công thái học từ dashboard hiện đại và các quy chuẩn thương hiệu toàn cầu của ONE, đội ngũ thống nhất tái cấu trúc toàn diện phân hệ Quản trị.

## Decision

Chúng tôi quyết định chuẩn hóa giao diện Quản trị thành **Cổng Quản trị Doanh nghiệp Ocean Network Express (ONE Admin Portal)** với các trụ cột sau:

### 1. Bảng màu Hàng hải Sang trọng (Executive Maritime Palette)
- **Deep Ocean Navy** (`#002B49` / `#0B192C`): Sử dụng làm màu chủ đạo cho khung `AppSidebar` và `AdminHeader`, tạo vẻ ngoài vững chãi, bảo mật và uy nghiêm của một trung tâm điều hành hàng hải.
- **ONE Magenta** (Pantone Process Magenta C, Hex `#E4007C` / `#E6007E`): Màu sắc thương hiệu độc quyền của ONE (lấy cảm hứng từ hoa Anh đào Nhật Bản) được áp dụng nhất quán cho các điểm nhấn quan trọng: Active Navigation Pill, thanh chỉ báo trạng thái, đường Sparkline mini trên thẻ KPI, thanh tiến độ và các nút tác vụ chính (CTA).
- **Maritime Steel & Crisp Cards**: Nền khu vực nội dung chính mang tông xám thép tàu biển sáng dịu (`#F8FAFC`), các thẻ Card màu trắng tinh khiết viền mỏng tinh xảo với độ đổ bóng nhẹ. Hỗ trợ Dark Mode với tông nền vực thẳm **Abyssal Navy** (`#07111E`).

### 2. Tích hợp Nhận diện Thương hiệu ONE Tech Stop (OTS Branding)
- Đầu Sidebar hiển thị logo chính thức **ONE TECH STOP** (`one-tech-stop-logo-white.png`) kết hợp tên ứng dụng Pointify.
- Chân Sidebar tích hợp **OTS Agile Navigator Mascot Widget**: hiển thị hình ảnh 3D Linh vật Hải âu Thuyền trưởng ONE Tech Stop, câu châm ngôn Agile hàng hải (*"Smooth seas never made a skilled sailor"* / *"AS ONE, WE ESTIMATE"*), cùng thanh tiến độ **Sprint Estimation Readiness** (ví dụ: `78% Stories Estimated`) đo lường độ sẵn sàng cho đợt Sprint toàn công ty.

### 3. Hero Greeting Banner & Đồ họa Tàu Container Viễn dương
- Đầu trang Dashboard trang bị Hero Greeting Banner:
  - Lời chào cá nhân hóa theo thời gian thực: `"Good morning/afternoon/evening, [Tên Admin]! 🚢"`
  - Phụ đề nghiệp vụ: `"ONE Tech Stop Agile Overview • Digitalizing Global Ocean Trade"`
  - Huy hiệu góc hiển thị chu kỳ Sprint và ngày làm việc hiện tại.
  - Tích hợp đồ họa vector chiến hạm container biểu tượng của Ocean Network Express chở các khối container màu ONE Magenta lướt trên sóng đại dương, cùng khẩu hiệu nổi bật: **"AS ONE, WE CAN."**

### 4. Ánh xạ Chỉ số Nghiệp vụ Agile & Đồ thị Container (Domain Metrics)
- **4 Thẻ Chỉ số KPI (Metric Cards)**:
  1. *Active Squad Members*: Tổng số kỹ sư / tài khoản ONE Tech Stop tham gia hệ thống (kèm % tăng trưởng).
  2. *Live Poker Rooms*: Số phòng Scrum Poker đang hoạt động trực tiếp (kèm mini sparkline).
  3. *Estimated Sprint Stories*: Số User Story đã chốt điểm ước lượng thành công (kèm mini sparkline).
  4. *Consensus Alignment Rate*: Tỷ lệ đồng thuận đạt được ngay trong vòng đầu tiên của các squad (mục tiêu $\ge 80\%$, kèm mini sparkline).
- **Biểu đồ Tròn (Donut Chart)**: *Story Point / Container Size Distribution* biểu diễn phân bổ độ phức tạp user story theo kích cỡ thùng container (TEU 1-3 pts, FEU 5-8 pts, Heavy Cargo 13-21 pts).
- **Biểu đồ Cột / Diện tích**: *Sprint Estimation Velocity* đo lường khối lượng story và phòng được tổ chức qua các tháng của các squads ONE Tech Stop.
- **Khối Sprint Trọng tâm**: *Jira Target Sprints* hiển thị các Sprint Jira sắp bắt đầu hoặc sắp đóng cổng ước lượng từ các dự án (Vessel Tracking, Port Booking, Cargo IoT).

### 5. Tinh chỉnh Layout Dưới cùng (Loại bỏ Lưới Quick Actions rời rạc)
- Thay vì lưới Quick Actions 2x2 làm phân mảnh không gian, mở rộng toàn bộ khu vực dưới thành **Nhật ký Hoạt động & Hải trình Squad (Recent Agile Sessions & Activity Stream)** với đầy đủ bộ lọc sự kiện, thanh tìm kiếm nhanh và huy hiệu trạng thái rõ ràng, giúp Quản trị viên dễ dàng theo dõi toàn diện hoạt động của các Squads.

## Consequences
- **Ưu điểm**:
  - Tạo dựng bản sắc doanh nghiệp độc đáo, gắn kết chặt chẽ với tập đoàn Ocean Network Express và văn hóa ONE Tech Stop.
  - Trải nghiệm thị giác đẳng cấp thế giới (Executive Maritime & ONE Magenta), bố cục mạch lạc, chuẩn công thái học.
  - Kế thừa toàn bộ nền tảng dữ liệu đã xây dựng của `AnalyticsModule` (ADR 0022), không làm xáo trộn kiến trúc backend.
- **Lưu ý**:
  - Cần bảo đảm độ tương phản màu sắc đạt chuẩn WCAG AA giữa màu ONE Magenta và các nền Deep Ocean Navy / White.
