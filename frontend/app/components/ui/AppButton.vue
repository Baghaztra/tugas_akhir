<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1',
      sizeClass, variantClass,
      (disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'
    ]"
  >
    <Icon v-if="loading" name="heroicons:arrow-path" class="animate-spin w-4 h-4" />
    <Icon v-else-if="icon && iconPosition === 'left'" :name="icon" class="w-4 h-4" />
    <slot />
    <Icon v-if="icon && iconPosition === 'right' && !loading" :name="icon" class="w-4 h-4" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()

const sizeClass = computed(() => ({
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
})[props.size ?? 'md'])

const variantClass = computed(() => ({
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-400 shadow-sm',
  secondary: 'bg-secondary-400 text-primary-800 hover:bg-secondary-500 focus:ring-secondary-300 shadow-sm',
  outline: 'border border-primary-300 text-primary-600 hover:bg-primary-50 focus:ring-primary-300',
  ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-300',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm',
})[props.variant ?? 'primary'])
</script>
