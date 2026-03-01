/**
 * Composable untuk Dashboard & Reports
 * Base URL dikonfigurasi via nuxt.config runtimeConfig atau
 * environment variable NUXT_PUBLIC_API_BASE.
 */
import { dummyDashboard, dummyTrendData, dummyNotifications, dummyReports } from "~/data/dummy";
import type { DashboardSummary, ReportData } from "~/data/dummy";

export const useDashboard = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<DashboardSummary>(
    `${apiBase}/dashboard/summary`,
    {
      default: () => dummyDashboard,
    },
  );

  const { data: trend } = useFetch(`${apiBase}/dashboard/trend`, {
    default: () => dummyTrendData,
  });

  const { data: notifications } = useFetch(`${apiBase}/dashboard/notifications`, {
    default: () => dummyNotifications,
  });

  return { summary: data, trend, notifications, status, error, refresh };
};

export const useReports = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error } = useFetch<ReportData>(`${apiBase}/reports`, {
    default: () => dummyReports,
  });
  return { reports: data, status, error };
};
