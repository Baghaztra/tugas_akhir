/**
 * Composable untuk API Karyawan/Workers
 * Endpoint: /workers (sesuai backend prefix)
 */
export const useEmployees = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<Worker[]>(`${apiBase}/workers`, {
    credentials: 'include',
    default: () => [] as Worker[],
  });
  return { employees: data, status, error, refresh };
};

export const useEmployeeDetail = (id: number) => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<Worker | null>(`${apiBase}/workers/${id}`, {
    credentials: 'include',
    default: () => null,
  });
  return { employee: data, status, error, refresh };
};

export const useEmployeePerformance = (id: number) => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error } = useFetch<WorkerPerformance>(
    `${apiBase}/workers/${id}/performance`,
    {
      credentials: 'include',
      default: () => ({ worker_id: id, worker_name: "", performance_score: 0, total_finished: 0, daily: [] }),
    },
  );
  return { performance: data, status, error };
};

export const useEmployeeWages = (id: number) => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error } = useFetch<WorkerWage>(
    `${apiBase}/workers/${id}/wages`,
    {
      credentials: 'include',
      default: () => ({ worker_id: id, worker_name: "", period: "", total_finished: 0, wage: 0 }),
    },
  );
  return { wages: data, status, error };
};

export const useCreateWorker = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createWorker = async (payload: Partial<Worker>) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await $fetch<Worker>(`${apiBase}/workers/`, {
        credentials: 'include',
        method: "POST",
        body: payload,
      });
      return { success: true, data: result };
    } catch (e: any) {
      error.value = e?.data?.detail ?? e.message ?? "Gagal membuat worker";
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { createWorker, loading, error };
};

export const useUpdateWorker = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  const updateWorker = async (id: number, payload: Partial<Worker>) => {
    loading.value = true;
    try {
      const result = await $fetch<Worker>(`${apiBase}/workers/${id}`, {
        credentials: 'include',
        method: "PUT",
        body: payload,
      });
      return { success: true, data: result };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { updateWorker, loading };
};

export const useDeleteWorker = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  const deleteWorker = async (id: number) => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/workers/${id}`, { 
        credentials: 'include',
        method: "DELETE" 
      });
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { deleteWorker, loading };
};
