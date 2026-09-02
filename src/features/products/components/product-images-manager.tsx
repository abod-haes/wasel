import { ImagePlus, Star, Trash2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import {
  useAddProductImagesMutation,
  useDeleteProductImageMutation,
  useReplaceMainProductImageMutation,
  useSetMainProductImageMutation,
} from '@/features/products/hooks/use-products-query';
import type { Product } from '@/features/products/types/product-types';
import { resolveMediaPath } from '@/lib/utils';

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
      <CardContent>
        {product.images.length === 0 ? (
          <button
            type="button"
            className="flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm text-muted-foreground hover:bg-muted/30"
            onClick={() => addInputRef.current?.click()}
            disabled={isMutating}
          >
            <ImagePlus className="h-6 w-6" />
            لا توجد صور. اضغط لإضافة صور للمنتج.
          </button>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {product.images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-xl border bg-card">
                <div className="relative aspect-square bg-muted">
                  <img src={resolveMediaPath(image.imagePath)} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
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
                      onClick={() => setMainMutation.mutate({ productId: product.id, imageId: image.id })}
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
                    onClick={() => deleteImageMutation.mutate({ productId: product.id, imageId: image.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">الأنواع المدعومة: PNG, JPG, JPEG, WEBP — الحد الأقصى للصورة حسب الباك 10MB.</p>
      </CardContent>
    </Card>
  );
}
