import { SlidersHorizontalIcon, RotateCcwIcon, RowsIcon, CheckIcon } from 'lucide-react';
import type { RowData } from '@tanstack/react-table';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { TableDensity, DataTableInstance } from './types';

interface DataTableViewOptionsProps<TData extends RowData = any> {
  table: DataTableInstance<TData>;
  density: TableDensity;
  onDensityChange: (density: TableDensity) => void;
}

export function DataTableViewOptions<TData extends RowData = any>({
  table,
  density,
  onDensityChange,
}: DataTableViewOptionsProps<TData>) {
  const columns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8.5 text-xs border-border bg-background dark:bg-zinc-900 hover:bg-accent text-foreground font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <SlidersHorizontalIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
          Tùy chỉnh cột
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 shadow-xl border-border/60 bg-popover">
        <DropdownMenuLabel className="text-xs font-semibold text-foreground/80 flex items-center justify-between">
          <span>Độ giãn dòng (Density)</span>
          <RowsIcon className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onDensityChange('compact')}
          className="cursor-pointer text-xs flex justify-between"
        >
          <span>Gọn (Compact)</span>
          {density === 'compact' && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDensityChange('normal')}
          className="cursor-pointer text-xs flex justify-between"
        >
          <span>Vừa phải (Normal)</span>
          {density === 'normal' && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDensityChange('comfortable')}
          className="cursor-pointer text-xs flex justify-between"
        >
          <span>Rộng rãi (Comfortable)</span>
          {density === 'comfortable' && <CheckIcon className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-semibold text-foreground/80">
          Hiển thị cột
        </DropdownMenuLabel>
        {columns.map((column) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize cursor-pointer text-xs"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
            </DropdownMenuCheckboxItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            table.resetColumnSizing();
            table.resetColumnVisibility();
            table.resetColumnOrder();
          }}
          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcwIcon className="mr-2 h-3.5 w-3.5" />
          Đặt lại mặc định
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
