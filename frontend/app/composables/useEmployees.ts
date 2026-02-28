/**
 * Composable untuk API Karyawan/Employees
 * Ganti BASE_URL dan hapus `default:` setelah backend siap.
 */
import { dummyEmployees, dummyEmployeePerformance } from "~/data/dummy";
import type { Employee, EmployeePerformance } from "~/data/dummy";

const BASE_URL = "http://localhost:8000";

export const useEmployees = () => {
  const { data, status, error, refresh } = useFetch<Employee[]>(`${BASE_URL}/employees`, {
    default: () => dummyEmployees,
  });
  return { employees: data, status, error, refresh };
};

export const useEmployeeDetail = (id: number) => {
  const found = dummyEmployees.find((e) => e.id === id);
  const { data, status, error } = useFetch<Employee>(`${BASE_URL}/employees/${id}`, {
    default: () => found ?? null,
  });
  return { employee: data, status, error };
};

export const useEmployeePerformance = (id: number) => {
  const { data, status, error } = useFetch<EmployeePerformance>(
    `${BASE_URL}/employees/${id}/performance`,
    {
      default: () => dummyEmployeePerformance[id] ?? { employeeId: id, daily: [], weekly: [] },
    },
  );
  return { performance: data, status, error };
};

export const useEmployeeWages = (id: number) => {
  const emp = dummyEmployees.find((e) => e.id === id);
  const weeklyCount = dummyEmployeePerformance[id]?.weekly.slice(-1)[0]?.count ?? 0;
  const weeklyWage = (emp?.wagePerPiece ?? 0) * weeklyCount;

  const { data, status, error } = useFetch(`${BASE_URL}/employees/${id}/wages`, {
    default: () => ({ weeklyWage, weeklyCount, wagePerPiece: emp?.wagePerPiece ?? 0 }),
  });
  return { wages: data, status, error };
};
