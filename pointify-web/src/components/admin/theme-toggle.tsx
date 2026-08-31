import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { MoonIcon, SunIcon, LaptopIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
          title={t('admin.theme.toggleTitle')}
        >
          <SunIcon className="size-4 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('admin.theme.toggleTitle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 shadow-lg border-border">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-lg"
        >
          <SunIcon className="size-3.5 text-amber-500" />
          <span>{t('admin.theme.light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-lg"
        >
          <MoonIcon className="size-3.5 text-blue-400" />
          <span>{t('admin.theme.dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium cursor-pointer rounded-lg"
        >
          <LaptopIcon className="size-3.5 text-muted-foreground" />
          <span>{t('admin.theme.system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
