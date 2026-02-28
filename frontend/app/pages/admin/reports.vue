<template>
  <div>
    <!-- Skeleton -->
    <template v-if="status === 'pending'">
      <div class="animate-pulse space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <div class="h-48 bg-gray-100 rounded-2xl" />
          <div class="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </template>
    <template v-else>
      <!-- Export Button -->
      <div class="flex justify-end mb-6">
        <ui-app-button variant="outline" icon="heroicons:arrow-down-tray">Export PDF</ui-app-button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Volume Pesanan (Monthly) -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="font-semibold text-gray-900 mb-1">Volume Pesanan per Bulan</h3>
          <p class="text-xs text-gray-400 mb-4">6 bulan terakhir</p>
          <div class="flex items-end gap-2 h-36 mb-2">
            <div v-for="m in reports?.monthlyOrders" :key="m.month" class="flex-1 flex flex-col items-center gap-1">
              <span class="text-xs text-gray-500">{{ m.count }}</span>
              <div class="w-full bg-primary-400 hover:bg-primary-600 rounded-t transition-colors"
                :style="{ height: `${(m.count / maxMonthly) * 110}px` }" />
            </div>
          </div>
          <div class="flex justify-around text-xs text-gray-400">
            <span v-for="m in reports?.monthlyOrders" :key="m.month">{{ m.month }}</span>
          </div>
        </div>

        <!-- Tren Mode/Garment Pie-style -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="font-semibold text-gray-900 mb-1">Jenis Pakaian Terpopuler</h3>
          <p class="text-xs text-gray-400 mb-4">Berdasarkan total pesanan</p>
          <div class="space-y-3">
            <div v-for="(item, i) in sortedGarments" :key="item.type" class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: chartColors[i % chartColors.length] }" />
              <span class="text-sm text-gray-700 w-24 flex-shrink-0">{{ item.type }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-700"
                  :style="{ width: `${(item.count / maxGarment) * 100}%`, backgroundColor: chartColors[i % chartColors.length] }" />
              </div>
              <span class="text-sm font-semibold text-gray-700 w-8 text-right">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <!-- Beban Kerja Karyawan Heatmap -->
        <div class="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="font-semibold text-gray-900 mb-1">Beban Kerja Karyawan</h3>
          <p class="text-xs text-gray-400 mb-4">Jam kerja per hari (estimasi)</p>
          <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th class="text-left text-xs text-gray-400 font-medium pb-2 pr-4 w-32">Karyawan</th>
                  <th v-for="day in ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="day"
                    class="text-center text-xs text-gray-400 font-medium pb-2 px-1 w-16">{{ day }}</th>
                  <th class="text-center text-xs text-gray-400 font-medium pb-2 pl-4">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in reports?.employeeWorkload" :key="row.employeeId" class="border-t border-gray-50">
                  <td class="text-xs text-gray-700 font-medium py-2 pr-4 whitespace-nowrap">{{ row.name.split(' ')[0] }}</td>
                  <td v-for="d in row.days" :key="d.day" class="text-center py-2 px-1">
                    <div class="mx-auto w-10 h-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                      :class="heatmapClass(d.hours)">
                      {{ d.hours }}h
                    </div>
                  </td>
                  <td class="text-center text-xs font-bold text-gray-700 pl-4">
                    {{ row.days.reduce((a, b) => a + b.hours, 0) }}h
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Legend -->
          <div class="flex items-center gap-3 mt-4 text-xs text-gray-400">
            <span>Ringan</span>
            <div class="flex gap-1">
              <div v-for="c in heatmapLegend" :key="c.class" class="w-6 h-5 rounded flex items-center justify-center text-xs font-semibold" :class="c.class">{{ c.label }}</div>
            </div>
            <span>Sibuk</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Laporan & Analitik — Penjahit Yan' })

const { reports, status } = useReports()

const chartColors = ['#17726d', '#519592', '#8bb9b6', '#c5dcdc', '#f3ebd5', '#b0ab9e']

const maxMonthly = computed(() => Math.max(...(reports.value?.monthlyOrders.map(m => m.count) ?? [1])))
const maxGarment = computed(() => Math.max(...(reports.value?.garmentTypes.map(g => g.count) ?? [1])))
const sortedGarments = computed(() => [...(reports.value?.garmentTypes ?? [])].sort((a, b) => b.count - a.count))

const heatmapClass = (hours: number) => {
  if (hours <= 2) return 'bg-primary-50 text-primary-400'
  if (hours <= 4) return 'bg-primary-100 text-primary-600'
  if (hours <= 6) return 'bg-primary-300 text-primary-800'
  return 'bg-primary-500 text-white'
}

const heatmapLegend = [
  { class: 'bg-primary-50 text-primary-400', label: '1' },
  { class: 'bg-primary-200 text-primary-700', label: '4' },
  { class: 'bg-primary-400 text-white', label: '7' },
  { class: 'bg-primary-600 text-white', label: '9+' },
]
</script>
