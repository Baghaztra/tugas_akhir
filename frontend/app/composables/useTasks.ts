/**
 * Composable untuk Antrian Prioritas Karyawan
 * Endpoint: /orders/priority?stage=potong|jahit|finishing|semua
 *
 * Data diurutkan by deadline (paling dekat = index 0).
 * TODO: Endpoint backend akan diganti dengan model ML (XGBoost) di versi berikutnya.
 */

export interface PriorityOrder {
  id: number;
  receiptNumber: string;
  customerName: string;
  garmentType: string;
  deadline: string;
  status: string;
  assignedTo: string | null;
  urgency_label: "red" | "yellow" | "green";
}

export const useEmployeeTasks = (stage: Ref<string> = ref("semua")) => {
  const { apiBase } = useRuntimeConfig().public;

  const query = computed(() => ({ stage: stage.value }));

  const {
    data: tasks,
    status,
    error,
    refresh,
  } = useFetch<PriorityOrder[]>(`${apiBase}/orders/priority`, {
    query,
    default: () => [] as PriorityOrder[],
  });

  return { tasks, status, error, refresh };
};

export const useTaskActions = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  /** Ambil tugas: assign pesanan ke karyawan ini */
  const takeTask = async (orderId: number, workerName: string) => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/orders/${orderId}`, {
        method: "PUT",
        body: { assignedTo: workerName, status: "cutting" },
      });
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  /** Tandai selesai: update status pesanan ke stage berikutnya */
  const completeTask = async (orderId: number, currentStatus: string) => {
    loading.value = true;
    const nextStatus: Record<string, string> = {
      cutting: "sewing",
      sewing: "finishing",
      finishing: "done",
    };
    try {
      await $fetch(`${apiBase}/orders/${orderId}`, {
        method: "PUT",
        body: {
          status: nextStatus[currentStatus] ?? currentStatus,
          logNote: "Selesai dikerjakan",
        },
      });
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { takeTask, completeTask, loading };
};
