import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export const Route = createRootRoute({
  component: () => (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center space-x-2 font-bold text-lg">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Pointify
                </span>
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link
                  to="/"
                  className="transition-colors hover:text-foreground/80 text-foreground [&.active]:text-primary font-semibold"
                >
                  Home
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto p-6">
          <Outlet />
        </main>
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </TooltipProvider>
  ),
});
