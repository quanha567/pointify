# Pointify

Pointify is a real-time collaborative Scrum Poker (Planning Poker) application for agile teams to estimate effort accurately and smoothly.

## Language

### Core Concepts & Bilingual Mapping

| English Term | Vietnamese Term | Meaning & Context | Avoid (Tránh dùng) |
| :--- | :--- | :--- | :--- |
| **Room** | **Phòng** | Live collaborative estimation session | Session, board, meeting, table, phiên, bàn |
| **Facilitator** | **Người điều phối** | Participant who controls room state, rounds, cards | Host, admin, moderator, owner, chủ phòng |
| **Participant** | **Thành viên** | Person present in room (estimator or spectator) | User, member, voter, attendee, người chơi |
| **Deck** | **Bộ bài** | Preset sequence of values for estimation | Card set, scale, preset, thang điểm, hệ điểm |
| **Card** | **Lá bài** | Specific estimable value in a Deck | Point, vote, ticket, badge, điểm, ticket |
| **Estimate** | **Ước lượng** | Submission of a Card by a Participant | Vote, score, bet, point, bình chọn, chấm điểm |
| **Round** | **Vòng ước lượng** | Single cycle from card selection to reveal & reset | Turn, game, sprint, lượt chơi, ván bài |
| **Account** | **Tài khoản** | Authenticated user profile with persistent rooms and settings | Profile, member, user record |
| **Account Profile** | **Hồ sơ tài khoản** | Persistent user profile record stored in Firestore (email, display name, avatar, metadata) | User settings, user data, thông tin cá nhân |
| **Administrator** | **Quản trị viên** | Privileged user authorized to manage system accounts, configurations, and monitor rooms | Superuser, root, mod, admin chung |
| **Account Management** | **Quản lý tài khoản** | Admin operations to search, filter, view, create, edit, or modify account roles/status | User CRUD, user table |
| **Virtual Data Table** | **Bảng dữ liệu ảo hóa** | High-performance AG-Grid-style grid supporting row virtualization, column pinning, resizing, multi-sort, and filtering | Basic table, static table, HTML table |
| **Guest Participant** | **Thành viên khách** | Unauthenticated participant identified only by display name in a room | Anonymous user, temp user |
| **Authentication** | **Xác thực** | Identity verification process (Login, Register, Logout) via Firebase | Login flow, signin |
| **Facilitator Key** | **Khóa điều phối** | Secret token granting facilitator privileges to manage room states and rounds | Admin token, host secret |
| **Room Code** | **Mã phòng** | Short, human-readable unique identifier for room access and sharing (e.g., PT-8492) | Room number, PIN, hash, mã số phòng |
| **Claim Facilitator** | **Nhận quyền điều phối** | Action allowing an active participant to take over facilitator role after inactivity timeout | Steal host, take admin |
| **Command Palette** | **Bảng điều khiển lệnh** | Global search and quick navigation modal activated via keyboard shortcut (Cmd+K / Ctrl+K) | Search bar, omnibox, thanh tìm kiếm |
| **Admin Shell** | **Khung quản trị** | Fullscreen layout shell with collapsible sidebar, dynamic breadcrumbs, and command bar | Admin page, admin frame, layout quản trị |
| **Room Canvas Shell** | **Khung bảng trắng phòng** | Fullscreen infinite whiteboard canvas layout powered by `@xyflow/react` without public header/footer | Room page, canvas container |
| **Table Arena Node** | **Node Bàn ước lượng** | Central interactive poker table node on the canvas displaying topic, round status, voting progress, and consensus results | Center box, table component |
| **Participant Node** | **Node Thành viên** | Satellite node positioned around the table representing a participant and their card/estimation state | User node, player box |
| **Deck Hand Dock** | **Thanh chọn lá bài nổi** | Bottom floating dock for quick selection of estimate cards | Card picker, bottom bar |
| **Facilitator Action Bar** | **Thanh tác vụ điều phối nổi** | Floating controls for the facilitator to reveal cards, restart rounds, or clear votes | Admin toolbar, control bar |
| **Estimator** | **Thành viên ước lượng** | Active participant with voting rights who submits estimation cards | Voter, player, voter member |
| **Spectator** | **Người quan sát** | Passive participant who views the estimation session without voting rights | Watcher, observer, guest viewer |
| **Estimate Secrecy** | **Tính bảo mật ước lượng** | Security guarantee that card values are strictly masked on the server until the facilitator reveals | Vote privacy, hidden cards, server-side masking |
| **Thinking Mascot** | **Linh vật suy nghĩ** | Animated 3D mascot (26 diverse animals: Cat, Corgi, Panda, Hamster, Rabbit, Bear, Koala, Fox, Lion, Tiger, Monkey, Penguin, Chick, Owl, Otter, Frog, Pig, Unicorn, Dragon, Husky, Squirrel, Dolphin, Giraffe, Hedgehog, Turtle, Elephant) representing an estimator contemplating their card | Thinking animal, pet avatar, con vật suy nghĩ, avatar chờ |
| **Preset Mascot Avatar** | **Ảnh đại diện linh vật cài sẵn** | Curated closed-set mascot avatar collection exclusively used for account profiles to ensure brand consistency and content safety | Custom avatar URL, uploaded avatar, ảnh ngoài |
| **Personalized Mascot Projection** | **Đồng bộ linh vật cá nhân** | Real-time mapping of an authenticated estimator's chosen preset avatar onto their seat node and thinking mascot in the poker room | Avatar sync, seat icon, avatar phòng |
| **Admin Overview Dashboard** | **Dashboard Tổng quan Quản trị** | Central analytics and monitoring hub within Admin Shell displaying aggregate account metrics, room activities, and estimation trends | Statistics page, admin analytics, trang thống kê |
| **Metric Card** | **Thẻ chỉ số** | At-a-glance summary KPI card displaying current total, percentage growth compared to previous period, and visual indicator badge | Stat card, KPI card, thẻ đo lường |
| **Estimation Activity Trend** | **Xu hướng hoạt động ước lượng** | Time-series visualization illustrating the frequency of rooms created and rounds estimated over selectable time ranges (7d, 30d, 90d) | Activity chart, biểu đồ ước lượng, lịch sử |
| **Deck Distribution** | **Phân bổ bộ bài** | Categorical breakdown of estimation scales/presets chosen across all rooms (Fibonacci, T-Shirt, Modified Fibonacci) | Deck stats, loại bộ bài, biểu đồ bài |
| **Unified Deck Dock** | **Thanh dock chọn bài và điều phối hợp nhất** | Bottom floating dock combining estimation cards and facilitator action controls in a unified ergonomic container | Card bar, bottom control panel |
| **Seat Pedestal** | **Bệ ghế thành viên** | Subtle illuminated ambient disc beneath a participant's node and mascot anchoring them to their position around the poker table | Seat circle, avatar glow, chân đế |
| **Invite Participant Dialog** | **Hộp thoại mời thành viên** | Dedicated modal displaying room code, direct join URL, dynamic QR code, and formatted invite templates | Share popup, invite window, bảng mời |
| **Room QR Code** | **Mã QR phòng** | High-contrast scannable 2D barcode encoding the direct room entry link with embedded brand mark | QR image, scan code, mã vạch |
| **Physical Poker Card Strip** | **Dải lá bài Poker vật lý** | Bottom floating deck rendering authentic scaled physical poker cards featuring dual corner indices, golden inner hairline border, English complexity subtitles, and stepped container graphics | Card bar, capsule buttons, dải bài |
| **Ribbed Textured Card Back** | **Mặt sau lá bài vân sọc dập nổi** | Face-down card design featuring tactile vertical ribbed texture, vivid magenta gradient, and One Tech Stop gear brand mark | Pink back, card back, mặt úp |
| **Poker Story Point Card Front** | **Mặt trước lá bài chuẩn Poker** | Face-up card layout featuring dual corner indices, golden inner hairline border, central story point value, subtitle, and visual container graphic | Face-up card, front card, mặt mở lá bài |
| **Container Metaphor Stack** | **Hình họa khối container ước lượng** | Stepped visual stack of shipping containers depicting the relative weight, complexity, and cargo volume of an estimated story point | Container pyramid, card graphic, hình khối hàng |
| **Story Point Subtitle** | **Nhãn ý nghĩa độ phức tạp** | Concise agile complexity descriptor underneath the story point numeral (e.g., "Risk & big story", "Tiny", "Complex") | Card description, point meaning, nhãn giải thích |
| **Room Settings Dialog** | **Hộp thoại Cài đặt Phòng** | Tabbed configuration modal allowing participants to manage personal preferences (language, role) and facilitators to configure room metadata (room name, estimation deck) | Config modal, room preferences, popup cài đặt |
| **Round Countdown Timer** | **Đồng hồ đếm ngược vòng** | Server-synchronized time countdown set by Facilitator to bound an estimation round, displaying on Table Arena Node and Unified Deck Dock | Clock, stopwatch, bộ đếm giờ, timer |
| **Unified Poker Story Card** | **Lá bài chuẩn Poker đa năng** | Standardized double-sided 3D card primitive with golden 2:3 aspect ratio, supporting seamless GPU flip transitions across seat nodes, table arena, and dock | Basic card, custom card div |
| **Consensus Story Point Card** | **Lá bài Kết quả Đồng thuận** | Featured large estimation card prominently presented at the center of the Table Arena Node surrounded by an emerald aura when consensus is achieved | Winner card, big card |
| **Sticky Note** | **Thẻ ghi chú dán** | Collaborative post-it note created on the room canvas containing text, color, author attribution, and pin status | Note, memo, card, giấy ghi chú, tờ note |
| **Sticky Note Node** | **Node Thẻ ghi chú dán** | Interactive canvas node rendered on the room canvas representing a draggable Sticky Note with inline editing and color palette | Note box, sticky element, note node |
| **Pinned Sticky Note** | **Thẻ ghi chú ghim cố định** | Sticky note marked as pinned that persists across estimation rounds, whereas unpinned notes reset with the round | Permanent note, ghim note, note giữ lại |
| **Sticky Note Stack** | **Xấp thẻ ghi chú dán** | Bottom-left screen dock element mimicking a pad of colorful sticky notes from which participants can drag fresh notes onto the canvas | Note dock, note dispenser, khay note, xấp giấy |
| **Archived Round Notes** | **Ghi chú lưu trữ theo vòng** | Historical collection of unpinned sticky notes archived along with a concluded estimation round's summary | Round notes history, note cũ, ghi chú lưu trữ |




