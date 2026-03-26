/**
 * Composable untuk API Profil Bisnis & Portofolio (Halaman Publik)
 * Base URL dikonfigurasi via nuxt.config runtimeConfig atau
 * environment variable NUXT_PUBLIC_API_BASE.
 */
import type { BusinessProfile, PortfolioItem } from "~/data/dummy";

// ─── Public composables ────────────────────────────────────────────────────────

export const useProfile = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<BusinessProfile>(`${apiBase}/profile/public`);
  return { business: data, status, error, refresh };
};

export const usePortfolio = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<PortfolioItem[]>(`${apiBase}/portfolio`, {
    default: () => [] as PortfolioItem[],
  });
  return { portfolio: data, status, error, refresh };
};

// ─── Admin composable (CRUD portofolio) ───────────────────────────────────────

export const usePortfolioAdmin = () => {
  const { apiBase } = useRuntimeConfig().public;

  /** Buat item portofolio baru dengan gambar (multipart/form-data). */
  const createItem = async (payload: {
    title: string;
    category: string;
    description?: string;
    image?: File;
  }): Promise<PortfolioItem> => {
    const form = new FormData();
    form.append("title", payload.title);
    form.append("category", payload.category);
    form.append("description", payload.description ?? "");
    if (payload.image) form.append("image", payload.image);

    const res = await $fetch<PortfolioItem>(`${apiBase}/portfolio`, {
      method: "POST",
      body: form,
    });
    return res;
  };

  /** Ganti gambar item yang sudah ada. */
  const updateImage = async (id: number, image: File): Promise<PortfolioItem> => {
    const form = new FormData();
    form.append("image", image);
    return $fetch<PortfolioItem>(`${apiBase}/portfolio/${id}/image`, {
      method: "POST",
      body: form,
    });
  };

  /** Update metadata (title, category, description). */
  const updateItem = async (
    id: number,
    data: Partial<Pick<PortfolioItem, "title" | "category" | "description">>,
  ): Promise<PortfolioItem> => {
    return $fetch<PortfolioItem>(`${apiBase}/portfolio/${id}`, {
      method: "PUT",
      body: data,
    });
  };

  /** Hapus item portofolio. */
  const deleteItem = async (id: number): Promise<void> => {
    await $fetch(`${apiBase}/portfolio/${id}`, { method: "DELETE" });
  };

  return { createItem, updateImage, updateItem, deleteItem };
};

// ─── Admin composable (Profil bisnis) ─────────────────────────────────────────

export const useProfileAdmin = () => {
  const { apiBase } = useRuntimeConfig().public;

  const updateProfile = async (data: Partial<BusinessProfile>): Promise<BusinessProfile> => {
    return $fetch<BusinessProfile>(`${apiBase}/profile`, {
      method: "PUT",
      body: data,
    });
  };

  return { updateProfile };
};
