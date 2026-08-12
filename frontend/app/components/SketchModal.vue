<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-[680px] max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <h3 class="text-sm font-semibold text-gray-800">Sketsa Item</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 p-1">✕</button>
        </div>

        <!-- Image source buttons -->
        <div class="flex gap-2 px-4 py-2.5 border-b border-gray-100 shrink-0">
          <input ref="cameraInputEl" type="file" accept="image/*" capture="environment"
            @change="onFilePicked" class="hidden" />
          <input ref="galleryInputEl" type="file" accept="image/*"
            @change="onFilePicked" class="hidden" />
          <button type="button" @click="cameraInputEl?.click()"
            class="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 transition-colors">
            <Icon name="heroicons:camera" class="w-4 h-4" />
            Kamera
          </button>
          <button type="button" @click="galleryInputEl?.click()"
            class="flex-1 flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-primary-300 text-primary-700 hover:bg-primary-50 active:bg-primary-100 transition-colors">
            <Icon name="heroicons:photo" class="w-4 h-4" />
            Galeri
          </button>
        </div>

        <!-- Templates -->
        <div class="flex gap-1.5 px-4 py-2 overflow-x-auto border-b border-gray-100 shrink-0">
          <button
            v-for="t in templates" :key="t.id"
            @click="applyTemplate(t.url)"
            class="text-[11px] px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-primary-400 hover:text-primary-600 transition-colors whitespace-nowrap">
            {{ t.label }}
          </button>
        </div>

        <!-- Canvas -->
        <div ref="canvasWrapEl" class="flex-1 overflow-auto px-4 py-3 min-h-0">
          <canvas ref="canvasEl" class="block mx-auto" />
        </div>

        <!-- Toolbar -->
        <div class="flex items-center justify-center gap-1 px-4 py-2.5 border-t border-gray-100 bg-gray-50 shrink-0">
          <button @click="setDrawMode('draw')" :class="active === 'draw' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-200'"
            class="p-2.5 rounded-xl transition-colors" title="Gambar">
            <Icon name="mdi:pencil" class="w-5 h-5" />
          </button>
          <button @click="setDrawMode('erase')" :class="active === 'erase' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-200'"
            class="p-2.5 rounded-xl transition-colors" title="Hapus">
            <Icon name="mdi:eraser-variant" class="w-5 h-5" />
          </button>
          <button @click="setDrawMode('select')" :class="active === 'select' ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-200'"
            class="p-2.5 rounded-xl transition-colors" title="Geser">
            <Icon name="heroicons:arrows-up-down-left-right" class="w-5 h-5" />
          </button>
          <div class="w-px h-6 bg-gray-300 mx-1"></div>
          <button @click="undo" class="p-2.5 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors" title="Undo">
            <Icon name="heroicons:arrow-uturn-left" class="w-5 h-5" />
          </button>
          <button @click="clear" class="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors" title="Hapus Semua">
            <Icon name="heroicons:trash" class="w-5 h-5" />
          </button>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 shrink-0">
          <button @click="$emit('close')"
            class="text-sm px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            Batal
          </button>
          <button @click="save"
            class="text-sm px-5 py-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 transition-colors">
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
const canvasWrapEl = ref<HTMLDivElement | null>(null)
const cameraInputEl = ref<HTMLInputElement | null>(null)
const galleryInputEl = ref<HTMLInputElement | null>(null)
const { init, loadImage, loadTemplate, setMode, undo, clear, exportPNG, setDimensions } = useSketchCanvas(canvasEl)

const active = ref<'draw' | 'erase' | 'select'>('draw')

const setDrawMode = (mode: 'draw' | 'erase' | 'select') => {
  active.value = mode
  setMode(mode)
}

const templates = [
  { id: 'kemeja', label: 'Kemeja', url: '/templates/kemeja.svg' },
  { id: 'gamis', label: 'Gamis', url: '/templates/gamis.svg' },
  { id: 'blouse', label: 'Blouse', url: '/templates/blouse.svg' },
  { id: 'rok', label: 'Rok', url: '/templates/rok.svg' },
]

const resizeCanvas = () => {
  if (!canvasWrapEl.value) return
  const rect = canvasWrapEl.value.getBoundingClientRect()
  const w = Math.floor(rect.width) - 8
  const h = Math.max(250, Math.floor(rect.height) - 8)
  setDimensions(w, h)
}

watch(() => props.open, async (val) => {
  if (val) {
    active.value = 'draw'
    await nextTick()
    await init()
    await nextTick()
    resizeCanvas()
  }
})

// ponytail: canvas API, no lib; max 1920px, JPEG 0.75
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
  const dataUrl = await compressImage(file)
  await loadImage(dataUrl)
  active.value = 'draw'
  setMode('draw')
}

const applyTemplate = async (url: string) => {
  clear()
  await loadTemplate(url)
}

const save = () => {
  const dataUrl = exportPNG()
  if (!dataUrl) return
  emit('save', dataUrl)
  emit('close')
}
</script>
