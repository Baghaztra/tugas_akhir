<template>
  <div>
    <definePageMeta :layout="'admin'" />
    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <ui-app-stat-card label="Pesanan Aktif" :value="summary?.activeOrders" icon="heroicons:clipboard-document-list" color="primary" :loading="status === 'pending'" />
      <ui-app-stat-card label="Pendapatan Minggu Ini" :value="summary?.weeklyRevenue" icon="heroicons:banknotes" color="success" :is-currency="true" :loading="status === 'pending'" />
      <ui-app-stat-card label="Karyawan Aktif" :value="summary?.activeEmployees" icon="heroicons:users" color="info" :loading="status === 'pending'" />
      <ui-app-stat-card label="Mendekati Deadline" :value="summary?.overdueOrders" icon="heroicons:exclamation-triangle" color="danger" :loading="status === 'pending'" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Trend Chart -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="heroicons:chart-bar" class="w-5 h-5 text-primary-500" />
          Tren Pesanan Mingguan
        </h2>
        <template v-if="status === 'pending'">
          <div class="animate-pulse space-y-3">
            <div class="flex items-end gap-2 h-40">
              <div v-for="i in 4" :key="i" class="flex-1 bg-gray-200 rounded-t" :style="{ height: `${40 + i * 20}px` }" />
            </div>
          </div>
        </template>
        <template v-else>
          <!-- Simple bar chart using pure CSS -->
          <div class="flex items-end gap-3 h-40 mb-3">
            <div v-for="(label, i) in trend?.labels" :key="label" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full flex gap-0.5 items-end">
                <div class="flex-1 bg-primary-400 rounded-t transition-all duration-700 hover:bg-primary-600"
                  :style="{ height: `${(trend?.incoming[i] / maxTrend) * 120}px` }" :title="`${trend?.incoming[i]} masuk`" />
                <div class="flex-1 bg-secondary-400 rounded-t transition-all duration-700 hover:bg-secondary-500"
                  :style="{ height: `${(trend?.completed[i] / maxTrend) * 120}px` }" :title="`${trend?.completed[i]} selesai`" />
              </div>
            </div>
          </div>
          <div class="flex justify-around text-xs text-gray-400 mb-2">
            <span v-for="label in trend?.labels" :key="label">{{ label }}</span>
          </div>
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-primary-400 rounded inline-block" />Masuk</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-secondary-400 rounded inline-block" />Selesai</span>
          </div>
        </template>
      </div>

      <!-- Notifications -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="heroicons:bell-alert" class="w-5 h-5 text-amber-500" />
          Notifikasi
        </h2>
        <template v-if="status === 'pending'">
          <div class="animate-pulse space-y-3">
            <div v-for="i in 3" :key="i" class="h-14 bg-gray-100 rounded-lg" />
          </div>
        </template>
        <div v-else-if="!notifications?.length" class="text-center py-8 text-gray-400 text-sm">
          <Icon name="heroicons:check-circle" class="w-10 h-10 mx-auto mb-2 text-emerald-300" />
          Tidak ada notifikasi
        </div>
        <div v-else class="space-y-3">
          <div v-for="notif in notifications" :key="notif.id"
            class="flex gap-3 p-3 rounded-xl border"
            :class="notif.type === 'urgent' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'">
            <Icon :name="notif.type === 'urgent' ? 'heroicons:fire' : 'heroicons:clock'"
              class="w-4 h-4 mt-0.5 flex-shrink-0"
              :class="notif.type === 'urgent' ? 'text-red-500' : 'text-amber-500'" />
            <p class="text-xs text-gray-700 leading-relaxed">{{ notif.message }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-semibold text-gray-900">Pesanan Terbaru</h2>
        <NuxtLink to="/admin/orders" class="text-sm text-primary-500 hover:text-primary-700 font-medium">Lihat Semua →</NuxtLink>
      </div>
      <template v-if="ordersStatus === 'pending'">
        <div class="p-6 animate-pulse space-y-3">
          <div v-for="i in 4" :key="i" class="h-10 bg-gray-100 rounded" />
        </div>
      </template>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 text-left">Resi</th>
              <th class="px-6 py-3 text-left">Pelanggan</th>
              <th class="px-6 py-3 text-left">Jenis</th>
              <th class="px-6 py-3 text-left">Status</th>
              <th class="px-6 py-3 text-left">Deadline</th>
              <th class="px-6 py-3 text-left">Pembayaran</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="order in orders?.slice(0, 5)" :key="order.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="navigateTo(`/admin/orders/${order.id}`)">
              <td class="px-6 py-3 font-mono text-xs text-gray-600">{{ order.receiptNumber }}</td>
              <td class="px-6 py-3 font-medium text-gray-900">{{ order.customerName }}</td>
              <td class="px-6 py-3 text-gray-600">{{ order.garmentType }}</td>
              <td class="px-6 py-3">
                <ui-app-badge :variant="statusBadge(order.status).variant" dot>{{ statusBadge(order.status).label }}</ui-app-badge>
              </td>
              <td class="px-6 py-3 text-gray-600 text-xs">{{ formatDate(order.deadline) }}</td>
              <td class="px-6 py-3">
                <ui-app-badge :variant="paymentBadge(order.paymentStatus).variant">{{ paymentBadge(order.paymentStatus).label }}</ui-app-badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Dashboard Admin — Penjahit Yan' })

const { summary, trend, notifications, status } = useDashboard()
const { orders, status: ordersStatus } = useOrders()

const maxTrend = computed(() => Math.max(...(trend.value?.incoming ?? [1]), ...(trend.value?.completed ?? [1])))

const statusBadge = (s: string) => ({
  received: { variant: 'info' as const, label: 'Diterima' },
  cutting: { variant: 'warning' as const, label: 'Potong' },
  sewing: { variant: 'warning' as const, label: 'Jahit' },
  finishing: { variant: 'warning' as const, label: 'Finishing' },
  done: { variant: 'success' as const, label: 'Selesai' },
}[s] ?? { variant: 'neutral' as const, label: s })

const paymentBadge = (p: string) => ({
  paid: { variant: 'success' as const, label: 'Lunas' },
  unpaid: { variant: 'danger' as const, label: 'Belum' },
  partial: { variant: 'warning' as const, label: 'DP' },
}[p] ?? { variant: 'neutral' as const, label: p })

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
</script>
