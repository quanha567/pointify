# ADR 0021: Chuẩn Hóa Typography System Và Quy Chuẩn Thiết Kế Giao Diện Đa Thiết Bị

## Bối cảnh (Context)
Trong quá trình phát triển ứng dụng Pointify, nhiều thành phần giao diện (UI components) lạm dụng các class Tailwind có kích thước font rất nhỏ như `text-[10px]`, `text-[11px]`, `text-xs` (12px) cho các tương tác quan trọng như Form Label, Tab Triggers, Action Buttons, Badges và Metadata. Điều này dẫn đến các vấn đề nghiêm trọng:
1. **Khả năng đọc tiếng Việt kém**: Các dấu thanh điệu tiếng Việt (hỏi, ngã, nặng, sắc, các mũ ô/ơ/ê) ở kích thước $\le 11\text{px}$ bị bẹp, dính vào thân chữ và gây mỏi mắt.
2. **Vi phạm tiêu chuẩn tiếp cận (WCAG Accessibility)**: Cỡ chữ quá nhỏ gây khó khăn cho người dùng trên màn hình máy tính có độ phân giải cao hoặc màn hình điện thoại di động.
3. **Mất cân đối công thái học**: Vùng chạm (touch target) của các button/tab mang font `text-xs` bị teo nhỏ, gây khó bấm trên mobile và không tạo được cảm giác cao cấp của sản phẩm SaaS hiện đại.

## Quyết định (Decision)

1. **Chuẩn Hóa Thang Phân Cấp Typography (Scale & Hierarchy Tiers)**:
   - **Page Title**: `text-2xl sm:text-3xl` (`font-bold`, 24px - 30px)
   - **Section Title / Modal Title**: `text-xl sm:text-2xl` (`font-semibold`, 20px - 24px)
   - **Card / Widget Title**: `text-lg sm:text-xl` (`font-semibold`, 18px - 20px)
   - **Form Label / Interactive Controls (Buttons, Tabs, Inputs)**: `text-sm` (`font-medium`, 14px)
   - **Body / Primary Text**: `text-sm sm:text-base` (`font-normal`, 14px - 16px)
   - **Helper / Muted Text**: `text-xs sm:text-sm` (12px - 14px, `leading-normal`)
   - **Metadata / Badges / Monospace UID**: Cố định `text-xs` (`font-medium`, 12px)

2. **Quy Tắc Tuyệt Đối Về Kích Cỡ Tối Thiểu (Absolute Minimum Floor)**:
   - Nghiêm cấm hoàn toàn các class tùy biến font dưới 12px: không dùng `text-[9px]`, `text-[10px]`, `text-[11px]`. Mức tối thiểu toàn hệ thống là `text-xs` (12px).
   - Nghiêm cấm dùng `text-xs` cho nhãn trường nhập liệu (`<FieldLabel>`) và các nút bấm hành động chính.

3. **Tối Ưu Geist Variable & Line-Height Cho Tiếng Việt**:
   - Giữ nguyên bộ phông thương hiệu `Geist Variable`, kết hợp `font-medium` ở các điểm chạm nhãn và tăng line-height lên `leading-normal` (1.5) hoặc `leading-relaxed` (1.625) nhằm đảm bảo dấu thanh điệu tiếng Việt luôn thoáng và sắc nét.

4. **Nâng Cấp UI Primitives (`src/components/ui/`)**:
   - Refactor `src/components/ui/typography.tsx`: nâng `TypographyMuted` từ `text-xs` lên `text-sm text-muted-foreground leading-normal`, nâng `TypographySmall` lên `text-sm font-medium`.
   - Chuẩn hóa kích thước icon tương xứng với cỡ chữ (chữ 12px đi với icon 14px; chữ 14px đi với icon 16px).

5. **Ban Hành Cẩm Nang Thiết Kế Giao Diện (`pointify-web/DESIGN.md`)**:
   - Mọi đóng góp mã nguồn frontend và AI Agents đều phải đối chiếu với `DESIGN.md` trước khi xây dựng component mới hoặc refactor.

## Hệ quả (Consequences)
- **Tích cực**:
  - Giao diện Pointify thoáng đãng, hiện đại, đạt chuẩn công thái học cao cấp từ mobile đến desktop.
  - Trải nghiệm đọc tiếng Việt rõ ràng, sắc sảo và thẩm mỹ vượt bậc.
  - Đồng bộ hóa toàn diện giữa các tính năng (Profile, Room Scrum Poker, Admin Shell, Authentication).
- **Cần lưu ý**:
  - Cần rà soát các thành phần phụ khi nâng font để tránh tràn chữ trên các thiết bị mobile có chiều rộng hẹp ($< 360\text{px}$).
