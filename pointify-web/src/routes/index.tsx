import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium bg-muted/50 backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          <span>Pointify Web Starter</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          React 19 + Tailwind v4 + TanStack Router + shadcn/ui
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Cấu hình hoàn chỉnh với Voidzero Vite-plus, Tailwind CSS v4, File-based TanStack Router,
          và shadcn/ui.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Button size="lg" className="gap-2">
            <Zap className="size-4" /> Bắt đầu ngay
          </Button>
          <Button size="lg" variant="outline">
            Tài liệu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Zap className="size-5" />
            </div>
            <CardTitle>Tailwind CSS v4</CardTitle>
            <CardDescription>
              Engine CSS thế hệ mới siêu nhanh tích hợp qua @tailwindcss/vite.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Sử dụng CSS variables hiện đại, tối ưu hoá bundle và không cần file tailwind.config cồng
            kềnh.
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Layers className="size-5" />
            </div>
            <CardTitle>TanStack Router</CardTitle>
            <CardDescription>
              Type-safe file-based routing với Vite plugin tự động tạo routeTree.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Hỗ trợ nested routes, search params validation, loader data fetching và prefetching mạnh
            mẽ.
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="size-5" />
            </div>
            <CardTitle>shadcn/ui New York</CardTitle>
            <CardDescription>
              Thư viện component UI tùy biến cao và hỗ trợ đầy đủ accessibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Dễ dàng cài đặt thêm các component qua CLI `bunx shadcn add [component]`.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
