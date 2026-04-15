export interface DashboardKpi {
  id: string;
  labelKey: string;
  value: number;
  delta: number;
}

export interface DashboardActivity {
  id: string;
  actionKey: string;
  actor: string;
  createdAt: string;
}

export interface DashboardSummary {
  kpis: DashboardKpi[];
  activity: DashboardActivity[];
}
