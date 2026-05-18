<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Icon name="heroicons:scissors" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-white">Rumah Jahit Yan</h1>
        <p class="text-primary-200 text-sm mt-1">Panel Admin</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Masuk</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              v-model="email" type="email" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="contoh@email.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              v-model="password" type="password" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              placeholder="Password"
            />
          </div>

          <p v-if="errorMsg" class="text-red-500 text-sm flex items-center gap-1">
            <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
            {{ errorMsg }}
          </p>

          <ui-app-button type="submit" class="w-full" :loading="loading">
            Masuk
          </ui-app-button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Login — Rumah Jahit Yan' })

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  try {
    await auth.login(email.value, password.value)
    router.replace('/admin/dashboard')
  } catch (e: any) {
    errorMsg.value = e?.data?.detail ?? e?.message ?? 'Login gagal'
  } finally {
    loading.value = false
  }
}
</script>
