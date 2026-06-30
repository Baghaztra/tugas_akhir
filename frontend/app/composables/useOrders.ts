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

// ─── Cari histori pelanggan ────────────────────────────────────────────────────
export const useCustomerHistory = () => {
  const { apiBase } = useRuntimeConfig().public
  const results = ref<CustomerHistoryItem[]>([])
  const loading = ref(false)

  const search = async (query: string) => {
    if (!query || query.length < 1) { results.value = []; return }
    loading.value = true
    try {
      results.value = await $fetch<CustomerHistoryItem[]>(
        `${apiBase}/orders/history?search=${encodeURIComponent(query)}`,
        { credentials: 'include' }
      )
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  }

  return { results, loading, search }
}

// ─── Buat pesanan baru ─────────────────────────────────────────────────────────

/**
 * Konversi data URL (canvas/SketchModal) → Blob, lalu beri nama file.
 * Return null jika dataUrl kosong / tidak valid.
 */
function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const [, mime, b64] = match as [string, string, string];
  const bytes = atob(b64);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return new Blob([buf], { type: mime });
}

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

      // Append file sketsa per item (index harus sama dengan urutan items).
      // Item tanpa sketsa diappend sebagai Blob kosong sebagai placeholder
      // supaya index tetap sinkron dengan array items di backend.
      const sketchFiles = (payload.items ?? []).map((item: OrderItemCreate) => {
        if (item.sketch?.startsWith("data:")) {
          return dataUrlToBlob(item.sketch); // ada sketsa → konversi
        }
        return null; // tidak ada sketsa
      });

      // Hanya kirim batch file bila minimal ada satu sketsa nyata
      if (sketchFiles.some(Boolean)) {
        sketchFiles.forEach((blob: Blob | null, idx: number) => {
          if (blob) {
            fd.append("sketch_files", blob, `sketch_item_${idx}.png`);
          } else {
            // Placeholder 0-byte: backend cek size > 0 sebelum simpan
            fd.append("sketch_files", new Blob([]), `sketch_item_${idx}.empty`);
          }
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
  const text = `Kode pesanan Anda: ${receiptNumber}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
};

// ─── Hapus pesanan ─────────────────────────────────────────────────────────────
export const useDeleteOrder = () => {
  const { apiBase } = useRuntimeConfig().public;
  const loading = ref(false);

  const deleteOrder = async (orderId: string) => {
    loading.value = true;
    try {
      await $fetch(`${apiBase}/orders/${orderId}`, { 
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

  return { deleteOrder, loading };
};
