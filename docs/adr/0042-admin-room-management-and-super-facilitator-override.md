# 0042. Admin Room Management, Lifecycle Status, and Super Facilitator Override Architecture

Date: 2026-09-25

## Status

Accepted

## Context

The Pointify administrative portal previously lacked a dedicated Room Management interface. The navigation sidebar exposed an ambiguous `/admin/games` item (*"Ván bài"* in Vietnamese) alongside `/admin/rooms`, violating the domain glossary in `CONTEXT.md` which strictly forbids the term "game" and mandates "Room (Phòng)" and "Round (Vòng ước lượng)". Furthermore:
1. Administrators needed a comprehensive view to monitor all live and concluded estimation rooms across squads.
2. The core `Room` aggregate lacked an explicit lifecycle status (`status: 'active' | 'closed'`), relying on ad-hoc timestamps or client presence.
3. When squads experience facilitator absence or room stalls, administrators require direct intervention capabilities: both emergency remote actions (force reveal, force next round, force close) and the ability to join the room canvas directly as a recognized Facilitator without hunting down the private `facilitatorKey`.
4. The user interface required alignment with the ONE Tech Stop design system (ADR 0008, ADR 0035), utilizing TanStack Table v9 virtualization and an encapsulated Tabbed Detail Modal instead of a side sheet.

## Decision

1. **Route Standardization & Glossary Alignment**:
   - Establish `/admin/rooms` as the canonical route for Room Management (`admin.rooms.tsx`).
   - Remove `/admin/games` from the sidebar navigation. Add a redirect route at `/admin/games` pointing to `/admin/rooms` to maintain backwards compatibility with existing bookmarks.
   - Update `overview-recent-games.tsx` and i18n dictionaries to use "Phòng" / "Rooms" terminology consistently.

2. **Room Aggregate Lifecycle Status**:
   - Add explicit `status: 'active' | 'closed'` to the `Room` domain aggregate and Firestore persistence mapper.
   - Rooms default to `'active'` upon creation.
   - Closing a room (via facilitator or admin) transitions the status to `'closed'`, preventing further vote submissions and broadcasting a room-closure notification to all connected clients.
   - Rooms inactive for >24 hours with no connected participants are visually tagged as Stale in the admin interface.

3. **Super Facilitator Override & Administrative Takeover**:
   - Introduce administrative endpoints protected by `AdminAuthGuard`:
     - `GET /api/admin/rooms`: Paginated query with search (room code, room name), status filters (`active`, `closed`), and deck type filters.
     - `POST /api/admin/rooms/:id/close`: Immediate force-closure of a room.
     - `POST /api/admin/rooms/:id/takeover`: Validates administrator credentials and securely returns the room's current `facilitatorKey`. The frontend writes this key to `sessionStorage` (`pointify_facilitator_key_${roomId}`) and routes to `/rooms/${roomId}`, seamlessly granting the administrator full facilitator powers on the canvas whiteboard without altering the WebSocket protocol.
     - `DELETE /api/admin/rooms/:id`: Permanent deletion of invalid or test rooms.
     - `POST /api/admin/rooms/bulk-close` & `POST /api/admin/rooms/bulk-delete`: Atomic batch administrative actions.

4. **Frontend Architecture & Tabbed Modal Interface**:
   - Implement `AdminRoomsView` utilizing `DataTable` with row virtualization, JetBrains Mono room codes pinned left, and multi-select bulk action bars.
   - Implement `RoomDetailDialog` (encapsulated React 19 Ref-as-a-prop modal) structured into three tabs:
     - **Tab 1: Overview & Controls**: Room metadata, QR code, join URL, and emergency actions (Takeover, Force Close).
     - **Tab 2: Participants**: Participant list with mascot avatars, online indicators, spectator badges, and join timestamps.
     - **Tab 3: Round History**: Accordion list of completed rounds, linked Jira issues, consensus story points, and vote distributions.

## Consequences

- **Positive**: Strict adherence to the domain model (`CONTEXT.md`), eliminating terminology drift ("games").
- **Positive**: Zero breaking changes to the core WebSocket gateway; administrative takeover is achieved securely through standard facilitator key handoff.
- **Positive**: High observability and lifecycle control for administrators over all platform rooms.
- **Positive**: Reusable Virtual Data Table and modal patterns conforming to ONE Tech Stop enterprise standards.
