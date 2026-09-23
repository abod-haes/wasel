import {
  Activity,
  Ban,
  CheckCircle2,
  Clock3,
  Copy,
  KeyRound,
  MessageCircleMore,
  Plus,
  Power,
  RefreshCw,
  RotateCw,
  ShieldCheck,
  Smartphone,
  StopCircle,
  Users,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ConfirmDialog, DataTable, PageContainer, SectionHeader } from '@/components/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  useCreateOtpApiKeyMutation,
  useCreateOtpClientMutation,
  useOtpAdminSummaryQuery,
  useOtpApiKeysQuery,
  useOtpAuditLogsQuery,
  useOtpClientsQuery,
  useOtpRequestQuery,
  useOtpRequestsQuery,
  useRevokeOtpApiKeyMutation,
  useUpdateOtpClientMutation,
  useWhatsAppSessionActionMutation,
  useWhatsAppSessionQuery,
} from '@/features/otp-admin/hooks/use-otp-admin-query';
import type {
  CreatedOtpApiKey,
  OtpApiKey,
  OtpAuditLog,
  OtpClient,
  OtpRequest,
  OtpRequestStatus,
  WhatsAppSessionState,
} from '@/features/otp-admin/types/otp-admin-types';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';

const sessionVariant: Record<WhatsAppSessionState, BadgeVariant> = {
  DISCONNECTED: 'secondary',
  STARTING: 'warning',
  QR_READY: 'warning',
  CONNECTING: 'warning',
  READY: 'success',
  RECONNECTING: 'warning',
  LOGGED_OUT: 'danger',
  ERROR: 'danger',
};

const otpVariant: Record<OtpRequestStatus, BadgeVariant> = {
  CREATED: 'secondary',
  QUEUED: 'secondary',
  SENDING: 'warning',
  SENT: 'default',
  VERIFIED: 'success',
  EXPIRED: 'outline',
  FAILED: 'danger',
  BLOCKED: 'danger',
  UNKNOWN: 'warning',
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
};

const totalPages = (totalCount: number, pageSize: number): number =>
  Math.max(1, Math.ceil(totalCount / pageSize));

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}): React.JSX.Element {
  return (
    <Card className="surface-grid overflow-hidden">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OtpAdminPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [otpPage, setOtpPage] = useState(1);
  const [otpPageSize, setOtpPageSize] = useState(20);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(20);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [revokeKey, setRevokeKey] = useState<OtpApiKey | null>(null);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [createdSecret, setCreatedSecret] = useState<CreatedOtpApiKey | null>(null);
  const [clientForm, setClientForm] = useState({
    name: '',
    slug: '',
    hourlyOtpLimit: '100',
    dailyOtpLimit: '500',
  });
  const [apiKeyForm, setApiKeyForm] = useState({
    clientId: '',
    name: '',
    expiresAt: '',
  });

  const summaryQuery = useOtpAdminSummaryQuery();
  const sessionQuery = useWhatsAppSessionQuery();
  const sessionActionMutation = useWhatsAppSessionActionMutation();
  const otpRequestsQuery = useOtpRequestsQuery(otpPage, otpPageSize);
  const otpRequestQuery = useOtpRequestQuery(selectedRequestId);
  const auditLogsQuery = useOtpAuditLogsQuery(auditPage, auditPageSize);
  const clientsQuery = useOtpClientsQuery();
  const apiKeysQuery = useOtpApiKeysQuery();
  const createClientMutation = useCreateOtpClientMutation();
  const updateClientMutation = useUpdateOtpClientMutation();
  const createApiKeyMutation = useCreateOtpApiKeyMutation();
  const revokeApiKeyMutation = useRevokeOtpApiKeyMutation();

  const refreshAll = (): void => {
    void summaryQuery.refetch();
    void sessionQuery.refetch();
    void otpRequestsQuery.refetch();
    void auditLogsQuery.refetch();
    void clientsQuery.refetch();
    void apiKeysQuery.refetch();
  };

  const runSessionAction = (action: 'start' | 'reconnect' | 'stop' | 'logout'): void => {
    sessionActionMutation.mutate(action, {
      onSuccess: () => {
        if (action === 'logout') setLogoutConfirmOpen(false);
      },
    });
  };

  const session = sessionQuery.data;
  const summary = summaryQuery.data;

  const otpColumns = useMemo(
    () => [
      {
        key: 'phone',
        header: t('otpAdmin.otp.phone'),
        renderCell: (item: OtpRequest) => <span dir="ltr">{item.phoneNumber}</span>,
      },
      {
        key: 'purpose',
        header: t('otpAdmin.otp.purpose'),
        renderCell: (item: OtpRequest) => t(`otpAdmin.purposes.${item.purpose}`, { defaultValue: item.purpose }),
      },
      {
        key: 'status',
        header: t('common.status'),
        renderCell: (item: OtpRequest) => (
          <Badge variant={otpVariant[item.status]}>{t(`otpAdmin.otpStatus.${item.status}`)}</Badge>
        ),
      },
      {
        key: 'attempts',
        header: t('otpAdmin.otp.attempts'),
        renderCell: (item: OtpRequest) => `${item.attempts}/${item.maxAttempts}`,
      },
      {
        key: 'createdAt',
        header: t('otpAdmin.otp.createdAt'),
        renderCell: (item: OtpRequest) => (
          <span className="text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</span>
        ),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        className: 'text-end',
        headerClassName: 'text-end',
        renderCell: (item: OtpRequest) => (
          <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRequestId(item.requestId)}>
            {t('otpAdmin.otp.details')}
          </Button>
        ),
      },
    ],
    [t]
  );

  const auditColumns = useMemo(
    () => [
      {
        key: 'action',
        header: t('otpAdmin.audit.action'),
        renderCell: (item: OtpAuditLog) => <span className="font-medium">{item.action}</span>,
      },
      {
        key: 'actor',
        header: t('otpAdmin.audit.actor'),
        renderCell: (item: OtpAuditLog) => (
          <div>
            <p>{item.actorType}</p>
            <p className="text-xs text-muted-foreground">{item.actorId || '-'}</p>
          </div>
        ),
      },
      {
        key: 'resource',
        header: t('otpAdmin.audit.resource'),
        renderCell: (item: OtpAuditLog) => item.resource,
      },
      {
        key: 'createdAt',
        header: t('otpAdmin.audit.createdAt'),
        renderCell: (item: OtpAuditLog) => (
          <span className="text-sm text-muted-foreground">{formatDateTime(item.createdAt)}</span>
        ),
      },
    ],
    [t]
  );

  const submitClient = (): void => {
    if (!clientForm.name.trim() || !/^[a-z0-9-]+$/.test(clientForm.slug.trim())) {
      toast.error(t('otpAdmin.clients.invalid'));
      return;
    }

    createClientMutation.mutate(
      {
        name: clientForm.name.trim(),
        slug: clientForm.slug.trim(),
        hourlyOtpLimit: Number(clientForm.hourlyOtpLimit) || 100,
        dailyOtpLimit: Number(clientForm.dailyOtpLimit) || 500,
      },
      {
        onSuccess: () => {
          setClientDialogOpen(false);
          setClientForm({ name: '', slug: '', hourlyOtpLimit: '100', dailyOtpLimit: '500' });
        },
      }
    );
  };

  const submitApiKey = (): void => {
    if (!apiKeyForm.clientId || !apiKeyForm.name.trim()) {
      toast.error(t('otpAdmin.apiKeys.invalid'));
      return;
    }

    createApiKeyMutation.mutate(
      {
        clientId: apiKeyForm.clientId,
        name: apiKeyForm.name.trim(),
        expiresAt: apiKeyForm.expiresAt ? new Date(apiKeyForm.expiresAt).toISOString() : null,
      },
      {
        onSuccess: (created) => {
          setApiKeyDialogOpen(false);
          setCreatedSecret(created);
          setApiKeyForm({ clientId: '', name: '', expiresAt: '' });
        },
      }
    );
  };

  const copySecret = (): void => {
    if (!createdSecret?.apiKey) return;
    void navigator.clipboard.writeText(createdSecret.apiKey);
    toast.success(t('otpAdmin.apiKeys.copied'));
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey="otpAdmin.title"
        descriptionKey="otpAdmin.description"
        actions={
          <Button variant="outline" onClick={refreshAll} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t('otpAdmin.refresh')}
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={t('otpAdmin.metrics.whatsapp')}
          value={summary?.whatsapp ? t(`otpAdmin.sessionStatus.${summary.whatsapp}`) : '-'}
          icon={<MessageCircleMore className="h-5 w-5" />}
        />
        <MetricCard
          title={t('otpAdmin.metrics.worker')}
          value={summary?.worker ? t(`otpAdmin.health.${summary.worker}`) : '-'}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title={t('otpAdmin.metrics.socket')}
          value={summary?.whatsappSocket ? t(`otpAdmin.health.${summary.whatsappSocket}`) : '-'}
          icon={<Smartphone className="h-5 w-5" />}
        />
        <MetricCard
          title={t('otpAdmin.metrics.sent')}
          value={summary?.today.sent ?? '-'}
          icon={<MessageCircleMore className="h-5 w-5" />}
        />
        <MetricCard
          title={t('otpAdmin.metrics.verified')}
          value={summary?.today.verified ?? '-'}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
        <MetricCard
          title={t('otpAdmin.metrics.failed')}
          value={summary?.today.failedOrUnknown ?? '-'}
          icon={<XCircle className="h-5 w-5" />}
        />
        <MetricCard
          title={t('otpAdmin.metrics.clients')}
          value={summary?.activeClients ?? '-'}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title={t('otpAdmin.metrics.apiKeys')}
          value={summary?.activeApiKeys ?? '-'}
          icon={<KeyRound className="h-5 w-5" />}
        />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="gap-4 border-b bg-muted/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{t('otpAdmin.session.title')}</CardTitle>
              <CardDescription>{t('otpAdmin.session.description')}</CardDescription>
            </div>
            {session ? (
              <Badge variant={sessionVariant[session.status]} className="w-fit">
                {t(`otpAdmin.sessionStatus.${session.status}`)}
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {sessionQuery.isError ? (
            <p className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              {t('otpAdmin.session.loadError')}
            </p>
          ) : null}

          {session ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-muted/15 p-4">
                  <p className="text-xs text-muted-foreground">{t('otpAdmin.session.account')}</p>
                  <p className="mt-1 font-semibold">{session.displayName || '-'}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{session.phoneNumber || '-'}</p>
                </div>
                <div className="rounded-xl border bg-muted/15 p-4">
                  <p className="text-xs text-muted-foreground">{t('otpAdmin.session.lastConnected')}</p>
                  <p className="mt-1 text-sm font-medium">{formatDateTime(session.lastConnectedAt)}</p>
                </div>
                <div className="rounded-xl border bg-muted/15 p-4">
                  <p className="text-xs text-muted-foreground">{t('otpAdmin.metrics.worker')}</p>
                  <Badge className="mt-2" variant={session.worker === 'up' ? 'success' : 'danger'}>
                    {t(`otpAdmin.health.${session.worker}`)}
                  </Badge>
                </div>
                <div className="rounded-xl border bg-muted/15 p-4">
                  <p className="text-xs text-muted-foreground">{t('otpAdmin.metrics.socket')}</p>
                  <Badge className="mt-2" variant={session.whatsappSocket === 'up' ? 'success' : 'danger'}>
                    {t(`otpAdmin.health.${session.whatsappSocket}`)}
                  </Badge>
                </div>
              </div>

              {session.status === 'QR_READY' && session.qrDataUrl ? (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
                  <div>
                    <p className="font-semibold">{t('otpAdmin.session.scanQr')}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{t('otpAdmin.session.qrHint')}</p>
                  </div>
                  <img
                    src={session.qrDataUrl}
                    alt={t('otpAdmin.session.qrAlt')}
                    className="h-64 w-64 rounded-2xl bg-white p-3 shadow-sm"
                  />
                </div>
              ) : null}

              {session.lastError || session.disconnectReason ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
                  {session.lastError ? <p>{session.lastError}</p> : null}
                  {session.disconnectReason ? (
                    <p className="mt-1 text-muted-foreground">{session.disconnectReason}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {['DISCONNECTED', 'LOGGED_OUT', 'ERROR'].includes(session.status) ? (
                  <Button
                    onClick={() => runSessionAction('start')}
                    disabled={sessionActionMutation.isPending}
                    className="gap-2"
                  >
                    <Power className="h-4 w-4" />
                    {t('otpAdmin.session.start')}
                  </Button>
                ) : null}

                {['READY', 'ERROR'].includes(session.status) ? (
                  <Button
                    variant="outline"
                    onClick={() => runSessionAction('reconnect')}
                    disabled={sessionActionMutation.isPending}
                    className="gap-2"
                  >
                    <RotateCw className="h-4 w-4" />
                    {t('otpAdmin.session.reconnect')}
                  </Button>
                ) : null}

                {!['DISCONNECTED', 'LOGGED_OUT'].includes(session.status) ? (
                  <Button
                    variant="outline"
                    onClick={() => runSessionAction('stop')}
                    disabled={sessionActionMutation.isPending}
                    className="gap-2"
                  >
                    <StopCircle className="h-4 w-4" />
                    {t('otpAdmin.session.stop')}
                  </Button>
                ) : null}

                {['READY', 'RECONNECTING', 'ERROR'].includes(session.status) ? (
                  <Button
                    variant="destructive"
                    onClick={() => setLogoutConfirmOpen(true)}
                    disabled={sessionActionMutation.isPending}
                    className="gap-2"
                  >
                    <Ban className="h-4 w-4" />
                    {t('otpAdmin.session.logout')}
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('otpAdmin.otp.title')}</CardTitle>
          <CardDescription>{t('otpAdmin.otp.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={otpRequestsQuery.data?.items ?? []}
            columns={otpColumns}
            getRowKey={(item) => item.requestId}
            isLoading={otpRequestsQuery.isLoading}
            pagination={
              otpRequestsQuery.data
                ? {
                    page: otpRequestsQuery.data.page,
                    pageSize: otpRequestsQuery.data.pageSize,
                    totalCount: otpRequestsQuery.data.totalCount,
                    totalPages: totalPages(otpRequestsQuery.data.totalCount, otpRequestsQuery.data.pageSize),
                  }
                : undefined
            }
            onPageChange={setOtpPage}
            onPageSizeChange={(pageSize) => {
              setOtpPage(1);
              setOtpPageSize(pageSize);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('otpAdmin.audit.title')}</CardTitle>
          <CardDescription>{t('otpAdmin.audit.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={auditLogsQuery.data?.items ?? []}
            columns={auditColumns}
            getRowKey={(item) => item.id}
            isLoading={auditLogsQuery.isLoading}
            pagination={
              auditLogsQuery.data
                ? {
                    page: auditLogsQuery.data.page,
                    pageSize: auditLogsQuery.data.pageSize,
                    totalCount: auditLogsQuery.data.totalCount,
                    totalPages: totalPages(auditLogsQuery.data.totalCount, auditLogsQuery.data.pageSize),
                  }
                : undefined
            }
            onPageChange={setAuditPage}
            onPageSizeChange={(pageSize) => {
              setAuditPage(1);
              setAuditPageSize(pageSize);
            }}
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{t('otpAdmin.clients.title')}</CardTitle>
              <CardDescription>{t('otpAdmin.clients.description')}</CardDescription>
            </div>
            <Button size="sm" className="gap-2" onClick={() => setClientDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('otpAdmin.clients.create')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(clientsQuery.data ?? []).map((client: OtpClient) => (
              <div key={client.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.slug} · {client.hourlyOtpLimit}/{t('otpAdmin.clients.hourShort')} · {client.dailyOtpLimit}/{t('otpAdmin.clients.dayShort')}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={client.isActive ? 'outline' : 'default'}
                  disabled={updateClientMutation.isPending}
                  onClick={() => updateClientMutation.mutate({ id: client.id, isActive: !client.isActive })}
                >
                  {client.isActive ? t('otpAdmin.clients.disable') : t('otpAdmin.clients.enable')}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{t('otpAdmin.apiKeys.title')}</CardTitle>
              <CardDescription>{t('otpAdmin.apiKeys.description')}</CardDescription>
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                const firstClient = clientsQuery.data?.[0];
                setApiKeyForm((current) => ({
                  ...current,
                  clientId: current.clientId || firstClient?.id || '',
                }));
                setApiKeyDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {t('otpAdmin.apiKeys.create')}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(apiKeysQuery.data ?? []).map((apiKey: OtpApiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{apiKey.name}</p>
                    <Badge variant={apiKey.status === 'ACTIVE' ? 'success' : 'danger'}>{apiKey.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground" dir="ltr">{apiKey.prefix}</p>
                </div>
                {apiKey.status === 'ACTIVE' ? (
                  <Button size="sm" variant="destructive" onClick={() => setRevokeKey(apiKey)}>
                    {t('otpAdmin.apiKeys.revoke')}
                  </Button>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        onConfirm={() => runSessionAction('logout')}
        titleKey="otpAdmin.session.logoutConfirmTitle"
        descriptionKey="otpAdmin.session.logoutConfirmDescription"
        confirmLabelKey="otpAdmin.session.logout"
        isLoading={sessionActionMutation.isPending}
      />

      <ConfirmDialog
        open={Boolean(revokeKey)}
        onOpenChange={(open) => {
          if (!open) setRevokeKey(null);
        }}
        onConfirm={() => {
          if (!revokeKey) return;
          revokeApiKeyMutation.mutate(revokeKey.id, {
            onSuccess: () => setRevokeKey(null),
          });
        }}
        titleKey="otpAdmin.apiKeys.revokeConfirmTitle"
        descriptionKey="otpAdmin.apiKeys.revokeConfirmDescription"
        confirmLabelKey="otpAdmin.apiKeys.revoke"
        isLoading={revokeApiKeyMutation.isPending}
      />

      <Dialog open={Boolean(selectedRequestId)} onOpenChange={(open) => !open && setSelectedRequestId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('otpAdmin.otp.detailsTitle')}</DialogTitle>
            <DialogDescription>{selectedRequestId}</DialogDescription>
          </DialogHeader>
          {otpRequestQuery.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [t('otpAdmin.otp.phone'), otpRequestQuery.data.phoneNumber],
                [t('otpAdmin.otp.purpose'), otpRequestQuery.data.purpose],
                [t('common.status'), otpRequestQuery.data.status],
                [t('otpAdmin.otp.attempts'), `${otpRequestQuery.data.attempts}/${otpRequestQuery.data.maxAttempts}`],
                [t('otpAdmin.otp.providerId'), otpRequestQuery.data.providerMessageId || '-'],
                [t('otpAdmin.otp.ipAddress'), otpRequestQuery.data.ipAddress || '-'],
                [t('otpAdmin.otp.expiresAt'), formatDateTime(otpRequestQuery.data.expiresAt)],
                [t('otpAdmin.otp.verifiedAt'), formatDateTime(otpRequestQuery.data.verifiedAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-muted/15 p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 break-all text-sm font-medium">{value}</p>
                </div>
              ))}
              {otpRequestQuery.data.failureReason ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 sm:col-span-2">
                  <p className="text-xs text-muted-foreground">{t('otpAdmin.otp.failureReason')}</p>
                  <p className="mt-1 text-sm text-destructive">{otpRequestQuery.data.failureReason}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {otpRequestQuery.isLoading ? t('common.loading') : t('otpAdmin.otp.notFound')}
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('otpAdmin.clients.createTitle')}</DialogTitle>
            <DialogDescription>{t('otpAdmin.clients.createDescription')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder={t('otpAdmin.clients.name')}
              value={clientForm.name}
              onChange={(event) => setClientForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              placeholder={t('otpAdmin.clients.slug')}
              dir="ltr"
              value={clientForm.slug}
              onChange={(event) =>
                setClientForm((current) => ({
                  ...current,
                  slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                }))
              }
            />
            <Input
              type="number"
              min={1}
              max={100000}
              placeholder={t('otpAdmin.clients.hourlyLimit')}
              value={clientForm.hourlyOtpLimit}
              onChange={(event) => setClientForm((current) => ({ ...current, hourlyOtpLimit: event.target.value }))}
            />
            <Input
              type="number"
              min={1}
              max={1000000}
              placeholder={t('otpAdmin.clients.dailyLimit')}
              value={clientForm.dailyOtpLimit}
              onChange={(event) => setClientForm((current) => ({ ...current, dailyOtpLimit: event.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClientDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submitClient} disabled={createClientMutation.isPending}>
              {t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('otpAdmin.apiKeys.createTitle')}</DialogTitle>
            <DialogDescription>{t('otpAdmin.apiKeys.createDescription')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select
              value={apiKeyForm.clientId}
              onValueChange={(value) => setApiKeyForm((current) => ({ ...current, clientId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('otpAdmin.apiKeys.client')} />
              </SelectTrigger>
              <SelectContent>
                {(clientsQuery.data ?? []).map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder={t('otpAdmin.apiKeys.name')}
              value={apiKeyForm.name}
              onChange={(event) => setApiKeyForm((current) => ({ ...current, name: event.target.value }))}
            />
            <Input
              type="datetime-local"
              value={apiKeyForm.expiresAt}
              onChange={(event) => setApiKeyForm((current) => ({ ...current, expiresAt: event.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submitApiKey} disabled={createApiKeyMutation.isPending}>
              {t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(createdSecret)} onOpenChange={(open) => !open && setCreatedSecret(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('otpAdmin.apiKeys.secretTitle')}</DialogTitle>
            <DialogDescription>{t('otpAdmin.apiKeys.secretDescription')}</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="break-all font-mono text-sm" dir="ltr">{createdSecret?.apiKey}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatedSecret(null)}>
              {t('common.close')}
            </Button>
            <Button onClick={copySecret} className="gap-2">
              <Copy className="h-4 w-4" />
              {t('otpAdmin.apiKeys.copy')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
