import { z } from 'zod';

export const dashboardFilterSchema = z.object({
  period: z.enum(['7d', '30d', '90d']),
});

export type DashboardFilterSchema = z.infer<typeof dashboardFilterSchema>;
