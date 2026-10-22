import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { SidebarNavItem } from '@/types/navigation';

interface SidebarNavProps {
  items: SidebarNavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

type SidebarGroup = 'overview' | 'management' | 'finance' | 'system';

function groupForItem(key: string): SidebarGroup {
  if (key === 'dashboard') return 'overview';
  if (key === 'delivery-finance' || key === 'market-finance') return 'finance';
  if (key === 'notifications' || key === 'otp-admin' || key === 'settings') return 'system';
  return 'management';
}

function activeParentKeys(items: SidebarNavItem[], pathname: string): Set<string> {
  const active = new Set<string>();
  const visit = (entries: SidebarNavItem[], parents: string[]): void => {
    entries.forEach((item) => {
      const chain = [...parents, item.key];
      if (item.to && (pathname === item.to || pathname.startsWith(`${item.to}/`))) {
        chain.forEach((key) => active.add(key));
      }
      if (item.children?.length) visit(item.children, chain);
    });
  };
  visit(items, []);
  return active;
}

export function SidebarNav({ items, collapsed = false, onNavigate }: SidebarNavProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const routeExpanded = useMemo(() => activeParentKeys(items, pathname), [items, pathname]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => routeExpanded);

  useEffect(() => {
    setExpandedKeys((previous) => new Set([...previous, ...routeExpanded]));
  }, [routeExpanded]);

  const toggleExpand = (key: string): void => {
    setExpandedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const itemClass = (active: boolean, depth: number) => cn(
    'group relative flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
    active
      ? 'bg-primary/10 font-semibold text-primary dark:bg-primary/15'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    depth > 0 && !collapsed && 'ps-7',
    collapsed && 'justify-center px-2',
  );

  const renderItems = (entries: SidebarNavItem[], depth = 0): React.JSX.Element => (
    <ul className={cn('space-y-0.5', depth > 0 && 'mt-1')}>
      {entries.map((entry) => {
        const Icon = entry.icon;
        const label = t(entry.labelKey);
        const isParent = Boolean(entry.children?.length);
        if (isParent) {
          const children = entry.children ?? [];
          const firstChildPath = children.find((child) => child.to)?.to;
          const expanded = expandedKeys.has(entry.key);
          const parentActive = routeExpanded.has(entry.key);
          if (collapsed && firstChildPath) {
            return <li key={entry.key}>
              <NavLink to={firstChildPath} title={label} aria-label={label} onClick={onNavigate}
                className={() => itemClass(parentActive, depth)}>
                {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              </NavLink>
            </li>;
          }
          return <li key={entry.key}>
            <button type="button" aria-expanded={expanded} aria-controls={`sidebar-submenu-${entry.key}`}
              onClick={() => toggleExpand(entry.key)} className={itemClass(parentActive, depth)}>
              {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              <span className="min-w-0 flex-1 truncate text-start">{label}</span>
              <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
            </button>
            {expanded && <div id={`sidebar-submenu-${entry.key}`}>{renderItems(children, depth + 1)}</div>}
          </li>;
        }
        if (!entry.to) return null;
        return <li key={entry.key}>
          <NavLink to={entry.to} onClick={onNavigate} title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            className={({ isActive }) => itemClass(isActive, depth)}>
            {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
            {!collapsed && <span className="min-w-0 flex-1 truncate text-start">{label}</span>}
          </NavLink>
        </li>;
      })}
    </ul>
  );

  let lastGroup: SidebarGroup | undefined;
  return <nav dir={i18n.dir()} aria-label={t('navGroups.navigation')} className="space-y-2">
    {items.map((entry) => {
      const group = groupForItem(entry.key);
      const firstInGroup = lastGroup !== group;
      lastGroup = group;
      return <div key={entry.key}>
        {firstInGroup && (collapsed
          ? <div className="mx-3 my-3 h-px bg-border" aria-hidden="true" />
          : <p className="px-3 pb-2 pt-3 text-[11px] font-semibold tracking-wide text-muted-foreground/80">{t(`navGroups.${group}`)}</p>)}
        {renderItems([entry])}
      </div>;
    })}
  </nav>;
}
