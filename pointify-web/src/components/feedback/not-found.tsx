import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface NotFoundPageProps {
  backTo?: string;
  [key: string]: unknown;
}

export function NotFoundPage({ backTo = '/' }: NotFoundPageProps = {}) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="size-16 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center">
        <FileQuestion className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t('notFound.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('notFound.description')}</p>
      </div>
      <Button asChild variant="outline" className="gap-2 rounded-xl cursor-pointer">
        <Link to={backTo}>
          <ArrowLeft className="size-4" />
          <span>{t('notFound.backHome')}</span>
        </Link>
      </Button>
    </div>
  );
}
