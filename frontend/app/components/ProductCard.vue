<template>
    <div @click="handleClick"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden hover-lift transition-smooth shadow-sm cursor-pointer group">
        <div class="relative h-64 bg-gray-50 overflow-hidden">
            <img :src="product.image" :alt="product.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="handleImageError" />
        </div>
        <div class="p-5">
            <span
                class="inline-block px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-xs font-medium mb-2">
                {{ product.category }}
            </span>
            <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-primary-500 transition-colors">{{ product.name
            }}</h3>
            <p class="text-sm text-gray-500 line-clamp-2">{{ product.description }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    image: string;
    price_range?: string;
}

const props = defineProps<{
    product: Product;
}>();

const emit = defineEmits<{
    (e: 'click', product: Product): void;
}>();

const handleClick = () => {
    emit('click', props.product);
};

const handleImageError = (e: Event) => {
    // Fallback to placeholder if image fails to load
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
        parent.innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-gray-100">
            <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
    `;
    }
};
</script>
