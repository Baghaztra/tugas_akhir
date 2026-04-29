<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-center">
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
        <div class="relative flex-1 sm:max-w-xs">
          <Icon name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="search" type="text" placeholder="Cari jenis pakaian..."
            class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white" />
        </div>
      </div>
      <button @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm">
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Tambah Jenis
      </button>
    </div>

    <!-- Table Container -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <!-- Skeleton Loading -->
      <template v-if="status === 'pending'">
        <div class="p-6 space-y-4 animate-pulse">
          <div v-for="i in 5" :key="i" class="h-12 bg-gray-50 rounded-lg w-full"></div>
        </div>
      </template>

      <!-- Empty State -->
      <div v-else-if="filteredTypes.length === 0" class="p-12">
        <ui-app-empty-state icon="heroicons:tag" title="Tidak ada jenis pakaian"
          description="Coba ubah kata kunci pencarian atau tambah jenis pakaian baru untuk memulai." />
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-primary-500 border-b border-gray-100 text-xs uppercase tracking-wider text-white">
              <th class="py-4 px-6 font-semibold">Nama Jenis Pakaian</th>
              <th class="py-4 px-6 font-semibold text-center">Jumlah Item Terkait</th>
              <th class="py-4 px-6 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm text-gray-700 font-sans">
            <tr v-for="gt in filteredTypes" :key="gt.id" class="hover:bg-secondary-50 transition-colors group">
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Icon name="heroicons:tag" class="w-4 h-4" />
                  </div>
                  <span class="font-medium text-gray-900">{{ gt.name }}</span>
                </div>
              </td>
              <td class="py-4 px-6 text-center">
                <ui-app-badge :variant="gt.item_count > 0 ? 'success' : 'neutral'" class="px-3 py-1">
                  {{ gt.item_count }} Item
                </ui-app-badge>
              </td>
              <td class="py-4 px-6">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEditModal(gt)"
                    class="p-2 text-gray-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100"
                    title="Ubah Nama">
                    <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                  </button>
                  <button @click="openDeleteModal(gt.id)"
                    class="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                    title="Hapus (Soft Delete)">
                    <Icon name="heroicons:trash" class="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div class="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 class="font-bold text-xl text-gray-900">{{ isEditing ? 'Edit Jenis' : 'Tambah Jenis' }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ isEditing ? 'Perbarui nama kategori pakaian' : 'Buat kategori pakaian baru' }}</p>
          </div>
          <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors shadow-sm">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        
        <form @submit.prevent="saveType" class="p-6 space-y-5">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700 ml-1">Nama Jenis Pakaian</label>
            <div class="relative">
              <Icon name="heroicons:tag" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input v-model="formData.name" type="text" required autofocus
                class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-gray-900 placeholder:text-gray-400"
                placeholder="Misal: Kaos, Kemeja, Celana..." />
            </div>
          </div>
          
          <div class="pt-2 flex gap-3">
            <button type="button" @click="closeModal"
              class="flex-1 px-6 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
              Batal
            </button>
            <button type="submit" :disabled="isSaving"
              class="flex-[2] px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-2xl hover:bg-primary-700 disabled:opacity-50 shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 transition-all active:scale-95">
              <Icon v-if="isSaving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              {{ isEditing ? 'Simpan Perubahan' : 'Tambah Jenis' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ui-app-confirm-modal 
      :show="isDeleteModalOpen" 
      title="Hapus Jenis Pakaian"
      message="Apakah Anda yakin ingin menghapus jenis pakaian ini? Data akan disembunyikan namun riwayat pesanan yang menggunakan jenis ini akan tetap aman."
      confirm-text="Ya, Hapus" 
      cancel-text="Batal" 
      icon="heroicons:trash" 
      :loading="isDeleting" 
      @confirm="confirmDelete"
      @cancel="closeDeleteModal" 
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { garmentTypes, status, refresh } = useGarmentTypes()
const { createGarmentType, loading: isCreating } = useCreateGarmentType()
const { updateGarmentType, loading: isUpdating } = useUpdateGarmentType()
const { deleteGarmentType } = useDeleteGarmentType()

const search = ref('')
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formData = ref({ name: '' })

const isDeleteModalOpen = ref(false)
const deletingId = ref<number | null>(null)
const isDeleting = ref(false)

const isSaving = computed(() => isCreating.value || isUpdating.value)

const filteredTypes = computed(() => {
  if (!garmentTypes.value) return []
  return garmentTypes.value.filter(gt => 
    gt.name.toLowerCase().includes(search.value.toLowerCase())
  )
})

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = { name: '' }
  isModalOpen.value = true
}

const openEditModal = (gt: any) => {
  isEditing.value = true
  editingId.value = gt.id
  formData.value = { name: gt.name }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveType = async () => {
  if (!formData.value.name.trim()) return

  if (isEditing.value && editingId.value) {
    const res = await updateGarmentType(editingId.value, {
      name: formData.value.name
    })
    if (res.success) {
      closeModal()
      refresh()
    }
  } else {
    const res = await createGarmentType({
      name: formData.value.name
    })
    if (res.success) {
      closeModal()
      refresh()
    }
  }
}

const openDeleteModal = (id: number) => {
  deletingId.value = id
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deletingId.value = null
}

const confirmDelete = async () => {
  if (!deletingId.value) return
  isDeleting.value = true
  const res = await deleteGarmentType(deletingId.value)
  isDeleting.value = false

  if (res.success) {
    refresh()
    closeDeleteModal()
  }
}
</script>
