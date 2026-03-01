<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <!-- Skeleton Loading -->
    <template v-if="status === 'pending'">
      <div class="animate-pulse space-y-4">
        <div class="h-6 bg-gray-200 rounded w-1/3" />
        <div class="bg-white rounded-2xl p-6 space-y-4 border border-gray-100">
          <div class="h-4 bg-gray-200 rounded w-1/2" />
          <div class="h-4 bg-gray-200 rounded w-2/3" />
          <div class="h-4 bg-gray-200 rounded w-1/3" />
        </div>
        <div class="bg-white rounded-2xl p-6 border border-gray-100">
          <div class="flex justify-between mb-4">
            <div v-for="i in 5" :key="i" class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gray-200" />
              <div class="h-3 w-12 bg-gray-200 rounded" />
            </div>
          </div>
          <div class="h-2 bg-gray-200 rounded-full" />
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <template v-else-if="!order">
      <div class="text-center py-16">
        <Icon name="heroicons:face-frown" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Pesanan Tidak Ditemukan</h2>
        <p class="text-gray-400 mb-6">Nomor resi <strong>{{ route.params.orderId }}</strong> tidak ditemukan.</p>
        <NuxtLink to="/tracking"
          class="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-colors text-sm">
          Cari Lagi
        </NuxtLink>
      </div>
    </template>

    <!-- Order Found -->
    <template v-else>
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink to="/tracking" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="text-xl font-bold text-gray-900">Detail Pesanan</h1>
          <p class="text-xs text-gray-400">{{ order.receiptNumber }}</p>
        </div>
      </div>

      <!-- Nota Digital -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div class="bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-primary-100 text-xs font-medium">PENJAHIT YAN</p>
              <p class="text-white font-bold text-lg">{{ order.receiptNumber }}</p>
            </div>
            <ui-app-badge :variant="paymentBadge.variant" class="!text-xs">{{ paymentBadge.label }}</ui-app-badge>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-400 text-xs mb-0.5">Nama Pelanggan</p>
              <p class="font-semibold text-gray-900">{{ order.customerName }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs mb-0.5">Jenis Pakaian</p>
              <p class="font-semibold text-gray-900">{{ order.garmentType }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs mb-0.5">Tanggal Masuk</p>
              <p class="font-semibold text-gray-900">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs mb-0.5">Target Selesai</p>
              <p class="font-semibold text-gray-900" :class="isOverdue ? 'text-red-600' : ''">{{
                formatDate(order.deadline) }}</p>
            </div>
          </div>
          <hr class="border-gray-100" />
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-400 text-xs mb-0.5">Total Biaya</p>
              <p class="font-bold text-primary-700 text-base">{{ formatCurrency(order.totalPrice) }}</p>
            </div>
            <div>
              <p class="text-gray-400 text-xs mb-0.5">Sudah Dibayar</p>
              <p class="font-semibold text-gray-900">{{ formatCurrency(order.paidAmount) }}</p>
            </div>
          </div>
          <div v-if="order.description" class="bg-gray-50 rounded-lg p-3">
            <p class="text-xs text-gray-400 mb-1">Catatan</p>
            <p class="text-sm text-gray-700">{{ order.description }}</p>
          </div>
        </div>
      </div>

      <!-- Progress Tracker -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 class="font-semibold text-gray-900 mb-5">Status Pengerjaan</h2>
        <div class="relative">
          <!-- Progress line -->
          <div class="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0" />
          <div class="absolute top-5 left-5 h-0.5 bg-primary-500 z-0 transition-all duration-700"
            :style="{ width: `${progressWidth}%` }" />

          <!-- Steps -->
          <div class="relative flex justify-between">
            <div v-for="step in orderSteps" :key="step.key" class="flex flex-col items-center gap-2 z-10">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                currentStepIndex >= step.index
                  ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-200'
                  : 'bg-white border-gray-200 text-gray-400'
              ]">
                <Icon v-if="currentStepIndex > step.index" name="heroicons:check" class="w-5 h-5" />
                <Icon v-else :name="step.icon" class="w-4 h-4" />
              </div>
              <span class="text-xs font-medium text-center max-w-14 leading-tight"
                :class="currentStepIndex >= step.index ? 'text-primary-600' : 'text-gray-400'">
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Log Timeline -->
      <div v-if="order.log?.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Riwayat Pengerjaan</h2>
        <div class="relative space-y-4">
          <div v-for="(log, i) in order.log" :key="log.id" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div class="w-3 h-3 rounded-full bg-primary-400 mt-1 flex-shrink-0" />
              <div v-if="i < order.log!.length - 1" class="w-px flex-1 bg-gray-200 my-1" />
            </div>
            <div class="pb-4 flex-1">
              <p class="font-medium text-sm text-gray-900">{{ stepLabels[log.status] ?? log.status }}</p>
              <p class="text-xs text-gray-500 mb-0.5">{{ log.note }}</p>
              <p class="text-xs text-gray-400">{{ log.employeeName }} · {{ formatDateTime(log.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const orderId = route.params.orderId as string

const { order, status } = useOrderTracking(decodeURIComponent(orderId))

useSeoMeta({
  title: `Tracking ${orderId} — Penjahit Yan`,
  description: 'Lacak status pesanan jahit Anda secara real-time.',
})

const orderSteps = [
  { key: 'received', label: 'Diterima', icon: 'heroicons:inbox', index: 0 },
  { key: 'cutting', label: 'Potong', icon: 'heroicons:scissors', index: 1 },
  { key: 'sewing', label: 'Jahit', icon: 'heroicons:wrench-screwdriver', index: 2 },
  { key: 'finishing', label: 'Finishing', icon: 'heroicons:sparkles', index: 3 },
  { key: 'done', label: 'Selesai', icon: 'heroicons:check-circle', index: 4 },
]

const stepLabels: Record<string, string> = {
  received: 'Diterima', cutting: 'Dipotong', sewing: 'Dijahit', finishing: 'Finishing', done: 'Selesai',
}

const currentStepIndex = computed(() => {
  const idx = orderSteps.findIndex(s => s.key === order.value?.status)
  return idx >= 0 ? idx : 0
})

const progressWidth = computed(() => (currentStepIndex.value / (orderSteps.length - 1)) * 90)

const paymentBadge = computed(() => ({
  paid: { variant: 'success' as const, label: 'Lunas' },
  unpaid: { variant: 'danger' as const, label: 'Belum Lunas' },
  partial: { variant: 'warning' as const, label: 'DP' },
})[order.value?.paymentStatus ?? 'unpaid'])

const isOverdue = computed(() => {
  if (!order.value?.deadline) return false
  return new Date(order.value.deadline) < new Date() && order.value.status !== 'done'
})

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const formatDateTime = (d: string) => {
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
</script>
