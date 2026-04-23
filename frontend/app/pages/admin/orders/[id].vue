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
            <img v-if="item.sketch" :src="backend+item.sketch" alt="">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-semibold text-gray-900">{{ item.garmentType }} <span class="text-gray-400 font-normal text-sm">x{{ item.quantity }}</span></p>
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
                  <p class="text-xs text-gray-400">{{ key }}</p>
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
            <h3 class="font-semibold text-gray-900 mb-4">Pembayaran</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total</span>
                <span class="font-bold text-gray-900">{{ formatCurrency(order.totalPrice!) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Dibayar</span>
                <span class="font-medium text-emerald-600">{{ formatCurrency(order.paidAmount!) }}</span>
              </div>
              <hr class="border-gray-100" />
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Sisa</span>
                <span class="font-bold" :class="order.totalPrice! - order.paidAmount! > 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ formatCurrency(order.totalPrice! - order.paidAmount!) }}
                </span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div class="bg-emerald-500 h-2 rounded-full transition-all"
                  :style="{ width: `${Math.min(100, (order.paidAmount! / order.totalPrice!) * 100)}%` }" />
              </div>
              <p class="text-xs text-gray-400 text-right">
                {{ Math.round((order.paidAmount! / order.totalPrice!) * 100) }}% terbayar
              </p>
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

useSeoMeta({ title: `Detail Pesanan ${orderId} — Penjahit Yan` })

const backend = useRuntimeConfig().public.apiBase

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
</script>
