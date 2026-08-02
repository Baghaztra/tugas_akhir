<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
    <p class="text-sm text-gray-500">
      {{ startItem }}–{{ endItem }} dari {{ total }}
    </p>
    <div class="flex items-center gap-1">
      <button
        :disabled="currentPage <= 1"
        class="px-2 py-1 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="emit('update:currentPage', currentPage - 1)"
      >
        <Icon name="heroicons:chevron-left" class="w-4 h-4" />
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        :class="[
          'px-3 py-1 text-sm rounded-lg transition-colors',
          page === currentPage ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 text-gray-700',
        ]"
        @click="emit('update:currentPage', page)"
      >
        {{ page }}
      </button>
      <button
        :disabled="currentPage >= totalPages"
        class="px-2 py-1 text-sm rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="emit('update:currentPage', currentPage + 1)"
      >
        <Icon name="heroicons:chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  total: number
  pageSize: number
  currentPage: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))
const startItem = computed(() => (props.currentPage - 1) * props.pageSize + 1)
const endItem = computed(() => Math.min(props.currentPage * props.pageSize, props.total))

const visiblePages = computed(() => {
  const pages: number[] = []
  const tp = totalPages.value
  const cp = props.currentPage
  // ponytail: show up to 5 pages centered on current
  const start = Math.max(1, cp - 2)
  const end = Math.min(tp, cp + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>
