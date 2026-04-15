import { z } from 'zod';

export const settingsSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  language: z.enum(['en', 'ar']),
  compactSidebar: z.boolean(),
  emailNotifications: z.boolean(),
});

export type SettingsSchema = z.infer<typeof settingsSchema>;
