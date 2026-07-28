<template>
  <div>
    <!-- Skeleton -->
    <template v-if="status === 'pending'">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-gray-200 rounded w-1/4" />
        <div class="h-48 bg-gray-100 rounded-2xl" />
      </div>
    </template>

    <!-- Not Found -->
    <div v-else-if="!order" class="text-center py-20">
      <Icon name="heroicons:face-frown" class="w-14 h-14 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500">Pesanan tidak ditemukan</p>
      <NuxtLink to="/admin/orders" class="mt-4 inline-block text-primary-500 font-medium hover:underline">← Kembali</NuxtLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/admin/orders" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div class="flex-1">
          <h2 class="text-xl font-bold text-gray-900">{{ order.receiptNumber }}</h2>
          <p class="text-sm text-gray-400">{{ order.customerName }}</p>
        </div>
        <ui-app-badge :variant="paymentBadge(order.paymentStatus!).variant">
          {{ paymentBadge(order.paymentStatus!).label }}
        </ui-app-badge>
        <a v-if="order.customerPhone" :href="buildWaUrl(order.customerPhone, order.receiptNumber)" target="_blank"
          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
          WhatsApp
        </a>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">

          <!-- Info Pesanan -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Informasi Pesanan</h3>
            <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><p class="text-gray-400 text-xs mb-0.5">Pelanggan</p><p class="font-medium">{{ order.customerName }}</p></div>
              <div><p class="text-gray-400 text-xs mb-0.5">Telepon</p><p class="font-medium">{{ order.customerPhone || '-' }}</p></div>
              <div><p class="text-gray-400 text-xs mb-0.5">Masuk</p><p class="font-medium">{{ formatDate(order.createdAt) }}</p></div>
              <div>
                <p class="text-gray-400 text-xs mb-0.5">Deadline</p>
                <p class="font-medium" :class="isOverdue ? 'text-red-600' : ''">{{ formatDate(order.deadline) }}</p>
              </div>
              <div v-if="order.notes" class="col-span-2">
                <p class="text-gray-400 text-xs mb-0.5">Catatan</p>
                <p class="font-medium">{{ order.notes }}</p>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div v-for="item in order.items" :key="item.id" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div v-if="item.sketch" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <img :src="item.sketch" alt="Sketsa" class="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              <button @click="sketchPreviewUrl = item.sketch"
                class="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                Lihat Sketsa
              </button>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900">{{ item.garmentType?.name || 'Jenis Pakaian' }} <span class="text-gray-400 font-normal text-sm">x{{ item.quantity }}</span></p>
                <p v-if="item.description" class="text-sm text-gray-500 mt-0.5">{{ item.description }}</p>
              </div>
              <ui-app-badge :variant="statusBadge(item.status).variant" dot>
                {{ statusBadge(item.status).label }}
              </ui-app-badge>
            </div>

            <!-- Ukuran -->
            <div v-if="Object.keys(item.measurements!).length">
              <p class="text-xs text-gray-400 mb-2">Ukuran</p>
              <div class="flex flex-wrap gap-2">
                <div v-for="(val, key) in item.measurements" :key="key" class="bg-gray-50 rounded-xl px-3 py-2 text-sm">
                  <p class="text-xs text-gray-400">{{ measurementLabel[key] ?? key }}</p>
                  <p class="font-semibold text-gray-900">{{ val }}</p>
                </div>
              </div>
            </div>

            <!-- Log -->
            <div v-if="item.logs?.length">
              <p class="text-xs text-gray-400 mb-2">Riwayat</p>
              <div class="space-y-2">
                <div v-for="log in item.logs" :key="log.id" class="flex gap-3 text-sm">
                  <div class="w-2 h-2 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p class="font-medium text-gray-800">{{ stepLabels[log.status] ?? log.status }}</p>
                    <p class="text-xs text-gray-500">{{ log.note }}</p>
                    <p class="text-xs text-gray-400">{{ log.employeeName }} · {{ formatDate(log.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: Payment -->
        <div>
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">Pembayaran</h3>
              <button v-if="!editingPayment" @click="startEditPayment"
                class="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
                <Icon name="heroicons:pencil" class="w-4 h-4" />
              </button>
            </div>

            <!-- Read-only view -->
            <div v-if="!editingPayment" class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(order.totalPrice!) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Dibayar</span>
                <span class="font-medium text-emerald-600">{{ formatCurrency(paidDisplay) }}</span>
              </div>
              <hr class="border-gray-100" />
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Sisa</span>
                <span class="font-bold" :class="remaining > 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ formatCurrency(remaining) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div class="bg-emerald-500 h-2 rounded-full transition-all"
                  :style="{ width: `${Math.min(100, paidPercent)}%` }" />
              </div>
              <p class="text-xs text-gray-400 text-right">
                {{ Math.round(paidPercent) }}% terbayar
              </p>
            </div>

            <!-- Edit form -->
            <div v-else class="space-y-3">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Total Biaya (Rp)</label>
                <input v-model.number="editForm.totalPrice" type="number" min="0"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">DP (Rp)</label>
                <input v-model.number="editForm.dpAmount" type="number" min="0"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Status Pembayaran</label>
                <select v-model="editForm.paymentStatus"
                  class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                  <option value="unpaid">Belum Lunas</option>
                  <option value="partial">DP</option>
                  <option value="paid">Lunas</option>
                </select>
              </div>
              <div v-if="paymentError" class="text-xs text-red-600">{{ paymentError }}</div>
              <div class="flex gap-2 pt-1">
                <ui-app-button size="sm" variant="outline" @click="editingPayment = false" class="flex-1">Batal</ui-app-button>
                <ui-app-button size="sm" @click="savePayment" :loading="paymentSaving" class="flex-1">Simpan</ui-app-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Sketch Preview Modal -->
  <ui-app-modal :show="!!sketchPreviewUrl" title="Sketsa Item" size="xl" @close="sketchPreviewUrl = null">
    <div class="p-4">
      <img v-if="sketchPreviewUrl" :src="sketchPreviewUrl" alt="Sketsa" class="w-full h-auto rounded-xl" loading="lazy" />
    </div>
  </ui-app-modal>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const orderId = route.params.id as string
const { order, status, refresh } = useOrderDetail(orderId)
const { updateOrder, loading: paymentSaving, error: paymentError } = useUpdateOrder()

useSeoMeta({ title: `Detail Pesanan ${orderId} — Penjahit Yan` })

const sketchPreviewUrl = ref<string | null>(null)

const backend = useRuntimeConfig().public.apiBase

// Payment display
const paidDisplay = computed(() =>
  order.value?.paymentStatus === 'paid' ? (order.value.totalPrice ?? 0) : (order.value?.dpAmount ?? 0)
)
const remaining = computed(() =>
  order.value?.paymentStatus === 'paid' ? 0 : (order.value?.totalPrice ?? 0) - (order.value?.dpAmount ?? 0)
)
const paidPercent = computed(() => {
  const tp = order.value?.totalPrice ?? 0
  return tp > 0 ? (paidDisplay.value / tp) * 100 : 0
})

// Payment edit state
const editingPayment = ref(false)
const editForm = reactive({ totalPrice: 0, dpAmount: 0, paymentStatus: 'unpaid' as string })

const startEditPayment = () => {
  editForm.totalPrice = order.value?.totalPrice ?? 0
  editForm.dpAmount = order.value?.dpAmount ?? 0
  editForm.paymentStatus = order.value?.paymentStatus ?? 'unpaid'
  editingPayment.value = true
}

const savePayment = async () => {
  const res = await updateOrder(Number(orderId), {
    totalPrice: editForm.totalPrice,
    paymentStatus: editForm.paymentStatus as any,
  })
  if (res.success) {
    editingPayment.value = false
    refresh()
  }
}

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

const isOverdue = computed(() =>
  order.value &&
  new Date(order.value.deadline) < new Date() &&
  order.value.items?.every((i: any) => i.status !== 'done')
)

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const measurementLabel: Record<string, string> = {
  lingkar_badan: 'Lingkar badan',
  lingkar_pinggang: 'Lingkar pinggang',
  lingkar_panggul: 'Lingkar panggul',
  panjang_bahu: 'Panjang bahu',
  panjang_tgn: 'Panjang tgn',
  panjang_baju: 'Panjang baju',
  panjang_rok: 'Panjang rok',
}
</script>
