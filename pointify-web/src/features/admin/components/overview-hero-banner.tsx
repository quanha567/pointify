import { useTranslation } from 'react-i18next';
import { CalendarIcon } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import oneContainerShip from '@/assets/hero/one-container-ship.webp';

export function OverviewHeroBanner() {
  const { t, i18n } = useTranslation('admin');
  const { user } = useAuthStore();
  const displayName = user?.displayName || 'Summer';

  const hour = new Date().getHours();
  const greetingKey =
    hour >= 5 && hour < 12
      ? 'admin.heroBanner.greetingMorning'
      : hour >= 12 && hour < 18
        ? 'admin.heroBanner.greetingAfternoon'
        : 'admin.heroBanner.greetingEvening';

  const today = new Date().toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative w-full h-36 sm:h-44 lg:h-48 overflow-hidden border-b border-border/50 select-none bg-background">
      {/* Background panoramic ONE vessel image spanning 100% width flush to top and right */}
      <img
        src={oneContainerShip}
        alt="Ocean Network Express"
        className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none"
      />

      {/* Gentle gradient overlay to ensure text contrast in light and dark mode while preserving pink sky glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 via-50% to-transparent dark:from-background/95 dark:via-background/70 pointer-events-none" />

      {/* Traditional Japanese Seigaiha Wave Pattern Overlay (3-5% opacity) */}
      <div className="absolute inset-0 bg-seigaiha pointer-events-none opacity-70 dark:opacity-30 mix-blend-multiply dark:mix-blend-screen" />

      {/* Content: Greeting, Date Pill, and Subtitle */}
      <div className="relative z-10 flex h-full flex-col justify-center px-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2 drop-shadow-xs font-sans">
            {t(greetingKey, { name: displayName })}
            <span className="inline-block transition-transform hover:rotate-12 duration-200">
              👋
            </span>
          </h1>

          {/* Date badge floating beside greeting */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-card/90 border border-border/80 text-[11px] sm:text-xs font-semibold text-foreground shadow-2xs backdrop-blur-md">
            <CalendarIcon className="size-3.5 text-primary" />
            <span className="font-mono">{today}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-foreground/85 dark:text-muted-foreground font-medium mt-1.5 flex items-center gap-2">
          <span className="font-semibold text-primary">AS ONE, WE CAN</span>
          <span className="text-border dark:text-muted-foreground/40">•</span>
          <span>{t('admin.overview.heroSubtitle')}</span>
        </p>
      </div>
    </div>
  );
}
