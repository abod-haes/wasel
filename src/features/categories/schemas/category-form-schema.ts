import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().optional(),
  imageFile: z.instanceof(File).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  id: z.string().min(1),
});

export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
