import type { ReactNode } from 'react';

import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';

interface DataTableColumn<TData> {
  key: string;
  header: ReactNode;
  renderCell: (row: TData) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<TData> {
  data: TData[];
  columns: DataTableColumn<TData>[];
  getRowKey: (row: TData) => string;
  isLoading?: boolean;
  emptyTitleKey?: string;
  emptyDescriptionKey?: string;
}

export function DataTable<TData>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  emptyTitleKey,
  emptyDescriptionKey,
}: DataTableProps<TData>): React.JSX.Element {
  const safeData = Array.isArray(data) ? data : [];

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (safeData.length === 0) {
    return <EmptyState titleKey={emptyTitleKey} descriptionKey={emptyDescriptionKey} />;
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.headerClassName}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.map((row) => (
            <TableRow key={getRowKey(row)}>
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.renderCell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
