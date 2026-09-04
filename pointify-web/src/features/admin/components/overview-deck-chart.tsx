import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import type { DeckDistributionItem } from '../types/admin-overview.types';

interface OverviewDeckChartProps {
  data: DeckDistributionItem[];
}

const DECK_COLORS = ['var(--primary)', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const DECK_LABELS: Record<string, string> = {
  fibonacci: 'Fibonacci (0, 1, 2, 3, 5, 8...)',
  't-shirt': 'T-Shirt Sizes (XS, S, M, L, XL)',
  'fibonacci-modified': 'Modified Fibonacci',
  'powers-of-2': 'Powers of 2 (1, 2, 4, 8, 16)',
};

export function OverviewDeckChart({ data }: OverviewDeckChartProps) {
  const { t } = useTranslation();

  const chartConfig: ChartConfig = data.reduce((acc, item, index) => {
    acc[item.deckType] = {
      label: DECK_LABELS[item.deckType] || item.deckType,
      color: DECK_COLORS[index % DECK_COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  const chartData = data.map((item, index) => ({
    name: item.deckType,
    label: DECK_LABELS[item.deckType] || item.deckType,
    value: item.count,
    percentage: item.percentage,
    fill: DECK_COLORS[index % DECK_COLORS.length],
  }));

  const totalRoomsWithDecks = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="flex flex-col border border-border bg-card shadow-xs">
      <CardHeader className="p-5 pb-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base sm:text-lg font-semibold tracking-tight">
            {t('admin.overview.charts.deckDistributionTitle')}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t('admin.overview.charts.deckDistributionSubtitle')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between p-5 pt-0">
        {data.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
            {t('admin.overview.charts.noChartData')}
          </div>
        ) : (
          <>
            <div className="relative mx-auto flex aspect-square max-h-[190px] items-center justify-center">
              <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={48}
                    outerRadius={75}
                    strokeWidth={3}
                    stroke="var(--background)"
                    paddingAngle={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${entry.name}-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Center counter badge */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {totalRoomsWithDecks}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {t('admin.nav.rooms')}
                </span>
              </div>
            </div>

            {/* List breakdown */}
            <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
              {data.slice(0, 4).map((item, index) => (
                <div key={item.deckType} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: DECK_COLORS[index % DECK_COLORS.length],
                      }}
                    />
                    <span className="font-medium text-foreground truncate">
                      {DECK_LABELS[item.deckType] || item.deckType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-muted-foreground">{item.count}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 font-medium">
                      {item.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
