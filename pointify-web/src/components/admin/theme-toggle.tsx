import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { MoonIcon, SunIcon, LaptopIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
          className="size-9 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
          title={t('admin.theme.toggleTitle')}
        >
          <SunIcon className="size-4 rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('admin.theme.toggleTitle')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 p-1.5 rounded-2xl shadow-xl border-border bg-popover/95 backdrop-blur-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium cursor-pointer rounded-xl"
          >
            <SunIcon className="size-4 text-amber-500" />
            <span>{t('admin.theme.light')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium cursor-pointer rounded-xl"
          >
            <MoonIcon className="size-4 text-blue-400" />
            <span>{t('admin.theme.dark')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium cursor-pointer rounded-xl"
          >
            <LaptopIcon className="size-4 text-muted-foreground" />
            <span>{t('admin.theme.system')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
