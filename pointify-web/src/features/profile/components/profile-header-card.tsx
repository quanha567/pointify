import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Key, Mail, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { GoogleIcon } from '@/components/ui/icons/google-icon';
import { Separator } from '@/components/ui/separator';
import {
  TypographyCode,
  TypographyH4,
  TypographyMuted,
  TypographySmall,
} from '@/components/ui/typography';
import {
  getMascotFromPhotoUrl,
  MASCOT_LIST,
} from '@/features/room/components/canvas/mascots/mascot-registry';
import { getInitials } from '@/lib/utils';
import type { AuthUserProfile } from '@/store/useAuthStore';

interface ProfileHeaderCardProps {
  user: AuthUserProfile;
  onOpenAvatarPicker: () => void;
}

export function ProfileHeaderCard({ user, onOpenAvatarPicker }: ProfileHeaderCardProps) {
  const { t, i18n } = useTranslation(['auth', 'common', 'room']);
  const isVi = i18n.language === 'vi';
  const [copiedUid, setCopiedUid] = useState(false);

  const isGoogle = user.providerId === 'google.com';
  const matchedMascot = getMascotFromPhotoUrl(user.photoURL) ?? MASCOT_LIST[0];

  const handleCopyUid = async () => {
    if (!user.uid) return;
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      toast.success(t('profile.copiedUidToast'));
      setTimeout(() => setCopiedUid(false), 2000);
    } catch {
      toast.error(t('profile.copyUidFailedToast'));
    }
  };

  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Avatar with hover change overlay */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group size-24 rounded-2xl border border-border bg-muted/30 p-1.5 flex items-center justify-center">
            <Avatar className="size-full overflow-hidden bg-background">
              {user.photoURL ? (
                <AvatarImage
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="size-full object-contain"
                />
              ) : null}
              <AvatarFallback className="size-full bg-primary/10 text-primary text-xl font-bold">
                {getInitials(user.displayName || 'User')}
              </AvatarFallback>
            </Avatar>

            <button
              type="button"
              onClick={onOpenAvatarPicker}
              className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              title={t('profile.changeAvatar')}
              aria-label={t('profile.changeAvatar')}
            >
              <Sparkles className="size-4 mb-0.5 text-primary-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {t('common:common.edit')}
              </span>
            </button>
          </div>
        </div>

        {/* User Name & Email */}
        <div className="text-center space-y-1.5">
          <TypographyH4 className="text-xl font-bold tracking-tight text-foreground">
            {user.displayName || t('profile.anonymousUser')}
          </TypographyH4>

          <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span className="truncate max-w-[220px]">
              {user.email || t('profile.noEmailProvided')}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1.5">
            {user.role === 'admin' ? (
              <Badge variant="destructive" className="gap-1.5 text-xs font-medium h-6 px-2.5">
                <Shield className="size-3.5" />
                {t('room:roles.admin')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs font-medium h-6 px-2.5">
                {t('room:roles.member')}
              </Badge>
            )}

            <Badge variant="outline" className="gap-1.5 text-xs font-medium h-6 px-2.5">
              {isGoogle ? (
                <>
                  <GoogleIcon className="size-3.5" />
                  <span>Google</span>
                </>
              ) : (
                <>
                  <Key className="size-3.5 text-muted-foreground" />
                  <span>{t('account.passwordAuth')}</span>
                </>
              )}
            </Badge>

            <Badge
              variant="outline"
              className="text-xs font-medium h-6 px-2.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              ● {t('profile.statusActive')}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Account Metadata List */}
        <div className="space-y-3.5 text-sm">
          {/* Mascot summary */}
          <div className="flex items-center justify-between py-0.5">
            <TypographyMuted className="text-sm">{t('profile.mascotLabel')}:</TypographyMuted>
            <div className="font-medium text-foreground flex items-center gap-2">
              <img src={matchedMascot.imageSrc} alt="" className="size-5 object-contain" />
              <TypographySmall className="text-sm font-medium">
                {isVi ? matchedMascot.nameVi : matchedMascot.nameEn}
              </TypographySmall>
            </div>
          </div>

          {/* Account UID with Copy Button */}
          <div className="flex items-center justify-between py-0.5">
            <TypographyMuted className="text-sm">{t('profile.userIdLabel')}:</TypographyMuted>
            <button
              type="button"
              onClick={handleCopyUid}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer px-1.5 py-1 rounded-md hover:bg-muted transition-colors"
              title={t('profile.copyUidTitle')}
            >
              <TypographyCode className="text-xs px-1.5 py-0.5 bg-muted/60">
                {user.uid.slice(0, 10)}...
              </TypographyCode>
              {copiedUid ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
