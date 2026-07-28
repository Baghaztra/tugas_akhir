export const useProfile = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<BusinessProfileRead>(`${apiBase}/profile/public`);
  return { business: data, status, error, refresh };
};

export const usePortfolio = () => {
  const { apiBase } = useRuntimeConfig().public;
  const { data, status, error, refresh } = useFetch<PortfolioItemRead[]>(`${apiBase}/portfolio/`, {
    default: () => [] as PortfolioItemRead[],
  });
  return { portfolio: data, status, error, refresh };
};

// ─── Admin composable (CRUD portofolio) ───────────────────────────────────────

export const usePortfolioAdmin = () => {
  const { apiBase } = useRuntimeConfig().public;

  /** Preview gambar dari Instagram post (tanpa simpan ke DB). */
  const previewInstagram = async (instagramUrl: string): Promise<{ thumbnail_url: string }> => {
    const form = new FormData();
    form.append("instagram_url", instagramUrl);
    return $fetch<{ thumbnail_url: string }>(`${apiBase}/portfolio/preview`, {
      method: "POST",
      body: form,
      credentials: 'include',
    });
  };

  /** Buat item portofolio baru (opsional: gambar atau thumbnail_url Instagram). */
  const createItem = async (payload: {
    title: string;
    category: string;
    description?: string;
    image?: File;
    thumbnail_url?: string;
  }): Promise<PortfolioItemRead> => {
    const form = new FormData();
    form.append("title", payload.title);
    form.append("category", payload.category);
    form.append("description", payload.description ?? "");
    if (payload.thumbnail_url) form.append("thumbnail_url", payload.thumbnail_url);
    else if (payload.image) form.append("image", payload.image);

    const res = await $fetch<PortfolioItemRead>(`${apiBase}/portfolio/`, {
      method: "POST",
      body: form,
      credentials: 'include',
    });
    return res;
  };

  /** Ganti gambar item yang sudah ada. */
  const updateImage = async (id: number, image: File): Promise<PortfolioItemRead> => {
    const form = new FormData();
    form.append("image", image);
    return $fetch<PortfolioItemRead>(`${apiBase}/portfolio/${id}/image`, {
      method: "POST",
      body: form,
      credentials: 'include',
    });
  };

  /** Update metadata (title, category, description). */
  const updateItem = async (
    id: number,
    data: Partial<Pick<PortfolioItemUpdate, "title" | "category" | "description">>,
  ): Promise<PortfolioItemRead> => {
    return $fetch<PortfolioItemRead>(`${apiBase}/portfolio/${id}`, {
      method: "PUT",
      body: data,
      credentials: 'include',
    });
  };

  /** Hapus item portofolio. */
  const deleteItem = async (id: number): Promise<void> => {
    await $fetch(`${apiBase}/portfolio/${id}`, { method: "DELETE", credentials: 'include' });
  };

  return { previewInstagram, createItem, updateImage, updateItem, deleteItem };
};

// ─── Admin composable (Profil bisnis) ─────────────────────────────────────────

export const useProfileAdmin = () => {
  const { apiBase } = useRuntimeConfig().public;

  const updateProfile = async (data: Partial<BusinessProfileUpdate>): Promise<BusinessProfileUpdate> => {
    return $fetch<BusinessProfileRead>(`${apiBase}/profile/`, {
      method: "PUT",
      body: data,
      credentials: 'include',
    });
  };

  return { updateProfile };
};
