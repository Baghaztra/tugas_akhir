/**
 * Composable untuk API Tugas Karyawan
 * Base URL dikonfigurasi via nuxt.config runtimeConfig atau
 * environment variable NUXT_PUBLIC_API_BASE.
 */
import { dummyMyTasks, dummyCompletedTasks } from "~/data/dummy";
import type { Task } from "~/data/dummy";

export const useEmployeeTasks = (employeeId: number) => {
  const { apiBase } = useRuntimeConfig().public;
  const {
    data: tasks,
    status,
    error,
    refresh,
  } = useFetch<Task[]>(`${apiBase}/employees/${employeeId}/tasks`, {
    default: () => dummyMyTasks.filter((t) => t.assignedTo === employeeId),
  });

  const { data: completed } = useFetch<Task[]>(
    `${apiBase}/employees/${employeeId}/tasks/completed`,
    {
      default: () => dummyCompletedTasks,
    },
  );

  return { tasks, completed, status, error, refresh };
};

export const useTaskActions = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  const takeTask = async (taskId: number) => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/employees/tasks/${taskId}/take`, { method: "POST" });
      return { success: true };
    } catch {
      // Dummy fallback sementara endpoint belum dibuat
      console.log("[TODO] takeTask:", taskId);
      return { success: true };
    } finally {
      loading.value = false;
    }
  };

  const completeTask = async (taskId: number) => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/employees/tasks/${taskId}/complete`, { method: "POST" });
      return { success: true };
    } catch {
      // Dummy fallback sementara endpoint belum dibuat
      console.log("[TODO] completeTask:", taskId);
      return { success: true };
    } finally {
      loading.value = false;
    }
  };

  return { takeTask, completeTask, loading };
};
