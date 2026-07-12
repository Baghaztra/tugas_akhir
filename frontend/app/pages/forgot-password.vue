<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Icon name="heroicons:lock-open" class="w-8 h-8 text-white" />
        </div>
        <h1 class="text-2xl font-bold text-white">Rumah Jahit Yan</h1>
        <p class="text-primary-200 text-sm mt-1">Reset Password</p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Step 1: Send OTP -->
        <template v-if="step === 'email'">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Lupa Password</h2>
          <p class="text-sm text-gray-500 mb-6">Masukkan email terdaftar untuk menerima kode OTP.</p>

          <form @submit.prevent="handleSendOtp" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                v-model="email" type="email" required
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="contoh@email.com"
              />
            </div>

            <p v-if="errorMsg" class="text-red-500 text-sm flex items-center gap-1">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
              {{ errorMsg }}
            </p>
            <p v-if="successMsg" class="text-green-600 text-sm flex items-center gap-1">
              <Icon name="heroicons:check-circle" class="w-4 h-4" />
              {{ successMsg }}
            </p>

            <ui-app-button type="submit" class="w-full" :loading="loading">
              Kirim Kode OTP
            </ui-app-button>
          </form>
        </template>

        <!-- Step 2: Verify OTP + New Password -->
        <template v-else-if="step === 'reset'">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Masukkan Kode OTP</h2>
          <p class="text-sm text-gray-500 mb-2">
            Kode telah dikirim ke <strong>{{ email }}</strong>
          </p>
          <div class="text-sm text-gray-500 mb-6">
            <span v-if="resendCooldown > 0" class="text-primary-600">
              Kirim ulang dalam {{ resendCooldown }}s
            </span>
            <button
              v-else
              type="button"
              @click="handleResendOtp"
              :disabled="resendLoading"
              class="text-primary-600 hover:text-primary-700 underline"
            >
              <span v-if="resendLoading">Mengirim...</span>
              <span v-else>Kirim ulang OTP</span>
            </button>
          </div>

          <form @submit.prevent="handleResetPassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Kode OTP</label>
              <input
                v-model="otp" type="text" required maxlength="6"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="000000"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Password Baru</label>
              <input
                v-model="newPassword" type="password" required minlength="6"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi Password</label>
              <input
                v-model="confirmPassword" type="password" required minlength="6"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                placeholder="Ulangi password baru"
              />
            </div>

            <p v-if="errorMsg" class="text-red-500 text-sm flex items-center gap-1">
              <Icon name="heroicons:exclamation-circle" class="w-4 h-4" />
              {{ errorMsg }}
            </p>

            <ui-app-button type="submit" class="w-full" :loading="loading">
              Reset & Masuk
            </ui-app-button>
          </form>
        </template>

        <div class="mt-6 text-center">
          <NuxtLink to="/login" class="text-sm text-primary-600 hover:text-primary-700">
            <Icon name="heroicons:arrow-left" class="w-4 h-4 inline" />
            Kembali ke Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Lupa Password — Rumah Jahit Yan' })

const router = useRouter()
const auth = useAuthStore()

const step = ref<'email' | 'reset'>('email')
const email = ref('')
const otp = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const resendLoading = ref(false)
const resendCooldown = ref(0)
const resendTimer = ref<ReturnType<typeof setInterval> | null>(null)

async function handleSendOtp() {
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await auth.requestPasswordReset(email.value)
    successMsg.value = res.message
    step.value = 'reset'
    startResendCooldown()
  } catch (e: any) {
    errorMsg.value = e?.data?.detail ?? e?.message ?? 'Gagal mengirim OTP'
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = 'Konfirmasi password tidak cocok'
    return
  }
  if (newPassword.value.length < 6) {
    errorMsg.value = 'Password minimal 6 karakter'
    return
  }

  loading.value = true
  errorMsg.value = ''
  try {
    await auth.resetPasswordWithOtp(email.value, otp.value, newPassword.value)
    router.replace('/admin/dashboard')
  } catch (e: any) {
    errorMsg.value = e?.data?.detail ?? e?.message ?? 'Gagal reset password'
  } finally {
    loading.value = false
  }
}

function startResendCooldown() {
  resendCooldown.value = 60
  resendTimer.value = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0 && resendTimer.value) {
      clearInterval(resendTimer.value)
      resendTimer.value = null
    }
  }, 1000)
}

async function handleResendOtp() {
  if (resendCooldown.value > 0 || resendLoading.value) return
  resendLoading.value = true
  errorMsg.value = ''
  successMsg.value = ''
  try {
    const res = await auth.requestPasswordReset(email.value)
    successMsg.value = res.message
    startResendCooldown()
  } catch (e: any) {
    errorMsg.value = e?.data?.detail ?? e?.message ?? 'Gagal kirim ulang OTP'
  } finally {
    resendLoading.value = false
  }
}

onUnmounted(() => {
  if (resendTimer.value) clearInterval(resendTimer.value)
})
</script>
