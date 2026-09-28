# ADR 0031: Jira Target Sprint Selection & Canvas User Story Sticky Notes

## Status
Accepted (supersedes previous Room Story Backlog HUD navigation from ADR 0030)

## Context
Trong phiên bản trước (ADR 0030), việc nạp ticket từ Jira vào phòng ước lượng dựa trên một thanh HUD nổi cố định (`StoryNavigationBar`) và hộp thoại nạp sau khi đã vào phòng (`JiraImportModal`). Mặc dù đáp ứng được yêu cầu cơ bản, phương án này bộc lộ các hạn chế về trải nghiệm và kiến trúc:
1. **Thiếu tính tự nhiên trên Canvas**: Pointify sở hữu không gian bảng trắng vô cực (`@xyflow/react`) với hệ thống nốt dán (`StickyNoteNode`). Thanh điều hướng tuần tự từng ticket kiểu slideshow đi ngược lại tinh thần bảng trắng tự do, nơi cả đội muốn quan sát toàn cảnh các User Stories cùng lúc.
2. **Quy trình rời rạc**: Người điều phối (`Facilitator`) phải tạo phòng trống trước, sau đó mới bấm nút mở modal để nạp Sprint. Điều này tạo thêm bước trung gian không cần thiết trong buổi Sprint Planning.
3. **Giới hạn phạm vi Sprint**: Hệ thống cũ chỉ hỗ trợ Sprint đang hoạt động (`Active Sprint`), trong khi thực tế nhiều đội ngũ tổ chức Planning Poker cho Sprint sắp tới (`Future Sprint`) trước khi bắt đầu sprint mới.

Chúng tôi đã cân nhắc các phương án:
- **Thời điểm chọn Sprint**: Giữa việc tiếp tục nạp sau khi vào phòng và việc tích hợp bộ chọn Sprint ngay tại bước Khởi tạo Phòng (`CreateRoomModal`) với khởi tạo nguyên tử ở backend.
- **Biểu diễn User Stories**: Giữa việc duy trì danh sách tuần tự trong HUD và việc chuyển hóa trực tiếp mỗi User Story thành một thẻ nốt dán ghim (`User Story Sticky Note`) bố trí theo cột bên trái bàn Poker trên canvas.
- **Cơ chế ghi ngược điểm**: Đặt nút đồng bộ Jira tập trung ngay trong khay điều khiển điều phối (`Unified Deck Dock` / Facilitator Action Bar) cạnh các nút Lật bài, Vote lại.

## Decision
Chúng tôi quyết định hiện thực hóa tính năng **Lựa chọn Sprint Mục tiêu khi Tạo Phòng & Biểu diễn User Story dưới dạng Sticky Notes trên Canvas** theo các nguyên tắc sau:

### 1. Tích hợp Lựa chọn Jira Target Sprint ngay tại Form Tạo Phòng (`CreateRoomModal`)
- Đặt trường lựa chọn **Jira Target Sprint** ở vị trí trên cùng của form tạo phòng khi tài khoản đã kết nối Jira.
- Hệ thống hỗ trợ cả hai trạng thái sprint: **Active** và **Future**.
- **Trải nghiệm 1-click tự động hóa**: Mặc định tự chọn **Active Sprint** của Scrum Board mặc định, đồng thời tự động điền tên sprint vào ô Tên phòng (`roomName`). Người dùng vẫn có thể chọn *"Không liên kết"* hoặc đổi sang Future Sprint / Board khác nếu muốn.

### 2. Khởi tạo Nguyên tử ở Backend (`Atomic Room Creation`)
- `CreateRoomUseCase` nhận thêm `jiraCloudId` và `jiraSprintId` (tùy chọn).
- Khi có sprint được chọn, backend truy vấn Atlassian API lấy danh sách User Stories của sprint đó, tự động sinh ra các thực thể `StickyNote` với:
  - `isPinned: true` (không bị dọn sạch khi chuyển round mới).
  - Tọa độ `x, y` được tính toán thông minh xếp thành các cột dọc bên trái Bàn Poker (Table Arena) với số lượng cột tự co giãn theo số lượng stories.
  - Mang đầy đủ metadata Jira: `key`, `summary`, `jiraUrl`, `issueType`, `storyPoints`.
- Cả phòng và toàn bộ Sticky Notes được lưu trữ đồng thời trong cơ sở dữ liệu ngay khi khởi tạo, đảm bảo tính nhất quán tuyệt đối và hiển thị tức thì khi người tham gia vào phòng.

### 3. Biểu diễn User Story bằng Canvas Sticky Notes (`User Story Sticky Note`)
- Mỗi User Story Jira được thể hiện bằng một thẻ nốt dán tương tác cao trên canvas, mang phong cách nhận diện Jira (màu sắc phân biệt, mã ticket có link trực tiếp, huy hiệu loại issue).
- Người điều phối có thể bắt đầu ước lượng một story bằng cách:
  - Bấm nút *"Ước lượng"* trực tiếp trên thẻ Sticky Note, HOẶC
  - Kéo thả thẻ Sticky Note vào khu vực Bàn Poker (Table Arena).
- Thao tác này sẽ tự động thiết lập chủ đề vòng (`currentRound.topic`) theo thông tin của Story.

### 4. Nút Đồng bộ Điểm vào Jira nằm trong Dock Điều phối (`Unified Deck Dock`)
- Khi vòng ước lượng kết thúc và đạt điểm đồng thuận (`consensus`), nút **"Đồng bộ vào Jira"** sẽ xuất hiện đồng bộ trong thanh tác vụ điều phối nổi cạnh các nút Lật bài, Vote lại, Vòng tiếp theo.
- Nút này hỗ trợ Facilitator xem lại và ghi đè điểm (`Story Point Override`) trước khi gửi xác nhận lên Jira.

### 5. Dọn dẹp Mã nguồn Lỗi thời (Code Retirement)
- Gỡ bỏ hoàn toàn `StoryNavigationBar` và `JiraImportModal` khỏi giao diện phòng.
- Loại bỏ các socket events và state thừa liên quan đến hàng đợi backlog dạng tuần tự, chuyển toàn bộ luồng tương tác sang hệ thống Canvas Sticky Notes.

## Consequences
### Tích cực
- **Trải nghiệm trực quan vượt trội**: Toàn bộ sprint backlog hiện hữu sống động trên canvas; người tham gia có thể zoom, pan, kéo thả note như một bảng dán việc thực tế.
- **Tiết kiệm thao tác**: Tạo phòng là có sẵn ticket, tên phòng tự điền, sẵn sàng bắt đầu ước lượng ngay lập tức.
- **Hỗ trợ Future Sprints**: Phục vụ chính xác các buổi Sprint Planning cho sprint sắp tới.
- **Kiến trúc tinh gọn**: Tận dụng triệt để năng lực của hệ thống Sticky Notes có sẵn thay vì duy trì 2 hệ thống hiển thị song song.

### Cần lưu ý
- Nếu một sprint có số lượng User Stories rất lớn (ví dụ > 50 tickets), thuật toán bố trí layout cần chia thành nhiều cột dọc để không làm kéo dài canvas quá mức.
