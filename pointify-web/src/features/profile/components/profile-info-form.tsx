import { Form, useAppForm } from '@/components/form/form';
import { FormInput } from '@/components/form/form-input';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import type { AuthUserProfile } from '@/store/useAuthStore';
import { Check, Mail, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

interface ProfileInfoFormProps {
  user: AuthUserProfile;
  onUpdateProfile: (displayName: string, photoURL?: string | null) => Promise<void>;
}

export function ProfileInfoForm({ user, onUpdateProfile }: ProfileInfoFormProps) {
  const { t } = useTranslation(['auth', 'common']);

  const profileSchema = z.object({
    displayName: z
      .string()
      .trim()
      .min(2, t('profile.validationNameMin'))
      .max(50, t('profile.validationNameMax')),
    email: z.string().optional(),
  });

  type ProfileFormValues = z.infer<typeof profileSchema>;

  const form = useAppForm<ProfileFormValues>({
    defaultValues: {
      displayName: user.displayName || '',
      email: user.email || '',
    },
    schema: profileSchema,
    onSubmit: async ({ value }) => {
      try {
        await onUpdateProfile(value.displayName.trim(), user.photoURL);
        toast.success(t('profile.updateSuccessToast'));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('profile.updateFailedToast');
        toast.error(msg);
      }
    },
  });

  return (
    <Form form={form}>
      <CardContent className="p-6 space-y-5">
        {/* Display Name with FormInput */}
        <FormInput
          name="displayName"
          label={t('profile.displayNameLabel')}
          placeholder={t('profile.displayNamePlaceholder')}
          prefix={<User className="size-4" />}
          required
        />

        {/* Email (Read-only) with FormInput */}
        <FormInput
          name="email"
          type="email"
          label={t('profile.emailLabel')}
          prefix={<Mail className="size-4" />}
          disabled
        />
      </CardContent>

      <CardFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-border p-4 px-6 bg-muted/20">
        <form.Subscribe selector={(state) => [state.isDirty, state.isSubmitting]}>
          {([isDirty, isSubmitting]) => (
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
                disabled={!isDirty || isSubmitting}
                className="gap-2 h-10 px-4 text-sm font-medium w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="size-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t('profile.saving')}
                  </span>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>{t('profile.saveChanges')}</span>
                  </>
                )}
              </Button>
            </>
          )}
        </form.Subscribe>
      </CardFooter>
    </Form>
  );
}
