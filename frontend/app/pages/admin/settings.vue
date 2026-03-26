<template>
  <div class="max-w-2xl mx-auto">
    <div class="space-y-6">
      <!-- Profile Info -->
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div class="sm:col-span-2">
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
          <div class="sm:col-span-2">
            <label class="block text-xs text-gray-400 mb-1.5 font-medium">Jam Operasional</label>
            <input v-model="form.hours" :disabled="!editing"
              class="w-full border rounded-xl px-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
              :class="editing ? 'border-gray-200' : 'border-transparent'" placeholder="Senin–Sabtu, 08:00–17:00 WIB" />
          </div>
        </div>
      </div>

      <!-- Portfolio Upload -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Icon name="heroicons:photo" class="w-5 h-5 text-primary-500" />
          Tambah Foto Portofolio
        </h3>

        <!-- Metadata form -->
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

        <!-- Upload area -->
        <div
          class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
          @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <Icon name="heroicons:cloud-arrow-up" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-sm font-medium text-gray-600 mb-1">Klik atau seret foto ke sini</p>
          <p class="text-xs text-gray-400">PNG, JPG, WEBP hingga 5MB</p>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
        </div>

        <!-- Preview -->
        <div v-if="uploadPreview" class="mt-4 relative inline-block">
          <img :src="uploadPreview" class="h-32 w-auto rounded-xl object-cover border border-gray-100" />
          <button @click="clearUpload"
            class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
            ×
          </button>
        </div>

        <div class="flex justify-end mt-4">
          <ui-app-button size="sm" :loading="uploading" :disabled="!canUpload" @click="uploadPortfolio">
            <Icon name="heroicons:plus" class="w-4 h-4 mr-1" />
            Tambahkan
          </ui-app-button>
        </div>
      </div>

      <!-- Portfolio Existing Items -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="heroicons:squares-2x2" class="w-5 h-5 text-primary-500" />
            Daftar Portofolio
          </h3>
          <button @click="() => refreshPortfolio()"
            class="text-xs text-primary-500 hover:text-primary-700 flex items-center gap-1">
            <Icon name="heroicons:arrow-path" class="w-3.5 h-3.5" />
            Muat ulang
          </button>
        </div>

        <!-- Loading -->
        <div v-if="portfolioStatus === 'pending'" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="i in 4" :key="i" class="animate-pulse">
            <div class="h-24 bg-gray-100 rounded-xl mb-2" />
            <div class="h-3 bg-gray-100 rounded w-2/3 mb-1" />
            <div class="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!portfolio || portfolio.length === 0" class="text-center py-8 text-gray-400 text-sm">
          <Icon name="heroicons:photo" class="w-10 h-10 mx-auto mb-2 text-gray-200" />
          Belum ada foto portofolio
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div v-for="item in portfolio" :key="item.id"
            class="relative group rounded-xl overflow-hidden border border-gray-100">
            <img :src="resolveImageUrl(item.image)" :alt="item.title" class="w-full h-24 object-cover" />
            <div class="p-2">
              <p class="text-xs font-medium text-gray-800 truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400">{{ item.category }}</p>
            </div>
            <!-- Delete overlay -->
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

      <!-- Delete Confirm Modal -->
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
  </div>
</template>

<script setup lang="ts">
import type { BusinessProfile, PortfolioItem } from '~/data/dummy'
import { useProfile, usePortfolio, usePortfolioAdmin, useProfileAdmin } from '~/composables/usePublic'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Pengaturan — Penjahit Yan' })

const { apiBase } = useRuntimeConfig().public

// ─── Profile state ─────────────────────────────────────────────────────────────
const { business } = useProfile()
const { updateProfile } = useProfileAdmin()

const editing = ref(false)
const saving = ref(false)

const form = reactive<Partial<BusinessProfile>>({
  name: '', slogan: '', address: '', phone: '', email: '', hours: '',
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

// ─── Portfolio state ────────────────────────────────────────────────────────────
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
    // Reset form
    uploadForm.title = ''
    uploadForm.category = ''
    uploadForm.description = ''
    clearUpload()
    await refreshPortfolio()
    showToast('Portofolio berhasil ditambahkan!', 'success')
  } catch {
    showToast('Gagal menambahkan portofolio', 'error')
  } finally {
    uploading.value = false
  }
}

// ─── Delete portfolio ───────────────────────────────────────────────────────────
const deletingItem = ref<PortfolioItem | null>(null)
const deleting = ref(false)

const confirmDelete = (item: PortfolioItem) => { deletingItem.value = item }

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

// ─── Image URL helper ───────────────────────────────────────────────────────────
const resolveImageUrl = (url: string | null | undefined): string => {
  if (!url) return ''
  // If relative path (/uploads/...), prepend API base host
  if (url.startsWith('/uploads/')) {
    const base = apiBase.replace(/\/api$/, '').replace(/\/$/, '')
    return `${base}${url}`
  }
  return url
}

// ─── Toast helper ───────────────────────────────────────────────────────────────
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
