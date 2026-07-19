<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <Icon name="heroicons:magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" type="text" placeholder="Cari nama atau nomor resi..."
          class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white" />
      </div>
      <select v-model="filterPayment"
        class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
        <option value="">Semua Pembayaran</option>
        <option value="paid">Lunas</option>
        <option value="partial">DP</option>
        <option value="unpaid">Belum Lunas</option>
      </select>
      <button @click="showGarmentTypes = true"
        class="border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap bg-white shadow-sm">
        <Icon name="heroicons:tag" class="w-4 h-4" />
        Jenis Pakaian
      </button>
      <NuxtLink to="/admin/customers"
        class="border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap bg-white shadow-sm">
        <Icon name="heroicons:user-group" class="w-4 h-4" />
        Pelanggan
      </NuxtLink>
      <NuxtLink to="/admin/orders/create">
        <ui-app-button icon="heroicons:plus">Tambah Pesanan</ui-app-button>
      </NuxtLink>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <template v-if="status === 'pending'">
        <div class="p-6 animate-pulse space-y-3">
          <div v-for="i in 6" :key="i" class="h-12 bg-gray-100 rounded-lg" />
        </div>
      </template>
      <div v-else-if="filteredOrders.length === 0" class="py-16">
        <ui-app-empty-state icon="heroicons:clipboard-document-list" title="Tidak ada pesanan"
          description="Coba ubah filter atau tambah pesanan baru" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th class="px-5 py-3 text-left">Resi</th>
              <th class="px-5 py-3 text-left">Pelanggan</th>
              <th class="px-5 py-3 text-left">Status</th>
              <th class="px-5 py-3 text-left">Deadline</th>
              <th class="px-5 py-3 text-left">Total</th>
              <th class="px-5 py-3 text-left">Pembayaran</th>
              <th class="px-5 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-5 py-3 font-mono text-xs text-gray-500">{{ order.receiptNumber }}</td>
              <td class="px-5 py-3">
                <div class="font-medium text-gray-900">{{ order.customerName }}</div>
                <div class="text-xs text-gray-400">{{ order.customerPhone }}</div>
              </td>
              <td class="px-5 py-3">
                <span class="text-gray-400 text-xs">—</span>
              </td>
              <td class="px-5 py-3 text-xs" :class="isOverdue(order) ? 'text-red-600 font-medium' : 'text-gray-500'">
                {{ formatDate(order.deadline) }}
                <span v-if="isOverdue(order)" class="block text-xs text-red-500">⚠ Terlambat</span>
              </td>
              <td class="px-5 py-3 font-semibold text-gray-900">{{ formatCurrency(order.totalPrice!) }}</td>
              <td class="px-5 py-3">
                <ui-app-badge :variant="paymentBadge(order.paymentStatus!).variant">{{
                  paymentBadge(order.paymentStatus!).label
                }}</ui-app-badge>
              </td>
              <td class="px-5 py-3">
                <div class="flex items-center gap-1">
                  <a v-if="order.customerPhone" :href="buildWaUrl(order.customerPhone, order.receiptNumber)" target="_blank"
                    class="text-green-600 hover:text-green-800 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-green-50 transition-colors"
                    title="Kirim WhatsApp">
                    <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
                  </a>
                  <button v-if="order.paymentStatus !== 'paid'" @click="setLunas(order)"
                    class="text-emerald-600 hover:text-emerald-800 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-emerald-50 transition-colors"
                    title="Set Lunas">
                    <Icon name="heroicons:check-circle" class="w-4 h-4" />
                  </button>
                  <NuxtLink :to="`/admin/orders/${order.id}`" class="text-primary-500 hover:text-primary-700 w-6 h-6 flex items-center justify-center">
                    <Icon name="heroicons:chevron-right" class="w-5 h-5" />
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ui-app-confirm-modal
      :show="showConfirm"
      title="Konfirmasi Pembayaran"
      :message="`Tandai pesanan ${confirmingOrderName} sebagai LUNAS?`"
      confirm-text="Ya, Lunas"
      cancel-text="Batal"
      icon="heroicons:check-circle"
      confirm-variant="primary"
      :loading="updating"
      @confirm="confirmSetLunas"
      @cancel="showConfirm = false"
    />

    <garment-type-manager :show="showGarmentTypes" @close="showGarmentTypes = false" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const search = ref('')
const filterPayment = ref('')

const { orders, status, refresh } = useOrders({ search })
const { updateOrder, loading: updating } = useUpdateOrder()

const showConfirm = ref(false)
const confirmingOrderId = ref<number | null>(null)
const confirmingOrderName = ref('')
const showGarmentTypes = ref(false)

const filteredOrders = computed(() => {
  let result = orders.value ?? []
  if (filterPayment.value) {
    result = result.filter(o => o.paymentStatus === filterPayment.value)
  }
  return result
})

const paymentBadge = (p: string) => ({
  paid: { variant: 'success' as const, label: 'Lunas' },
  unpaid: { variant: 'danger' as const, label: 'Belum Lunas' },
  partial: { variant: 'warning' as const, label: 'DP' },
}[p] ?? { variant: 'neutral' as const, label: p })

const setLunas = (order: Order) => {
  confirmingOrderId.value = order.id
  confirmingOrderName.value = order.customerName
  showConfirm.value = true
}

const confirmSetLunas = async () => {
  if (confirmingOrderId.value === null) return
  const target = orders.value?.find(o => o.id === confirmingOrderId.value)
  const res = await updateOrder(confirmingOrderId.value, {
    paymentStatus: 'paid',
    totalPrice: target?.totalPrice ?? 0,
    paidAmount: target?.totalPrice ?? 0,
  })
  if (res.success) {
    showConfirm.value = false
    confirmingOrderId.value = null
    refresh()
  }
}

const isOverdue = (o: Order) => new Date(o.deadline) < new Date()
const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
</script>
