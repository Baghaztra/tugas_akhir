<template>
  <div class="max-w-3xl lg:max-w-6xl mx-auto space-y-6">
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
    </div>

    <form @submit.prevent="submit" class="space-y-6">
      <!-- 2-kolom mulai dari lg (~1024px): kiri = data umum (sticky), kanan = item pesanan -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- ============ KOLOM KIRI: Data Umum ============ -->
        <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

          <!-- Customer Search / Selection -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 relative">
            <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Icon name="heroicons:user" class="w-4 h-4 text-primary-500" />
              Pelanggan
            </h2>
            <div class="relative">
              <Icon name="heroicons:magnifying-glass"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                v-model="customerSearch"
                type="text"
                placeholder="Cari pelanggan (nama atau nomor HP)..."
                class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                @focus="doSearchCustomers" @input="doSearchCustomers" />
            </div>
            <div v-if="customerResults.length > 0" class="absolute z-10 left-6 right-6 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              <div v-for="c in customerResults" :key="c.id"
                @click="selectCustomer(c)"
                class="px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                <div class="font-medium text-gray-900">{{ c.name }}</div>
                <div class="text-xs text-gray-500">{{ c.phone || '—' }}</div>
              </div>
            </div>
            <div v-if="selectedCustomer" class="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div class="font-medium text-green-800">{{ selectedCustomer.name }}</div>
                <div class="text-xs text-green-600">{{ selectedCustomer.phone || '—' }}</div>
              </div>
              <button type="button" @click="clearCustomer"
                class="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                <Icon name="heroicons:x-mark" class="w-3.5 h-3.5" />
                Pelanggan Baru
              </button>
            </div>
          </div>

          <!-- Data Pelanggan (auto-filled if customer selected) -->
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
            </div>
          </div>

          <!-- Detail Pesanan (deadline, pembayaran, catatan) -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 class="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Icon name="heroicons:clipboard-document-list" class="w-4 h-4 text-primary-500" />
              Detail Pesanan
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <label class="block text-xs font-medium text-gray-600 mb-1">Dibayar (Rp)</label>
                <input v-model.number="form.dpAmount" type="number" min="0" placeholder="0"
                  class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">Catatan Pesanan</label>
              <textarea v-model="form.notes" rows="2" placeholder="Catatan tambahan untuk keseluruhan pesanan..."
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
            </div>
          </div>
        </div>

        <!-- ============ KOLOM KANAN: Item Pesanan ============ -->
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
              <label class="text-xs font-medium text-gray-600 mb-2 block">Ukuran</label>
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

            <!-- Sketsa -->
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
      </div>

      <!-- Error (lebar penuh) -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
        {{ error }}
      </div>

      <!-- Update Ukuran Pelanggan (lebar penuh, muncul setelah pesanan tersimpan) -->
      <div v-if="hasMeasurementDiff" class="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
        <div class="flex items-start gap-2">
          <Icon name="heroicons:exclamation-triangle" class="w-4 h-4 text-amber-500 mt-0.5" />
          <div class="text-sm text-amber-700">
            Ukuran yang diisi berbeda dari data pelanggan. Perbarui ukuran pelanggan?
          </div>
        </div>
        <div class="flex gap-2">
          <ui-app-button size="sm" :loading="updatingCustomer" @click="applyMeasurementUpdate">
            <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
            Perbarui Ukuran
          </ui-app-button>
          <ui-app-button size="sm" variant="outline" @click="router.push(`/admin/orders/${updatedOrderId}`)">
            Lewati
          </ui-app-button>
        </div>
      </div>

      <!-- Actions (lebar penuh) -->
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


  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
const router = useRouter()
const { createOrder, error } = useCreateOrder()
const { garmentTypes } = useGarmentTypes()
const { attributes } = useAttributes()
const { searchCustomers } = useCustomers()
const { updateCustomer, loading: updatingCustomer } = useUpdateCustomer()

const saving = ref(false)
const hasMeasurementDiff = ref(false)
const measurementUpdatePayload = ref<Record<string, number> | null>(null)
const updatedOrderId = ref<number | null>(null)

// Customer search
const customerSearch = ref('')
const customerResults = ref<CustomerBrief[]>([])
const selectedCustomer = ref<CustomerBrief | null>(null)
const selectedCustomerData = ref<Customer | null>(null)

let searchTimeout: ReturnType<typeof setTimeout>
function doSearchCustomers() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    if (customerSearch.value.length < 2) { customerResults.value = []; return }
    customerResults.value = await searchCustomers(customerSearch.value)
  }, 300)
}

async function selectCustomer(c: CustomerBrief) {
  selectedCustomer.value = c
  form.customerName = c.name
  form.customerPhone = c.phone || ''
  form.customer_id = c.id
  customerResults.value = []
  customerSearch.value = ''
  selectedCustomerData.value = await getCustomer(c.id)
  // Isi ukuran semua item dari data pelanggan
  if (selectedCustomerData.value) {
    for (const item of form.items) {
      if (item.measurements) {
        for (const key of measurementKeys) {
          const field = customerMeasurementMap[key]!
          const val = selectedCustomerData.value[field]
          item.measurements[key] = val != null ? String(val) : ''
        }
      }
    }
  }
}

function clearCustomer() {
  selectedCustomer.value = null
  selectedCustomerData.value = null
  form.customer_id = undefined
  form.customerName = ''
  form.customerPhone = ''
  customerSearch.value = ''
}

const activeSketchIdx = ref<number | null>(null)
const openSketch = (idx: number) => activeSketchIdx.value = idx

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

// ponytail: customer field → measurement key mapping
const customerMeasurementMap: Record<string, keyof Customer> = {
  'Lingkar badan': 'lingkar_badan',
  'Lingkar pinggang': 'lingkar_pinggang',
  'Lingkar panggul': 'lingkar_panggul',
  'Panjang bahu': 'panjang_bahu',
  'Panjang tgn': 'panjang_tgn',
  'Panjang baju': 'panjang_baju',
  'Panjang rok': 'panjang_rok',
}

const makeItem = (): OrderItemCreate => {
  const measurements: Record<string, string> = {}
  for (const key of measurementKeys) {
    const field = customerMeasurementMap[key]!
    const val = selectedCustomerData.value?.[field]
    measurements[key] = val != null ? String(val) : ''
  }
  return {
    garmentTypeId: null,
    description: '',
    sketch: undefined,
    quantity: 1,
    measurements,
    attributes: {}
  }
}

const form = reactive<OrderCreate>({
  customerName: '',
  customerPhone: '',
  deadline: '',
  totalPrice: 0,
  dpAmount: 0,
  paymentStatus: 'unpaid',
  notes: '',
  items: [makeItem()]
})

// Auto-set dpAmount when paymentStatus changes
watch(() => form.paymentStatus, (val) => {
  if (val === 'paid') form.dpAmount = form.totalPrice
  else if (val === 'unpaid') form.dpAmount = 0
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
  const payload: OrderCreate = {
    ...form,
    items: form.items.map((item, idx) => ({
      ...item,
      measurements: item.measurements
        ? Object.fromEntries(
            Object.entries(item.measurements).map(([k, v]) => [customerMeasurementMap[k] ?? k, v])
          )
        : item.measurements,
      attributes: Object.fromEntries((itemAttributes.value[idx] ?? []).map(a => [a.name, true]))
    }))
  }
  const result = await createOrder(payload)
  saving.value = false
  if (result.success && result.data) {
    // Cek perbedaan ukuran dengan data pelanggan
    if (form.customer_id && selectedCustomerData.value && form.items.length > 0) {
      const firstItem = form.items[0]!
      const diff: Record<string, number> = {}
      for (const key of measurementKeys) {
        const field = customerMeasurementMap[key]!
        const current = selectedCustomerData.value[field]
        const entered = firstItem.measurements?.[key]
        const numVal = entered ? Number(entered) : null
        if (numVal != null && numVal !== 0 && numVal !== current) {
          diff[field] = numVal
        }
      }
      if (Object.keys(diff).length > 0) {
        hasMeasurementDiff.value = true
        measurementUpdatePayload.value = diff
        updatedOrderId.value = result.data.id
        return
      }
    }
    router.push(`/admin/orders/${result.data.id}`)
  }
}

const applyMeasurementUpdate = async () => {
  if (!form.customer_id || !measurementUpdatePayload.value) return
  await updateCustomer(form.customer_id, measurementUpdatePayload.value)
  hasMeasurementDiff.value = false
  router.push(`/admin/orders/${updatedOrderId.value}`)
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