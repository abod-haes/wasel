import { ExternalLink, ImageOff, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

function AdMediaPreview({ ad }: { ad: Ad }): React.JSX.Element {
  const rawPath = ad.mediaPath || ad.imagePath;
  const mediaUrl = rawPath ? resolveMediaPath(rawPath) : '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [mediaUrl]);

  if (!mediaUrl || failed) {
    return (
      <div className="flex h-20 w-28 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border bg-muted/70 px-2 text-center text-muted-foreground">
        <ImageOff className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-4">الوسائط غير متاحة</span>
      </div>
    );
  }

  return (
    <a
      href={mediaUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="فتح وسائط الإعلان"
      className="group relative block h-20 w-28 overflow-hidden rounded-xl border bg-muted shadow-sm"
    >
      {ad.mediaType === 'video' ? (
        <video
          src={mediaUrl}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={mediaUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}

      <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
        <ExternalLink className="h-4 w-4" />
      </span>
    </a>
  );
}

export function AdsTable({
  ads,
  isLoading = false,
  isMutating = false,
  onEdit,
  onDelete,
}: AdsTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">الوسائط</TableHead>
              <TableHead>الإعلان</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead className="w-24">الترتيب</TableHead>
              <TableHead className="w-44">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  جار تحميل الإعلانات...
                </TableCell>
              </TableRow>
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  لا توجد إعلانات بعد
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => (
                <TableRow key={ad.id} className="align-middle">
                  <TableCell className="py-3">
                    <AdMediaPreview ad={ad} />
                  </TableCell>

                  <TableCell className="min-w-56">
                    <p className="font-medium">{ad.title || 'بدون عنوان'}</p>
                    <p className="mt-1 line-clamp-2 max-w-md text-xs text-muted-foreground">
                      {ad.description || 'بدون وصف'}
                    </p>
                  </TableCell>

                  <TableCell>{ad.product?.name || (ad.productId ? 'منتج مرتبط' : 'عام')}</TableCell>

                  <TableCell>
                    <Badge variant="secondary">{mediaTypeLabel(ad)}</Badge>
                  </TableCell>

                  <TableCell className="font-mono">{ad.order}</TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => onEdit(ad)}
                      >
                        <Pencil className="h-4 w-4" />
                        تعديل
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => onDelete(ad)}
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
