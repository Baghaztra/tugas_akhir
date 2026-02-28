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
          <ui-app-button v-if="!editing" variant="outline" size="sm" icon="heroicons:pencil" @click="editing = true">Edit</ui-app-button>
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
            <textarea v-model="form.address" :disabled="!editing" rows="2" resize="none"
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
          Upload Foto Portofolio
        </h3>

        <!-- Upload area -->
        <div
          class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
          @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <Icon name="heroicons:cloud-arrow-up" class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-sm font-medium text-gray-600 mb-1">Klik atau seret foto ke sini</p>
          <p class="text-xs text-gray-400">PNG, JPG, WEBP hingga 5MB</p>
          <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="handleFileChange" />
        </div>

        <!-- Preview list -->
        <div v-if="uploadedFiles.length" class="mt-4 grid grid-cols-3 gap-3">
          <div v-for="(f, i) in uploadedFiles" :key="i" class="relative group">
            <img :src="f.preview" class="w-full h-24 object-cover rounded-xl" />
            <button @click="removeFile(i)"
              class="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              ×
            </button>
          </div>
        </div>
        <div v-if="uploadedFiles.length" class="flex justify-end mt-3">
          <ui-app-button size="sm" :loading="uploading" @click="uploadPortfolio">Upload {{ uploadedFiles.length }} Foto</ui-app-button>
        </div>
      </div>

      <!-- Save Notification Toast (opportunistic UI) -->
      <Transition name="toast">
        <div v-if="savedToast" class="fixed bottom-6 right-6 bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <Icon name="heroicons:check-circle" class="w-5 h-5" />
          Pengaturan berhasil disimpan!
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BusinessProfile } from '~/data/dummy'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Pengaturan — Penjahit Yan' })

const { business } = useProfile()

const editing = ref(false)
const saving = ref(false)
const uploading = ref(false)
const savedToast = ref(false)
const fileInput = ref<HTMLInputElement>()

interface FilePreview { file: File; preview: string }
const uploadedFiles = ref<FilePreview[]>([])

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
  await new Promise(r => setTimeout(r, 800))
  console.log('[DUMMY] saveSettings:', form)
  saving.value = false
  editing.value = false
  savedToast.value = true
  setTimeout(() => (savedToast.value = false), 3000)
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) addFiles(Array.from(files))
}

const handleDrop = (e: DragEvent) => {
  const files = Array.from(e.dataTransfer?.files ?? [])
  addFiles(files.filter(f => f.type.startsWith('image/')))
}

const addFiles = (files: File[]) => {
  files.forEach(f => {
    const reader = new FileReader()
    reader.onload = (e) => uploadedFiles.value.push({ file: f, preview: e.target?.result as string })
    reader.readAsDataURL(f)
  })
}

const removeFile = (i: number) => uploadedFiles.value.splice(i, 1)

const uploadPortfolio = async () => {
  uploading.value = true
  await new Promise(r => setTimeout(r, 1000))
  console.log('[DUMMY] upload portfolio:', uploadedFiles.value.map(f => f.file.name))
  uploading.value = false
  uploadedFiles.value = []
  savedToast.value = true
  setTimeout(() => (savedToast.value = false), 3000)
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(16px); }
</style>
