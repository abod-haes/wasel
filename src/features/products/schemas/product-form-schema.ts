import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(2),
  code: z.string().trim().min(2),
  description: z.string().trim().optional(),
  price: z.number().positive(),
  imageFile: z.instanceof(File).optional(),
  categoryIds: z.array(z.string().trim().min(1)).optional(),
  categoryId: z.string().trim().optional(),
  categoryName: z.string().trim().optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().trim().min(1),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
