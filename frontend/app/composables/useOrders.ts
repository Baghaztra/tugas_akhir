/**
 * Composable untuk API Pesanan/Orders
 * Base URL dikonfigurasi via nuxt.config runtimeConfig atau
 * environment variable NUXT_PUBLIC_API_BASE.
 */
import type { Order, OrderTracking } from "~/data/dummy";

export const useOrders = (queryParams?: { search?: Ref<string>; status?: Ref<string> }) => {
  const { apiBase } = useRuntimeConfig().public;

  // Clean up empty params to avoid sending `?search=&status=`
  const query = computed(() => {
    const q: Record<string, any> = {};
    if (queryParams?.search?.value) q.search = queryParams.search.value;
    if (queryParams?.status?.value) q.status = queryParams.status.value;
    return q;
  });

  const { data, status, error, refresh } = useFetch<Order[]>(`${apiBase}/orders/`, {
    query,
    default: () => [] as Order[],
  });

  return { orders: data, status, error, refresh };
};

// ─── Tracking publik by receipt number ────────────────────────────────────────
export const useOrderTracking = (receipt: string) => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error } = useFetch<OrderTracking>(
    `${apiBase}/orders/tracking/${encodeURIComponent(receipt)}`,
    {
      default: () => null as unknown as OrderTracking,
    },
  );
  return { order: data, status, error };
};

// ─── Detail pesanan by ID (admin) ─────────────────────────────────────────────
export const useOrderDetail = (orderId: string) => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<Order>(`${apiBase}/orders/${orderId}`, {
    default: () => null as unknown as Order,
  });
  return { order: data, status, error, refresh };
};

// ─── Buat pesanan baru ─────────────────────────────────────────────────────────
export const useCreateOrder = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createOrder = async (payload: Partial<Order>) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await $fetch<Order>(`${apiBase}/orders/`, {
        method: "POST",
        body: payload,
      });
      return { success: true, data: result };
    } catch (e: any) {
      error.value = e?.data?.detail ?? e.message ?? "Gagal membuat pesanan";
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { createOrder, loading, error };
};

// ─── Update status pesanan ─────────────────────────────────────────────────────
export const useUpdateOrderStatus = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const updateStatus = async (
    orderId: string,
    status: Order["status"],
    note?: string,
    employeeName?: string,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      await $fetch<Order>(`${apiBase}/orders/${orderId}`, {
        method: "PUT",
        body: {
          status,
          logNote: note ?? "",
          logEmployeeName: employeeName ?? "Admin",
        },
      });
      return { success: true };
    } catch (e: any) {
      error.value = e?.data?.detail ?? e.message ?? "Gagal update status";
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { updateStatus, loading, error };
};

// ─── Hapus pesanan ─────────────────────────────────────────────────────────────
export const useDeleteOrder = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  const deleteOrder = async (orderId: string) => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/orders/${orderId}`, { method: "DELETE" });
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { deleteOrder, loading };
};
