import { z } from 'zod';

const optionalFileSchema = z.instanceof(File).optional();

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
  name: z.string().trim().min(2),
  code: z.string().trim().min(2),
  brand: z.string().trim().optional(),
  type: z.string().trim().optional(),
  weight: z.number().nonnegative().optional(),
  description: z.string().trim().optional(),
  price: z.number().positive(),
  imageFile: optionalFileSchema,
  categoryIds: z.array(z.string().trim().min(1)).optional(),
  categoryId: z.string().trim().optional(),
  categoryName: z.string().trim().optional(),
  variants: z.array(productVariantSchema).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().trim().min(1),
  clearVariants: z.boolean().optional(),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
