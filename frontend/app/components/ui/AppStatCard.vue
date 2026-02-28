<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div :class="['w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0', iconBg]">
      <Icon :name="icon" class="w-7 h-7" :class="iconColor" />
    </div>
    <div class="min-w-0">
      <p class="text-sm text-gray-500 mb-0.5">{{ label }}</p>
      <p v-if="loading" class="w-24 h-7 bg-gray-200 rounded animate-pulse" />
      <p v-else class="text-2xl font-bold text-gray-900">{{ formattedValue }}</p>
      <p v-if="sub" class="text-xs text-gray-400 mt-0.5">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value?: number | string
  icon: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
  isCurrency?: boolean
  sub?: string
  loading?: boolean
}>()

const iconBg = computed(() => ({
  primary: 'bg-primary-50',
  success: 'bg-emerald-50',
  warning: 'bg-amber-50',
  danger: 'bg-red-50',
})[props.color ?? 'primary'])

const iconColor = computed(() => ({
  primary: 'text-primary-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  danger: 'text-red-500',
})[props.color ?? 'primary'])

const formattedValue = computed(() => {
  if (props.value === undefined) return '-'
  if (props.isCurrency && typeof props.value === 'number') {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(props.value)
  }
  return props.value
})
</script>
