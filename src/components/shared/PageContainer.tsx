import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

export function PageContainer({ children, className }: PropsWithChildren<{ className?: string }>): React.JSX.Element {
  return <section className={cn('container animate-stagger space-y-6 py-6', className)}>{children}</section>;
}
