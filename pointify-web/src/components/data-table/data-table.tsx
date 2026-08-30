import React, { useRef, useState, useMemo } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type ColumnPinningState,
  type RowSelectionState,
  type PaginationState,
  type OnChangeFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../lib/utils';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';
import { DataTableFloatingBar } from './data-table-floating-bar';
import { type TableDensity, type DataTableFilterOption, DENSITY_CONFIGS } from './types';
import { Skeleton } from '../ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '../ui/empty';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchColumnId?: string;
  facetedFilters?: {
    columnId: string;
    title: string;
    options: DataTableFilterOption[];
  }[];
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
  onExportCsv?: (data: TData[]) => void;
  onExportSelected?: (selectedData: TData[]) => void;
  floatingActions?: (selectedRows: TData[]) => React.ReactNode;
  toolbarExtraActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = 'Tìm kiếm...',
  searchColumnId,
  facetedFilters = [],
  totalRows,
  serverPagination,
  serverSorting,
  onExportCsv,
  onExportSelected,
  floatingActions,
  toolbarExtraActions,
  emptyTitle = 'Chưa có dữ liệu',
  emptyDescription = 'Không tìm thấy kết quả nào phù hợp với bộ lọc hiện tại.',
  className,
}: DataTableProps<TData, TValue>) {
  // Table States
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [clientSorting, setClientSorting] = useState<SortingState>([]);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ['select'],
    right: ['actions'],
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

  const table = useReactTable({
    data,
    columns,
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
    pageCount: serverPagination?.pageCount ?? -1,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const { rows } = table.getRowModel();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const densityConfig = DENSITY_CONFIGS[density];

  // Row Virtualizer for high-performance scrolling
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => densityConfig.rowHeight,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalVirtualSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalVirtualSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

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
    return table.getFilteredSelectedRowModel().rows.map((r) => r.original);
  }, [rowSelection, data]);

  return (
    <div className={cn('flex flex-col h-full w-full', className)}>
      {/* Table Toolbar */}
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

      {/* AG-Grid Styled Table Container */}
      <div className="relative flex-1 flex flex-col min-h-[350px] w-full overflow-hidden rounded-xl border border-border/70 bg-card/60 backdrop-blur-md shadow-lg">
        <div
          ref={tableContainerRef}
          className="flex-1 w-full overflow-auto scrollbar-thin scrollbar-thumb-border/80"
        >
          <table className="w-full border-collapse text-left">
            {/* Sticky Header */}
            <thead className="sticky top-0 z-20 bg-muted/90 backdrop-blur-md border-b border-border/80 shadow-xs">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isPinned = header.column.getIsPinned();
                    const isResizing = header.column.getIsResizing();

                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          width: header.getSize(),
                          left:
                            isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                          right:
                            isPinned === 'right'
                              ? `${header.column.getAfter('right')}px`
                              : undefined,
                        }}
                        className={cn(
                          'relative select-none text-xs font-semibold uppercase tracking-wider text-muted-foreground border-r border-border/40 last:border-r-0',
                          densityConfig.cellPadding,
                          isPinned && 'sticky z-30 bg-muted/95 backdrop-blur-md shadow-xs',
                          isPinned === 'left' && 'border-r-2 border-r-border/80',
                          isPinned === 'right' && 'border-l-2 border-l-border/80',
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
                              'absolute right-0 top-0 h-full w-1.5 cursor-col-resize user-select-none touch-none hover:bg-primary/70 transition-colors',
                              isResizing && 'bg-primary w-2',
                            )}
                          />
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            {/* Virtualized Body */}
            <tbody className="divide-y divide-border/40 bg-card/20">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="h-12 border-b border-border/30">
                    {table.getVisibleLeafColumns().map((col) => (
                      <td key={col.id} className={cn('p-3', densityConfig.cellPadding)}>
                        <Skeleton className="h-4 w-full max-w-[140px] rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length > 0 ? (
                <>
                  {paddingTop > 0 && (
                    <tr>
                      <td style={{ height: `${paddingTop}px` }} />
                    </tr>
                  )}
                  {virtualRows.map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    const isSelected = row.getIsSelected();

                    return (
                      <tr
                        key={row.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        className={cn(
                          'transition-colors hover:bg-accent/40 group',
                          isSelected && 'bg-primary/10 hover:bg-primary/15 font-medium',
                          virtualRow.index % 2 === 1 && 'bg-muted/10',
                        )}
                        style={{ height: `${densityConfig.rowHeight}px` }}
                      >
                        {row.getVisibleCells().map((cell) => {
                          const isPinned = cell.column.getIsPinned();

                          return (
                            <td
                              key={cell.id}
                              style={{
                                width: cell.column.getSize(),
                                left:
                                  isPinned === 'left'
                                    ? `${cell.column.getStart('left')}px`
                                    : undefined,
                                right:
                                  isPinned === 'right'
                                    ? `${cell.column.getAfter('right')}px`
                                    : undefined,
                              }}
                              className={cn(
                                'border-r border-border/30 last:border-r-0 text-foreground/90 align-middle',
                                densityConfig.cellPadding,
                                densityConfig.fontSize,
                                isPinned && 'sticky z-10 bg-card/95 backdrop-blur-md',
                                isPinned === 'left' && 'border-r-2 border-r-border/80 shadow-xs',
                                isPinned === 'right' && 'border-l-2 border-l-border/80 shadow-xs',
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {paddingBottom > 0 && (
                    <tr>
                      <td style={{ height: `${paddingBottom}px` }} />
                    </tr>
                  )}
                </>
              ) : (
                <tr>
                  <td
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-64 text-center p-8"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Empty className="py-6 border-0">
                        <EmptyHeader>
                          <EmptyTitle>{emptyTitle}</EmptyTitle>
                          <EmptyDescription>{emptyDescription}</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
