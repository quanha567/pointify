import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/ease';
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
  const { t } = useTranslation('admin');
  const reduce = useReducedMotion();

  const presets: { id: TimeRangePreset; label: string }[] = [
    { id: '7d', label: t('admin.overview.timeRange.range7d') },
    { id: '30d', label: t('admin.overview.timeRange.range30d') },
    { id: '90d', label: t('admin.overview.timeRange.range90d') },
    { id: 'all', label: t('admin.overview.timeRange.rangeAll') },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline-block">
        {t('admin.overview.timeRange.label')}
      </span>
      <div className="flex items-center h-8.5 p-0.5 rounded-md bg-muted/80 border border-border">
        {presets.map((preset) => {
          const isActive = value === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset.id)}
              className={cn(
                'relative px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer select-none',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground disabled:opacity-50',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-overview-time-range-pill"
                  transition={reduce ? { duration: 0 } : { duration: 0.16, ease: EASE_OUT }}
                  className="absolute inset-0 rounded-sm bg-background shadow-xs border border-border/40"
                />
              )}
              <span className="relative z-10">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
