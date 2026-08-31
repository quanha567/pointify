import { CheckCircle2Icon, DownloadIcon, XIcon } from 'lucide-react';
import type { RowData } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Typography } from '../ui/typography';
import type { DataTableInstance } from './types';

interface DataTableFloatingBarProps<TData extends RowData = any> {
  table: DataTableInstance<TData>;
  onExportSelected?: (selectedRows: TData[]) => void;
  children?: React.ReactNode;
}

export function DataTableFloatingBar<TData extends RowData = any>({
  table,
  onExportSelected,
  children,
}: DataTableFloatingBarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-card/95 dark:bg-zinc-900/95 text-foreground shadow-2xl border border-border/80 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10">
        {/* Selection Count Badge */}
        <div className="flex items-center gap-2 pr-3 border-r border-border/80 text-xs">
          <span className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary">
            <CheckCircle2Icon className="size-3.5" />
          </span>
          <Typography as="span" variant="small" className="text-xs font-semibold text-foreground">
            Đã chọn <strong className="text-primary font-bold">{count}</strong> mục
          </Typography>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-1.5">
          {children}

          {onExportSelected && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const data = selectedRows.map((r) => r.original);
                onExportSelected(data);
              }}
              className="h-7.5 px-3 text-xs bg-background/80 hover:bg-muted text-foreground border-border/80 rounded-full shadow-2xs font-medium cursor-pointer"
            >
              <DownloadIcon className="mr-1.5 size-3.5 text-muted-foreground" />
              <Typography as="span" variant="small" className="text-xs font-medium">
                Xuất ({count})
              </Typography>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.toggleAllRowsSelected(false)}
            className="h-7.5 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full cursor-pointer transition-colors"
          >
            <XIcon className="size-3.5 mr-1" />
            <Typography as="span" variant="small" className="text-xs font-normal">
              Bỏ chọn
            </Typography>
          </Button>
        </div>
      </div>
    </div>
  );
}
