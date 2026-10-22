import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, Store, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '@/components/shared';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { generatePath, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { marketFinanceApi } from '@/features/market-finance/api/market-finance-api';
import type { MarketFinanceOrder, MarketPayableTransaction } from '@/features/market-finance/types/market-finance-types';
import { isAdminRole, isMarketRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Textarea } from '@/components/ui';

const currency = (amount: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount);
const date = (value?: string | null) => value ? new Date(value).toLocaleString() : '—';
const shortOrder = (id: string) => `#${id.slice(-3)}`;
const errorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return error instanceof Error ? error.message : fallback;
};
const pageParams = (page: number) => ({ page, pageSize: 20 });
const financeKey = ['market-finance'] as const;

function Pagination({ page, totalCount, onChange }: { page: number; totalCount: number; onChange: (page: number) => void }) {
  const { t } = useTranslation();
  const lastPage = Math.max(1, Math.ceil(totalCount / 20));
  return <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-card pt-3">
    <span className="text-sm text-muted-foreground">{t('marketFinance.pageOf', { page, total: lastPage })}</span>
    <div className="flex gap-2">
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t('marketFinance.previous')}</Button>
      <Button size="sm" variant="outline" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>{t('marketFinance.next')}</Button>
    </div>
  </div>;
}

export default function MarketFinancePage(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const admin = isAdminRole(user?.roles ?? []);
  const allowed = admin || isMarketRole(user?.roles ?? []);
  const navigate = useNavigate();
  const { marketUserId } = useParams<{ marketUserId?: string }>();
  const [searchParams] = useSearchParams();
  const previousMarketId = searchParams.get('marketUserId');
  const isMarketDetail = Boolean(marketUserId);
  const selectedId = admin ? (marketUserId ?? '') : '';
  const [marketPage, setMarketPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions'>('orders');
  const [orderId, setOrderId] = useState('');
  const [confirmSettlement, setConfirmSettlement] = useState(false);
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();

  // Old links selected a market via query string; redirect them to its own account page.
  useEffect(() => {
    if (admin && !marketUserId && previousMarketId) {
      navigate(generatePath(ROUTES.marketFinanceMarket, { marketUserId: previousMarketId }), { replace: true });
    }
  }, [admin, marketUserId, navigate, previousMarketId]);

  useEffect(() => {
    setOrderPage(1);
    setTransactionPage(1);
    setActiveTab('orders');
    setOrderId('');
    setConfirmSettlement(false);
    setNote('');
  }, [selectedId]);

  const markets = useQuery({
    queryKey: [...financeKey, 'markets', marketPage],
    queryFn: () => marketFinanceApi.listMarkets(pageParams(marketPage)),
    enabled: admin && !isMarketDetail,
  });
  const summary = useQuery({
    queryKey: [...financeKey, admin ? 'admin-summary' : 'own-summary', selectedId],
    queryFn: () => admin ? marketFinanceApi.getMarket(selectedId) : marketFinanceApi.getMine(),
    enabled: allowed && (!admin || Boolean(selectedId)),
  });
  const orders = useQuery({
    queryKey: [...financeKey, 'orders', admin ? selectedId : 'me', orderPage],
    queryFn: () => admin ? marketFinanceApi.getMarketOrders(selectedId, pageParams(orderPage)) : marketFinanceApi.getMyOrders(pageParams(orderPage)),
    enabled: allowed && (!admin || Boolean(selectedId)),
  });
  const transactions = useQuery({
    queryKey: [...financeKey, 'transactions', admin ? selectedId : 'me', transactionPage],
    queryFn: () => admin ? marketFinanceApi.getMarketTransactions(selectedId, pageParams(transactionPage)) : marketFinanceApi.getMyTransactions(pageParams(transactionPage)),
    enabled: allowed && (!admin || Boolean(selectedId)),
  });
  const detail = useQuery({
    queryKey: [...financeKey, 'order', admin ? selectedId : 'me', orderId],
    queryFn: () => admin ? marketFinanceApi.getMarketOrder(selectedId, orderId) : marketFinanceApi.getMyOrder(orderId),
    enabled: allowed && Boolean(orderId) && (!admin || Boolean(selectedId)),
  });
  const settlement = useMutation({
    mutationFn: () => marketFinanceApi.settleMarket(selectedId, note),
    onSuccess: async (receipt) => {
      setConfirmSettlement(false);
      setNote('');
      toast.success(t('marketFinance.settlementSuccess', { amount: currency(receipt.settledAmount), transactionId: receipt.transactionId }));
      await queryClient.invalidateQueries({ queryKey: financeKey });
    },
    onError: async (error) => {
      toast.error(errorMessage(error, t('marketFinance.loadError')));
      await queryClient.invalidateQueries({ queryKey: financeKey });
    },
  });
  const chooseMarket = (id: string): void => {
    navigate(generatePath(ROUTES.marketFinanceMarket, { marketUserId: id }));
  };
  const failed = (error: unknown, refetch: () => unknown) => <div className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">
    <p>{errorMessage(error, t('marketFinance.loadError'))}</p>
    <Button className="mt-3" size="sm" variant="outline" onClick={() => void refetch()}>{t('marketFinance.retry')}</Button>
  </div>;

  if (!allowed || (isMarketDetail && !admin)) return <div className="p-6">{t('marketFinance.noPermission')}</div>;

  return <PageContainer className={i18n.dir() === 'rtl' ? 'space-y-5 [direction:rtl]' : 'space-y-5 [direction:ltr]'}>
    {admin && isMarketDetail && <div>
      <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.marketFinance)}>
        {i18n.dir() === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        {t('marketFinance.backToMarkets')}
      </Button>
    </div>}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="space-y-1"><p className="text-xs font-semibold text-primary">RODO / FINANCE</p><h1 className="text-xl font-bold tracking-tight sm:text-2xl">{admin && isMarketDetail ? (summary.data?.marketName ?? t('marketFinance.title')) : t('marketFinance.title')}</h1><p className="text-sm text-muted-foreground">{admin ? t('marketFinance.adminDescription') : t('marketFinance.marketDescription')}</p></div>
      <Button size="sm" variant="outline" onClick={() => void queryClient.invalidateQueries({ queryKey: financeKey })}><RefreshCw className="h-4 w-4" /> {t('marketFinance.refresh')}</Button>
    </div>
    {admin && !isMarketDetail && <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Store className="h-4 w-4 text-primary" /> {t('marketFinance.selectMarket')}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {markets.isPending ? <p>{t('marketFinance.loadingMarkets')}</p> : markets.isError ? failed(markets.error, markets.refetch) : <>
          <div className="grid max-h-[min(55dvh,620px)] gap-2 overflow-y-auto overscroll-contain sm:grid-cols-2 xl:grid-cols-3" role="group" aria-label={t('marketFinance.selectMarket')}>
            {markets.data?.items.map((market) => <button type="button" key={market.marketUserId} aria-label={`${t('marketFinance.openAccount')}: ${market.marketName}`} onClick={() => chooseMarket(market.marketUserId)} className="rounded-lg border border-border/70 p-3 text-start transition-colors hover:border-primary/50 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              <p className="font-medium">{market.marketName}</p><p className="text-xs text-muted-foreground text-start"><span className="inline-block" dir="ltr">{market.phoneNumber ?? '—'}</span></p>
              <p className="mt-2 font-semibold tabular-nums">{currency(market.currentAmountDue)} <span className="text-xs font-normal">{t('marketFinance.dueShort')}</span></p>
            </button>)}
          </div>
          {!markets.data?.items.length && <p className="text-muted-foreground">{t('marketFinance.emptyMarkets')}</p>}
          <Pagination page={marketPage} totalCount={markets.data?.totalCount ?? 0} onChange={setMarketPage} />
        </>}
      </CardContent>
    </Card>}
    {(!admin || isMarketDetail) && <>
      {summary.isPending ? <p>{t('marketFinance.loadingSummary')}</p> : summary.isError ? failed(summary.error, summary.refetch) : summary.data && <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Card><CardContent className="space-y-2 p-4 sm:p-5"><Wallet className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">{t('marketFinance.amountDue')}</p><p className="mt-2 text-2xl font-bold tabular-nums">{currency(summary.data.currentAmountDue)}</p><p className="text-xs text-muted-foreground">{t('marketFinance.serverBalance')}</p></CardContent></Card>
          <Card><CardContent className="space-y-2 p-4 sm:p-5"><CheckCircle2 className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">{t('marketFinance.deliveredOrders')}</p><p className="mt-2 text-2xl font-bold tabular-nums">{summary.data.deliveredOrdersCount}</p></CardContent></Card>
          <Card><CardContent className="space-y-2 p-4 sm:p-5"><ArrowDownLeft className="h-5 w-5 text-primary" /><p className="text-sm text-muted-foreground">{t('marketFinance.lastSettlement')}</p><p className="mt-2 font-semibold">{date(summary.data.lastSettlementAt)}</p></CardContent></Card>
        </div>
        {admin && <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{t('marketFinance.market')}: {summary.data.marketName}</p>
          <Button disabled={summary.data.currentAmountDue <= 0 || settlement.isPending} onClick={() => setConfirmSettlement(true)}>{t('marketFinance.settleAll')}</Button>
        </div>}
      </>}
      <div role="tablist" aria-label={t('marketFinance.title')} className="flex flex-wrap gap-2 border-b border-border/70 pb-3">
        <Button role="tab" aria-selected={activeTab === 'orders'} size="sm" variant={activeTab === 'orders' ? 'default' : 'outline'} onClick={() => setActiveTab('orders')}>{t('marketFinance.deliveredOrders')}</Button>
        <Button role="tab" aria-selected={activeTab === 'transactions'} size="sm" variant={activeTab === 'transactions' ? 'default' : 'outline'} onClick={() => setActiveTab('transactions')}>{t('marketFinance.transactionsTab')}</Button>
      </div>
      {activeTab === 'orders' ? <Card><CardContent className="space-y-3 p-3 sm:p-4">
        {orders.isPending ? <p>{t('marketFinance.loadingOrders')}</p> : orders.isError ? failed(orders.error, orders.refetch) : <>
          <Table dir={i18n.dir()} stickyHeader containerClassName="max-h-[min(50dvh,560px)] overscroll-contain"><TableHeader><TableRow><TableHead>{t('marketFinance.order')}</TableHead><TableHead>{t('marketFinance.deliveredAt')}</TableHead><TableHead>{t('marketFinance.productsAmount')}</TableHead><TableHead>{t('marketFinance.orderDiscount')}</TableHead><TableHead>{t('marketFinance.details')}</TableHead></TableRow></TableHeader><TableBody>
            {(orders.data?.items ?? []).map((order: MarketFinanceOrder) => <TableRow key={order.orderId}>
              <TableCell className="text-start"><span dir="ltr" className="inline-block font-mono tabular-nums">{shortOrder(order.orderId)}</span></TableCell><TableCell>{date(order.deliveredAt)}</TableCell><TableCell>{currency(order.productsAmount)}</TableCell><TableCell>{currency(order.orderDiscountAmount)}</TableCell>
              <TableCell><Button size="sm" variant="outline" onClick={() => setOrderId(order.orderId)}>{t('marketFinance.details')}</Button></TableCell>
            </TableRow>)}
          </TableBody></Table>
          {!orders.data?.items.length && <p className="py-4 text-center text-muted-foreground">{t('marketFinance.emptyOrders')}</p>}
          <Pagination page={orderPage} totalCount={orders.data?.totalCount ?? 0} onChange={setOrderPage} />
        </>}
      </CardContent></Card> : <Card><CardContent className="space-y-3 p-4">
        {transactions.isPending ? <p>{t('marketFinance.loadingTransactions')}</p> : transactions.isError ? failed(transactions.error, transactions.refetch) : <>
          <Table dir={i18n.dir()} stickyHeader containerClassName="max-h-[min(50dvh,560px)] overscroll-contain"><TableHeader><TableRow><TableHead>{t('marketFinance.transactionDate')}</TableHead><TableHead>{t('marketFinance.transactionType')}</TableHead><TableHead>{t('marketFinance.amount')}</TableHead><TableHead>{t('marketFinance.order')}</TableHead><TableHead>{t('marketFinance.note')}</TableHead></TableRow></TableHeader><TableBody>
            {(transactions.data?.items ?? []).map((item: MarketPayableTransaction) => <TableRow key={item.id}>
              <TableCell>{date(item.createdAt)}</TableCell><TableCell>{item.type === 0 ? t('marketFinance.accrual') : t('marketFinance.settlement')}</TableCell><TableCell>{currency(item.amount)}</TableCell><TableCell className="text-start"><span dir="ltr" className="inline-block font-mono tabular-nums">{item.orderId ? shortOrder(item.orderId) : '—'}</span></TableCell><TableCell>{item.note ?? '—'}</TableCell>
            </TableRow>)}
          </TableBody></Table>
          {!transactions.data?.items.length && <p className="py-4 text-center text-muted-foreground">{t('marketFinance.emptyTransactions')}</p>}
          <Pagination page={transactionPage} totalCount={transactions.data?.totalCount ?? 0} onChange={setTransactionPage} />
        </>}
      </CardContent></Card>}
    </>}
    <Dialog open={Boolean(orderId)} onOpenChange={(open) => { if (!open) setOrderId(''); }}>
      <DialogContent dir={i18n.dir()} className="max-w-2xl"><DialogHeader><DialogTitle>{t('marketFinance.orderDetailsTitle', { order: shortOrder(orderId) })}</DialogTitle><DialogDescription>{t('marketFinance.scopedItems')}</DialogDescription></DialogHeader>
        {detail.isPending ? <p>{t('marketFinance.loading')}</p> : detail.isError ? failed(detail.error, detail.refetch) : detail.data && <>
          <p className="text-sm">{t('marketFinance.deliveredAt')}: {date(detail.data.order.deliveredAt)}</p>
          <Table dir={i18n.dir()} stickyHeader containerClassName="max-h-80 overscroll-contain"><TableHeader><TableRow><TableHead>{t('marketFinance.product')}</TableHead><TableHead>{t('marketFinance.variant')}</TableHead><TableHead>{t('marketFinance.quantity')}</TableHead><TableHead>{t('marketFinance.unitPrice')}</TableHead><TableHead>{t('marketFinance.total')}</TableHead></TableRow></TableHeader><TableBody>
            {detail.data.items.map((item, index) => <TableRow key={`${item.productId}-${item.variantId ?? ''}-${index}`}><TableCell>{item.productName}</TableCell><TableCell>{item.variantName ?? '—'}</TableCell><TableCell>{item.quantity}</TableCell><TableCell>{currency(item.unitPrice)}</TableCell><TableCell>{currency(item.lineTotal)}</TableCell></TableRow>)}
          </TableBody></Table>
          <p className="font-semibold">{t('marketFinance.currentPayable')}: {currency(detail.data.order.productsAmount)}</p>
          <p className="text-xs text-muted-foreground">{t('marketFinance.discountNote')}</p>
        </>}
      </DialogContent>
    </Dialog>
    {admin && <Dialog open={confirmSettlement} onOpenChange={(open) => { if (!settlement.isPending) setConfirmSettlement(open); }}>
      <DialogContent dir={i18n.dir()}><DialogHeader><DialogTitle>{t('marketFinance.settlementConfirmTitle')}</DialogTitle><DialogDescription>{t('marketFinance.settlementConfirmDescription')}</DialogDescription></DialogHeader>
        <p className="text-xl font-bold">{currency(summary.data?.currentAmountDue ?? 0)}</p>
        <Textarea placeholder={t('marketFinance.settlementNotePlaceholder')} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
        <DialogFooter className="gap-2"><Button variant="outline" disabled={settlement.isPending} onClick={() => setConfirmSettlement(false)}>{t('marketFinance.cancel')}</Button>
          <Button disabled={settlement.isPending || !summary.data || summary.data.currentAmountDue <= 0} onClick={() => settlement.mutate()}>{settlement.isPending ? t('marketFinance.processing') : t('marketFinance.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>}
  </PageContainer>;
}
