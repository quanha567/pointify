import { useState, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Mail, Loader2 } from 'lucide-react';
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
import { toast } from 'sonner';

export interface ForgotPasswordDialogHandle {
  open: () => void;
}

interface ForgotPasswordDialogProps {
  ref?: React.Ref<ForgotPasswordDialogHandle>;
}

export function ForgotPasswordDialog({ ref }: ForgotPasswordDialogProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => {
      setEmail('');
      setIsOpen(true);
    },
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t('auth.enterEmailError'));
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success(t('auth.forgotSentToast'));
      setIsOpen(false);
      setEmail('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.failedResetEmail');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{t('auth.forgotModalTitle')}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('auth.forgotModalDesc')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10 rounded-xl text-xs"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="rounded-xl text-xs"
            >
              {t('auth.cancelButton')}
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-xl text-xs font-semibold"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : t('auth.forgotSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
