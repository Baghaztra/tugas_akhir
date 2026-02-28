/**
 * Composable untuk API Pesanan/Orders
 * Ganti BASE_URL dan hapus `default:` setelah backend siap.
 */
import { dummyOrders } from "~/data/dummy";
import type { Order } from "~/data/dummy";

const BASE_URL = "http://localhost:8000";

export const useOrders = () => {
  const { data, status, error, refresh } = useFetch<Order[]>(`${BASE_URL}/orders`, {
    default: () => dummyOrders,
  });
  return { orders: data, status, error, refresh };
};

export const useOrderTracking = (orderId: string) => {
  const found = dummyOrders.find((o) => o.id === orderId || o.receiptNumber === orderId);
  const { data, status, error } = useFetch<Order>(`${BASE_URL}/orders/tracking/${orderId}`, {
    default: () => found ?? null,
  });
  return { order: data, status, error };
};

export const useOrderDetail = (orderId: string) => {
  const found = dummyOrders.find((o) => o.id === orderId);
  const { data, status, error, refresh } = useFetch<Order>(`${BASE_URL}/orders/${orderId}`, {
    default: () => found ?? null,
  });
  return { order: data, status, error, refresh };
};

export const useCreateOrder = () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const createOrder = async (payload: Partial<Order>) => {
    loading.value = true;
    error.value = null;
    try {
      // TODO: replace with $fetch(`${BASE_URL}/orders`, { method: 'POST', body: payload })
      await new Promise((r) => setTimeout(r, 800)); // simulate network
      console.log("[DUMMY] createOrder payload:", payload);
      return { success: true, id: "ORD-NEW" };
    } catch (e: any) {
      error.value = e.message;
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { createOrder, loading, error };
};

export const useUpdateOrderStatus = () => {
  const loading = ref(false);

  const updateStatus = async (orderId: string, status: Order["status"], note?: string) => {
    loading.value = true;
    try {
      await new Promise((r) => setTimeout(r, 600));
      console.log("[DUMMY] updateStatus:", orderId, status, note);
      return { success: true };
    } finally {
      loading.value = false;
    }
  };

  return { updateStatus, loading };
};
