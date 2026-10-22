import * as React from 'react';

import { cn } from '@/lib/utils';

type TableProps = React.HTMLAttributes<HTMLTableElement> & {
  /** Independent scrolling area; keep filters and pagination outside this container. */
  containerClassName?: string;
  /** Keep column titles visible when the table rows scroll vertically. */
  stickyHeader?: boolean;
};

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, stickyHeader = false, ...props }, ref) => (
    <div className={cn('w-full min-w-0 overflow-auto', containerClassName)}>
      <table
        ref={ref}
        className={cn(
          'w-full caption-bottom text-sm',
          stickyHeader &&
            '[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-muted [&_thead_th]:shadow-[inset_0_-1px_0_hsl(var(--border))]',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={cn('bg-muted/55 dark:bg-muted/45 [&_tr]:border-b [&_tr]:border-border/60', className)} {...props} />
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} {...props} />
  )
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} className={cn('border-b border-border/65 transition-colors hover:bg-muted/65 dark:hover:bg-muted/60 data-[state=selected]:bg-primary/10', className)} {...props} />
  )
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} className={cn('h-10 whitespace-nowrap px-3 text-start align-middle text-xs font-semibold text-muted-foreground sm:px-4', className)} {...props} />
  )
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => <td ref={ref} className={cn('px-3 py-3 align-middle sm:px-4', className)} {...props} />
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
);
TableCaption.displayName = 'TableCaption';

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow };
