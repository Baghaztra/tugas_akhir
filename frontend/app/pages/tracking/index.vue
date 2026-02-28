<template>
  <div class="max-w-2xl mx-auto px-4 py-10">
    <div class="text-center mb-8">
      <div class="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon name="heroicons:magnifying-glass" class="w-8 h-8" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Cek Status Pesanan</h1>
      <p class="text-gray-500 text-sm">Masukkan nomor resi untuk melihat status pesanan Anda</p>
    </div>

    <!-- Search Form -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Nomor Resi / Order ID</label>
      <div class="flex gap-3">
        <input v-model="receiptInput" type="text" placeholder="Contoh: RES-2024-001 atau ORD-001"
          class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
          @keydown.enter="searchOrder" />
        <button @click="searchOrder" class="bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-colors text-sm">
          Cari
        </button>
      </div>
    </div>

    <!-- Redirect hint -->
    <p class="text-center text-xs text-gray-400">
      Atau lihat contoh dengan nomor resi <button class="text-primary-500 underline" @click="receiptInput = 'RES-2024-001'; searchOrder()">RES-2024-001</button>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
useSeoMeta({ title: 'Cek Pesanan — Penjahit Yan', description: 'Lacak status pesanan jahit Anda.' })

const router = useRouter()
const receiptInput = ref('')

const searchOrder = () => {
  if (receiptInput.value.trim()) {
    router.push(`/tracking/${encodeURIComponent(receiptInput.value.trim())}`)
  }
}
</script>
