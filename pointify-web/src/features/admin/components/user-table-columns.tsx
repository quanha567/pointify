import { format } from 'date-fns';
import {
  MoreHorizontalIcon,
  CopyIcon,
  Edit2Icon,
  BanIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  MailIcon,
  CalendarIcon,
  ClockIcon,
  UserCheckIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTableColumnHeader, type DataTableColumnDef } from '@/components/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRoleBadge } from './user-role-badge';
import { UserStatusBadge } from './user-status-badge';
import type { UserAccountDto } from '../types/admin-users.types';

function GoogleIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg className={cn('shrink-0', className)} viewBox="0 0 24 24">
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

export interface GetUserTableColumnsOptions {
  onEdit: (user: UserAccountDto) => void;
  onToggleStatusRequest: (user: UserAccountDto) => void;
  onToggleRoleRequest: (user: UserAccountDto) => void;
  onCopyUid: (uid: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function getUserTableColumns({
  onEdit,
  onToggleStatusRequest,
  onToggleRoleRequest,
  onCopyUid,
  t,
}: GetUserTableColumnsOptions): DataTableColumnDef<UserAccountDto>[] {
  return [
    // Select Checkbox Column (Pinned Left)
    {
      id: 'select',
      size: 44,
      minSize: 44,
      maxSize: 44,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        </div>
      ),
    },

    // User Profile Column (Avatar + Display Name + UID)
    {
      accessorKey: 'displayName',
      id: 'displayName',
      size: 260,
      minSize: 200,
      meta: {
        flex: 1.5,
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.users.columns.user')} />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2.5 py-0.5 min-w-0">
            <Avatar className="h-8 w-8 shrink-0 border border-border/80 shadow-2xs">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {user.displayName?.slice(0, 2).toUpperCase() || 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 overflow-hidden">
              <span className="font-semibold text-xs text-foreground truncate">
                {user.displayName || t('admin.users.columns.noName')}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                  {user.uid}
                </span>
                <button
                  type="button"
                  onClick={() => onCopyUid(user.uid)}
                  className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors p-0.5 rounded"
                  title={t('admin.users.actions.copyUid')}
                >
                  <CopyIcon className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      },
    },

    // Email Address Column
    {
      accessorKey: 'email',
      id: 'email',
      size: 240,
      minSize: 180,
      meta: {
        flex: 1.2,
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.users.columns.email')} />
      ),
      cell: ({ row }) => {
        const email = row.original.email;
        return (
          <div className="flex items-center gap-1.5 text-xs text-foreground/90 truncate">
            <MailIcon className="size-3.5 text-muted-foreground shrink-0" />
            <span className="truncate">{email || t('admin.users.columns.noEmail')}</span>
          </div>
        );
      },
    },

    // Role Column
    {
      accessorKey: 'role',
      id: 'role',
      size: 130,
      minSize: 110,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.users.columns.role')} />
      ),
      cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
      filterFn: (row, id, value) => {
        return Array.isArray(value) ? value.includes(row.getValue(id)) : false;
      },
    },

    // Status Column
    {
      accessorKey: 'status',
      id: 'status',
      size: 130,
      minSize: 110,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.users.columns.status')} />
      ),
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
      filterFn: (row, id, value) => {
        return Array.isArray(value) ? value.includes(row.getValue(id)) : false;
      },
    },

    // Authentication Provider Column
    {
      accessorKey: 'providerId',
      id: 'providerId',
      size: 150,
      minSize: 130,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.users.columns.provider')} />
      ),
      cell: ({ row }) => {
        const provider = row.original.providerId;
        const isGoogle = provider === 'google.com' || provider === 'google';
        const isPassword = provider === 'password';

        return (
          <div className="flex items-center gap-1.5 text-xs">
            {isGoogle ? (
              <Badge
                variant="outline"
                className="gap-1.5 py-0.5 px-2 bg-background border-border text-xs font-medium text-foreground"
              >
                <GoogleIcon />
                <span>{t('admin.users.providers.google')}</span>
              </Badge>
            ) : isPassword ? (
              <Badge
                variant="outline"
                className="gap-1.5 py-0.5 px-2 bg-background border-border text-xs font-medium text-foreground"
              >
                <KeyRoundIcon className="size-3.5 text-muted-foreground" />
                <span>{t('admin.users.providers.password')}</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 py-0.5 px-2 bg-muted text-xs font-medium text-muted-foreground"
              >
                {provider || t('admin.users.providers.unknown')}
              </Badge>
            )}
          </div>
        );
      },
    },

    // Created At Column
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      size: 150,
      minSize: 130,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.users.columns.createdAt')} />
      ),
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        if (!createdAt) return <span className="text-muted-foreground text-xs">—</span>;
        const date = new Date(createdAt);
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3.5 shrink-0" />
            <span>{format(date, 'dd/MM/yyyy')}</span>
          </div>
        );
      },
    },

    // Last Login At Column
    {
      accessorKey: 'lastLoginAt',
      id: 'lastLoginAt',
      size: 190,
      minSize: 175,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('admin.users.columns.lastLoginAt')} />
      ),
      cell: ({ row }) => {
        const lastLoginAt = row.original.lastLoginAt;
        if (!lastLoginAt) {
          return (
            <span className="text-xs text-muted-foreground/70 italic">
              {t('admin.users.columns.never')}
            </span>
          );
        }
        const date = new Date(lastLoginAt);
        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5 shrink-0" />
            <span>{format(date, 'dd/MM/yyyy HH:mm')}</span>
          </div>
        );
      },
    },

    // Actions Menu Column (Pinned Right)
    {
      id: 'actions',
      size: 70,
      minSize: 70,
      maxSize: 70,
      enableResizing: false,
      enableSorting: false,
      enableHiding: false,
      header: () => (
        <div className="flex items-center justify-center w-full">
          <span className="text-xs font-semibold text-muted-foreground">
            {t('admin.users.columns.actions')}
          </span>
        </div>
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-lg p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <MoreHorizontalIcon className="size-4" />
                  <span className="sr-only">{t('admin.users.columns.actions')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 p-1.5 rounded-xl shadow-xl border-border"
              >
                <DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
                  {t('admin.users.columns.actions')}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => onCopyUid(user.uid)}
                    className="gap-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
                  >
                    <CopyIcon className="size-4 text-muted-foreground" />
                    <span>{t('admin.users.actions.copyUid')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(user)}
                    className="gap-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
                  >
                    <Edit2Icon className="size-4 text-muted-foreground" />
                    <span>{t('admin.users.actions.edit')}</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => onToggleStatusRequest(user)}
                    className={cn(
                      'gap-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer',
                      user.status === 'active'
                        ? 'text-rose-600 dark:text-rose-400 focus:text-rose-600'
                        : 'text-emerald-600 dark:text-emerald-400 focus:text-emerald-600',
                    )}
                  >
                    {user.status === 'active' ? (
                      <>
                        <BanIcon className="size-4 text-rose-600 dark:text-rose-400" />
                        <span>{t('admin.users.actions.disable')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{t('admin.users.actions.activate')}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onToggleRoleRequest(user)}
                    className="gap-2.5 px-2.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer text-indigo-600 dark:text-indigo-400 focus:text-indigo-600"
                  >
                    {user.role === 'admin' ? (
                      <>
                        <UserCheckIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{t('admin.users.actions.demoteMember')}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheckIcon className="size-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{t('admin.users.actions.promoteAdmin')}</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
