<template>
  <div :class="[
    'bg-white rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md',
    padded ? 'p-6' : '',
    props.class
  ]">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  padded?: boolean
  class?: string
}>()
</script>
