# ADR 0037: Square Jira User Story Sticky Note Visual & Interaction System

## Status
Accepted (extending ADR 0029, ADR 0031, and ADR 0035)

## Context
Trong hệ thống phòng ước lượng thời gian thực (`RoomCanvasShell`), các User Stories nhập từ Jira hiện đang được biểu diễn thông qua component `StickyNoteNode` dùng chung với thẻ ghi chú thông thường. Thiết kế hiện hữu bộc lộ một số hạn chế về mặt trải nghiệm và thẩm mỹ doanh nghiệp:
1. **Thiếu tính chuyên biệt cho User Story**: Thẻ mang phong cách giấy note dán tự do kiểu Miro (màu pastel đặc, bóng đổ cong hai góc giấy `dual-corner lifted paper shadow`), chữ căn giữa trong ô `textarea` editable. Khi thành viên vô tình nhấp chuột, ô soạn thảo kích hoạt và phát tín hiệu đang gõ (`editingBy presence`) dù đây là nội dung User Story chính thức từ Jira không nên bị sửa đổi tùy tiện.
2. **Kích thước chật chội**: Kích thước cũ ($160 \times 150\,\text{px}$) không đủ chỗ để hiển thị cân đối giữa Mã Jira (`jiraKey`), Loại issue (`issueType`), Tiêu đề story, Người phụ trách và Điểm ước lượng đồng thuận (`storyPoints`).
3. **Chưa đồng bộ ONE Brand System (ADR 0035)**: Thiếu cấu trúc khung container công nghiệp (**The Container Frame**), bo góc chưa chuẩn 8px công nghiệp, typography chưa tận dụng font `JetBrains Mono` cho các chuỗi kỹ thuật.

Sau phiên phỏng vấn thiết kế 3 vòng (**Grilling & Domain Modeling**), đội ngũ đã thống nhất giải pháp chuyên biệt hóa thẻ User Story dán trên canvas theo các quyết định bên dưới.

---

## Decision

### 1. Phân định Hai Loại Thẻ trên Canvas
- **Thẻ ghi chú dán tự do (General Sticky Note)**: Dành cho ghi chú thảo luận, brainstorming tự do, hỗ trợ chỉnh sửa inline `textarea`, giữ bảng màu sắc nét và dọn sạch bóng cong kiểu Miro để chuyển sang viền hairline tinh gọn và bo góc 8px.
- **Thẻ ghi chú dán User Story (User Story Sticky Note)**: Kích hoạt chuyên biệt cho **những thẻ được import từ Jira** (thẻ sở hữu thuộc tính `jiraKey`). Thẻ này chuyển sang layout khung container công nghiệp 3 tầng.

### 2. Form Factor Hình vuông $180 \times 180\,\text{px}$ & Cấu trúc 3 Tầng (Header - Body - Footer)
Giữ vững hình thái vuông đặc trưng của Sticky Note trên bảng trắng canvas nhưng nâng kích thước lên $180 \times 180\,\text{px}$ để đảm bảo tỷ lệ cân xứng và phân tách rõ ràng:
- **Header (~32px)**:
  - Đường viền trên 3px đặc trưng của **The Container Frame** mang màu phân nhóm hoặc ONE Cherry Blossom Magenta (`#E31C79`).
  - Góc trái: Mã Story (ví dụ `PROJ-102`) bằng phông chữ kỹ thuật `JetBrains Mono Variable font-bold text-[11px]` kèm biểu tượng `ExternalLink` liên kết trực tiếp sang Jira Cloud.
  - Góc phải: Huy hiệu loại issue (`Story`, `Bug`, `Task`) và biểu tượng ghim cố định (`Pin`).
- **Body (~98px) - Nội dung Chỉ đọc (Read-Only)**:
  - Tuyệt đối **không cho phép chỉnh sửa nội dung** trực tiếp trên canvas đối với User Story từ Jira nhằm bảo toàn tính toàn vẹn của dữ liệu gốc.
  - Tiêu đề User Story căn lề trái (`text-left`), phông chữ `Inter Variable text-xs sm:text-sm font-medium leading-snug`, tự động cuộn mượt (scrollbar ẩn) khi tiêu đề dài.
- **Footer (~32px)**:
  - Góc trái: Ảnh đại diện nhỏ (Preset Mascot Avatar hoặc chữ cái đầu) cùng tên Người phụ trách / Người nhập.
  - Góc phải: Hiển thị trạng thái ước lượng hoặc Huy hiệu điểm số đồng thuận (`Story Points Badge`).

### 3. Ngôn ngữ Thị giác ONE Logistics Container
- Nền thẻ trung tính cao cấp: Nền trắng/xám sạch sẽ (`bg-card` / Crisp Gray `#F8FAFC`) ở Light Mode, Slate/Navy (`#0B1B3D`) ở Dark Mode.
- Phủ một lớp màu tint siêu nhẹ 4-6% tương ứng với nhóm màu được chọn (vàng, xanh biển, xanh lá, hồng, cam) kết hợp viền trên 3px sắc nét, giúp phân biệt các cụm công việc trên canvas từ xa mà vẫn đảm bảo tính sang trọng B2B.
- Loại bỏ hoàn toàn hiệu ứng bóng đổ cong giả lập hai góc giấy kiểu Miro. Sử dụng đổ bóng tinh tế chuẩn SaaS (`shadow-xs` / `shadow-sm`) và viền hairline mỏng (`border border-border/80`).

### 4. Quản lý Vòng đời & Kích hoạt qua Floating Toolbar
Thao tác kích hoạt và tương tác với User Story được tập trung trên **Floating Toolbar** khi Facilitator nhấp chọn thẻ:
1. **Chờ ước lượng (Pending)**:
   - Thẻ hiển thị huy hiệu trạng thái chờ ở footer.
   - Khi Facilitator nhấp chọn thẻ, Floating Toolbar xuất hiện nút nổi bật **"Ước lượng Story này"** (Màu ONE Magenta `#E31C79` với icon `Play`).
2. **Đang ước lượng (Estimating)**:
   - Khi Facilitator kích hoạt, chủ đề vòng của Bàn ước lượng (`Table Arena Node`) nhận tiêu đề story.
   - Thẻ phát sáng viền Magenta động (`ring-2 ring-[#E31C79] animate-pulse`), footer hiển thị badge "Đang ước lượng".
3. **Đã có điểm (Estimated)**:
   - Khi vòng kết thúc và đạt điểm đồng thuận, số điểm tự động cập nhật vào thuộc tính `storyPoints` của thẻ.
   - Góc phải footer của thẻ hiển thị huy hiệu Story Points nổi bật (ví dụ: `5 pts` bằng font `JetBrains Mono` kèm biểu tượng `CheckCircle2`).
   - Nút hành động trên Floating Toolbar chuyển thành **"Ước lượng lại"** (`Re-estimate`), cho phép Facilitator mở lại vòng poker cho story này nếu phát sinh thảo luận bổ sung.
4. **Phân quyền thao tác**:
   - Chỉ có **Người điều phối (Facilitator)** mới thấy và kích hoạt được nút "Ước lượng" / "Ước lượng lại" trên Toolbar. Thành viên thường chỉ có thể xem và mở liên kết Jira.

---

## Consequences
### Tích cực
- **Trải nghiệm Agile chuyên nghiệp**: User Story có hình ảnh sắc sảo, chuẩn mực của một task công việc cao cấp thay vì một mẩu giấy note viết nháp.
- **Bảo toàn dữ liệu**: Chế độ Read-only ngăn ngừa việc vô tình gõ đè hay thay đổi tiêu đề ticket Jira trên canvas.
- **Đồng bộ nhận diện ONE**: Hài hòa tuyệt đối với Bàn ước lượng (`TableArenaNode`) và Dock bài (`RoomDeckDock`) theo ADR 0035 & 0036.
- **Quy trình ước lượng trực quan**: Dễ dàng theo dõi story nào đang ước lượng, story nào đã hoàn thành ngay trên không gian bảng trắng.

### Cần lưu ý
- Chiều cao vùng nội dung Body (~98px) cần có cơ chế truncate hoặc scrollbar ẩn tinh tế để không làm vỡ bố cục khi Jira issue có summary rất dài.
