import { defineStore } from 'pinia'

interface AuthUser {
  id: number
  email: string
  name: string
  is_owner: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  function init() {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      try { user.value = JSON.parse(stored) } catch { localStorage.removeItem('auth_user') }
    }
  }

  async function login(email: string, password: string) {
    const { apiBase } = useRuntimeConfig().public
    const res = await $fetch<{ success: boolean; user: AuthUser }>(`${apiBase}/auth/login`, {
      method: 'POST',
      body: { email, password },
      credentials: 'include',
    })
    user.value = res.user
    localStorage.setItem('auth_user', JSON.stringify(res.user))
    return res.user
  }

  function logout() {
    const { apiBase } = useRuntimeConfig().public
    user.value = null
    localStorage.removeItem('auth_user')
    $fetch(`${apiBase}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
  }

  async function requestPasswordReset(email: string) {
    const { apiBase } = useRuntimeConfig().public
    return $fetch<{ success: boolean; message: string }>(`${apiBase}/auth/forgot-password`, {
      method: 'POST',
      body: { email },
      credentials: 'include',
    })
  }

  async function resetPasswordWithOtp(email: string, otp: string, newPassword: string) {
    const { apiBase } = useRuntimeConfig().public
    const res = await $fetch<{ success: boolean; user: AuthUser }>(`${apiBase}/auth/reset-password`, {
      method: 'PUT',
      body: { email, otp, new_password: newPassword },
      credentials: 'include',
    })
    user.value = res.user
    localStorage.setItem('auth_user', JSON.stringify(res.user))
    return res.user
  }

  return { user, isAuthenticated, init, login, logout, requestPasswordReset, resetPasswordWithOtp }
})
