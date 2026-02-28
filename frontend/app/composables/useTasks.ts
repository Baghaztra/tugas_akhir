/**
 * Composable untuk API Tugas Karyawan
 * Ganti BASE_URL dan hapus `default:` setelah backend siap.
 */
import { dummyMyTasks, dummyCompletedTasks } from "~/data/dummy";
import type { Task } from "~/data/dummy";

const BASE_URL = "http://localhost:8000";

export const useEmployeeTasks = (employeeId: number) => {
  const {
    data: tasks,
    status,
    error,
    refresh,
  } = useFetch<Task[]>(`${BASE_URL}/employees/${employeeId}/tasks`, {
    default: () => dummyMyTasks.filter((t) => t.assignedTo === employeeId),
  });

  const { data: completed } = useFetch<Task[]>(
    `${BASE_URL}/employees/${employeeId}/tasks/completed`,
    {
      default: () => dummyCompletedTasks,
    },
  );

  return { tasks, completed, status, error, refresh };
};

export const useTaskActions = () => {
  const loading = ref(false);

  const takeTask = async (taskId: number) => {
    loading.value = true;
    await new Promise((r) => setTimeout(r, 600));
    console.log("[DUMMY] takeTask:", taskId);
    loading.value = false;
    return { success: true };
  };

  const completeTask = async (taskId: number) => {
    loading.value = true;
    await new Promise((r) => setTimeout(r, 600));
    console.log("[DUMMY] completeTask:", taskId);
    loading.value = false;
    return { success: true };
  };

  return { takeTask, completeTask, loading };
};
