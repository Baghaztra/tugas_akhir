export interface AdminPriorityTask {
  order_id: number;
  item_id: number;
  receiptNumber: string;
  customerName: string;
  garmentType: string;
  deadline: string;
  status: string;
  urgency_label: "red" | "yellow" | "green";
  assigned_worker_id?: number | null;
  assigned_worker_name?: string | null;
}

export interface AdminPhaseGroup {
  phase: string;
  phase_label: string;
  ready: AdminPriorityTask[];
  in_progress: AdminPriorityTask[];
  ready_count: number;
  in_progress_count: number;
}

export interface AdminWorkResponse {
  phases: AdminPhaseGroup[];
}

export const useAdminWork = () => {
  const { apiBase } = useRuntimeConfig().public;

  const { data, status, error, refresh } = useFetch<AdminWorkResponse>(
    `${apiBase}/orders/admin-work`,
    {
      credentials: 'include',
      default: () => ({ phases: [] }) as AdminWorkResponse,
    },
  );

  return { data, status, error, refresh };
};

export const useAdminTaskActions = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  const assignWorker = async (itemId: number, workerId: number, adminName: string = "Admin") => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/orders/items/${itemId}/status`, {
        method: "PUT",
        credentials: 'include',
        body: {
          worker_id: workerId,
        },
      });
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  const completeTask = async (itemId: number, workerName: string = "Admin") => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/orders/items/${itemId}/status`, {
        method: "PUT",
        credentials: 'include',
        body: {}
      });
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { assignWorker, completeTask, loading };
};
