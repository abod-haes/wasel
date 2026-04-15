import type { LucideIcon } from 'lucide-react';

import type { Permission } from '@/constants/permissions';

export interface SidebarNavItem {
  key: string;
  labelKey: string;
  to?: string;
  icon?: LucideIcon;
  permission?: Permission;
  children?: SidebarNavItem[];
}
