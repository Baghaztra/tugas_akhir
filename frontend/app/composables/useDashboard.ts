/**
 * Composable untuk Dashboard & Reports
 * Endpoint: /dashboard/summary, /dashboard/trend, /dashboard/notifications
 */

export interface DashboardSummary {
  activeOrders: number;
  weeklyRevenue: number;
  todayDone: number;
}

export interface TrendData {
  labels: string[];
  incoming: number[];
  completed: number[];
}

export interface DashboardNotification {
  id: number;
  receiptNumber: string;
  customerName: string;
  garmentType: string;
  deadline: string;
  daysLeft: number;
  status: string;
  urgency: "critical" | "high" | "medium";
}

export const useDashboard = () => {
  const { apiBase } = useRuntimeConfig().public;

  const { data: summary, status, error, refresh } = useFetch<DashboardSummary>(
    `${apiBase}/dashboard/summary`,
    {
      credentials: 'include',
      default: () => ({ activeOrders: 0, weeklyRevenue: 0, todayDone: 0 }),
    },
  );

  const { data: trend } = useFetch<TrendData>(`${apiBase}/dashboard/trend`, {
    credentials: 'include',
    default: () => ({ labels: [], incoming: [], completed: [] }),
  });

  const { data: notifications } = useFetch<DashboardNotification[]>(
    `${apiBase}/dashboard/notifications`,
    {
      credentials: 'include',
      default: () => [] as DashboardNotification[],
    },
  );

  return { summary, trend, notifications, status, error, refresh };
};

// ─── Reports composable ────────────────────────────────────────────────────────

export interface VolumeReport {
  labels: string[];
  data: number[];
}

export interface ProductTrend {
  type: string;
  count: number;
}

export interface ProductivityReport {
  worker: string;
  role: string;
  total_finished: number;
  avg_time_per_item: number | null;
}

export const useReports = () => {
  const { apiBase } = useRuntimeConfig().public;

  const { data: volume, refresh: refreshVolume } = useFetch<VolumeReport>(
    `${apiBase}/reports/volume`,
    {
      query: { period: "monthly" },
      default: () => ({ labels: [], data: [] }),
    },
  );

  const { data: productTrends } = useFetch<ProductTrend[]>(
    `${apiBase}/reports/product-trends`,
    {
      default: () => [] as ProductTrend[],
    },
  );

  const { data: productivity } = useFetch<ProductivityReport[]>(
    `${apiBase}/reports/productivity`,
    {
      default: () => [] as ProductivityReport[],
    },
  );

  return { volume, productTrends, productivity, refreshVolume };
};
