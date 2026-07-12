<template>
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tambah Pelanggan</h1>
        <p class="text-gray-500 mt-1">Isi data pelanggan baru beserta ukuran template</p>
      </div>
      <NuxtLink to="/admin/customers">
        <ui-app-button variant="ghost" icon="heroicons:arrow-left">Kembali</ui-app-button>
      </NuxtLink>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <form @submit.prevent="submit" class="space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Nama *</label>
            <input v-model="form.name" type="text" required
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Telepon</label>
            <input v-model="form.phone" type="text"
              class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>

        <div class="border-t pt-5">
          <h4 class="text-sm font-medium text-gray-700 mb-4">Ukuran Template</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Lingkar Badan (cm)</label>
              <input v-model.number="form.lingkar_badan" type="number" step="0.1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Lingkar Pinggang (cm)</label>
              <input v-model.number="form.lingkar_pinggang" type="number" step="0.1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Lingkar Panggul (cm)</label>
              <input v-model.number="form.lingkar_panggul" type="number" step="0.1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Panjang Bahu (cm)</label>
              <input v-model.number="form.panjang_bahu" type="number" step="0.1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Panjang Tangan (cm)</label>
              <input v-model.number="form.panjang_tgn" type="number" step="0.1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Panjang Baju (cm)</label>
              <input v-model.number="form.panjang_baju" type="number" step="0.1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Panjang Rok (cm)</label>
              <input v-model.number="form.panjang_rok" type="number" step="0.1"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t">
          <NuxtLink to="/admin/customers">
            <ui-app-button variant="ghost">Batal</ui-app-button>
          </NuxtLink>
          <ui-app-button type="submit" :loading="saving">Simpan Pelanggan</ui-app-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const router = useRouter()
const saving = ref(false)

const { createCustomer, loading } = useCreateCustomer()

const form = reactive<CustomerCreate>({
  name: '',
  phone: '',
  lingkar_badan: null,
  lingkar_pinggang: null,
  lingkar_panggul: null,
  panjang_bahu: null,
  panjang_tgn: null,
  panjang_baju: null,
  panjang_rok: null,
})

const submit = async () => {
  if (!form.name.trim()) return
  saving.value = true
  try {
    await createCustomer(form)
    router.push('/admin/customers')
  } catch (e: any) {
    alert(e?.data?.detail ?? e.message ?? 'Gagal menambah pelanggan')
  } finally {
    saving.value = false
  }
}
</script>