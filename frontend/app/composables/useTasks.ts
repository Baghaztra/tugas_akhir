/**
 * Composable untuk Antrian Prioritas Karyawan
 * Endpoint: /orders/priority?stage=potong|jahit|finishing|semua
 *
 * Data diurutkan by deadline (paling dekat = index 0).
 * TODO: Endpoint backend akan diganti dengan model ML (XGBoost) di versi berikutnya.
 */

export interface PriorityTask {
  order_id: number;
  item_id: number;
  receiptNumber: string;
  customerName: string;
  garmentType: string;
  deadline: string;
  status: string;
  urgency_label: "red" | "yellow" | "green";
}

export interface PhaseGroup {
  phase: string;
  phase_label: string;
  count: number;
  tasks: PriorityTask[];
}

export interface PriorityResponse {
  phases: PhaseGroup[];
}

/**
 * Fetch task list dikelompokkan berdasarkan phase (cutting, sewing, finishing).
 * Backend mengembalikan: { phases: [ { phase, phase_label, count, tasks } ] }
 */
export const useEmployeeTasks = (stage: Ref<string> = ref("semua")) => {
  const { apiBase } = useRuntimeConfig().public;

  const query = computed(() => ({ stage: stage.value }));

  // Jika stage = semua → response = { phases: [...] }
  // Jika stage spesifik → response = PriorityTask[]
  const {
    data: rawData,
    status,
    error,
    refresh,
  } = useFetch<PriorityResponse | PriorityTask[]>(`${apiBase}/orders/priority`, {
    query,
    default: () => ({ phases: [] }) as PriorityResponse,
  });

  /**
   * Data yang sudah di-normalize menjadi PhaseGroup[].
   * Jika backend mengembalikan flat array (stage spesifik),
   * bungkus menjadi satu phase group.
   */
  const phases = computed<PhaseGroup[]>(() => {
    const raw = rawData.value;
    if (!raw) return [];

    // Grouped response
    if ("phases" in raw && Array.isArray(raw.phases)) {
      return raw.phases;
    }

    // Flat array response (filter stage tertentu)
    if (Array.isArray(raw)) {
      const phaseLabels: Record<string, string> = {
        cutting: "Potong",
        sewing: "Jahit",
        finishing: "Finishing",
      };
      const firstStatus = raw[0]?.status ?? stage.value;
      return [
        {
          phase: firstStatus,
          phase_label: phaseLabels[firstStatus] ?? firstStatus,
          count: raw.length,
          tasks: raw,
        },
      ];
    }

    return [];
  });

  /** Flat list of all tasks across phases — for backward compat */
  const tasks = computed<PriorityTask[]>(() => phases.value.flatMap((p) => p.tasks));

  /** Total count across all phases */
  const totalCount = computed(() => phases.value.reduce((sum, p) => sum + p.count, 0));

  return { phases, tasks, totalCount, status, error, refresh };
};

export const useTaskActions = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  /** Ambil tugas: update status item ke stage saat ini (assign ke worker) */
  const takeTask = async (itemId: number, currentStatus: string, workerName: string) => {
    loading.value = true;
    const nextStatus: Record<string, string> = {
      received: "cutting",
      cutted: "sewing",
      sewed: "finishing",
    };
    try {
      await $fetch(`${apiBase}/orders/items/${itemId}/status`, {
        method: "PUT",
        params: {
          status: nextStatus[currentStatus] ?? currentStatus,
          note: `Diambil oleh ${workerName}`,
          employee: workerName,
        },
      });
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  /** Tandai selesai: update status item ke stage berikutnya */
  const completeTask = async (itemId: number) => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/orders/items/${itemId}/status`, {
        method: "PUT",
        body: {}
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

// ─── ADMIN WORK ─────────────────────────────────────────────────────────────

export interface AdminPriorityTask extends PriorityTask {
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
