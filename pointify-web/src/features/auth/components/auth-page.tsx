import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthFormCard } from './auth-form-card';
import { ForgotPasswordDialog, type ForgotPasswordDialogHandle } from './forgot-password-dialog';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/admin/theme-toggle';
import oneSunsetShip from '@/assets/hero/one-auth-sunset-ship.png';
import oneLogoWhite from '@/assets/one-logo-white.webp';
import type { AuthSearchParams } from '../types/auth.types';

interface AuthPageProps {
  searchParams: AuthSearchParams;
  onNavigateSearch: (updater: (prev: AuthSearchParams) => AuthSearchParams) => void;
}

export function AuthPage({ searchParams, onNavigateSearch }: AuthPageProps) {
  const { t } = useTranslation('auth');
  const forgotRef = useRef<ForgotPasswordDialogHandle>(null);

  return (
    <div className="relative min-h-screen w-full flex select-none overflow-hidden">
      {/* ─── Left Panel: Cinematic Background ─── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col justify-between overflow-hidden">
        {/* Background image — centered to show ship properly */}
        <img
          src={oneSunsetShip}
          alt="Ocean Network Express Container Vessel at Sunset"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Protective gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Top: ONE Logo + Slogan */}
        <header className="relative z-10 px-10 xl:px-14 pt-8 xl:pt-10">
          <img
            src={oneLogoWhite}
            alt="Ocean Network Express"
            className="h-12 xl:h-14 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          />
          <p className="text-sm font-semibold tracking-[0.15em] uppercase text-white/90 mt-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
            AS ONE, WE CAN
          </p>
        </header>

        {/* Center-left: Hero branding text */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 xl:px-14">
          <h1 className="text-4xl xl:text-5xl 2xl:text-[3.5rem] font-black tracking-tight text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)] leading-[1.15]">
            {t('auth.heroTitle')}
          </h1>
          <p className="text-base xl:text-lg text-white/85 font-normal mt-3 leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] max-w-sm">
            {t('auth.heroSubtitle')}
          </p>
        </div>

        {/* Footer copyright on left panel */}
        <footer className="relative z-10 px-10 xl:px-14 pb-5 text-xs text-white/60 drop-shadow-sm">
          <p>© {new Date().getFullYear()} Ocean Network Express Pte. Ltd.</p>
        </footer>
      </div>

      {/* ─── Right Panel: Auth Form ─── */}
      <div className="w-full lg:w-[45%] xl:w-[42%] min-h-screen bg-white dark:bg-slate-950 flex flex-col relative overflow-hidden">
        {/* ─── Bottom Decoration: Seigaiha Wave Band ─── */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-0"
          aria-hidden="true"
        >
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-seigaiha opacity-60 dark:opacity-20" />
        </div>

        {/* Top-right: AS ONE, WE CAN accent + Discreet controls */}
        <div className="flex items-center justify-between px-8 sm:px-10 xl:px-12 pt-6 sm:pt-8 relative z-10">
          {/* Mobile-only: ONE Logo */}
          <div className="lg:hidden">
            <img
              src={oneLogoWhite}
              alt="Ocean Network Express"
              className="h-8 w-auto object-contain invert dark:invert-0 opacity-80"
            />
          </div>
          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            {/* Discreet controls for Language and Theme */}
            <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {/* AS ONE, WE CAN text accent with circular swoosh */}
            <div className="flex items-center gap-2">
              {/* Circular arc swoosh */}
              <svg viewBox="0 0 32 32" className="size-7" fill="none" aria-hidden="true">
                <path
                  d="M16 4 A12 12 0 1 1 4 16"
                  stroke="#E31C79"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Small cherry blossom at the end of the arc */}
                <g transform="translate(16,4)" opacity="0.4">
                  <ellipse cx="0" cy="-2.5" rx="1.5" ry="3" fill="#E31C79" transform="rotate(0)" />
                  <ellipse cx="0" cy="-2.5" rx="1.5" ry="3" fill="#E31C79" transform="rotate(72)" />
                  <ellipse
                    cx="0"
                    cy="-2.5"
                    rx="1.5"
                    ry="3"
                    fill="#E31C79"
                    transform="rotate(144)"
                  />
                  <ellipse
                    cx="0"
                    cy="-2.5"
                    rx="1.5"
                    ry="3"
                    fill="#E31C79"
                    transform="rotate(216)"
                  />
                  <ellipse
                    cx="0"
                    cy="-2.5"
                    rx="1.5"
                    ry="3"
                    fill="#E31C79"
                    transform="rotate(288)"
                  />
                  <circle cx="0" cy="0" r="1.2" fill="#E31C79" opacity="0.5" />
                </g>
              </svg>
              <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#E31C79]/50 dark:text-[#E31C79]/40 hidden sm:inline">
                AS ONE, WE CAN
              </span>
            </div>
          </div>
        </div>

        {/* Center: Auth Form */}
        <div className="flex-1 flex items-center justify-center px-8 sm:px-10 xl:px-12 py-8 relative z-10">
          <div className="w-full max-w-[420px]">
            <AuthFormCard
              searchParams={searchParams}
              onNavigateSearch={onNavigateSearch}
              onForgotPassword={() => forgotRef.current?.open()}
            />
          </div>
        </div>
      </div>

      {/* Encapsulated Forgot Password Dialog */}
      <ForgotPasswordDialog ref={forgotRef} />
    </div>
  );
}
