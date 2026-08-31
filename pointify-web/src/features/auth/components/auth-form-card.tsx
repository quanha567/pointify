import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GoogleIcon } from '@/components/ui/icons/google-icon';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { AuthSearchParams } from '../types/auth.types';

interface AuthFormCardProps {
  searchParams: AuthSearchParams;
  onNavigateSearch: (updater: (prev: AuthSearchParams) => AuthSearchParams) => void;
  onForgotPassword: () => void;
}

export function AuthFormCard({
  searchParams,
  onNavigateSearch,
  onForgotPassword,
}: AuthFormCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const targetRedirect = searchParams.redirect || '/';

  // Derive mode from URL (§2 Tầng 1: URL is source of truth)
  const mode = searchParams.mode;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle, error, clearError } = useAuthStore();

  const handleTabChange = (newMode: 'login' | 'register') => {
    clearError();
    onNavigateSearch(() => ({
      mode: newMode,
      redirect: searchParams.redirect,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error(t('auth.fillFieldsError'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        toast.success(t('auth.successLoginToast', { name: email.split('@')[0] }));
      } else {
        await registerWithEmail(email, password, displayName);
        toast.success(t('auth.successRegisterToast', { name: displayName || email.split('@')[0] }));
      }
      void navigate({ to: targetRedirect });
    } catch {
      // Error handled by store and displayed inline
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success(t('auth.successLoginToast', { name: 'Google Account' }));
      void navigate({ to: targetRedirect });
    } catch {
      // Error is set in store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-white/20 dark:border-white/10 bg-card/85 dark:bg-card/70 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/10 dark:shadow-black/40">
      {/* Header / Tab Switcher */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="font-bold text-sm">Pointify</span>
          </div>
          <div className="ml-auto flex rounded-xl bg-muted/60 p-1 border border-border/50">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                mode === 'login'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'login' && (
                <motion.div
                  layoutId="active-auth-tab"
                  className="absolute inset-0 bg-primary rounded-lg shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t('auth.loginTab')}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer ${
                mode === 'register'
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'register' && (
                <motion.div
                  layoutId="active-auth-tab"
                  className="absolute inset-0 bg-primary rounded-lg shadow-xs"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t('auth.registerTab')}</span>
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>
        </div>
      </div>

      {/* Google OAuth Button */}
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-xl border-border/80 bg-background/80 hover:bg-accent/80 backdrop-blur shadow-xs text-xs sm:text-sm font-semibold gap-2.5 cursor-pointer transition-all hover:border-primary/40 active:scale-[0.99]"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <GoogleIcon className="size-4.5" />
          )}
          <span>{t('auth.googleButton')}</span>
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/60" />
          </div>
          <span className="relative bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {t('auth.orDivider')}
          </span>
        </div>
      </div>

      {/* Error Notification Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Email & Password Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <AnimatePresence mode="wait">
          {mode === 'register' && (
            <motion.div
              key="display-name-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5"
            >
              <Label htmlFor="displayName" className="text-xs font-medium">
                {t('auth.displayNameLabel')}
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder={t('auth.displayNamePlaceholder')}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-background/50 border-border/80 text-xs focus-visible:ring-primary"
                  autoComplete="name"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">
            {t('auth.emailLabel')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background/50 border-border/80 text-xs focus-visible:ring-primary"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium">
              {t('auth.passwordLabel')}
            </Label>
            {mode === 'login' && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
              >
                {t('auth.forgotPassword')}
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-10 rounded-xl bg-background/50 border-border/80 text-xs focus-visible:ring-primary"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-10.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-primary/20 cursor-pointer gap-2 transition-all active:scale-[0.99] mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t('auth.processing')}</span>
            </>
          ) : (
            <>
              <span>{mode === 'login' ? t('auth.submitLogin') : t('auth.submitRegister')}</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
