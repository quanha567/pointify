import { Link } from '@tanstack/react-router';
import { Logo } from '@/components/logo';
import { LanguageSwitcher } from '@/components/language-switcher';
import { UserMenuDropdown } from './user-menu-dropdown';
import type { AuthUserProfile } from '@/store/useAuthStore';

interface PublicHeaderProps {
  user: AuthUserProfile | null;
  isGuest: boolean;
  guestName: string | null;
  onLogout: () => void;
}

export function PublicHeader({ user, isGuest, guestName, onLogout }: PublicHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/15 dark:border-white/5 bg-white/60 dark:bg-background/40 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Brand */}
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <UserMenuDropdown
            user={user}
            isGuest={isGuest}
            guestName={guestName}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
