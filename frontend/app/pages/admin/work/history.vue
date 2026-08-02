<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Riwayat Pekerjaan</h1>
        <p class="text-sm text-gray-500 mt-1">Daftar item pesanan yang sudah selesai dikerjakan</p>
      </div>
      <ui-app-button variant="secondary" @click="navigateTo('/admin/work')">
        <Icon name="heroicons:arrow-left" class="w-4 h-4 mr-2" /> Kembali ke Papan Kerja
      </ui-app-button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
      <!-- Toolbar -->
      <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
        <div class="relative w-64">
          <Icon name="heroicons:magnifying-glass"
            class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="searchQuery" type="text" placeholder="Cari resi / pelanggan..."
            class="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
        </div>
        <div class="text-sm text-gray-500 font-medium">
          Total Selesai: <span class="text-gray-900">{{ doneItems.length }} item</span>
        </div>
      </div>

      <!-- Table Content -->
      <div class="flex-1 overflow-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-white sticky top-0 z-10 shadow-sm shadow-gray-100/50">
            <tr>
              <th class="px-6 py-4 font-semibold text-gray-900 text-xs tracking-wider uppercase">Item Selesai</th>
              <th class="px-6 py-4 font-semibold text-gray-900 text-xs tracking-wider uppercase">Pesanan</th>
              <th class="px-6 py-4 font-semibold text-gray-900 text-xs tracking-wider uppercase">Pelanggan</th>
              <th class="px-6 py-4 font-semibold text-gray-900 text-xs tracking-wider uppercase">Deadline</th>
              <th class="px-6 py-4 font-semibold text-gray-900 text-xs tracking-wider uppercase text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="status === 'pending'" v-for="i in 5" :key="i" class="animate-pulse">
              <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-28"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              <td class="px-6 py-4">
                <div class="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
              </td>
            </tr>
            <tr v-else-if="!doneItems.length" class="bg-gray-50/30">
              <td colspan="5" class="px-6 py-12 text-center">
                <Icon name="heroicons:inbox" class="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p class="text-gray-500">Tidak ada riwayat pekerjaan yang cocok.</p>
              </td>
            </tr>
            <tr v-else v-for="item in paginatedDoneItems" :key="`${item.order.id}-${item.id}`"
              class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ item.garmentType?.name }}</div>
                <div class="text-xs text-gray-500 mt-0.5">Selesai</div>
              </td>
              <td class="px-6 py-4 font-mono text-xs text-gray-500">
                {{ item.order.receiptNumber }}
              </td>
              <td class="px-6 py-4 text-gray-700">
                {{ item.order.customerName }}
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                  {{ formatDate(item.order.deadline) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <ui-app-button variant="secondary" size="sm" @click="navigateTo(`/admin/orders/${item.order.id}`)">
                  Detail Order
                </ui-app-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ui-app-paginator
      :total="doneItems.length"
      :page-size="pageSize"
      :current-page="page"
      @update:current-page="page = $event"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Riwayat Pekerjaan — Penjahit Yan' })

const searchQuery = ref('')
const page = ref(1)
const pageSize = ref(10)

const { orders, status } = useOrders({ search: searchQuery })

// Reset page when search changes
watch(searchQuery, () => { page.value = 1 })

const doneItems = computed(() => {
  if (!orders.value) return []

  const items: any[] = []

  for (const order of orders.value) {
    for (const item of order.items) {
      if (item.status === 'done') {
        items.push({
          ...item,
          order: {
            id: order.id,
            receiptNumber: order.receiptNumber,
            customerName: order.customerName,
            deadline: order.deadline
          }
        })
      }
    }
  }

  // Sort by order deadline descending
  return items.sort((a, b) => new Date(b.order.deadline).getTime() - new Date(a.order.deadline).getTime())
})

const paginatedDoneItems = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return doneItems.value.slice(start, start + pageSize.value)
})

const formatDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}
</script>
