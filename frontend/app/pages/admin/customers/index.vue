<template>
  <div>
    <div class="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-center">
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
        <div class="relative flex-1 sm:max-w-xs">
          <Icon name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="search" type="text" placeholder="Cari nama atau telepon..."
            class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white" />
        </div>
        <button @click="refresh"
          class="border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap bg-white shadow-sm">
          <Icon name="heroicons:magnifying-glass" class="w-4 h-4" />
          Cari
        </button>
      </div>
      <NuxtLink to="/admin/customers/create">
        <ui-app-button icon="heroicons:plus">Tambah Pelanggan</ui-app-button>
      </NuxtLink>
    </div>

    <template v-if="status === 'pending'">
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden p-6 animate-pulse space-y-4">
        <div class="h-10 bg-gray-200 rounded w-full" />
        <div class="h-10 bg-gray-200 rounded w-full" />
        <div class="h-10 bg-gray-200 rounded w-full" />
      </div>
    </template>

    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="customers.length === 0" class="p-8">
        <ui-app-empty-state icon="heroicons:users" title="Tidak ada pelanggan"
          description="Coba ubah pencarian atau tambah pelanggan baru" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-primary-500 border-b border-gray-100 text-sm text-center text-white">
              <th class="py-3 px-4 font-medium">Nama</th>
              <th class="py-3 px-4 font-medium">Telepon</th>
              <th class="py-3 px-4 font-medium">Total Pesanan</th>
              <th class="py-3 px-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm text-gray-700">
            <tr v-for="customer in customers" :key="customer.id"
              class="hover:bg-secondary-200 transition-colors group">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {{ customer.name.charAt(0) }}
                  </div>
                  <span class="font-medium text-gray-900">{{ customer.name }}</span>
                </div>
              </td>
              <td class="py-3 px-4">{{ customer.phone ?? '—' }}</td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="customer.total_orders > 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'">
                  {{ customer.total_orders }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center gap-2">
                  <NuxtLink :to="`/admin/customers/${customer.id}`"
                    class="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                    title="Detail">
                    <Icon name="heroicons:eye" class="w-4 h-4" />
                  </NuxtLink>
                  <button @click="openEdit(customer)"
                    class="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    title="Edit">
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button @click="confirmDelete(customer)"
                    class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Hapus">
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ui-app-confirm-modal
      :show="showForm"
      :title="editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'"
      :message="''"
      confirm-text="Simpan"
      cancel-text="Batal"
      confirm-variant="primary"
      :loading="saving"
      @confirm="saveCustomer"
      @cancel="closeForm"
    >
      <form @submit.prevent="saveCustomer" class="space-y-4">
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

        <div class="border-t pt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Ukuran Template</h4>
          <div class="grid grid-cols-2 gap-3">
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
      </form>
    </ui-app-confirm-modal>

    <ui-app-confirm-modal
      :show="showDeleteConfirm"
      title="Hapus Pelanggan"
      :message="`Yakin hapus pelanggan ${deletingCustomer?.name}? Tindakan ini tidak bisa dibatalkan.`"
      confirm-text="Hapus"
      cancel-text="Batal"
      icon="heroicons:trash"
      confirm-variant="danger"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const search = ref('')
const showForm = ref(false)
const editingCustomer = ref<Customer | null>(null)
const saving = ref(false)
const showDeleteConfirm = ref(false)
const deletingCustomer = ref<Customer | null>(null)
const deleting = ref(false)

const { customers, status, refresh } = useCustomers({ search })
const { createCustomer, loading: creating } = useCreateCustomer()
const { updateCustomer, loading: updating } = useUpdateCustomer()
const { deleteCustomer, loading: deletingCustomerLoading } = useDeleteCustomer()

const form = reactive<CustomerCreate>({
  name: '',
  phone: null,
  lingkar_badan: null,
  lingkar_pinggang: null,
  lingkar_panggul: null,
  panjang_bahu: null,
  panjang_tgn: null,
  panjang_baju: null,
  panjang_rok: null,
})

function resetForm() {
  form.name = ''
  form.phone = null
  form.lingkar_badan = null
  form.lingkar_pinggang = null
  form.lingkar_panggul = null
  form.panjang_bahu = null
  form.panjang_tgn = null
  form.panjang_baju = null
  form.panjang_rok = null
}

function openEdit(customer: Customer) {
  editingCustomer.value = customer
  form.name = customer.name
  form.phone = customer.phone ?? null
  form.lingkar_badan = customer.lingkar_badan ?? null
  form.lingkar_pinggang = customer.lingkar_pinggang ?? null
  form.lingkar_panggul = customer.lingkar_panggul ?? null
  form.panjang_bahu = customer.panjang_bahu ?? null
  form.panjang_tgn = customer.panjang_tgn ?? null
  form.panjang_baju = customer.panjang_baju ?? null
  form.panjang_rok = customer.panjang_rok ?? null
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingCustomer.value = null
  resetForm()
}

async function saveCustomer() {
  if (!form.name.trim()) return
  saving.value = true
  try {
    if (editingCustomer.value) {
      await updateCustomer(editingCustomer.value.id, form)
    } else {
      await createCustomer(form)
    }
    closeForm()
    refresh()
  } catch (e: any) {
    alert(e?.data?.detail ?? e.message ?? 'Gagal menyimpan pelanggan')
  } finally {
    saving.value = false
  }
}

function confirmDelete(customer: Customer) {
  deletingCustomer.value = customer
  showDeleteConfirm.value = true
}

async function doDelete() {
  if (!deletingCustomer.value) return
  deleting.value = true
  try {
    await deleteCustomer(deletingCustomer.value.id)
    showDeleteConfirm.value = false
    deletingCustomer.value = null
    refresh()
  } catch (e: any) {
    alert(e?.data?.detail ?? e.message ?? 'Gagal menghapus pelanggan')
  } finally {
    deleting.value = false
  }
}
</script>