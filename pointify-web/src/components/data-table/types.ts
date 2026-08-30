import type { Table } from '@tanstack/react-table';

export type TableDensity = 'compact' | 'normal' | 'comfortable';

export interface DataTableDensityConfig {
  rowHeight: number;
  cellPadding: string;
  fontSize: string;
}

export const DENSITY_CONFIGS: Record<TableDensity, DataTableDensityConfig> = {
  compact: {
    rowHeight: 38,
    cellPadding: 'py-1 px-3',
    fontSize: 'text-xs',
  },
  normal: {
    rowHeight: 48,
    cellPadding: 'py-2 px-3',
    fontSize: 'text-sm',
  },
  comfortable: {
    rowHeight: 60,
    cellPadding: 'py-3.5 px-4',
    fontSize: 'text-sm',
  },
};

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
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
