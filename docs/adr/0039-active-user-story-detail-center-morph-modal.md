# ADR 0039: Active User Story Detail & beUI Center Morph Modal Architecture

## Status
Accepted

## Context
Sau khi tối ưu hóa việc quản lý danh sách backlog vào **Story Backlog Drawer** (ADR 0038), thông tin của **Active User Story (User Story Đang ước lượng)** được đưa lên phần đầu của **Table Arena Node (Node Bàn ước lượng)**. Tuy nhiên, trước đây giao diện chỉ hiển thị tối giản gồm Mã Jira (`SCRUM-4`), Liên kết Jira, và Tiêu đề ngắn gọn (`Create Admin Page`).

Trong các buổi Scrum Poker thực tế, các thành viên trong nhóm thường xuyên cần:
1. Nhận biết tức thì **Loại issue** (Story, Bug, Task) và **Mức độ ưu tiên** (Priority: Highest, High, Medium, Low) mà không phải mở thêm tab ngoài.
2. Đọc chi tiết **Mô tả yêu cầu (Description)**, **Tiêu chí chấp nhận (Acceptance Criteria)**, và thông tin **Người phụ trách (Assignee)** để thảo luận về độ phức tạp kỹ thuật trước khi chọn lá bài ước lượng.
3. Không làm biến dạng hay phình to kích thước cố định của Bàn Arena trên Infinite Canvas (`@xyflow/react`), đồng thời đảm bảo modal xem chi tiết không bị co giật hay biến dạng khi zoom/pan canvas.

Sau 2 vòng phỏng vấn thiết kế (**Grilling & Domain Modeling**), đội ngũ đã thống nhất giải pháp hiển thị metadata phân loại nhanh trên Header của Bàn Arena và sử dụng hiệu ứng mở rộng từ tâm **beUI `CenterMorphModal`** để xem toàn bộ đặc tả của User Story.

---

## Decision

### 1. Phân cấp Thông tin Active User Story trên Bàn Arena (Table Arena Node)
- **Thông tin Nhận diện Nhanh trên Header**:
  - Đặt badge **Loại issue** (`issueType` - kèm icon tương ứng như Story, Bug, Task) và badge **Mức độ ưu tiên** (`priority` với màu semantic: Highest/High đỏ, Medium cam, Low xanh/slate) ngay cạnh badge Mã Jira (`SCRUM-4`).
  - Khi Facilitator đặt Topic thủ công (không liên kết Jira Issue), các badges này cùng nút xem chi tiết sẽ tự động ẩn để giữ Header tinh gọn.
- **Nút Kích hoạt Modal Chi tiết**:
  - Bổ sung một icon button tinh tế (`FileText` / `BookOpen` với tooltip *"Chi tiết User Story"*) nằm ngay sau mã Jira và các badges ở góc trên bên trái Header.

### 2. Tích hợp beUI `CenterMorphModal` (Motion Unfolding từ Tâm Bàn)
- **Hiệu ứng Unfolding từ Tâm**:
  - Áp dụng component `CenterMorphModal` từ registry **beUI** (`@beui/center-morph-modal` via `motion/react`).
  - Mặt modal bung mở mượt mà từ đúng tâm ra các cạnh với clip-path `inset(...)`, tạo cảm giác mượt mà và tập trung vào tâm điểm của bàn poker.
- **Portal Độc lập với Infinite Canvas**:
  - Render thông qua `createPortal` vào `document.body` (z-index `100`), hoàn toàn tách biệt khỏi ma trận biến đổi toạ độ zoom/pan của React Flow, giữ độ nét hoàn hảo trên mọi độ phân giải.
- **Kích thước Mở rộng Thân thiện Đọc nội dung (`max-w-lg` / 512px - `max-w-xl` / 576px)**:
  - Chiều rộng được điều chỉnh tăng từ mặc định 416px lên `512px - 576px`, chiều cao tối đa `max-h-[85vh]` với vùng cuộn dọc mượt mà cho phần Description & Acceptance Criteria.

### 3. Cấu trúc Nội dung bên trong `ActiveStoryDetailModal`
- **Header Modal**:
  - Hiển thị đầy đủ Badge Loại issue, Mã Jira kèm icon mở tab ngoài `↗`, Priority badge, Status badge, và Nút đóng (`X`) tròn nổi bật.
- **Tiêu đề User Story**:
  - Hiển thị tên đầy đủ của Story với typography đậm chuẩn `font-heading text-lg sm:text-xl text-foreground`.
- **Metadata Panel**:
  - **Người phụ trách (Assignee)**: Avatar bo tròn và tên hiển thị.
  - **Story Points hiện tại**: Điểm số Jira cũ (nếu có) hiển thị với font mono.
  - **Sprint Name**: Tên Sprint hiện tại (nếu có).
- **Khu vực Mô tả Chi tiết (Description & Acceptance Criteria)**:
  - Khung văn bản bo góc với nền `bg-muted/40 border border-border/60 p-4 max-h-[320px] overflow-y-auto`.
  - Hỗ trợ format xuống dòng, danh sách gạch đầu dòng rõ ràng, chuẩn phong cách ONE Container Frame.

### 4. Mở rộng Domain Model Backend (`LinkedJiraIssue`)
- Mở rộng interface `LinkedJiraIssue` trong `RoundProps` (`round.entity.ts`, `room.aggregate.ts`, `room.mapper.ts`) bao gồm:
  ```ts
  export interface LinkedJiraIssue {
    id: string;
    key: string;
    summary: string;
    url?: string;
    status?: string;
    currentStoryPoints?: number | string | null;
    issueType?: string;
    priority?: string;
    description?: string;
    assignee?: { displayName: string; avatarUrl?: string } | null;
    sprintName?: string | null;
  }
  ```
- Cập nhật `AtlassianOAuthClient` để query thêm các trường `description`, `issuetype`, `priority`, `assignee` trong API Atlassian JQL, đồng thời tự động chuyển đổi định dạng ADF (Atlassian Document Format) sang định dạng text/markdown trực quan.

---

## Consequences

### Tích cực
- **Cung cấp Toàn bộ Bối cảnh Kỹ thuật cho Dev**: Thành viên không còn phải chuyển qua lại giữa Jira và Pointify để đọc acceptance criteria hay tìm hiểu requirement.
- **Bảo toàn Thẩm mỹ & Tỷ lệ Bàn Arena**: Table Arena Node vẫn giữ nguyên kích thước chuẩn `620px x 340px`, không bị méo mó hay tràn viền.
- **Trải nghiệm Đỉnh cao với beUI**: Chuyển động center morph unfolding đem lại cảm giác hiện đại, chuẩn B2B Design cao cấp.

### Cần lưu ý
- Khi Jira API trả về trường `description` dưới dạng JSON Atlassian Document Format (ADF), cần có hàm chuyển đổi đệ quy an toàn để bóc tách plain text/markdown mà không làm gián đoạn việc parse dữ liệu.
