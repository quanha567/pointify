import type { RowData } from '@tanstack/react-table';
import { CheckIcon, PlusCircleIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import type { DataTableFilterOption, DataTableColumn } from './types';

interface DataTableFacetedFilterProps<TData extends RowData = any, TValue = any> {
  column?: DataTableColumn<TData, TValue>;
  title?: string;
  options: DataTableFilterOption[];
}

export function DataTableFacetedFilter<TData extends RowData = any, TValue = any>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const selectedValues = new Set((column?.getFilterValue() as string[]) || []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8.5 border-border bg-background dark:bg-zinc-900 hover:bg-accent text-foreground text-xs shadow-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          <PlusCircleIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1.5 h-4" />
              <Badge className="rounded-md px-1.5 py-0 h-4 font-semibold lg:hidden text-[10px] bg-primary/15 text-primary border border-primary/25 dark:bg-primary/20 dark:text-primary-foreground">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge className="rounded-md px-1.5 py-0 h-4 font-semibold text-[10px] bg-primary/15 text-primary border border-primary/25 dark:bg-primary/20 dark:text-primary-foreground">
                    {selectedValues.size} đã chọn
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        key={option.value}
                        className="rounded-md px-1.5 py-0 h-4 font-semibold text-[10px] bg-primary/15 text-primary border border-primary/25 dark:bg-primary/20 dark:text-primary-foreground"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 shadow-xl border-border/60" align="start">
        <Command>
          <CommandInput placeholder={`Tìm ${title}...`} className="text-xs" />
          <CommandList>
            <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
              Không tìm thấy.
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(filterValues.length ? filterValues : undefined);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary/40',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <CheckIcon className="h-3 w-3" />
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="flex-1">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center text-xs font-medium text-destructive cursor-pointer hover:bg-destructive/10"
                  >
                    Xóa bộ lọc
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
