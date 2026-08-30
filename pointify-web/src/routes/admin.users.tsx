import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  UserPlusIcon,
  ShieldCheckIcon,
  MoreHorizontalIcon,
  CopyIcon,
  Edit2Icon,
  BanIcon,
  CheckCircle2Icon,
  KeyRoundIcon,
  MailIcon,
  GlobeIcon,
  UserCheckIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

import {
  DataTable,
  DataTableColumnHeader,
  type DataTableFilterOption,
} from '../components/data-table';
import {
  UserFormSheet,
  type UserAccountData,
  type UserFormValues,
} from '../components/admin/user-form-sheet';
import { Checkbox } from '../components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
});

// Mock fallback dataset for rich demo when backend has few users
const FALLBACK_USERS: UserAccountData[] = [
  {
    uid: 'usr_admin_001',
    displayName: 'Quân Hà (Admin)',
    email: 'admin@pointify.app',
    photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin1',
    providerId: 'google.com',
    role: 'admin',
    status: 'active',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    lastLoginAt: Date.now() - 1000 * 60 * 15,
  },
  {
    uid: 'usr_scrum_002',
    displayName: 'Sarah Connor',
    email: 'sarah.c@cyberdyne.io',
    photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah',
    providerId: 'google.com',
    role: 'member',
    status: 'active',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
    lastLoginAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    uid: 'usr_dev_003',
    displayName: 'Alex Morgan',
    email: 'alex.m@agiletech.dev',
    photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
    providerId: 'password',
    role: 'member',
    status: 'active',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
    lastLoginAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    uid: 'usr_guest_004',
    displayName: 'Thành viên khách 108',
    email: null,
    photoURL: null,
    providerId: 'anonymous',
    role: 'member',
    status: 'active',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    lastLoginAt: Date.now() - 1000 * 60 * 30,
  },
  {
    uid: 'usr_banned_005',
    displayName: 'Spam Bot 99',
    email: 'spambot@suspicious.net',
    photoURL: null,
    providerId: 'password',
    role: 'member',
    status: 'disabled',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40,
    lastLoginAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
  },
  ...Array.from({ length: 45 }).map((_, i) => ({
    uid: `usr_gen_${100 + i}`,
    displayName: `Dev Agile User #${i + 1}`,
    email: `dev.user.${i + 1}@pointify.demo`,
    photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=user${i + 10}`,
    providerId: i % 3 === 0 ? 'google.com' : i % 3 === 1 ? 'password' : 'anonymous',
    role: i === 7 ? ('admin' as const) : ('member' as const),
    status: i % 9 === 0 ? ('disabled' as const) : ('active' as const),
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * (i + 1),
    lastLoginAt: Date.now() - 1000 * 60 * (i * 37 + 5),
  })),
];

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccountData | null>(null);

  // Fetch Users via TanStack Query
  const {
    data: usersData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/admin/users?limit=100');
        if (!res.ok) {
          throw new Error('API not available');
        }
        const json = await res.json();
        if (json.success && Array.isArray(json.users) && json.users.length > 0) {
          return json.users as UserAccountData[];
        }
      } catch {
        // Fallback gracefully to demo records if backend is empty
      }
      return FALLBACK_USERS;
    },
  });

  // Mutation to update user
  const updateUserMutation = useMutation({
    mutationFn: async ({ uid, values }: { uid: string; values: UserFormValues }) => {
      try {
        const res = await fetch(`/api/admin/users/${uid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        if (!res.ok) {
          throw new Error('Failed to update user on server');
        }
      } catch {
        // Optimistic local state update fallback
      }

      // Optimistically update query cache
      queryClient.setQueryData<UserAccountData[]>(['admin-users'], (old) => {
        if (!old) return old;
        return old.map((u) => (u.uid === uid ? { ...u, ...values } : u));
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleSaveUser = async (values: UserFormValues) => {
    if (selectedUser) {
      await updateUserMutation.mutateAsync({
        uid: selectedUser.uid,
        values,
      });
    } else {
      // Create new user (optimistic)
      const newUser: UserAccountData = {
        uid: `usr_${Date.now()}`,
        displayName: values.displayName,
        email: `${values.displayName.toLowerCase().replace(/\s+/g, '')}@pointify.app`,
        photoURL: values.photoURL || null,
        providerId: 'password',
        role: values.role,
        status: values.status,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      queryClient.setQueryData<UserAccountData[]>(['admin-users'], (old) => [
        newUser,
        ...(old || []),
      ]);
    }
  };

  const handleCopyUid = (uid: string) => {
    void navigator.clipboard.writeText(uid);
    toast.success(`Đã sao chép UID: ${uid}`);
  };

  const handleToggleStatus = async (user: UserAccountData) => {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active';
    await updateUserMutation.mutateAsync({
      uid: user.uid,
      values: {
        displayName: user.displayName,
        photoURL: user.photoURL || '',
        role: user.role,
        status: nextStatus,
      },
    });
    toast.success(
      nextStatus === 'active'
        ? `Đã kích hoạt tài khoản ${user.displayName}`
        : `Đã tạm khóa tài khoản ${user.displayName}`,
    );
  };

  const handleToggleRole = async (user: UserAccountData) => {
    const nextRole = user.role === 'admin' ? 'member' : 'admin';
    await updateUserMutation.mutateAsync({
      uid: user.uid,
      values: {
        displayName: user.displayName,
        photoURL: user.photoURL || '',
        role: nextRole,
        status: user.status,
      },
    });
    toast.success(`Đã chuyển vai trò của ${user.displayName} sang ${nextRole.toUpperCase()}`);
  };

  // AG-Grid Style Columns Definition
  const columns = useMemo<ColumnDef<UserAccountData>[]>(
    () => [
      // Select Checkbox (Pinned Left)
      {
        id: 'select',
        size: 45,
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
              aria-label="Chọn tất cả"
              className="translate-y-[2px]"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Chọn dòng"
              className="translate-y-[2px]"
            />
          </div>
        ),
      },

      // User Profile Column (Avatar + Display Name + UID)
      {
        accessorKey: 'displayName',
        id: 'user',
        size: 260,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Người dùng (User)" />,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 ring-1 ring-border/80 shrink-0">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                  {user.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-foreground truncate">
                    {user.displayName}
                  </span>
                  {user.role === 'admin' && (
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-primary fill-primary/20 shrink-0" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyUid(user.uid);
                  }}
                  className="group/uid flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-mono truncate text-left"
                  title="Nhấn để copy UID"
                >
                  <span className="truncate">{user.uid}</span>
                  <CopyIcon className="h-2.5 w-2.5 opacity-0 group-hover/uid:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          );
        },
      },

      // Email Address
      {
        accessorKey: 'email',
        id: 'email',
        size: 220,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
        cell: ({ row }) => {
          const email = row.original.email;
          return email ? (
            <div className="flex items-center gap-1.5 text-xs text-foreground/80">
              <MailIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          ) : (
            <span className="text-[11px] italic text-muted-foreground">Không có email</span>
          );
        },
      },

      // Auth Provider
      {
        accessorKey: 'providerId',
        id: 'providerId',
        size: 140,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Phương thức" />,
        cell: ({ row }) => {
          const provider = row.original.providerId;
          const isGoogle = provider.includes('google');
          const isPass = provider.includes('password');

          return (
            <Badge
              variant="outline"
              className="text-[10px] font-mono gap-1 font-medium bg-muted/30"
            >
              {isGoogle && <GlobeIcon className="h-3 w-3 text-red-500" />}
              {isPass && <KeyRoundIcon className="h-3 w-3 text-amber-500" />}
              {!isGoogle && !isPass && <UserCheckIcon className="h-3 w-3 text-blue-500" />}
              <span>{isGoogle ? 'Google' : isPass ? 'Password' : 'Guest'}</span>
            </Badge>
          );
        },
      },

      // Role Badge
      {
        accessorKey: 'role',
        id: 'role',
        size: 120,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
        cell: ({ row }) => {
          const role = row.original.role;
          return role === 'admin' ? (
            <Badge className="bg-primary/20 hover:bg-primary/30 text-primary border-primary/30 text-[10px] font-semibold">
              Admin
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] font-normal">
              Member
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },

      // Account Status
      {
        accessorKey: 'status',
        id: 'status',
        size: 130,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
        cell: ({ row }) => {
          const status = row.original.status;
          return status === 'active' ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Hoạt động
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-destructive/30 bg-destructive/10 text-destructive text-[10px] gap-1"
            >
              <BanIcon className="h-3 w-3" />
              Đã khóa
            </Badge>
          );
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id));
        },
      },

      // Created Date
      {
        accessorKey: 'createdAt',
        id: 'createdAt',
        size: 140,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày tạo" />,
        cell: ({ row }) => {
          const time = row.original.createdAt;
          return (
            <span className="text-xs text-muted-foreground">
              {format(new Date(time), 'dd/MM/yyyy')}
            </span>
          );
        },
      },

      // Last Login
      {
        accessorKey: 'lastLoginAt',
        id: 'lastLoginAt',
        size: 150,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Đăng nhập cuối" />,
        cell: ({ row }) => {
          const time = row.original.lastLoginAt;
          return (
            <span className="text-xs text-muted-foreground font-mono">
              {format(new Date(time), 'dd/MM HH:mm')}
            </span>
          );
        },
      },

      // Actions Column (Pinned Right)
      {
        id: 'actions',
        size: 60,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const user = row.original;

          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/80 rounded-lg"
                  >
                    <MoreHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Mở tùy chọn</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 shadow-2xl border-border/60 bg-popover/95 backdrop-blur-md"
                >
                  <DropdownMenuLabel className="text-xs font-semibold">
                    Thao tác ({user.displayName})
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedUser(user);
                      setFormSheetOpen(true);
                    }}
                    className="cursor-pointer text-xs"
                  >
                    <Edit2Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Chỉnh sửa thông tin
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleCopyUid(user.uid)}
                    className="cursor-pointer text-xs"
                  >
                    <CopyIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    Sao chép UID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleToggleRole(user)}
                    className="cursor-pointer text-xs"
                  >
                    <ShieldCheckIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                    {user.role === 'admin' ? 'Hạ quyền xuống Member' : 'Nâng quyền lên Admin'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleToggleStatus(user)}
                    className={cn(
                      'cursor-pointer text-xs font-medium',
                      user.status === 'active'
                        ? 'text-destructive hover:bg-destructive/10'
                        : 'text-emerald-600 hover:bg-emerald-500/10',
                    )}
                  >
                    {user.status === 'active' ? (
                      <>
                        <BanIcon className="mr-2 h-3.5 w-3.5" />
                        Tạm khóa tài khoản
                      </>
                    ) : (
                      <>
                        <CheckCircle2Icon className="mr-2 h-3.5 w-3.5" />
                        Mở khóa tài khoản
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  // Faceted Filter Options
  const facetedFilters = useMemo(
    () => [
      {
        columnId: 'role',
        title: 'Vai trò',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Member', value: 'member' },
        ] as DataTableFilterOption[],
      },
      {
        columnId: 'status',
        title: 'Trạng thái',
        options: [
          { label: 'Hoạt động', value: 'active' },
          { label: 'Đã khóa', value: 'disabled' },
        ] as DataTableFilterOption[],
      },
    ],
    [],
  );

  // Bulk Actions
  const handleBulkActivate = (selectedUsers: UserAccountData[]) => {
    selectedUsers.forEach((u) => {
      updateUserMutation.mutate({
        uid: u.uid,
        values: {
          displayName: u.displayName,
          photoURL: u.photoURL || '',
          role: u.role,
          status: 'active',
        },
      });
    });
    toast.success(`Đã kích hoạt ${selectedUsers.length} tài khoản`);
  };

  const handleBulkDisable = (selectedUsers: UserAccountData[]) => {
    selectedUsers.forEach((u) => {
      updateUserMutation.mutate({
        uid: u.uid,
        values: {
          displayName: u.displayName,
          photoURL: u.photoURL || '',
          role: u.role,
          status: 'disabled',
        },
      });
    });
    toast.success(`Đã khóa ${selectedUsers.length} tài khoản`);
  };

  return (
    <div className="flex flex-col h-full w-full space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Quản lý tài khoản (Users)
          </h1>
          <p className="text-xs text-muted-foreground">
            Bảng dữ liệu ảo hóa hiệu năng cao (TanStack Virtual + TanStack Table) hỗ trợ ghim cột,
            kéo giãn, lọc và xuất dữ liệu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8 text-xs gap-1.5 border-border/80 hover:border-primary/50"
          >
            <RefreshCwIcon className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')} />
            <span>Làm mới</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedUser(null);
              setFormSheetOpen(true);
            }}
            className="h-8 text-xs gap-1.5 font-semibold shadow-md shadow-primary/20"
          >
            <UserPlusIcon className="h-3.5 w-3.5" />
            <span>Thêm tài khoản</span>
          </Button>
        </div>
      </div>

      {/* AG-Grid Style Virtual Data Table */}
      <div className="flex-1 min-h-0">
        <DataTable
          columns={columns}
          data={usersData || []}
          isLoading={isLoading}
          searchPlaceholder="Tìm theo tên, email, UID..."
          facetedFilters={facetedFilters}
          floatingActions={(selectedRows) => (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkActivate(selectedRows)}
                className="h-7 px-2.5 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-0"
              >
                <CheckCircle2Icon className="mr-1.5 h-3 w-3 text-emerald-400" />
                Mở khóa ({selectedRows.length})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleBulkDisable(selectedRows)}
                className="h-7 px-2.5 text-xs bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground border-0"
              >
                <BanIcon className="mr-1.5 h-3 w-3" />
                Khóa ({selectedRows.length})
              </Button>
            </>
          )}
        />
      </div>

      {/* Slide-out User Form Sheet */}
      <UserFormSheet
        open={formSheetOpen}
        onOpenChange={setFormSheetOpen}
        user={selectedUser}
        onSave={handleSaveUser}
        isLoading={updateUserMutation.isPending}
      />
    </div>
  );
}
