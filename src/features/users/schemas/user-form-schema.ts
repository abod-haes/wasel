import { z } from 'zod';

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

const userBaseSchema = z.object({
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phoneNumber: z.string().trim().min(6),
  location: optionalTextSchema,
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  phoneNumberVerified: z.boolean().optional().default(false),
  roleIds: z.array(z.string().min(1)).default([]),
});

export const createUserSchema = userBaseSchema.extend({
  password: z.string().trim().min(6),
});

export const updateUserPayloadSchema = userBaseSchema.extend({
  password: z.string().trim().min(6).optional(),
});

export const updateUserSchema = updateUserPayloadSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserPayloadSchema = z.infer<typeof updateUserPayloadSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
