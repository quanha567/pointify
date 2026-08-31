# 12. Admin User Management Live Data, URL Search Synchronization, and Access Control Architecture

Date: 2026-08-31

## Status

Accepted

## Context

The administrator portal user management interface (`/admin/users`) previously used mock client-side fallback data and optimistic updates. To transition to a production-ready, enterprise-grade architecture:
1. The frontend data table must connect to live backend endpoints with server-side pagination, search, faceted filtering, and sorting.
2. The grid state needs bidirectional synchronization with URL search parameters via TanStack Router.
3. Administrative endpoints require strict authentication and role-based access control (`AdminAuthGuard`).
4. Administrators need capabilities to create new accounts (`POST /api/admin/users`) with auto-generated secure credentials and perform atomic bulk operations (`PATCH /api/admin/users/bulk-status`) with safety guardrails preventing self-lockout.

## Decision

1. **Server-Side Query & URL Synchronization**:
   - Synchronize pagination (`page`, `limit`), search query (`search`), faceted filters (`role`, `status`), and column sorting (`sortBy`, `sortOrder`) with TanStack Router search params.
   - Use a 300ms debounce on search input before dispatching TanStack Query requests.
   - Pass `serverPagination` and `serverSorting` to `DataTable` to seamlessly control TanStack Table v9.

2. **Backend Authentication & Authorization Guard**:
   - Implement `AdminAuthGuard` in the backend identity presentation layer.
   - Verify Firebase ID token / HTTP-only `__session` cookie, resolve the user profile from Firestore, and reject non-admin requests with `403 Forbidden` / `401 Unauthorized`.
   - On the web client, guard `/admin` routes to redirect unauthenticated or non-admin users to `/`.

3. **Account Creation Flow**:
   - Create `AdminCreateUserUseCase` and `POST /api/admin/users`.
   - Admin provides `email`, `displayName`, `role`, and `status`. The backend generates a secure random password, creates the Firebase Auth user record, and persists the Firestore profile document.

4. **Atomic Bulk Status Updates & Self-Protection Guardrail**:
   - Implement `AdminBulkUpdateStatusUseCase` and `PATCH /api/admin/users/bulk-status` supporting batch updates on Firestore.
   - Guard against self-modification: Filter out / reject attempts to disable or downgrade the currently authenticated administrator.

## Consequences

- **Positive**: Complete live data integration with sub-second response times and scalable server-side pagination.
- **Positive**: URLs are bookmarkable and shareable with exact active filters and pagination states.
- **Positive**: Strict defense-in-depth security model protecting admin APIs and frontend routes.
- **Positive**: Safe administrative operations with built-in self-lockout prevention.
