import type React from 'react';
import {
  type Column,
  type ColumnDef as TanStackColumnDef,
  type Row,
  type Header,
  type Cell,
  type RowData,
  type ReactTable,
  tableFeatures,
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnPinningFeature,
  columnOrderingFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  columnFacetingFeature,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createCoreRowModel,
} from '@tanstack/react-table';

export interface CustomColumnMeta {
  flex?: number | string | boolean;
  className?: string;
}

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnPinningFeature,
  columnOrderingFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  columnFacetingFeature,
  columnMeta: {} as CustomColumnMeta,
  coreRowModel: createCoreRowModel(),
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableInstance<TData extends RowData = any> = ReactTable<DataTableFeatures, TData>;
export type DataTableColumn<TData extends RowData = any, TValue = any> = Column<
  DataTableFeatures,
  TData,
  TValue
>;
export type DataTableRow<TData extends RowData = any> = Row<DataTableFeatures, TData>;
export type DataTableHeader<TData extends RowData = any, TValue = any> = Header<
  DataTableFeatures,
  TData,
  TValue
>;
export type DataTableCell<TData extends RowData = any, TValue = any> = Cell<
  DataTableFeatures,
  TData,
  TValue
>;
export type DataTableColumnDef<TData extends RowData = any, TValue = any> = TanStackColumnDef<
  DataTableFeatures,
  TData,
  TValue
>;

export type TableDensity = 'compact' | 'normal' | 'comfortable';

export interface DataTableDensityConfig {
  rowHeight: number;
  cellPadding: string;
  fontSize: string;
}

export const DENSITY_CONFIGS: Record<TableDensity, DataTableDensityConfig> = {
  compact: {
    rowHeight: 36,
    cellPadding: 'py-1.5 px-3',
    fontSize: 'text-xs',
  },
  normal: {
    rowHeight: 46,
    cellPadding: 'py-2 px-3',
    fontSize: 'text-sm',
  },
  comfortable: {
    rowHeight: 58,
    cellPadding: 'py-3 px-4',
    fontSize: 'text-sm',
  },
};

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface DataTableToolbarProps<TData extends RowData = any> {
  table: DataTableInstance<TData>;
  searchPlaceholder?: string;
  searchColumnId?: string;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
  facetedFilters?: {
    columnId: string;
    title: string;
    options: DataTableFilterOption[];
  }[];
  onExportCsv?: () => void;
  extraActions?: React.ReactNode;
}
