import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { SidebarNavItem } from '@/types/navigation';

interface SidebarNavProps {
  items: SidebarNavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
  /** Expand the desktop rail when clicking a group icon in collapsed mode. */
  onExpand?: () => void;
}

function findActiveParents(items: SidebarNavItem[], pathname: string): Set<string> {
  const parents = new Set<string>();

  const visit = (entries: SidebarNavItem[], ancestors: string[]): void => {
    for (const entry of entries) {
      if (entry.to && (pathname === entry.to || pathname.startsWith(`${entry.to}/`))) {
        ancestors.forEach((key) => parents.add(key));
      }
      if (entry.children?.length) visit(entry.children, [...ancestors, entry.key]);
    }
  };

  visit(items, []);
  return parents;
}

export function SidebarNav({
  items,
  collapsed = false,
  onNavigate,
  onExpand,
}: SidebarNavProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const menuPrefix = useId();
  const activeParents = useMemo(() => findActiveParents(items, pathname), [items, pathname]);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => activeParents);

  // Deep links must reveal their parent group (including nested Settings).
  useEffect(() => {
    if (!activeParents.size) return;
    setExpandedKeys((previous) => {
      if ([...activeParents].every((key) => previous.has(key))) return previous;
      return new Set([...previous, ...activeParents]);
    });
  }, [activeParents]);

  const toggleGroup = (key: string, depth: number): void => {
    setExpandedKeys((previous) => {
      // Only one main section stays open: long sidebars remain easy to scan.
      const next = depth === 0 ? new Set<string>() : new Set(previous);
      if (!previous.has(key)) next.add(key);
      return next;
    });
    if (collapsed) onExpand?.();
  };

  const navItemClass = (active: boolean, depth: number) =>
    cn(
      'group flex w-full min-w-0 items-center gap-2.5 rounded-lg px-3 text-start transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      depth === 0 ? 'min-h-11 text-sm font-medium' : 'min-h-9 text-[13px]',
      active
        ? 'bg-primary/10 font-semibold text-primary dark:bg-primary/15'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      collapsed && 'justify-center px-2',
    );

  const renderItems = (entries: SidebarNavItem[], depth = 0): React.JSX.Element => (
    <ul className={cn('space-y-1', depth > 0 && 'ms-4 mt-1 border-s border-border/70 ps-2')}>
      {entries.map((entry) => {
        const Icon = entry.icon;
        const label = t(entry.labelKey);
        const children = entry.children ?? [];
        const hasChildren = children.length > 0;

        if (hasChildren) {
          const isExpanded = expandedKeys.has(entry.key);
          const containsActiveRoute = activeParents.has(entry.key);
          const submenuId = `${menuPrefix}-${entry.key}`;

          return (
            <li key={entry.key}>
              <button
                type="button"
                title={collapsed ? label : undefined}
                aria-label={collapsed ? label : undefined}
                aria-expanded={!collapsed && isExpanded}
                aria-controls={collapsed ? undefined : submenuId}
                onClick={() => toggleGroup(entry.key, depth)}
                className={navItemClass(containsActiveRoute, depth)}
              >
                {Icon ? <Icon aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
                {!collapsed ? (
                  <>
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </>
                ) : null}
              </button>
              {!collapsed && isExpanded ? (
                <div id={submenuId} className="animate-stagger">
                  {renderItems(children, depth + 1)}
                </div>
              ) : null}
            </li>
          );
        }

        if (!entry.to) return null;

        return (
          <li key={entry.key}>
            <NavLink
              to={entry.to}
              end={entry.to === '/settings'}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              onClick={onNavigate}
              className={({ isActive }) => navItemClass(isActive, depth)}
            >
              {Icon ? <Icon aria-hidden="true" className="h-4 w-4 shrink-0" /> : null}
              {!collapsed ? <span className="min-w-0 flex-1 truncate">{label}</span> : null}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav dir={i18n.dir()} aria-label={t('navGroups.navigation')}>
      {renderItems(items)}
    </nav>
  );
}
