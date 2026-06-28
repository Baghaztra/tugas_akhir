<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar (desktop only) -->
    <aside :class="[
      'fixed inset-y-0 left-0 z-50 flex-col bg-primary-900 transition-all duration-300 ease-in-out hidden md:flex',
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
          <p v-show="sidebarOpen" class="px-4 py-2 text-xs font-semibold text-primary-400 uppercase tracking-wider">{{
            section.label }}</p>
          <NuxtLink v-for="item in section.items" :key="item.to" :to="item.to" :class="[
            'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors group',
            $route.path === item.to || $route.path.startsWith(item.to + '/')
              ? 'bg-primary-600 text-white'
              : 'text-primary-200 hover:bg-primary-700/60 hover:text-white'
          ]">
            <Icon :name="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span v-show="sidebarOpen" class="whitespace-nowrap">{{ item.label }}</span>
          </NuxtLink>
        </div>
      </nav>

      <!-- Bottom: Back to public & toggle -->
      <div class="border-t border-primary-700/50 p-3 space-y-1">
        <NuxtLink to="/"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-primary-300 hover:text-white hover:bg-primary-700/60 text-sm transition-colors">
          <Icon name="heroicons:arrow-left" class="w-4 h-4 flex-shrink-0" />
          <span v-show="sidebarOpen" class="whitespace-nowrap">Halaman Publik</span>
        </NuxtLink>
        <button @click="sidebarOpen = !sidebarOpen"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-primary-300 hover:text-white hover:bg-primary-700/60 text-sm transition-colors">
          <Icon :name="sidebarOpen ? 'heroicons:chevron-left' : 'heroicons:chevron-right'"
            class="w-4 h-4 flex-shrink-0" />
          <span v-show="sidebarOpen" class="whitespace-nowrap">Sembunyikan</span>
        </button>
      </div>
    </aside>

    <!-- Main area -->
    <div :class="[
      'flex-1 flex flex-col transition-all duration-300 mb-16 md:mb-0 min-w-0',
      sidebarOpen ? 'md:ml-64' : 'md:ml-16'
    ]">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 class="text-lg font-bold text-gray-900">{{ pageTitle }}</h1>
          <p class="text-xs text-gray-400">{{ pageDescription }}</p>
        </div>
        <div class="flex items-center gap-3 relative">
          <button @click="showUserMenu = !showUserMenu" class="flex items-center gap-2 hover:opacity-80">
            <div class="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:user" class="w-4 h-4 text-primary-600" />
            </div>
            <span class="text-sm font-medium text-gray-700">{{ auth.user?.name ?? 'Admin' }}</span>
            <Icon name="heroicons:chevron-down" class="w-3 h-3 text-gray-400" />
          </button>
          <!-- Dropdown -->
          <div v-if="showUserMenu" class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50" @click.outside="showUserMenu = false">
            <span class="block px-4 py-2 text-xs text-gray-400 border-b border-gray-50">{{ auth.user?.email }}</span>
            <NuxtLink to="/admin/settings" class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="showUserMenu = false">
              <Icon name="heroicons:cog-6-tooth" class="w-4 h-4" />
              Pengaturan
            </NuxtLink>
            <button @click="handleLogout" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 md:p-6 overflow-x-hidden overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation Bar (mobile only) -->
    <nav class="fixed bottom-0 inset-x-0 z-50 bg-primary-900 border-t border-primary-700/50 flex md:hidden">
      <NuxtLink v-for="item in bottomNavItems" :key="item.to" :to="item.to" :class="[
        'flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium transition-colors',
        $route.path === item.to || $route.path.startsWith(item.to + '/')
          ? 'text-white'
          : 'text-primary-400'
      ]">
        <div :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
          $route.path === item.to || $route.path.startsWith(item.to + '/')
            ? 'bg-primary-600'
            : ''
        ]">
          <Icon :name="item.icon" class="w-5 h-5" />
        </div>
        <!-- <span>{{ item.label }}</span> -->
      </NuxtLink>

      <!-- Halaman Publik -->
      <NuxtLink to="/"
        class="flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium text-primary-400 transition-colors">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </div>
        <span>Publik</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(true)
const showUserMenu = ref(false)
const auth = useAuthStore()

auth.init()
if (!auth.isAuthenticated) {
  router.replace('/login')
}

function handleLogout() {
  auth.logout()
  router.replace('/login')
}

const navSections = computed(() => [
  {
    label: 'Utama',
    items: [
      { to: '/admin/dashboard', icon: 'heroicons:chart-bar', label: 'Dashboard' },
      { to: '/admin/work', icon: 'heroicons:cog-solid', label: 'Papan Kerja' },
      { to: '/admin/orders', icon: 'heroicons:clipboard-document-list', label: 'Pesanan' },
      { to: '/admin/workers', icon: 'heroicons:users', label: 'Karyawan' },
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
      ...(auth.user?.is_owner ? [{ to: '/admin/users', icon: 'heroicons:user-group', label: 'Kelola User' }] : []),
      { to: '/admin/settings', icon: 'heroicons:cog-6-tooth', label: 'Pengaturan' },
    ],
  },
])

// Flatten nav items for bottom bar (semua item dari semua section)
const bottomNavItems = computed(() => navSections.value.flatMap(s => s.items))

const pageMeta: Record<string, { title: string; desc: string }> = {
  '/admin/dashboard': { title: 'Dashboard', desc: 'Ringkasan aktivitas bisnis' },
  '/admin/work': { title: 'Papan Kerja', desc: 'Papan pekerjaan' },
  '/admin/orders': { title: 'Manajemen Pesanan', desc: 'Kelola seluruh pesanan jahit' },
  '/admin/garmen-types': { title: 'Jenis Pakaian', desc: 'Kelola jenis pesanan tersedia' },
  '/admin/workers': { title: 'Manajemen Karyawan', desc: 'Kelola data dan performa karyawan' },
  '/admin/users': { title: 'Kelola User', desc: 'Manajemen akun pengguna sistem' },
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
