# 9. Dedicated Admin Shell & Modern Data Table Visual System

Date: 2026-08-31

## Status

Accepted

## Context

The Pointify Admin Portal (`/admin/*`) previously shared the global root layout (`__root.tsx`), which rendered the consumer-facing top navigation bar and footer. This created visual noise, redundant headers (stacked topbars), wasted vertical viewport real estate, and broke the layout immersion needed for complex data-intensive management tasks such as high-volume user auditing and room moderation.

Additionally, the administrative data table for user accounts (`/admin/users`) required a clearer visual hierarchy for authentication providers, user roles, account lifecycle statuses, and quick actionable metadata (e.g., 1-click UID copy, status indicators).

## Decision

1. **Dedicated Fullscreen Admin Shell**:
   - In `__root.tsx`, routes under `/admin/*` bypass the consumer header and footer, rendering directly in a full-viewport container (`h-screen w-screen overflow-hidden`).
   - The Admin Shell provides its own dedicated 100vh collapsible Sidebar on desktop and a slide-over Sheet/Drawer on mobile/tablet devices (< 1024px).
   - An integrated Admin Topbar houses dynamic breadcrumbs, the system status indicator ("Admin Mode"), the language switcher, navigation shortcuts, and administrative profile management.

2. **Clean & High-Contrast Visual System for Admin Data Tables**:
   - **Provider Differentiation**: Authentic multi-colored Google SVG icon for Google OAuth, amber key badge for Password accounts, and indigo badge for guest sessions.
   - **Role Hierarchy**: Elevated violet-purple gradient badge (`from-violet-500/20 to-purple-600/20` with `ShieldCheck`) for Administrators versus a minimal neutral badge for standard Members.
   - **Status Signal Indicators**: Live pulsating green indicator (`bg-emerald-500` with subtle animation) for active accounts, and a high-contrast muted rose badge for locked/disabled accounts.
   - **Space Optimization**: Omit non-essential summary KPI cards to preserve 100% vertical viewport height for the TanStack Virtual high-performance row virtualization grid.

## Consequences

- **Positive**: Clean, distraction-free SaaS management environment with no stacked headers or double scrollbars.
- **Positive**: Optimal performance and maximum vertical display space for viewing hundreds of records smoothly.
- **Positive**: Responsive management experience that scales from mobile devices to ultrawide desktop monitors.
- **Trade-off**: Admin-specific header components must manage their own language and authentication controls independently of the consumer root header.
