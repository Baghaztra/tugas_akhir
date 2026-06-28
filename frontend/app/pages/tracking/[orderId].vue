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
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-4" />
          <div class="h-3 bg-gray-200 rounded-full mb-3" />
          <div class="flex justify-between">
            <div v-for="i in 5" :key="i" class="h-2 w-12 bg-gray-200 rounded" />
          </div>
        </div>
        <div class="bg-white rounded-2xl p-4 border border-gray-100">
          <div class="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <template v-else-if="!order">
      <div class="text-center py-16">
        <Icon name="heroicons:face-frown" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Pesanan Tidak Ditemukan</h2>
        <p class="text-gray-400 mb-6">Nomor resi <strong>{{ route.params.orderId }}</strong> tidak ditemukan.</p>
        <div class="flex items-center justify-center gap-3">
          <NuxtLink to="/tracking"
            class="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-colors text-sm">
            Cari Lagi
          </NuxtLink>
          <NuxtLink to="/"
            class="text-gray-500 hover:text-gray-700 px-4 py-2.5 text-sm font-medium transition-colors">
            ← Kembali ke Beranda
          </NuxtLink>
        </div>
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
              <p class="text-white/80 font-medium text-sm">{{ order.receiptNumber }}</p>
            </div>
            <ui-app-badge :variant="paymentBadge.variant" class="!text-xs">{{ paymentBadge.label }}</ui-app-badge>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <p class="text-gray-400 text-xs mb-0.5">Nama Pelanggan</p>
            <p class="text-xl font-bold text-gray-900">{{ order.customerName }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
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

      <!-- Progress Bar (aggregate from items) -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-semibold text-gray-900">Status Pengerjaan</h2>
          <span class="text-sm text-gray-500">{{ completedItems }} / {{ totalItems }} item selesai</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
          <div class="h-3 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700"
            :style="{ width: `${itemProgressPercent}%` }" />
        </div>
      </div>

      <!-- Item Cards -->
      <div v-if="order.items?.length" class="space-y-3 mb-4">
        <div v-for="item in order.items" :key="item.id"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
            <Icon name="heroicons:cube" class="w-5 h-5 text-primary-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900">{{ item.garmentType?.name ?? 'Pakaian' }}</p>
            <p v-if="item.quantity && item.quantity > 1" class="text-xs text-gray-500">x{{ item.quantity }}</p>
            <div v-if="hasMeasurements(item.measurements)" class="flex flex-wrap gap-1 mt-1.5">
              <span v-for="(val, key) in item.measurements" :key="key"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                {{ key }}: {{ val }}
              </span>
            </div>
          </div>
          <div class="flex-shrink-0">
            <ui-app-badge :variant="statusBadge(item.status).variant" dot>
              {{ statusBadge(item.status).label }}
            </ui-app-badge>
          </div>
        </div>
      </div>

      <!-- Log Timeline -->
      <template v-if="order.items?.length">
        <div v-for="item in order.items" :key="item.id">
          <div v-if="item.logs?.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 class="font-semibold text-gray-900 mb-4">Riwayat Pengerjaan — {{ item.garmentType?.name ?? 'Item' }}</h2>
            <div class="relative space-y-4">
              <div v-for="(log, i) in item.logs" :key="log.id" class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-3 h-3 rounded-full bg-primary-400 mt-1 flex-shrink-0" />
                  <div v-if="i < item.logs!.length - 1" class="w-px flex-1 bg-gray-200 my-1" />
                </div>
                <div class="pb-4 flex-1">
                  <p class="font-medium text-sm text-gray-900">{{ stepLabels[log.status] ?? log.status }}</p>
                  <p class="text-xs text-gray-500 mb-0.5">{{ log.note }}</p>
                  <p class="text-xs text-gray-400">{{ log.employeeName }} · {{ formatDateTime(log.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Back to Home -->
      <div class="text-center mt-6">
        <NuxtLink to="/" class="text-sm text-primary-500 hover:text-primary-600 transition-colors font-medium">
          ← Kembali ke Beranda
        </NuxtLink>
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

const statusSteps: Record<string, number> = {
  received: 0, cutting: 1, cutted: 2, sewing: 3, sewed: 4, finishing: 5, done: 6,
}

const totalItems = computed(() => order.value?.items?.length ?? 0)

const completedItems = computed(() =>
  order.value?.items?.filter(i => i.status === 'done').length ?? 0
)

const itemProgressPercent = computed(() => {
  const items = order.value?.items
  if (!items?.length) return 0
  const maxSteps = 6
  const total = items.reduce((sum, item) => {
    const step = statusSteps[item.status]
    return sum + (step ?? 0)
  }, 0)
  return (total / (items.length * maxSteps)) * 100
})

const stepLabels: Record<string, string> = {
  received: 'Diterima', cutting: 'Dipotong', cutted: 'Terpotong',
  sewing: 'Dijahit', sewed: 'Terjahit', finishing: 'Finishing', done: 'Selesai',
}

const hasMeasurements = (m: Record<string, any> | null | undefined) =>
  m && typeof m === 'object' && Object.keys(m).length > 0

const statusBadge = (s: string) => ({
  received: { variant: 'info' as const, label: 'Diterima' },
  cutting: { variant: 'warning' as const, label: 'Potong' },
  cutted: { variant: 'warning' as const, label: 'Terpotong' },
  sewing: { variant: 'warning' as const, label: 'Jahit' },
  sewed: { variant: 'warning' as const, label: 'Terjahit' },
  finishing: { variant: 'warning' as const, label: 'Finishing' },
  done: { variant: 'success' as const, label: 'Selesai' },
}[s] ?? { variant: 'neutral' as const, label: s })

const paymentBadge = computed(() => {
  const badges: Record<string, { variant: string; label: string }> = {
    paid: { variant: 'success', label: 'Lunas' },
    unpaid: { variant: 'danger', label: 'Belum Lunas' },
    partial: { variant: 'warning', label: 'DP' },
  }
  return badges[order.value?.paymentStatus ?? 'unpaid'] ?? { variant: 'neutral', label: '-' }
})

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
