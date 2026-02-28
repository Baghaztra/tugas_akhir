<template>
  <!-- Skeleton Loader — gunakan untuk loading state -->
  <div :class="['animate-pulse bg-gray-200 rounded', sizeClass, props.class]" />
</template>

<script setup lang="ts">
const props = defineProps<{
  width?: string
  height?: string
  class?: string
  variant?: 'text' | 'box' | 'circle' | 'card'
}>()

const sizeClass = computed(() => {
  if (props.variant === 'circle') return 'rounded-full w-12 h-12'
  if (props.variant === 'card') return 'w-full h-48'
  if (props.variant === 'text') return 'w-full h-4'
  return ''
})
</script>
