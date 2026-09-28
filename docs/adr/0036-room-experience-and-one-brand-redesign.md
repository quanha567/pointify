# ADR 0036: Scrum Poker Room Visual Overhaul & ONE Brand Experience

## Status
Accepted (extending ADR 0023, ADR 0026, and ADR 0035)

## Context
Trang phòng ước lượng Scrum Poker (`/rooms/$roomId`) là trải nghiệm cốt lõi của Pointify. Dù đã được phát triển qua nhiều giai đoạn (ADR 0017 Room Canvas Shell, ADR 0023 Unified Deck Dock, ADR 0026 Physical Poker Card Visual System), giao diện trang Room vẫn tồn đọng nhiều tàn dư của phong cách cũ:
- Góc bo tròn quá mức (`rounded-2xl`, `rounded-[2.5rem]`, các nút dạng viên thuốc `rounded-full` pill buttons).
- Hiệu ứng đổ bóng mờ casino/skeuomorphism, animation dạng spring nảy quá mức (`stiffness: 350-400`).
- Lá bài vật lý sử dụng màu cam ngẫu nhiên `#e2872c` (không thuộc hệ màu ONE) và cỡ chữ quá nhỏ `text-[7px]`, `text-[9px]` (vi phạm quy định cấm chữ dưới 11px trong `DESIGN.md`).
- Confetti khi đồng thuận dùng 5 màu cầu vồng ngẫu nhiên (`#10b981`, `#3b82f6`, `#f59e0b`, `#ec4899`, `#8b5cf6`).
- Thiếu sự đồng bộ với hệ thống token chuẩn hóa của Ocean Network Express (ONE) theo ADR 0035 và `DESIGN.md`.

Sau phiên grilling 3 vòng chuyên sâu, đội ngũ đã thống nhất kế hoạch toàn diện nhằm tái thiết kế trang Room thành một **Trạm điều phối ước lượng công nghiệp (ONE Container Command Console)**.

---

## Decision

### 1. Giữ nguyên Nền tảng Canvas nhưng Chuẩn hóa Theme Hàng hải
- Tiếp tục sử dụng `@xyflow/react` cho `RoomCanvasShell` để hỗ trợ tương tác không gian tự do (pan/zoom/kéo thả Sticky Notes theo ADR 0029 & ADR 0031).
- Chuẩn hóa nền Canvas: Nền trung tính Slate-50 (`#F8FAFC`) ở Light Mode và Obsidian (`#090D16`) ở Dark Mode; thay lưới caro bằng mạng lưới chấm bi kỹ thuật số (Grid Dots Slate-200/Slate-800).
- Giới hạn phạm vi zoom (`minZoom={0.5}`, `maxZoom={1.5}`) để tránh thất lạc bàn đấu.

### 2. ONE Container Command Console (TableArenaNode)
- Thay thế hoàn toàn khối bầu dục giả nỉ casino `rounded-[2.5rem]` bằng cấu trúc hình khối công nghiệp theo chuẩn **The Container Frame** (`.card-container-frame`).
- Viền trên 3px ONE Cherry Blossom Magenta (`#E31C79`), bán kính góc bo chặt chẽ `radius-lg` (8px) hoặc `radius-xl` (12px), nền Card trung tính viền mỏng (`border-border`).
- Trạng thái Topic, Round Timer hiển thị bằng font `JetBrains Mono Variable` kèm thuộc tính `tnum`.
- Trạng thái Đồng thuận (Consensus) sử dụng mã màu chuẩn Emerald 600 (`#059669`) kèm viền sáng nhẹ.
- Pháo giấy Confetti chuyển sang 4 mã màu nhận diện thương hiệu ONE: ONE Cherry Blossom Magenta (`#E31C79`), Executive Maritime Deep Navy (`#0B1B3D`), Emerald 600 (`#059669`), và Crisp White (`#FFFFFF`).

### 3. Bộ Lá bài Poker Chuẩn Logistics (Physical Logistics Card System)
- **Tạo Hình ảnh Đồ họa 3D Isometric**: Sử dụng AI Image Generation để tạo 10 hình ảnh đại diện cho các mức độ tải trọng logistics của bộ Fibonacci cốt lõi (`0, 1, 2, 3, 5, 8, 13, 21, ?, ☕`) lưu trữ tại `public/images/cards/`.
  - `0`: Pallet gỗ rỗng.
  - `1`: Thùng container đơn 20ft ONE Magenta trên bến bãi.
  - `2`: Hai thùng container xếp chồng khóa góc.
  - `3`: Xe đầu kéo vận chuyển cụm container.
  - `5`: Cần cẩu bờ Gantry Crane bốc dỡ container.
  - `8`: Xà lan chở container đường thủy nội địa.
  - `13`: Tàu hàng trung chuyển (Feeder vessel).
  - `21`: Tàu mẹ siêu trọng tải ONE Megaship vượt đại dương.
  - `?`: Container bí ẩn trong sương mù đại dương.
  - `☕`: Cốc cà phê thủy thủ đoàn trên boong tàu.
- **Bố cục Framed Logistics Spec Sheet (`PokerStoryCardFront`)**:
  - Bo góc `radius-md` (6px), viền `border-slate-200/80` (Dark: `border-slate-800`).
  - Thay màu cam `#e2872c` bằng màu Deep Navy (`#0B1B3D`) hoặc ONE Magenta (`#E31C79`).
  - Toàn bộ nhãn phụ và chỉ số góc đạt tối thiểu `text-[11px]` (Micro Caption) với `tracking-wider uppercase`.
  - Mặt sau (`one-tech-card-back.tsx`) sử dụng hoa văn truyền thống Seigaiha (`.bg-seigaiha`) hoặc dải container ONE chính thức thay vì gradient chéo.

### 4. Tái cấu trúc Thanh Điều khiển & Dock Chọn Bài (RoomDeckDock)
- Loại bỏ toàn bộ nút bấm dạng viên thuốc (`rounded-full`).
- Áp dụng chuẩn **Industrial Border Radius**: Khung dock ngoài bo góc `radius-xl` (12px), các nút chức năng bo góc `radius-md` (6px) với chiều cao cố định `32px` (Small) hoặc `38px` (Default).
- Nút hành động chính (Lật bài, Vòng mới) sử dụng Primary Magenta (`#E31C79`), hover `#CC196C`.
- Tốc độ tương tác: Bỏ spring physics, chuyển sang motion chuẩn ≤200ms với easing `cubic-bezier(0.16, 1, 0.3, 1)`.

### 5. Tinh chỉnh 2 Floating Islands của Header
- **Đảo Trái**: Nút Back (`radius-md`), Tên phòng, và bổ sung **Mã phòng (Room Code)** hiển thị dưới dạng badge font `JetBrains Mono uppercase` kèm nút sao chép 1-click.
- **Đảo Phải**: Nút "Mời" (Invite) + Drawer "Người tham gia" (Participants) hiển thị quân số trực tuyến (vd: `4/6`) + Nút "Cài đặt" (Settings).
- Chuyển nút đổi vai trò (Người chơi ↔ Khán giả) vào bên trong Participants Sheet để giữ cho header tối giản.
- Hai đảo chuyển từ `rounded-2xl` sang `radius-lg` (8px) với hiệu ứng kính mờ `bg-card/85 backdrop-blur-md` và viền tinh tế.

### 6. Tích hợp Thư viện beUI & Motion Chuyên biệt
- `@beui/tilt-card`: Tích hợp cho lá bài `PokerStoryCard`, tạo hiệu ứng nghiêng 3D và phản chiếu ánh sáng tự nhiên khi di chuột mà không gây layout shift.
- `@beui/number-ticker`: Tích hợp cho điểm trung bình ước lượng khi lật bài (Consensus Average).
- `@beui/button-stateful`: Tích hợp cho các nút hành động chính (Lật bài / Reveal, Vòng mới / New Round, Đồng bộ Jira) để quản lý trạng thái loading/success trực quan.
- Staggered 3D Flip: Lật thẻ bài theo chuỗi gợn sóng 100ms mượt mà qua GPU transform.

---

## Consequences

### Tích cực
- **Thống nhất toàn diện với ONE Design Guideline**: Xóa bỏ hoàn toàn cảm giác sòng bài cá cược, nâng tầm thành một trạm điều khiển cộng tác B2B hiện đại, kỷ luật và đậm chất hàng hải.
- **Trải nghiệm thị giác vượt trội**: Bộ ảnh 3D Isometric chất lượng cao tôn vinh thương hiệu ONE, các tương tác di chuột 3D tilt và lật bài mượt mà.
- **Tuân thủ chuẩn Accessibility (WCAG AA)**: Không còn cỡ chữ dưới 11px, tương phản màu sắc đạt chuẩn, độ cao nút bấm tối thiểu 32px-38px.
- **Hiệu năng cao**: Tận dụng GPU transform cho motion ≤200ms, loại bỏ tình trạng giật lag do spring tính toán nặng.

### Lưu ý khi triển khai
- Cần tạo và xuất khẩu đầy đủ 10 tài nguyên ảnh 3D isometric cho bộ bài Fibonacci vào thư mục `public/images/cards/`.
- Cần cài đặt/cập nhật primitive `@beui/tilt-card` vào thư mục `components/motion/`.
- Kiểm tra tính tương thích hiển thị trên cả Light Mode và Dark Mode (Obsidian palette).
