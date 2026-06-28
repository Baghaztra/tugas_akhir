<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-primary-900 text-white/80 py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Brand -->
          <div>
            <div class="flex items-center gap-2.5 mb-3">
              <div class="w-9 h-9 bg-primary-400 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:scissors" class="w-5 h-5 text-white" />
              </div>
              <span class="font-bold text-white text-lg">{{ business?.name || 'Penjahit Yan' }}</span>
            </div>
            <p class="text-sm text-white/50 leading-relaxed">{{ business?.slogan || '' }}</p>
            <a v-if="business?.instagram" :href="instagramUrl" target="_blank" rel="noopener noreferrer"
              class="inline-flex items-center gap-2 mt-4 text-sm text-primary-300 hover:text-white transition-colors">
              <Icon name="ri:instagram-line" class="w-5 h-5" />
              {{ business.instagram }}
            </a>
          </div>

          <!-- Navigasi -->
          <div>
            <h3 class="font-semibold text-white mb-4">Navigasi</h3>
            <ul class="space-y-3">
              <li>
                <NuxtLink to="/" class="text-sm text-white/50 hover:text-white transition-colors">Beranda</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/tracking" class="text-sm text-white/50 hover:text-white transition-colors">Cek Pesanan</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/login" class="text-sm text-white/50 hover:text-white transition-colors">Login Admin</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Kontak -->
          <div>
            <h3 class="font-semibold text-white mb-4">Kontak</h3>
            <ul class="space-y-3">
              <li class="flex items-start gap-2">
                <Icon name="heroicons:map-pin" class="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span class="text-sm text-white/50">{{ business?.address || 'Jl. Kenanga, Kel. Napar, Payakumbuh Utara' }}</span>
              </li>
              <li class="flex items-center gap-2">
                <Icon name="heroicons:phone" class="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span class="text-sm text-white/50">{{ business?.phone || '0812-6731-094' }}</span>
              </li>
              <li v-if="business?.email" class="flex items-center gap-2">
                <Icon name="heroicons:envelope" class="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a :href="`mailto:${business.email}`" class="text-sm text-white/50 hover:text-white transition-colors">{{ business.email }}</a>
              </li>
              <li v-if="business?.hours" class="flex items-start gap-2">
                <Icon name="heroicons:clock" class="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span class="text-sm text-white/50">{{ business.hours }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-10 pt-6 border-t border-white/10 text-center">
          <p class="text-sm text-white/40">© {{ new Date().getFullYear() }} Penjahit Yan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { business } = useProfile()

const instagramUrl = computed(() => {
  if (!business.value?.instagram) return '#'
  const handle = business.value.instagram.replace(/^@/, '')
  return `https://instagram.com/${handle}`
})
</script>
