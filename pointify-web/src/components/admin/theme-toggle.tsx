import { useTranslation } from 'react-i18next';
import { ThemeToggle as MotionThemeToggle } from '@/components/motion/theme-toggle';

export function ThemeToggle() {
  const { t } = useTranslation('admin');

  return (
    <MotionThemeToggle
      variant="circle"
      start="center"
      className="size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
      iconClassName="size-5"
      title={t('admin.theme.toggleTitle')}
      aria-label={t('admin.theme.toggleTitle')}
    />
  );
}
