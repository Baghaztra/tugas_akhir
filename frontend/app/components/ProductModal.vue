<template>
    <Transition name="modal">
        <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
            <!-- Backdrop -->
            <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

            <!-- Modal Content -->
            <div class="flex min-h-full items-center justify-center p-4">
                <div
                    class="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden transform transition-all">
                    <!-- Close Button -->
                    <button @click="closeModal"
                        class="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition-smooth shadow-lg">
                        <Icon name="heroicons:x-mark" class="w-5 h-5" />
                    </button>

                    <div class="grid grid-cols-1 md:grid-cols-2">
                        <!-- Image Section -->
                        <div class="relative bg-gray-50 aspect-square md:aspect-auto">
                            <img :src="product.image" :alt="product.name" class="w-full h-full object-cover"
                                @error="handleImageError" />
                        </div>

                        <!-- Details Section -->
                        <div class="p-8 flex flex-col justify-center">
                            <span
                                class="inline-block px-4 py-1.5 bg-primary-500/10 text-primary-500 rounded-full text-sm font-medium mb-4 w-fit">
                                {{ product.category }}
                            </span>
                            <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ product.name }}</h2>
                            <p class="text-gray-600 leading-relaxed mb-6">{{ product.description }}</p>

                            <!-- Additional Info -->
                            <div class="border-t border-gray-200 pt-6 space-y-3">
                                <div class="flex items-center gap-3 text-sm text-gray-600">
                                    <Icon name="heroicons:check-badge" class="w-5 h-5 text-primary-500" />
                                    <span>Hasil jahitan berkualitas tinggi</span>
                                </div>
                                <div class="flex items-center gap-3 text-sm text-gray-600">
                                    <Icon name="heroicons:sparkles" class="w-5 h-5 text-primary-500" />
                                    <span>Detail dan finishing sempurna</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    image: string;
    price_range?: string;
}

const props = defineProps<{
    show: boolean;
    product: Product;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const closeModal = () => {
    emit('close');
};

const handleImageError = (e: Event) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
        parent.innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-gray-100">
            <svg class="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    `;
    }
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
    transition: transform 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
    transform: scale(0.9);
}
</style>
