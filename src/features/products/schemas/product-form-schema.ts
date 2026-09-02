import { z } from 'zod';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

const optionalFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_IMAGE_SIZE, 'Image must be 10 MB or smaller')
  .refine((file) => ALLOWED_IMAGE_TYPES.has(file.type), 'Only PNG, JPG, JPEG, and WEBP images are allowed')
  .optional();

export const productVariantSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).max(128),
  imageFile: optionalFileSchema,
  imagePath: z.string().trim().optional().nullable(),
  imageId: z.string().trim().min(1).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isDefault: z.boolean().optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(128),
  code: z.string().trim().min(1).max(64),
  brand: z.string().trim().max(128).optional(),
  type: z.string().trim().max(128).optional(),
  weight: z.number().nonnegative().optional(),
  weightUnit: z.enum(['g', 'Kg', 'L']).optional(),
  description: z.string().trim().max(1024).optional(),
  price: z.number().nonnegative(),
  imageFile: optionalFileSchema,
  categoryIds: z.array(z.string().trim().min(1)).optional(),
  categoryId: z.string().trim().optional(),
  categoryName: z.string().trim().optional(),
  variants: z.array(productVariantSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().trim().min(1),
  clearCategories: z.boolean().optional(),
  clearVariants: z.boolean().optional(),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
