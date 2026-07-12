<template>
  <ui-app-modal :show="open" title="Cari Pelanggan" size="lg" @close="$emit('close')">
    <div class="p-6 space-y-4">
      <!-- Search -->
      <div class="relative">
        <Icon name="heroicons:magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="searchQuery" type="text" placeholder="Cari nama atau nomor HP pelanggan..."
          class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white" />
      </div>

      <!-- Results -->
      <div v-if="searching" class="text-center py-8 text-gray-400">
        <Icon name="heroicons:spinner" class="w-6 h-6 mx-auto animate-spin text-primary-500" />
        <p class="mt-2 text-sm">Mencari pelanggan...</p>
      </div>

      <div v-else-if="results.length === 0 && searchQuery.length >= 2" class="text-center py-8 text-gray-400">
        Tidak ada pelanggan ditemukan
      </div>

      <div v-else-if="results.length > 0" class="max-h-80 overflow-y-auto space-y-1">
        <div v-for="c in results" :key="c.id"
          @click="selectCustomer(c)"
          class="p-4 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
          <div class="font-medium text-gray-900">{{ c.name }}</div>
          <div class="text-xs text-gray-500">{{ c.phone || '—' }}</div>
        </div>
      </div>

      <div v-else class="text-center py-8 text-gray-400">
        <Icon name="heroicons:users" class="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p class="text-sm">Ketik minimal 2 karakter untuk mencari pelanggan</p>
      </div>
    </div>
  </ui-app-modal>
</template>

<script setup lang="ts">
import { getCustomer } from '~/composables/useCustomers'
import type { CustomerBrief } from '~/shared/types/customer'

defineProps<{
  open: boolean
}>()
defineEmits<{
  close: []
  select: [measurements: Record<string, string>]
}>()

const searchQuery = ref('')
const results = ref<CustomerBrief[]>([])
const searching = ref(false)

let debounceTimer: ReturnType<typeof setTimeout>

watch(searchQuery, async (val) => {
  clearTimeout(debounceTimer)
  if (val.length < 2) {
    results.value = []
    return
  }
  searching.value = true
  debounceTimer = setTimeout(async () => {
    try {
      // Use the search endpoint
      const { $fetch } = await import('ofetch')
      const api = $fetch.create({ baseURL: '/api' })
      results.value = await api<CustomerBrief[]>('/customers/search', {
        params: { query: val, limit: 10 }
      })
    } catch (e) {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 300)
})

function selectCustomer(c: CustomerBrief) {
  // Fetch full customer details to get measurements
  getCustomer(c.id).then(customer => {
    const measurements: Record<string, string> = {}
    if (customer.lingkar_badan) measurements['Lingkar badan'] = String(customer.lingkar_badan)
    if (customer.lingkar_pinggang) measurements['Lingkar pinggang'] = String(customer.lingkar_pinggang)
    if (customer.lingkar_panggul) measurements['Lingkar panggul'] = String(customer.lingkar_panggul)
    if (customer.panjang_bahu) measurements['Panjang bahu'] = String(customer.panjang_bahu)
    if (customer.panjang_tgn) measurements['Panjang tgn'] = String(customer.panjang_tgn)
    if (customer.panjang_baju) measurements['Panjang baju'] = String(customer.panjang_baju)
    if (customer.panjang_rok) measurements['Panjang rok'] = String(customer.panjang_rok)

    emit('select', measurements)
    emit('close')
  })
}
</script>