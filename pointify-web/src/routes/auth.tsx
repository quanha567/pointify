import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  ShieldCheck,
  History,
  Users,
  ArrowRight,
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';

interface AuthSearchParams {
  mode?: 'login' | 'register';
  redirect?: string;
}

export const Route = createFileRoute('/auth')({
  validateSearch: (search: Record<string, unknown>): AuthSearchParams => {
    return {
      mode: search.mode === 'register' ? 'register' : 'login',
      redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    };
  },
  component: AuthPage,
});

function GoogleIcon({ className = 'size-4.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AuthPage() {
  const { t } = useTranslation();
  const search = useSearch({ from: '/auth' });
  const navigate = useNavigate();
  const targetRedirect = search.redirect || '/';

  const [mode, setMode] = useState<'login' | 'register'>(search.mode || 'login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password dialog
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Guest modal
  const [guestOpen, setGuestOpen] = useState(false);
  const [guestName, setGuestName] = useState('');

  const {
    user,
    isGuest,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    continueAsGuest,
    error,
    clearError,
  } = useAuthStore();

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (user || isGuest) {
      void navigate({ to: targetRedirect });
    }
  }, [user, isGuest, navigate, targetRedirect]);

  useEffect(() => {
    if (search.mode && search.mode !== mode) {
      setMode(search.mode);
    }
  }, [search.mode, mode]);

  const handleTabChange = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
    void navigate({
      to: '/auth',
      search: { mode: newMode, redirect: search.redirect },
      replace: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please fill in all required fields');
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

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error('Please enter a display name');
      return;
    }
    continueAsGuest(guestName.trim());
    toast.success(t('auth.successGuestToast', { name: guestName.trim() }));
    setGuestOpen(false);
    void navigate({ to: targetRedirect });
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      toast.success(t('auth.forgotSentToast'));
      setForgotOpen(false);
      setForgotEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset email';
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

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
                  <p className="text-xs text-muted-foreground">
                    Instant card flips and estimate synchronization via WebSocket.
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Retain your room settings, custom decks, and estimation metrics.
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Collaborate with guest estimators without forcing mandatory accounts.
                  </p>
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

        {/* Right Column: Glassmorphic Auth Form Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-2xl border border-white/20 dark:border-white/10 bg-card/85 dark:bg-card/70 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/10 dark:shadow-black/40">
            {/* Header / Tab Switcher */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 lg:hidden">
                  <Logo variant="icon" size={24} />
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
                      onClick={() => setForgotOpen(true)}
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === 'login' ? t('auth.submitLogin') : t('auth.submitRegister')}
                    </span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Guest Quick Option */}
            <div className="mt-6 pt-5 border-t border-border/60 text-center space-y-2.5">
              <p className="text-[11px] text-muted-foreground">{t('auth.guestOption')}</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer gap-2"
                onClick={() => setGuestOpen(true)}
              >
                <UserCheck className="size-3.5 text-primary" />
                <span>{t('auth.guestAction')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t('auth.forgotModalTitle')}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t('auth.forgotModalDesc')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email" className="text-xs font-medium">
                {t('auth.emailLabel')}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder={t('auth.emailPlaceholder')}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="pl-10 h-10 rounded-xl text-xs"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForgotOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-xl text-xs font-semibold"
                disabled={forgotLoading}
              >
                {forgotLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  t('auth.forgotSubmit')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Continue as Guest Modal */}
      <Dialog open={guestOpen} onOpenChange={setGuestOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <UserCheck className="size-5" />
            </div>
            <DialogTitle className="text-lg font-bold">{t('auth.guestModalTitle')}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t('auth.guestModalDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGuestSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="guestName" className="text-xs font-medium">
                {t('auth.displayNameLabel')}
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="guestName"
                  type="text"
                  required
                  autoFocus
                  placeholder={t('auth.guestNamePlaceholder')}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="pl-10 h-10 rounded-xl text-xs"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setGuestOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="rounded-xl text-xs font-semibold gap-1.5">
                <CheckCircle2 className="size-3.5" />
                <span>{t('auth.guestSubmit')}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
