# 0017. Kiến trúc Bảng trắng Không gian Phòng với @xyflow/react (Room Canvas Shell)

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày:** 2026-09-02
- **Người quyết định:** Tech Lead, Frontend Team

## Ngữ cảnh & Vấn đề

Giao diện trang Phòng (`/rooms/$roomId`) trước đây được xây dựng dạng trang web tĩnh tiêu chuẩn (Standard Page Layout), phụ thuộc vào `PublicHeader` và `PublicFooter` chung của hệ thống. Bố cục dạng lưới truyền thống (2 cột) gây chật chội khi số lượng thành viên tăng lên, thiếu cảm giác sinh động của một phiên Scrum Poker tương tác trực tiếp.

Người dùng cần một trải nghiệm **Bảng trắng không gian (Infinite Whiteboard Canvas)** chuyên nghiệp, tương tự FigJam/Miro/Mural, nơi không gian làm việc là một canvas vô cực, bàn ước lượng và các thành viên được hiển thị trực quan dạng các Node không gian, các thanh công cụ điều khiển được thiết kế dạng Floating HUD.

## Quyết định Kiến trúc

1. **Khung bảng trắng phòng (Room Canvas Shell)**:
   - Route `/rooms/$roomId` được cấu hình để tách khỏi `PublicHeader` và `PublicFooter` trong `__root.tsx`, mở rộng chiếm trọn `h-screen w-screen overflow-hidden`.
   - Tất cả các thanh công cụ điều hướng, trạng thái phòng, bảng điều khiển người điều phối và danh sách thành viên được nâng cấp thành các **Floating Island Overlays (HUD)** phủ trên Canvas với hiệu ứng kính mờ (glassmorphism).

2. **Công nghệ Infinite Canvas (@xyflow/react)**:
   - Sử dụng thư viện `@xyflow/react` làm engine hiển thị mặt phẳng bảng trắng với hỗ trợ Pan, Zoom, Background Dots (tinh tế tự động chuyển theme Light/Dark), Minimap và Controls góc dưới bên trái (Bottom-Left).
   - Định nghĩa các Custom Node chuyên biệt:
     - **`TableArenaNode`**: Node bàn poker trung tâm hiển thị chủ đề, trạng thái vòng (Đang bỏ phiếu / Đã lật bài), tiến độ bình chọn, và thống kê điểm khi kết thúc vòng (Điểm trung bình, Cao nhất/Thấp nhất, Trạng thái đồng thuận / Consensus).
     - **`ParticipantNode`**: Node thành viên vệ tinh, bố trí theo quỹ đạo elip quanh bàn với avatar, trạng thái kết nối, trạng thái chọn bài và hiệu ứng lật bài 3D xoay lật sống động.
     - **`SpectatorPillNode`**: Quan sát viên được hiển thị thành các pill node nhỏ gọn bên trên bàn để không chiếm ghế ước lượng trực tiếp.

3. **Tự động bố trí tọa độ (Deterministic Auto-layout)**:
   - Tọa độ của các `ParticipantNode` quanh bàn trung tâm được tính toán theo thuật toán phân bổ góc elip dựa trên số lượng thành viên thực tế.
   - Giảm thiểu độ phức tạp và overhead mạng do không phải đồng bộ tọa độ kéo thả qua Firestore/WebSocket.

4. **Floating Action Bar & Deck Hand Dock**:
   - Thanh chọn lá bài (`DeckHandDock`) được ghim cố định ở đáy viewport (Bottom Dock) với các micro-animation mượt mà, không bị ảnh hưởng bởi mức độ zoom của canvas.
   - Thanh tác vụ người điều phối (`FacilitatorActionBar`) nổi ở giữa bên trên dock bài khi người dùng có quyền điều phối.

## Hệ quả & Đánh giá

### Tích cực:
- Trải nghiệm người dùng vượt trội, trực quan, mang đậm tính cộng tác thời gian thực.
- Khả năng mở rộng tốt: dễ dàng bổ sung thêm Sticky Notes, Timer Node, Story Backlog Cards vào canvas trong tương lai.
- Đảm bảo hiệu năng cao trên cả thiết bị di động và máy tính bảng nhờ khả năng zoom/pan mượt mà của `@xyflow/react`.

### Tiêu cực & Biện pháp khắc phục:
- Cần cài đặt thêm thư viện `@xyflow/react` vào `pointify-web/package.json`.
- Cần tối ưu CSS và theme colors giữa chế độ Dark/Light để Background Dots và Node Card hiển thị hài hòa.
