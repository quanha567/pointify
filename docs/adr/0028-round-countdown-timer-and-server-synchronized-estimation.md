# ADR 0028: Round Countdown Timer & Server-Synchronized Estimation

## Status
Accepted

## Context
Trong các phiên họp Scrum Poker trực tuyến (`Room`), các đội ngũ phát triển thường gặp tình trạng thảo luận kéo dài hoặc chần chừ khi đưa ra điểm ước lượng (`Estimate`), làm gián đoạn nhịp điệu của buổi họp Sprint Planning. Người điều phối (`Facilitator`) cần một công cụ giới hạn thời gian (Time-boxing) trực quan, tin cậy để thúc đẩy thành viên chốt ý kiến nhanh chóng:
1. **Tính công bằng & Đồng bộ tuyệt đối (Fairness & Clock Drift Immunity)**: Nếu đồng hồ đếm ngược chỉ chạy cục bộ trên trình duyệt của từng người (`setInterval`), việc lệch giờ hệ điều hành hoặc độ trễ mạng sẽ khiến mỗi thành viên nhìn thấy số giây khác nhau; người tải lại trang (F5) hoặc vào phòng giữa chừng sẽ bị mất trạng thái timer.
2. **Trải nghiệm Thao tác Linh hoạt (Agile Ergonomics)**: Các buổi ước lượng đòi hỏi sự tùy biến cao: có task đơn giản chỉ cần 30s-1m, task phức tạp cần 3-5m, và khi thảo luận sôi nổi sắp hết giờ, Người điều phối cần có khả năng gia hạn nhanh (`+30s`) hoặc tạm dừng (`Pause`) mà không phải hủy toàn bộ vòng.
3. **Cảnh báo Đa giác quan không gián đoạn (Non-intrusive Sensory Feedback)**: Khi hết thời gian (`00:00`), việc tự động ép lật bài (`Auto-reveal`) có thể gây ức chế nếu thành viên gặp độ trễ mạng vài giây hoặc nhóm đang chốt câu nói cuối cùng. Cần cơ chế cảnh báo thị giác chuyển màu theo nhịp tim, kết hợp chuông ngân thanh tao (chime) và trao quyền lật bài cho Người điều phối.

## Decision
Chúng tôi quyết định thiết kế và hiện thực hóa tính năng **Đồng hồ đếm ngược vòng (Round Countdown Timer)** theo các nguyên tắc kiến trúc sau:

1. **Nguồn sự thật Đồng bộ qua Server Timestamp (Server-Synchronized Single Source of Truth)**:
   - Trạng thái timer được mô hình hóa trực tiếp trong thực thể `Round` thuộc `RoomAggregate`:
     - `durationSeconds`: Tổng thời gian của lượt đếm (giây).
     - `endsAt`: Mốc thời gian kết thúc tính theo UTC timestamp server (ms).
     - `status`: `'running' | 'paused'`.
     - `remainingSecondsOnPause`: Số giây còn lại tại thời điểm tạm dừng.
   - Khi Người điều phối kích hoạt hoặc điều chỉnh timer, server tính toán timestamp và broadcast `room:updated` qua WebSocket Socket.io. Toàn bộ client tính toán số giây còn lại tức thời theo công thức `Math.max(0, Math.ceil((timer.endsAt - now) / 1000))`, đảm bảo đồng bộ hoàn hảo tới từng mili-giây trên mọi thiết bị.

2. **Giao diện Bàn Đấu trường Thích ứng (Adaptive Arena Layout)**:
   - Trên `TableArenaNode`:
     - Khi timer ở trạng thái `idle`, bàn hiển thị 1 vòng tròn tiến độ ước lượng `AnimatedCircularProgressBar` (`0/2 ĐÃ CHỌN`) ở tâm bàn.
     - Khi timer được kích hoạt (`running` / `paused`), hệ thống sử dụng `motion/react` spring transition tách đôi layout thành 2 vòng tròn đối xứng: bên trái là tiến độ thành viên đã chọn, bên phải là vòng tròn đếm ngược thời gian với chỉ số số phút:giây `mm:ss` cỡ lớn.
     - Visual Color Grading: Vòng tròn đổi màu động qua 3 giai đoạn:
       - $> 50\%$ thời gian: Brand Magenta (`#d40d65`).
       - $20\% - 50\%$ thời gian: Cảnh báo vàng cam Amber (`#f59e0b`).
       - $< 20\%$ (hoặc $\le 10$s): Cảnh báo khẩn cấp Rose/Red (`#ef4444`) kết hợp nhịp thở nhẹ.
       - Khi chạm `00:00`: Viền đỏ nhấp nháy 3 nhịp và chuyển sang trạng thái hết giờ.

3. **Thanh Tác vụ Điều phối Nổi (Unified Facilitator Timer Controls)**:
   - Tích hợp trực tiếp trên dải điều phối `RoomDeckDock`:
     - Menu mở nhanh với 5 mốc preset chuẩn Scrum (`30s`, `1m`, `2m`, `3m`, `5m`) và ô nhập số phút tùy chỉnh.
     - Khi timer đang chạy: Hiển thị thời gian đếm ngược `⏳ mm:ss`, nút **Tạm dừng / Tiếp tục** (`Pause` / `Resume`), nút **Gia hạn nhanh** (`+30s`), và nút **Hủy** (`Cancel`).
   - Mọi thao tác đều được bảo vệ an toàn bằng `FacilitatorKey`.

4. **Chuông báo Âm thanh Nhẹ nhàng qua Web Audio API & Công tắc Mute Cục bộ**:
   - Sử dụng Web Audio API tích hợp sẵn trong trình duyệt để tổng hợp chuông chime 2 nốt hòa âm ($587\text{Hz} \rightarrow 880\text{Hz}$) khi hết giờ mà không cần tải file audio tĩnh từ mạng (0kb asset, zero network overhead, zero CORS/404 issues).
   - Trang bị công tắc Loa (Audio Mute Toggle) lưu cục bộ vào `localStorage` để từng thành viên chủ động bật/tắt âm thanh theo sở thích cá nhân.

5. **Vòng đời Tự động Dọn dẹp (Lifecycle Cleanliness)**:
   - Khi Người điều phối thực hiện lật bài (`room:reveal-cards`), làm mới vòng (`room:reset-round`), hoặc sang vòng mới (`room:next-round`), timer sẽ tự động dừng và trở về trạng thái `idle`, đưa mặt bàn trở lại trạng thái tập trung vào số liệu thống kê.

## Consequences
- **Ưu điểm**:
  - Triệt tiêu hoàn toàn hiện tượng lệch đồng hồ giữa các thành viên.
  - Giao diện sống động, cao cấp với hiệu ứng chuyển tiếp mượt mà và phân cấp trực quan rõ ràng.
  - Không tải thêm tài nguyên âm thanh tĩnh từ mạng.
  - Kiểm soát linh hoạt theo đúng thực tế phiên họp Scrum.
- **Thách thức**:
  - Cần đồng bộ chặt chẽ giữa frontend hook đếm `requestAnimationFrame` / `setInterval` với timestamp từ server để tránh re-render thừa thãi các component cha.
