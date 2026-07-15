<template>
  <div>
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
      <div class="flex items-center gap-4 mb-6">
        <NuxtLink to="/admin/workers" class="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
        </NuxtLink>
        <div class="flex items-center gap-3 flex-1">
          <div
            class="w-14 h-14 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-2xl uppercase">
            {{ employee.name.charAt(0) }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ employee.name }}</h2>
            <p class="text-sm text-gray-500">{{ employee.role }}</p>
          </div>
        </div>
        <ui-app-badge :variant="employee.status === 'Working' ? 'success' : 'neutral'" dot>
          {{ employee.status === 'Working' ? 'Sedang Bekerja' : 'Idle' }}
        </ui-app-badge>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Profil</h3>
            <div class="space-y-3 text-sm">
              <div>
                <p class="text-xs text-gray-400">Role</p>
                <p class="font-medium">{{ employee.role }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Status</p>
                <p class="font-medium">{{ employee.status }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400">Bergabung</p>
                <p class="font-medium">{{ formatDate(employee.date_joined) }}</p>
              </div>
            </div>
          </div>

        </div>

        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:chart-bar" class="w-4 h-4 text-primary-500" />
              Produktivitas 7 Hari
            </h3>
            <template v-if="perfStatus === 'pending'">
              <div class="animate-pulse h-48 bg-gray-100 rounded-xl" />
            </template>
            <template v-else-if="performance && performance.daily.length > 0">
              <div class="h-48">
                <charts-line-chart :data="chartData" />
              </div>
            </template>
            <template v-else>
              <ui-app-empty-state icon="heroicons:chart-bar" title="Belum ada data"
                description="Belum ada aktivitas dalam 7 hari terakhir" />
            </template>
          </div>

          <div v-if="performance" class="grid grid-cols-3 gap-3">
            <div class="bg-gray-50 rounded-xl p-4 text-center">
              <p class="text-xs text-gray-400 mb-1">Total Selesai</p>
              <p class="font-bold text-gray-900 text-2xl">{{ performance.total_finished }}</p>
              <p class="text-xs text-gray-400">pcs</p>
            </div>
            <div class="bg-primary-50 rounded-xl p-4 text-center">
              <p class="text-xs text-gray-400 mb-1">Rata-rata Harian</p>
              <p class="font-bold text-primary-700 text-2xl">{{ performance.performance_score.toFixed(1) }}</p>
              <p class="text-xs text-gray-400">pcs/hari</p>
            </div>
            <div class="bg-emerald-50 rounded-xl p-4 text-center">
              <p class="text-xs text-gray-400 mb-1">Hari Aktif</p>
              <p class="font-bold text-emerald-700 text-2xl">{{ activeDays }}</p>
              <p class="text-xs text-gray-400">dari 7 hari</p>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="heroicons:clipboard-document-list" class="w-4 h-4 text-amber-500" />
              Riwayat Tugas
            </h3>
            <template v-if="tasksStatus === 'pending'">
              <div class="animate-pulse space-y-3">
                <div v-for="i in 4" :key="i" class="h-12 bg-gray-100 rounded-xl" />
              </div>
            </template>
            <template v-else-if="tasks && tasks.length > 0">
              <div class="space-y-2">
                <div v-for="task in tasks" :key="task.log_id"
                  class="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-sm text-gray-900">{{ task.receipt_number }}</span>
                      <span class="text-xs text-gray-400">·</span>
                      <span class="text-sm text-gray-600 truncate">{{ task.customer_name }}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-xs text-gray-400">{{ task.garment_type }}</span>
                      <span class="text-xs text-gray-300">·</span>
                      <span class="text-xs text-gray-400">{{ formatTime(task.completed_at) }}</span>
                    </div>
                  </div>
                  <ui-app-badge :variant="taskBadgeVariant(task.status)">
                    {{ taskLabel(task.status) }}
                  </ui-app-badge>
                </div>
              </div>
            </template>
            <template v-else>
              <ui-app-empty-state icon="heroicons:clipboard-document-list" title="Belum ada tugas"
                description="Karyawan ini belum memiliki riwayat tugas" />
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { ChartData } from 'chart.js'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const empId = Number(route.params.id)

const { employee, status: empStatus } = useEmployeeDetail(empId)
const { performance, status: perfStatus } = useEmployeePerformance(empId)
const { tasks, status: tasksStatus } = useEmployeeTasks(empId)

useSeoMeta({ title: `Karyawan — Penjahit Yan` })

const chartData = computed<ChartData<'line'>>(() => ({
  labels: performance.value?.daily.map(d => {
    const date = new Date(d.date + 'T00:00:00')
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })
  }) ?? [],
  datasets: [{
    label: 'Selesai',
    data: performance.value?.daily.map(d => d.count) ?? [],
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    fill: true,
    tension: 0.3,
    pointRadius: 4,
    pointBackgroundColor: '#6366f1',
  }],
}))

const activeDays = computed(() =>
  performance.value?.daily.filter(d => d.count > 0).length ?? 0
)

const STATUS_LABEL: Record<string, string> = {
  received: 'Diterima', cutting: 'Potong', cutted: 'Terpotong',
  sewing: 'Jahit', sewed: 'Terjahit', finishing: 'Finishing', done: 'Selesai',
}

const STATUS_VARIANT: Record<string, string> = {
  received: 'neutral', cutting: 'warning', cutted: 'info',
  sewing: 'warning', sewed: 'info', finishing: 'warning', done: 'success',
}

const taskLabel = (s: string) => STATUS_LABEL[s] ?? s
const taskBadgeVariant = (s: string) => (STATUS_VARIANT[s] ?? 'neutral') as 'success' | 'warning' | 'info' | 'neutral'

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
const formatTime = (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })
</script>