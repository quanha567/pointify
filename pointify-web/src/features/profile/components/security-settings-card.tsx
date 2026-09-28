import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Eye, EyeOff, Key, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Form, useAppForm } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { GoogleIcon } from '@/components/ui/icons/google-icon';
import { TypographyMuted, TypographySmall } from '@/components/ui/typography';
import type { AuthUserProfile } from '@/store/useAuthStore';

interface SecuritySettingsCardProps {
  user: AuthUserProfile;
  onChangePassword: (currentPass: string, newPass: string) => Promise<void>;
  onSendPasswordReset: (email: string) => Promise<void>;
}

export function SecuritySettingsCard({
  user,
  onChangePassword,
  onSendPasswordReset,
}: SecuritySettingsCardProps) {
  const { t } = useTranslation(['auth', 'common']);
  const isGoogle = user.providerId === 'google.com';

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const securitySchema = z
    .object({
      currentPassword: z.string().min(1, t('profile.validationCurrentPasswordRequired')),
      newPassword: z.string().min(6, t('profile.validationNewPasswordMin')),
      confirmPassword: z.string().min(1, t('profile.validationConfirmPasswordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t('profile.validationPasswordsNotMatching'),
      path: ['confirmPassword'],
    });

  type SecurityFormValues = z.infer<typeof securitySchema>;

  const form = useAppForm<SecurityFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    schema: securitySchema,
    onSubmit: async ({ value }) => {
      try {
        await onChangePassword(value.currentPassword, value.newPassword);
        toast.success(t('profile.passwordChangedSuccess'));
        form.reset();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('profile.passwordChangeFailed');
        toast.error(msg);
      }
    },
  });

  const handleSendResetEmail = async () => {
    if (!user.email) {
      toast.error(t('profile.noEmailForReset'));
      return;
    }

    setIsSendingReset(true);
    try {
      await onSendPasswordReset(user.email);
      toast.success(t('profile.resetEmailSentToast'));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('profile.sendResetFailed');
      toast.error(msg);
    } finally {
      setIsSendingReset(false);
    }
  };

  if (isGoogle) {
    return (
      <CardContent className="p-6 space-y-4">
        <TypographyMuted className="text-sm leading-relaxed">
          {t('profile.googleProviderNotice')}
        </TypographyMuted>

        <div className="p-4 rounded-xl border border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
              <GoogleIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <TypographySmall className="text-sm font-semibold text-foreground">
                  {t('profile.googleAccount')}
                </TypographySmall>
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs h-5 px-2"
                >
                  ● {t('profile.connectedBadge')}
                </Badge>
              </div>
              <TypographyMuted className="text-xs text-muted-foreground mt-0.5">
                {user.email}
              </TypographyMuted>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="gap-2 text-xs sm:text-sm h-9 px-3 w-full sm:w-auto"
          >
            <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" />
              <span>{t('profile.manageGoogleSecurity')}</span>
            </a>
          </Button>
        </div>
      </CardContent>
    );
  }

  return (
    <Form form={form}>
      <CardContent className="p-6 space-y-4">
        {/* Current Password Field with FormInput */}
        <FormInput
          name="currentPassword"
          type={showCurrent ? 'text' : 'password'}
          label={
            <div className="flex items-center justify-between w-full">
              <span>{t('profile.currentPasswordLabel')}</span>
              <Button
                type="button"
                variant="link"
                onClick={handleSendResetEmail}
                disabled={isSendingReset}
                className="h-auto p-0 text-xs sm:text-sm text-muted-foreground hover:text-primary font-normal"
              >
                {isSendingReset ? t('common:common.loading') : t('profile.forgotPasswordLink')}
              </Button>
            </div>
          }
          placeholder={t('profile.currentPasswordPlaceholder')}
          prefix={<Lock className="size-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={showCurrent ? t('common:common.hide') : t('common:common.show')}
            >
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          required
        />

        {/* New Password Field with FormInput */}
        <FormInput
          name="newPassword"
          type={showNew ? 'text' : 'password'}
          label={t('profile.newPasswordLabel')}
          placeholder={t('profile.newPasswordPlaceholder')}
          prefix={<Key className="size-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={showNew ? t('common:common.hide') : t('common:common.show')}
            >
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          required
        />

        {/* Confirm New Password Field with FormInput */}
        <FormInput
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          label={t('profile.confirmPasswordLabel')}
          placeholder={t('profile.confirmPasswordPlaceholder')}
          prefix={<Key className="size-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={showConfirm ? t('common:common.hide') : t('common:common.show')}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
          required
        />
      </CardContent>

      <CardFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-border p-4 px-6 bg-muted/20">
        <form.Subscribe selector={(state) => [state.isDirty, state.canSubmit, state.isSubmitting]}>
          {([isDirty, canSubmit, isSubmitting]) => (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={!isDirty || isSubmitting}
                className="h-10 px-4 text-sm font-medium w-full sm:w-auto"
              >
                {t('common:common.cancel')}
              </Button>

              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="gap-2 h-10 px-4 text-sm font-medium w-full sm:w-auto"
              >
                <Key className="size-4" />
                <span>
                  {isSubmitting ? t('common:common.processing') : t('profile.updatePasswordButton')}
                </span>
              </Button>
            </>
          )}
        </form.Subscribe>
      </CardFooter>
    </Form>
  );
}
