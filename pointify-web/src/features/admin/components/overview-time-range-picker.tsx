import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TimeRangePreset } from '../types/admin-overview.types';

interface OverviewTimeRangePickerProps {
  value: TimeRangePreset;
  onChange: (range: TimeRangePreset) => void;
  disabled?: boolean;
}

export function OverviewTimeRangePicker({
  value,
  onChange,
  disabled,
}: OverviewTimeRangePickerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block">
        {t('admin.overview.timeRange.label')}
      </span>
      <Tabs
        value={value}
        onValueChange={(val) => onChange(val as TimeRangePreset)}
        className="w-auto"
      >
        <TabsList className="h-8.5 p-0.5 bg-muted/80 border border-border">
          <TabsTrigger
            value="7d"
            disabled={disabled}
            className="text-xs px-2.5 py-1 font-medium data-active:bg-background data-active:shadow-xs"
          >
            {t('admin.overview.timeRange.range7d')}
          </TabsTrigger>
          <TabsTrigger
            value="30d"
            disabled={disabled}
            className="text-xs px-2.5 py-1 font-medium data-active:bg-background data-active:shadow-xs"
          >
            {t('admin.overview.timeRange.range30d')}
          </TabsTrigger>
          <TabsTrigger
            value="90d"
            disabled={disabled}
            className="text-xs px-2.5 py-1 font-medium data-active:bg-background data-active:shadow-xs"
          >
            {t('admin.overview.timeRange.range90d')}
          </TabsTrigger>
          <TabsTrigger
            value="all"
            disabled={disabled}
            className="text-xs px-2.5 py-1 font-medium data-active:bg-background data-active:shadow-xs"
          >
            {t('admin.overview.timeRange.rangeAll')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
