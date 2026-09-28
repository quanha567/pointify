import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import type { RowData } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Typography } from '../ui/typography';
import type { DataTableInstance } from './types';

interface DataTablePaginationProps<TData extends RowData = any> {
  table: DataTableInstance<TData>;
  pageSizeOptions?: number[];
  totalRows?: number;
}

export function DataTablePagination<TData extends RowData = any>({
  table,
  pageSizeOptions = [10, 20, 30, 50, 100],
  totalRows,
}: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const displayTotal = totalRows !== undefined ? totalRows : filteredCount;
  const pageIndex = table.state.pagination?.pageIndex ?? 0;
  const pageSize = table.state.pagination?.pageSize ?? 20;
  const pageCount = Math.max(1, table.getPageCount());

  // Calculate current range showing (e.g. 1-10)
  const startRow = displayTotal === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, displayTotal);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-border/80 bg-muted/20 dark:bg-zinc-950/40 rounded-b-lg">
      {/* Left: Record Range & Selection Status */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2">
            <Typography as="span" variant="small" className="text-foreground/85 font-medium">
              Đã chọn{' '}
              <strong className="font-mono tabular-nums font-semibold text-foreground">
                {selectedCount}
              </strong>{' '}
              /{' '}
              <strong className="font-mono tabular-nums font-semibold text-foreground">
                {displayTotal}
              </strong>{' '}
              bản ghi
            </Typography>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Typography as="span" variant="small" className="text-foreground/85 font-medium">
              Hiển thị{' '}
              <strong className="font-mono tabular-nums font-semibold text-foreground">
                {startRow} - {endRow}
              </strong>{' '}
              /{' '}
              <strong className="font-mono tabular-nums font-semibold text-foreground">
                {displayTotal}
              </strong>{' '}
              bản ghi
            </Typography>
          </div>
        )}
      </div>

      {/* Right: Page Size + Page Indicator + Nav Buttons */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <Typography as="span" variant="muted" className="whitespace-nowrap text-xs">
            Số dòng:
          </Typography>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 px-2.5 text-xs font-medium bg-background border-border rounded-md shadow-xs hover:bg-accent text-foreground gap-1.5 min-w-[76px] cursor-pointer">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent
              side="top"
              className="shadow-md rounded-lg border-border p-1 min-w-[100px] bg-popover text-popover-foreground"
            >
              {pageSizeOptions.map((size) => (
                <SelectItem
                  key={size}
                  value={`${size}`}
                  className="text-xs cursor-pointer rounded-md"
                >
                  <Typography
                    as="span"
                    variant="small"
                    className="text-xs font-normal font-mono tabular-nums"
                  >
                    {size} / trang
                  </Typography>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Index Indicator */}
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
          <Typography as="span" variant="muted" className="text-xs">
            Trang
          </Typography>
          <span className="font-mono tabular-nums font-semibold text-foreground text-xs">
            {pageIndex + 1}
          </span>
          <span className="text-muted-foreground/60">/</span>
          <span className="font-mono tabular-nums font-medium text-foreground text-xs">
            {pageCount}
          </span>
        </div>

        {/* Nav Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground text-foreground disabled:opacity-30 cursor-pointer transition-colors"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="Trang đầu"
          >
            <span className="sr-only">Trang đầu</span>
            <ChevronsLeftIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground text-foreground disabled:opacity-30 cursor-pointer transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Trang trước"
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground text-foreground disabled:opacity-30 cursor-pointer transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Trang sau"
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-md border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground text-foreground disabled:opacity-30 cursor-pointer transition-colors"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            title="Trang cuối"
          >
            <span className="sr-only">Trang cuối</span>
            <ChevronsRightIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
