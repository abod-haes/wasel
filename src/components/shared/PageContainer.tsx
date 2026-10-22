import type { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

export function PageContainer({ children, className }: PropsWithChildren<{ className?: string }>): React.JSX.Element {
  return <section className={cn('mx-auto w-full max-w-[1600px] animate-stagger space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-6', className)}>{children}</section>;
}
