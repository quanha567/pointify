import type { Table } from '@tanstack/react-table';
import { CheckCircle2Icon, DownloadIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface DataTableFloatingBarProps<TData> {
  table: Table<TData>;
  onExportSelected?: (selectedRows: TData[]) => void;
  children?: React.ReactNode;
}

export function DataTableFloatingBar<TData>({
  table,
  onExportSelected,
  children,
}: DataTableFloatingBarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;

  if (count === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in-0 slide-in-from-bottom-5 duration-300">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-foreground text-background shadow-2xl border border-border/20 backdrop-blur-xl">
        <div className="flex items-center gap-2 pr-3 border-r border-background/20 text-xs font-medium">
          <CheckCircle2Icon className="h-4 w-4 text-emerald-400" />
          <span>
            Đã chọn <strong>{count}</strong> mục
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {children}

          {onExportSelected && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const data = selectedRows.map((r) => r.original);
                onExportSelected(data);
              }}
              className="h-7 px-2.5 text-xs bg-background/20 hover:bg-background/30 text-background border-0"
            >
              <DownloadIcon className="mr-1.5 h-3 w-3" />
              Xuất ({count})
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.toggleAllRowsSelected(false)}
            className="h-7 px-2 text-xs text-background/80 hover:text-background hover:bg-background/20 rounded-full"
          >
            <XIcon className="h-3.5 w-3.5 mr-1" />
            Bỏ chọn
          </Button>
        </div>
      </div>
    </div>
  );
}
