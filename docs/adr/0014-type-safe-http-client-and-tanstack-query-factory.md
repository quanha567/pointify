# 14. Type-Safe Native HTTP Client, Environment Config, and TanStack Query Key Factories

Date: 2026-08-31

## Status

Accepted

## Context

As the `pointify-web` frontend evolved, several infrastructure patterns required consolidation:
1. **Scattered Environment Variables**: Direct reads of `import.meta.env` with ad-hoc fallback strings in various files lacked centralized runtime validation, risking silent misconfiguration in staging and production.
2. **Boilerplate and Inconsistent HTTP Requests**: Multiple API modules (`api.ts`, `admin-users.api.ts`) used raw `fetch`, manually concatenating `URLSearchParams`, checking `!response.ok`, and unwrapping JSON responses without unified error taxonomy.
3. **Cross-Feature Coupling**: Legacy `src/lib/api.ts` acted as both a session API service and a barrel re-export for administrative domain types and endpoints, violating feature colocation principles.
4. **TanStack Query Key Invalidation & Stale State**: Ad-hoc query key arrays (`['admin-users', params]`) were prone to typos and lacked granular invalidation capabilities. Additionally, pagination and search filtering suffered from screen flicker without `keepPreviousData`.

## Decision

1. **Centralized Environment Configuration (`src/config/env.ts`)**:
   - Validate all `import.meta.env` keys at startup using a strict Zod schema with development fallbacks and fail-fast production error reporting.
   - Export a typed, immutable `env` configuration object used across the application.

2. **Native Type-Safe HTTP Client (`src/lib/http-client.ts`)**:
   - Zero-dependency fetch wrapper providing typed `.get<T>()`, `.post<T>()`, `.patch<T>()`, `.put<T>()`, and `.delete<T>()`.
   - Automatic `credentials: 'include'` for HttpOnly Cookie authentication.
   - Smart query parameter pruning and serialization (`URLSearchParams`).
   - Unified `ApiClientError` hierarchy encapsulating HTTP status codes, error codes, and backend validation details.

3. **Strict Feature Colocation**:
   - Removed legacy `src/lib/api.ts`.
   - Moved session synchronization and auth endpoints into `src/features/auth/api/auth.api.ts` and `src/features/auth/types/auth.types.ts`.
   - Admin API endpoints reside exclusively within `src/features/admin/api/admin-users.api.ts`.

4. **TanStack Query v5 Key Factory & Atomic Mutations**:
   - Standardized `adminUserKeys` query key factory with hierarchical scopes (`all`, `lists`, `list(params)`, `details`, `detail(id)`).
   - Encapsulated queries using `queryOptions({ queryKey, queryFn, placeholderData: keepPreviousData })` for flicker-free data grid transitions.
   - Decomposed mutations into atomic hooks (`useCreateAdminUserMutation`, `useUpdateAdminUserMutation`, `useBulkUpdateStatusMutation`) with targeted query invalidations and i18n toasts.

## Consequences

- **Positive**: Complete type safety from environment configuration through network requests and UI state.
- **Positive**: Clean separation of concerns with zero cross-feature barrel coupling.
- **Positive**: Seamless pagination and filtering transitions on the Virtual Data Table without layout flickering.
- **Positive**: Fast, maintainable, and testable mutation hooks adhering to Single Responsibility Principle.
