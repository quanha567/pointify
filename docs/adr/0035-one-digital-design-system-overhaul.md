# ADR 0035: ONE Digital Design System Overhaul & Comprehensive Design Guideline

## Status
Accepted (superseding ADR 0021 and ADR 0034; extending ADR 0032 & ADR 0033)

## Context
Pointify đã phát triển hệ thống thiết kế qua nhiều ADR kế tiếp nhau (ADR 0021 Typography, ADR 0032 Admin Portal, ADR 0033 Auth Portal, ADR 0034 Brand Identity). Tuy nhiên, hệ thống thiết kế bị phân mảnh: thông tin nằm rải rác qua 4 ADR, nhiều giá trị token không nhất quán (hover color `#C01263` vs `#CC196C`, navy `#002B49` vs `#0B1B3D`, semantic colors dùng 500-weight vs 600-weight), và chưa có tài liệu `DESIGN.md` tổng hợp duy nhất dù đã được tham chiếu trong ADR 0021 và frontend coding standard.

Sau khi tiếp nhận bản **Ocean Network Express (ONE) Digital Design Guideline & UI System Reference** — tài liệu 30 mục bao trùm toàn diện từ triết lý thiết kế, bảng màu, typography, spacing, layout, shadow, motion, component anatomy, status system, accessibility, dark mode, đến machine-readable tokens — đội ngũ quyết định chuẩn hóa toàn bộ hệ thống thiết kế Pointify Web thành một bộ nhất quán duy nhất.

## Decision

Sau phiên grilling gồm 12 quyết định thiết kế trải qua 2 vòng đánh giá, chúng tôi thống nhất:

### 1. Scope: Adapt Visual DNA (không migrate tech stack)
Trích xuất design tokens, color system, typography, spacing, shadows, motion, và visual principles từ guideline và chuyển đổi vào kiến trúc Tailwind CSS v4 / Vite hiện tại. **Không** migrate sang Next.js 14+ hay Tailwind v3.

### 2. Color System Overhaul

#### 2.1. Magenta Hover: `#C01263` → `#CC196C`
Giá trị hover mới có WCAG AA 5.35:1 trên nền trắng, đồng thời dùng làm màu text link trên nền sáng. Thay thế giá trị cũ `#C01263` toàn bộ.

#### 2.2. Structural Navy: `#002B49` → `#0B1B3D`
Navy mới có contrast WCAG AAA 16.94:1 trên nền trắng, đậm hơn và trung tính hơn. Áp dụng cho sidebar, utility bar, và structural depth.

#### 2.3. Semantic Colors: 500-weight → 600-weight
Chuyển toàn bộ semantic feedback colors sang 600-weight Tailwind (darker, higher contrast):
- Success: `#10B981` → `#059669` (Emerald 600)
- Warning: `#F59E0B` → `#D97706` (Amber 600)
- Error: `#EF4444` → `#DC2626` (Red 600)
- Info: `#0284C7` (giữ nguyên)

Bổ sung background tint tokens (`#D1FAE5`, `#FEF3C7`, `#FEE2E2`, `#E0F2FE`) cho status badges.

#### 2.4. Accent Token Mapping
Shadcn `--accent` chuyển từ neutral slate sang magenta tint `#FDF2F7`, `--accent-foreground` sang `#CC196C`. Tất cả hover/active states trong shadcn components sử dụng tint ONE Magenta.

### 3. Industrial Border Radius
`--radius` giảm từ `0.75rem` (12px) → `0.5rem` (8px), tạo hình học chặt chẽ hơn phản ánh ISO container modularity:
- `radius-sm`: 4px (badges, chips)
- `radius-md`: 6px (buttons, inputs)
- `radius-lg`: 8px (cards, modals)
- `radius-xl`: 12px (command palettes)

### 4. Obsidian Dark Mode
Dark mode tối hơn đáng kể, thiết kế cho ca đêm:
- Background: `#090D16` (obsidian, thay vì ~`#141B2C`)
- Card: `#111827` (Slate 900)
- Popover/Elevated: `#1F2937` (Slate 800 — phân biệt với card)
- Dark text link magenta: `#F472B6` (Pink 400, 6.8:1 contrast trên `#111827`)

### 5. Auth Page: Remove Cherry Blossom Decorations
Tuân thủ quy tắc mới: *"NO Seasonal Floral Illustrations on functional B2B screens."* Loại bỏ toàn bộ SVG cherry blossom (cành, hoa, cánh hoa rơi) trên right panel của auth page. Giữ lại dải **Seigaiha wave pattern** ở chân trang — là hoa văn truyền thống Nhật Bản mang tính biểu tượng, không phải hình minh họa thực vật.

### 6. Full Token Layer in `style.css`
Bổ sung đầy đủ các token layer mới:
- **Shadow system**: `--shadow-sm/md/lg/xl` với giá trị CSS cụ thể
- **Motion system**: `--duration-fast/normal/slow` + `--ease-standard`
- **Typography size tokens**: `--font-size-display/h1/h2/h3/body/caption/code`
- **Text/Surface/Border color tokens**: Toàn bộ bảng màu kỹ thuật số

### 7. DESIGN.md — Single Source of Truth
Tạo `pointify-web/DESIGN.md` — tài liệu 24 mục bao trùm toàn bộ design system, dịch nội dung shipping-specific sang domain Pointify (Room, Round, Participant, Deck, Card, Estimate). ADR 0021 và ADR 0034 chính thức bị supersede bởi ADR này và DESIGN.md.

## Consequences

### Tích cực
- **Nhất quán hóa**: Toàn bộ design tokens trong `style.css` phản ánh trung thực bộ nhận diện ONE mới nhất.
- **Single source of truth**: `DESIGN.md` thay thế 4 ADR phân mảnh, dễ tham chiếu cho cả engineers và AI agents.
- **WCAG compliance nâng cao**: Hover `#CC196C` (5.35:1), navy `#0B1B3D` (16.94:1 AAA), semantic 600-weight colors tất cả đạt chuẩn.
- **Industrial aesthetics**: Radius tighter (4/6/8/12px), shadow system crisp, motion ≤200ms — phù hợp ONE enterprise identity.
- **Dark mode đậm hơn**: Obsidian palette giảm mỏi mắt ca đêm, phân tầng rõ ràng (background → card → elevated).

### Rà soát cần thiết
- Border radius thay đổi ảnh hưởng **toàn bộ** shadcn components — cần kiểm tra visual regression trên tất cả screens.
- Dark mode tối hơn đáng kể — cần verify text contrast trên các component đã có.
- Auth page mất cherry blossom decorations — right panel đơn giản hơn, chỉ còn Seigaiha wave band.
- Accent token chuyển sang magenta tint — tất cả shadcn dropdown hover states sẽ có tint hồng nhẹ thay vì neutral gray.
