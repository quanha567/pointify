import { useTranslation } from 'react-i18next';
import { Logo } from '@/components/logo';

export function PublicFooter() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-1.5">
          <Logo variant="icon" size={18} animated={false} />
          <span>{t('footer.brand')}</span>
        </div>
        <p className="text-muted-foreground/70">{t('footer.tagline')}</p>
      </div>
    </footer>
  );
}
