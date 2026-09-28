import type { RowData } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  singleSelect?: boolean;
}

export function DataTableFacetedFilter<TData extends RowData = any, TValue = any>({
  column,
  title,
  options,
  singleSelect = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const { t } = useTranslation();
  const filterValue = column?.getFilterValue();

  const selectedValues = useMemo(() => {
    if (Array.isArray(filterValue)) {
      if (singleSelect && filterValue.length > 0) {
        return new Set([String(filterValue[filterValue.length - 1])]);
      }
      return new Set(filterValue.map(String));
    }
    if (
      typeof filterValue === 'string' ||
      typeof filterValue === 'number' ||
      typeof filterValue === 'boolean'
    ) {
      return new Set([String(filterValue)]);
    }
    return new Set<string>();
  }, [filterValue, singleSelect]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-[38px] px-3 text-sm font-medium border-border bg-card hover:bg-accent text-foreground shadow-xs rounded-md transition-colors cursor-pointer gap-2"
        >
          <PlusCircleIcon className="size-4 text-muted-foreground" />
          <span>{title}</span>
          {selectedValues.size > 0 && (
            <>
              <Separator
                orientation="vertical"
                className="mx-1 h-4 w-px self-center shrink-0 bg-border"
              />
              <Badge
                variant="outline"
                className="h-5 rounded-xs px-1.5 text-[11px] font-medium lg:hidden bg-primary/10 text-brand-hover dark:text-primary-foreground border-primary/20 dark:border-primary/30"
              >
                {singleSelect
                  ? (options.find((opt) => selectedValues.has(opt.value))?.label ??
                    selectedValues.size)
                  : selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex items-center">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="outline"
                    className="h-5 rounded-xs px-1.5 text-[11px] font-medium bg-primary/10 text-brand-hover dark:text-primary-foreground border-primary/20 dark:border-primary/30"
                  >
                    {t('common.table.selectedCount', { count: selectedValues.size })}
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        key={option.value}
                        variant="outline"
                        className="h-5 rounded-xs px-1.5 text-[11px] font-medium bg-primary/10 text-brand-hover dark:text-primary-foreground border-primary/20 dark:border-primary/30"
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
      <PopoverContent
        className="w-[220px] p-1 shadow-md rounded-lg border-border bg-popover text-popover-foreground"
        align="start"
      >
        <Command className="rounded-md border-0 p-0">
          <CommandInput
            placeholder={`${t('common.table.filter')} ${title || ''}...`}
            className="text-xs sm:text-sm"
          />
          <CommandList className="p-1">
            <CommandEmpty className="py-2.5 text-center text-xs text-muted-foreground">
              {t('common.table.noResults')}
            </CommandEmpty>
            <CommandGroup className="p-0">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (singleSelect) {
                        if (isSelected) {
                          column?.setFilterValue(undefined);
                        } else {
                          column?.setFilterValue([option.value]);
                        }
                      } else {
                        const nextSelected = new Set(selectedValues);
                        if (isSelected) {
                          nextSelected.delete(option.value);
                        } else {
                          nextSelected.add(option.value);
                        }
                        const filterValues = Array.from(nextSelected);
                        column?.setFilterValue(filterValues.length ? filterValues : undefined);
                      }
                    }}
                    className="cursor-pointer text-xs sm:text-sm font-medium rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground data-selected:bg-accent data-selected:text-accent-foreground"
                  >
                    {singleSelect ? (
                      <div
                        className={cn(
                          'mr-2 flex size-4 shrink-0 items-center justify-center rounded-full border transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                            : 'border-border bg-background group-hover/command-item:border-primary/50',
                        )}
                      >
                        {isSelected && (
                          <span className="size-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'mr-2 flex size-4 shrink-0 items-center justify-center rounded-xs border transition-all',
                          isSelected
                            ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                            : 'border-border bg-background group-hover/command-item:border-primary/50 [&_svg]:invisible',
                        )}
                      >
                        <CheckIcon className="size-3" />
                      </div>
                    )}
                    {option.icon && <option.icon className="mr-2 size-3.5 text-muted-foreground" />}
                    <span className="flex-1 truncate">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator className="my-1 bg-border/60" />
                <CommandGroup className="p-0">
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="justify-center text-center text-xs sm:text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-md py-1.5"
                  >
                    {t('common.table.clearFilter')}
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
