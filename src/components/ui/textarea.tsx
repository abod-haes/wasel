import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'min-h-[112px] w-full resize-y rounded-[16px] border border-brand-border bg-card px-4 py-3 text-sm font-medium leading-6 shadow-[inset_0_1px_0_hsl(var(--background)/0.45)] transition-all duration-200 placeholder:text-muted-foreground/70 hover:border-brand-primary/35 focus-visible:border-primary/50 focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
