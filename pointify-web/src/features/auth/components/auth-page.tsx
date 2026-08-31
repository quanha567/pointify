import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Zap, History, Users, ShieldCheck, UserCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { AuthFormCard } from './auth-form-card';
import { ForgotPasswordDialog, type ForgotPasswordDialogHandle } from './forgot-password-dialog';
import { GuestDialog, type GuestDialogHandle } from './guest-dialog';
import type { AuthSearchParams } from '../types/auth.types';

interface AuthPageProps {
  searchParams: AuthSearchParams;
  onNavigateSearch: (updater: (prev: AuthSearchParams) => AuthSearchParams) => void;
}

export function AuthPage({ searchParams, onNavigateSearch }: AuthPageProps) {
  const { t } = useTranslation();
  const forgotRef = useRef<ForgotPasswordDialogHandle>(null);
  const guestRef = useRef<GuestDialogHandle>(null);
  const targetRedirect = searchParams.redirect || '/';

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 right-1/4 size-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl" />
        <div className="absolute top-1/3 right-10 size-64 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-2xl" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Branding & Value Proposition Showcase (Desktop) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-8 pr-4">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary backdrop-blur-sm">
              <Sparkles className="size-3.5 text-primary animate-spin" />
              <span>{t('auth.showcaseBadge')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-foreground">
              {t('auth.showcaseTitle')}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('app.subtitle')}
            </p>

            {/* Feature List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 group">
                <div className="size-8 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {t('auth.showcaseItem1')}
                  </h4>
                </div>
              </div>

              <div className="flex items-start gap-3.5 group">
                <div className="size-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                  <History className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {t('auth.showcaseItem2')}
                  </h4>
                </div>
              </div>

              <div className="flex items-start gap-3.5 group">
                <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="size-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {t('auth.showcaseItem3')}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Interactive Preview Card */}
          <div className="p-4 rounded-xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo variant="icon" size={32} />
              <div>
                <p className="text-xs font-semibold text-foreground">Pointify Cloud Sync</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-500" /> Secure Firebase Authentication
                </p>
              </div>
            </div>
            <div className="flex -space-x-2">
              <div className="size-7 rounded-full bg-cyan-500/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-cyan-700 dark:text-cyan-300">
                8
              </div>
              <div className="size-7 rounded-full bg-blue-500/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
                5
              </div>
              <div className="size-7 rounded-full bg-indigo-500/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                13
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Auth Form Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <AuthFormCard
            searchParams={searchParams}
            onNavigateSearch={onNavigateSearch}
            onForgotPassword={() => forgotRef.current?.open()}
          />

          {/* Guest Quick Option */}
          <div className="mt-6 pt-5 border-t border-border/60 text-center space-y-2.5">
            <p className="text-[11px] text-muted-foreground">{t('auth.guestOption')}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer gap-2"
              onClick={() => guestRef.current?.open()}
            >
              <UserCheck className="size-3.5 text-primary" />
              <span>{t('auth.guestAction')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Encapsulated Dialogs */}
      <ForgotPasswordDialog ref={forgotRef} />
      <GuestDialog ref={guestRef} redirectTo={targetRedirect} />
    </div>
  );
}
