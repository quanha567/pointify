import { useState, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { User, CheckCircle2 } from 'lucide-react';
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
import { UserCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export interface GuestDialogHandle {
  open: () => void;
}

interface GuestDialogProps {
  ref?: React.Ref<GuestDialogHandle>;
  redirectTo?: string;
}

export function GuestDialog({ ref, redirectTo = '/' }: GuestDialogProps) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { continueAsGuest } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState('');

  useImperativeHandle(ref, () => ({
    open: () => {
      setGuestName('');
      setIsOpen(true);
    },
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      toast.error(t('auth.enterNameError'));
      return;
    }
    continueAsGuest(guestName.trim());
    toast.success(t('auth.successGuestToast', { name: guestName.trim() }));
    setIsOpen(false);
    void navigate({ to: redirectTo });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
              onClick={() => setIsOpen(false)}
              className="rounded-xl text-xs"
            >
              {t('auth.cancelButton')}
            </Button>
            <Button type="submit" size="sm" className="rounded-xl text-xs font-semibold gap-1.5">
              <CheckCircle2 className="size-3.5" />
              <span>{t('auth.guestSubmit')}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
