import { DownloadIcon, SearchIcon, XIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RowData } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DataTableFacetedFilter } from './data-table-faceted-filter';
import { DataTableViewOptions } from './data-table-view-options';
import type { DataTableToolbarProps } from './types';

export function DataTableToolbar<TData extends RowData = any>({
  table,
  searchPlaceholder,
  searchColumnId,
  density,
  onDensityChange,
  facetedFilters = [],
  onExportCsv,
  extraActions,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation();
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

  const defaultPlaceholder = searchPlaceholder || `${t('common.table.filter')}...`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <div className="relative w-full max-w-xs sm:w-72">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={defaultPlaceholder}
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="h-[38px] pl-9 pr-8 text-sm bg-background border-border shadow-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-md text-foreground placeholder:text-muted-foreground"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-sm transition-colors"
            >
              <XIcon className="size-4" />
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
              singleSelect={filter.singleSelect}
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
            className="h-[38px] px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md cursor-pointer transition-colors gap-1.5"
          >
            <span>{t('common.table.reset')}</span>
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {onExportCsv && (
          <Button
            variant="outline"
            onClick={onExportCsv}
            className="h-[38px] px-3.5 text-sm font-medium border-border bg-card hover:bg-accent text-foreground shadow-xs rounded-md transition-colors cursor-pointer gap-2"
          >
            <DownloadIcon className="size-4 text-muted-foreground" />
            <span>{t('common.table.exportCsv')}</span>
          </Button>
        )}

        <DataTableViewOptions table={table} density={density} onDensityChange={onDensityChange} />

        {extraActions}
      </div>
    </div>
  );
}
