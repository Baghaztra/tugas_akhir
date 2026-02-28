<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-50 flex flex-col bg-primary-900 transition-all duration-300 ease-in-out',
      sidebarOpen ? 'w-64' : 'w-16'
    ]">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-primary-700/50">
        <div class="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name="heroicons:scissors" class="w-4 h-4 text-white" />
        </div>
        <span v-show="sidebarOpen" class="font-bold text-white text-sm whitespace-nowrap">Penjahit Yan</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <div v-for="section in navSections" :key="section.label">
          <p v-show="sidebarOpen" class="px-4 py-2 text-xs font-semibold text-primary-400 uppercase tracking-wider">{{ section.label }}</p>
          <NuxtLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors group',
              $route.path === item.to || $route.path.startsWith(item.to + '/')
                ? 'bg-primary-600 text-white'
                : 'text-primary-200 hover:bg-primary-700/60 hover:text-white'
            ]"
          >
            <Icon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-show="sidebarOpen" class="whitespace-nowrap">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Bottom: Back to public & toggle -->
      <div class="border-t border-primary-700/50 p-3 space-y-1">
        <NuxtLink to="/" class="flex items-center gap-3 px-3 py-2 rounded-lg text-primary-300 hover:text-white hover:bg-primary-700/60 text-sm transition-colors">
          <Icon name="heroicons:arrow-left" class="w-4 h-4 flex-shrink-0" />
          <span v-show="sidebarOpen" class="whitespace-nowrap">Halaman Publik</span>
        </NuxtLink>
        <button @click="sidebarOpen = !sidebarOpen" class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-primary-300 hover:text-white hover:bg-primary-700/60 text-sm transition-colors">
          <Icon :name="sidebarOpen ? 'heroicons:chevron-left' : 'heroicons:chevron-right'" class="w-4 h-4 flex-shrink-0" />
          <span v-show="sidebarOpen" class="whitespace-nowrap">Sembunyikan</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'ml-64' : 'ml-16']">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 class="text-lg font-bold text-gray-900">{{ pageTitle }}</h1>
          <p class="text-xs text-gray-400">{{ pageDescription }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:user" class="w-4 h-4 text-primary-600" />
          </div>
          <span class="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-6 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebarOpen = ref(true)

const navSections = [
  {
    label: 'Utama',
    items: [
      { to: '/admin/dashboard', icon: 'heroicons:chart-bar', label: 'Dashboard' },
      { to: '/admin/orders', icon: 'heroicons:clipboard-document-list', label: 'Pesanan' },
      { to: '/admin/employees', icon: 'heroicons:users', label: 'Karyawan' },
    ],
  },
  {
    label: 'Analitik',
    items: [
      { to: '/admin/reports', icon: 'heroicons:presentation-chart-line', label: 'Laporan' },
    ],
  },
  {
    label: 'Pengaturan',
    items: [
      { to: '/admin/settings', icon: 'heroicons:cog-6-tooth', label: 'Pengaturan' },
    ],
  },
]

const pageMeta: Record<string, { title: string; desc: string }> = {
  '/admin/dashboard': { title: 'Dashboard', desc: 'Ringkasan aktivitas bisnis' },
  '/admin/orders': { title: 'Manajemen Pesanan', desc: 'Kelola seluruh pesanan jahit' },
  '/admin/employees': { title: 'Manajemen Karyawan', desc: 'Kelola data dan performa karyawan' },
  '/admin/reports': { title: 'Laporan & Analitik', desc: 'Data statistik dan performa bisnis' },
  '/admin/settings': { title: 'Pengaturan', desc: 'Konfigurasi profil usaha' },
}

const pageTitle = computed(() => {
  const base = route.path.split('/').slice(0, 3).join('/')
  return pageMeta[base]?.title ?? pageMeta[route.path]?.title ?? 'Admin Panel'
})
const pageDescription = computed(() => {
  const base = route.path.split('/').slice(0, 3).join('/')
  return pageMeta[base]?.desc ?? pageMeta[route.path]?.desc ?? ''
})
</script>
