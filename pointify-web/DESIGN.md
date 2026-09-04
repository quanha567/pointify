# Pointify Web Design System & Typography Guidelines

Tài liệu cẩm nang quy chuẩn thiết kế, phân cấp kiểu chữ (Typography System), khoảng cách (Spacing), các thành phần giao diện (UI Components), và các nguyên tắc công thái học từ **Mobile đến Desktop** cho dự án `pointify-web`.

---

## 1. Triết Lý Thiết Kế Cốt Lõi (Core Principles)

1. **Rõ ràng & Dễ đọc (Legibility First)**:
   - Hỗ trợ hiển thị tiếng Việt xuất sắc: không bị cắt/dính dấu thanh điệu (hỏi, ngã, nặng, sắc, mũ).
   - Đảm bảo độ tương phản màu sắc và kích thước chữ đạt chuẩn **WCAG 2.1 AA** trở lên.
2. **Đáp ứng Đa thiết bị (Responsive & Adaptive Ergonomics)**:
   - Từ màn hình điện thoại di động ($< 640\text{px}$) đến màn hình máy tính lớn ($> 1280\text{px}$), font chữ và vùng chạm (touch target $\ge 40\text{px}$) phải luôn cân đối, thoải mái khi tương tác.
3. **Hiện đại, Cao cấp & Tinh gọn (Premium Bento / Glassmorphism)**:
   - Sử dụng thẻ bo góc mềm mại (`rounded-xl`, `rounded-2xl`), đường viền mờ tinh tế (`border-border`), bóng đổ dịu nhẹ (`shadow-sm`, `shadow-md`), và màu sắc ngữ nghĩa (`hsl(var(--...))` / `oklch`).
4. **Không tùy tiện hardcode (Token-Driven)**:
   - 100% kích thước chữ, màu sắc, khoảng cách tuân thủ design tokens. **Nghiêm cấm hoàn toàn các class font siêu nhỏ như `text-[10px]` và `text-[11px]`.**

---

## 2. Hệ Thống Typography (Typography System)

### 2.1. Phông chữ cơ sở

- **Font Family**: `Geist Variable` (Sans-serif) kết hợp `Geist Mono` cho các đoạn mã / UID.
- **Line Height cơ sở**: Tối thiểu `leading-normal` (1.5) hoặc `leading-relaxed` (1.625) cho body text tiếng Việt để dấu không bị chèn lên dòng trên.

### 2.2. Thang kích thước & Phân cấp (Typography Scale & Hierarchy)

| Cấp bậc (Tier)              | Token Tailwind                     | Cỡ chữ (Mobile $\rightarrow$ Desktop)      | Độ đậm (Weight)        | Mục đích sử dụng                                                   |
| :-------------------------- | :--------------------------------- | :----------------------------------------- | :--------------------- | :----------------------------------------------------------------- |
| **Display / Hero**          | `text-3xl sm:text-4xl lg:text-5xl` | 30px $\rightarrow$ 36px $\rightarrow$ 48px | `font-extrabold` (800) | Banner trang chủ, tiêu đề landing page                             |
| **Page Title (H1 / H2)**    | `text-2xl sm:text-3xl`             | 24px $\rightarrow$ 30px                    | `font-bold` (700)      | Tiêu đề chính của trang (Profile, Admin, Room)                     |
| **Section Title (H3)**      | `text-xl sm:text-2xl`              | 20px $\rightarrow$ 24px                    | `font-semibold` (600)  | Tiêu đề phân đoạn lớn, modal tiêu đề                               |
| **Card / Group Title (H4)** | `text-lg sm:text-xl`               | 18px $\rightarrow$ 20px                    | `font-semibold` (600)  | Tiêu đề card, header widget bento                                  |
| **Lead / Highlight**        | `text-base sm:text-lg`             | 16px $\rightarrow$ 18px                    | `font-normal` (400)    | Đoạn văn mở đầu, thông điệp nổi bật                                |
| **Primary Body**            | `text-sm sm:text-base`             | 14px $\rightarrow$ 16px                    | `font-normal` (400)    | Nội dung đọc chính, mô tả chi tiết, bài viết                       |
| **Form Label & Controls**   | `text-sm`                          | 14px cố định                               | `font-medium` (500)    | Nhãn input (`<FieldLabel>`), Tabs trigger, Buttons, Dropdown items |
| **Secondary / Muted**       | `text-xs sm:text-sm`               | 12px $\rightarrow$ 14px                    | `font-normal` (400)    | Mô tả phụ, hướng dẫn dưới ô nhập liệu, helper text                 |
| **Metadata & Badges**       | `text-xs`                          | 12px cố định                               | `font-medium` (500)    | Tags, badges, chip trạng thái, timestamps, UID copy                |

### 2.3. Quy tắc Bất di bất dịch (Strict Typography Rules)

1. ❌ **CẤM font dưới 12px**: Không bao giờ sử dụng `text-[9px]`, `text-[10px]`, `text-[11px]`. Mức tối thiểu toàn hệ thống là `text-xs` (12px, $0.75\text{rem}$).
2. ❌ **CẤM `text-xs` cho Form Label và Main Interactive Buttons**: Mọi nhãn trường nhập dữ liệu, nút bấm chính, tab điều hướng phải dùng kích thước từ `text-sm` (14px) trở lên để người dùng không phải căng mắt khi thao tác.
3. ✅ **Icon tương ứng cỡ chữ**:
   - Chữ `text-xs` (12px) $\rightarrow$ Icon `size-3.5` (14px).
   - Chữ `text-sm` (14px) $\rightarrow$ Icon `size-4` (16px).
   - Chữ `text-base` (16px) $\rightarrow$ Icon `size-4.5` (18px) hoặc `size-5` (20px).
   - Tiêu đề `text-xl`/`text-2xl` $\rightarrow$ Icon `size-5` hoặc `size-6`.

---

## 3. Quy Chuẩn Thành Phần Giao Diện (Component Guidelines)

### 3.1. Nút bấm (Button)

- **Size mặc định (Default)**: `h-9 sm:h-10 px-4 text-sm font-medium rounded-xl gap-2`.
- **Size nhỏ (Sm)**: `h-8 px-3 text-xs sm:text-sm font-medium rounded-lg gap-1.5`. Dùng cho toolbar, action lồng trong table hoặc card phụ.
- **Mobile Touch**: Trên mobile, các nút hành động chính (Submit, Save, Confirm) nên để `w-full` hoặc tối thiểu chiều cao `h-10` để dễ chạm bằng ngón cái.

### 3.2. Ô nhập liệu (Input & Form Fields)

- **Chiều cao chuẩn**: `h-10 sm:h-11` với góc bo `rounded-xl`.
- **Text & Placeholder**: `text-sm`, độ tương phản placeholder đạt chuẩn (`text-muted-foreground`).
- **Khoảng cách nhãn và input**: `gap-1.5` đến `gap-2`, hỗ trợ đánh dấu bắt buộc `<span className="text-destructive">*</span>`.

### 3.3. Thẻ & Bento Grid (Card & Layout)

- **Bo góc**: `rounded-2xl` cho card chính, `rounded-xl` cho card con bên trong.
- **Padding**:
  - Mobile ($< 640\text{px}$): `p-4` đến `p-5`.
  - Desktop ($\ge 640\text{px}$): `p-6` đến `p-8`.
- **Bố cục Bento Grid**: Chia 12 cột trên màn hình lớn (`lg:grid-cols-12`), tự động xếp chồng 1 cột trên mobile (`grid-cols-1`).

### 3.4. Thẻ Trạng Thái & Nhãn Phụ (Badge)

- **Kích thước**: `h-5 sm:h-6 px-2 sm:px-2.5 text-xs font-medium rounded-md gap-1.5`.
- Sử dụng màu nền mờ ngữ nghĩa (`bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`).

---

## 4. Bảng Tra Cứu Nhanh Cho Lập Trình Viên & AI Agents

| Thành phần          | Class Tailwind chuẩn mực                                                                   |
| :------------------ | :----------------------------------------------------------------------------------------- |
| Tiêu đề trang       | `<TypographyH2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">` |
| Mô tả dưới tiêu đề  | `<TypographyMuted className="text-sm sm:text-base leading-relaxed">`                       |
| Tiêu đề thẻ         | `<TypographyH4 className="text-lg sm:text-xl font-bold tracking-tight">`                   |
| Nhãn Form Input     | `<FieldLabel className="text-sm font-medium text-foreground">`                             |
| Hướng dẫn Form      | `<FieldDescription className="text-xs sm:text-sm text-muted-foreground">`                  |
| Tab Trigger         | `<TabsTrigger className="h-9 sm:h-10 px-3 text-sm font-medium gap-2">`                     |
| Nút hành động chính | `<Button className="h-10 px-4 text-sm font-medium gap-2">`                                 |
| Nút toolbar nhỏ     | `<Button size="sm" className="h-8 px-3 text-xs sm:text-sm gap-1.5">`                       |
| Badge thông tin     | `<Badge className="text-xs font-medium px-2 py-0.5 gap-1.5">`                              |
