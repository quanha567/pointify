import { DownloadIcon, SearchIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';
import type { DataTableToolbarProps } from './types';

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Tìm kiếm dữ liệu...',
  searchColumnId,
  density,
  onDensityChange,
  facetedFilters = [],
  onExportCsv,
  extraActions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || !!table.getState().globalFilter;

  const searchValue = searchColumnId
    ? ((table.getColumn(searchColumnId)?.getFilterValue() as string) ?? '')
    : ((table.getState().globalFilter as string) ?? '');

  const handleSearchChange = (value: string) => {
    if (searchColumnId) {
      table.getColumn(searchColumnId)?.setFilterValue(value);
    } else {
      table.setGlobalFilter(value);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs sm:w-64">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="h-8 pl-8 pr-7 text-xs border-border/80 focus-visible:ring-primary/30"
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
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
            className="h-8 text-xs border-border/80 hover:border-primary/50 text-foreground/80 hover:text-foreground transition-colors"
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
