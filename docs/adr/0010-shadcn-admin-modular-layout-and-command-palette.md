# 10. Modular Shadcn-Admin Layout Architecture & Command Palette

Date: 2026-08-31

## Status

Accepted

## Context

Following the initial full-viewport Admin Shell adoption, the administrative interface required an elevated, modern design system matching `shadcn-admin` standards. The previous implementation had all layout logic (sidebar rendering, mobile drawers, profile dropdowns, topbar buttons) tightly coupled inside a single file (`routes/admin.tsx`), which made extending navigation groups and integrating keyboard shortcuts cumbersome.

Key UX and architectural needs:
1. **Grouped Sidebar Hierarchy**: Clear categorization across *Tổng quan (General)*, *Quản lý (Management)*, and *Hệ thống (System)* with collapsible icon mode (`collapsible="icon"`), hover tooltips, and state persistence.
2. **Keyboard-First Navigation (Command Palette)**: Quick search dialog triggered globally via `Cmd+K` / `Ctrl+K` for instant page navigation, theme changes, and administrative actions via TanStack Router.
3. **Seamless Theme Switching**: Independent Dark, Light, and System theme toggling via `next-themes` integrated in the topbar and command palette.
4. **Clean Component Seams**: Decompose the Admin Shell into specialized modular components (`AppSidebar`, `AdminHeader`, `SearchDialog`, `ThemeToggle`, `NavUser`).

## Decision

1. **Modular Admin Component Structure (`src/components/admin/`)**:
   - `AppSidebar`: Uses standard `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarRail` with `collapsible="icon"`, brand header, and cookie state persistence.
   - `AdminHeader`: Sticky backdrop-blur topbar featuring `SidebarTrigger`, dynamic route-aware `Breadcrumb` navigation, global `SearchDialog` trigger with `⌘K` badge, `LanguageSwitcher`, `ThemeToggle`, and topbar profile menu.
   - `SearchDialog`: `CommandDialog` powered by `cmdk` listening to `Cmd+K` / `Ctrl+K` with TanStack Router imperative navigation (`navigate({ to: path })`).
   - `ThemeToggle`: 3-mode theme switcher (Light / Dark / System) with smooth icon transitions.
   - `NavUser`: Unified user profile presentation for sidebar footer and dropdown menus.

2. **Global Theme Provider**:
   - Wrap the root `RouterProvider` in `main.tsx` with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>` to ensure instant theme propagation across both client and admin routes.

## Consequences

- **Positive**: High-end, cohesive administrative UX adhering to modern `shadcn-admin` design aesthetics.
- **Positive**: Power users can navigate instantly across the portal via `Cmd+K` without lifting hands from the keyboard.
- **Positive**: Modular architecture allows future admin sections (Rooms, Decks, Settings) to plug into the navigation tree effortlessly.
