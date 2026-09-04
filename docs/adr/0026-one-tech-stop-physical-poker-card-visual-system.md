# 0026. Hệ thống Thẻ bài Vật lý One Tech Stop, Nút chọn Dạng Viên nang & Minh họa Khối Container (One Tech Stop Physical Poker Card Visual System)

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày:** 2026-09-04
- **Người quyết định:** Tech Lead, Frontend Team, UI/UX Guild

## Ngữ cảnh & Vấn đề

Trước đây, giao diện lá bài trong phòng ước lượng (`Room`) sử dụng các khối chữ nhật bo góc đơn giản:
1. **Trải nghiệm thiếu chiều sâu & xúc giác (Tactile Depth)**: Lá bài úp chỉ là một khối màu phẳng với biểu tượng checkmark, chưa tạo được cảm giác hồi hộp, chân thực như khi chơi Scrum Poker bằng bộ bài vật lý ngoài đời.
2. **Thiếu thông tin ngữ cảnh độ phức tạp**: Lá bài khi lật chỉ hiển thị một con số đơn lẻ (ví dụ: `13`), khiến các thành viên mới hoặc người tham gia không nắm rõ quy ước ngầm định (Story Point conventions) của đội ngũ (ví dụ: 13 nghĩa là rủi ro cao và câu chuyện quá lớn cần chia nhỏ).
3. **Nhu cầu đồng bộ thương hiệu thực tế của One Tech Stop**: Đội ngũ đang sở hữu bộ bài Scrum Poker vật lý mang bản sắc riêng (mặt sau vân sọc dập nổi màu hồng magenta kèm logo One Tech Stop; mặt trước phong cách thẻ bài Poker chuẩn với số góc đối xứng, nhãn ý nghĩa và đồ họa chồng khối container thực tế).

## Quyết định Kiến trúc

1. **Chuẩn hóa Thuật ngữ & Bounded Context (`CONTEXT.md`)**:
   - **Nút bài dạng viên nang** (*Capsule Card Button*): Các nút bấm chọn lá bài trên Thanh dock đáy (`RoomDeckDock`) theo kiểu viên nang capsule viền đôi nhỏ gọn.
   - **Mặt sau lá bài vân sọc dập nổi** (*Ribbed Textured Card Back*): Mặt sau thẻ bài úp tại ghế thành viên (`ParticipantNode`) với vân nổi dọc, tông hồng magenta và logo bánh răng One Tech Stop sắc nét.
   - **Mặt trước lá bài chuẩn Poker** (*Poker Story Point Card Front*): Mặt trước thẻ bài mở hiển thị 2 số góc đối xứng (trên-trái và đảo ngược dưới-phải), viền chỉ vàng hairline, số lớn ở giữa, nhãn ý nghĩa và hình minh họa khối hàng container.
   - **Hình họa khối container ước lượng** (*Container Metaphor Stack*): Mô hình trực quan các thùng container xếp chồng thể hiện trực tiếp độ lớn của từng Story Point.

2. **Đồng bộ Nhất quán Tỉ lệ Thẻ bài Poker Cổ điển (Full Poker Card Across All Surfaces)**:
   - **Thanh dock đáy (`RoomDeckDock`)**: Thay vì dùng nút viên nang đơn giản, toàn bộ các lá bài trên thanh dock hiển thị trực tiếp dưới hình thái thẻ bài Poker thu nhỏ chân thực (ảnh 3) với viền vàng hổ phách, số góc, nhãn tiếng Anh chuẩn ("Risk & big story", "Tiny", "Complex"...) và hình vẽ các khối container hàng hải.
   - **Mặt bàn Canvas & Ghế thành viên (`ParticipantNode` & `TableArenaNode`)**: Đồng bộ cùng một layout thẻ bài Poker chuẩn (2.5 : 3.5), kích thước tối ưu để hiển thị sắc nét khi lật mở.

3. **Cơ chế Đa ngôn ngữ (i18n) cho Nhãn Ý nghĩa**:
   - Mọi nhãn mô tả độ phức tạp (ví dụ: "Risk & big story", "Tiny", "Complex", "Too large / Split") được quản lý tập trung trong file i18n `vi.json` và `en.json`, tự động chuyển đổi theo ngôn ngữ người dùng.

4. **Bảo tồn Độ tương phản (Universal Contrast Preservation)**:
   - Mặt sau thẻ bài giữ sắc hồng magenta dập nổi rực rỡ đặc trưng của One Tech Stop ở cả Light và Dark mode.
   - Mặt trước thẻ bài duy trì nền giấy sáng cao cấp (ivory/white) cùng viền vàng hổ phách hairline để các thông số, nhãn chữ và hình khối container luôn có độ tương phản cao nhất.

5. **Hoạt ảnh Lật bài Liên hoàn 3D (Staggered 3D Flip Cascade)**:
   - Khi Người điều phối mở bài, các thẻ bài quanh bàn sẽ lật với độ trễ liên hoàn (`staggerChildren` / delay ~0.06s theo từng ghế) với hiệu ứng xoay trục Y và lò xo vật lý (`motion/react` spring physics) mang lại cảm giác chân thực như trên sòng bài thật.

6. **Tích hợp Vòng quay Tiến độ Động (`@magicui/animated-circular-progress-bar`)**:
   - Nâng cấp `VoteProgressRing` tại Bàn ước lượng (`TableArenaNode`) sang component MagicUI với chuyển động quay vòng và hiển thị phần trăm mượt mà, định hình rõ số lượng người đã bỏ phiếu trên tổng số thành viên.

## Hệ quả & Đánh giá

### Tích cực:
- Nâng tầm thị giác vượt bậc (WOW-factor), biến buổi họp ước lượng trực tuyến thành trải nghiệm cầm bài vật lý chân thực.
- Giúp toàn đội thống nhất hiểu biết chung về quy mô công việc nhờ các nhãn gợi ý và minh họa trực quan.
- Tái sử dụng linh hoạt giữa `ParticipantNode`, `TableArenaNode` và thanh dock chọn bài.

