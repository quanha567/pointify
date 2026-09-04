import { useTranslation } from 'react-i18next';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { ActivityTrendItem } from '../types/admin-overview.types';

interface OverviewActivityChartProps {
  data: ActivityTrendItem[];
}

export function OverviewActivityChart({ data }: OverviewActivityChartProps) {
  const { t } = useTranslation();

  const chartConfig: ChartConfig = {
    rounds: {
      label: t('admin.overview.charts.rounds'),
      color: 'var(--primary)',
    },
    rooms: {
      label: t('admin.overview.charts.rooms'),
      color: '#8b5cf6',
    },
    accounts: {
      label: t('admin.overview.charts.accounts'),
      color: '#06b6d4',
    },
  };

  // Format date for display on XAxis (e.g. "2026-08-30" -> "30/08")
  const formattedData = data.map((item) => {
    const parts = item.date.split('-');
    const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date;
    return {
      ...item,
      shortDate,
    };
  });

  return (
    <Card className="border border-border bg-card shadow-xs">
      <CardHeader className="p-5 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">
            {t('admin.overview.charts.activityTrendTitle')}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t('admin.overview.charts.activityTrendSubtitle')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        {formattedData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
            {t('admin.overview.charts.noChartData')}
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRounds" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillRooms" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis
                dataKey="shortDate"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={20}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                className="text-xs"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="rounds"
                type="monotone"
                fill="url(#fillRounds)"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                dataKey="rooms"
                type="monotone"
                fill="url(#fillRooms)"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
