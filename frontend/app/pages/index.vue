<template>
  <div>
    <!-- Hero Section -->
    <section class="relative bg-primary-700 text-white overflow-hidden min-h-[480px] flex items-center">
      <div class="absolute inset-0">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500" />
        <!-- Decorative shapes -->
        <div class="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div class="absolute -bottom-10 -left-10 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div class="flex flex-col md:flex-row items-center gap-10">
          <div class="flex-1 text-center md:text-left">
            <div
              class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6 border border-white/20">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Buka Sekarang
            </div>
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <template v-if="businessStatus === 'pending'">
                <div class="animate-pulse bg-white/20 h-12 rounded-lg mb-3 w-3/4" />
                <div class="animate-pulse bg-white/15 h-10 rounded-lg w-1/2" />
              </template>
              <template v-else>
                {{ business?.name }}
              </template>
            </h1>
            <p class="text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
              <template v-if="businessStatus === 'pending'">
                <div class="animate-pulse bg-white/15 h-6 rounded mb-2 w-full" />
                <div class="animate-pulse bg-white/10 h-6 rounded w-2/3" />
              </template>
              <template v-else>{{ business?.slogan }}</template>
            </p>
            <!-- Order Tracking Quick Input -->
            <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 max-w-md mx-auto md:mx-0">
              <p class="text-sm text-white/70 mb-2 font-medium">🔍 Cek Status Pesanan</p>
              <div class="flex gap-2">
                <input v-model="trackingInput" type="text" placeholder="Masukkan Nomor Resi..."
                  class="flex-1 bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/60 focus:bg-white/25"
                  @keydown.enter="goToTracking" />
                <button @click="goToTracking"
                  class="bg-white text-primary-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors text-sm">
                  Cek
                </button>
              </div>
            </div>
          </div>
          <!-- Decorative badge row -->
          <div class="hidden lg:flex flex-col gap-4 flex-shrink-0">
            <div v-for="feat in features" :key="feat.label"
              class="bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
              <Icon :name="feat.icon" class="w-5 h-5 text-primary-200" />
              <span class="text-sm font-medium text-white/90">{{ feat.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About / Contact -->
    <section class="bg-gradient-to-br from-secondary-200 to-secondary-100 py-14">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-primary-700 mb-2">Tentang Kami</h2>
          <p class="text-gray-600">Informasi kontak dan jam operasional</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <template v-if="businessStatus === 'pending'">
            <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-6 animate-pulse">
              <div class="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
              <div class="h-4 bg-gray-200 rounded mb-2 w-1/2" />
              <div class="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </template>
          <template v-else>
            <div
              class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-secondary-200">
              <div class="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center mb-4">
                <Icon name="heroicons:map-pin" class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-primary-700 mb-1">Alamat</h3>
              <p class="text-gray-600 text-sm">{{ business?.address }}</p>
            </div>
            <div
              class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-secondary-200">
              <div class="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center mb-4">
                <Icon name="heroicons:phone" class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-primary-700 mb-1">Hubungi Kami</h3>
              <p class="text-gray-600 text-sm">📞 {{ business?.phone }}</p>
              <p class="text-gray-600 text-sm">✉️ {{ business?.email }}</p>
            </div>
            <div
              class="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-secondary-200">
              <div class="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center mb-4">
                <Icon name="heroicons:clock" class="w-6 h-6" />
              </div>
              <h3 class="font-semibold text-primary-700 mb-1">Jam Operasional</h3>
              <p class="text-gray-600 text-sm">{{ business?.hours }}</p>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- Portfolio Section -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div class="flex items-end justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-primary-700 mb-1">Portofolio</h2>
          <p class="text-gray-500">Hasil karya terbaik kami</p>
        </div>
      </div>

      <!-- Skeleton loading -->
      <div v-if="portfolioStatus === 'pending'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-xl overflow-hidden border border-gray-100 animate-pulse">
          <div class="h-64 bg-gray-200" />
          <div class="p-4 space-y-3">
            <div class="h-3 bg-gray-200 rounded w-1/3" />
            <div class="h-4 bg-gray-200 rounded w-2/3" />
            <div class="h-3 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="portfolioError" class="text-center py-12 text-red-500">
        <Icon name="heroicons:exclamation-circle" class="w-12 h-12 mx-auto mb-3" />
        <p>Gagal memuat portofolio</p>
      </div>

      <!-- Data -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in portfolio" :key="item.id"
          class="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
          @click="openPortfolioModal(item)">
          <div class="relative h-64 bg-gray-50 overflow-hidden">
            <img :src="item.image" :alt="item.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div class="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="bg-white/90 text-primary-700 text-xs font-semibold px-2.5 py-1 rounded-full">Lihat
                Detail</span>
            </div>
          </div>
          <div class="p-5">
            <span
              class="inline-block px-2.5 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium mb-2">{{
                item.category }}</span>
            <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{{ item.title }}
            </h3>
            <p class="text-sm text-gray-500 line-clamp-2">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Portfolio Modal -->
    <ui-app-modal :show="!!selectedItem" :title="selectedItem?.title" size="lg" @close="selectedItem = null">
      <div v-if="selectedItem" class="p-0">
        <img :src="selectedItem.image" :alt="selectedItem.title" class="w-full h-72 object-cover" />
        <div class="p-6">
          <span class="inline-block px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium mb-3">{{
            selectedItem.category }}</span>
          <p class="text-gray-600 leading-relaxed">{{ selectedItem.description }}</p>
        </div>
      </div>
    </ui-app-modal>
  </div>
</template>

<script setup lang="ts">
import type { PortfolioItem } from '~/data/dummy'
import { useProfile, usePortfolio } from '~/composables/usePublic'

const router = useRouter()
const trackingInput = ref('')
const selectedItem = ref<PortfolioItem | null>(null)

const { business, status: businessStatus } = useProfile()
const { portfolio, status: portfolioStatus, error: portfolioError } = usePortfolio()

const features = [
  { icon: 'heroicons:check-badge', label: 'Kualitas Terjamin' },
  { icon: 'heroicons:clock', label: 'Tepat Waktu' },
  { icon: 'heroicons:star', label: 'Pengalaman 10+ Tahun' },
  { icon: 'heroicons:chat-bubble-left-ellipsis', label: 'Konsultasi Gratis' },
]

const goToTracking = () => {
  if (trackingInput.value.trim()) {
    router.push(`/tracking/${encodeURIComponent(trackingInput.value.trim())}`)
  } else {
    router.push('/tracking')
  }
}

const openPortfolioModal = (item: PortfolioItem) => {
  selectedItem.value = item
}

useSeoMeta({
  title: 'Beranda — Penjahit Yan',
  description: 'Layanan jahit berkualitas tinggi dengan detail yang sempurna di Payakumbuh Utara.',
})
</script>