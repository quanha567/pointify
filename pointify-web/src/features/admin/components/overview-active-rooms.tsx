import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayersIcon, UsersIcon, ChevronRightIcon, RadioIcon } from 'lucide-react';

interface ActiveRoomItem {
  id: string;
  name: string;
  squad: string;
  participants: number;
  deck: string;
  status: 'voting' | 'revealed' | 'idle';
  time: string;
}

const mockActiveRooms: ActiveRoomItem[] = [
  {
    id: 'room-1',
    name: 'Vessel Tracking • Sprint 42',
    squad: 'OTS Navigation Squad',
    participants: 8,
    deck: 'Fibonacci',
    status: 'voting',
    time: '3m ago',
  },
  {
    id: 'room-2',
    name: 'Ocean Cargo Booking API',
    squad: 'Logistics Platform Squad',
    participants: 6,
    deck: 'T-Shirt',
    status: 'revealed',
    time: '12m ago',
  },
  {
    id: 'room-3',
    name: 'Port Gate Auto-Checkin',
    squad: 'IoT Edge Team',
    participants: 11,
    deck: 'Fibonacci',
    status: 'voting',
    time: '25m ago',
  },
  {
    id: 'room-4',
    name: 'Tariff & EDI Integration',
    squad: 'Billing Squad',
    participants: 5,
    deck: 'Modified Fib',
    status: 'idle',
    time: '42m ago',
  },
];

export function OverviewActiveRooms() {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <Card className="flex flex-col rounded-lg border border-border/70 bg-card shadow-xs transition-shadow hover:shadow-sm">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayersIcon className="size-4" />
            </div>
            <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">
              {t('admin.overview.activeRooms.title')}
            </CardTitle>
          </div>

          <Link
            to="/admin/rooms"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-0.5 transition-colors"
          >
            <span>{t('common:common.viewAll')}</span>
            <ChevronRightIcon className="size-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-5 pt-0">
        <div className="divide-y divide-border/60">
          {mockActiveRooms.map((room) => {
            const isVoting = room.status === 'voting';
            const isRevealed = room.status === 'revealed';

            return (
              <div
                key={room.id}
                className="flex items-center justify-between py-3 transition-colors hover:bg-muted/40 px-2 rounded-md group cursor-pointer"
              >
                {/* Left: Icon & Room info */}
                <div className="flex items-center gap-3 overflow-hidden pr-2">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${
                      isVoting
                        ? 'bg-primary/15 text-primary'
                        : isRevealed
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-chart-3/15 text-chart-3'
                    }`}
                  >
                    {isVoting ? (
                      <RadioIcon className="size-4.5 animate-pulse" />
                    ) : (
                      <LayersIcon className="size-4.5" />
                    )}
                  </div>

                  <div className="grid gap-0.5 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {room.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                      <span>{room.squad}</span>
                      <span>•</span>
                      <span>{room.deck}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Participant count & status pill */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className="gap-1 text-[11px] font-medium px-2 py-0.5 rounded-sm border-border/80 bg-background/80"
                  >
                    <UsersIcon className="size-3 text-muted-foreground" />
                    <span>{room.participants}</span>
                  </Badge>

                  <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                    {room.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
