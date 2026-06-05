import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/shared/EmptyState';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { PaginatedData } from '@/types/api';

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
  pagination?: Pick<PaginatedData<TData>, 'page' | 'pageSize' | 'totalCount' | 'totalPages'>;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTable<TData>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  emptyTitleKey,
  emptyDescriptionKey,
  pagination,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData>): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const safeData = Array.isArray(data) ? data : [];
  const pageSizeOptions = ['10', '20', '50', '100'];
  const isRtl = i18n.dir() === 'rtl';

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

  const startItem = pagination ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const endItem = pagination ? startItem + safeData.length - 1 : 0;
  const pageNumbers = pagination
    ? (() => {
        const pages = new Set<number>([1, pagination.totalPages, pagination.page - 1, pagination.page, pagination.page + 1]);
        return Array.from(pages)
          .filter((page) => page >= 1 && page <= pagination.totalPages)
          .sort((first, second) => first - second);
      })()
    : [];

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

      {pagination ? (
        <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className={cn('text-sm text-muted-foreground', isRtl ? 'text-right' : 'text-left')}>
            {t('common.pagination.summary', {
              from: startItem,
              to: endItem,
              total: pagination.totalCount,
            })}
          </div>

          <div
            className={cn(
              'flex flex-col gap-3 sm:items-center',
              isRtl ? 'sm:flex-row-reverse' : 'sm:flex-row'
            )}
          >
            <div className={cn('flex items-center gap-2', isRtl ? 'sm:flex-row-reverse' : 'sm:flex-row')}>
              <span className="text-sm text-muted-foreground">{t('common.pagination.rowsPerPage')}</span>
              <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => onPageSizeChange?.(Number(value))}
              >
                <SelectTrigger className="h-9 w-[88px] rounded-lg bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className={cn(
                'flex flex-wrap items-center gap-2 self-end sm:self-auto',
              )}
            >
              <span className="text-sm text-muted-foreground">
                {t('common.pagination.page', {
                  current: pagination.page,
                  total: pagination.totalPages,
                })}
              </span>

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page <= 1}
                aria-label={t('common.pagination.previous')}
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>

              {pageNumbers.map((page, index) => {
                const previousPage = pageNumbers[index - 1];
                const shouldRenderEllipsis = previousPage != null && page - previousPage > 1;

                return (
                  <div key={page} className={cn('flex items-center gap-2', isRtl ? 'flex-row-reverse' : 'flex-row')}>
                    {shouldRenderEllipsis ? <span className="px-1 text-sm text-muted-foreground">...</span> : null}
                    <Button
                      type="button"
                      variant={page === pagination.page ? 'default' : 'outline'}
                      size="icon"
                      className="h-9 w-9 rounded-lg"
                      onClick={() => onPageChange?.(page)}
                      aria-current={page === pagination.page ? 'page' : undefined}
                    >
                      {page}
                    </Button>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                aria-label={t('common.pagination.next')}
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
