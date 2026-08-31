# 11. TanStack Table v9 Upgrade & AG-Grid Virtualized Div Layout Architecture

Date: 2026-08-31

## Status

Accepted

## Context

The administrative portal requires high-performance tabular presentation for large datasets (users, rooms, system logs). Previously, `DataTable` used HTML native `<table>`, `<tbody>`, `<tr>`, `<td>` tags with `@tanstack/react-table` v8 and row padding placeholders. Native table elements introduce heavy layout recalculation and DOM reflow penalties during virtualization, column resizing, and horizontal scrolling. Furthermore, TanStack Table v9 was released with significant performance gains, tree-shakable modular features, and store-based state reactivity.

Key needs:
1. **AG-Grid Virtualized Div Architecture**: Eliminate `<table>` tags in favor of container `div`s with absolute positioned virtual rows (`transform: translateY(...)`), flex cells, and CSS sticky pinned columns.
2. **TanStack Table v9 (`@tanstack/react-table@9.2.4`)**: Upgrade to v9 to leverage granular state subscriptions, modular feature gating (`tableFeatures`), and lower memory consumption.
3. **Clean Sheet Aesthetics**: Sharp horizontal separators, sticky header, solid card backgrounds, custom row density switching (Compact, Normal, Comfortable), and bulk action floating bar.

## Decision

1. **Dependency Upgrade**:
   - Upgrade `@tanstack/react-table` from `8.21.2` to `9.2.4` (stable v9).
   - Use `tableFeatures` helper to register only required features (`rowSortingFeature`, `columnFilteringFeature`, `globalFilteringFeature`, `rowPaginationFeature`, `rowSelectionFeature`, `columnPinningFeature`, `columnOrderingFeature`, `columnResizingFeature`, `columnSizingFeature`, `columnVisibilityFeature`, `columnFacetingFeature`) with corresponding row model factories.

2. **Virtualized Div-Based Grid Engine**:
   - Replace table markup with an AG-Grid viewport pattern:
     - Header: Sticky top row container (`bg-muted/80`) with column resize handlers and logical start/end pinned columns (`position: sticky`).
     - Body: Relative viewport container sized to `rowVirtualizer.getTotalSize()`.
     - Virtual Rows: Absolute positioned rows (`transform: translateY(...)`) with smooth hover state and selection highlights.
     - Cells: Flexbox cell elements with width driven by `cell.column.getSize()` and logical pinned offsets (`column.getStart('start')`, `column.getAfter('end')`).

3. **Design Decisions (Grilling Session)**:
   - Single Viewport + CSS Sticky Cells for pinned columns (zero jitter, native GPU acceleration).
   - Hybrid Flex-Fit sizing for responsive dashboard layout.
   - Clean solid backgrounds (`bg-card`, `bg-muted`) without vertical column grid lines and without backdrop-blur.

## Consequences

- **Positive**: Near-instant rendering and butter-smooth 60fps scrolling even with thousands of records.
- **Positive**: Elimination of browser native `<table>` layout reflow quirks and virtualizer scroll jumps.
- **Positive**: Modular bundle footprint through TanStack Table v9 feature gating.
- **Positive**: Robust TypeScript type inference with `DataTableColumnDef`, `DataTableInstance`, and `RowData` constraints.
