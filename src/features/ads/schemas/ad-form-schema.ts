import { z } from 'zod';

const MAX_MEDIA_SIZE_BYTES = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov']);
const ALLOWED_CONTENT_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

export const adFieldsSchema = z.object({
  title: z.string().trim().max(200, 'العنوان يجب ألا يتجاوز 200 محرف'),
  description: z.string().trim().max(1024, 'الوصف يجب ألا يتجاوز 1024 محرف'),
  order: z.coerce.number().int('الترتيب يجب أن يكون عددًا صحيحًا'),
  productId: z.string().trim(),
});

export const validateAdMediaFile = (file: File | undefined, required: boolean): string | undefined => {
  if (!file) {
    return required ? 'ملف الإعلان مطلوب عند الإنشاء' : undefined;
  }

  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    return 'حجم الملف يجب ألا يتجاوز 100 MB';
  }

  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return 'الملف يجب أن يكون PNG أو JPG أو JPEG أو WEBP أو GIF أو MP4 أو WEBM أو MOV';
  }

  if (file.type && !ALLOWED_CONTENT_TYPES.has(file.type.toLowerCase())) {
    return 'نوع محتوى الملف غير مدعوم';
  }

  return undefined;
};
