<template>
  <div class="text-center py-14 px-4">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon :name="icon" class="w-8 h-8 text-gray-400" />
    </div>
    <p class="text-gray-700 font-medium mb-1">{{ title }}</p>
    <p v-if="description" class="text-sm text-gray-400">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>
