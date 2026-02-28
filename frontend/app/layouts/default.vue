<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Public Navbar -->
    <nav class="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:scissors" class="w-5 h-5 text-white" />
            </div>
            <span class="font-bold text-primary-700 text-lg">Penjahit Yan</span>
          </NuxtLink>

          <!-- Nav Links -->
          <div class="hidden md:flex items-center gap-6">
            <NuxtLink to="/" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors" active-class="text-primary-600">Beranda</NuxtLink>
            <NuxtLink to="/tracking" class="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors" active-class="text-primary-600">Cek Pesanan</NuxtLink>
            <NuxtLink to="/admin/dashboard" class="text-sm font-medium bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">Admin</NuxtLink>
          </div>

          <!-- Mobile menu -->
          <button class="md:hidden p-2 text-gray-600" @click="mobileOpen = !mobileOpen">
            <Icon :name="mobileOpen ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="w-6 h-6" />
          </button>
        </div>

        <!-- Mobile dropdown -->
        <div v-show="mobileOpen" class="md:hidden py-3 border-t border-gray-100 flex flex-col gap-2">
          <NuxtLink to="/" class="text-sm font-medium text-gray-600 px-2 py-2 rounded-lg hover:bg-gray-50" @click="mobileOpen = false">Beranda</NuxtLink>
          <NuxtLink to="/tracking" class="text-sm font-medium text-gray-600 px-2 py-2 rounded-lg hover:bg-gray-50" @click="mobileOpen = false">Cek Pesanan</NuxtLink>
          <NuxtLink to="/admin/dashboard" class="text-sm font-medium text-primary-600 px-2 py-2 rounded-lg hover:bg-primary-50" @click="mobileOpen = false">Admin</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-primary-900 text-white/80 py-8 mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center text-sm">
        <p class="font-semibold text-white mb-1">Penjahit Yan</p>
        <p>Jl. Kenanga, Kel. Napar, Payakumbuh Utara · 0812-6731-094</p>
        <p class="mt-2 text-white/50">© {{ new Date().getFullYear() }} Penjahit Yan. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileOpen = ref(false)
</script>
