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
      <select v-model="filterStatus"
        class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
        <option value="">Semua Status</option>
        <option value="received">Diterima</option>
        <option value="cutting">Potong</option>
        <option value="sewing">Jahit</option>
        <option value="finishing">Finishing</option>
        <option value="done">Selesai</option>
      </select>
      <ui-app-button icon="heroicons:plus" @click="showAddModal = true">Tambah Pesanan</ui-app-button>
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
              <th class="px-5 py-3 text-left">Jenis Pakaian</th>
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
              <td class="px-5 py-3 text-gray-700">{{ order.garmentType }}</td>
              <td class="px-5 py-3">
                <ui-app-badge :variant="statusBadge(order.status).variant" dot>{{ statusBadge(order.status).label
                }}</ui-app-badge>
              </td>
              <td class="px-5 py-3 text-xs" :class="isOverdue(order) ? 'text-red-600 font-medium' : 'text-gray-500'">
                {{ formatDate(order.deadline) }}
                <span v-if="isOverdue(order)" class="block text-xs text-red-500">⚠ Terlambat</span>
              </td>
              <td class="px-5 py-3 font-semibold text-gray-900">{{ formatCurrency(order.totalPrice) }}</td>
              <td class="px-5 py-3">
                <ui-app-badge :variant="paymentBadge(order.paymentStatus).variant">{{
                  paymentBadge(order.paymentStatus).label
                }}</ui-app-badge>
              </td>
              <td class="px-5 py-3">
                <NuxtLink :to="`/admin/orders/${order.id}`" class="text-primary-500 hover:text-primary-700">
                  <Icon name="heroicons:chevron-right" class="w-5 h-5" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Order Modal -->
    <ui-app-modal :show="showAddModal" title="Tambah Pesanan Baru" size="lg" prevent-close-on-click-outside
      @close="showAddModal = false">
      <form @submit.prevent="submitNewOrder" class="p-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Pelanggan *</label>
            <input v-model="form.customerName" type="text" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
            <input v-model="form.customerPhone" type="text"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Pakaian *</label>
            <input v-model="form.garmentType" type="text" required placeholder="Cth: Kemeja Batik"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
            <input v-model="form.deadline" type="date" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Total Biaya (Rp)</label>
            <input v-model="form.totalPrice" type="number" min="0"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">DP / Uang Muka (Rp)</label>
            <input v-model="form.paidAmount" type="number" min="0"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi / Catatan</label>
          <textarea v-model="form.description" rows="3"
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            placeholder="Warna, bahan, detail ukuran..." />
        </div>
        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <ui-app-button variant="outline" type="button" @click="showAddModal = false">Batal</ui-app-button>
          <ui-app-button type="submit" :loading="saving">Simpan Pesanan</ui-app-button>
        </div>
      </form>
    </ui-app-modal>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '~/data/dummy'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Manajemen Pesanan — Penjahit Yan' })

const search = ref('')
const filterStatus = ref('')

const { orders, status, refresh } = useOrders({ search, status: filterStatus })
const { createOrder, error: createError } = useCreateOrder()

const showAddModal = ref(false)
const saving = ref(false)

const form = reactive<Partial<Order>>({
  customerName: '', customerPhone: '', garmentType: '',
  deadline: '', totalPrice: 0, paidAmount: 0, description: '',
})

// Let backend handle the filtering
const filteredOrders = computed(() => orders.value ?? [])

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

const isOverdue = (o: Order) => new Date(o.deadline) < new Date() && o.status !== 'done'
const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

const submitNewOrder = async () => {
  saving.value = true
  const result = await createOrder(form)
  saving.value = false
  if (result.success) {
    showAddModal.value = false
    Object.assign(form, { customerName: '', customerPhone: '', garmentType: '', deadline: '', totalPrice: 0, paidAmount: 0, description: '' })
    await refresh()
  }
}
</script>
