import type { Column } from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
  PinIcon,
  PinOffIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanPin() && !column.getCanHide()) {
    return <div className={cn('font-semibold text-foreground/80', className)}>{title}</div>;
  }

  const isPinned = column.getIsPinned();
  const sortDirection = column.getIsSorted();

  return (
    <div className={cn('flex items-center space-x-1.5', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 data-[state=open]:bg-accent font-semibold hover:bg-accent/70 text-foreground/80 hover:text-foreground text-xs uppercase tracking-wider"
          >
            <span>{title}</span>
            {sortDirection === 'desc' ? (
              <ArrowDownIcon className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : sortDirection === 'asc' ? (
              <ArrowUpIcon className="ml-1.5 h-3.5 w-3.5 text-primary" />
            ) : (
              <ChevronsUpDownIcon className="ml-1.5 h-3.5 w-3.5 opacity-40 group-hover:opacity-100" />
            )}
            {isPinned && (
              <PinIcon className="ml-1 h-3 w-3 rotate-45 text-primary fill-primary/30" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-48 bg-popover/95 backdrop-blur-md shadow-xl border-border/60"
        >
          {column.getCanSort() && (
            <>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(false)}
                className="cursor-pointer text-xs"
              >
                <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Sắp xếp tăng dần
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(true)}
                className="cursor-pointer text-xs"
              >
                <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Sắp xếp giảm dần
              </DropdownMenuItem>
              {sortDirection && (
                <DropdownMenuItem
                  onClick={() => column.clearSorting()}
                  className="cursor-pointer text-xs text-muted-foreground"
                >
                  <ChevronsUpDownIcon className="mr-2 h-3.5 w-3.5" />
                  Bỏ sắp xếp
                </DropdownMenuItem>
              )}
            </>
          )}

          {column.getCanPin() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => column.pin('left')}
                className="cursor-pointer text-xs"
              >
                <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Ghim bên trái
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.pin('right')}
                className="cursor-pointer text-xs"
              >
                <PinIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground rotate-90" />
                Ghim bên phải
              </DropdownMenuItem>
              {isPinned && (
                <DropdownMenuItem
                  onClick={() => column.pin(false)}
                  className="cursor-pointer text-xs text-muted-foreground"
                >
                  <PinOffIcon className="mr-2 h-3.5 w-3.5" />
                  Bỏ ghim cột
                </DropdownMenuItem>
              )}
            </>
          )}

          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => column.toggleVisibility(false)}
                className="cursor-pointer text-xs text-muted-foreground"
              >
                <EyeOffIcon className="mr-2 h-3.5 w-3.5" />
                Ẩn cột này
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
