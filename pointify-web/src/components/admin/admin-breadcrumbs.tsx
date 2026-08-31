import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Typography } from '@/components/ui/typography';

interface BreadcrumbRouteConfig {
  sectionKey?: string;
  pageKey: string;
}

const ADMIN_BREADCRUMBS_MAP: Record<string, BreadcrumbRouteConfig> = {
  '/admin': {
    pageKey: 'admin.breadcrumbs.overview',
  },
  '/admin/users': {
    sectionKey: 'admin.breadcrumbs.management',
    pageKey: 'admin.breadcrumbs.users',
  },
  '/admin/rooms': {
    sectionKey: 'admin.breadcrumbs.management',
    pageKey: 'admin.breadcrumbs.rooms',
  },
  '/admin/settings': {
    sectionKey: 'admin.breadcrumbs.system',
    pageKey: 'admin.breadcrumbs.settings',
  },
};

export function AdminBreadcrumbs() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const currentRoute = ADMIN_BREADCRUMBS_MAP[pathname] ?? {
    pageKey: 'admin.breadcrumbs.overview',
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:block">
          <BreadcrumbLink asChild>
            <Link
              to="/admin"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              {t('admin.breadcrumbs.admin')}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:block" />

        {currentRoute.sectionKey && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <Typography variant="muted">{t(currentRoute.sectionKey)}</Typography>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        )}

        <BreadcrumbItem>
          <BreadcrumbPage>
            <Typography variant="small" className="font-semibold text-foreground">
              {t(currentRoute.pageKey)}
            </Typography>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
