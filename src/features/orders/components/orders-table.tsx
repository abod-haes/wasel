import { Check, X } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/shared';
import { Badge, Button } from '@/components/ui';
import {
  ORDER_STATUS_VALUES,
  type Order,
  type OrderStatus,
} from '@/features/orders/types/order-types';

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  isMutating?: boolean;
}

const statusVariantMap: Record<OrderStatus, 'warning' | 'secondary' | 'success' | 'default' | 'outline' | 'danger'> = {
  0: 'warning',
  1: 'secondary',
  2: 'success',
  3: 'default',
  4: 'outline',
  5: 'danger',
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export function OrdersTable({
  orders,
  isLoading = false,
  onAccept,
  onReject,
  isMutating = false,
}: OrdersTableProps): React.JSX.Element {
  const { t } = useTranslation();

  const columns = useMemo(
    () => [
      {
        key: 'id',
        header: t('orders.table.order'),
        renderCell: (order: Order) => (
          <div>
            <p className="font-medium">{order.id}</p>
            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        ),
      },
      {
        key: 'customer',
        header: t('orders.table.customer'),
        renderCell: (order: Order) => {
          const customerName = `${order.userFirstName ?? ''} ${order.userLastName ?? ''}`.trim();

          return (
            <div>
              <p className="font-medium">{customerName || t('orders.unknownCustomer')}</p>
              <p className="text-xs text-muted-foreground">{order.userPhoneNumber || '-'}</p>
            </div>
          );
        },
      },
      {
        key: 'status',
        header: t('common.status'),
        renderCell: (order: Order) => (
          <Badge variant={statusVariantMap[order.status]}>{t(`orders.status.${order.status}`)}</Badge>
        ),
      },
      {
        key: 'payment',
        header: t('orders.table.paymentWay'),
        renderCell: (order: Order) => t(`orders.payment.${order.paymentWay}`),
      },
      {
        key: 'itemsCount',
        header: t('orders.table.itemsCount'),
        renderCell: (order: Order) => <span>{order.items.length}</span>,
      },
      {
        key: 'total',
        header: t('orders.table.totalAmount'),
        renderCell: (order: Order) => <span className="font-medium">{formatCurrency(order.totalAmount)}</span>,
      },
      {
        key: 'actions',
        header: t('common.actions'),
        className: 'text-end',
        headerClassName: 'text-end',
        renderCell: (order: Order) => {
          if (order.status !== ORDER_STATUS_VALUES.pending) {
            return <span className="text-xs text-muted-foreground">-</span>;
          }

          return (
            <div className="flex justify-end gap-2">
              <Button size="sm" className="gap-1" onClick={() => onAccept(order)} disabled={isMutating}>
                <Check className="h-4 w-4" />
                {t('orders.accept')}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1"
                onClick={() => onReject(order)}
                disabled={isMutating}
              >
                <X className="h-4 w-4" />
                {t('orders.reject')}
              </Button>
            </div>
          );
        },
      },
    ],
    [isMutating, onAccept, onReject, t]
  );

  return (
    <DataTable
      data={orders}
      columns={columns}
      getRowKey={(order) => order.id}
      isLoading={isLoading}
      emptyTitleKey="orders.empty.title"
      emptyDescriptionKey="orders.empty.description"
    />
  );
}
