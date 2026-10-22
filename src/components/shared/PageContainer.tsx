import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

interface PageContainerProps extends PropsWithChildren {
  className?: string;
  /** List view: fixed heading/filters and a flexing table-only scroll region. */
  fixedTableLayout?: boolean;
}

export function PageContainer({
  children,
  className,
  fixedTableLayout = false,
}: PageContainerProps): React.JSX.Element {
  return (
    <section
      data-table-workspace={fixedTableLayout ? 'true' : undefined}
      className={cn(
        'mx-auto w-full max-w-[1600px] animate-stagger space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-6',
        fixedTableLayout && 'lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-4 lg:overflow-hidden lg:space-y-0 lg:[&>:not(.dashboard-data-table)]:shrink-0 lg:[&>.dashboard-data-table]:min-h-0 lg:[&>.dashboard-data-table]:flex-1',
        className,
      )}
    >
      {children}
    </section>
  );
}
