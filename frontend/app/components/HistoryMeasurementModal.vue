<template>
  <ui-app-modal :show="open" title="Cari dari Histori" size="lg" @close="$emit('close')">
    <div class="p-6 space-y-4">
      <!-- Search -->
      <div class="relative">
        <Icon name="heroicons:magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input ref="searchInput" v-model="query" type="text" placeholder="Ketik nama pelanggan..."
          class="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i"
          class="h-16 bg-gray-100 rounded-xl animate-pulse" />
      </div>

      <!-- Empty -->
      <div v-else-if="query.length > 0 && results.length === 0 && !loading"
        class="text-center py-10 text-sm text-gray-400">
        Tidak ditemukan data untuk <span class="font-medium text-gray-500">"{{ query }}"</span>
      </div>

      <!-- Prompt -->
      <div v-else-if="query.length === 0"
        class="text-center py-10 text-sm text-gray-400">
        Ketik nama pelanggan untuk mencari histori ukuran
      </div>

      <!-- Results -->
      <div v-else class="space-y-2 max-h-96 overflow-y-auto">
        <button v-for="(item, idx) in results" :key="idx" type="button"
          @click="select(item)"
          class="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/50 transition-colors">
          <div class="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
            <span class="font-medium text-gray-800">{{ item.customerName }}</span>
            <span class="text-gray-300">·</span>
            <span>{{ item.garmentTypeName }}</span>
            <span class="text-gray-300">·</span>
            <span>{{ formatDate(item.orderDate) }}</span>
          </div>
          <div class="text-sm font-mono text-primary-700 bg-primary-50 rounded-lg px-3 py-1.5 inline-block">
            {{ measurementString(item.measurements) }}
          </div>
        </button>
      </div>
    </div>
  </ui-app-modal>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  select: [measurements: Record<string, string>]
}>()

const query = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const { results, loading, search } = useCustomerHistory()

const measurementKeys = [
  'Lingkar badan', 'Lingkar pinggang', 'Lingkar panggul', 'Panjang bahu',
  'Panjang tgn', 'Panjang baju', 'Panjang rok'
]

const measurementString = (m: Record<string, string>) => {
  return measurementKeys.map(k => m[k]).filter(v => v != null && v !== '').join(' ')
}

const formatDate = (d: string) => {
  if (!d) return ''
  return d.slice(0, 10)
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => search(val), 300)
})

watch(() => props.open, (val) => {
  if (val) {
    query.value = ''
    results.value = []
    nextTick(() => searchInput.value?.focus())
  }
})

const select = (item: { measurements: Record<string, string> }) => {
  emit('select', item.measurements)
  emit('close')
}
</script>
