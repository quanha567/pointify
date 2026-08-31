import { AdminBreadcrumbs } from '@/components/admin/admin-breadcrumbs';
import { AdminUserMenu } from '@/components/admin/admin-user-menu';
import { SearchDialog } from '@/components/admin/search-dialog';
import { ThemeToggle } from '@/components/admin/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-card/90 px-4 backdrop-blur-md transition-[width,height] ease-linear">
      {/* Left: Sidebar trigger & Breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground cursor-pointer" />
        <AdminBreadcrumbs />
      </div>

      {/* Right: Actions, Search, Language, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <SearchDialog />
        <LanguageSwitcher />
        <ThemeToggle />
        <AdminUserMenu />
      </div>
    </header>
  );
}
