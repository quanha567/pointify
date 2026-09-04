import { useEffect, useState, useCallback } from 'react';
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
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { Kbd } from '../ui/kbd';

interface SearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchDialog({ open: controlledOpen, onOpenChange }: SearchDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      if (isControlled && onOpenChange) {
        onOpenChange(value);
      } else {
        setInternalOpen(value);
      }
    },
    [isControlled, onOpenChange],
  );

  const navigate = useNavigate();
  const { setTheme } = useTheme();
  const { logout } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [setOpen],
  );

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-9 w-full justify-start rounded-xl border-border/70 bg-muted/40 text-sm font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground shadow-none sm:pr-12 md:w-48 lg:w-64 cursor-pointer"
      >
        <SearchIcon className="mr-2 size-4 shrink-0 opacity-60" />
        <span className="hidden lg:inline-flex">{t('admin.search.trigger')}</span>
        <span className="inline-flex lg:hidden">{t('admin.search.triggerShort')}</span>
        <Kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none opacity-100 sm:flex">
          ⌘ + K
        </Kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t('admin.search.dialogTitle')}>
        <CommandInput placeholder={t('admin.search.inputPlaceholder')} />
        <CommandList>
          <CommandEmpty>{t('admin.search.empty')}</CommandEmpty>

          <CommandGroup heading={t('admin.search.groupNav')}>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  void navigate({ to: '/admin' });
                })
              }
              className="cursor-pointer gap-2.5"
            >
              <LayoutDashboardIcon className="size-4 text-muted-foreground" />
              <span>{t('admin.search.navDashboard')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  void navigate({ to: '/admin/users' });
                })
              }
              className="cursor-pointer gap-2.5"
            >
              <UsersIcon className="size-4 text-primary" />
              <span>{t('admin.search.navUsers')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  void navigate({ to: '/admin' });
                })
              }
              className="cursor-pointer gap-2.5"
            >
              <LayersIcon className="size-4 text-muted-foreground" />
              <span>{t('admin.search.navRooms')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  void navigate({ to: '/admin' });
                })
              }
              className="cursor-pointer gap-2.5"
            >
              <DicesIcon className="size-4 text-muted-foreground" />
              <span>{t('admin.search.navDecks')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  void navigate({ to: '/admin' });
                })
              }
              className="cursor-pointer gap-2.5"
            >
              <SettingsIcon className="size-4 text-muted-foreground" />
              <span>{t('admin.search.navSettings')}</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t('admin.search.groupTheme')}>
            <CommandItem
              onSelect={() => runCommand(() => setTheme('light'))}
              className="cursor-pointer gap-2.5"
            >
              <SunIcon className="size-4 text-amber-500" />
              <span>{t('admin.search.themeLight')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => setTheme('dark'))}
              className="cursor-pointer gap-2.5"
            >
              <MoonIcon className="size-4 text-blue-400" />
              <span>{t('admin.search.themeDark')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  void navigate({ to: '/' });
                })
              }
              className="cursor-pointer gap-2.5"
            >
              <HomeIcon className="size-4 text-emerald-500" />
              <span>{t('admin.search.backToHome')}</span>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                runCommand(() => {
                  void logout();
                })
              }
              className="cursor-pointer gap-2.5 text-destructive"
            >
              <LogOutIcon className="size-4" />
              <span>{t('admin.search.signOut')}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
