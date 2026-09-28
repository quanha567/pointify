import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2Icon } from 'lucide-react';

interface GameItem {
  id: string;
  name: string;
  team: string;
  date: string;
  status: 'in_progress' | 'completed';
}

const games: GameItem[] = [
  {
    id: 'g-32',
    name: 'Sprint 32 - Feature Update',
    team: 'Frontend Team',
    date: 'Sep 8, 2025 09:20',
    status: 'in_progress',
  },
  {
    id: 'g-31',
    name: 'Sprint 31 - Bug Fixes',
    team: 'Mobile Team',
    date: 'Sep 7, 2025 14:30',
    status: 'completed',
  },
  {
    id: 'g-30',
    name: 'Sprint 30 - Performance',
    team: 'Platform Team',
    date: 'Sep 6, 2025 10:15',
    status: 'completed',
  },
  {
    id: 'g-29',
    name: 'Sprint 29 - UI/UX',
    team: 'Frontend Team',
    date: 'Sep 5, 2025 16:40',
    status: 'completed',
  },
  {
    id: 'g-28',
    name: 'Sprint 28 - Refactor',
    team: 'Backend Team',
    date: 'Sep 3, 2025 11:20',
    status: 'completed',
  },
];

export function OverviewRecentGames() {
  const { t } = useTranslation('admin');

  return (
    <Card
      variant="container"
      className="rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between h-full"
    >
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground font-sans">
            {t('admin.overview.cards.recentGames')}
          </CardTitle>
          <Link
            to="/admin/rooms"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>{t('admin.overview.cards.viewAll')}</span>
            <span>→</span>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-between">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground font-semibold">
                <th className="pb-3 font-medium">{t('admin.overview.cards.name')}</th>
                <th className="pb-3 font-medium">{t('admin.overview.cards.team')}</th>
                <th className="pb-3 font-medium">{t('admin.overview.cards.date')}</th>
                <th className="pb-3 font-medium text-right">{t('admin.overview.cards.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {games.map((game) => {
                const isInProgress = game.status === 'in_progress';
                return (
                  <tr
                    key={game.id}
                    className="hover:bg-muted/30 transition-colors group cursor-pointer"
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Gamepad2Icon className="size-3.5" />
                        </div>
                        <span className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-xs sm:text-sm">
                          {game.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                      {game.team}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground/80 whitespace-nowrap">
                      {game.date}
                    </td>
                    <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                      <Badge
                        variant="secondary"
                        className={`rounded-sm text-[11px] font-semibold px-2 py-0.5 border-0 shadow-none ${
                          isInProgress
                            ? 'bg-primary/10 text-primary'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isInProgress
                          ? t('admin.overview.cards.inProgress')
                          : t('admin.overview.cards.completed')}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
