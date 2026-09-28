# Admin Room Management & Super Facilitator Override Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the enterprise Admin Room Management portal (`/admin/rooms`), lifecycle status on Room aggregate, Super Facilitator Takeover mechanics, and tabbed inspection modal for Pointify, while deprecating the outdated `/admin/games` route.

**Architecture:** 
1. Backend: Enhance the `Room` aggregate with explicit `status: 'active' | 'closed'`, add `AdminRoomsController` with `AdminAuthGuard` in NestJS clean architecture, supporting pagination, search, lifecycle mutations, and secure takeover key retrieval.
2. Frontend: Implement `AdminRoomsView` with TanStack Table v9 row virtualization, URL search state synchronization, `RoomDetailDialog` (React 19 Ref-as-a-prop tabbed modal: Overview, Participants, Round History), and route redirection from `/admin/games` to `/admin/rooms`.

**Tech Stack:** NestJS, Cloud Firestore, React 19, TanStack Table v9, TanStack Router, TanStack Query, Tailwind CSS v4, Lucide React, Sonner.

**Spec:** [docs/adr/0042-admin-room-management-and-super-facilitator-override.md](file:///d:/projects/pointify/docs/adr/0042-admin-room-management-and-super-facilitator-override.md) and [CONTEXT.md](file:///d:/projects/pointify/CONTEXT.md).

## Global Constraints

- **Design System**: Industrial ONE Tech Stop aesthetic (Navy `#0B1B3D`, Accent Magenta `#E31C79`, 3px container frame, 6-8px radius, no pill buttons for form controls).
- **Typography**: `Inter Variable` for body/headings, `JetBrains Mono` for Room Codes and story points. Minimum 11px font size (`text-[11px]`).
- **React 19 Native**: Encapsulate Modal / Dialog state using `ref` as standard prop (Ref-as-a-prop with `useImperativeHandle`), zero state leakage to parent.
- **i18n Compliance**: 100% translation strings via `useTranslation('admin')`. Zero hardcoded English/Vietnamese in UI markup.
- **Verification Commands**:
  - Web: `bun run typecheck` and `bun run check`
  - Backend: `bun test` or `bun test:unit`

---

### Task 1: Add Lifecycle Status to Room Aggregate & Firestore Mapper (Backend)

**Files:**
- Modify: `pointify-backend/src/contexts/room/domain/room.aggregate.ts`
- Modify: `pointify-backend/src/contexts/room/infrastructure/mappers/room.mapper.ts`
- Test: `pointify-backend/src/contexts/room/domain/room.aggregate.spec.ts`

**Interfaces:**
- Consumes: `RoomProps`, `FirestoreRoomDoc`
- Produces: `Room.status` (`'active' | 'closed'`), `room.close(): Result<void, Error>`

- [x] **Step 1: Write the failing unit test for `room.close()`**

Add to `room.aggregate.spec.ts`:
```ts
it('should transition room status to closed when close() is called', () => {
  const room = createTestRoom();
  expect(room.status).toBe('active');
  const result = room.close();
  expect(result.isSuccess).toBe(true);
  expect(room.status).toBe('closed');
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `bun test pointify-backend/src/contexts/room/domain/room.aggregate.spec.ts`
Expected: FAIL with `room.status is undefined` or `room.close is not a function`.

- [x] **Step 3: Update `RoomProps`, `Room` aggregate, and `RoomMapper`**

In `room.aggregate.ts`:
```ts
export type RoomStatus = 'active' | 'closed';

export interface RoomProps {
  // ... existing props
  status?: RoomStatus;
}

// In Room class:
get status(): RoomStatus {
  return this.props.status ?? 'active';
}

close(): Result<void, Error> {
  if (this.props.status === 'closed') {
    return ok(undefined);
  }
  this.props.status = 'closed';
  this.props.updatedAt = Date.now();
  return ok(undefined);
}
```

In `room.mapper.ts`:
Add `status?: RoomStatus;` to `FirestoreRoomDoc`.
In `toPersistence(room: Room): FirestoreRoomDoc`: include `status: room.status`.
In `toDomain(doc: FirestoreRoomDoc): Room`: include `status: doc.status ?? 'active'`.

- [x] **Step 4: Run tests to verify they pass**

Run: `bun test pointify-backend/src/contexts/room/domain/room.aggregate.spec.ts`
Expected: PASS

- [x] **Step 5: Commit changes**

```bash
git add pointify-backend/src/contexts/room/domain/room.aggregate.ts pointify-backend/src/contexts/room/infrastructure/mappers/room.mapper.ts pointify-backend/src/contexts/room/domain/room.aggregate.spec.ts
git commit -m "feat(room): add lifecycle status and close method to Room aggregate"
```

---

### Task 2: Implement Admin Room Management Use Cases (Backend)

**Files:**
- Create: `pointify-backend/src/contexts/room/application/use-cases/admin-get-rooms.use-case.ts`
- Create: `pointify-backend/src/contexts/room/application/use-cases/admin-close-room.use-case.ts`
- Create: `pointify-backend/src/contexts/room/application/use-cases/admin-delete-room.use-case.ts`
- Create: `pointify-backend/src/contexts/room/application/use-cases/admin-takeover-room.use-case.ts`
- Create: `pointify-backend/src/contexts/room/application/dtos/admin-room.dto.ts`
- Test: `pointify-backend/src/contexts/room/application/use-cases/admin-get-rooms.use-case.spec.ts`

**Interfaces:**
- Consumes: `FirebaseService` / Firestore `rooms` collection, `IRoomRepository`
- Produces: `AdminGetRoomsUseCase.execute(query)`, `AdminCloseRoomUseCase.execute(id)`, `AdminDeleteRoomUseCase.execute(id)`, `AdminTakeoverRoomUseCase.execute(id)`

- [x] **Step 1: Define DTOs in `admin-room.dto.ts`**

```ts
export interface AdminRoomListItemDto {
  id: string;
  name: string;
  facilitatorId: string;
  facilitatorName: string;
  deckType: string;
  participantCount: number;
  onlineCount: number;
  currentRoundNumber: number;
  currentRoundStatus: string;
  totalRounds: number;
  status: 'active' | 'closed';
  isStale: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AdminGetRoomsQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'closed' | 'all';
  deckType?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminGetRoomsResponseDto {
  items: AdminRoomListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

- [x] **Step 2: Write failing unit test for `AdminGetRoomsUseCase`**

Create `admin-get-rooms.use-case.spec.ts` testing pagination and search filtering.

- [x] **Step 3: Implement `AdminGetRoomsUseCase` and mutation use cases**

Implement `AdminGetRoomsUseCase` reading from Firestore with search filtering (`name`, `id`), status filtering, and calculating `onlineCount` and `isStale` (`updatedAt < Date.now() - 24 * 3600 * 1000`).
Implement `AdminCloseRoomUseCase`: loads `Room`, calls `room.close()`, saves.
Implement `AdminDeleteRoomUseCase`: calls `roomRepository.delete(id)`.
Implement `AdminTakeoverRoomUseCase`: loads `Room`, returns `{ roomId: room.id, facilitatorKey: room.facilitatorKey.value }`.

- [x] **Step 4: Run unit tests to verify they pass**

Run: `bun test pointify-backend/src/contexts/room/application/use-cases/admin-get-rooms.use-case.spec.ts`
Expected: PASS

- [x] **Step 5: Commit changes**

```bash
git add pointify-backend/src/contexts/room/application/
git commit -m "feat(room): add admin room management use cases"
```

---

### Task 3: Create Admin Rooms Controller & Endpoints (Backend)

**Files:**
- Create: `pointify-backend/src/contexts/room/presentation/controllers/admin-rooms.controller.ts`
- Modify: `pointify-backend/src/contexts/room/room.module.ts`
- Test: `pointify-backend/src/contexts/room/presentation/controllers/admin-rooms.controller.spec.ts`

**Interfaces:**
- Consumes: Admin Use Cases from Task 2, `AdminAuthGuard`
- Produces: `GET /api/admin/rooms`, `GET /api/admin/rooms/:id`, `POST /api/admin/rooms/:id/close`, `POST /api/admin/rooms/:id/takeover`, `DELETE /api/admin/rooms/:id`, `POST /api/admin/rooms/bulk-close`, `POST /api/admin/rooms/bulk-delete`

- [x] **Step 1: Write controller test for `AdminRoomsController`**

Verify `GET /api/admin/rooms` delegates to `AdminGetRoomsUseCase` and endpoints require `AdminAuthGuard`.

- [x] **Step 2: Implement `AdminRoomsController`**

```ts
@ApiTags('Admin / Rooms')
@ApiBearerAuth('bearer')
@ApiCookieAuth('cookie')
@UseGuards(AdminAuthGuard)
@Controller('api/admin/rooms')
export class AdminRoomsController {
  // Implement GET, GET :id, POST :id/close, POST :id/takeover, DELETE :id, POST bulk-close, POST bulk-delete
}
```

- [x] **Step 3: Register controller and use cases in `RoomModule`**

In `room.module.ts`: add `AdminRoomsController` to `controllers`, and new use cases to `providers`.

- [x] **Step 4: Run backend tests and verify build**

Run: `bun run build` or `bun test` in `pointify-backend`.
Expected: PASS with no syntax or DI errors.

- [x] **Step 5: Commit changes**

```bash
git add pointify-backend/src/contexts/room/
git commit -m "feat(room): expose admin room management endpoints with AdminAuthGuard"
```

---

### Task 4: Define DTOs, API Client & TanStack Query Hook (Frontend)

**Files:**
- Create: `pointify-web/src/features/admin/types/admin-rooms.dto.ts`
- Create: `pointify-web/src/features/admin/api/admin-rooms.api.ts`
- Create: `pointify-web/src/features/admin/hooks/use-admin-rooms-query.ts`
- Create: `pointify-web/src/features/admin/hooks/use-admin-rooms-mutations.ts`

**Interfaces:**
- Consumes: `@/lib/api-client`
- Produces: `useAdminRoomsQuery(params)`, `useCloseRoomMutation()`, `useDeleteRoomMutation()`, `useTakeoverRoomMutation()`, `useBulkCloseRoomsMutation()`, `useBulkDeleteRoomsMutation()`

- [x] **Step 1: Define Zod Schemas & Types in `admin-rooms.dto.ts`**

```ts
import { z } from 'zod';

export const adminRoomItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  facilitatorId: z.string(),
  facilitatorName: z.string(),
  deckType: z.string(),
  participantCount: z.number(),
  onlineCount: z.number(),
  currentRoundNumber: z.number(),
  currentRoundStatus: z.string(),
  totalRounds: z.number(),
  status: z.enum(['active', 'closed']),
  isStale: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type AdminRoomItem = z.infer<typeof adminRoomItemSchema>;
```

- [x] **Step 2: Implement API functions in `admin-rooms.api.ts`**

`getAdminRooms(params)`, `getAdminRoomDetail(id)`, `closeAdminRoom(id)`, `takeoverAdminRoom(id)`, `deleteAdminRoom(id)`, `bulkCloseRooms(ids)`, `bulkDeleteRooms(ids)`.

- [x] **Step 3: Implement Query & Mutation hooks**

Create `useAdminRoomsQuery` using TanStack Query with `staleTime: 10_000`.
Create mutation hooks invalidating `['admin', 'rooms']` on success and displaying `sonner` toast notifications.

- [x] **Step 4: Verify typecheck**

Run: `bun run typecheck` in `pointify-web`.
Expected: PASS

- [x] **Step 5: Commit changes**

```bash
git add pointify-web/src/features/admin/types/admin-rooms.dto.ts pointify-web/src/features/admin/api/admin-rooms.api.ts pointify-web/src/features/admin/hooks/
git commit -m "feat(admin): add admin rooms DTOs, API client and query hooks"
```

---

### Task 5: Build UI Components (Badges, Columns, Bulk Actions, Detail Dialog) (Frontend)

**Files:**
- Create: `pointify-web/src/features/admin/components/room-status-badge.tsx`
- Create: `pointify-web/src/features/admin/components/room-table-columns.tsx`
- Create: `pointify-web/src/features/admin/components/room-bulk-actions.tsx`
- Create: `pointify-web/src/features/admin/components/room-detail-dialog.tsx`
- Modify: `pointify-web/src/i18n/locales/vi/admin.json`
- Modify: `pointify-web/src/i18n/locales/en/admin.json`

**Interfaces:**
- Consumes: Shadcn UI `Dialog`, `Tabs`, `Badge`, `Button`, `DataTable`
- Produces: `RoomStatusBadge`, `createRoomColumns({ onView, onTakeover, onClose, onDelete })`, `RoomBulkActions`, `RoomDetailDialog` with ref handle `{ open: (roomId: string) => void, close: () => void }`

- [x] **Step 1: Implement `RoomStatusBadge`**

Status indicators:
- `Active`: Emerald badge with pulsing green dot.
- `Closed`: Slate/Muted badge.
- `Stale`: Amber badge indicating inactivity >24h.

- [x] **Step 2: Implement `RoomTableColumns`**

Define TanStack Table columns adhering to ONE standards:
- Select checkbox column
- `id` (Room Code): Pinned left, font `JetBrains Mono`, copy button
- `name`: With container frame icon
- `facilitatorName`: Display name with mascot avatar
- `deckType`: Badge
- `participants`: `${onlineCount}/${participantCount}`
- `currentRound`: Round number & voting state
- `status`: `RoomStatusBadge`
- `createdAt`: Formatted date
- `actions`: Dropdown menu with View Details, Takeover, Close, Delete

- [x] **Step 3: Implement `RoomDetailDialog` (React 19 Ref-as-a-prop)**

Implement tabbed dialog:
- `Tab 1 (Overview)`: Room Code with copy, join URL, QR code, Deck type, Quick actions (Takeover, Force Close).
- `Tab 2 (Participants)`: List of all members (spectator/estimator, online status, mascot avatar).
- `Tab 3 (Round History)`: Accordion of completed rounds with story points and estimate breakdowns.

- [x] **Step 4: Implement `RoomBulkActions`**

Floating action bar when rows are selected: Bulk Close, Bulk Delete, Export CSV.

- [x] **Step 5: Add i18n translation keys in `vi/admin.json` and `en/admin.json`**

Keys for room table headers, status badges, actions, dialog tabs, and confirmation toasts.

- [x] **Step 6: Verify typecheck**

Run: `bun run typecheck` in `pointify-web`.
Expected: PASS

- [x] **Step 7: Commit changes**

```bash
git add pointify-web/src/features/admin/components/ pointify-web/src/i18n/
git commit -m "feat(admin): build room table columns, status badge, bulk actions and detail dialog"
```

---

### Task 6: Implement Admin Rooms View, Routes & Deprecate `/admin/games` (Frontend)

**Files:**
- Create: `pointify-web/src/features/admin/components/admin-rooms-view.tsx`
- Create: `pointify-web/src/routes/admin.rooms.tsx`
- Create: `pointify-web/src/routes/admin.games.tsx` (redirect route)
- Modify: `pointify-web/src/components/admin/app-sidebar.tsx`
- Modify: `pointify-web/src/features/admin/components/overview-recent-games.tsx`

**Interfaces:**
- Consumes: `AdminRoomsView`, TanStack Router `createFileRoute`
- Produces: Route `/admin/rooms`, Redirect `/admin/games` -> `/admin/rooms`

- [x] **Step 1: Implement `AdminRoomsView`**

Assembles search bar, status dropdown filter, deck filter, `DataTable`, `RoomBulkActions`, and `RoomDetailDialog` ref.
Connects with TanStack Router search params (`page`, `limit`, `search`, `status`, `deckType`, `sortBy`, `sortOrder`).
Implements Takeover action: calls takeover mutation, stores key in `sessionStorage.setItem(\`pointify_facilitator_key_\${roomId}\`, key)`, then opens `/rooms/\${roomId}`.

- [x] **Step 2: Create `pointify-web/src/routes/admin.rooms.tsx`**

TanStack Router file-based route with Zod search validation, loading skeleton, error boundary, and rendering `AdminRoomsView`.

- [x] **Step 3: Create `pointify-web/src/routes/admin.games.tsx`**

Redirect route:
```tsx
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/games')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/rooms' });
  },
});
```

- [x] **Step 4: Update Sidebar and Overview Widget**

In `app-sidebar.tsx`: Remove `url: '/admin/games'`, retain `url: '/admin/rooms'`.
In `overview-recent-games.tsx`: Update title and copy to reflect "Phòng gần đây" / "Recent Rooms", link pointing to `/admin/rooms`.

- [x] **Step 5: Verify typecheck & lint**

Run in `pointify-web`:
`bun run typecheck`
`bun run check`
Expected: 0 errors, 0 warnings.

- [x] **Step 6: Commit changes**

```bash
git add pointify-web/src/routes/ pointify-web/src/components/admin/app-sidebar.tsx pointify-web/src/features/admin/
git commit -m "feat(admin): assemble admin rooms route and redirect deprecated admin/games"
```

---

### Task 7: End-to-End Verification & Health Checks

**Files:**
- Test all altered routes and endpoints

- [x] **Step 1: Run frontend typecheck & lint**

Run: `cd pointify-web && bun run typecheck && bun run check`
Expected: Clean pass with zero errors.

- [x] **Step 2: Run backend tests & build**

Run: `cd pointify-backend && bun test && bun run build`
Expected: All tests pass, build succeeds cleanly.

- [x] **Step 3: Browser verification of `/admin/rooms` and redirect from `/admin/games`**

Open browser to `/admin/rooms`, inspect table rendering, test search, test filter by status, test opening `RoomDetailDialog`, verify tabs and action buttons.
Navigate to `/admin/games` and verify immediate seamless redirect to `/admin/rooms`.

- [x] **Step 4: Final commit & documentation checkpoint**

```bash
git commit --allow-empty -m "chore: complete admin room management and super facilitator override verification"
```
