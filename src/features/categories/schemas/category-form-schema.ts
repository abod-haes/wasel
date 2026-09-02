import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(128),
  description: z.string().trim().max(1024).optional(),
  imageFile: z.instanceof(File).optional(),
  parentCategoryId: z.string().trim().min(1).optional(),
  productIds: z.array(z.string().trim().min(1)).optional(),
  removeImage: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
