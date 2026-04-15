import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { formatNumber, formatPercent } from '@/lib/utils';

interface KpiCardProps {
  labelKey: string;
  value: number;
  delta: number;
}

export function KpiCard({ labelKey, value, delta }: KpiCardProps): React.JSX.Element {
  const { t } = useTranslation();

  const isPositive = delta >= 0;

  return (
    <Card className="surface-grid">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{t(labelKey)}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(value)}</div>
        <p className={isPositive ? 'mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-300' : 'mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-300'}>
          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {formatPercent(delta)}
        </p>
      </CardContent>
    </Card>
  );
}
