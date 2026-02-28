<template>
  <div>
    <!-- Skeleton -->
    <template v-if="empStatus === 'pending'">
      <div class="animate-pulse space-y-6">
        <div class="h-8 bg-gray-200 rounded w-1/4" />
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="h-48 bg-gray-100 rounded-2xl" />
          <div class="lg:col-span-2 h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </template>

    <template v-else-if="employee">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/admin/employees" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div class="flex items-center gap-3 flex-1">
          <div class="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-2xl uppercase">
            {{ employee.name.charAt(0) }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ employee.name }}</h2>
            <p class="text-sm text-gray-500">{{ roleLabel[employee.role] }}</p>
          </div>
        </div>
        <ui-app-badge :variant="employee.status === 'working' ? 'success' : 'neutral'" dot>
          {{ employee.status === 'working' ? 'Sedang Bekerja' : 'Idle' }}
        </ui-app-badge>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Profile & Wage -->
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Profil</h3>
            <div class="space-y-3 text-sm">
              <div><p class="text-xs text-gray-400">Telepon</p><p class="font-medium">{{ employee.phone }}</p></div>
              <div><p class="text-xs text-gray-400">Bergabung</p><p class="font-medium">{{ formatDate(employee.joinDate) }}</p></div>
              <div><p class="text-xs text-gray-400">Role</p><p class="font-medium">{{ roleLabel[employee.role] }}</p></div>
            </div>
          </div>

          <!-- Wage Calculation -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:banknotes" class="w-4 h-4 text-emerald-500" />
              Kalkulasi Upah
            </h3>
            <template v-if="wagesStatus === 'pending'">
              <div class="animate-pulse space-y-2">
                <div class="h-4 bg-gray-200 rounded w-full" />
                <div class="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </template>
            <template v-else>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between"><span class="text-gray-500">Per Piece</span><span class="font-medium">{{ formatCurrency(wages?.wagePerPiece ?? 0) }}</span></div>
                <div class="flex justify-between"><span class="text-gray-500">Unit Minggu Ini</span><span class="font-medium">{{ wages?.weeklyCount }} pc</span></div>
                <hr class="border-gray-100 my-2" />
                <div class="flex justify-between"><span class="text-gray-600 font-medium">Upah Minggu Ini</span><span class="font-bold text-emerald-600 text-base">{{ formatCurrency(wages?.weeklyWage ?? 0) }}</span></div>
              </div>
            </template>
          </div>
        </div>

        <!-- Performance -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Daily Bar Chart -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Produktivitas Harian</h3>
            <template v-if="perfStatus === 'pending'">
              <div class="animate-pulse flex items-end gap-3 h-32">
                <div v-for="i in 6" :key="i" class="flex-1 bg-gray-200 rounded-t" :style="{ height: `${30 + i * 10}px` }" />
              </div>
            </template>
            <template v-else>
              <div class="flex items-end gap-2 h-32 mb-2">
                <div v-for="day in performance?.daily" :key="day.date" class="flex-1 flex flex-col items-center gap-1">
                  <span class="text-xs text-gray-500 font-medium">{{ day.count }}</span>
                  <div class="w-full bg-primary-400 rounded-t hover:bg-primary-600 transition-colors"
                    :style="{ height: `${(day.count / maxDaily) * 90}px` }" :title="`${day.count} pc`" />
                </div>
              </div>
              <div class="flex justify-around text-xs text-gray-400">
                <span v-for="day in performance?.daily" :key="day.date">{{ day.date }}</span>
              </div>
            </template>
          </div>

          <!-- Weekly Summary -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Ringkasan Mingguan</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div v-for="week in performance?.weekly" :key="week.week" class="bg-gray-50 rounded-xl p-3 text-center">
                <p class="text-xs text-gray-400 mb-1">{{ week.week }}</p>
                <p class="font-bold text-gray-900 text-lg">{{ week.count }}</p>
                <p class="text-xs text-gray-400">pc</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const route = useRoute()
const empId = Number(route.params.id)

const { employee, status: empStatus } = useEmployeeDetail(empId)
const { performance, status: perfStatus } = useEmployeePerformance(empId)
const { wages, status: wagesStatus } = useEmployeeWages(empId)

useSeoMeta({ title: `Karyawan — Penjahit Yan` })

const roleLabel: Record<string, string> = { cutting: 'Potong', sewing: 'Jahit', finishing: 'Finishing' }

const maxDaily = computed(() => Math.max(...(performance.value?.daily.map(d => d.count) ?? [1])))

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const formatCurrency = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
</script>
