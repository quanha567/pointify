# 0022. Admin Overview Analytics and Reporting Context Architecture

## Context
Pointify requires an administrative overview dashboard to monitor platform health, active rooms, estimation activities, and account growth. The application separates domain boundaries into `Identity` and `Room` bounded contexts under Clean Architecture / DDD principles. Directly querying internal entities across contexts from a single CRUD controller creates tight coupling between disparate write-models. Furthermore, querying raw Firestore data repeatedly for administrative reporting could result in unnecessary read costs and latency.

## Decision
1. **Dedicated Analytics Bounded Context (CQRS Read/Reporting Model)**:
   - Introduce an isolated `AnalyticsModule` (`src/contexts/analytics/`) in the NestJS backend as a specialized read-model context.
   - It consumes read-only data interfaces or aggregate repositories from `Identity` and `Room` contexts, keeping write-models uncoupled.
   - Expose endpoint `GET /api/admin/overview?range=7d|30d|90d|all` returning consolidated metrics (account totals, room & round counts, time-series activity trends, deck distribution, and recent activity streams).

2. **Hybrid Aggregation & Caching Strategy**:
   - Perform on-the-fly aggregation with Firestore counts and range filters (`createdAt >= startDate`).
   - Implement short-term in-memory caching (5 minutes TTL) on the backend and TanStack Query `staleTime` on the frontend to minimize Firestore reads and maintain sub-100ms response times.
   - Fill zero-gap date buckets in the time-series response on the backend to ensure continuous charting without client-side data mutation.

3. **Frontend Presentation & Route Placement**:
   - Mount the Admin Overview Dashboard at the root `/admin` route (replacing the temporary redirect to `/admin/users`).
   - Use Shadcn UI `Card` primitives with Recharts and Shadcn Chart components (`AreaChart`, `PieChart`) adhering to Tailwind CSS v4 design tokens and semantic CSS variables.
   - Synchronize time range filters with URL Search Params (`validateSearch` with Zod schema) maintaining bookmarkable and shareable URL state.

## Consequences
- **Positive**: Clean separation of concerns between transactional domain logic and analytical queries; zero cross-context domain pollution; fast rendering with low Firestore read load.
- **Trade-off**: For very high event throughput in the future, on-the-fly aggregation may eventually require a pre-aggregated daily snapshot collection or event-driven projection pipeline.
