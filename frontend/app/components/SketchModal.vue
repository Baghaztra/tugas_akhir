<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-[680px] max-w-full space-y-4">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-800">Sketsa Item</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <!-- Mode Tabs -->
        <div class="flex rounded-xl bg-gray-100 p-1">
          <button @click="sketchMode = 'draw'"
            :class="sketchMode === 'draw' ? 'bg-white shadow text-primary-700 font-medium' : 'text-gray-500 hover:text-gray-700'"
            class="flex-1 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
            <Icon name="mdi:pencil" class="w-3.5 h-3.5" />
            Gambar
          </button>
          <button @click="sketchMode = 'camera'"
            :class="sketchMode === 'camera' ? 'bg-white shadow text-primary-700 font-medium' : 'text-gray-500 hover:text-gray-700'"
            class="flex-1 text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
            <Icon name="heroicons:camera" class="w-3.5 h-3.5" />
            Kamera / Galeri
          </button>
        </div>

        <!-- DRAW MODE -->
        <template v-if="sketchMode === 'draw'">
          <!-- Template Picker -->
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="t in templates" :key="t.id"
              @click="applyTemplate(t.url)"
              class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              {{ t.label }}
            </button>
          </div>

          <!-- Toolbar -->
          <div class="flex justify-between items-center rounded-xl bg-gray-100">
            <button @click="mode('draw')" :class="active == 'draw' ? 'bg-primary-500 text-white' : 'hover:bg-primary-200'" class="w-full py-2 rounded-l"><Icon name="mdi:pencil"/></button>
            <button @click="mode('erase')" :class="active == 'erase' ? 'bg-primary-500 text-white' : 'hover:bg-primary-200'" class="w-full py-2"><Icon name="mdi:eraser-variant"/></button>
            <button @click="undo" class="w-full py-2 hover:bg-primary-200"><Icon name="heroicons:arrow-uturn-left"/></button>
            <button @click="clear" class="w-full py-2 hover:bg-primary-200 rounded-r text-red-500"><Icon name="heroicons:trash"/></button>
          </div>

          <!-- Canvas -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <canvas ref="canvasEl" />
          </div>
        </template>

        <!-- CAMERA / GALLERY MODE -->
        <template v-else>
          <!-- ponytail: native inputs, no lib; capture forces camera on mobile -->
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center space-y-3">
            <Icon name="heroicons:camera" class="w-10 h-10 mx-auto text-gray-300" />
            <p class="text-xs text-gray-500">Ambil foto sketsa dari kamera atau pilih dari galeri</p>
            <input ref="cameraInputEl" type="file" accept="image/*" capture="environment"
              @change="onFilePicked" class="hidden" />
            <input ref="galleryInputEl" type="file" accept="image/*"
              @change="onFilePicked" class="hidden" />
            <div class="flex gap-2 justify-center">
              <button type="button" @click="cameraInputEl?.click()"
                class="text-xs px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors">
                <Icon name="heroicons:camera" class="w-3.5 h-3.5 inline mr-1" />
                Ambil Foto
              </button>
              <button type="button" @click="galleryInputEl?.click()"
                class="text-xs px-4 py-2 rounded-xl border border-primary-300 text-primary-700 hover:bg-primary-50 transition-colors">
                <Icon name="heroicons:photo" class="w-3.5 h-3.5 inline mr-1" />
                Pilih dari Galeri
              </button>
            </div>
          </div>
          <!-- Preview -->
          <div v-if="cameraPreview" class="relative w-40">
            <img :src="cameraPreview" class="rounded-xl border border-gray-200 w-full" />
            <button @click="cameraPreview = ''"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              ✕
            </button>
          </div>
        </template>

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <button @click="$emit('close')"
            class="text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50">
            Batal
          </button>
          <button @click="save"
            class="text-sm px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600">
            Simpan Sketsa
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: []; save: [dataUrl: string] }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
const cameraInputEl = ref<HTMLInputElement | null>(null)
const galleryInputEl = ref<HTMLInputElement | null>(null)
const { init, loadTemplate, setMode, undo, clear, exportPNG } = useSketchCanvas(canvasEl)

const active = ref<'draw' | 'select' | 'erase'>('draw')
const sketchMode = ref<'draw' | 'camera'>('draw')
const cameraPreview = ref('')

const mode = (newMode: 'draw' | 'select' | 'erase') => {
  active.value = newMode
  setMode(newMode)
}

const templates = [
  { id: 'kemeja', label: 'Kemeja', url: '/templates/kemeja.svg' },
  { id: 'gamis', label: 'Gamis', url: '/templates/gamis.svg' },
  { id: 'blouse', label: 'Blouse', url: '/templates/blouse.svg' },
  { id: 'rok', label: 'Rok', url: '/templates/rok.svg' },
]

watch(() => props.open, async (val) => {
  if (val) {
    sketchMode.value = 'draw'
    cameraPreview.value = ''
    await nextTick()
    await init()
  }
})

const applyTemplate = async (url: string) => {
  clear()
  await loadTemplate(url)
}

// ponytail: canvas API for compression, no lib; max 1920px, JPEG 0.75
const compressImage = (file: File): Promise<string> => new Promise((resolve) => {
  const img = new Image()
  const url = URL.createObjectURL(file)
  img.onload = () => {
    URL.revokeObjectURL(url)
    const MAX = 1920
    let w = img.width
    let h = img.height
    if (w > MAX || h > MAX) {
      const ratio = Math.min(MAX / w, MAX / h)
      w = Math.round(w * ratio)
      h = Math.round(h * ratio)
    }
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    c.getContext('2d')!.drawImage(img, 0, 0, w, h)
    resolve(c.toDataURL('image/jpeg', 0.75))
  }
  img.src = url
})

const onFilePicked = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  cameraPreview.value = await compressImage(file)
}

const save = () => {
  const dataUrl = sketchMode.value === 'camera' ? cameraPreview.value : exportPNG()
  if (!dataUrl) return
  emit('save', dataUrl)
  emit('close')
}
</script>
