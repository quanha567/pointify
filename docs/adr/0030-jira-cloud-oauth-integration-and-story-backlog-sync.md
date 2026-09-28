# ADR 0030: Jira Cloud OAuth Integration & Room Story Backlog Sync

## Status
Accepted

## Context
Trong các quy trình phát triển phần mềm linh hoạt (Agile / Scrum), Jira Software (Atlassian) là công cụ quản lý dự án và Backlog phổ biến hàng đầu. Khi tổ chức các phiên họp ước lượng Scrum Poker trên Pointify (`Room`), các đội ngũ gặp phải các trở ngại lớn khi không có liên kết với Jira:
1. **Thao tác thủ công lãng phí thời gian**: Người điều phối (`Facilitator`) phải copy từng mã Issue, tóm tắt và tiêu chí nghiệm thu từ Jira dán vào ô chủ đề (`topic`) của Pointify.
2. **Nguy cơ sai lệch dữ liệu sau ước lượng**: Sau khi cả đội đạt kết quả đồng thuận (`Consensus`), Facilitator phải chuyển tab sang Jira để gõ lại điểm Story Points cho từng ticket. Quá trình này dễ gây sai sót, bỏ quên ticket hoặc mất nhịp độ của buổi họp.
3. **Thiếu cái nhìn tổng quan về tiến trình Sprint**: Thành viên trong phòng không nắm được còn bao nhiêu User Story cần ước lượng trong buổi họp, câu chuyện tiếp theo là gì, hay các story đã hoàn thành trước đó đạt bao nhiêu điểm.

Chúng tôi đã cân nhắc các phương án kiến trúc:
- **Xác thực**: Giữa việc dùng Personal API Token ở cấp độ từng Room (kém bảo mật, buộc user tạo token thủ công phức tạp) và chuẩn Atlassian OAuth 2.0 (3LO) ở cấp độ Tài khoản (`Account`).
- **Phạm vi dữ liệu**: Giữa việc chỉ nhập từng Issue đơn lẻ vào `topic` chuỗi và việc đưa vào một Hàng đợi Story của Phòng (`Room Story Backlog`) nạp trực tiếp từ Sprint đang hoạt động (`Jira Active Sprint`).
- **Cơ chế ghi ngược điểm**: Giữa việc tự động đẩy điểm ngay khi đạt Consensus và việc cung cấp nút bấm thủ công 1-click kèm khả năng tinh chỉnh điểm trước khi ghi (`Story Point Override`).

## Decision
Chúng tôi quyết định hiện thực hóa tính năng **Liên kết Jira Cloud qua OAuth & Đồng bộ Hàng đợi Story Phòng (Jira Cloud OAuth Integration & Room Story Backlog Sync)** theo các nguyên tắc kiến trúc sau:

### 1. Chuẩn Xác thực Atlassian OAuth 2.0 (3LO) ở Cấp độ Tài khoản (`Account Profile`)
- Sử dụng Atlassian OAuth 2.0 3-legged flow với các quyền tối thiểu cần thiết (`read:jira-work`, `write:jira-work`, `read:jira-user`, `offline_access`).
- Lưu trữ Access Token, Refresh Token mã hóa và danh sách Atlassian Cloud Sites (`accessible-resources`) an toàn tại backend trong thực thể liên kết tài khoản. Tự động xử lý cơ chế làm mới token khi hết hạn.
- Cung cấp giao diện quản lý liên kết dịch vụ trong trang Hồ sơ cá nhân (`Account Profile`), cho phép kiểm tra trạng thái kết nối, tên miền Jira Cloud và tùy chọn ngắt kết nối an toàn.

### 2. Tách biệt Bounded Context `contexts/jira` ở Backend (Clean Architecture & Hexagonal Ports)
- Để giữ mã nguồn tinh gọn, tuân thủ nguyên tắc Deep Modules và không làm phình to `contexts/room` hay `contexts/identity`:
  - `domain/`: Định nghĩa thực thể `JiraConnection`, giá trị `JiraIssue`, `JiraSprint`, `JiraBoard`.
  - `application/`: Các Use Cases xử lý xác thực OAuth (`ConnectAtlassianAccountUseCase`), truy vấn danh sách Cloud Sites, lấy Active Sprint và danh sách Issues, cập nhật Story Points (`SyncStoryPointsUseCase`).
  - `infrastructure/`: Triển khai `AtlassianOAuthClient` và `JiraAgileClient` giao tiếp trực tiếp với Jira Cloud REST API v3 và Agile API v1.
  - `presentation/`: `JiraController` phục vụ các API RESTful cho frontend.
- `contexts/room` chỉ tương tác với Jira thông qua cổng giao tiếp lỏng (`JiraGateway`), tách rời hoàn toàn chi tiết kỹ thuật của Atlassian API.

### 3. Mô hình Hàng đợi Story của Phòng (`Room Story Backlog`) & Đồng bộ Realtime
- Bổ sung cấu trúc `storyBacklog: JiraStoryItem[]` vào `RoomAggregate`:
  - Mỗi phần tử lưu trữ: `id`, `key` (VD: `PROJ-123`), `summary`, `issueType`, `priority`, `status` (`pending` | `estimating` | `estimated` | `skipped`), `estimatedStoryPoints`, và `jiraUrl`.
  - Nạp dữ liệu từ **Sprint đang hoạt động (`Jira Active Sprint`)** của Board mà Facilitator lựa chọn.
- **Đồng bộ thời gian thực toàn phòng**: Trạng thái của toàn bộ Hàng đợi Story được lưu trữ trong `Room` và broadcast qua WebSocket `room:sync`. Tất cả Thành viên (`Participant`) trong phòng đều theo dõi được danh sách story, story đang được bàn luận và tiến độ ước lượng của cả buổi.

### 4. Cơ chế Đồng bộ Điểm 1-Chạm (`Story Point Sync`) & Tự động Nhận diện Trường
- Điểm ước lượng được ghi vào Jira thông qua nút bấm chủ động **"Đồng bộ điểm vào Jira"** do Facilitator kích hoạt sau khi vòng lật bài có kết quả đồng thuận.
- **Khả năng tinh chỉnh (`Story Point Override`)**: Facilitator có quyền xem lại và điều chỉnh con số cuối cùng (ví dụ làm tròn số lẻ hoặc thống nhất lại) trước khi bấm gửi.
- **Tự động nhận diện trường với Fallback**: Hệ thống ưu tiên cập nhật qua Jira Software Agile Estimation API (`/rest/agile/1.0/issue/{key}/estimation`); nếu không khả dụng, hệ thống tự động quét metadata để tìm trường `customfield` tương ứng với Story Points. Chỉ đồng bộ khi điểm là giá trị số hợp lệ.

### 5. Bộ điều hướng Story (`Story Navigation Controls`) & Quy tắc Ước lượng lại
- Cung cấp thanh điều hướng tinh gọn gồm nút `[< Prev]`, dropdown chuyển nhanh Story, `[Next >]`.
- **Chuyển vòng liền mạch**: Khi Facilitator chọn story tiếp theo, hệ thống tự động lưu kết quả vòng cũ, cập nhật trạng thái story sang `estimating`, tạo vòng mới với thông tin Jira Issue liên kết và reset bài của mọi người về trạng thái úp.
- **Ước lượng lại (`Re-estimate`)**: Khi chuyển lại story đã ước lượng trước đó (`status: estimated`), hệ thống hiển thị lại điểm số và thông tin cũ, cho phép cả đội thảo luận lại và ghi đè điểm số mới nếu cần.

### 6. Bố cục Giao diện Tinh gọn (Lean UI / Non-invasive Canvas)
- Giữ Bảng trắng phòng (`Room Canvas Shell`) thoáng đãng, không đưa các bảng biểu cồng kềnh lên canvas.
- Sử dụng Modal/Dialog nạp backlog và một thanh điều hướng thu gọn gắn cạnh thanh công cụ điều phối, tối ưu hóa không gian cho bàn Poker và các vị trí ngồi của thành viên.

## Consequences
- **Ưu điểm**:
  - Tự động hóa hoàn toàn luồng nghiệp vụ Sprint Planning, loại bỏ 100% công đoạn copy-paste thủ công.
  - Bảo mật tối đa nhờ chuẩn Atlassian OAuth 2.0, không để lộ API Token cá nhân trong Room.
  - Kiến trúc Bounded Context sạch sẽ, phân tách rạch ròi trách nhiệm giữa `jira` và `room`, dễ dàng bảo trì và mở rộng.
  - Trải nghiệm cộng tác minh bạch, mọi thành viên trong phòng đều nắm bắt được tiến độ của toàn bộ Active Sprint.
- **Thách thức**:
  - Cần cấu hình Atlassian Developer App (`CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`) trong môi trường backend.
  - Cần xử lý cẩn thận trường hợp token OAuth hết hạn giữa chừng trong buổi họp bằng cơ chế tự động refresh token ngầm.
