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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
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
          <div className="space-y-6">
            <SheetHeader className="text-left space-y-1.5 border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <SparklesIcon className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold tracking-tight text-foreground">
                    {editingUser
                      ? t('admin.users.form.editTitle')
                      : t('admin.users.form.createTitle')}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
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
                  <Avatar className="h-12 w-12 border-2 border-border/60 shadow-xs">
                    <AvatarImage src={values.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">
                      {values.displayName?.slice(0, 2).toUpperCase() || 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate text-foreground">
                        {values.displayName || 'Chưa đặt tên'}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          values.role === 'admin'
                            ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/25 text-[10px] px-1.5 py-0 font-semibold'
                            : 'bg-secondary/60 text-secondary-foreground text-[10px] px-1.5 py-0'
                        }
                      >
                        {values.role === 'admin'
                          ? t('admin.users.roles.admin')
                          : t('admin.users.roles.member')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {values.email || 'email@example.com'}
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

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Email Address */}
              <form.Field name="email">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold flex items-center gap-1.5"
                    >
                      <MailIcon className="size-3.5 text-muted-foreground" />
                      {t('admin.users.form.email')}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('admin.users.form.emailPlaceholder')}
                      value={field.state.value}
                      disabled={!!editingUser}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-9 text-xs bg-background/50 border-border"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[11px] font-medium text-destructive">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Display Name */}
              <form.Field name="displayName">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="displayName"
                      className="text-xs font-semibold flex items-center gap-1.5"
                    >
                      <UserIcon className="size-3.5 text-muted-foreground" />
                      {t('admin.users.form.displayName')}
                    </Label>
                    <Input
                      id="displayName"
                      placeholder={t('admin.users.form.displayNamePlaceholder')}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-9 text-xs bg-background/50 border-border"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-[11px] font-medium text-destructive">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Photo URL */}
              <form.Field name="photoURL">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="photoURL"
                      className="text-xs font-semibold flex items-center gap-1.5"
                    >
                      <SparklesIcon className="size-3.5 text-muted-foreground" />
                      {t('admin.users.form.photoURL')}
                    </Label>
                    <Input
                      id="photoURL"
                      placeholder={t('admin.users.form.photoURLPlaceholder')}
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="h-9 text-xs bg-background/50 border-border"
                    />
                  </div>
                )}
              </form.Field>

              {/* Role Selection */}
              <form.Field name="role">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <ShieldIcon className="size-3.5 text-muted-foreground" />
                      {t('admin.users.form.role')}
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val: 'admin' | 'member') => field.handleChange(val)}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member" className="text-xs">
                          <div className="flex flex-col text-left">
                            <span className="font-semibold">{t('admin.users.roles.member')}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {t('admin.users.form.roleMemberDesc')}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="admin" className="text-xs">
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {t('admin.users.roles.admin')}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {t('admin.users.form.roleAdminDesc')}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              {/* Status Selection */}
              <form.Field name="status">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <ActivityIcon className="size-3.5 text-muted-foreground" />
                      {t('admin.users.form.status')}
                    </Label>
                    <Select
                      value={field.state.value}
                      onValueChange={(val: 'active' | 'disabled') => field.handleChange(val)}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" className="text-xs">
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {t('admin.users.statuses.active')}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {t('admin.users.form.statusActiveDesc')}
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="disabled" className="text-xs">
                          <div className="flex flex-col text-left">
                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                              {t('admin.users.statuses.disabled')}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {t('admin.users.form.statusDisabledDesc')}
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          <SheetFooter className="mt-8 border-t border-border pt-4 flex gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="flex-1 h-9 text-xs font-medium"
            >
              {t('admin.users.form.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="flex-1 h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
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
