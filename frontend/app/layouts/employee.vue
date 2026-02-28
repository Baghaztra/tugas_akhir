<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Employee Top Bar -->
    <header class="bg-primary-800 text-white px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:scissors" class="w-4 h-4 text-white" />
        </div>
        <div>
          <p class="font-bold text-sm leading-none">Penjahit Yan</p>
          <p class="text-xs text-primary-300">Papan Tugas Karyawan</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
          <Icon name="heroicons:user" class="w-4 h-4 text-white" />
        </div>
        <span class="text-sm font-medium">Karyawan</span>
      </div>
    </header>

    <!-- Tab Navigation -->
    <nav class="bg-white border-b border-gray-200 px-4">
      <div class="flex gap-1">
        <NuxtLink to="/employee/tasks" class="px-4 py-3 text-sm font-medium border-b-2 transition-colors" :class="$route.path === '/employee/tasks' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
          Tugas Aktif
        </NuxtLink>
      </div>
    </nav>

    <main class="flex-1 p-4">
      <slot />
    </main>
  </div>
</template>
