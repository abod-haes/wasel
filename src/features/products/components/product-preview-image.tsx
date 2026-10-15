import type { ImgHTMLAttributes } from 'react';

import { resolveMediaPath } from '@/lib/utils';

interface ProductPreviewImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  thumbnailPath?: string | null;
  originalPath?: string | null;
}

/** Use the small preview first, and only download the original after a load failure. */
export function ProductPreviewImage({
  thumbnailPath,
  originalPath,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: ProductPreviewImageProps): React.JSX.Element | null {
  const preferred = thumbnailPath?.trim() || originalPath?.trim();
  if (!preferred) return null;

  const original = originalPath?.trim() ? resolveMediaPath(originalPath.trim()) : undefined;
  return (
    <img
      {...props}
      src={resolveMediaPath(preferred)}
      loading={loading}
      decoding={decoding}
      onError={(event) => {
        const image = event.currentTarget;
        if (original && image.src !== original) {
          image.src = original;
        } else {
          image.onerror = null;
          image.style.visibility = 'hidden';
        }
      }}
    />
  );
}
