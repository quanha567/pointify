import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Check, ExternalLink, Globe, Link2, Loader2, ShieldCheck, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TypographyMuted, TypographySmall } from '@/components/ui/typography';
import { ConfirmDialog } from '@/components/feedback/confirm-dialog';
import {
  useJiraStatus,
  useJiraConnectMutation,
  useJiraDisconnectMutation,
  getJiraAuthUrlApi,
} from '../api/jira.api';

export function JiraIntegrationCard() {
  const { t } = useTranslation(['room', 'common']);
  const { data: status, isLoading, refetch } = useJiraStatus();
  const connectMutation = useJiraConnectMutation();
  const disconnectMutation = useJiraDisconnectMutation();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);

  // Handle OAuth callback code from URL query if present (?jira=callback&code=...)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const isJiraCallback = urlParams.get('jira') === 'callback' || Boolean(code);

    if (code && isJiraCallback) {
      window.history.replaceState({}, document.title, window.location.pathname);

      toast.loading(t('jira.connecting'), { id: 'jira-auth' });
      connectMutation.mutate(code, {
        onSuccess: () => {
          toast.success(t('jira.connectedSuccess'), {
            id: 'jira-auth',
          });
          void refetch();
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : t('jira.connectFailed');
          toast.error(msg, { id: 'jira-auth' });
        },
      });
    }
  }, []);

  const handleConnect = async () => {
    try {
      setIsRedirecting(true);
      const { url } = await getJiraAuthUrlApi(window.location.origin);
      window.location.href = url;
    } catch (err: unknown) {
      setIsRedirecting(false);
      const msg = err instanceof Error ? err.message : t('jira.authUrlFailed');
      toast.error(msg);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync();
      toast.success(t('jira.disconnectedSuccess'));
      setIsDisconnectDialogOpen(false);
      void refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('jira.disconnectFailed');
      toast.error(msg);
    }
  };

  return (
    <>
      <CardContent className="p-6 space-y-6">
        {/* Section Intro */}
        <div className="space-y-1">
          <TypographySmall className="text-base font-semibold text-foreground">
            {t('jira.integrationsTitle')}
          </TypographySmall>
          <TypographyMuted className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {t('jira.integrationsDesc')}
          </TypographyMuted>
        </div>

        {/* Jira Service Integration Row - Matching Google Provider style */}
        <div className="p-4 sm:p-5 rounded-xl border border-border bg-muted/30 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            {/* Jira Brand Logo */}
            <div className="size-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <svg className="size-6 fill-current" viewBox="0 0 24 24">
                <path d="M11.53 2c0 2.4 1.97 4.35 4.39 4.35h1.79v1.74c0 2.4 1.97 4.35 4.39 4.35V2h-10.57zm-4.4 4.35c0 2.4 1.97 4.35 4.39 4.35h1.79v1.74c0 2.4 1.97 4.35 4.39 4.35V6.35H7.13zM2.73 10.7c0 2.4 1.97 4.35 4.39 4.35h1.79v1.74c0 2.4 1.97 4.35 4.39 4.35V10.7H2.73z" />
              </svg>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <TypographySmall className="text-sm sm:text-base font-semibold text-foreground">
                  Atlassian Jira Software
                </TypographySmall>
                {status?.isConnected ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs h-5 px-2 gap-1"
                  >
                    <Check className="size-3 text-emerald-500" />
                    <span>{t('jira.connected')}</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground font-medium h-5 px-2"
                  >
                    {t('jira.notConnected')}
                  </Badge>
                )}
              </div>
              <TypographyMuted className="text-xs leading-relaxed line-clamp-2">
                {t('jira.description')}
              </TypographyMuted>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="shrink-0 sm:self-center">
            {status?.isConnected ? (
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 border-border gap-1.5 cursor-pointer w-full sm:w-auto"
                disabled={disconnectMutation.isPending}
                onClick={() => setIsDisconnectDialogOpen(true)}
              >
                {disconnectMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Unlink className="size-3.5" />
                )}
                <span>{t('jira.disconnect')}</span>
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                size="sm"
                className="h-9 text-xs sm:text-sm font-medium gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer w-full sm:w-auto"
                disabled={isRedirecting || connectMutation.isPending || isLoading}
              >
                {isRedirecting || connectMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Link2 className="size-4" />
                )}
                <span>{t('jira.connectWithAtlassian')}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Connected Workspaces List (Visible when connected) */}
        {isLoading ? (
          <div className="py-6 flex items-center justify-center text-muted-foreground text-sm gap-2">
            <Loader2 className="size-4 animate-spin text-primary" />
            <span>{t('common:common.loading')}</span>
          </div>
        ) : status?.isConnected && status.sites.length > 0 ? (
          <div className="space-y-3 pt-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="size-3.5 text-muted-foreground" />
              <span>{t('jira.connectedSites')}</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {status.sites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card/90 transition-colors text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Globe className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground flex items-center gap-2 truncate">
                        <span className="truncate">{site.name}</span>
                        {site.id === status.defaultCloudId && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-1.5 h-4 shrink-0 font-normal"
                          >
                            {t('jira.defaultSite')}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{site.url}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                    asChild
                  >
                    <a href={site.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Standard Security Assurance Box */}
        <div className="text-xs text-muted-foreground flex items-start gap-3 p-3.5 rounded-xl bg-muted/20 border border-border/60">
          <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-medium text-foreground">{t('jira.securityTitle')}</span>
            <p className="text-muted-foreground leading-normal">{t('jira.helperNote')}</p>
          </div>
        </div>
      </CardContent>

      {/* Unified Card Footer matching Profile and Security tabs */}
      <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border p-4 px-6 bg-muted/20 text-xs text-muted-foreground">
        <span>{status?.isConnected ? t('jira.statusActive') : t('jira.statusInactive')}</span>
        {status?.connectedAt ? (
          <span className="text-muted-foreground/80">
            {t('jira.lastConnected')}: {new Date(status.connectedAt).toLocaleDateString()}
          </span>
        ) : null}
      </CardFooter>

      {/* Disconnect Confirmation Dialog */}
      <ConfirmDialog
        open={isDisconnectDialogOpen}
        onOpenChange={setIsDisconnectDialogOpen}
        title={t('jira.disconnectConfirmTitle')}
        description={t('jira.disconnectConfirmDesc')}
        confirmLabel={t('jira.confirmDisconnect')}
        cancelLabel={t('common:common.cancel')}
        variant="destructive"
        isLoading={disconnectMutation.isPending}
        onConfirm={handleDisconnect}
      />
    </>
  );
}
