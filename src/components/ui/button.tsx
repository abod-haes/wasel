import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold tracking-[0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none',
  {
    variants: {
      variant: {
        default:
          'border border-primary/25 bg-primary text-primary-foreground shadow-[0_12px_28px_-16px_rgba(20,47,125,0.50)] hover:-translate-y-0.5 hover:bg-brand-primary-dark hover:text-white hover:shadow-[0_18px_34px_-17px_rgba(20,47,125,0.42)] dark:hover:bg-primary/85 dark:hover:text-primary-foreground',
        secondary:
          'border border-brand-secondary/60 bg-brand-secondary-soft text-brand-primary-dark shadow-sm hover:-translate-y-0.5 hover:border-brand-secondary hover:bg-brand-secondary dark:border-brand-secondary/60 dark:bg-brand-secondary dark:text-brand-primary-dark',
        ghost:
          'border border-transparent text-muted-foreground hover:border-primary/15 hover:bg-primary/8 hover:text-primary',
        outline:
          'border border-brand-border bg-background/80 text-foreground backdrop-blur hover:border-primary/45 hover:bg-primary/5 dark:border-border',
        destructive:
          'border border-destructive/20 bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-0.5 hover:bg-destructive/90',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 rounded-xl px-3 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
