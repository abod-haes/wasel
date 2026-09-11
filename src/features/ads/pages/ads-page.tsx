import { Plus } from 'lucide-react';
import { useState } from 'react';

import { ConfirmDialog, ErrorState, PageContainer, SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui';
import { AdFormDialog } from '@/features/ads/components/ad-form-dialog';
import { AdsTable } from '@/features/ads/components/ads-table';
import {
  useAdsQuery,
  useCreateAdMutation,
  useDeleteAdMutation,
  useUpdateAdMutation,
} from '@/features/ads/hooks/use-ads-query';
import type { Ad, AdFormPayload } from '@/features/ads/types/ad-types';
import { useProductsBriefQuery } from '@/features/products/hooks/use-products-query';

export default function AdsPage(): React.JSX.Element {
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | undefined>();
  const [deleteAd, setDeleteAd] = useState<Ad | null>(null);

  const adsQuery = useAdsQuery();
  const productsQuery = useProductsBriefQuery();
  const createMutation = useCreateAdMutation();
  const updateMutation = useUpdateAdMutation();
  const deleteMutation = useDeleteAdMutation();

  if (adsQuery.isError) return <ErrorState onRetry={() => void adsQuery.refetch()} />;

  const openCreate = (): void => {
    setDialogMode('create');
    setSelectedAd(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (ad: Ad): void => {
    setDialogMode('edit');
    setSelectedAd(ad);
    setIsFormOpen(true);
  };

  const submitAd = (payload: AdFormPayload): void => {
    if (dialogMode === 'create') {
      if (!payload.media) return;
      createMutation.mutate(
        { ...payload, media: payload.media },
        { onSuccess: () => setIsFormOpen(false) }
      );
      return;
    }

    if (!selectedAd) return;
    updateMutation.mutate(
      { id: selectedAd.id, ...payload },
      { onSuccess: () => setIsFormOpen(false) }
    );
  };

  const confirmDelete = (): void => {
    if (!deleteAd) return;
    deleteMutation.mutate(deleteAd.id, { onSuccess: () => setDeleteAd(null) });
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isMutating = isSubmitting || deleteMutation.isPending;

  return (
    <PageContainer>
      <SectionHeader
        titleKey="nav.ads"
        descriptionKey="إدارة بانرات وإعلانات التطبيق وترتيب ظهورها"
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            إضافة إعلان
          </Button>
        }
      />

      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        يدعم الإعلان صورة أو GIF أو فيديو حتى 100 MB، ويتم عرضه حسب قيمة الترتيب تصاعديًا. ربط المنتج اختياري.
      </div>

      <AdsTable
        ads={adsQuery.data ?? []}
        isLoading={adsQuery.isLoading || adsQuery.isFetching}
        isMutating={isMutating}
        onEdit={openEdit}
        onDelete={setDeleteAd}
      />

      <AdFormDialog
        open={isFormOpen}
        mode={dialogMode}
        defaultAd={selectedAd}
        products={productsQuery.data ?? []}
        isSubmitting={isSubmitting || productsQuery.isLoading}
        onOpenChange={setIsFormOpen}
        onSubmit={submitAd}
      />

      <ConfirmDialog
        open={Boolean(deleteAd)}
        onOpenChange={(open) => { if (!open) setDeleteAd(null); }}
        onConfirm={confirmDelete}
        titleKey="تأكيد حذف الإعلان؟"
        descriptionKey="سيتم حذف الإعلان نهائيًا."
        confirmLabelKey="حذف الإعلان"
        isLoading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
