import { useTranslation } from 'react-i18next';

import { ErrorState, LoadingScreen, PageContainer, SectionHeader } from '@/components/shared';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { KpiCard } from '@/features/dashboard/components/kpi-card';
import { useDashboardSummaryQuery } from '@/features/dashboard/hooks/use-dashboard-query';

export default function DashboardPage(): React.JSX.Element {
  const { t } = useTranslation();
  const summaryQuery = useDashboardSummaryQuery();

  if (summaryQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return <ErrorState onRetry={() => void summaryQuery.refetch()} />;
  }

  return (
    <PageContainer>
      <SectionHeader titleKey="dashboard.title" descriptionKey="dashboard.description" />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryQuery.data.kpis.map((kpi) => (
          <KpiCard key={kpi.id} labelKey={kpi.labelKey} value={kpi.value} delta={kpi.delta} />
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.activity.title')}</CardTitle>
          <CardDescription>{t('dashboard.activity.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
                <TableHead className="text-end">{t('users.table.lastLogin')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaryQuery.data.activity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.actor}</TableCell>
                  <TableCell>{t(activity.actionKey)}</TableCell>
                  <TableCell className="text-end text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
