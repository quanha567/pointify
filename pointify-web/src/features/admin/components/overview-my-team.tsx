import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UsersIcon } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  statusColor: string;
  isPO?: boolean;
}

const members: TeamMember[] = [
  {
    id: 'm-1',
    name: 'Nguyen Minh',
    role: 'PO',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    statusColor: 'bg-amber-400',
    isPO: true,
  },
  {
    id: 'm-2',
    name: 'Tran Ha',
    role: 'Developer',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    statusColor: 'bg-emerald-500',
  },
  {
    id: 'm-3',
    name: 'Le Kim',
    role: 'Developer',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    statusColor: 'bg-emerald-500',
  },
  {
    id: 'm-4',
    name: 'Pham Anh',
    role: 'QA',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    statusColor: 'bg-emerald-500',
  },
];

export function OverviewMyTeam() {
  const { t } = useTranslation('admin');

  return (
    <Card
      variant="container"
      className="rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between h-full"
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground font-sans">
            {t('admin.overview.cards.myTeam')}
          </CardTitle>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>{t('admin.overview.cards.viewAll')}</span>
            <span>→</span>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
        <div className="divide-y divide-border/30">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 py-2.5 hover:bg-muted/30 transition-colors px-1 rounded-md group cursor-pointer"
            >
              {/* Avatar with status indicator dot */}
              <div className="relative shrink-0">
                <Avatar className="size-9 rounded-full border border-border/70 shadow-2xs">
                  <AvatarImage src={member.avatarUrl} alt={member.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-card ${member.statusColor}`}
                />
              </div>

              <div className="grid text-left leading-tight truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {member.name}
                  </span>
                  {member.isPO && <span className="text-xs select-none">👑</span>}
                </div>
                <span className="text-xs text-slate-500 dark:text-muted-foreground truncate mt-0.5">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer +2 more members */}
        <div className="pt-3 border-t border-border/40 mt-auto">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-muted-foreground hover:text-primary transition-colors"
          >
            <UsersIcon className="size-3.5" />
            <span>
              {t('admin.overview.cards.moreMembers', {
                count: 2,
                defaultValue: '+2 more members',
              })}
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
