<template>
  <div>
    <PageHeader title="Kelola User" description="Manajemen akun pengguna sistem" />

    <div class="flex flex-col sm:flex-row gap-3 mb-6 justify-between items-center">
      <div class="relative flex-1 sm:max-w-xs w-full">
        <Icon name="heroicons:magnifying-glass"
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" type="text" placeholder="Cari nama atau email..."
          class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white" />
      </div>
      <ui-app-button icon="heroicons:plus" @click="openAddModal">
        Tambah User
      </ui-app-button>
    </div>

    <template v-if="status === 'pending'">
      <ui-app-card>
        <div class="space-y-4">
          <ui-app-skeleton variant="card" />
        </div>
      </ui-app-card>
    </template>

    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div v-if="filteredUsers.length === 0" class="p-8">
        <ui-app-empty-state icon="heroicons:users" title="Tidak ada user"
          description="Coba ubah filter atau tambah user baru" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-primary-500 border-b border-gray-100 text-sm text-center text-white">
              <th class="py-3 px-4 font-medium">Nama</th>
              <th class="py-3 px-4 font-medium">Email</th>
              <th class="py-3 px-4 font-medium">Role</th>
              <th class="py-3 px-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 text-sm text-gray-700">
            <tr v-for="u in filteredUsers" :key="u.id"
              class="hover:bg-secondary-200 transition-colors group">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {{ u.name.charAt(0) }}
                  </div>
                  <span class="font-medium text-gray-900">{{ u.name }}</span>
                </div>
              </td>
              <td class="py-3 px-4">{{ u.email }}</td>
              <td class="py-3 px-4">
                <ui-app-badge :variant="u.is_owner ? 'warning' : 'neutral'" dot>
                  {{ u.is_owner ? 'Pemilik' : 'Staff' }}
                </ui-app-badge>
              </td>
              <td class="py-3 px-4">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEditModal(u)"
                    class="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                    title="Edit">
                    <Icon name="heroicons:pencil-square" class="w-4 h-4" />
                  </button>
                  <button @click="openDeleteModal(u)"
                    class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Hapus"
                    :disabled="u.id === auth.user?.id">
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ui-app-modal :show="isModalOpen" :title="isEditing ? 'Edit User' : 'Tambah User'" @close="closeModal">
      <form @submit.prevent="saveUser" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input v-model="formData.name" type="text" required
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Masukkan nama..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="formData.email" type="email" required
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Masukkan email..." />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Password {{ isEditing ? '(kosongkan jika tidak diubah)' : '' }}
          </label>
          <input v-model="formData.password" :type="'password'" :required="!isEditing"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Masukkan password..." />
        </div>
        <div class="flex items-center gap-2">
          <input v-model="formData.is_owner" type="checkbox" id="is_owner"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
          <label for="is_owner" class="text-sm font-medium text-gray-700">Pemilik (Owner)</label>
        </div>
        <div v-if="formError" class="text-sm text-red-600">{{ formError }}</div>
        <div class="pt-4 flex gap-3 justify-end">
          <ui-app-button variant="outline" type="button" @click="closeModal">Batal</ui-app-button>
          <ui-app-button type="submit" :loading="isSaving">Simpan</ui-app-button>
        </div>
      </form>
    </ui-app-modal>

    <ui-app-confirm-modal :show="isDeleteModalOpen" title="Hapus User"
      message="Apakah Anda yakin ingin menghapus user ini? Data yang dihapus tidak dapat dikembalikan."
      confirm-text="Ya, Hapus" cancel-text="Batal" icon="heroicons:trash" confirm-variant="danger"
      :loading="isDeleting" @confirm="confirmDelete" @cancel="closeDeleteModal" />
  </div>
</template>

<script setup lang="ts">
import type { User, UserCreate, UserUpdate } from '~/shared/types/user'

definePageMeta({ layout: 'admin' })

const auth = useAuthStore()
const { users, status, refresh } = useUsers()
const { createUser, loading: isCreating } = useCreateUser()
const { updateUser, loading: isUpdating } = useUpdateUser()
const { deleteUser } = useDeleteUser()

const search = ref('')

const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const formData = ref<{ name: string; email: string; password: string; is_owner: boolean }>({
  name: '',
  email: '',
  password: '',
  is_owner: false,
})
const formError = ref<string | null>(null)

const isDeleteModalOpen = ref(false)
const deletingUser = ref<User | null>(null)
const isDeleting = ref(false)

const isSaving = computed(() => isCreating.value || isUpdating.value)

const filteredUsers = computed(() => {
  return (users.value ?? []).filter(u => {
    const q = search.value.toLowerCase()
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })
})

const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  formData.value = { name: '', email: '', password: '', is_owner: false }
  formError.value = null
  isModalOpen.value = true
}

const openEditModal = (u: User) => {
  isEditing.value = true
  editingId.value = u.id
  formData.value = { name: u.name, email: u.email, password: '', is_owner: u.is_owner }
  formError.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const saveUser = async () => {
  formError.value = null
  if (isEditing.value && editingId.value) {
    const payload: UserUpdate = {
      name: formData.value.name,
      email: formData.value.email,
      is_owner: formData.value.is_owner,
    }
    if (formData.value.password) {
      payload.password = formData.value.password
    }
    const res = await updateUser(editingId.value, payload)
    if (res.success) {
      closeModal()
      refresh()
    } else {
      formError.value = 'Gagal mengupdate user'
    }
  } else {
    const payload: UserCreate = {
      name: formData.value.name,
      email: formData.value.email,
      password: formData.value.password,
      is_owner: formData.value.is_owner,
    }
    const res = await createUser(payload)
    if (res.success) {
      closeModal()
      refresh()
    } else {
      formError.value = 'Gagal menambah user'
    }
  }
}

const openDeleteModal = (u: User) => {
  deletingUser.value = u
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  deletingUser.value = null
}

const confirmDelete = async () => {
  if (!deletingUser.value) return
  isDeleting.value = true
  const res = await deleteUser(deletingUser.value.id)
  isDeleting.value = false
  if (res.success) {
    refresh()
    closeDeleteModal()
  } else {
    alert('Gagal menghapus user')
  }
}
</script>