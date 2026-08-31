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
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-border/80 bg-muted/20 dark:bg-zinc-950/40 rounded-b-xl">
      {/* Left: Record Range & Selection Status */}
      <div className="flex items-center gap-2">
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2">
            <Typography as="span" variant="small" className="text-foreground/85 font-medium">
              Đã chọn <strong className="font-semibold text-foreground">{selectedCount}</strong> /{' '}
              <strong className="font-semibold text-foreground">{displayTotal}</strong> bản ghi
            </Typography>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Typography as="span" variant="small" className="text-foreground/85 font-medium">
              Hiển thị{' '}
              <strong className="font-semibold text-foreground">
                {startRow} - {endRow}
              </strong>{' '}
              / <strong className="font-semibold text-foreground">{displayTotal}</strong> bản ghi
            </Typography>
          </div>
        )}
      </div>

      {/* Right: Page Size + Page Indicator + Nav Buttons */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <Typography as="span" variant="muted" className="whitespace-nowrap">
            Số dòng:
          </Typography>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 px-2.5 text-xs font-medium bg-background border-border/80 rounded-lg shadow-2xs hover:bg-accent/60 gap-1.5 min-w-[76px] cursor-pointer">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top" className="shadow-xl border-border/80 p-1 min-w-[100px]">
              {pageSizeOptions.map((size) => (
                <SelectItem
                  key={size}
                  value={`${size}`}
                  className="text-xs cursor-pointer rounded-md"
                >
                  <Typography as="span" variant="small" className="text-xs font-normal">
                    {size} / trang
                  </Typography>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Index Indicator */}
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Typography as="span" variant="muted">
            Trang
          </Typography>
          <Typography as="span" variant="small" className="font-semibold text-foreground">
            {pageIndex + 1}
          </Typography>
          <Typography as="span" variant="muted" className="text-muted-foreground/60">
            /
          </Typography>
          <Typography as="span" variant="small" className="font-medium text-foreground">
            {pageCount}
          </Typography>
        </div>

        {/* Nav Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border/80 bg-background shadow-2xs hover:bg-muted/80 text-foreground disabled:opacity-30 cursor-pointer"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="Trang đầu"
          >
            <span className="sr-only">Trang đầu</span>
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border/80 bg-background shadow-2xs hover:bg-muted/80 text-foreground disabled:opacity-30 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Trang trước"
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border/80 bg-background shadow-2xs hover:bg-muted/80 text-foreground disabled:opacity-30 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Trang sau"
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-border/80 bg-background shadow-2xs hover:bg-muted/80 text-foreground disabled:opacity-30 cursor-pointer"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            title="Trang cuối"
          >
            <span className="sr-only">Trang cuối</span>
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
