<template>
    <div class="bg-gradient-to-r from-primary-50 to-secondary-200 border-b border-primary-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <h2 class="text-xl font-bold text-primary-500 mb-1">{{ title }}</h2>
                    <p class="text-sm text-gray-600">{{ description }}</p>
                </div>
                <div class="ml-4">
                    <span :class="[
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
                        accessLevel === 'public'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                    ]">
                        <Icon v-if="accessLevel === 'public'" name="heroicons:globe-alt" class="w-4 h-4" />
                        <Icon v-else name="heroicons:lock-closed" class="w-4 h-4" />
                        {{ accessLevel === 'public' ? 'Akses Publik' : 'Admin Only' }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    accessLevel: {
        type: String,
        default: 'public',
        validator: (value: string) => ['public', 'admin'].includes(value)
    }
});
</script>
