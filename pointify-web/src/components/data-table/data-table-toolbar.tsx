import { DownloadIcon, SearchIcon, XIcon } from 'lucide-react';
import type { RowData } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';
import type { DataTableToolbarProps } from './types';

export function DataTableToolbar<TData extends RowData = any>({
  table,
  searchPlaceholder = 'Tìm kiếm dữ liệu...',
  searchColumnId,
  density,
  onDensityChange,
  facetedFilters = [],
  onExportCsv,
  extraActions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = (table.state.columnFilters?.length ?? 0) > 0 || !!table.state.globalFilter;

  const searchValue = searchColumnId
    ? ((table.getColumn(searchColumnId)?.getFilterValue() as string) ?? '')
    : ((table.state.globalFilter as string) ?? '');

  const handleSearchChange = (value: string) => {
    if (searchColumnId) {
      table.getColumn(searchColumnId)?.setFilterValue(value);
    } else {
      table.setGlobalFilter(value);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs sm:w-64">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="h-8.5 pl-8 pr-7 text-xs bg-background dark:bg-zinc-900 border-border shadow-xs focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-foreground placeholder:text-muted-foreground"
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {facetedFilters.map((filter) => {
          const col = table.getColumn(filter.columnId);
          if (!col) return null;
          return (
            <DataTableFacetedFilter
              key={filter.columnId}
              column={col}
              title={filter.title}
              options={filter.options}
            />
          );
        })}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
            className="h-8.5 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg cursor-pointer"
          >
            Đặt lại
            <XIcon className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onExportCsv && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCsv}
            className="h-8.5 text-xs border-border bg-background dark:bg-zinc-900 hover:bg-accent text-foreground shadow-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <DownloadIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            Xuất CSV
          </Button>
        )}

        <DataTableViewOptions table={table} density={density} onDensityChange={onDensityChange} />

        {extraActions}
      </div>
    </div>
  );
}
