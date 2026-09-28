import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserMenuDropdown } from '@/components/layout/user-menu-dropdown';
import { SearchDialog } from '@/components/admin/search-dialog';
import { ThemeToggle } from '@/components/admin/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { AnimatedSidebarTrigger } from '@/components/motion/animated-sidebar';
import { Button } from '@/components/ui/button';
import { BellIcon, SearchIcon } from 'lucide-react';

export function AdminHeader() {
  const { t } = useTranslation('admin');
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border/40 bg-background/80 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-[width,height] ease-linear select-none">
      {/* Left: Search bar pill matching mockup */}
      <div className="flex items-center gap-2.5 flex-1 max-w-xs sm:max-w-sm md:max-w-[420px]">
        <AnimatedSidebarTrigger className="text-muted-foreground hover:text-foreground cursor-pointer" />
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-3 h-[38px] px-3.5 rounded-lg bg-white dark:bg-card border border-border/50 shadow-2xs hover:border-border text-left cursor-pointer transition-all duration-150 group"
        >
          <SearchIcon className="size-4 text-muted-foreground/75 group-hover:text-foreground transition-colors shrink-0" />
          <span className="text-xs sm:text-sm text-muted-foreground/75 font-normal truncate font-sans">
            {t('admin.header.searchPlaceholder')}
          </span>
        </button>
      </div>

      {/* Controlled Search Dialog (without default trigger) */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} hideTrigger />

      {/* Right: Language Switcher, Theme Toggle, Notification Bell, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Multilingual Toggle */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Bell with pink count 3 badge matching mockup */}
        <Button
          variant="ghost"
          size="icon"
          className="relative size-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
          title={t('admin.header.notifications')}
          aria-label={t('admin.header.notifications')}
        >
          <BellIcon className="size-5" />
          <span className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-background">
            3
          </span>
        </Button>

        {/* User Profile matching mockup */}
        <UserMenuDropdown variant="admin" />
      </div>
    </header>
  );
}
