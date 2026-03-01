/**
 * Composable untuk API Karyawan/Employees
 * Base URL dikonfigurasi via nuxt.config runtimeConfig atau
 * environment variable NUXT_PUBLIC_API_BASE.
 */
import { dummyEmployees, dummyEmployeePerformance } from "~/data/dummy";
import type { Employee, EmployeePerformance } from "~/data/dummy";

export const useEmployees = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<Employee[]>(`${apiBase}/employees`, {
    default: () => dummyEmployees,
  });
  return { employees: data, status, error, refresh };
};

export const useEmployeeDetail = (id: number) => {
  const { apiBase } = useRuntimeConfig().public;
  const found = dummyEmployees.find((e) => e.id === id);
  const { data, status, error } = useFetch<Employee | null>(`${apiBase}/employees/${id}`, {
    default: () => found ?? null,
  });
  return { employee: data, status, error };
};

export const useEmployeePerformance = (id: number) => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error } = useFetch<EmployeePerformance>(
    `${apiBase}/employees/${id}/performance`,
    {
      default: () => dummyEmployeePerformance[id] ?? { employeeId: id, daily: [], weekly: [] },
    },
  );
  return { performance: data, status, error };
};

export const useEmployeeWages = (id: number) => {
  const { apiBase } = useRuntimeConfig().public;
  const emp = dummyEmployees.find((e) => e.id === id);
  const weeklyCount = dummyEmployeePerformance[id]?.weekly.slice(-1)[0]?.count ?? 0;
  const weeklyWage = (emp?.wagePerPiece ?? 0) * weeklyCount;

  const { data, status, error } = useFetch(`${apiBase}/employees/${id}/wages`, {
    default: () => ({ weeklyWage, weeklyCount, wagePerPiece: emp?.wagePerPiece ?? 0 }),
  });
  return { wages: data, status, error };
};
