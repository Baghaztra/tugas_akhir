<template>
  <div class="mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- LEFT: Informasi Usaha (2 col) -->
      <div class="lg:col-span-2 space-y-3">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="heroicons:building-storefront" class="w-5 h-5 text-primary-500" />
              Informasi Usaha
            </h3>
            <ui-app-button v-if="!editing" variant="outline" size="sm" icon="heroicons:pencil"
              @click="editing = true">Edit</ui-app-button>
            <div v-else class="flex gap-2">
              <ui-app-button variant="outline" size="sm" @click="cancelEdit">Batal</ui-app-button>
              <ui-app-button size="sm" :loading="saving" @click="saveSettings">Simpan</ui-app-button>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-400 mb-1.5 font-medium">Nama Usaha</label>
              <input v-model="form.name" :disabled="!editing"
                class="w-full border rounded-xl px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                :class="editing ? 'border-gray-200' : 'border-transparent'" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1.5 font-medium">Slogan</label>
              <input v-model="form.slogan" :disabled="!editing"
                class="w-full border rounded-xl px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                :class="editing ? 'border-gray-200' : 'border-transparent'" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-xs text-gray-400 mb-1.5 font-medium">Alamat Lengkap</label>
              <textarea v-model="form.address" :disabled="!editing" rows="2"
                class="w-full border rounded-xl px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                :class="editing ? 'border-gray-200' : 'border-transparent'" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1.5 font-medium">No. Telepon / WA</label>
              <input v-model="form.phone" :disabled="!editing"
                class="w-full border rounded-xl px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                :class="editing ? 'border-gray-200' : 'border-transparent'" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1.5 font-medium">Email</label>
              <input v-model="form.email" :disabled="!editing" type="email"
                class="w-full border rounded-xl px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                :class="editing ? 'border-gray-200' : 'border-transparent'" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1.5 font-medium">Instagram</label>
              <input v-model="form.instagram" :disabled="!editing"
                class="w-full border rounded-xl px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                :class="editing ? 'border-gray-200' : 'border-transparent'" placeholder="@username" />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1.5 font-medium">Jam Operasional</label>
              <input v-model="form.hours" :disabled="!editing"
                class="w-full border rounded-xl px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
                :class="editing ? 'border-gray-200' : 'border-transparent'" placeholder="Senin–Sabtu, 08:00–17:00 WIB" />
            </div>
          </div>
        </div>

        <!-- Ubah Password -->
        <button @click="showPasswordModal = true"
          class="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3.5 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group">
          <div class="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center group-hover:bg-primary-100 transition-colors">
            <Icon name="heroicons:lock-closed" class="w-4 h-4 text-primary-600" />
          </div>
          <div class="text-left">
            <p class="text-sm font-semibold text-gray-900">Ubah Password</p>
            <p class="text-xs text-gray-400">Ganti password akun Anda</p>
          </div>
          <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-300 ml-auto" />
        </button>
      </div>

      <!-- RIGHT: Portofolio (3 col) -->
      <div class="lg:col-span-3">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="font-semibold text-gray-900 flex items-center gap-2">
              <Icon name="heroicons:squares-2x2" class="w-5 h-5 text-primary-500" />
              Portofolio
            </h3>
            <div class="flex items-center gap-2">
              <button @click="refreshPortfolio()"
                class="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
              </button>
              <ui-app-button size="sm" icon="heroicons:plus" @click="showPortfolioModal = true">
                Tambah
              </ui-app-button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="portfolioStatus === 'pending'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="i in 6" :key="i" class="animate-pulse">
              <div class="h-28 bg-gray-100 rounded-xl mb-2" />
              <div class="h-3 bg-gray-100 rounded w-2/3 mb-1" />
              <div class="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="!portfolio || portfolio.length === 0" class="text-center py-12 text-gray-400">
            <Icon name="heroicons:photo" class="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p class="text-sm font-medium mb-1">Belum ada foto portofolio</p>
            <p class="text-xs text-gray-300 mb-4">Tambahkan hasil jahitan Anda untuk ditampilkan</p>
            <ui-app-button size="sm" variant="outline" icon="heroicons:plus" @click="showPortfolioModal = true">
              Tambah Portofolio
            </ui-app-button>
          </div>

          <!-- Grid -->
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="item in portfolio" :key="item.id"
              class="relative group rounded-xl overflow-hidden border border-gray-100">
              <img :src="resolveImageUrl(item.image)" :alt="item.title" class="w-full h-28 object-cover" />
              <div class="p-2">
                <p class="text-xs font-medium text-gray-800 truncate">{{ item.title }}</p>
                <p class="text-xs text-gray-400">{{ item.category }}</p>
              </div>
              <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button @click="confirmDelete(item)"
                  class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                  <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Ubah Password -->
    <ui-app-modal :show="showPasswordModal" title="Ubah Password" size="sm" @close="showPasswordModal = false">
      <div class="p-6">
        <form @submit.prevent="handleChangePassword" class="space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1.5 font-medium">Password Saat Ini</label>
            <input v-model="passwordForm.current" type="password" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5 font-medium">Password Baru</label>
            <input v-model="passwordForm.newPass" type="password" required minlength="6"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5 font-medium">Konfirmasi Password Baru</label>
            <input v-model="passwordForm.confirm" type="password" required
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <p v-if="passwordError" class="text-red-500 text-xs">{{ passwordError }}</p>
          <div class="flex gap-2 justify-end pt-2">
            <ui-app-button variant="outline" size="sm" @click="showPasswordModal = false">Batal</ui-app-button>
            <ui-app-button type="submit" size="sm" :loading="passwordSaving">Simpan</ui-app-button>
          </div>
        </form>
      </div>
    </ui-app-modal>

    <!-- Modal: Tambah Portofolio -->
    <ui-app-modal :show="showPortfolioModal" title="Tambah Portofolio" size="sm" @close="showPortfolioModal = false">
      <div class="p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1.5 font-medium">Judul <span
                class="text-red-400">*</span></label>
            <input v-model="uploadForm.title" placeholder="Contoh: Kemeja Batik Tulis"
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5 font-medium">Kategori <span
                class="text-red-400">*</span></label>
            <input v-model="uploadForm.category" placeholder="Contoh: Kemeja, Kebaya, Jas..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs text-gray-400 mb-1.5 font-medium">Deskripsi</label>
            <input v-model="uploadForm.description" placeholder="Deskripsi singkat karya..."
              class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" />
          </div>
        </div>

        <div
          class="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
          @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <Icon name="heroicons:cloud-arrow-up" class="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p class="text-sm font-medium text-gray-600 mb-1">Klik atau seret foto ke sini</p>
          <p class="text-xs text-gray-400">PNG, JPG, WEBP hingga 5MB</p>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
        </div>

        <div v-if="uploadPreview" class="mt-3 relative inline-block">
          <img :src="uploadPreview" class="h-24 w-auto rounded-xl object-cover border border-gray-100" />
          <button @click="clearUpload"
            class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
            ×
          </button>
        </div>

        <div class="flex gap-2 justify-end pt-4">
          <ui-app-button variant="outline" size="sm" @click="showPortfolioModal = false">Batal</ui-app-button>
          <ui-app-button size="sm" :loading="uploading" :disabled="!canUpload" @click="uploadPortfolio">
            <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
            Tambahkan
          </ui-app-button>
        </div>
      </div>
    </ui-app-modal>

    <!-- Modal: Hapus Portofolio -->
    <ui-app-modal :show="!!deletingItem" title="Hapus Portofolio?" size="sm" @close="deletingItem = null">
      <div class="p-6">
        <p class="text-sm text-gray-600 mb-5">
          Apakah kamu yakin ingin menghapus
          <span class="font-semibold text-gray-900">{{ deletingItem?.title }}</span>?
          Gambar akan terhapus permanen.
        </p>
        <div class="flex gap-2 justify-end">
          <ui-app-button variant="outline" size="sm" @click="deletingItem = null">Batal</ui-app-button>
          <ui-app-button variant="danger" size="sm" :loading="deleting" @click="doDelete">Hapus</ui-app-button>
        </div>
      </div>
    </ui-app-modal>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium text-white z-50',
        toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500']">
        <Icon :name="toast.type === 'success' ? 'heroicons:check-circle' : 'heroicons:exclamation-circle'"
          class="w-5 h-5" />
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useProfile, usePortfolio, usePortfolioAdmin, useProfileAdmin } from '~/composables/usePublic'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Pengaturan — Penjahit Yan' })

const { apiBase } = useRuntimeConfig().public

// ─── Password Modal ────────────────────────────────────────────────────────
const showPasswordModal = ref(false)
const passwordForm = reactive({ current: '', newPass: '', confirm: '' })
const passwordSaving = ref(false)
const passwordError = ref('')

async function handleChangePassword() {
  passwordError.value = ''
  if (passwordForm.newPass !== passwordForm.confirm) {
    passwordError.value = 'Konfirmasi password tidak cocok'
    return
  }
  if (passwordForm.newPass.length < 6) {
    passwordError.value = 'Password baru minimal 6 karakter'
    return
  }
  passwordSaving.value = true
  try {
    await $fetch(`${apiBase}/auth/password`, {
      method: 'PUT',
      body: { current_password: passwordForm.current, new_password: passwordForm.newPass },
      credentials: 'include',
    })
    passwordForm.current = ''
    passwordForm.newPass = ''
    passwordForm.confirm = ''
    showPasswordModal.value = false
    showToast('Password berhasil diubah!', 'success')
  } catch (e: any) {
    passwordError.value = e?.data?.detail ?? 'Gagal mengubah password'
  } finally {
    passwordSaving.value = false
  }
}

// ─── Profile state ──────────────────────────────────────────────────────────
const { business } = useProfile()
const { updateProfile } = useProfileAdmin()

const editing = ref(false)
const saving = ref(false)

const form = reactive<Partial<BusinessProfileRead>>({
  name: '', slogan: '', address: '', phone: '', email: '', hours: '', instagram: '',
})

watch(business, (val) => {
  if (val) Object.assign(form, val)
}, { immediate: true })

const cancelEdit = () => {
  if (business.value) Object.assign(form, business.value)
  editing.value = false
}

const saveSettings = async () => {
  saving.value = true
  try {
    await updateProfile(form)
    editing.value = false
    showToast('Profil berhasil disimpan!', 'success')
  } catch {
    showToast('Gagal menyimpan profil', 'error')
  } finally {
    saving.value = false
  }
}

// ─── Portfolio Modal ────────────────────────────────────────────────────────
const showPortfolioModal = ref(false)
const { portfolio, status: portfolioStatus, refresh: refreshPortfolio } = usePortfolio()
const { createItem, deleteItem } = usePortfolioAdmin()

const fileInput = ref<HTMLInputElement>()
const uploading = ref(false)
const uploadPreview = ref<string | null>(null)
const uploadFile = ref<File | null>(null)

const uploadForm = reactive({ title: '', category: '', description: '' })

const canUpload = computed(() =>
  uploadForm.title.trim() && uploadForm.category.trim()
)

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) setUploadFile(file)
}

const handleDrop = (e: DragEvent) => {
  const file = Array.from(e.dataTransfer?.files ?? []).find(f => f.type.startsWith('image/'))
  if (file) setUploadFile(file)
}

const setUploadFile = (file: File) => {
  uploadFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => { uploadPreview.value = e.target?.result as string }
  reader.readAsDataURL(file)
}

const clearUpload = () => {
  uploadFile.value = null
  uploadPreview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const uploadPortfolio = async () => {
  if (!canUpload.value) return
  uploading.value = true
  try {
    await createItem({
      title: uploadForm.title,
      category: uploadForm.category,
      description: uploadForm.description,
      image: uploadFile.value ?? undefined,
    })
    uploadForm.title = ''
    uploadForm.category = ''
    uploadForm.description = ''
    clearUpload()
    showPortfolioModal.value = false
    await refreshPortfolio()
    showToast('Portofolio berhasil ditambahkan!', 'success')
  } catch {
    showToast('Gagal menambahkan portofolio', 'error')
  } finally {
    uploading.value = false
  }
}

// ─── Delete portfolio ───────────────────────────────────────────────────────
const deletingItem = ref<PortfolioItemRead | null>(null)
const deleting = ref(false)

const confirmDelete = (item: PortfolioItemRead) => { deletingItem.value = item }

const doDelete = async () => {
  if (!deletingItem.value) return
  deleting.value = true
  try {
    await deleteItem(deletingItem.value.id)
    deletingItem.value = null
    await refreshPortfolio()
    showToast('Item berhasil dihapus', 'success')
  } catch {
    showToast('Gagal menghapus item', 'error')
  } finally {
    deleting.value = false
  }
}

// ─── Image URL helper ───────────────────────────────────────────────────────
const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  if (url.startsWith('/uploads/')) {
    const base = apiBase.replace(/\/api$/, '').replace(/\/$/, '')
    return `${base}${url}`
  }
  return url
}

// ─── Toast helper ───────────────────────────────────────────────────────────
const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' })
let toastTimer: ReturnType<typeof setTimeout>

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, 3000)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
