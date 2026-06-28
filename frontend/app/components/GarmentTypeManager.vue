<template>
  <ui-app-modal :show="show" title="Jenis Pakaian" size="lg" @close="$emit('close')">
    <!-- Toolbar -->
    <div class="p-6 pb-3 border-b border-gray-50">
      <div class="flex gap-3">
        <div class="relative flex-1">
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="search" type="text" placeholder="Cari jenis pakaian..."
            class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
        </div>
        <button @click="openAddModal"
          class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap shadow-sm">
          <Icon name="heroicons:plus" class="w-4 h-4" />
          Tambah
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="p-6 space-y-4 animate-pulse">
      <div v-for="i in 4" :key="i" class="h-12 bg-gray-50 rounded-lg" />
    </div>

    <!-- Empty -->
    <div v-else-if="filteredTypes.length === 0" class="py-16">
      <ui-app-empty-state icon="heroicons:tag" title="Tidak ada jenis pakaian"
        description="Coba ubah kata kunci atau tambah jenis baru." />
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
            <th class="py-3 px-6 text-left font-semibold">Nama</th>
            <th class="py-3 px-6 text-center font-semibold">Item Terkait</th>
            <th class="py-3 px-6 text-center font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="gt in filteredTypes" :key="gt.id" class="hover:bg-gray-50 transition-colors">
            <td class="py-3 px-6">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Icon name="heroicons:tag" class="w-4 h-4" />
                </div>
                <span class="font-medium text-gray-900">{{ gt.name }}</span>
              </div>
            </td>
            <td class="py-3 px-6 text-center">
              <ui-app-badge :variant="gt.item_count > 0 ? 'success' : 'neutral'">
                {{ gt.item_count }} Item
              </ui-app-badge>
            </td>
            <td class="py-3 px-6">
              <div class="flex items-center justify-center gap-2">
                <button @click="openEditModal(gt)"
                  class="p-2 text-gray-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100"
                  title="Ubah Nama">
                  <Icon name="heroicons:pencil-square" class="w-5 h-5" />
                </button>
                <button @click="openDeleteModal(gt.id)"
                  class="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  title="Hapus">
                  <Icon name="heroicons:trash" class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Form (nested overlay) -->
    <div v-if="isFormModalOpen"
      class="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm rounded-2xl">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 class="font-bold text-gray-900">{{ isEditing ? 'Edit Jenis' : 'Tambah Jenis' }}</h3>
          <button @click="closeFormModal" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="saveType" class="p-5 space-y-4">
          <div class="space-y-1.5">
            <label class="block text-sm font-semibold text-gray-700">Nama Jenis Pakaian</label>
            <input v-model="formData.name" type="text" required
              class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Misal: Kaos, Kemeja..." />
          </div>
          <div class="flex gap-3 pt-1">
            <button type="button" @click="closeFormModal"
              class="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Batal
            </button>
            <button type="submit" :disabled="isSaving"
              class="flex-[2] px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              <Icon v-if="isSaving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              {{ isEditing ? 'Simpan' : 'Tambah' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <ui-app-confirm-modal
      :show="isDeleteModalOpen"
      title="Hapus Jenis Pakaian"
      message="Apakah Anda yakin ingin menghapus jenis pakaian ini?"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      icon="heroicons:trash"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </ui-app-modal>
</template>

<script setup lang="ts">
defineProps<{ show: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const { garmentTypes, status, refresh } = useGarmentTypes()
const { createGarmentType, loading: isCreating } = useCreateGarmentType()
const { updateGarmentType, loading: isUpdating } = useUpdateGarmentType()
const { deleteGarmentType } = useDeleteGarmentType()

const search = ref('')
const isFormModalOpen = ref(false)
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
  isFormModalOpen.value = true
}

const openEditModal = (gt: { id: number; name: string }) => {
  isEditing.value = true
  editingId.value = gt.id
  formData.value = { name: gt.name }
  isFormModalOpen.value = true
}

const closeFormModal = () => {
  isFormModalOpen.value = false
}

const saveType = async () => {
  if (!formData.value.name.trim()) return

  if (isEditing.value && editingId.value) {
    const res = await updateGarmentType(editingId.value, { name: formData.value.name })
    if (res.success) {
      closeFormModal()
      refresh()
    }
  } else {
    const res = await createGarmentType({ name: formData.value.name })
    if (res.success) {
      closeFormModal()
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
