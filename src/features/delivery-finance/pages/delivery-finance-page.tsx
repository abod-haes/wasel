import {
  Banknote,
  Eye,
  HandCoins,
  ReceiptText,
  RefreshCw,
  WalletCards,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/components/ui';
import {
  useDeliveryFinanceListQuery,
  useDeliveryFinanceOrderQuery,
  useDeliveryFinanceOrdersQuery,
  useDeliveryFinanceSummaryQuery,
  useDeliveryFinanceTransactionsQuery,
  useSettleDeliveryCashMutation,
} from '@/features/delivery-finance/hooks/use-delivery-finance-query';
import type {
  DeliveryCashTransaction,
  DeliveryFinanceOrder,
  DeliveryFinanceSummary,
} from '@/features/delivery-finance/types/delivery-finance-types';
import type { PaginationParams } from '@/types/api';

const money = (value: number): string =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);

const dateTime = (value?: string | null): string =>
  value ? new Date(value).toLocaleString() : '-';

function paymentWayLabel(value: 0 | 1, t: (key: string) => string): string {
  return value === 0 ? t('deliveryFinance.direct') : t('deliveryFinance.shamCash');
}

function pricingModeLabel(value: 0 | 1, t: (key: string) => string): string {
  return value === 0 ? t('deliveryFinance.distanceBased') : t('deliveryFinance.fixed');
}

function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-2 border-t pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {t('common.pagination.previous')}
      </Button>
      <span className="text-sm text-muted-foreground">
        {t('common.pagination.page', { current: page, total: Math.max(1, totalPages) })}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        {t('common.pagination.next')}
      </Button>
    </div>
  );
}

function LimitBadge({ delivery }: { delivery: DeliveryFinanceSummary }): React.JSX.Element {
  const { t } = useTranslation();

  if (!delivery.cashLimitEnabled) {
    return <Badge variant="outline">{t('deliveryFinance.limitDisabled')}</Badge>;
  }

  return delivery.isCashLimitReached ? (
    <Badge variant="danger">{t('deliveryFinance.limitReached')}</Badge>
  ) : (
    <Badge variant="success">{t('deliveryFinance.limitNormal')}</Badge>
  );
}

export default function DeliveryFinancePage(): React.JSX.Element {
  const { t } = useTranslation();
  const [listPagination, setListPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 20,
  });
  const [detailPagination, setDetailPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  });
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>();
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions'>('orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string>();
  const [settleOpen, setSettleOpen] = useState(false);
  const [settleNote, setSettleNote] = useState('');

  const listQuery = useDeliveryFinanceListQuery(listPagination);
  const summaryQuery = useDeliveryFinanceSummaryQuery(selectedDeliveryId);
  const ordersQuery = useDeliveryFinanceOrdersQuery(
    selectedDeliveryId,
    detailPagination,
  );
  const transactionsQuery = useDeliveryFinanceTransactionsQuery(
    selectedDeliveryId,
    detailPagination,
  );
  const orderQuery = useDeliveryFinanceOrderQuery(selectedOrderId);
  const settleMutation = useSettleDeliveryCashMutation();

  if (listQuery.isError) {
    return <ErrorState onRetry={() => void listQuery.refetch()} />;
  }

  const selectedSummary = summaryQuery.data;
  const list = listQuery.data;

  const selectDelivery = (id: string): void => {
    setSelectedDeliveryId(id);
    setActiveTab('orders');
    setDetailPagination({ page: 1, pageSize: 10 });
    setSelectedOrderId(undefined);
  };

  const settle = (): void => {
    if (!selectedDeliveryId) return;

    settleMutation.mutate(
      { deliveryPersonId: selectedDeliveryId, note: settleNote },
      {
        onSuccess: () => {
          setSettleOpen(false);
          setSettleNote('');
          void listQuery.refetch();
          void summaryQuery.refetch();
          void transactionsQuery.refetch();
        },
      },
    );
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey="deliveryFinance.title"
        descriptionKey="deliveryFinance.description"
        actions={
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void listQuery.refetch()}
            disabled={listQuery.isFetching}
          >
            <RefreshCw className="h-4 w-4" />
            {t('deliveryFinance.refresh')}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('deliveryFinance.deliveryList')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('deliveryFinance.delivery')}</TableHead>
                <TableHead>{t('deliveryFinance.phone')}</TableHead>
                <TableHead>{t('deliveryFinance.deliveredOrders')}</TableHead>
                <TableHead>{t('deliveryFinance.cashHeld')}</TableHead>
                <TableHead>{t('deliveryFinance.limit')}</TableHead>
                <TableHead>{t('deliveryFinance.limitState')}</TableHead>
                <TableHead>{t('deliveryFinance.lastSettlement')}</TableHead>
                <TableHead className="text-end">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {t('common.loading')}
                  </TableCell>
                </TableRow>
              ) : (list?.items.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    {t('deliveryFinance.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                list?.items.map((delivery) => (
                  <TableRow
                    key={delivery.deliveryPersonId}
                    className={
                      delivery.isCashLimitReached
                        ? 'bg-red-500/[0.04] hover:bg-red-500/[0.07]'
                        : undefined
                    }
                  >
                    <TableCell className="font-medium">{delivery.deliveryPersonName}</TableCell>
                    <TableCell dir="ltr">{delivery.phoneNumber}</TableCell>
                    <TableCell>{delivery.deliveredOrdersCount}</TableCell>
                    <TableCell className="font-semibold">
                      {money(delivery.currentCashHeld)} {t('deliveryFinance.currency')}
                    </TableCell>
                    <TableCell>
                      {delivery.cashLimitEnabled
                        ? `${money(delivery.cashLimitAmount)} ${t('deliveryFinance.currency')}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <LimitBadge delivery={delivery} />
                    </TableCell>
                    <TableCell>{dateTime(delivery.lastSettlementAt)}</TableCell>
                    <TableCell className="text-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => selectDelivery(delivery.deliveryPersonId)}
                      >
                        <Eye className="h-4 w-4" />
                        {t('deliveryFinance.details')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {list ? (
            <Pager
              page={list.page}
              totalPages={list.totalPages}
              onChange={(page) => setListPagination((current) => ({ ...current, page }))}
            />
          ) : null}
        </CardContent>
      </Card>

      {selectedDeliveryId ? (
        <Card className="border-primary/15">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>
                  {summaryQuery.isLoading
                    ? t('common.loading')
                    : selectedSummary?.deliveryPersonName ?? t('deliveryFinance.details')}
                </CardTitle>
                {selectedSummary ? (
                  <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                    {selectedSummary.phoneNumber}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedSummary ? <LimitBadge delivery={selectedSummary} /> : null}
                <Button
                  className="gap-2"
                  disabled={
                    !selectedSummary ||
                    selectedSummary.currentCashHeld <= 0 ||
                    settleMutation.isPending
                  }
                  onClick={() => setSettleOpen(true)}
                >
                  <HandCoins className="h-4 w-4" />
                  {t('deliveryFinance.settle')}
                </Button>
              </div>
            </div>

            {selectedSummary ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                  icon={<WalletCards className="h-5 w-5" />}
                  label={t('deliveryFinance.cashHeld')}
                  value={`${money(selectedSummary.currentCashHeld)} ${t('deliveryFinance.currency')}`}
                />
                <SummaryCard
                  icon={<ReceiptText className="h-5 w-5" />}
                  label={t('deliveryFinance.deliveredOrders')}
                  value={String(selectedSummary.deliveredOrdersCount)}
                />
                <SummaryCard
                  icon={<Banknote className="h-5 w-5" />}
                  label={t('deliveryFinance.limit')}
                  value={
                    selectedSummary.cashLimitEnabled
                      ? `${money(selectedSummary.cashLimitAmount)} ${t('deliveryFinance.currency')}`
                      : t('deliveryFinance.limitDisabled')
                  }
                />
                <SummaryCard
                  icon={<HandCoins className="h-5 w-5" />}
                  label={t('deliveryFinance.remaining')}
                  value={
                    selectedSummary.cashLimitRemaining == null
                      ? '-'
                      : `${money(selectedSummary.cashLimitRemaining)} ${t('deliveryFinance.currency')}`
                  }
                />
              </div>
            ) : null}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex w-fit rounded-xl border bg-muted/30 p-1">
              <Button
                size="sm"
                variant={activeTab === 'orders' ? 'default' : 'ghost'}
                onClick={() => {
                  setActiveTab('orders');
                  setDetailPagination({ page: 1, pageSize: 10 });
                }}
              >
                {t('deliveryFinance.ordersTab')}
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'transactions' ? 'default' : 'ghost'}
                onClick={() => {
                  setActiveTab('transactions');
                  setDetailPagination({ page: 1, pageSize: 10 });
                }}
              >
                {t('deliveryFinance.transactionsTab')}
              </Button>
            </div>

            {activeTab === 'orders' ? (
              <FinanceOrdersTable
                orders={ordersQuery.data?.items ?? []}
                loading={ordersQuery.isLoading || ordersQuery.isFetching}
                onOpen={(orderId) => setSelectedOrderId(orderId)}
              />
            ) : (
              <TransactionsTable
                transactions={transactionsQuery.data?.items ?? []}
                loading={transactionsQuery.isLoading || transactionsQuery.isFetching}
              />
            )}

            {activeTab === 'orders' && ordersQuery.data ? (
              <Pager
                page={ordersQuery.data.page}
                totalPages={ordersQuery.data.totalPages}
                onChange={(page) =>
                  setDetailPagination((current) => ({ ...current, page }))
                }
              />
            ) : null}

            {activeTab === 'transactions' && transactionsQuery.data ? (
              <Pager
                page={transactionsQuery.data.page}
                totalPages={transactionsQuery.data.totalPages}
                onChange={(page) =>
                  setDetailPagination((current) => ({ ...current, page }))
                }
              />
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deliveryFinance.settleTitle')}</DialogTitle>
            <DialogDescription>
              {t('deliveryFinance.settleDescription')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={settleNote}
            onChange={(event) => setSettleNote(event.target.value)}
            placeholder={t('deliveryFinance.settleNotePlaceholder')}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={settle}
              disabled={settleMutation.isPending || !selectedSummary}
            >
              {settleMutation.isPending
                ? t('common.loading')
                : t('deliveryFinance.confirmSettlement')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(selectedOrderId)}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(undefined);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('deliveryFinance.orderFinanceDetails')}</DialogTitle>
            <DialogDescription>
              {orderQuery.data?.deliveryPersonName ?? ''}
            </DialogDescription>
          </DialogHeader>

          {orderQuery.isLoading ? (
            <p className="py-10 text-center text-muted-foreground">{t('common.loading')}</p>
          ) : orderQuery.data ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MiniValue
                  label={t('deliveryFinance.paymentWay')}
                  value={paymentWayLabel(orderQuery.data.order.paymentWay, t)}
                />
                <MiniValue
                  label={t('deliveryFinance.deliveredAt')}
                  value={dateTime(orderQuery.data.order.deliveredAt)}
                />
                <MiniValue
                  label={t('deliveryFinance.appliedMode')}
                  value={pricingModeLabel(orderQuery.data.order.appliedDeliveryPricingMode, t)}
                />
                <MiniValue
                  label={t('deliveryFinance.chargedAmount')}
                  value={`${money(orderQuery.data.order.chargedAmount)} ${t('deliveryFinance.currency')}`}
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('deliveryFinance.product')}</TableHead>
                    <TableHead>{t('deliveryFinance.variant')}</TableHead>
                    <TableHead>{t('deliveryFinance.unitPrice')}</TableHead>
                    <TableHead>{t('deliveryFinance.quantity')}</TableHead>
                    <TableHead>{t('deliveryFinance.lineTotal')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderQuery.data.items.map((item) => (
                    <TableRow key={`${item.productId}-${item.variantId ?? 'default'}`}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.variantName ?? '-'}</TableCell>
                      <TableCell>{money(item.unitPrice)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{money(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <MiniValue
                  label={t('deliveryFinance.itemsTotal')}
                  value={`${money(orderQuery.data.order.itemsTotal)} ${t('deliveryFinance.currency')}`}
                />
                <MiniValue
                  label={t('deliveryFinance.distanceFee')}
                  value={`${money(orderQuery.data.order.distanceBasedDeliveryFee)} ${t('deliveryFinance.currency')}`}
                />
                <MiniValue
                  label={t('deliveryFinance.fixedFee')}
                  value={`${money(orderQuery.data.order.fixedDeliveryFee)} ${t('deliveryFinance.currency')}`}
                />
                <MiniValue
                  label={t('deliveryFinance.chargedDeliveryFee')}
                  value={`${money(orderQuery.data.order.chargedDeliveryFee)} ${t('deliveryFinance.currency')}`}
                />
                <MiniValue
                  label={t('deliveryFinance.chargedAmount')}
                  value={`${money(orderQuery.data.order.chargedAmount)} ${t('deliveryFinance.currency')}`}
                />
                <MiniValue
                  label={t('deliveryFinance.cashCollected')}
                  value={`${money(orderQuery.data.order.cashCollectedAmount)} ${t('deliveryFinance.currency')}`}
                />
              </div>
            </div>
          ) : (
            <p className="py-10 text-center text-destructive">
              {t('deliveryFinance.orderLoadError')}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function MiniValue({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function FinanceOrdersTable({
  orders,
  loading,
  onOpen,
}: {
  orders: DeliveryFinanceOrder[];
  loading: boolean;
  onOpen: (orderId: string) => void;
}): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('deliveryFinance.order')}</TableHead>
          <TableHead>{t('deliveryFinance.deliveredAt')}</TableHead>
          <TableHead>{t('deliveryFinance.paymentWay')}</TableHead>
          <TableHead>{t('deliveryFinance.appliedMode')}</TableHead>
          <TableHead>{t('deliveryFinance.chargedAmount')}</TableHead>
          <TableHead>{t('deliveryFinance.cashCollected')}</TableHead>
          <TableHead className="text-end">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
              {t('common.loading')}
            </TableCell>
          </TableRow>
        ) : orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
              {t('deliveryFinance.noOrders')}
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow key={order.orderId}>
              <TableCell className="font-mono text-xs">{order.orderId}</TableCell>
              <TableCell>{dateTime(order.deliveredAt)}</TableCell>
              <TableCell>{paymentWayLabel(order.paymentWay, t)}</TableCell>
              <TableCell>{pricingModeLabel(order.appliedDeliveryPricingMode, t)}</TableCell>
              <TableCell className="font-medium">{money(order.chargedAmount)}</TableCell>
              <TableCell>{money(order.cashCollectedAmount)}</TableCell>
              <TableCell className="text-end">
                <Button size="sm" variant="outline" onClick={() => onOpen(order.orderId)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function TransactionsTable({
  transactions,
  loading,
}: {
  transactions: DeliveryCashTransaction[];
  loading: boolean;
}): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('deliveryFinance.date')}</TableHead>
          <TableHead>{t('deliveryFinance.type')}</TableHead>
          <TableHead>{t('deliveryFinance.order')}</TableHead>
          <TableHead>{t('deliveryFinance.amount')}</TableHead>
          <TableHead>{t('deliveryFinance.note')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
              {t('common.loading')}
            </TableCell>
          </TableRow>
        ) : transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
              {t('deliveryFinance.noTransactions')}
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{dateTime(transaction.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={transaction.type === 0 ? 'success' : 'secondary'}>
                  {transaction.type === 0
                    ? t('deliveryFinance.collection')
                    : t('deliveryFinance.settlement')}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">
                {transaction.orderId ?? '-'}
              </TableCell>
              <TableCell className="font-medium">{money(transaction.amount)}</TableCell>
              <TableCell>{transaction.note ?? '-'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
