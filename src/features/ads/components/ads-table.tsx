import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import type { Ad } from '@/features/ads/types/ad-types';
import { resolveMediaPath } from '@/lib/utils';

interface AdsTableProps {
  ads: Ad[];
  isLoading?: boolean;
  isMutating?: boolean;
  onEdit: (ad: Ad) => void;
  onDelete: (ad: Ad) => void;
}

const mediaTypeLabel = (ad: Ad): string => {
  if (ad.mediaType === 'video') return 'فيديو';
  if (ad.mediaType === 'gif') return 'GIF';
  return 'صورة';
};

export function AdsTable({ ads, isLoading = false, isMutating = false, onEdit, onDelete }: AdsTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الوسائط</TableHead>
              <TableHead>الإعلان</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead className="w-40">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">جار تحميل الإعلانات...</TableCell></TableRow>
            ) : ads.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-32 text-center text-muted-foreground">لا توجد إعلانات بعد</TableCell></TableRow>
            ) : ads.map((ad) => {
              const mediaUrl = resolveMediaPath(ad.mediaPath || ad.imagePath);
              return (
                <TableRow key={ad.id}>
                  <TableCell>
                    <a href={mediaUrl} target="_blank" rel="noreferrer" className="group relative block h-16 w-24 overflow-hidden rounded-lg border bg-muted">
                      {ad.mediaType === 'video' ? (
                        <video src={mediaUrl} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                      ) : (
                        <img src={mediaUrl} alt={ad.title ?? 'إعلان'} className="h-full w-full object-cover" />
                      )}
                      <span className="absolute inset-0 hidden items-center justify-center bg-black/35 text-white group-hover:flex"><ExternalLink className="h-4 w-4" /></span>
                    </a>
                  </TableCell>
                  <TableCell className="min-w-56">
                    <p className="font-medium">{ad.title || 'بدون عنوان'}</p>
                    <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground">{ad.description || 'بدون وصف'}</p>
                  </TableCell>
                  <TableCell>{ad.product?.name || (ad.productId ? 'منتج مرتبط' : 'عام')}</TableCell>
                  <TableCell><Badge variant="secondary">{mediaTypeLabel(ad)}</Badge></TableCell>
                  <TableCell className="font-mono">{ad.order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" disabled={isMutating} onClick={() => onEdit(ad)}>
                        <Pencil className="h-4 w-4" />تعديل
                      </Button>
                      <Button type="button" variant="ghost" size="sm" disabled={isMutating} onClick={() => onDelete(ad)}>
                        <Trash2 className="h-4 w-4" />حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
