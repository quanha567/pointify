# ADR 0034: Ocean Network Express (ONE) Digital Brand Identity & Design System Specification

## Status
Accepted (refining and superseding ADR 0021, and extending ADR 0032 & ADR 0033)

## Context
Ocean Network Express (ONE) được thành lập vào ngày 7 tháng 7 năm 2017 và chính thức vận hành toàn cầu từ ngày 1 tháng 4 năm 2018 qua thương vụ sáp nhập mảng container quốc tế của ba tập đoàn vận tải biển hàng đầu Nhật Bản: NYK (38%), MOL (31%) và "K" Line (31%). Với tuyên ngôn thương hiệu đột phá: *"Standing out in a sea of sameness"* và khẩu hiệu hành động *"AS ONE, WE CAN"* cùng định vị *"ONE DELIVERS YOUR EVERYDAY"*, ONE đã tạo nên cuộc cách mạng thị giác trong ngành hàng hải quốc tế vốn bảo thủ.

Pointify là nền tảng quản trị Scrum Poker và ước lượng User Story phục vụ trực tiếp các kỹ sư và Agile Squads tại Ocean Network Express và ONE Tech Stop (OTS). Nhằm đồng bộ hóa 100% bản sắc nhận diện thương hiệu công nghiệp vào môi trường tương tác kỹ thuật số, kiến trúc thiết kế của Pointify cần được chuẩn hóa toàn diện từ cấp độ Design Tokens, Typography, Bảng màu số, đến các yếu tố đồ họa đặc thù mang đậm di sản văn hóa Nhật Bản và công nghệ hàng hải.

---

## Decision

Chúng tôi quyết định chuẩn hóa hệ thống thiết kế Pointify Web theo Bộ Nhận Diện Thương Hiệu Toàn Cầu của Ocean Network Express với các trụ cột sau:

### 1. Hệ Thống Màu Sắc Chuẩn Hóa & Bảng Màu Kỹ Thuật Số

#### 1.1. Màu Thương Hiệu Cốt Lõi: ONE Cherry Blossom Magenta
- **Tên thương hiệu**: ONE Cherry Blossom Magenta (lấy cảm hứng từ hoa anh đào Sakura Nhật Bản, đại diện cho sự tái sinh, tiên phong và cội nguồn văn hóa sáng lập).
- **Quy chuẩn bắt buộc**: Luôn gọi và hiển thị là **Magenta**, tuyệt đối không dùng sắc hồng "Pink" thông thường.
- **Thông số kỹ thuật chuẩn hóa**:
  - **Pantone**: Pantone 213 C (in ấn cao cấp, profile đối tác).
  - **HEX**: `#E31C79` (Biến thể số: `#E81E75`).
  - **RGB**: `rgb(227, 28, 121)`.
  - **CMYK**: C: 0%, M: 88%, Y: 47%, K: 11%.
  - **RAL**: RAL 4010 (Telemagenta - sơn công nghiệp tàu và vỏ container).
  - **Trạng thái tương tác**:
    - Hover: `#C01263` (sắc độ trầm hơn khi hover / bấm giữ).
    - Brand Tint: `#FDF2F7` (lớp phủ nền 5% nhận diện cho các dòng active, thẻ tag, trạng thái chọn).

#### 1.2. Bảng Màu Bổ Trợ Số & Bố Cục 60 - 30 - 10
Nhằm chống mỏi mắt do năng lượng thị giác mạnh của màu Magenta và bảo đảm chuẩn tiếp cận WCAG 2.1 AA, giao diện số áp dụng nghiêm ngặt quy tắc cân bằng thị giác:
- **60% Diện tích nền trung tính (Surface & Canvas)**:
  - `Pure White` (`#FFFFFF`): Nền màn hình chính, nền thẻ thông tin container.
  - `Crisp Gray` (`#F8FAFC`): Nền khu vực lọc dữ liệu, dải phân cách bảng biểu, nền phụ.
- **30% Cấu trúc nội dung (Content Structure & Text)**:
  - `Deep Slate` (`#111827`): Tiêu đề trang, mã số User Story, text chính cấp cao.
  - `Neutral Slate` (`#64748B`): Nhãn trường thông tin (Field labels), text phụ, timestamp.
  - `Subtle Border` (`#E2E8F0`): Đường kẻ ô nhập liệu, đường phân cách bảng biểu.
  - `Deep Ocean Navy` (`#002B49`): Thanh Sidebar Cổng Quản trị (Admin Shell) tạo vẻ uy nghiêm của trung tâm chỉ huy hàng hải.
- **10% Điểm nhấn hành động tối cao (Primary Accent - ONE Magenta `#E31C79`)**:
  - Nút hành động chính (Primary CTA).
  - Trạng thái tab/menu đang active.
  - Điểm xung nhịp tiến trình (Tracking Stepper, countdown timer).

#### 1.3. Màu Trạng Thái Phản Hồi (Feedback Colors)
- **Ocean Emerald** (`#10B981`): Thông quan thành công, hoàn tất vòng ước lượng, chốt story point.
- **Amber Warning** (`#F59E0B`): Cảnh báo lệch điểm ước lượng, chờ xác nhận kết quả, cảnh báo trễ deadline.
- **Crimson Alert** (`#EF4444`): Trạng thái lỗi hệ thống, hủy phòng, vi phạm quy tắc ước lượng.
- **Deep Maritime** (`#0284C7`): Hành động hàng hải, bản đồ định vị tuyến tàu, radar kết nối realtime.

---

### 2. Hệ Thống Typography Kỹ Thuật Số (Digital Typography)

Hệ thống kiểu chữ chuyển đổi hoàn toàn sang hai bộ phông hình học hiện đại:
- **Phông giao diện cơ sở (UI Base)**: **`Inter Variable`** (`@fontsource-variable/inter`). Khẩu độ ký tự mở, tỷ lệ hình học dứt khoát, tối ưu cho giao diện đa ngôn ngữ (tiếng Anh & tiếng Việt hoàn chỉnh).
- **Phông dữ liệu kỹ thuật (Logistics & Data)**: **`JetBrains Mono Variable`** (`@fontsource-variable/jetbrains-mono`). Phông đơn cách (monospace) độ rộng ký tự cố định cho mã User Story (JIRA-1234), Story Points, chuỗi UUID, mã container (ONEU1234567).

#### Thang phân cấp & Ngoại lệ kích cỡ tối thiểu:
| Cấp bậc | Cỡ chữ tương đối | Trọng lượng nét | Line-Height | Ứng dụng chức năng |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1 (H1)** | 28px - 32px | Bold (700) | 1.2 | Tiêu đề màn hình chính (Scrum Poker Arena, Admin Overview) |
| **Heading 2 (H2)** | 20px - 24px | SemiBold (600) | 1.3 | Tiêu đề nhóm thông tin, modal lớn |
| **Heading 3 (H3)** | 16px - 18px | Medium (500) | 1.4 | Tiêu đề thẻ phụ trợ, widget bento |
| **Body Regular** | 14px - 15px | Regular (400) | 1.5 | Nội dung mô tả User Story, văn bản hướng dẫn |
| **Logistics / Story Data**| 13px - 14px | SemiBold / Mono | 1.4 | Story points, mã Jira Issue, chuỗi hash |
| **Micro Caption / Badges** | 11px - 12px | Medium (500) | 1.3 | **Ngoại lệ cấp phép: `text-[11px]`** cho Status Badges, nhãn trạng thái và timestamp |

*Lưu ý bảo vệ công thái học: Nhãn trường nhập liệu (`<FieldLabel>`) và Nút bấm chính tuyệt đối không dùng font dưới 14px (`text-sm`).*

---

### 3. Yếu Tố Đồ Họa Đặc Thù (Graphic Signatures)

1. **The Container Frame (Khung Container)**:
   - Thẻ nội dung (UI Cards) ứng dụng hình thái tỷ lệ cạnh cân đối với góc bo chuẩn (`rounded-xl` / 12px), đường viền `1px` màu `#E2E8F0`.
   - Cạnh trên của thẻ tích hợp **dải màu ONE Magenta 3px** (`border-t-[3px] border-t-[#E31C79]`).
   - Hiệu ứng đổ bóng tinh tế 2px khi rê chuột (`hover:shadow-md transition-shadow`).

2. **Họa Tiết Sóng Nước Seigaiha (Seigaiha Wave Pattern)**:
   - Tích hợp hoa văn truyền thống Nhật Bản các lớp sóng nước đồng tâm biểu trưng cho sự bền bỉ và thuận buồm xuôi gió trước đại dương.
   - Ứng dụng dưới dạng SVG Data URI với độ mờ cực thấp (**opacity 3% - 5%**) làm hình nền chìm cho App Header, Loading Screen, và các thẻ Hero Dashboard.

3. **Tương Tác Nút Bấm Chuẩn Hóa**:
   - **Primary Button**: Nền `#E31C79`, chữ trắng `font-medium`, hover chuyển sang `#C01263`, trạng thái bấm giữ co nhẹ 98% (`active:scale-[0.98]`).
   - **Secondary Button**: Nền trong suốt, viền đôi hoặc viền 1.5px màu `#E31C79`, chữ Magenta, hover phủ lớp tint `#FDF2F7`.

4. **Quy Cách Logo & Vùng An Toàn**:
   - Primary Magenta Logotype trên nền trắng/sáng; Primary White Logotype trên nền tối hoặc khối Magenta.
   - Vùng cách ly an toàn tối thiểu bằng 1/2 chiều cao ký tự "O". Chiều ngang tối thiểu 100px trên desktop và 72px trên mobile.

---

## Consequences

- **Tích cực**:
  - Pointify khoác lên mình diện mạo đồng bộ, đẳng cấp quốc tế của Ocean Network Express và ONE Tech Stop.
  - Hệ thống Design Tokens trong `src/style.css` được chuẩn hóa toán học theo tiêu chuẩn Tailwind v4, dễ dàng mở rộng và bảo trì.
  - Nâng tầm tính chuyên nghiệp của nền tảng với phông Inter & JetBrains Mono, hiệu ứng Container Card và hoa văn Seigaiha.
- **Rà soát kiểm thử**:
  - Đảm bảo các đoạn text 11px chỉ giới hạn ở nhãn phụ và badge, không gây ảnh hưởng đến khả năng đọc của người dùng.
