import { SlidersHorizontalIcon, RotateCcwIcon, RowsIcon, CheckIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const columns = table
    .getAllColumns()
    .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="ml-auto h-[38px] px-3.5 text-sm border-border bg-card hover:bg-accent text-foreground font-medium rounded-md shadow-xs transition-colors cursor-pointer gap-2"
        >
          <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          <span>{t('common.table.customizeColumns')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 shadow-md rounded-lg border-border bg-popover text-popover-foreground p-1"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-foreground/80 flex items-center justify-between px-2 py-1.5">
          <span>Độ giãn dòng (Density)</span>
          <RowsIcon className="size-3.5 text-muted-foreground" />
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onDensityChange('compact')}
          className="cursor-pointer text-xs rounded-md flex justify-between px-2 py-1.5"
        >
          <span>Gọn (Compact)</span>
          {density === 'compact' && <CheckIcon className="size-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDensityChange('normal')}
          className="cursor-pointer text-xs rounded-md flex justify-between px-2 py-1.5"
        >
          <span>Vừa phải (Normal)</span>
          {density === 'normal' && <CheckIcon className="size-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDensityChange('comfortable')}
          className="cursor-pointer text-xs rounded-md flex justify-between px-2 py-1.5"
        >
          <span>Rộng rãi (Comfortable)</span>
          {density === 'comfortable' && <CheckIcon className="size-3.5 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-border/60" />

        <DropdownMenuLabel className="text-xs font-semibold text-foreground/80 px-2 py-1.5">
          Hiển thị cột
        </DropdownMenuLabel>
        {columns.map((column) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize cursor-pointer text-xs rounded-md px-2 py-1.5"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
            </DropdownMenuCheckboxItem>
          );
        })}

        <DropdownMenuSeparator className="my-1 bg-border/60" />
        <DropdownMenuItem
          onClick={() => {
            table.resetColumnSizing();
            table.resetColumnVisibility();
            table.resetColumnOrder();
          }}
          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground rounded-md px-2 py-1.5"
        >
          <RotateCcwIcon className="mr-2 size-3.5" />
          Đặt lại mặc định
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
