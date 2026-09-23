import { z } from 'zod';

export const settingsSchema = z.object({
  displayName: z.string().min(2),
  language: z.enum(['en', 'ar']),
  compactSidebar: z.boolean(),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
