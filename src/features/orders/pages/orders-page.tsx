import axios from 'axios';
import { useState } from 'react';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Card, CardContent } from '@/components/ui';
import { OrderFilters } from '@/features/orders/components/order-filters';
import { OrdersTable } from '@/features/orders/components/orders-table';
import {
  useAcceptOrderMutation,
  useOrdersQuery,
  useRejectOrderMutation,
} from '@/features/orders/hooks/use-orders-query';
import { type Order, type OrdersFilter } from '@/features/orders/types/order-types';
import type { PaginationParams } from '@/types/api';
import { isAdminRole, isMarketRole } from '@/services/auth/auth-roles';
import { useAuthStore } from '@/store/use-auth-store';

const defaultFilters: OrdersFilter = {
  search: '',
  status: 'all',
};

export default function OrdersPage(): React.JSX.Element {
  const currentUser = useAuthStore((state) => state.user);
  const isMarket = isMarketRole(currentUser?.roles ?? []) && !isAdminRole(currentUser?.roles ?? []);
  const [filters, setFilters] = useState<OrdersFilter>(defaultFilters);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [acceptOrder, setAcceptOrder] = useState<Order | null>(null);
  const [rejectOrder, setRejectOrder] = useState<Order | null>(null);

  const ordersQuery = useOrdersQuery(filters, pagination);
  const acceptOrderMutation = useAcceptOrderMutation();
  const rejectOrderMutation = useRejectOrderMutation();

  if (ordersQuery.isError) {
    const isForbidden = axios.isAxiosError(ordersQuery.error) && ordersQuery.error.response?.status === 403;

    if (isMarket && isForbidden) {
      return (
        <PageContainer>
          <SectionHeader titleKey="orders.marketTitle" descriptionKey="orders.marketDescription" />
          <Card className="border-amber-500/25 bg-amber-500/5">
            <CardContent className="space-y-2 p-5">
              <p className="font-semibold">واجهة طلبات المتجر جاهزة، لكن الباك الحالي يمنع دور Market من قراءة قائمة الطلبات.</p>
              <p className="text-sm text-muted-foreground">
                يلزم السماح لدور Market بقراءة الطلبات التابعة لـ marketUserId الحالي من السيرفر. لن نعرض طلبات متاجر أخرى كحل مؤقت.
              </p>
            </CardContent>
          </Card>
        </PageContainer>
      );
    }

    return <ErrorState onRetry={() => void ordersQuery.refetch()} />;
  }

  const confirmAccept = (): void => {
    if (!acceptOrder) {
      return;
    }

    acceptOrderMutation.mutate(acceptOrder.id, {
      onSuccess: () => {
        setAcceptOrder(null);
      },
    });
  };

  const confirmReject = (): void => {
    if (!rejectOrder) {
      return;
    }

    rejectOrderMutation.mutate(rejectOrder.id, {
      onSuccess: () => {
        setRejectOrder(null);
      },
    });
  };

  return (
    <PageContainer>
      <SectionHeader
        titleKey={isMarket ? 'orders.marketTitle' : 'orders.title'}
        descriptionKey={isMarket ? 'orders.marketDescription' : 'orders.description'}
      />

      <OrderFilters
        filters={filters}
        onChange={(nextFilters) => {
          setFilters(nextFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
        onReset={() => {
          setFilters(defaultFilters);
          setPagination((current) => ({ ...current, page: 1 }));
        }}
      />

      <OrdersTable
        orders={ordersQuery.data?.items ?? []}
        isLoading={ordersQuery.isLoading || ordersQuery.isFetching}
        onAccept={setAcceptOrder}
        onReject={setRejectOrder}
        isMutating={acceptOrderMutation.isPending || rejectOrderMutation.isPending}
        canManage={!isMarket}
        pagination={ordersQuery.data}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      {!isMarket ? (
        <ConfirmDialog
        open={Boolean(acceptOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setAcceptOrder(null);
          }
        }}
        onConfirm={confirmAccept}
        titleKey="orders.confirmAccept.title"
        descriptionKey="orders.confirmAccept.description"
        confirmLabelKey="orders.accept"
        isLoading={acceptOrderMutation.isPending}
      />
      ) : null}

      {!isMarket ? (
        <ConfirmDialog
        open={Boolean(rejectOrder)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectOrder(null);
          }
        }}
        onConfirm={confirmReject}
        titleKey="orders.confirmReject.title"
        descriptionKey="orders.confirmReject.description"
        confirmLabelKey="orders.reject"
        isLoading={rejectOrderMutation.isPending}
      />
      ) : null}
    </PageContainer>
  );
}
