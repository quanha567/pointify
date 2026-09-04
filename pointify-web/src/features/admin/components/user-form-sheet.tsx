import React, { useState, useImperativeHandle, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  UserIcon,
  ShieldIcon,
  ActivityIcon,
  SparklesIcon,
  Loader2Icon,
  MailIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  userFormSchema,
  type UserFormValues,
  type UserAccountDto,
  type UserFormSheetHandle,
} from '../types/admin-users.types';

export interface UserFormSheetProps {
  ref?: React.Ref<UserFormSheetHandle>;
  onSave: (values: UserFormValues, editingUser: UserAccountDto | null) => Promise<void>;
  isLoading?: boolean;
}

export function UserFormSheet({ ref, onSave, isLoading = false }: UserFormSheetProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccountDto | null>(null);

  const form = useForm({
    defaultValues: {
      email: '',
      displayName: '',
      photoURL: '',
      role: 'member',
      status: 'active',
    } as UserFormValues,
    validators: {
      onChange: ({ value }) => {
        const result = userFormSchema.safeParse(value);
        if (!result.success) {
          const firstError = result.error.issues[0]?.message;
          return firstError || 'Thông tin không hợp lệ';
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const parsed = userFormSchema.parse(value);
        await onSave(parsed, editingUser);
        setOpen(false);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('admin.users.toasts.saveError');
        toast.error(message);
      }
    },
  });

  useImperativeHandle(ref, () => ({
    open: (user) => {
      const targetUser = user ?? null;
      setEditingUser(targetUser);
      form.setFieldValue('email', targetUser?.email || '');
      form.setFieldValue('displayName', targetUser?.displayName || '');
      form.setFieldValue('photoURL', targetUser?.photoURL || '');
      form.setFieldValue('role', targetUser?.role || 'member');
      form.setFieldValue('status', targetUser?.status || 'active');
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setEditingUser(null);
    },
  }));

  // Reset form values when editingUser or open changes
  useEffect(() => {
    if (open) {
      form.setFieldValue('email', editingUser?.email || '');
      form.setFieldValue('displayName', editingUser?.displayName || '');
      form.setFieldValue('photoURL', editingUser?.photoURL || '');
      form.setFieldValue('role', editingUser?.role || 'member');
      form.setFieldValue('status', editingUser?.status || 'active');
    }
  }, [open, editingUser]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-md flex flex-col justify-between bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl p-6 overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col h-full justify-between"
        >
          <div className="flex flex-col gap-6">
            <SheetHeader className="p-0 text-left space-y-1.5 border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <SparklesIcon className="size-5" />
                </div>
                <div>
                  <SheetTitle className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                    {editingUser
                      ? t('admin.users.form.editTitle')
                      : t('admin.users.form.createTitle')}
                  </SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground leading-normal mt-0.5">
                    {editingUser
                      ? t('admin.users.form.editDesc', { name: editingUser.displayName })
                      : t('admin.users.form.createDesc')}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Live Profile Card Preview */}
            <form.Subscribe
              selector={(state) => ({
                displayName: state.values.displayName,
                email: state.values.email,
                photoURL: state.values.photoURL,
                role: state.values.role,
                status: state.values.status,
              })}
            >
              {(values) => (
                <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border/80 shadow-2xs">
                  <Avatar className="size-12 border-2 border-border/60 shadow-xs">
                    <AvatarImage src={values.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                      {values.displayName?.slice(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate text-foreground">
                        {values.displayName || t('admin.users.form.noName')}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          values.role === 'admin'
                            ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25 text-xs px-2 py-0.5 font-medium'
                            : 'bg-secondary/60 text-secondary-foreground text-xs px-2 py-0.5 font-medium'
                        }
                      >
                        {values.role === 'admin'
                          ? t('admin.users.roles.admin')
                          : t('admin.users.roles.member')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {values.email || ''}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span
                      className={`inline-block size-2.5 rounded-full ${
                        values.status === 'active'
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                      }`}
                    />
                  </div>
                </div>
              )}
            </form.Subscribe>

            {/* Form Fields using FieldGroup & Field */}
            <FieldGroup className="gap-4.5">
              {/* Email Address */}
              <form.Field name="email">
                {(field) => {
                  const isInvalid = field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor="email"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <MailIcon className="size-4 text-muted-foreground" />
                        {t('admin.users.form.email')}
                      </FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('admin.users.form.emailPlaceholder')}
                        value={field.state.value}
                        disabled={!!editingUser}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 sm:h-11 rounded-xl text-sm bg-background/50 border-border"
                      />
                      {isInvalid && (
                        <FieldError className="text-xs font-medium text-destructive">
                          {String(field.state.meta.errors[0])}
                        </FieldError>
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* Display Name */}
              <form.Field name="displayName">
                {(field) => {
                  const isInvalid = field.state.meta.errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel
                        htmlFor="displayName"
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        <UserIcon className="size-4 text-muted-foreground" />
                        {t('admin.users.form.displayName')}
                      </FieldLabel>
                      <Input
                        id="displayName"
                        placeholder={t('admin.users.form.displayNamePlaceholder')}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        className="h-10 sm:h-11 rounded-xl text-sm bg-background/50 border-border"
                      />
                      {isInvalid && (
                        <FieldError className="text-xs font-medium text-destructive">
                          {String(field.state.meta.errors[0])}
                        </FieldError>
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              {/* Photo URL */}
              <form.Field name="photoURL">
                {(field) => (
                  <Field>
                    <FieldLabel
                      htmlFor="photoURL"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <SparklesIcon className="size-4 text-muted-foreground" />
                      {t('admin.users.form.photoURL')}
                    </FieldLabel>
                    <Input
                      id="photoURL"
                      placeholder={t('admin.users.form.photoURLPlaceholder')}
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-10 sm:h-11 rounded-xl text-sm bg-background/50 border-border"
                    />
                  </Field>
                )}
              </form.Field>

              {/* Role Selection */}
              <form.Field name="role">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-sm font-medium flex items-center gap-2">
                      <ShieldIcon className="size-4 text-muted-foreground" />
                      {t('admin.users.form.role')}
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val: 'admin' | 'member') => field.handleChange(val)}
                    >
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl text-sm bg-background/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="member" className="text-sm font-medium">
                            <div className="flex flex-col text-left py-0.5">
                              <span className="font-semibold text-sm">
                                {t('admin.users.roles.member')}
                              </span>
                              <span className="text-xs text-muted-foreground leading-normal">
                                {t('admin.users.form.roleMemberDesc')}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="admin" className="text-sm font-medium">
                            <div className="flex flex-col text-left py-0.5">
                              <span className="font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                                {t('admin.users.roles.admin')}
                              </span>
                              <span className="text-xs text-muted-foreground leading-normal">
                                {t('admin.users.form.roleAdminDesc')}
                              </span>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>

              {/* Status Selection */}
              <form.Field name="status">
                {(field) => (
                  <Field>
                    <FieldLabel className="text-sm font-medium flex items-center gap-2">
                      <ActivityIcon className="size-4 text-muted-foreground" />
                      {t('admin.users.form.status')}
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={(val: 'active' | 'disabled') => field.handleChange(val)}
                    >
                      <SelectTrigger className="h-10 sm:h-11 rounded-xl text-sm bg-background/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="active" className="text-sm font-medium">
                            <div className="flex flex-col text-left py-0.5">
                              <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                                {t('admin.users.statuses.active')}
                              </span>
                              <span className="text-xs text-muted-foreground leading-normal">
                                {t('admin.users.form.statusActiveDesc')}
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="disabled" className="text-sm font-medium">
                            <div className="flex flex-col text-left py-0.5">
                              <span className="font-semibold text-rose-600 dark:text-rose-400">
                                {t('admin.users.statuses.disabled')}
                              </span>
                              <span className="text-xs text-muted-foreground leading-normal">
                                {t('admin.users.form.statusDisabledDesc')}
                              </span>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </div>

          <SheetFooter className="p-0 mt-8 border-t border-border pt-4 flex gap-2 sm:gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-10 text-sm font-medium rounded-xl cursor-pointer"
            >
              {t('admin.users.form.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-10 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {t('admin.users.form.saving')}
                </>
              ) : editingUser ? (
                t('admin.users.form.editSubmit')
              ) : (
                t('admin.users.form.createSubmit')
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
