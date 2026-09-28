import React, { useRef, useState, useMemo } from 'react';
import {
  type ColumnFiltersState,
  type SortingState,
  type ColumnVisibilityState,
  type ColumnPinningState,
  type RowSelectionState,
  type PaginationState,
  type OnChangeFn,
  type RowData,
  useTable,
  flexRender,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../lib/utils';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';
import { DataTableFloatingBar } from './data-table-floating-bar';
import {
  type TableDensity,
  type DataTableFacetedFilterConfig,
  type DataTableColumnDef,
  type DataTableColumn,
  type CustomColumnMeta,
  dataTableFeatures,
  DENSITY_CONFIGS,
} from './types';
import { Skeleton } from '../ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '../ui/empty';

interface DataTableProps<TData extends RowData = any> {
  columns: DataTableColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchColumnId?: string;
  facetedFilters?: DataTableFacetedFilterConfig[];
  totalRows?: number;
  serverPagination?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  };
  serverSorting?: {
    sorting: SortingState;
    onSortingChange: (sorting: SortingState) => void;
  };
  serverFilters?: {
    globalFilter?: string;
    onGlobalFilterChange?: (filter: string) => void;
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  };
  onExportCsv?: (data: TData[]) => void;
  onExportSelected?: (selectedData: TData[]) => void;
  floatingActions?: (selectedRows: TData[]) => React.ReactNode;
  toolbarExtraActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  getColumnFlex?: (column: DataTableColumn<TData, any>) => number | string | boolean | undefined;
  className?: string;
}

export function DataTable<TData extends RowData = any>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = 'Tìm kiếm...',
  searchColumnId,
  facetedFilters = [],
  totalRows,
  serverPagination,
  serverSorting,
  serverFilters,
  onExportCsv,
  onExportSelected,
  floatingActions,
  toolbarExtraActions,
  emptyTitle = 'Chưa có dữ liệu',
  emptyDescription = 'Không tìm thấy kết quả nào phù hợp với bộ lọc hiện tại.',
  getColumnFlex,
  className,
}: DataTableProps<TData>) {
  // Table States
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({});
  const [clientColumnFilters, setClientColumnFilters] = useState<ColumnFiltersState>([]);
  const [clientGlobalFilter, setClientGlobalFilter] = useState<string>('');
  const [clientSorting, setClientSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    start: ['select'],
    end: ['actions'],
  });
  const [density, setDensity] = useState<TableDensity>('normal');

  // Client Pagination State
  const [clientPagination, setClientPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const sorting = serverSorting ? serverSorting.sorting : clientSorting;
  const onSortingChange: OnChangeFn<SortingState> = serverSorting
    ? (updaterOrValue) => {
        const next =
          typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
        serverSorting.onSortingChange(next);
      }
    : setClientSorting;

  const pagination = serverPagination
    ? {
        pageIndex: serverPagination.pageIndex,
        pageSize: serverPagination.pageSize,
      }
    : clientPagination;

  const onPaginationChange: OnChangeFn<PaginationState> = serverPagination
    ? (updaterOrValue) => {
        const next =
          typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
        serverPagination.onPaginationChange(next);
      }
    : setClientPagination;

  const columnFilters =
    serverFilters?.columnFilters !== undefined ? serverFilters.columnFilters : clientColumnFilters;
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = serverFilters?.onColumnFiltersChange
    ? (updaterOrValue) => {
        const next =
          typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters) : updaterOrValue;
        serverFilters.onColumnFiltersChange!(next);
      }
    : setClientColumnFilters;

  const globalFilter =
    serverFilters?.globalFilter !== undefined ? serverFilters.globalFilter : clientGlobalFilter;
  const onGlobalFilterChange: OnChangeFn<string> = serverFilters?.onGlobalFilterChange
    ? (updaterOrValue) => {
        const next =
          typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter) : updaterOrValue;
        serverFilters.onGlobalFilterChange!(next);
      }
    : setClientGlobalFilter;

  const table = useTable<typeof dataTableFeatures, TData>({
    features: dataTableFeatures,
    data,
    columns: columns as any,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      columnPinning,
      pagination,
    },
    enableRowSelection: true,
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    manualPagination: !!serverPagination,
    manualSorting: !!serverSorting,
    manualFiltering: !!serverFilters,
    pageCount: serverPagination?.pageCount ?? -1,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange,
  });

  const { rows } = table.getRowModel();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const densityConfig = DENSITY_CONFIGS[density];

  // Row Virtualizer for high-performance AG-Grid style absolute positioning
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => densityConfig.rowHeight,
    overscan: 12,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalVirtualSize = rowVirtualizer.getTotalSize();

  // Dynamic Column Flex Style Resolver via Meta / Prop
  const getColumnFlexStyle = (column: DataTableColumn<TData, any>) => {
    const meta = column.columnDef.meta as CustomColumnMeta | undefined;
    const customFlex = getColumnFlex ? getColumnFlex(column) : meta?.flex;
    const baseSize = column.getSize();
    const minSize = column.columnDef.minSize || baseSize;
    const maxSize = column.columnDef.maxSize;

    if (typeof customFlex === 'number') {
      return {
        flex: `${customFlex} 1 ${baseSize}px`,
        minWidth: `${minSize}px`,
        maxWidth: maxSize ? `${maxSize}px` : undefined,
      };
    }
    if (typeof customFlex === 'string') {
      return {
        flex: customFlex,
        minWidth: `${minSize}px`,
        maxWidth: maxSize ? `${maxSize}px` : undefined,
      };
    }
    if (customFlex === true) {
      return {
        flex: `1 1 ${baseSize}px`,
        minWidth: `${minSize}px`,
        maxWidth: maxSize ? `${maxSize}px` : undefined,
      };
    }

    // Default Fixed Width Column
    return {
      width: `${baseSize}px`,
      flex: `0 0 ${baseSize}px`,
      minWidth: `${minSize}px`,
      maxWidth: maxSize ? `${maxSize}px` : undefined,
    };
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    if (onExportCsv) {
      onExportCsv(data);
      return;
    }
    // Generic CSV export from visible columns
    const visibleCols = table
      .getVisibleLeafColumns()
      .filter((col) => col.id !== 'select' && col.id !== 'actions');
    const headers = visibleCols.map((col) =>
      typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id,
    );
    const csvRows = [headers.join(',')];

    data.forEach((rowItem: any) => {
      const values = visibleCols.map((col) => {
        const val = rowItem[col.id] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedOriginals = useMemo(() => {
    return table.getFilteredSelectedRowModel().rows.map((r) => r.original as TData);
  }, [rowSelection, data]);

  const totalTableWidth = table.getTotalSize();

  return (
    <div className={cn('flex flex-col h-full w-full', className)}>
      {/* Container with Integrated Toolbar & ONE Container Frame (8px radius) */}
      <div className="relative flex-1 flex flex-col min-h-[350px] w-full overflow-hidden rounded-lg border border-border bg-card shadow-xs card-container-frame">
        {/* Table Toolbar Header */}
        <div className="p-3 border-b border-border/80 bg-card">
          <DataTableToolbar
            table={table}
            searchPlaceholder={searchPlaceholder}
            searchColumnId={searchColumnId}
            density={density}
            onDensityChange={setDensity}
            facetedFilters={facetedFilters}
            onExportCsv={handleExportCsv}
            extraActions={toolbarExtraActions}
          />
        </div>

        {/* High Performance AG-Grid Div Viewport */}
        <div
          ref={tableContainerRef}
          className="flex-1 w-full overflow-auto scrollbar-thin scrollbar-thumb-border bg-card"
        >
          <div
            className="flex flex-col relative w-full"
            style={{ minWidth: `${totalTableWidth}px` }}
          >
            {/* Sticky Header Row */}
            <div className="sticky top-0 z-20 w-full bg-muted/90 border-b border-border/80 text-muted-foreground shadow-2xs select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <div key={headerGroup.id} className="flex items-center w-full h-9">
                  {headerGroup.headers.map((header) => {
                    const isPinned = header.column.getIsPinned();
                    const isResizing = header.column.getIsResizing();
                    const isIconOnlyCol =
                      header.column.id === 'select' || header.column.id === 'actions';
                    const flexStyle = getColumnFlexStyle(header.column);

                    return (
                      <div
                        key={header.id}
                        style={{
                          ...flexStyle,
                          left:
                            isPinned === 'start'
                              ? `${header.column.getStart('start')}px`
                              : undefined,
                          right:
                            isPinned === 'end' ? `${header.column.getAfter('end')}px` : undefined,
                        }}
                        className={cn(
                          'relative flex items-center text-xs font-medium text-muted-foreground group/th h-full overflow-hidden bg-muted/90',
                          isIconOnlyCol ? 'px-0.5 justify-center' : densityConfig.cellPadding,
                          isPinned && 'sticky z-30',
                          isPinned === 'start' &&
                            'shadow-[2px_0_4px_rgba(0,0,0,0.04)] border-r border-border/60',
                          isPinned === 'end' &&
                            'shadow-[-2px_0_4px_rgba(0,0,0,0.04)] border-l border-border/60 bg-muted',
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}

                        {/* Column Resize Handle */}
                        {header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={cn(
                              'absolute right-0 top-1.5 bottom-1.5 w-1.5 cursor-col-resize select-none touch-none rounded-full z-30 opacity-0 group-hover/th:opacity-100 hover:bg-primary transition-all',
                              isResizing && 'opacity-100 bg-primary w-1.5',
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Virtualized Rows Container */}
            <div
              className="relative w-full bg-card"
              style={{
                height: isLoading
                  ? `${8 * densityConfig.rowHeight}px`
                  : rows.length === 0
                    ? '280px'
                    : `${totalVirtualSize}px`,
              }}
            >
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${index * densityConfig.rowHeight}px)`,
                      height: `${densityConfig.rowHeight}px`,
                    }}
                    className="flex items-center border-b border-border/40"
                  >
                    {table.getVisibleLeafColumns().map((col) => {
                      const isIconOnlyCol = col.id === 'select' || col.id === 'actions';
                      const flexStyle = getColumnFlexStyle(col);
                      return (
                        <div
                          key={col.id}
                          style={flexStyle}
                          className={cn(
                            'flex items-center bg-card',
                            isIconOnlyCol ? 'px-0.5 justify-center' : densityConfig.cellPadding,
                          )}
                        >
                          <Skeleton className="h-4 w-full max-w-[140px] rounded-md" />
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : rows.length > 0 ? (
                virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index];
                  const isSelected = row.getIsSelected();

                  return (
                    <div
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                        height: `${virtualRow.size}px`,
                      }}
                      className="flex items-center border-b border-border/40 transition-colors group"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const isPinned = cell.column.getIsPinned();
                        const isIconOnlyCol =
                          cell.column.id === 'select' || cell.column.id === 'actions';
                        const flexStyle = getColumnFlexStyle(cell.column);

                        return (
                          <div
                            key={cell.id}
                            style={{
                              ...flexStyle,
                              left:
                                isPinned === 'start'
                                  ? `${cell.column.getStart('start')}px`
                                  : undefined,
                              right:
                                isPinned === 'end' ? `${cell.column.getAfter('end')}px` : undefined,
                            }}
                            className={cn(
                              'relative flex items-center text-foreground align-middle h-full overflow-hidden transition-colors',
                              isIconOnlyCol ? 'px-0.5 justify-center' : densityConfig.cellPadding,
                              densityConfig.fontSize,
                              isSelected
                                ? 'bg-primary/10 group-hover:bg-primary/15 dark:bg-primary/15 dark:group-hover:bg-primary/20'
                                : 'bg-card group-hover:bg-muted/50 dark:group-hover:bg-muted/30',
                              isPinned && 'sticky z-10',
                              isPinned === 'start' &&
                                'shadow-[2px_0_4px_rgba(0,0,0,0.03)] border-r border-border/40',
                              isPinned === 'end' &&
                                'shadow-[-2px_0_4px_rgba(0,0,0,0.03)] border-l border-border/40',
                            )}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                  <Empty className="py-6 border-0">
                    <EmptyHeader>
                      <EmptyTitle>{emptyTitle}</EmptyTitle>
                      <EmptyDescription>{emptyDescription}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Pagination */}
        <DataTablePagination table={table} totalRows={totalRows} />
      </div>

      {/* Floating Bottom Bulk Actions Bar */}
      <DataTableFloatingBar table={table} onExportSelected={onExportSelected}>
        {floatingActions?.(selectedOriginals)}
      </DataTableFloatingBar>
    </div>
  );
}
