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
    credentials: 'include',
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
      credentials: 'include',
      default: () => null as unknown as OrderTracking,
    },
  );
  return { order: data, status, error };
};

// ─── Detail pesanan by ID (admin) ─────────────────────────────────────────────
export const useOrderDetail = (orderId: string) => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<Order>(`${apiBase}/orders/${orderId}`, {
    credentials: 'include',
    default: () => null as unknown as Order,
  });
  return { order: data, status, error, refresh };
};

// ─── Buat pesanan baru ─────────────────────────────────────────────────────────

const dataUrlToBlob = (dataUrl: string): Promise<Blob | null> =>
  fetch(dataUrl).then(r => r.blob()).catch(() => null);

export const useCreateOrder = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Kirim order baru sebagai multipart/form-data:
   *   - field `data`         : JSON string data order (tanpa sketch)
   *   - field `sketch_files` : Blob sketsa, satu per item (opsional, by index)
   *
   * @param payload  Data order lengkap. Field `sketch` pada tiap item boleh berisi
   *                 data URL (dari SketchModal) ATAU URL publik yang sudah ada.
   *                 Data URL akan dikonversi ke Blob dan dikirim sebagai file.
   */
  const createOrder = async (payload: Partial<OrderCreate>) => {
    loading.value = true;
    error.value = null;
    try {
      const fd = new FormData();

      // Pisahkan sketsa dari payload agar tidak ikut di field `data`
      const items = (payload.items ?? []).map(({ sketch: _sketch, ...rest }) => rest);
      const dataStr = JSON.stringify({ ...payload, items });
      fd.append("data", dataStr);

      const sketchBlobs = await Promise.all(
        (payload.items ?? []).map(async (item: OrderItemCreate) => {
          if (item.sketch?.startsWith("data:")) {
            return dataUrlToBlob(item.sketch);
          }
          return null;
        })
      );

      if (sketchBlobs.some(Boolean)) {
        sketchBlobs.forEach((blob: Blob | null, idx: number) => {
          fd.append("sketch_files", blob ?? new Blob([]), blob ? `sketch_item_${idx}.png` : `sketch_item_${idx}.empty`);
        });
      }

      const result = await $fetch<Order>(`${apiBase}/orders/`, {
        method: "POST",
        body: fd,
        credentials: "include",
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

// ─── Update pesanan (pembayaran, dll) ─────────────────────────────────────────
export const useUpdateOrder = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);
  const error = ref<string | null>(null);

  const updateOrder = async (orderId: number, payload: OrderUpdate) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await $fetch<Order>(`${apiBase}/orders/${orderId}`, {
        method: "PUT",
        body: payload,
        credentials: "include",
      });
      return { success: true, data: result };
    } catch (e: any) {
      error.value = e?.data?.detail ?? e.message ?? "Gagal memperbarui pesanan";
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  return { updateOrder, loading, error };
};

// ─── WhatsApp link builder ───────────────────────────────────────────────────
export const buildWaUrl = (phone: string, receiptNumber: string): string => {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  const digits = cleaned.startsWith("0")
    ? "62" + cleaned.slice(1)
    : cleaned.startsWith("+")
      ? cleaned.slice(1)
      : cleaned;
  const baseURL = process.client ? window.location.origin : "";
  const text = `Pelanggan yang terhormat, silakan cek status pesanan Anda melalui tautan berikut: ${baseURL}/tracking/${receiptNumber}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};


