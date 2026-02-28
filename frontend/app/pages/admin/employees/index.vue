<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input v-model="search" type="text" placeholder="Cari nama karyawan..."
          class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white" />
      </div>
      <select v-model="filterRole"
        class="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white">
        <option value="">Semua Role</option>
        <option value="cutting">Potong</option>
        <option value="sewing">Jahit</option>
        <option value="finishing">Finishing</option>
      </select>
    </div>

    <!-- Skeleton -->
    <template v-if="status === 'pending'">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 5" :key="i" class="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gray-200 rounded-full" />
            <div class="space-y-2 flex-1">
              <div class="h-4 bg-gray-200 rounded w-2/3" />
              <div class="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div class="h-3 bg-gray-200 rounded" />
          <div class="h-3 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    </template>

    <!-- Employee Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-if="filteredEmployees.length === 0" class="col-span-full">
        <ui-app-empty-state icon="heroicons:users" title="Tidak ada karyawan" description="Coba ubah filter" />
      </div>
      <NuxtLink
        v-for="emp in filteredEmployees" :key="emp.id"
        :to="`/admin/employees/${emp.id}`"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all duration-200 group"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-lg uppercase">
              {{ emp.name.charAt(0) }}
            </div>
            <div>
              <p class="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{{ emp.name }}</p>
              <p class="text-xs text-gray-500">{{ roleLabel[emp.role] }}</p>
            </div>
          </div>
          <ui-app-badge :variant="emp.status === 'working' ? 'success' : 'neutral'" dot>
            {{ emp.status === 'working' ? 'Bekerja' : 'Idle' }}
          </ui-app-badge>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm border-t border-gray-50 pt-4">
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Selesai Hari Ini</p>
            <p class="font-bold text-gray-900">{{ emp.completedToday }} <span class="font-normal text-gray-400">pc</span></p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-0.5">Total Selesai</p>
            <p class="font-bold text-gray-900">{{ emp.completedTotal }} <span class="font-normal text-gray-400">pc</span></p>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>Upah: Rp {{ emp.wagePerPiece.toLocaleString('id-ID') }}/pc</span>
          <Icon name="heroicons:chevron-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Manajemen Karyawan — Penjahit Yan' })

const { employees, status } = useEmployees()
const search = ref('')
const filterRole = ref('')

const roleLabel: Record<string, string> = {
  cutting: 'Potong', sewing: 'Jahit', finishing: 'Finishing'
}

const filteredEmployees = computed(() => {
  return (employees.value ?? []).filter(e => {
    const matchSearch = !search.value || e.name.toLowerCase().includes(search.value.toLowerCase())
    const matchRole = !filterRole.value || e.role === filterRole.value
    return matchSearch && matchRole
  })
})
</script>
