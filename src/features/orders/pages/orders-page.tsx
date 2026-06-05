import { useState } from 'react';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { OrderFilters } from '@/features/orders/components/order-filters';
import { OrdersTable } from '@/features/orders/components/orders-table';
import {
  useAcceptOrderMutation,
  useOrdersQuery,
  useRejectOrderMutation,
} from '@/features/orders/hooks/use-orders-query';
import { type Order, type OrdersFilter } from '@/features/orders/types/order-types';
import type { PaginationParams } from '@/types/api';

const defaultFilters: OrdersFilter = {
  search: '',
  status: 'all',
};

export default function OrdersPage(): React.JSX.Element {
  const [filters, setFilters] = useState<OrdersFilter>(defaultFilters);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [acceptOrder, setAcceptOrder] = useState<Order | null>(null);
  const [rejectOrder, setRejectOrder] = useState<Order | null>(null);

  const ordersQuery = useOrdersQuery(filters, pagination);
  const acceptOrderMutation = useAcceptOrderMutation();
  const rejectOrderMutation = useRejectOrderMutation();

  if (ordersQuery.isError) {
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
      <SectionHeader titleKey="orders.title" descriptionKey="orders.description" />

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
        pagination={ordersQuery.data}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

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
    </PageContainer>
  );
}
