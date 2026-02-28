<template>
  <div>
    <!-- Skeleton -->
    <template v-if="status === 'pending'">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-gray-200 rounded w-1/4" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="h-48 bg-gray-100 rounded-2xl" />
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else-if="!order" class="text-center py-20">
      <Icon name="heroicons:face-frown" class="w-14 h-14 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">Pesanan tidak ditemukan</p>
      <NuxtLink to="/admin/orders" class="mt-4 inline-block text-primary-500 font-medium hover:underline">← Kembali ke daftar pesanan</NuxtLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/admin/orders" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Icon name="heroicons:arrow-left" class="w-5 h-5" /></NuxtLink>
        <div class="flex-1">
          <h2 class="text-xl font-bold text-gray-900">{{ order.receiptNumber }}</h2>
          <p class="text-sm text-gray-400">{{ order.customerName }}</p>
        </div>
        <div class="flex items-center gap-2">
          <ui-app-badge :variant="statusBadge(order.status).variant" dot>{{ statusBadge(order.status).label }}</ui-app-badge>
          <ui-app-badge :variant="paymentBadge(order.paymentStatus).variant">{{ paymentBadge(order.paymentStatus).label }}</ui-app-badge>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Detail Card -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Info Pesanan -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:information-circle" class="w-5 h-5 text-primary-500" />
              Informasi Pesanan
            </h3>
            <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><p class="text-gray-400 text-xs mb-0.5">Pelanggan</p><p class="font-medium">{{ order.customerName }}</p></div>
              <div><p class="text-gray-400 text-xs mb-0.5">Telepon</p><p class="font-medium">{{ order.customerPhone }}</p></div>
              <div><p class="text-gray-400 text-xs mb-0.5">Jenis Pakaian</p><p class="font-medium">{{ order.garmentType }}</p></div>
              <div><p class="text-gray-400 text-xs mb-0.5">Karyawan</p><p class="font-medium">{{ order.assignedTo ?? '-' }}</p></div>
              <div><p class="text-gray-400 text-xs mb-0.5">Masuk</p><p class="font-medium">{{ formatDate(order.createdAt) }}</p></div>
              <div><p class="text-gray-400 text-xs mb-0.5">Deadline</p><p class="font-medium" :class="isOverdue ? 'text-red-600' : ''">{{ formatDate(order.deadline) }}</p></div>
              <div class="col-span-2"><p class="text-gray-400 text-xs mb-0.5">Deskripsi</p><p class="font-medium">{{ order.description }}</p></div>
            </div>
          </div>

          <!-- Ukuran -->
          <div v-if="Object.keys(order.measurements).length" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:arrows-right-left" class="w-5 h-5 text-primary-500" />
              Ukuran
            </h3>
            <div class="flex flex-wrap gap-3">
              <div v-for="(val, key) in order.measurements" :key="key" class="bg-gray-50 rounded-xl px-4 py-2 text-sm">
                <p class="text-xs text-gray-400">{{ key }}</p>
                <p class="font-semibold text-gray-900">{{ val }}</p>
              </div>
            </div>
          </div>

          <!-- Update Status -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:arrow-path" class="w-5 h-5 text-primary-500" />
              Update Status
            </h3>
            <div class="flex flex-wrap gap-2 mb-3">
              <button v-for="step in orderSteps" :key="step.key"
                :class="[
                  'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                  order.status === step.key
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                ]"
                @click="handleStatusUpdate(step.key)">
                {{ step.label }}
              </button>
            </div>
            <textarea v-model="statusNote" rows="2" placeholder="Catatan (opsional)..."
              class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
          </div>
        </div>

        <!-- Sidebar: Payment & Log -->
        <div class="space-y-6">
          <!-- Payment -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Pembayaran</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(order.totalPrice) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Dibayar</span>
                <span class="font-medium text-emerald-600">{{ formatCurrency(order.paidAmount) }}</span>
              </div>
              <hr class="border-gray-100" />
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Sisa</span>
                <span class="font-bold" :class="order.totalPrice - order.paidAmount > 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ formatCurrency(order.totalPrice - order.paidAmount) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div class="bg-emerald-500 h-2 rounded-full transition-all" :style="{ width: `${Math.min(100, (order.paidAmount / order.totalPrice) * 100)}%` }" />
              </div>
              <p class="text-xs text-gray-400 text-right">{{ Math.round((order.paidAmount / order.totalPrice) * 100) }}% terbayar</p>
            </div>
          </div>

          <!-- Log -->
          <div v-if="order.log?.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Riwayat</h3>
            <div class="space-y-3">
              <div v-for="log in order.log" :key="log.id" class="flex gap-3 text-sm">
                <div class="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p class="font-medium text-gray-800">{{ stepLabels[log.status] ?? log.status }}</p>
                  <p class="text-xs text-gray-500">{{ log.note }}</p>
                  <p class="text-xs text-gray-400">{{ log.employeeName }} · {{ log.createdAt }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const orderId = route.params.id as string
const { order, status } = useOrderDetail(orderId)
const { updateStatus } = useUpdateOrderStatus()

useSeoMeta({ title: `Detail Pesanan ${orderId} — Penjahit Yan` })

const statusNote = ref('')

const orderSteps = [
  { key: 'received', label: 'Diterima' },
  { key: 'cutting', label: 'Potong' },
  { key: 'sewing', label: 'Jahit' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'done', label: 'Selesai' },
]

const stepLabels: Record<string, string> = {
  received: 'Diterima', cutting: 'Potong', sewing: 'Jahit', finishing: 'Finishing', done: 'Selesai',
}

const statusBadge = (s: string) => ({
  received: { variant: 'info' as const, label: 'Diterima' },
  cutting: { variant: 'warning' as const, label: 'Potong' },
  sewing: { variant: 'warning' as const, label: 'Jahit' },
  finishing: { variant: 'warning' as const, label: 'Finishing' },
  done: { variant: 'success' as const, label: 'Selesai' },
}[s] ?? { variant: 'neutral' as const, label: s })

const paymentBadge = (p: string) => ({
  paid: { variant: 'success' as const, label: 'Lunas' },
  unpaid: { variant: 'danger' as const, label: 'Belum Lunas' },
  partial: { variant: 'warning' as const, label: 'DP' },
}[p] ?? { variant: 'neutral' as const, label: p })

const isOverdue = computed(() => order.value && new Date(order.value.deadline) < new Date() && order.value.status !== 'done')

const handleStatusUpdate = async (newStatus: string) => {
  await updateStatus(orderId, newStatus as any, statusNote.value)
  statusNote.value = ''
}

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
</script>
