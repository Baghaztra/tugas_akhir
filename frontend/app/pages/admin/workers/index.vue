<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-center">
      <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
        <div class="relative flex-1 sm:max-w-xs">
          <Icon name="heroicons:magnifying-glass"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input v-model="search" type="text" placeholder="Cari nama karyawan..."
            class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white" />
        </div>
        <select v-model="filterRole"
          class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
          <option value="">Semua </option>
          <option v-for="role in WORKER_ROLES" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>
      <button @click="openAddModal"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
        <Icon name="heroicons:plus" class="w-4 h-4" />
        Tambah Karyawan
      </button>
    </div>

    <!-- Skeleton -->
    <template v-if="status === 'pending'">
      <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="p-6 animate-pulse space-y-4">
          <div class="h-10 bg-gray-200 rounded w-full"></div>
          <div class="h-10 bg-gray-200 rounded w-full"></div>
          <div class="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </template>

    <!-- Employee Table -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="filteredEmployees.length === 0" class="p-8">
        <ui-app-empty-state icon="heroicons:users" title="Tidak ada karyawan"
          description="Coba ubah filter atau tambah karyawan baru" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-primary-500 border-b border-gray-100 text-sm text-center text-white">
              <th class="py-3 px-4 font-medium">Nama</th>
              <th class="py-3 px-4 font-medium">Divisi</th>
              <th class="py-3 px-4 font-medium">Status</th>
              <th class="py-3 px-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm text-gray-700">
            <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-secondary-200 transition-colors group">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {{ emp.name.charAt(0) }}
                  </div>
                  <span class="font-medium text-gray-900">{{ emp.name }}</span>
                </div>
              </td>
              <td class="py-3 px-4">{{ emp.role }}</td>
              <td class="py-3 px-4">
                <ui-app-badge :variant="emp.status === 'Working' ? 'success' : 'neutral'" dot>
                  {{ emp.status === 'Working' ? 'Bekerja' : 'Idle' }}
                </ui-app-badge>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center gap-2">
                  <NuxtLink :to="`/admin/employees/${emp.id}`"
                    class="p-1.5 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                    title="Detail">
                    <Icon name="heroicons:eye" class="w-4 h-4" />
                  </NuxtLink>
                  <button @click="openEditModal(emp)"
                    class="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    title="Edit">
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button @click="openDeleteModal(emp.id)"
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

    <!-- Modal Form -->
    <div v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-semibold text-lg text-gray-900">{{ isEditing ? 'Edit Karyawan' : 'Tambah Karyawan' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="saveEmployee" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input v-model="formData.name" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Masukkan nama..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select v-model="formData.role" required
              class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option v-for="role in WORKER_ROLES" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>
          <div class="pt-4 flex gap-3 justify-end">
            <button type="button" @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Batal</button>
            <button type="submit" :disabled="isSaving"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2">
              <Icon v-if="isSaving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <ui-app-confirm-modal :show="isDeleteModalOpen" title="Hapus Karyawan"
      message="Apakah Anda yakin ingin menghapus karyawan ini? Data yang dihapus tidak dapat dikembalikan."
      confirm-text="Ya, Hapus" cancel-text="Batal" icon="heroicons:trash" :loading="isDeleting" @confirm="confirmDelete"
      @cancel="closeDeleteModal" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const { employees, status, refresh } = useEmployees()
const { createWorker, loading: isCreating } = useCreateWorker()
const { updateWorker, loading: isUpdating } = useUpdateWorker()
const { deleteWorker } = useDeleteWorker()

const search = ref('')
const filterRole = ref<WorkerRole | ''>('')

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formData = ref<{ name: string; role: WorkerRole }>({
  name: '',
  role: 'Jahit'
})

const isDeleteModalOpen = ref(false)
const deletingId = ref<number | null>(null)
const isDeleting = ref(false)

const isSaving = computed(() => isCreating.value || isUpdating.value)

const filteredEmployees = computed(() => {
  return (employees.value ?? []).filter(e => {
    const matchSearch = !search.value || e.name.toLowerCase().includes(search.value.toLowerCase())
    const matchRole = !filterRole.value || e.role === filterRole.value
    return matchSearch && matchRole
  })
})

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = { name: '', role: 'Jahit' }
  isModalOpen.value = true
}

const openEditModal = (emp: any) => {
  isEditing.value = true
  editingId.value = emp.id
  formData.value = { name: emp.name, role: emp.role }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveEmployee = async () => {
  if (isEditing.value && editingId.value) {
    const res = await updateWorker(editingId.value, {
      name: formData.value.name,
      role: formData.value.role,
    })
    if (res.success) {
      closeModal()
      refresh()
    } else {
      alert('Gagal mengupdate karyawan')
    }
  } else {
    const res = await createWorker({
      name: formData.value.name,
      role: formData.value.role
    })
    if (res.success) {
      closeModal()
      refresh()
    } else {
      alert('Gagal menambah karyawan')
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
  const res = await deleteWorker(deletingId.value)
  isDeleting.value = false

  if (res.success) {
    refresh()
    closeDeleteModal()
  } else {
    alert('Gagal menghapus karyawan')
  }
}
</script>
