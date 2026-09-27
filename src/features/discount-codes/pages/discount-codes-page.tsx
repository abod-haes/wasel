import { Pencil, Plus, TicketPercent, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ConfirmDialog, DataTable, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui';
import {
  useCreateDiscountCodeMutation,
  useDeleteDiscountCodeMutation,
  useDiscountCodesQuery,
  useUpdateDiscountCodeMutation,
} from '@/features/discount-codes/hooks/use-discount-codes-query';
import type {
  DiscountCode,
  DiscountCodeAdminStatus,
  DiscountCodeRequest,
  OrderDiscountScope,
  OrderDiscountType,
} from '@/features/discount-codes/types/discount-code-types';
import type { PaginatedData, PaginationParams } from '@/types/api';

interface DiscountCodeFormState {
  code: string;
  discountType: OrderDiscountType;
  scope: OrderDiscountScope;
  value: string;
  expiresAt: string;
  isEnabled: boolean;
}

const emptyForm = (): DiscountCodeFormState => ({
  code: '',
  discountType: 'Percentage',
  scope: 'EntireOrder',
  value: '',
  expiresAt: '',
  isEnabled: true,
});

const toLocalDateTimeValue = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

const statusLabel: Record<DiscountCodeAdminStatus, string> = {
  Active: 'نشط',
  Expired: 'منتهي',
  Disabled: 'معطل',
};

const statusVariant = (status: DiscountCodeAdminStatus) => {
  if (status === 'Active') return 'success' as const;
  if (status === 'Disabled') return 'danger' as const;
  return 'outline' as const;
};

const typeLabel: Record<OrderDiscountType, string> = {
  Percentage: 'نسبة مئوية',
  FixedAmount: 'مبلغ ثابت',
};

const scopeLabel: Record<OrderDiscountScope, string> = {
  ProductsOnly: 'المنتجات فقط',
  DeliveryOnly: 'التوصيل فقط',
  EntireOrder: 'الطلب كامل',
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const normalizeCode = (value: string): string => value.trim().toUpperCase();

function DiscountCodeDialog({
  open,
  discountCode,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  discountCode?: DiscountCode;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: DiscountCodeRequest) => void;
}): React.JSX.Element {
  const [form, setForm] = useState<DiscountCodeFormState>(() =>
    discountCode
      ? {
          code: discountCode.code,
          discountType: discountCode.discountType,
          scope: discountCode.scope,
          value: String(discountCode.value),
          expiresAt: toLocalDateTimeValue(discountCode.expiresAt),
          isEnabled: discountCode.isEnabled,
        }
      : emptyForm()
  );

  const submit = (): void => {
    const code = normalizeCode(form.code);
    const value = Number(form.value);
    const expiresAt = new Date(form.expiresAt);

    if (code.length < 3 || code.length > 64 || !/^[A-Z0-9_-]+$/.test(code)) {
      toast.error('الكود يجب أن يكون 3-64 محرفاً ويحتوي أحرفاً أو أرقاماً أو - أو _ فقط');
      return;
    }
    if (!Number.isFinite(value)) {
      toast.error('أدخل قيمة خصم صحيحة');
      return;
    }
    if (form.discountType === 'Percentage' && (value <= 0 || value > 100)) {
      toast.error('النسبة يجب أن تكون أكبر من 0 وحتى 100');
      return;
    }
    if (form.discountType === 'FixedAmount' && value <= 0) {
      toast.error('المبلغ الثابت يجب أن يكون أكبر من 0');
      return;
    }
    if (!form.expiresAt || Number.isNaN(expiresAt.getTime())) {
      toast.error('حدد تاريخ انتهاء صحيحاً');
      return;
    }

    onSubmit({
      code,
      discountType: form.discountType,
      scope: form.scope,
      value,
      expiresAt: expiresAt.toISOString(),
      isEnabled: form.isEnabled,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (value) {
          setForm(
            discountCode
              ? {
                  code: discountCode.code,
                  discountType: discountCode.discountType,
                  scope: discountCode.scope,
                  value: String(discountCode.value),
                  expiresAt: toLocalDateTimeValue(discountCode.expiresAt),
                  isEnabled: discountCode.isEnabled,
                }
              : emptyForm()
          );
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{discountCode ? 'تعديل كود الخصم' : 'إضافة كود خصم'}</DialogTitle>
          <DialogDescription>
            الحساب النهائي للخصم يتم في الباك إند، وليس في لوحة التحكم.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="discount-code">الكود</Label>
            <Input
              id="discount-code"
              value={form.code}
              maxLength={64}
              placeholder="WASEL10"
              onChange={(event) =>
                setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>نوع الخصم</Label>
            <Select
              value={form.discountType}
              onValueChange={(value: OrderDiscountType) =>
                setForm((current) => ({ ...current, discountType: value }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Percentage">نسبة مئوية</SelectItem>
                <SelectItem value="FixedAmount">مبلغ ثابت</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>نطاق الخصم</Label>
            <Select
              value={form.scope}
              onValueChange={(value: OrderDiscountScope) =>
                setForm((current) => ({ ...current, scope: value }))
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ProductsOnly">المنتجات فقط</SelectItem>
                <SelectItem value="DeliveryOnly">التوصيل فقط</SelectItem>
                <SelectItem value="EntireOrder">الطلب كامل</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{form.discountType === 'Percentage' ? 'النسبة' : 'المبلغ (USD)'}</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={(event) =>
                setForm((current) => ({ ...current, value: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>تاريخ الانتهاء</Label>
            <Input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) =>
                setForm((current) => ({ ...current, expiresAt: event.target.value }))
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/70 p-4 sm:col-span-2">
            <div>
              <p className="font-medium">مفعل</p>
              <p className="mt-1 text-xs text-muted-foreground">
                التعطيل يمنع حفظ الكود أو استخدامه في الطلبات.
              </p>
            </div>
            <Switch
              checked={form.isEnabled}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, isEnabled: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={submit}>
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DiscountCodesPage(): React.JSX.Element {
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 20 });
  const [selected, setSelected] = useState<DiscountCode | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiscountCode | null>(null);

  const query = useDiscountCodesQuery(pagination);
  const createMutation = useCreateDiscountCodeMutation();
  const updateMutation = useUpdateDiscountCodeMutation();
  const deleteMutation = useDeleteDiscountCodeMutation();
  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const toggleEnabled = (discountCode: DiscountCode, isEnabled: boolean): void => {
    updateMutation.mutate({
      id: discountCode.id,
      payload: {
        code: discountCode.code,
        discountType: discountCode.discountType,
        scope: discountCode.scope,
        value: discountCode.value,
        expiresAt: discountCode.expiresAt,
        isEnabled,
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        header: 'الكود',
        renderCell: (item: DiscountCode) => (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <TicketPercent className="h-4 w-4" />
            </div>
            <span className="font-mono font-semibold tracking-wide">{item.code}</span>
          </div>
        ),
      },
      { key: 'type', header: 'النوع', renderCell: (item: DiscountCode) => typeLabel[item.discountType] },
      { key: 'scope', header: 'النطاق', renderCell: (item: DiscountCode) => scopeLabel[item.scope] },
      {
        key: 'value',
        header: 'القيمة',
        renderCell: (item: DiscountCode) =>
          item.discountType === 'Percentage' ? `${item.value}%` : `${item.value} USD`,
      },
      { key: 'expiresAt', header: 'ينتهي في', renderCell: (item: DiscountCode) => <span className="whitespace-nowrap">{formatDate(item.expiresAt)}</span> },
      {
        key: 'status',
        header: 'الحالة',
        renderCell: (item: DiscountCode) => (
          <Badge variant={statusVariant(item.status)}>{statusLabel[item.status]}</Badge>
        ),
      },
      {
        key: 'enabled',
        header: 'مفعل',
        renderCell: (item: DiscountCode) => (
          <Switch
            checked={item.isEnabled}
            disabled={isMutating}
            onCheckedChange={(checked) => toggleEnabled(item, checked)}
            aria-label={item.isEnabled ? 'تعطيل كود الخصم' : 'تفعيل كود الخصم'}
          />
        ),
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        className: 'text-end',
        headerClassName: 'text-end',
        renderCell: (item: DiscountCode) => (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isMutating}
              onClick={() => {
                setSelected(item);
                setFormOpen(true);
              }}
              aria-label="تعديل كود الخصم"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isMutating}
              onClick={() => setDeleteTarget(item)}
              aria-label="حذف كود الخصم"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ),
      },
    ],
    [isMutating]
  );

  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <PageContainer>
      <SectionHeader
        titleKey="أكواد الخصم"
        descriptionKey="إدارة أكواد الخصم على مستوى الطلب. عروض المنتجات تُطبّق أولاً ثم يطبق الباك كود الخصم."
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              setSelected(undefined);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            إضافة كود
          </Button>
        }
      />

      <DataTable
        data={query.data?.items ?? []}
        columns={columns}
        getRowKey={(item) => item.id}
        isLoading={query.isLoading || query.isFetching}
        pagination={query.data as PaginatedData<DiscountCode> | undefined}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
        emptyTitleKey="لا توجد أكواد خصم"
        emptyDescriptionKey="أضف أول كود خصم ليظهر هنا."
      />

      <DiscountCodeDialog
        key={selected?.id ?? 'new'}
        open={formOpen}
        discountCode={selected}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setFormOpen}
        onSubmit={(payload) => {
          if (selected) {
            updateMutation.mutate(
              { id: selected.id, payload },
              { onSuccess: () => setFormOpen(false) }
            );
            return;
          }

          createMutation.mutate(payload, { onSuccess: () => setFormOpen(false) });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
        titleKey="حذف كود الخصم؟"
        descriptionKey="سيتم حذفه من الإدارة عبر soft delete ولن يعود قابلاً للاستخدام."
        confirmLabelKey="حذف"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
