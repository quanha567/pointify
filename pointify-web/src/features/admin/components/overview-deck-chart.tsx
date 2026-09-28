import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ChevronDownIcon } from 'lucide-react';
import type { DeckDistributionItem } from '../types/admin-overview.types';

interface OverviewDeckChartProps {
  data?: DeckDistributionItem[];
}

const CATEGORY_COLORS = [
  'var(--primary)',
  'var(--chart-2)',
  'var(--chart-5)',
  'var(--chart-3)',
  'var(--chart-4)',
];

export function OverviewDeckChart({ data: _ }: OverviewDeckChartProps) {
  const { t } = useTranslation('admin');

  const distributionData = [
    {
      name: t('admin.overview.cards.feature'),
      count: 10,
      percentage: 42,
      fill: CATEGORY_COLORS[0],
    },
    {
      name: t('admin.overview.cards.bug'),
      count: 6,
      percentage: 25,
      fill: CATEGORY_COLORS[1],
    },
    {
      name: t('admin.overview.cards.refactor'),
      count: 4,
      percentage: 17,
      fill: CATEGORY_COLORS[2],
    },
    {
      name: t('admin.overview.cards.uiux'),
      count: 2,
      percentage: 8,
      fill: CATEGORY_COLORS[3],
    },
    {
      name: t('admin.overview.cards.others'),
      count: 2,
      percentage: 8,
      fill: CATEGORY_COLORS[4],
    },
  ];

  const chartConfig: ChartConfig = distributionData.reduce((acc, item) => {
    acc[item.name] = {
      label: item.name,
      color: item.fill,
    };
    return acc;
  }, {} as ChartConfig);

  const totalGames = 24;

  return (
    <Card
      variant="container"
      className="rounded-lg border border-border bg-card shadow-xs flex flex-col justify-between h-full"
    >
      <CardHeader className="p-5 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground font-sans">
            {t('admin.overview.cards.gameDistribution')}
          </CardTitle>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-md border border-border bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <span>{t('admin.overview.cards.thisMonth')}</span>
            <ChevronDownIcon className="size-3 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col sm:flex-row items-center justify-between p-5 pt-0 gap-4">
        {/* Left: Donut Chart with Total Games in center */}
        <div className="relative flex aspect-square size-40 sm:size-44 shrink-0 items-center justify-center mx-auto sm:mx-0">
          <ChartContainer config={chartConfig} className="aspect-square size-full">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={distributionData}
                dataKey="count"
                nameKey="name"
                innerRadius={50}
                outerRadius={74}
                strokeWidth={3}
                stroke="var(--card)"
                paddingAngle={2}
              >
                {distributionData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          {/* Center counter */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-2xl font-black tracking-tight text-foreground leading-none">
              {totalGames}
            </span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
              {t('admin.overview.cards.totalGames')}
            </span>
          </div>
        </div>

        {/* Right: Legend with % and count */}
        <div className="flex flex-1 flex-col gap-2 w-full min-w-0">
          {distributionData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="font-medium text-foreground truncate font-sans">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 font-mono text-xs font-semibold">
                <span className="text-muted-foreground/80">{item.percentage}%</span>
                <span className="text-foreground w-4 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
