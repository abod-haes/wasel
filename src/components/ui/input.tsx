import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-12 w-full rounded-[16px] border border-brand-border bg-card px-4 text-sm font-medium shadow-[inset_0_1px_0_hsl(var(--background)/0.45)] transition-all duration-200 placeholder:text-muted-foreground/70 hover:border-brand-primary/35 focus-visible:border-primary/50 focus-visible:bg-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-55',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
