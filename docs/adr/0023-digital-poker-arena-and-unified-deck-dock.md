# 0023. Nâng cấp Sàn đấu Poker Kỹ thuật số và Thanh Dock Hợp nhất (Digital Poker Felt Arena & Unified Deck Dock)

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày:** 2026-09-04
- **Người quyết định:** Tech Lead, Frontend Team, Facilitator UX Guild

## Ngữ cảnh & Vấn đề

Sau khi triển khai kiến trúc Canvas Bảng trắng (ADR 0017), giao diện thực tế của phòng ước lượng gặp một số nhược điểm về thẩm mỹ và công thái học hiển thị:
1. **Thiếu chiều sâu và độ tương phản**: `TableArenaNode` và các node vệ tinh được biểu diễn như các card phẳng nền trắng (`bg-card`) mỏng manh, hòa lẫn vào nền canvas trắng chấm bi khiến mặt bàn trung tâm bị "chìm", không toát lên vẻ trang trọng của một sàn đấu poker kỹ thuật số.
2. **Phân mảnh thanh điều khiển đáy màn hình**: `FacilitatorActionBar` (thanh lật bài của Người điều phối) và `RoomDeckDock` (thanh chọn bài) đang được tách thành 2 khối bay lơ lửng xếp chồng lên nhau ở đáy viewport. Điều này gây rối mắt, che khuất tầm nhìn của các thành viên ngồi ở cạnh dưới của bàn.
3. **Thẻ bài thiếu cảm giác xúc giác (Tactile)**: Các lá bài hiện tại chỉ là các khối hình chữ nhật phẳng đơn điệu, chưa mang lại trải nghiệm cầm bài và nhấc bài trực quan.
4. **Vị trí ngồi lơ lửng**: Linh vật mascot và capsule tên của thành viên chưa có chân đế gắn kết với không gian xung quanh bàn.

## Quyết định Kiến trúc

1. **Sàn đấu Poker Kỹ thuật số (Digital Poker Felt Arena - Modern Squircle)**:
   - Nâng cấp `TableArenaNode` thành phom Squircle bo tròn góc lớn (`rounded-[2.5rem]`) với kết cấu viền đệm kép (double bezel rim), lớp đổ bóng đa tầng (multi-layered ambient depth shadow), và hiệu ứng bề mặt digital felt mờ ảo.
   - Giữ phom Squircle thay vì Oval tròn nhằm bảo toàn không gian hiển thị rộng rãi cho các tiêu đề Task/User Story dài (2-3 dòng chữ) mà vẫn giữ được chất bàn đấu poker hiện đại.
   - Nổi bật hóa vòng tiến độ (Vote Progress Ring) với hiệu ứng hào quang trung tâm (focal ring glow).

2. **Thanh dock chọn bài và điều phối hợp nhất (Unified Deck Dock)**:
   - Tích hợp `FacilitatorActionBar` và `RoomDeckDock` vào một container nổi thông minh duy nhất ở đáy viewport.
   - Thêm **Dải thanh công cụ điều phối gắn trên (Top Attached Control Strip)**: Nằm ngay trên dải lá bài, tự động hiển thị khi người dùng hiện tại là Facilitator và thu gọn thanh lịch khi là Member thường.
   - Căn giữa dãy bài hoàn hảo, tạo sự liền mạch và giải phóng không gian quan sát các Node thành viên bên dưới bàn.

3. **Quân bài Poker 3D Xúc giác (Tactile 3D Cards)**:
   - Điều chỉnh tỷ lệ quân bài dọc chuẩn poker, bổ sung viền nổi (embossed rim), bóng đổ nổi bật khi được chọn và hiệu ứng nhấc bổng 3D mượt mà khi hover (`translateY(-8px)`).

4. **Bệ ghế thành viên (Seat Pedestal Glow)**:
   - Bổ sung một đĩa hào quang ánh sáng mờ dịu (`Seat Pedestal`) bên dưới chân mỗi `ThinkingMascot` để neo vị trí ngồi của thành viên xung quanh bàn đấu.
   - Nâng cấp Capsule tên thành viên với viền tương phản sắc nét hơn.

5. **Chiếu sáng hội tụ nền Canvas (Focal Lighting)**:
   - Bổ sung radial glow dịu nhẹ tập trung vào tâm bàn và tăng nhẹ độ tương phản của dot-grid canvas, 100% tuân thủ Semantic Tokens (`bg-background`, `bg-card`, `border-border`, `ring-primary`) cho cả Light Mode và Dark Mode.

## Hệ quả & Đánh giá

### Tích cực:
- Giao diện phòng ước lượng trở nên sang trọng, có chiều sâu thị giác rõ rệt, mang đậm bản sắc Scrum Poker hiện đại.
- Công thái học (Ergonomics) được cải thiện tối đa: người điều phối vừa thao tác bài vừa có nút hành động trực quan ở một chỗ duy nhất.
- Không gian canvas thông thoáng hơn, giải phóng tầm nhìn cho các ghế thành viên phía dưới.
- 100% tuân thủ quy chuẩn Tailwind v4 CSS Tokens, không vi phạm kích thước font chữ tối thiểu (>=12px).

### Tiêu cực & Biện pháp khắc phục:
- Cần tinh chỉnh component `TableArenaNode`, `ParticipantNode`, `RoomDeckDock`, `FacilitatorActionBar`, và `RoomCanvasShell` để các transition và animation chuyển đổi mượt mà.
