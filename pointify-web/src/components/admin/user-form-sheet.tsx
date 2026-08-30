import { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserIcon, ShieldIcon, ActivityIcon, SparklesIcon, Loader2Icon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

export const userFormSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Tên hiển thị phải có ít nhất 2 ký tự')
    .max(50, 'Tên hiển thị không được vượt quá 50 ký tự'),
  photoURL: z.string().url('Đường dẫn ảnh đại diện không hợp lệ').or(z.literal('')).optional(),
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'disabled']),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export interface UserAccountData {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string | null;
  providerId: string;
  role: 'admin' | 'member';
  status: 'active' | 'disabled';
  createdAt: number;
  lastLoginAt: number;
}

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserAccountData | null;
  onSave: (values: UserFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function UserFormSheet({
  open,
  onOpenChange,
  user,
  onSave,
  isLoading = false,
}: UserFormSheetProps) {
  const form = useForm({
    defaultValues: {
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || '',
      role: user?.role || 'member',
      status: user?.status || 'active',
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
        await onSave(parsed);
        toast.success(user ? `Đã cập nhật tài khoản ${value.displayName}` : `Đã tạo tài khoản mới`);
        onOpenChange(false);
      } catch (err: any) {
        toast.error(err?.message || 'Có lỗi xảy ra khi lưu thông tin');
      }
    },
  });

  // Reset form when active user changes
  useEffect(() => {
    if (open && user) {
      form.setFieldValue('displayName', user.displayName);
      form.setFieldValue('photoURL', user.photoURL || '');
      form.setFieldValue('role', user.role);
      form.setFieldValue('status', user.status);
    }
  }, [open, user]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col justify-between bg-card/95 backdrop-blur-xl border-l border-border/60 shadow-2xl p-6 overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col h-full justify-between gap-6"
        >
          <div className="space-y-6">
            <SheetHeader className="text-left space-y-1.5 pb-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-bold">
                    {user ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
                  </SheetTitle>
                  <SheetDescription className="text-xs text-muted-foreground">
                    {user ? `UID: ${user.uid}` : 'Điền thông tin tài khoản người dùng bên dưới.'}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {/* Profile Avatar Card */}
            <form.Subscribe selector={(state) => [state.values.displayName, state.values.photoURL]}>
              {([displayName, photoURL]) => (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/20 shadow-md">
                    <AvatarImage src={photoURL || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
                      {displayName ? displayName.slice(0, 2).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {displayName || 'Chưa đặt tên'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || 'Tài khoản chưa có email'}
                    </p>
                    {user && (
                      <div className="flex gap-1.5 mt-1.5">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {user.providerId}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form.Subscribe>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Display Name Field */}
              <form.Field name="displayName">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-xs font-semibold">
                      Tên hiển thị <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="displayName"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="VD: Nguyễn Văn A"
                      className="text-xs h-9 border-border/80 focus-visible:ring-primary/40"
                    />
                    {field.state.meta.errors ? (
                      <p className="text-[11px] text-destructive font-medium">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              {/* Photo URL Field */}
              <form.Field name="photoURL">
                {(field) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="photoURL" className="text-xs font-semibold">
                        Ảnh đại diện (Avatar URL)
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const seed = Math.random().toString(36).substring(7);
                          field.handleChange(
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`,
                          );
                        }}
                        className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10 gap-1"
                      >
                        <SparklesIcon className="h-3 w-3" />
                        Tạo Avatar ngẫu nhiên
                      </Button>
                    </div>
                    <Input
                      id="photoURL"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="https://..."
                      className="text-xs h-9 border-border/80 focus-visible:ring-primary/40"
                    />
                    {field.state.meta.errors ? (
                      <p className="text-[11px] text-destructive font-medium">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    ) : null}
                  </div>
                )}
              </form.Field>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Role Field */}
                <form.Field name="role">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <ShieldIcon className="h-3.5 w-3.5 text-primary" />
                        Vai trò (Role)
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(val: 'admin' | 'member') => field.handleChange(val)}
                      >
                        <SelectTrigger className="h-9 text-xs border-border/80">
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent className="border-border/60">
                          <SelectItem value="member" className="text-xs">
                            Member (Thành viên)
                          </SelectItem>
                          <SelectItem value="admin" className="text-xs font-semibold text-primary">
                            Admin (Quản trị viên)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>

                {/* Status Field */}
                <form.Field name="status">
                  {(field) => (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <ActivityIcon className="h-3.5 w-3.5 text-emerald-500" />
                        Trạng thái
                      </Label>
                      <Select
                        value={field.state.value}
                        onValueChange={(val: 'active' | 'disabled') => field.handleChange(val)}
                      >
                        <SelectTrigger className="h-9 text-xs border-border/80">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent className="border-border/60">
                          <SelectItem
                            value="active"
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                          >
                            Đang hoạt động
                          </SelectItem>
                          <SelectItem
                            value="disabled"
                            className="text-xs text-destructive font-medium"
                          >
                            Đã khóa / Tạm dừng
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t border-border/40 flex-row gap-2 justify-end sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs h-9"
              disabled={isLoading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="text-xs h-9 gap-1.5 font-semibold shadow-md"
            >
              {isLoading && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
              {user ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
