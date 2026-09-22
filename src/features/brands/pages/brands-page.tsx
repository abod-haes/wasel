import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ConfirmDialog, DataTable, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui';
import {
  useBrandsQuery,
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useUpdateBrandMutation,
} from '@/features/brands/hooks/use-brands-query';
import type { Brand, BrandsFilter } from '@/features/brands/types/brand-types';
import type { PaginatedData, PaginationParams } from '@/types/api';

const defaultFilters: BrandsFilter = { search: '' };

function BrandDialog({
  open,
  brand,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  brand?: Brand;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
}): React.JSX.Element {
  const [name, setName] = useState(brand?.name ?? '');

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (value) setName(brand?.name ?? '');
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{brand ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية'}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) onSubmit(name.trim());
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="brand-name">الاسم</Label>
            <Input id="brand-name" value={name} maxLength={128} onChange={(event) => setName(event.target.value)} />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>حفظ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BrandsPage(): React.JSX.Element {
  const [filters, setFilters] = useState(defaultFilters);
  const [pagination, setPagination] = useState<PaginationParams>({ page: 1, pageSize: 10 });
  const [selectedBrand, setSelectedBrand] = useState<Brand | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [deleteBrand, setDeleteBrand] = useState<Brand | null>(null);

  const query = useBrandsQuery(filters, pagination);
  const createMutation = useCreateBrandMutation();
  const updateMutation = useUpdateBrandMutation();
  const deleteMutation = useDeleteBrandMutation();
  const isMutating = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const columns = useMemo(
    () => [
      { key: 'name', header: 'العلامة التجارية', renderCell: (brand: Brand) => <span className="font-medium">{brand.name}</span> },
      {
        key: 'actions',
        header: 'الإجراءات',
        className: 'text-end',
        headerClassName: 'text-end',
        renderCell: (brand: Brand) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => { setSelectedBrand(brand); setFormOpen(true); }}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteBrand(brand)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />;

  return (
    <PageContainer>
      <SectionHeader
        titleKey="العلامات التجارية"
        descriptionKey="إدارة البراندات الموحّدة المستخدمة في المنتجات."
        actions={<Button className="gap-2" onClick={() => { setSelectedBrand(undefined); setFormOpen(true); }}><Plus className="h-4 w-4" />إضافة علامة</Button>}
      />

      <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[1fr_auto]">
        <Input
          value={filters.search}
          placeholder="ابحث باسم العلامة التجارية"
          onChange={(event) => {
            setFilters({ search: event.target.value });
            setPagination((current) => ({ ...current, page: 1 }));
          }}
        />
        <Button variant="outline" onClick={() => setFilters(defaultFilters)}>إعادة ضبط</Button>
      </div>

      <DataTable
        data={query.data?.items ?? []}
        columns={columns}
        getRowKey={(brand) => brand.id}
        isLoading={query.isLoading || query.isFetching}
        pagination={query.data as PaginatedData<Brand> | undefined}
        onPageChange={(page) => setPagination((current) => ({ ...current, page }))}
        onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
      />

      <BrandDialog
        key={selectedBrand?.id ?? 'new'}
        open={formOpen}
        brand={selectedBrand}
        isSubmitting={isMutating}
        onOpenChange={setFormOpen}
        onSubmit={(name) => {
          if (selectedBrand) {
            updateMutation.mutate({ id: selectedBrand.id, input: { name } }, { onSuccess: () => setFormOpen(false) });
          } else {
            createMutation.mutate({ name }, { onSuccess: () => setFormOpen(false) });
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteBrand)}
        onOpenChange={(open) => { if (!open) setDeleteBrand(null); }}
        onConfirm={() => {
          if (!deleteBrand) return;
          deleteMutation.mutate(deleteBrand.id, { onSuccess: () => setDeleteBrand(null) });
        }}
        titleKey="حذف العلامة التجارية؟"
        descriptionKey="لن يسمح الباك بالحذف إذا كانت مستخدمة بمنتجات فعّالة."
        confirmLabelKey="حذف"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
