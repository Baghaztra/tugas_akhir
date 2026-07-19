<template>
  <div>
    <template v-if="detailStatus === 'pending'">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-gray-200 rounded w-1/4" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="h-48 bg-gray-100 rounded-2xl" />
          <div class="lg:col-span-2 h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </template>

    <template v-else-if="detail">
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/admin/customers" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div class="flex items-center gap-3 flex-1">
          <div
            class="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-2xl uppercase">
            {{ detail.customer.name.charAt(0) }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ detail.customer.name }}</h2>
            <p class="text-sm text-gray-500">{{ detail.customer.phone ?? 'Tidak ada telepon' }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Profil</h3>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-xs text-gray-400">Nama</p>
                <p class="font-medium">{{ detail.customer.name }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Telepon</p>
                <p class="font-medium">{{ detail.customer.phone ?? '—' }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Bergabung</p>
                <p class="font-medium">{{ formatDate(detail.customer.createdAt!) }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:ruler" class="w-4 h-4 text-indigo-500" />
              Ukuran
            </h3>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-xs text-gray-400 mb-1 font-medium">Lingkar</p>
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-gray-50 rounded-lg p-2 text-center">
                    <p class="text-xs text-gray-400">Badan</p>
                    <p class="font-semibold">{{ detail.customer.lingkar_badan ?? '—' }} cm</p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2 text-center">
                    <p class="text-xs text-gray-400">Pinggang</p>
                    <p class="font-semibold">{{ detail.customer.lingkar_pinggang ?? '—' }} cm</p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2 text-center">
                    <p class="text-xs text-gray-400">Panggul</p>
                    <p class="font-semibold">{{ detail.customer.lingkar_panggul ?? '—' }} cm</p>
                  </div>
                </div>
              </div>
              <div>
                <p class="text-xs text-gray-400 mb-1 font-medium">Panjang</p>
                <div class="grid grid-cols-3 gap-2">
                  <div class="bg-gray-50 rounded-lg p-2 text-center">
                    <p class="text-xs text-gray-400">Bahu</p>
                    <p class="font-semibold">{{ detail.customer.panjang_bahu ?? '—' }} cm</p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2 text-center">
                    <p class="text-xs text-gray-400">Tangan</p>
                    <p class="font-semibold">{{ detail.customer.panjang_tgn ?? '—' }} cm</p>
                  </div>
                  <div class="bg-gray-50 rounded-lg p-2 text-center">
                    <p class="text-xs text-gray-400">Baju</p>
                    <p class="font-semibold">{{ detail.customer.panjang_baju ?? '—' }} cm</p>
                  </div>
                </div>
              </div>
              <div v-if="detail.customer.panjang_rok">
                <p class="text-xs text-gray-400 mb-1 font-medium">Rok / Celana</p>
                <div class="w-1/3 bg-gray-50 rounded-lg p-2 text-center">
                  <p class="text-xs text-gray-400">Panjang Rok</p>
                  <p class="font-semibold">{{ detail.customer.panjang_rok }} cm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:credit-card" class="w-4 h-4 text-emerald-500" />
              Ringkasan Pembayaran
            </h3>
            <div class="flex items-center gap-4">
              <div :class="[
                'flex-1 rounded-xl p-5 text-center',
                detail.total_bon > 0 ? 'bg-red-50' : 'bg-emerald-50'
              ]">
                <p class="text-xs mb-1" :class="detail.total_bon > 0 ? 'text-red-400' : 'text-emerald-400'">
                  {{ detail.total_bon > 0 ? 'Total Bon (Belum Lunas)' : 'Semua Lunas' }}
                </p>
                <p class="font-bold text-2xl" :class="detail.total_bon > 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ formatCurrency(detail.total_bon) }}
                </p>
                <p class="text-xs mt-1" :class="detail.total_bon > 0 ? 'text-red-400' : 'text-emerald-400'">
                  {{ detail.orders.length }} pesanan · {{ detail.orders.filter(o => o.payment_status !== 'paid').length }} belum lunas
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:clipboard-document-list" class="w-4 h-4 text-amber-500" />
              Riwayat Pesanan
            </h3>
            <template v-if="detail.orders.length === 0">
              <ui-app-empty-state icon="heroicons:shopping-bag" title="Belum ada pesanan"
                description="Pelanggan ini belum memiliki riwayat pesanan" />
            </template>
            <template v-else>
              <div class="space-y-2">
                <div v-for="order in detail.orders" :key="order.id"
                  class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <NuxtLink :to="`/admin/orders/${order.id}`"
                        class="font-medium text-sm text-primary-600 hover:text-primary-700 hover:underline">
                        {{ order.receipt_number }}
                      </NuxtLink>
                      <span class="text-xs text-gray-400">·</span>
                      <span class="text-sm font-medium text-gray-900">{{ formatCurrency(order.total_price) }}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-xs text-gray-400">{{ formatDate(order.created_at) }}</span>
                      <span v-if="order.dp_amount > 0" class="text-xs text-gray-400">
                        · Dibayar {{ formatCurrency(order.dp_amount) }}
                      </span>
                    </div>
                  </div>
                  <ui-app-badge :variant="paymentBadgeVariant(order.payment_status)">
                    {{ paymentLabel(order.payment_status) }}
                  </ui-app-badge>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const custId = Number(route.params.id)

const { detail, status: detailStatus } = useCustomerDetail(custId)

useSeoMeta({ title: `Pelanggan — Penjahit Yan` })

const PAYMENT_LABEL: Record<string, string> = {
  paid: 'Lunas', unpaid: 'Belum Bayar', partial: 'Angsuran',
}

const PAYMENT_VARIANT: Record<string, string> = {
  paid: 'success', unpaid: 'danger', partial: 'warning',
}

const paymentLabel = (s: string) => PAYMENT_LABEL[s] ?? s
const paymentBadgeVariant = (s: string) => (PAYMENT_VARIANT[s] ?? 'neutral') as 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
</script>