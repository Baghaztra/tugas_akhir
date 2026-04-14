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
        <div class="flex items-center gap-2">
          <button @click="setMode('draw')" class="toolbar-btn"><Icon name="mdi:pencil"/></button>
          <button @click="setMode('erase')" class="toolbar-btn"><Icon name="mdi:eraser-variant"/></button>
          <!-- <button @click="setMode('select')" class="toolbar-btn"><Icon name="heroicons:cursor-arrow-rays"/></button> -->
          <button @click="undo" class="toolbar-btn"><Icon name="heroicons:arrow-uturn-left"/></button>
          <button @click="clear" class="toolbar-btn text-red-500"><Icon name="heroicons:trash"/></button>
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

const templates = [
  { id: 'kemeja', label: 'Kemeja', url: '/templates/kemeja.svg' },
  { id: 'celana', label: 'Celana', url: '/templates/celana.svg' },
  { id: 'gamis', label: 'Gamis', url: '/templates/gamis.svg' },
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

<style scoped>
.toolbar-btn {
  @apply text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors;
}
</style>