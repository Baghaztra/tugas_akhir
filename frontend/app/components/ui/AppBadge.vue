<template>
  <span :class="[
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
    variantClass
  ]">
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full" :class="dotClass" />
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  dot?: boolean
}>()

const variantClass = computed(() => ({
  'success': 'bg-emerald-100 text-emerald-700',
  'warning': 'bg-amber-100 text-amber-700',
  'danger': 'bg-red-100 text-red-700',
  'info': 'bg-blue-100 text-blue-700',
  'neutral': 'bg-gray-100 text-gray-600',
})[props.variant ?? 'neutral'])

const dotClass = computed(() => ({
  'success': 'bg-emerald-500',
  'warning': 'bg-amber-500',
  'danger': 'bg-red-500',
  'info': 'bg-blue-500',
  'neutral': 'bg-gray-400',
})[props.variant ?? 'neutral'])
</script>
