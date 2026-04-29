<template>
  <ui-app-modal :show="show" :title="title" size="sm" @close="$emit('cancel')">
    <div class="p-6">
      <div class="flex items-start gap-4">
        <div class="w-10 h-10 rounded-full bg-secondary-100 text-primary-600 flex items-center justify-center shrink-0">
          <Icon :name="icon" class="w-5 h-5" />
        </div>
        <div>
          <p class="text-gray-600 text-sm leading-relaxed">{{ message }}</p>
        </div>
      </div>
      <div class="mt-8 flex justify-end gap-3">
        <ui-app-button variant="outline" @click="$emit('cancel')">
          {{ cancelText }}
        </ui-app-button>
        <ui-app-button :variant="confirmVariant" :loading="loading" @click="$emit('confirm')">
          {{ confirmText }}
        </ui-app-button>
      </div>
    </div>
  </ui-app-modal>
</template>

<script setup lang="ts">
interface Props {
  show: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  icon?: string
  confirmVariant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Konfirmasi',
  confirmText: 'Konfirmasi',
  cancelText: 'Batal',
  icon: 'heroicons:exclamation-triangle',
  confirmVariant: 'primary',
  loading: false
})

defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>
