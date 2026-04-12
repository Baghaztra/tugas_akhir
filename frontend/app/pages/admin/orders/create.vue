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
              <option value="unpaid">Belum Lunas</option>
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
              <input v-model="item.garmentType" type="text" required placeholder="Cth: Kemeja Batik"
                class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const router = useRouter()
const { createOrder, error } = useCreateOrder()
const saving = ref(false)

const measurementKeys = [
  'Lingkar badan', 'Lingkar pinggang', 'Lingkar panggul', 'Panjang bahu',
  'Panjang tgn', 'Panjang baju', 'Panjang rok'
]

const makeItem = (): OrderItemCreate => ({
  garmentType: '',
  description: '',
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

const addItem = () => form.items.push(makeItem())
const removeItem = (idx: number) => form.items.splice(idx, 1)

const submit = async () => {
  saving.value = true
  const result = await createOrder(form)
  saving.value = false
  if (result.success) {
    router.push('/admin/orders')
  }
}
</script>