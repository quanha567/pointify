import { useTranslation } from 'react-i18next';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypographyH4, TypographyMuted } from '@/components/ui/typography';

export interface AdminUsersErrorProps {
  error?: Error;
  reset?: () => void;
}

export function AdminUsersError({ error, reset }: AdminUsersErrorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center">
      <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-3">
        <AlertTriangleIcon className="size-8" />
      </div>
      <TypographyH4 className="text-base font-bold text-foreground">
        {t('admin.users.error.title')}
      </TypographyH4>
      <TypographyMuted className="text-xs max-w-sm mt-1 mb-4">
        {error?.message || t('admin.users.error.desc')}
      </TypographyMuted>
      {reset && (
        <Button
          variant="outline"
          size="sm"
          onClick={reset}
          className="h-8.5 px-3 text-xs gap-1.5 rounded-lg cursor-pointer"
        >
          <RefreshCwIcon className="size-3.5" />
          <span>{t('admin.users.error.retry')}</span>
        </Button>
      )}
    </div>
  );
}
