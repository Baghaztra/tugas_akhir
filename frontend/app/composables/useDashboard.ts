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
}

export interface WeeklyRecap {
  week_start: string;
  week_end: string;
  summary: {
    total_orders: number;
    total_revenue: number;
    orders_completed: number;
    total_items: number;
  };
  daily: Array<{
    day: string;
    date: string;
    orders_in: number;
    orders_done: number;
  }>;
  by_garment_type: Array<{ type: string; count: number }>;
  by_payment_status: { paid: number; partial: number; unpaid: number };
}

export const useReports = (filters?: {
  startDate?: Ref<string>;
  endDate?: Ref<string>;
}) => {
  const { apiBase } = useRuntimeConfig().public;

  const query = computed(() => {
    const q: Record<string, string> = {};
    if (filters?.startDate?.value) q.start_date = filters.startDate.value;
    if (filters?.endDate?.value) q.end_date = filters.endDate.value;
    return q;
  });

  const { data: volume, refresh: refreshVolume } = useFetch<VolumeReport>(
    `${apiBase}/reports/volume`,
    {
      query,
      credentials: "include",
      default: () => ({ labels: [], data: [] }),
    },
  );

  const { data: productTrends } = useFetch<ProductTrend[]>(
    `${apiBase}/reports/product-trends`,
    {
      query,
      credentials: "include",
      default: () => [] as ProductTrend[],
    },
  );

  const { data: productivity } = useFetch<ProductivityReport[]>(
    `${apiBase}/reports/productivity`,
    {
      query,
      credentials: "include",
      default: () => [] as ProductivityReport[],
    },
  );

  return { volume, productTrends, productivity, refreshVolume };
};

export const useProductivity = (filters?: {
  startDate?: Ref<string>;
  endDate?: Ref<string>;
}) => {
  const { apiBase } = useRuntimeConfig().public;

  const query = computed(() => {
    const q: Record<string, string> = {};
    if (filters?.startDate?.value) q.start_date = filters.startDate.value;
    if (filters?.endDate?.value) q.end_date = filters.endDate.value;
    return q;
  });

  const { data: productivity, status } = useFetch<ProductivityReport[]>(
    `${apiBase}/reports/productivity`,
    {
      query,
      credentials: "include",
      default: () => [] as ProductivityReport[],
    },
  );

  return { productivity, status };
};

const emptyRecap: WeeklyRecap = {
  week_start: "",
  week_end: "",
  summary: { total_orders: 0, total_revenue: 0, orders_completed: 0, total_items: 0 },
  daily: [],
  by_garment_type: [],
  by_payment_status: { paid: 0, partial: 0, unpaid: 0 },
};

export const useWeeklyRecap = (weekStart: Ref<string>) => {
  const { apiBase } = useRuntimeConfig().public;

  const { data: recap, status, refresh } = useFetch<WeeklyRecap>(
    `${apiBase}/reports/weekly-recap`,
    {
      query: computed(() => ({
        week_start: weekStart.value || undefined,
      })),
      credentials: "include",
      default: () => emptyRecap,
    },
  );

  return { recap, status, refresh };
};

export const exportWeeklyRecap = (weekStart: string) => {
  const { apiBase } = useRuntimeConfig().public;
  const url = `${apiBase}/reports/weekly-recap/export?week_start=${encodeURIComponent(weekStart)}`;
  window.open(url, "_blank");
};
