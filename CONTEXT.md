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
| **Claim Facilitator** | **Nhận quyền điều phối** | Action allowing an active participant to take over facilitator role after inactivity timeout | Steal host, take admin |

