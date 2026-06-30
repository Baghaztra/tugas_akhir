export const useUsers = () => {
  const { apiBase } = useRuntimeConfig().public
  const { data, status, error, refresh } = useFetch<User[]>(`${apiBase}/users`, {
    credentials: 'include',
    default: () => [] as User[],
  })
  return { users: data, status, error, refresh }
}

export const useUserDetail = (id: number) => {
  const { apiBase } = useRuntimeConfig().public
  const { data, status, error, refresh } = useFetch<User | null>(`${apiBase}/users/${id}`, {
    credentials: 'include',
    default: () => null,
  })
  return { user: data, status, error, refresh }
}

export const useCreateUser = () => {
  const { apiBase } = useRuntimeConfig().public
  const loading = ref(false)
  const error = ref<string | null>(null)

  const createUser = async (payload: UserCreate) => {
    loading.value = true
    error.value = null
    try {
      const result = await $fetch<User>(`${apiBase}/users/`, {
        credentials: 'include',
        method: 'POST',
        body: payload,
      })
      return { success: true, data: result }
    } catch (e: any) {
      error.value = e?.data?.detail ?? e.message ?? 'Gagal membuat user'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { createUser, loading, error }
}

export const useUpdateUser = () => {
  const { apiBase } = useRuntimeConfig().public
  const loading = ref(false)
  const error = ref<string | null>(null)

  const updateUser = async (id: number, payload: UserUpdate) => {
    loading.value = true
    error.value = null
    try {
      const result = await $fetch<User>(`${apiBase}/users/${id}`, {
        credentials: 'include',
        method: 'PUT',
        body: payload,
      })
      return { success: true, data: result }
    } catch (e: any) {
      error.value = e?.data?.detail ?? e.message ?? 'Gagal mengupdate user'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { updateUser, loading, error }
}

export const useDeleteUser = () => {
  const { apiBase } = useRuntimeConfig().public
  const loading = ref(false)
  const error = ref<string | null>(null)

  const deleteUser = async (id: number) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`${apiBase}/users/${id}`, {
        credentials: 'include',
        method: 'DELETE',
      })
      return { success: true }
    } catch (e: any) {
      error.value = e?.data?.detail ?? e.message ?? 'Gagal menghapus user'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return { deleteUser, loading, error }
}