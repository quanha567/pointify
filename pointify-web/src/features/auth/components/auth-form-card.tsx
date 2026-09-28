import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, AlertCircle, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { GoogleIcon } from '@/components/ui/icons/google-icon';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import type { AuthSearchParams } from '../types/auth.types';

const REMEMBER_EMAIL_KEY = 'pointify_remember_email';

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
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const targetRedirect = searchParams.redirect || '/';

  // Derive mode from URL (§2 Tầng 1: URL is source of truth)
  const mode = searchParams.mode;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle, error, clearError } = useAuthStore();

  // Load saved email on mount if rememberMe was active
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }, []);

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

    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
    } catch {
      // Ignore storage errors
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password, rememberMe);
        toast.success(t('auth.successLoginToast', { name: email.split('@')[0] }));
      } else {
        await registerWithEmail(email, password, displayName, rememberMe);
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
      await loginWithGoogle(rememberMe);
      toast.success(t('auth.successLoginToast', { name: 'Google Account' }));
      void navigate({ to: targetRedirect });
    } catch {
      // Error is set in store
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-7 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {mode === 'login' ? t('auth.signInTitle') : t('auth.oneRegisterTitle')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {mode === 'login' ? t('auth.signInSubtitleNew') : t('auth.oneRegisterSubtitle')}
        </p>
      </div>

      {/* Error Notification Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4.5 text-left">
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
              <Label
                htmlFor="displayName"
                className="text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                {t('auth.displayNameLabel')}
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder={t('auth.displayNamePlaceholder')}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-11 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus-visible:ring-2 focus-visible:ring-[#E31C79]"
                autoComplete="name"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {t('auth.emailLabel')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              id="email"
              type="email"
              required
              placeholder={t('auth.oneEmailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 pl-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#E31C79]"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            {t('auth.passwordLabel')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder={t('auth.onePasswordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 pl-10 pr-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#E31C79]"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
              className="rounded data-[state=checked]:bg-[#E31C79] data-[state=checked]:border-[#E31C79]"
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer select-none font-normal"
            >
              {t('auth.rememberMe')}
            </Label>
          </div>

          {mode === 'login' && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm font-medium text-[#E31C79] hover:underline cursor-pointer"
            >
              {t('auth.forgotPassword')}
            </button>
          )}
        </div>

        {/* Main CTA Button */}
        <Button
          type="submit"
          className="w-full h-11 rounded-full font-semibold text-sm shadow-md shadow-[#E31C79]/25 cursor-pointer transition-all active:scale-[0.99] mt-1 bg-[#E31C79] hover:bg-[#c9166d] text-white border-0 gap-2"
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

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <span className="relative bg-white dark:bg-slate-950 px-3 text-sm text-slate-400 font-normal">
          {t('auth.orDivider')}
        </span>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium gap-2.5 cursor-pointer shadow-2xs transition-all active:scale-[0.99]"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <GoogleIcon className="size-4" />
        )}
        <span>{t('auth.googleButton')}</span>
      </Button>

      {/* Footer Switcher */}
      <div className="mt-7 text-center">
        {mode === 'login' ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('auth.noAccountPrompt')}{' '}
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className="font-semibold text-[#E31C79] hover:underline cursor-pointer"
            >
              {t('auth.contactAdmin')}
            </button>
          </p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('auth.haveAccountPrompt')}{' '}
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className="font-semibold text-[#E31C79] hover:underline cursor-pointer"
            >
              {t('auth.switchLogin')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
