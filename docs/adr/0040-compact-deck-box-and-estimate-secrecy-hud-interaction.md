# ADR 0040: Compact Deck Box & Estimate Secrecy HUD Interaction System

## Status
Accepted

## Context
Trong các phiên bản trước (ADR 0023 và ADR 0026), thanh chọn lá bài (`RoomDeckDock`) sử dụng dải lá bài trải ngang (`Physical Poker Card Strip`) chiếm phần lớn chiều rộng phía dưới màn hình (~600px - 800px).
Mặc dù trực quan, mô hình dải bài trải ngang liên tục bộc lộ các hạn chế:
1. **Chiếm dụng không gian Canvas**: Dải bài dài che mất các `ParticipantNode` ở nửa dưới bàn poker và các phần tử tương tác khác.
2. **Thiếu cảm giác đóng hộp vật lý**: Bộ bài thật trong phòng họp thường nằm gọn trong một hộp đựng bài (Deck Box), người chơi rút bài hoặc mở hộp khi cần ước lượng.
3. **Bảo mật ước lượng (Estimate Secrecy)**: Khi một lá bài được chọn trên thanh dock cố định, nếu người ngồi bên cạnh hoặc người chia sẻ màn hình nhìn vào, con số điểm có thể bị lộ nếu không có cơ chế che giấu tinh tế.

Sau phiên phỏng vấn thiết kế 3 vòng (**Grilling & Domain Modeling**), đội ngũ quyết định tích hợp component `@beui/project-folder` từ thư viện **beUI** thành **Compact Deck Box (Hộp bộ bài thu gọn)** trên thanh dock HUD của phòng ước lượng.

---

## Decision

### 1. Thu gọn Tỉ lệ Công thái học (Ergonomic Compact Footprint)
- Thu gọn kích thước gốc của component `ProjectFolder` từ `w-72 h-56` về kích thước công thái học `size="sm"` (`w-44 h-32` với thẻ bài preview `w-16 h-24`).
- Tích hợp êm ái vào góc trái của thanh dock điều phối (`RoomDeckDock`), giúp giải phóng hơn 70% không gian chân màn hình cho canvas bảng trắng.

### 2. Quạt Bài Úp Mặt 3D (Face-down 3D Fan Preview)
- Khi ở trạng thái đóng trên dock, quạt xòe 5 lá bài tượng trưng mang thiết kế **Ribbed Textured Card Back** (vân sọc dập nổi dọc với gradient ONE Magenta và thương hiệu One Tech Stop).
- **Không lật bài sang mặt trước khi hover**: Giữ trọn vẹn cảm giác cỗ bài úp mặt vật lý kín đáo trong hộp bài.

### 3. Nguyên tắc Bảo mật Ước lượng (Estimate Secrecy Enforcement)
- Khi người tham gia chọn một lá bài:
  - Lá bài chính giữa (vị trí thứ 3 trong 5 lá quạt xòe) nhô cao hơn nhẹ và mang đường viền sáng ONE Magenta (`ring-2 ring-[#E31C79]`).
  - Dòng trạng thái bên dưới hộp cập nhật thành `"Đã chọn bài"` (`Selected`).
  - **Tuyệt đối không hiển thị con số giá trị điểm** trên thanh dock ở trạng thái thu gọn, đảm bảo không bị lộ điểm số khi chia sẻ màn hình hoặc ngồi cùng phòng họp vật lý trước khi Facilitator lật bài.

### 4. Modal Mở rộng Toàn diện (Persistent Full-Deck Overlay)
- Click vào Hộp bộ bài để bung modal overlay:
  - Render đầy đủ toàn bộ các lá bài của bộ bài đang hoạt động (ví dụ Fibonacci từ 0 đến ☕).
  - Các lá bài tuân thủ tỷ lệ vàng 2:3 chuẩn Poker (`PokerStoryCard` mặt trước), đầy đủ corner index, viền hairline vàng, hình khối container ONE và nhãn độ phức tạp (Subtitle).
- **Tương tác giữ mở (Persistent Picker)**:
  - Chọn lá bài cập nhật realtime vào phiên làm việc, highlight viền Magenta + badge `✓` + header hiển thị `Đã chọn: [X] điểm`.
  - Click lá khác để đổi điểm; click lại lá cũ để hủy chọn (bỏ vote).
  - Modal giữ mở để người dùng cân nhắc, chỉ đóng khi click nút `✕`, click backdrop hoặc phím `Esc`.

### 5. Vô hiệu hóa Khi Kết thúc Vòng (Disabled State)
- Khi vòng ước lượng đã được lật bài (`isRoundRevealed`) hoặc khi tài khoản mang vai trò Người quan sát (`isSpectator`): Hộp bộ bài tự động bị mờ và khóa tương tác (`disabled={true}`).

---

## Consequences
### Tích cực
- **Không gian tinh gọn, đẳng cấp**: Thanh dock nhẹ nhàng, dành trọn vẹn sự chú ý cho Bàn ước lượng và linh vật 3D suy nghĩ.
- **Tính vật lý và chuyển động chân thực**: Hiệu ứng quạt bài 3D từ beUI mang lại cảm giác mở cỗ bài thực tế.
- **Bảo mật tuyệt đối**: Đảm bảo không ai có thể nhìn lén điểm số của người khác trước khi có lệnh lật bài từ Facilitator.

### Cần lưu ý
- Thao tác chọn bài cần 1 click mở hộp nếu modal đang đóng. Đối với người dùng thích thao tác 1 chạm, modal hỗ trợ giữ mở hoặc phím tắt Esc đóng nhanh.
