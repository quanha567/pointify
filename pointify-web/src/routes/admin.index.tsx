import { createFileRoute, Link } from '@tanstack/react-router';
import {
  UsersIcon,
  LayersIcon,
  ShieldCheckIcon,
  ActivityIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  TrendingUpIcon,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export const Route = createFileRoute('/admin/')({
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const stats = [
    {
      title: 'Tổng số tài khoản',
      value: '1,280',
      change: '+14% so với tháng trước',
      icon: UsersIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Phòng ước lượng',
      value: '342',
      change: '+28 phòng đang hoạt động',
      icon: LayersIcon,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Quản trị viên',
      value: '6',
      change: 'Bảo mật 2FA 100%',
      icon: ShieldCheckIcon,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Độ trễ hệ thống',
      value: '24ms',
      change: 'Uptime 99.98%',
      icon: ActivityIcon,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 overflow-y-auto pr-1">
      <div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Tổng quan Quản trị (Admin Overview)
        </h1>
        <p className="text-xs text-muted-foreground">
          Theo dõi các chỉ số vận hành, tài khoản người dùng và trạng thái hệ thống Scrum Poker.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUpIcon className="h-3 w-3 text-emerald-500" />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">
                  Quản lý tài khoản (Users Table)
                </CardTitle>
                <CardDescription className="text-xs">
                  Bảng dữ liệu ảo hóa cao cấp hỗ trợ cuộn mượt hàng ngàn người dùng, lọc đa tiêu
                  chí, ghim cột và xuất file CSV.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                AG-Grid Style
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/50 p-4 bg-muted/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                <span>Tính năng đã hoàn thiện:</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Virtual Scrolling với `@tanstack/react-virtual` duy trì 60 FPS</li>
                <li>Ghim cột trái (Checkbox) và ghim cột phải (Menu thao tác)</li>
                <li>Kéo giãn độ rộng cột (Column Resizing) trực quan</li>
                <li>
                  Tùy chỉnh ẩn/hiện cột và chuyển đổi độ giãn dòng (Compact / Normal / Comfortable)
                </li>
                <li>
                  Chỉnh sửa và thêm mới tài khoản với TanStack Form + Zod trong Slideout Sheet
                </li>
                <li>Thao tác hàng loạt (Bulk Actions) với thanh công cụ nổi (Floating Toolbar)</li>
              </ul>
            </div>

            <div className="pt-2">
              <Button asChild className="text-xs h-9 gap-2 shadow-md">
                <Link to="/admin/users">
                  <span>Mở danh sách Người dùng</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base font-bold">Trạng thái hạ tầng</CardTitle>
            <CardDescription className="text-xs">Các dịch vụ kết nối</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 text-xs">
              <span className="font-medium">Firebase Auth</span>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[10px]">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 text-xs">
              <span className="font-medium">Cloud Firestore</span>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[10px]">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 text-xs">
              <span className="font-medium">NestJS Fastify Backend</span>
              <Badge className="bg-emerald-500/20 text-emerald-500 border-0 text-[10px]">
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
