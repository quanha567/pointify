import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  EyeOffIcon,
  PinIcon,
  PinOffIcon,
} from 'lucide-react';
import type { RowData } from '@tanstack/react-table';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Typography } from '../ui/typography';
import type { DataTableColumn } from './types';

interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue = any,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: DataTableColumn<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData extends RowData, TValue = any>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanPin() && !column.getCanHide()) {
    return (
      <Typography
        as="div"
        variant="small"
        className={cn(
          'text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none',
          className,
        )}
      >
        {title}
      </Typography>
    );
  }

  const isPinned = column.getIsPinned();
  const sortDirection = column.getIsSorted();

  return (
    <div className={cn('flex items-center space-x-1 group/header', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'group/btn -ml-2 h-7 px-2 hover:bg-muted/80 data-[state=open]:bg-muted rounded-md transition-colors select-none gap-1.5 cursor-pointer',
              (sortDirection || isPinned) && 'bg-muted/60',
            )}
          >
            <Typography
              as="span"
              variant="small"
              className={cn(
                'truncate text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover/btn:text-foreground transition-colors',
                (sortDirection || isPinned) && 'text-foreground font-bold',
              )}
            >
              {title}
            </Typography>
            {sortDirection === 'desc' ? (
              <span className="flex items-center justify-center size-4 rounded-xs bg-primary/10 text-primary">
                <ArrowDownIcon className="size-3 stroke-[2.5]" />
              </span>
            ) : sortDirection === 'asc' ? (
              <span className="flex items-center justify-center size-4 rounded-xs bg-primary/10 text-primary">
                <ArrowUpIcon className="size-3 stroke-[2.5]" />
              </span>
            ) : (
              <ChevronsUpDownIcon className="size-3 text-muted-foreground/50 group-hover/btn:text-muted-foreground transition-colors" />
            )}
            {isPinned && (
              <span title={`Đang ghim ${isPinned === 'start' ? 'trái' : 'phải'}`}>
                <PinIcon className="size-3 rotate-45 text-primary fill-primary/20" />
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-48 bg-popover shadow-md border-border rounded-lg p-1 text-popover-foreground"
        >
          {column.getCanSort() && (
            <>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(false)}
                className="cursor-pointer text-xs rounded-md flex items-center justify-between"
              >
                <div className="flex items-center">
                  <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground" />
                  Sắp xếp tăng dần
                </div>
                {sortDirection === 'asc' && <CheckIcon className="size-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.toggleSorting(true)}
                className="cursor-pointer text-xs rounded-md flex items-center justify-between"
              >
                <div className="flex items-center">
                  <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground" />
                  Sắp xếp giảm dần
                </div>
                {sortDirection === 'desc' && <CheckIcon className="size-3.5 text-primary" />}
              </DropdownMenuItem>
              {sortDirection && (
                <DropdownMenuItem
                  onClick={() => column.clearSorting()}
                  className="cursor-pointer text-xs rounded-md text-muted-foreground"
                >
                  <ChevronsUpDownIcon className="mr-2 size-3.5" />
                  Bỏ sắp xếp
                </DropdownMenuItem>
              )}
            </>
          )}

          {column.getCanPin() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => column.pin('start')}
                className="cursor-pointer text-xs rounded-md flex items-center justify-between"
              >
                <div className="flex items-center">
                  <PinIcon className="mr-2 size-3.5 text-muted-foreground" />
                  Ghim bên trái
                </div>
                {isPinned === 'start' && <CheckIcon className="size-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => column.pin('end')}
                className="cursor-pointer text-xs rounded-md flex items-center justify-between"
              >
                <div className="flex items-center">
                  <PinIcon className="mr-2 size-3.5 text-muted-foreground rotate-90" />
                  Ghim bên phải
                </div>
                {isPinned === 'end' && <CheckIcon className="size-3.5 text-primary" />}
              </DropdownMenuItem>
              {isPinned && (
                <DropdownMenuItem
                  onClick={() => column.pin(false)}
                  className="cursor-pointer text-xs rounded-md text-muted-foreground"
                >
                  <PinOffIcon className="mr-2 size-3.5" />
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
                className="cursor-pointer text-xs rounded-md text-muted-foreground"
              >
                <EyeOffIcon className="mr-2 size-3.5" />
                Ẩn cột này
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
