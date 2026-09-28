import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import {
  SearchIcon,
  LayoutDashboardIcon,
  UsersIcon,
  LayersIcon,
  DicesIcon,
  SettingsIcon,
  HomeIcon,
  SunIcon,
  MoonIcon,
  LogOutIcon,
} from 'lucide-react';
import { CommandPalette, type CommandItem } from '@/components/motion/command-palette';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { Kbd } from '../ui/kbd';

interface SearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function SearchDialog({ open, onOpenChange, hideTrigger = false }: SearchDialogProps) {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { logout } = useAuthStore();
  const { t } = useTranslation('admin');

  const items: CommandItem[] = useMemo(
    () => [
      {
        id: 'nav-dashboard',
        label: t('admin.search.navDashboard'),
        group: t('admin.search.groupNav'),
        icon: LayoutDashboardIcon,
        keywords: ['dashboard', 'tong quan', 'overview', 'stats'],
        onSelect: () => {
          void navigate({ to: '/admin' });
        },
      },
      {
        id: 'nav-users',
        label: t('admin.search.navUsers'),
        group: t('admin.search.groupNav'),
        icon: UsersIcon,
        keywords: ['users', 'nguoi dung', 'accounts', 'tai khoan', 'members'],
        onSelect: () => {
          void navigate({ to: '/admin/users' });
        },
      },
      {
        id: 'nav-rooms',
        label: t('admin.search.navRooms'),
        group: t('admin.search.groupNav'),
        icon: LayersIcon,
        keywords: ['rooms', 'phong', 'poker', 'scrum'],
        onSelect: () => {
          void navigate({ to: '/admin' });
        },
      },
      {
        id: 'nav-decks',
        label: t('admin.search.navDecks'),
        group: t('admin.search.groupNav'),
        icon: DicesIcon,
        keywords: ['decks', 'bo bai', 'cards', 'la bai'],
        onSelect: () => {
          void navigate({ to: '/admin' });
        },
      },
      {
        id: 'nav-settings',
        label: t('admin.search.navSettings'),
        group: t('admin.search.groupNav'),
        icon: SettingsIcon,
        keywords: ['settings', 'cai dat', 'he thong'],
        onSelect: () => {
          void navigate({ to: '/admin' });
        },
      },
      {
        id: 'theme-light',
        label: t('admin.search.themeLight'),
        group: t('admin.search.groupTheme'),
        icon: SunIcon,
        keywords: ['light', 'sang', 'theme', 'bright'],
        onSelect: () => setTheme('light'),
      },
      {
        id: 'theme-dark',
        label: t('admin.search.themeDark'),
        group: t('admin.search.groupTheme'),
        icon: MoonIcon,
        keywords: ['dark', 'toi', 'theme', 'night'],
        onSelect: () => setTheme('dark'),
      },
      {
        id: 'back-to-home',
        label: t('admin.search.backToHome'),
        group: t('admin.search.groupTheme'),
        icon: HomeIcon,
        keywords: ['home', 'trang chu'],
        onSelect: () => {
          void navigate({ to: '/' });
        },
      },
      {
        id: 'sign-out',
        label: t('admin.search.signOut'),
        group: t('admin.search.groupTheme'),
        icon: LogOutIcon,
        keywords: ['logout', 'dang xuat', 'sign out'],
        onSelect: () => {
          void logout();
        },
      },
    ],
    [navigate, setTheme, logout, t],
  );

  return (
    <>
      {!hideTrigger && (
        <Button
          variant="outline"
          onClick={() => onOpenChange?.(true)}
          className="relative h-[38px] w-full justify-start rounded-md border-border/70 bg-card/90 text-sm font-medium text-muted-foreground hover:bg-card hover:text-foreground hover:border-primary/40 shadow-2xs sm:pr-12 md:w-52 lg:w-68 cursor-pointer transition-all duration-150"
        >
          <SearchIcon className="mr-2 size-4 shrink-0 text-muted-foreground/70" />
          <span className="hidden sm:inline-flex text-sm">{t('admin.search.trigger')}</span>
          <span className="inline-flex sm:hidden text-sm">{t('admin.search.triggerShort')}</span>
          <Kbd className="pointer-events-none absolute right-2 top-1.5 hidden h-6 select-none opacity-90 sm:flex rounded-sm px-1.5 text-[11px] font-semibold bg-muted/60 border border-border/60">
            ⌘K
          </Kbd>
        </Button>
      )}

      <CommandPalette
        items={items}
        shortcut="k"
        open={open}
        onOpenChange={onOpenChange}
        placeholder={t('admin.search.inputPlaceholder')}
        emptyMessage={t('admin.search.empty')}
      />
    </>
  );
}
