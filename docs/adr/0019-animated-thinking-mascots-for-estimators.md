# ADR 0019: Linh Vật Động Suy Nghĩ (Animated Thinking Mascots) Cho Thành Viên Ước Lượng

## Bối cảnh (Context)
Trong phiên họp Scrum Poker (Room Canvas), khi vòng ước lượng đang diễn ra và các thành viên (Estimator) chưa chọn lá bài (chưa estimate), giao diện hiện tại chỉ hiển thị một ô chữ nhật nét đứt mờ với chữ "Chờ" hoặc "Vắng". Giao diện này mang lại cảm giác tĩnh, đơn điệu và thiếu sinh động trong quá trình cả đội cùng suy nghĩ và ước lượng.

## Quyết định (Decision)
Thay thế placeholder thẻ bài tĩnh bằng **Linh vật suy nghĩ (Thinking Mascot)**:
1. **Vector SVG Động thuần React + `motion/react`**:
   - Sử dụng 100% SVG và animation của Framer Motion (`motion/react`), không phụ thuộc thư viện bên ngoài (zero bundle overhead so với các bộ Lottie/Wasm).
   - Đảm bảo hiệu năng 60fps trên React Flow canvas, tương thích hoàn toàn cả Light & Dark mode.
2. **Bộ sưu tập 6 Linh vật kinh điển (Deterministic Hash theo ID)**:
   - Gồm 6 linh vật: Mèo (Cat), Chó Corgi (Dog), Gấu (Bear), Cáo (Fox), Thỏ (Rabbit), Chim cánh cụt (Penguin).
   - Mỗi thành viên có 1 linh vật cố định trong suốt phiên dựa vào thuật toán hash chuỗi `participant.id`.
3. **Trạng thái hành vi (Mascot States)**:
   - **Đang suy nghĩ (Thinking)**: Linh vật đung đưa nhẹ (subtle wobble/breathing), đầu nghiêng, tai/đuôi cử động nhẹ kèm bong bóng suy nghĩ (thought bubble `💭` với 3 chấm nhấp nháy).
   - **Ngoại tuyến / Mất kết nối (Offline/Sleeping)**: Linh vật gục đầu ngủ, mờ (opacity thấp, grayscale) cùng bong bóng `Zzz...` thay vì text "Vắng".
   - **Chuyển cảnh khi nộp ước lượng (Magic Poof & Card Flip)**: Khi thành viên bấm chọn bài, linh vật giật mình nhảy spring-hop lên và xoay 3D biến thành lá bài úp (Face-down card).
   - **Cập nhật bài**: Khi đổi số điểm ước lượng, giữ nguyên lá bài úp với hiệu ứng rung nhẹ (wiggle), chỉ chuyển lại linh vật nếu hủy ước lượng (unvote).

## Hệ quả (Consequences)
- **Tích cực**:
  - Trải nghiệm bàn poker trở nên vui tươi, gần gũi và hấp dẫn hơn rất nhiều mà không làm phân tâm sự tập trung của phiên ước lượng.
  - Zero-dependency: không làm phình bundle size, không cần fetch file ngoài từ CDN.
- **Tiêu cực / Cần lưu ý**:
  - Cần viết cẩn thận các vector SVG bo tròn chuẩn tỉ lệ để các linh vật có tính thẩm mỹ cao và đồng bộ phong cách thiết kế.
