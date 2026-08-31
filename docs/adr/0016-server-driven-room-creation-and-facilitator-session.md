# 16. Server-Driven Room Creation, Readable Room Codes, and Facilitator Session Persistence

Date: 2026-08-31

## Status

Accepted

## Context

Previously, the frontend room creation modal (`create-room-modal.tsx`) simulated room creation by generating client-side mock codes (e.g. `PT-XXXX` via `Math.random()`) and storing them only in the local Zustand store (`addRecentRoom`), without persisting a real room aggregate on the backend.

Meanwhile, the backend already implemented Clean Architecture / DDD endpoints (`POST /api/rooms`) returning a room projection and a secret `facilitatorKey`, but generated raw 8-character hex IDs (`crypto.randomBytes(4).toString('hex')`).

This caused several inconsistencies:
1. **Disconnected State**: Creating a room on the frontend did not actually create a room aggregate in the backend database.
2. **Inconsistent Room Codes**: The frontend UI and join modal expected alphanumeric/prefixed codes while backend generated hex strings.
3. **Facilitator Key Loss Risk**: Reloading the frontend browser could cause the host/facilitator to lose control over estimation rounds if not persisted securely.
4. **Missing Room Routing**: No dedicated TanStack Router route `/rooms/$roomId` existed to navigate users immediately into their estimation session.

## Decision

1. **Server-Driven Room Creation via Mutation**:
   - The frontend `CreateRoomModal` invokes `POST /api/rooms` using a type-safe mutation (`useCreateRoomMutation` via `http-client.ts`).
   - The backend `CreateRoomUseCase` creates the `Room` aggregate root, persists it via `RoomRepository`, and returns the `RoomProjection` along with `facilitatorKey`.

2. **Standardized Human-Readable Room Code Generator**:
   - Backend room IDs are generated as short, uppercase, unambiguous alphanumeric codes (e.g., `PT-8492` or 6-char `ABC-DEF` using a custom charset excluding confusing characters like `0, O, 1, I, L`).
   - Repository-level collision retry loops ensure uniqueness before persistence.

3. **Hybrid Facilitator Authorization & Session Persistence**:
   - For authenticated users (Firebase Auth), the facilitator is bound to their `uid`.
   - For guest users or local session persistence across browser reloads, `facilitatorKey` is mapped by `roomId` and persisted in `localStorage` (`pointify_facilitator_keys`).
   - Frontend room state initializes with the cached `facilitatorKey` for the active room.

4. **Direct Route Navigation and Streamlined Join Flow**:
   - Successful room creation automatically pushes to the recent rooms history and navigates directly to `/rooms/$roomId` via TanStack Router.
   - When accessing `/rooms/$roomId` via a direct link:
     - Authenticated users join automatically using their Firebase profile (Display Name and Avatar).
     - Guests with a saved display name join automatically or with one-click confirmation.
     - New guests are prompted with an inline display name input before entering the estimation board.

## Consequences

- **Positive**: Complete synchronization between frontend state and backend DDD domain aggregates.
- **Positive**: Intuitive, easy-to-share room codes suitable for desktop and mobile devices.
- **Positive**: Facilitators retain control even after browser refreshes or network reconnections.
- **Positive**: Clear path for direct invitation links and smooth onboarding for agile team members.
