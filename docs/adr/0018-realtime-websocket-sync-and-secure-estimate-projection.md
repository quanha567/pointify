# 0018. Đồng bộ Real-time qua WebSocket Gateway và Chiếu Dữ liệu Ước lượng Bảo mật

- **Trạng thái:** Đã chấp thuận (Accepted)
- **Ngày:** 2026-09-02
- **Người quyết định:** Tech Lead, Backend Team, Frontend Team

## Ngữ cảnh & Vấn đề

Pointify yêu cầu trải nghiệm cộng tác thời gian thực tức thời giữa nhiều thành viên cùng tham gia phòng ước lượng Scrum Poker. Các tương tác bao gồm:
1. Thành viên mới tham gia phòng hoặc thoát/mất kết nối mạng.
2. Thành viên chọn/hủy chọn lá bài ước lượng.
3. Người điều phối thực hiện lật bài (Reveal), chuyển vòng mới (Next Round), hoặc chuyển quyền điều phối (Claim Facilitator).

Đồng thời, nghiệp vụ Scrum Poker yêu cầu tính **Bảo mật giá trị ước lượng (Estimate Secrecy)** tuyệt đối: Trong pha `voting`, các thành viên khác chỉ được biết thành viên đã chọn bài (`hasEstimated: true`), hoàn toàn không được biết giá trị lá bài trước khi Người điều phối kích hoạt lệnh lật bài. Nếu gửi toàn bộ state qua client-side rồi che bằng UI, người dùng có thể dễ dàng xem giá trị bằng DevTools.

## Quyết định Kiến trúc

1. **NestJS WebSocket Gateway (Socket.IO / ws)**:
   - Xây dựng `RoomGateway` tại tầng Presentation của backend (`contexts/room/presentation/gateways/room.gateway.ts`).
   - Client kết nối qua WebSocket và join vào room channel (`room:${roomId}`).
   - Các thao tác thay đổi trạng thái phòng (Join, Estimate, Reveal, NextRound, ClaimFacilitator) được điều phối qua Use Cases của Clean Hexagonal Architecture, cập nhật Aggregate và lưu trữ Firestore.

2. **Chiếu Dữ liệu Bảo mật theo Từng Người Xem (Per-Viewer Sanitized Projection)**:
   - Khi phát tán (broadcast) sự kiện cập nhật trạng thái phòng tới các client trong room, backend thực hiện sanitize snapshot theo từng `socketId` / `viewerId`:
     - Nếu round đang ở trạng thái `voting`: Chỉ giữ nguyên `estimatedValue` của chính `viewerId` đó; đối với các thành viên khác, trường `estimatedValue` bị ẩn (`null`) và chỉ gửi `hasEstimated: true`.
     - Nếu round đã ở trạng thái `revealed`: Gửi đầy đủ `estimatedValue` và số liệu thống kê (Average, Consensus, Min, Max).

3. **Quản lý Hiện diện & Mất kết nối Mềm (Soft Offline Presence)**:
   - Khi socket bị ngắt kết nối (Disconnect/Close), thành viên không bị xóa khỏi phòng ngay mà được đánh dấu `isOnline: false`.
   - Giao diện Frontend hiển thị Participant Node ở trạng thái mờ (grayscale/opacity) và giữ nguyên ước lượng nếu đã chọn.
   - Nếu Người điều phối mất kết nối quá thời gian chờ (60s), kích hoạt khả năng Nhận quyền điều phối (`Claim Facilitator`) cho các thành viên còn lại.

4. **Lobby & Guest Onboarding Modal (Frontend)**:
   - Khi truy cập `/rooms/:roomId`, hệ thống kiểm tra danh tính `participantId` (lưu trong `sessionStorage`/`localStorage` hoặc `AuthStore`).
   - Nếu chưa tham gia, hiển thị Join Dialog Modal để người dùng nhập Display Name (nếu là Guest) và chọn vai trò (Thành viên ước lượng - Estimator hoặc Người quan sát - Spectator).

## Hệ quả & Đánh giá

### Tích cực:
- Bảo mật tuyệt đối, ngăn chặn hoàn toàn việc lộ bài qua mạng hoặc DevTools.
- Độ trễ cực thấp (< 50ms) giữa các thao tác ước lượng và lật bài.
- Giữ vững nguyên lý DDD Clean Architecture & Hexagonal: Mọi quy tắc nghiệp vụ đều được kiểm soát trong Room Aggregate trước khi broadcast.

### Tiêu cực & Biện pháp khắc phục:
- Cần cài đặt `@nestjs/websockets` và `@nestjs/platform-socket.io` (hoặc `socket.io` / `ws`) trên backend và `socket.io-client` trên frontend.
- Cần xử lý cẩn thận trường hợp reconnect tự động khi mạng chập chờn.
