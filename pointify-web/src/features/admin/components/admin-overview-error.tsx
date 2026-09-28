import { useTranslation } from 'react-i18next';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypographyH4, TypographyMuted } from '@/components/ui/typography';

export interface AdminOverviewErrorProps {
  error?: Error;
  reset?: () => void;
}

export function AdminOverviewError({ error, reset }: AdminOverviewErrorProps) {
  const { t } = useTranslation('admin');

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center">
      <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-3">
        <AlertTriangleIcon className="size-8" />
      </div>
      <TypographyH4 className="text-lg sm:text-xl font-semibold text-foreground">
        {t('admin.users.error.title')}
      </TypographyH4>
      <TypographyMuted className="text-sm max-w-sm mt-1 mb-4 leading-normal">
        {error?.message || t('admin.users.error.desc')}
      </TypographyMuted>
      {reset && (
        <Button
          variant="outline"
          onClick={reset}
          className="h-[38px] px-4 text-sm font-medium gap-2 rounded-md cursor-pointer"
        >
          <RefreshCwIcon className="size-4" />
          <span>{t('admin.users.error.retry')}</span>
        </Button>
      )}
    </div>
  );
}
