# 0008. AG-Grid-Style Virtual Data Table and Admin Portal Architecture

## Context
Pointify requires an administrative dashboard to manage user accounts, monitor system metrics, and inspect active estimation rooms. Instead of a basic HTML table or heavy third-party enterprise table licenses, we need a high-performance, modular, composable, and theme-consistent Data Table inspired by AG-Grid Enterprise capabilities (virtual scrolling for massive rows, resizable columns, sticky left/right pinned columns, column visibility & reordering, multi-sort, floating/popover filtering, bulk selection, density switching, and CSV/JSON export).

Additionally, the admin portal requires robust layout navigation (collapsible sidebar, responsive header, breadcrumbs, search, theme toggle) and type-safe form management with sheet-based slideout editors powered by TanStack Form and Zod.

## Decision
1. **Core Data Table Architecture**:
   - Headless state & layout powered by `@tanstack/react-table` (v8).
   - Dynamic viewport row virtualization powered by `@tanstack/react-virtual` (v3).
   - Server data synchronization, caching, and mutation orchestration powered by `@tanstack/react-query` (v5).
   - Component rendering & styling powered strictly by Shadcn UI primitives (`DropdownMenu`, `Popover`, `Button`, `Input`, `Badge`, `Checkbox`, `Sheet`, `Slider`, `Tooltip`) styled with Tailwind CSS tokens.

2. **AG-Grid Enterprise-Style Capabilities**:
   - **Virtual Scrolling**: Only visible rows in the viewport are rendered in the DOM, maintaining 60 FPS even with 10,000+ records.
   - **Column Resizing & Pinning**: Interactive resize handles with min/max bounds and sticky left/right column pinning (e.g. pinned selection checkbox and pinned action buttons).
   - **Column Visibility & Customization**: Popover sheet allowing users to toggle column visibility, reset column widths, and change row density (compact, normal, comfortable).
   - **Multi-Sort & Global/Column Filtering**: Interactive header sort indicators and column-specific filter popovers with debounced searching.
   - **Row Selection & Floating Actions**: Bulk select checkboxes with a floating bottom action toolbar (batch delete, role assignment, export selected).
   - **Client/Server Pagination & Export**: Instant export to CSV/JSON format.

3. **Admin Routing & Layout**:
   - Nested TanStack Router layout under `/admin` (`/admin/__layout.tsx` or `/admin/route.tsx`).
   - Shadcn `Sidebar` with collapsible sections (Accounts, Rooms, System Settings, Audit Logs).
   - Dynamic header with Breadcrumbs, Search command palette, Theme toggle, and Admin profile quick access.

4. **Account Management & TanStack Form**:
   - Slide-out `Sheet` (Drawer) for creating and editing Account Profiles.
   - Form state, validation, and error messages handled strictly via `@tanstack/react-form` + `zod` schema validator.
   - Optimistic updates or query invalidation via TanStack Query upon successful mutations.

5. **Backend Admin Identity Endpoints**:
   - Add `GET /api/admin/users` (supports query params: `page`, `limit`, `search`, `role`, `provider`, `sortBy`, `sortOrder`).
   - Add `PATCH /api/admin/users/:uid` (updates role, status, displayName, photoURL).
   - Add `DELETE /api/admin/users/:uid` (or disable account).

## Consequences
- **Zero Third-Party Enterprise Bloat**: Full control over styling, behavior, accessibility, and bundle size without commercial licensing constraints.
- **Maximum Performance**: Virtualized rendering guarantees smooth performance under heavy workloads.
- **Consistency**: All UI elements inherit shadcn design tokens and dark mode styling.
- **Type Safety**: End-to-end type safety from Zod schemas and TanStack Table column definitions to NestJS backend DTOs.
