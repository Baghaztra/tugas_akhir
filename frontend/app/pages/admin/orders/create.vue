<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <NuxtLink to="/admin/orders"
        class="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-gray-500">
        <Icon name="heroicons:arrow-left" class="w-4 h-4" />
      </NuxtLink>
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Pesanan Baru</h1>
        <p class="text-xs text-gray-400">Isi data pelanggan dan item pesanan</p>
      </div>
      <div class="ml-auto">
        <button type="button" @click="showHistoryModal = true"
          class="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
          Cari dari Histori
        </button>
      </div>
    </div>

    <form @submit.prevent="submit" class="space-y-6">
      <!-- Data Pelanggan -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Icon name="heroicons:user" class="w-4 h-4 text-primary-500" />
          Data Pelanggan
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Nama Pelanggan *</label>
            <input v-model="form.customerName" type="text" required placeholder="Nama lengkap"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">No. HP</label>
            <input v-model="form.customerPhone" type="text" placeholder="08xxxxxxxxxx"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Deadline *</label>
            <input v-model="form.deadline" type="date" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Status Pembayaran</label>
            <select v-model="form.paymentStatus"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
              <option value="unpaid">Belum Dibayar</option>
              <option value="partial">DP</option>
              <option value="paid">Lunas</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Total Biaya (Rp)</label>
            <input v-model.number="form.totalPrice" type="number" min="0" placeholder="0"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">DP / Uang Muka (Rp)</label>
            <input v-model.number="form.paidAmount" type="number" min="0" placeholder="0"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Catatan Pesanan</label>
          <textarea v-model="form.notes" rows="2" placeholder="Catatan tambahan untuk keseluruhan pesanan..."
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
        </div>
      </div>

      <!-- Items -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Icon name="heroicons:scissors" class="w-4 h-4 text-primary-500" />
            Item Pakaian
            <span class="bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {{ form.items.length }}
            </span>
          </h2>
          <button type="button" @click="addItem"
            class="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors">
            <Icon name="heroicons:plus-circle" class="w-4 h-4" />
            Tambah Item
          </button>
        </div>

        <div v-for="(item, idx) in form.items" :key="idx"
          class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Item #{{ idx + 1 }}</span>
            <button v-if="form.items.length > 1" type="button" @click="removeItem(idx)"
              class="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
              <Icon name="heroicons:trash" class="w-4 h-4" />
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Jenis Pakaian *</label>
              <select v-model="item.garmentTypeId" required
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
                <option :value="null" disabled>Pilih jenis pakaian</option>
                <option v-for="gt in garmentTypes" :key="gt.id" :value="gt.id">
                  {{ gt.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Jumlah</label>
              <input v-model.number="item.quantity" type="number" min="1"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Deskripsi / Detail</label>
            <textarea v-model="item.description" rows="2" placeholder="Warna, bahan, detail model..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
          </div>

          <!-- Ukuran -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-2">Ukuran</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div v-for="key in measurementKeys" :key="key">
                <label class="block text-xs text-gray-400 mb-1">{{ key }}</label>
                <input v-model="item.measurements![key]" type="text"
                  class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400" />
              </div>
            </div>
          </div>

          <!-- Atribut -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-2">Atribut</label>

            <!-- Selected tags -->
            <div v-if="itemAttributes[idx]?.length" class="flex flex-wrap gap-1.5 mb-2">
              <span v-for="attr in itemAttributes[idx]" :key="attr.id"
                class="inline-flex items-center gap-1 bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {{ attr.name }}
                <button type="button" @click="removeAttribute(idx, attr.id)"
                  class="text-primary-400 hover:text-primary-700 transition-colors ml-0.5">
                  <Icon name="heroicons:x-mark" class="w-3 h-3" />
                </button>
              </span>
            </div>

            <!-- Search input + dropdown -->
            <div class="relative" :id="'attr-dropdown-' + idx">
              <div class="relative">
                <Icon name="heroicons:magnifying-glass"
                  class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input v-model="attrSearch[idx]" type="text" placeholder="Cari atribut..." @focus="attrOpen[idx] = true"
                  @blur="onAttrBlur(idx)"
                  class="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>

              <!-- Dropdown list -->
              <Transition name="fade">
                <div v-if="attrOpen[idx]"
                  class="absolute z-20 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                  <ul class="max-h-44 overflow-y-auto divide-y divide-gray-50">
                    <li v-for="attr in filteredAttributes(idx)" :key="attr.id"
                      @mousedown.prevent="toggleAttribute(idx, attr)"
                      class="flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors"
                      :class="isSelected(idx, attr.id) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'">
                      <span>{{ attr.name }}</span>
                      <Icon v-if="isSelected(idx, attr.id)" name="heroicons:check" class="w-4 h-4 text-primary-500" />
                    </li>
                    <li v-if="filteredAttributes(idx).length === 0" class="px-4 py-3 text-sm text-gray-400 text-center">
                      Tidak ada atribut ditemukan
                    </li>
                  </ul>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Tambah di dalam card item, setelah bagian Ukuran -->
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-2">Sketsa</label>

            <!-- Preview jika sudah ada sketsa -->
            <div v-if="item.sketch" class="relative w-40">
              <img :src="item.sketch" class="rounded-xl border border-gray-200 w-full" />
              <button @click="item.sketch = ''; activeSketchIdx = null"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                ✕
              </button>
            </div>

            <!-- Tombol buka modal -->
            <button v-else type="button" @click="openSketch(idx)"
              class="flex items-center gap-2 text-xs text-primary-600 border border-dashed border-primary-300 rounded-xl px-4 py-2.5 hover:bg-primary-50 transition-colors">
              <Icon name="heroicons:pencil-square" class="w-4 h-4" />
              Tambah Sketsa
            </button>
          </div>

          <!-- Modal Sketsa -->
          <SketchModal :open="activeSketchIdx === idx" @close="activeSketchIdx = null"
            @save="(dataUrl) => { item.sketch = dataUrl; activeSketchIdx = null }" />
        </div>

        <!-- Empty state jika belum ada item (tidak mungkin terjadi tapi jaga-jaga) -->
        <div v-if="form.items.length === 0"
          class="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
          <p class="text-sm text-gray-400">Belum ada item. Klik "Tambah Item" untuk mulai.</p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
        {{ error }}
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pb-8">
        <NuxtLink to="/admin/orders">
          <ui-app-button variant="outline" type="button">Batal</ui-app-button>
        </NuxtLink>
        <ui-app-button type="submit" :loading="saving">
          <Icon name="heroicons:check" class="w-4 h-4" />
          Simpan Pesanan
        </ui-app-button>
      </div>
    </form>

    <!-- Histori Ukuran Modal -->
    <HistoryMeasurementModal :open="showHistoryModal" @close="showHistoryModal = false"
      @select="fillMeasurements" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const router = useRouter()
const { createOrder, error } = useCreateOrder()
const { garmentTypes } = useGarmentTypes()
const { attributes } = useAttributes()
const saving = ref(false)

const showHistoryModal = ref(false)
const activeSketchIdx = ref<number | null>(null)
const openSketch = (idx: number) => activeSketchIdx.value = idx

const fillMeasurements = (m: Record<string, string>) => {
  const firstItem = form.items[0]
  if (firstItem?.measurements) {
    firstItem.measurements = { ...firstItem.measurements, ...m }
  }
}

const measurementKeys = [
  'Lingkar badan', 'Lingkar pinggang', 'Lingkar panggul', 'Panjang bahu',
  'Panjang tgn', 'Panjang baju', 'Panjang rok'
]

// ── Attribute state (parallel to form.items) ───────────────────────────────
/** Selected Attribute objects per item index */
const itemAttributes = ref<Attribute[][]>([[]])
/** Search query string per item */
const attrSearch = ref<string[]>([''])
/** Whether dropdown is open per item */
const attrOpen = ref<boolean[]>([false])

/** Attributes that match the search query and are NOT yet selected */
const filteredAttributes = (idx: number) => {
  const q = attrSearch.value[idx]?.toLowerCase() ?? ''
  const selectedIds = new Set((itemAttributes.value[idx] ?? []).map(a => a.id))
  return (attributes.value ?? []).filter(
    a => !a.is_deleted && !selectedIds.has(a.id) && a.name.toLowerCase().includes(q)
  )
}

const isSelected = (idx: number, attrId: number) =>
  (itemAttributes.value[idx] ?? []).some(a => a.id === attrId)

const toggleAttribute = (idx: number, attr: Attribute) => {
  const list = itemAttributes.value[idx]
  if (!list) return
  const pos = list.findIndex(a => a.id === attr.id)
  if (pos === -1) {
    list.push(attr)
  } else {
    list.splice(pos, 1)
  }
  attrSearch.value[idx] = ''
}

const removeAttribute = (idx: number, attrId: number) => {
  const list = itemAttributes.value[idx]
  if (!list) return
  const pos = list.findIndex(a => a.id === attrId)
  if (pos !== -1) list.splice(pos, 1)
}

/** Close dropdown on blur (slight delay to allow mousedown on list items) */
const onAttrBlur = (idx: number) => {
  setTimeout(() => { if (attrOpen.value[idx] !== undefined) attrOpen.value[idx] = false }, 150)
}

const makeItem = (): OrderItemCreate => ({
  garmentTypeId: null,
  description: '',
  sketch: undefined,
  quantity: 1,
  measurements: Object.fromEntries(measurementKeys.map(k => [k, ''])),
  attributes: {}
})

const form = reactive<OrderCreate>({
  customerName: '',
  customerPhone: '',
  deadline: '',
  totalPrice: 0,
  paidAmount: 0,
  paymentStatus: 'unpaid',
  notes: '',
  items: [makeItem()]
})

const addItem = () => {
  form.items.push(makeItem())
  itemAttributes.value.push([])
  attrSearch.value.push('')
  attrOpen.value.push(false)
}

const removeItem = (idx: number) => {
  form.items.splice(idx, 1)
  itemAttributes.value.splice(idx, 1)
  attrSearch.value.splice(idx, 1)
  attrOpen.value.splice(idx, 1)
}

const submit = async () => {
  saving.value = true
  // Serialize selected attributes as JSON array of {id, name} per item
  const payload: OrderCreate = {
    ...form,
    items: form.items.map((item, idx) => ({
      ...item,
      attributes: Object.fromEntries((itemAttributes.value[idx] ?? []).map(a => [a.name, true]))
    }))
  }
  const result = await createOrder(payload)
  saving.value = false
  if (result.success && result.data) {
    router.push(`/admin/orders/${result.data.id}`)
  }
}
</script>

<style scoped>
/* Dropdown fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>