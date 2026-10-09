import { ImagePlus, Star, Trash2, Upload } from 'lucide-react';
import { useRef, useState, type DragEvent } from 'react';
import { toast } from 'sonner';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  useAddProductImagesMutation,
  useDeleteProductImageMutation,
  useReplaceMainProductImageMutation,
  useSetMainProductImageMutation,
} from '@/features/products/hooks/use-products-query';
import type { Product } from '@/features/products/types/product-types';
import { cn, resolveMediaPath } from '@/lib/utils';

interface ProductImagesManagerProps {
  product: Product;
}

const ACCEPTED_IMAGES = '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const validateImages = (files: File[]): File[] => {
  const valid = files.filter((file) => ALLOWED_IMAGE_TYPES.has(file.type) && file.size <= MAX_IMAGE_SIZE);
  if (valid.length !== files.length) {
    toast.error('بعض الصور غير مدعومة أو أكبر من 10MB');
  }
  return valid;
};

export function ProductImagesManager({ product }: ProductImagesManagerProps): React.JSX.Element {
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const addImagesMutation = useAddProductImagesMutation();
  const replaceMainMutation = useReplaceMainProductImageMutation();
  const deleteImageMutation = useDeleteProductImageMutation();
  const setMainMutation = useSetMainProductImageMutation();

  const isMutating =
    addImagesMutation.isPending ||
    replaceMainMutation.isPending ||
    deleteImageMutation.isPending ||
    setMainMutation.isPending;

  const handleAddFiles = (files: FileList | null): void => {
    const selectedFiles = validateImages(Array.from(files ?? []));
    if (selectedFiles.length === 0) return;

    addImagesMutation.mutate({ productId: product.id, files: selectedFiles });
    if (addInputRef.current) addInputRef.current.value = '';
  };

  const handleReplaceMain = (files: FileList | null): void => {
    const file = files?.[0];
    if (!file || validateImages([file]).length === 0) return;

    replaceMainMutation.mutate({ productId: product.id, file });
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (isMutating) return;

    const files = validateImages(Array.from(event.dataTransfer.files));
    if (files.length === 0) return;

    addImagesMutation.mutate({ productId: product.id, files });
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    setIsDragging(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>صور المنتج</CardTitle>
            <CardDescription>أضف عدة صور، غيّر الصورة الرئيسية، أو احذف الصور الثانوية.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={addInputRef} type="file" multiple accept={ACCEPTED_IMAGES} className="sr-only" onChange={(event) => handleAddFiles(event.target.files)} />
            <input ref={replaceInputRef} type="file" accept={ACCEPTED_IMAGES} className="sr-only" onChange={(event) => handleReplaceMain(event.target.files)} />
            <Button type="button" variant="outline" disabled={isMutating} onClick={() => replaceInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              استبدال الرئيسية
            </Button>
            <Button type="button" disabled={isMutating} onClick={() => addInputRef.current?.click()}>
              <ImagePlus className="h-4 w-4" />
              إضافة صور
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div
          role="button"
          tabIndex={isMutating ? -1 : 0}
          aria-disabled={isMutating}
          className={cn(
            'group flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/80 bg-muted/10 px-5 py-7 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15',
            isDragging && 'scale-[1.01] border-primary bg-primary/5 shadow-sm',
            !isMutating && 'hover:border-primary/60 hover:bg-primary/[0.03]',
            isMutating && 'cursor-not-allowed opacity-60'
          )}
          onClick={() => {
            if (!isMutating) addInputRef.current?.click();
          }}
          onKeyDown={(event) => {
            if (isMutating || (event.key !== 'Enter' && event.key !== ' ')) return;
            event.preventDefault();
            addInputRef.current?.click();
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!isMutating) setIsDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
            event.dataTransfer.dropEffect = 'copy';
            if (!isMutating) setIsDragging(true);
          }}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <span
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-2xl border bg-background text-muted-foreground transition-all',
              isDragging && 'border-primary/40 bg-primary/10 text-primary'
            )}
          >
            <Upload className="h-6 w-6" />
          </span>

          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              {isDragging ? 'اترك الصور هون لرفعها' : 'اسحب الصور وأفلتها هون'}
            </p>
            <p className="text-xs text-muted-foreground">
              أو اضغط لاختيار عدة صور من جهازك
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border bg-background px-2.5 py-1">PNG</span>
            <span className="rounded-full border bg-background px-2.5 py-1">JPG / JPEG</span>
            <span className="rounded-full border bg-background px-2.5 py-1">WEBP</span>
            <span className="rounded-full border bg-background px-2.5 py-1">حتى 10MB للصورة</span>
          </div>
        </div>

        {product.images.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {product.images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-xl border bg-card">
                <div className="relative aspect-square bg-muted">
                  <img
                    src={resolveMediaPath(image.imagePath)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {image.isMain ? (
                    <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      الرئيسية
                    </span>
                  ) : null}
                </div>
                <div className="flex gap-2 p-2">
                  {!image.isMain ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={isMutating}
                      onClick={() =>
                        setMainMutation.mutate({ productId: product.id, imageId: image.id })
                      }
                    >
                      <Star className="h-4 w-4" />
                      جعلها رئيسية
                    </Button>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isMutating}
                    aria-label="حذف الصورة"
                    onClick={() =>
                      deleteImageMutation.mutate({ productId: product.id, imageId: image.id })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
            ما في صور للمنتج حالياً. اسحب الصور للمنطقة فوق أو اضغط عليها للإضافة.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
