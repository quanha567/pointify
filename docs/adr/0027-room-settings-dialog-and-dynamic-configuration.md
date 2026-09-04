# ADR 0027: Room Settings Dialog & Dynamic Configuration Protocol

## Status
Accepted

## Context
Trong phòng ước lượng Scrum Poker (`Room`), các thành viên và Người điều phối (`Facilitator`) có nhu cầu tinh chỉnh cả tùy chọn hiển thị cá nhân lẫn cấu hình của phòng mà không phải thoát ra ngoài trang chủ hoặc tạo phòng mới:
1. **Cá nhân hóa trải nghiệm (Personal Preferences)**: Người dùng muốn chuyển đổi ngôn ngữ (Tiếng Việt / English), chủ đề giao diện (Sáng / Tối / Hệ thống), và linh hoạt chuyển đổi vai trò giữa Thành viên ước lượng (`Estimator`) và Người quan sát (`Spectator`).
2. **Quản trị phòng động (Dynamic Room Configuration)**: Người điều phối cần có khả năng cập nhật tên phòng (`name`) hoặc thay đổi bộ bài ước lượng (`Deck`) khi buổi họp thay đổi tiêu chí định giá hoặc kịch bản sprint.
3. **Bảo toàn tính toàn vẹn dữ liệu vòng ước lượng (Estimate Integrity)**: Nếu Người điều phối thay đổi bộ bài (`Deck`) trong khi vòng ước lượng (`Round`) đang diễn ra (`voting`) và đã có thành viên gửi thẻ điểm, giá trị của các thẻ điểm đó có thể không còn tồn tại trong bộ bài mới, dẫn đến lỗi hiển thị và sai lệch thống kê.

## Decision
Chúng tôi quyết định thiết kế và hiện thực hóa tính năng theo các nguyên tắc kiến trúc sau:

1. **Thành phần giao diện: `Room Settings Dialog` (Hộp thoại Cài đặt Phòng)**
   - Đóng gói theo chuẩn React 19 Ref-as-a-prop (`RoomSettingsDialogHandle` với `open()` và `close()`).
   - Cấu trúc 2 Tab phân quyền rõ rệt:
     - **Tab Cá nhân (Personal)**: Hiển thị cho mọi thành viên. Bao gồm bộ chọn Ngôn ngữ (`vi` / `en`), bộ chọn Theme (Light / Dark / System), và bộ chuyển đổi vai trò (Estimator $\leftrightarrow$ Spectator). Thao tác thay đổi có hiệu lực ngay lập tức (Instant Auto-save / Optimistic update).
     - **Tab Phòng (Room)**: Chỉ hiển thị khi thành viên hiện tại là Người điều phối (`isFacilitator` sở hữu `FacilitatorKey`). Cho phép đổi tên phòng và chọn bộ bài (`deckType`). Có form chỉnh sửa rõ ràng với nút **Lưu thay đổi (Save Changes)**.

2. **Cơ chế An toàn khi Thay đổi Bộ bài (Deck Mutation Safety Guard)**
   - Nếu Người điều phối đổi sang bộ bài mới trong khi vòng ước lượng đang ở trạng thái `voting` và đã có ước lượng được gửi, hệ thống sẽ kích hoạt `AlertDialog` xác nhận: việc đổi bộ bài sẽ làm mới và xóa toàn bộ thẻ ước lượng của vòng hiện tại.
   - Khi xác nhận, server sẽ gọi `clearEstimates()` trên vòng hiện tại, cập nhật `Deck` mới và broadcast trạng thái phòng đã làm mới qua WebSocket.

3. **Giao thức Đồng bộ Realtime: WebSocket `room:update-config`**
   - Client Facilitator emit event `room:update-config` với payload: `{ roomId, facilitatorKey, name?, deckType? }`.
   - Backend `RoomGateway` gọi `UpdateRoomConfigUseCase`. Domain entity `Room` xác thực `facilitatorKey`, cập nhật thuộc tính, lưu trữ vào Firestore và phát sóng `room:state` tức thì tới tất cả các client tham gia qua kênh `room:{roomId}`.

## Consequences
- **Ưu điểm**:
  - Tách bạch rành mạch giữa state cục bộ phía client (ngôn ngữ, theme) và state đồng bộ toàn phòng (tên phòng, bộ bài).
  - Tránh xung đột hoặc lỗi crash giao diện khi bộ bài bị thay đổi giữa chừng nhờ cơ chế reset ước lượng an toàn.
  - Trải nghiệm mượt mà, tiện lợi, không cần tải lại trang.
- **Thách thức**:
  - Cần xử lý đồng bộ giao diện hiển thị thẻ bài (`PokerStoryCardFront`, `CardDeckDock`) ngay khi nhận được snapshot trạng thái phòng mới với `deckCards` đã cập nhật.
