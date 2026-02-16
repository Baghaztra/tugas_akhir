<template>
    <div>
        <!-- Page Header -->
        <PageHeader title="Beranda"
            description="Halaman publik yang dapat diakses siapapun untuk melihat portofolio dan informasi kontak"
            access-level="public" />

        <!-- Hero Section with Background Image -->
        <section class="relative bg-primary-500 text-white overflow-hidden">
            <!-- Background Image with Overlay -->
            <div class="absolute inset-0">
                <img src="/assets/images/baground.png" alt="Background" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/50"></div>
            </div>

            <!-- Content -->
            <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
                <div class="text-center">
                    <h1 class="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-lg">
                        {{ business?.name || 'Tailor Management' }}
                    </h1>
                    <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
                        Layanan jahit berkualitas dengan detail yang sempurna
                    </p>
                </div>
            </div>
        </section>

        <!-- Portfolio Section -->
        <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-primary-500 mb-2">Portfolio Produk</h2>
                <p class="text-gray-600">Hasil karya jahitan berkualitas dengan detail yang indah</p>
            </div>

            <div v-if="status === 'pending'" class="text-center py-12">
                <p>Loading products...</p>
            </div>

            <div v-else-if="error" class="text-center py-12 text-red-500">
                <p>Failed to load products</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ProductCard v-for="product in products" :key="product.id" :product="product"
                    @click="openProductModal" />
            </div>
        </section>

        <!-- Contact Section -->
        <section class="bg-gradient-to-br from-secondary-500 to-white py-12 mt-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="mb-8 text-center">
                    <h2 class="text-3xl font-bold text-primary-500 mb-2">Hubungi Kami</h2>
                    <p class="text-gray-600">Kami siap melayani kebutuhan jahit Anda</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                        class="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-primary-100 hover-lift transition-smooth">
                        <div
                            class="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-lg flex items-center justify-center mb-4">
                            <Icon name="heroicons:map-pin" class="w-6 h-6" />
                        </div>
                        <h3 class="font-semibold text-primary-500 mb-2">Alamat</h3>
                        <p class="text-gray-600 text-sm">{{ business?.address || 'Jl. Raya No. 1' }}</p>
                    </div>

                    <div
                        class="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-primary-100 hover-lift transition-smooth">
                        <div
                            class="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-lg flex items-center justify-center mb-4">
                            <Icon name="heroicons:phone" class="w-6 h-6" />
                        </div>
                        <h3 class="font-semibold text-primary-500 mb-2">Telepon</h3>
                        <p class="text-gray-600 text-sm">{{ business?.phone || '0812-3456-7890' }}</p>
                    </div>

                    <div
                        class="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-primary-100 hover-lift transition-smooth">
                        <div
                            class="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-lg flex items-center justify-center mb-4">
                            <Icon name="heroicons:envelope" class="w-6 h-6" />
                        </div>
                        <h3 class="font-semibold text-primary-500 mb-2">Email</h3>
                        <p class="text-gray-600 text-sm">{{ business?.email || 'contact@tailor.com' }}</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Product Modal -->
        <ProductModal v-if="selectedProduct" :show="showProductModal" :product="selectedProduct"
            @close="showProductModal = false" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PageHeader from '../components/PageHeader.vue';
import ProductCard from '../components/ProductCard.vue';
import ProductModal from '../components/ProductModal.vue';

interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    image: string;
    price_range?: string;
}

interface BusinessProfile {
    name: string;
    address: string;
    phone: string;
    email: string;
    hours?: string;
}

const showProductModal = ref(false);
const selectedProduct = ref<Product | null>(null);

const { data: products, status, error } = await useFetch<Product[]>('http://localhost:8000/products/public', {
    // Default data if API fails or for rendering during development validation if backend isn't up
    default: () => [
        {
            id: 1,
            name: 'Kemeja Batik Tulis',
            description: 'Kemeja batik tulis dengan motif parang rusak, bahan katun primisima.',
            category: 'Kemeja',
            image: 'https://placehold.co/600x600/png',
        },
        {
            id: 2,
            name: 'Jas Formal Pria',
            description: 'Jas formal untuk pernikahan atau acara resmi, bahan wool italy.',
            category: 'Jas',
            image: 'https://placehold.co/600x600/png',
        },
        {
            id: 3,
            name: 'Kebaya Modern',
            description: 'Kebaya modern dengan payet jepang, cocok untuk wisuda.',
            category: 'Kebaya',
            image: 'https://placehold.co/600x600/png',
        }
    ]
});

// Mock business data or fetch from API
const { data: business } = await useFetch<BusinessProfile>('http://localhost:8000/profile/public', {
    default: () => ({
        name: 'Penjahit Yan',
        address: 'Jl. Kenanga, kel. Napar, Payakumbuh Utara',
        phone: '0812-6731-094',
        email: 'yanpenjahit@gmail.com'
    })
});

const openProductModal = (product: Product) => {
    selectedProduct.value = product;
    showProductModal.value = true;
};
</script>