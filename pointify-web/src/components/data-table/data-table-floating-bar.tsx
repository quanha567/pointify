import { CheckCircle2Icon, DownloadIcon, XIcon } from 'lucide-react';
import type { RowData } from '@tanstack/react-table';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from '../ui/button';
import { Typography } from '../ui/typography';
import { EASE_OUT } from '@/lib/ease';
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
  const reduce = useReducedMotion();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const count = selectedRows.length;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, y: 16, scale: 0.96, transition: { duration: 0.12, ease: EASE_OUT } }
          }
          transition={reduce ? { duration: 0.1 } : { duration: 0.18, ease: EASE_OUT }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/95 dark:bg-zinc-900/95 text-foreground shadow-lg border border-border backdrop-blur-xl">
            {/* Selection Count Badge */}
            <div className="flex items-center gap-2 pr-3 border-r border-border text-xs">
              <span className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary">
                <CheckCircle2Icon className="size-3.5" />
              </span>
              <Typography
                as="span"
                variant="small"
                className="text-xs font-semibold text-foreground"
              >
                Đã chọn{' '}
                <strong className="font-mono tabular-nums text-primary font-bold">{count}</strong>{' '}
                mục
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
                  className="h-7.5 px-3 text-xs bg-background hover:bg-accent hover:text-accent-foreground text-foreground border-border rounded-md shadow-xs font-medium cursor-pointer transition-colors"
                >
                  <DownloadIcon className="mr-1.5 size-3.5 text-muted-foreground" />
                  <Typography as="span" variant="small" className="text-xs font-medium">
                    Xuất (<span className="font-mono tabular-nums">{count}</span>)
                  </Typography>
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => table.toggleAllRowsSelected(false)}
                className="h-7.5 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md cursor-pointer transition-colors"
              >
                <XIcon className="size-3.5 mr-1" />
                <Typography as="span" variant="small" className="text-xs font-normal">
                  Bỏ chọn
                </Typography>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
