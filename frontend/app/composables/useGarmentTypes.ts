import type { GarmentType, GarmentTypeCreate, GarmentTypeUpdate } from '~/shared/types'

export const useGarmentTypes = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<GarmentType[]>(`${apiBase}/garment-types`, {
    default: () => [] as GarmentType[],
  });
  return { garmentTypes: data, status, error, refresh };
};

export const useCreateGarmentType = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createGarmentType = async (payload: GarmentTypeCreate) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await $fetch<GarmentType>(`${apiBase}/garment-types/`, {
        method: "POST",
        credentials: 'include',
        body: payload,
      });
      return { success: true, data: result };
    } catch (e: any) {
      error.value = e?.data?.detail ?? e.message ?? "Gagal membuat jenis pakaian";
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { createGarmentType, loading, error };
};

export const useUpdateGarmentType = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  const updateGarmentType = async (id: number, payload: GarmentTypeUpdate) => {
    loading.value = true;
    try {
      const result = await $fetch<GarmentType>(`${apiBase}/garment-types/${id}`, {
        method: "PUT",
        credentials: 'include',
        body: payload,
      });
      return { success: true, data: result };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { updateGarmentType, loading };
};

export const useDeleteGarmentType = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  const deleteGarmentType = async (id: number) => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/garment-types/${id}`, { 
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

  return { deleteGarmentType, loading };
};
