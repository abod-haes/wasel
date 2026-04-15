import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { SidebarNavItem } from '@/types/navigation';

interface SidebarNavProps {
  items: SidebarNavItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ items, collapsed = false, onNavigate }: SidebarNavProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const initiallyExpanded = useMemo(() => {
    const result = new Set<string>();

    const scan = (entryList: SidebarNavItem[], parents: string[] = []): void => {
      entryList.forEach((entry) => {
        const currentParents = [...parents, entry.key];

        if (entry.children && entry.children.length > 0) {
          scan(entry.children, currentParents);
        }

        if (entry.to && location.pathname.startsWith(entry.to)) {
          currentParents.forEach((key) => result.add(key));
        }
      });
    };

    scan(items);

    return result;
  }, [items, location.pathname]);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(initiallyExpanded);

  const toggleExpand = (key: string): void => {
    setExpandedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const renderItems = (entryList: SidebarNavItem[], depth = 0): React.JSX.Element => {
    return (
      <ul className={cn('space-y-1', depth > 0 && 'mt-1')}> 
        {entryList.map((entry) => {
          const Icon = entry.icon;
          const isParent = Boolean(entry.children && entry.children.length > 0);
          const isExpanded = expandedKeys.has(entry.key);

          if (isParent) {
            const firstChildPath = entry.children?.find((child) => child.to)?.to;

            if (collapsed && firstChildPath) {
              return (
                <li key={entry.key}> 
                  <NavLink
                    to={firstChildPath}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      )
                    }
                  >
                    {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                  </NavLink>
                </li>
              );
            }

            return (
              <li key={entry.key}>
                <button
                  type="button"
                  className={cn(
                    'group flex w-full items-center rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground',
                    depth > 0 && 'ps-6'
                  )}
                  onClick={() => toggleExpand(entry.key)}
                >
                  {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                  {!collapsed ? (
                    <>
                      <span className="ms-3 flex-1 text-start">{t(entry.labelKey)}</span>
                      <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
                    </>
                  ) : null}
                </button>
                {!collapsed && isExpanded && entry.children ? renderItems(entry.children, depth + 1) : null}
              </li>
            );
          }

          return (
            <li key={entry.key}>
              <NavLink
                to={entry.to ?? '#'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                    depth > 0 && 'ps-6',
                    collapsed && 'justify-center'
                  )
                }
              >
                {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                {!collapsed ? <span className="ms-3 line-clamp-1">{t(entry.labelKey)}</span> : null}
              </NavLink>
            </li>
          );
        })}
      </ul>
    );
  };

  return <nav dir={i18n.dir()}>{renderItems(items)}</nav>;
}
