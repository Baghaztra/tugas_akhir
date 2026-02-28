/**
 * Composable untuk Dashboard & Reports
 * Ganti BASE_URL dan hapus `default:` setelah backend siap.
 */
import { dummyDashboard, dummyTrendData, dummyNotifications, dummyReports } from "~/data/dummy";
import type { DashboardSummary, ReportData } from "~/data/dummy";

const BASE_URL = "http://localhost:8000";

export const useDashboard = () => {
  const { data, status, error, refresh } = useFetch<DashboardSummary>(
    `${BASE_URL}/dashboard/summary`,
    {
      default: () => dummyDashboard,
    },
  );

  const { data: trend } = useFetch(`${BASE_URL}/dashboard/trend`, {
    default: () => dummyTrendData,
  });

  const { data: notifications } = useFetch(`${BASE_URL}/dashboard/notifications`, {
    default: () => dummyNotifications,
  });

  return { summary: data, trend, notifications, status, error, refresh };
};

export const useReports = () => {
  const { data, status, error } = useFetch<ReportData>(`${BASE_URL}/reports`, {
    default: () => dummyReports,
  });
  return { reports: data, status, error };
};
