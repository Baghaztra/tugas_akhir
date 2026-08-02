<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-[680px] max-w-full space-y-4">

        <!-- Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-800">Sketsa Item</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
        </div>

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
          <!-- <button @click="mode('select')" :class="active == 'select' ? 'bg-primary-500 text-white' : 'hover:bg-primary-200'" class="w-full py-2"><Icon name="heroicons:cursor-arrow-rays"/></button> -->
          <button @click="undo" class="w-full py-2 hover:bg-primary-200"><Icon name="heroicons:arrow-uturn-left"/></button>
          <button @click="clear" class="w-full py-2 hover:bg-primary-200 rounded-r text-red-500"><Icon name="heroicons:trash"/></button>
        </div>

        <!-- Canvas -->
        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <canvas ref="canvasEl" />
        </div>

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
const { init, loadTemplate, setMode, undo, clear, exportPNG } = useSketchCanvas(canvasEl)

const active = ref<'draw' | 'select' | 'erase'>('draw')

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
    await nextTick()
    await init()
  }
})

const applyTemplate = async (url: string) => {
  clear()
  await loadTemplate(url)
}

const save = () => {
  emit('save', exportPNG())
  emit('close')
}
</script>
