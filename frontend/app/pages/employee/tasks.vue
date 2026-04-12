<template>
  <div>
    <!-- Current Employee Picker (info dari backend /workers/{id}) -->
    <div class="mb-4 flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <div class="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
        {{ employee?.name?.charAt(0) ?? 'E' }}
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-gray-900">{{ employee?.name }}</p>
        <p class="text-xs text-gray-400">{{ roleLabel[employee?.role ?? ''] }}</p>
      </div>
      <ui-app-badge :variant="employee?.status === 'Working' ? 'success' : 'neutral'" dot>
        {{ employee?.status === 'Working' ? 'Bekerja' : 'Idle' }}
      </ui-app-badge>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Active Tasks -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="heroicons:fire" class="w-5 h-5 text-amber-500" />
            Tugas Aktif <span class="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">{{ tasks?.length }}</span>
          </h2>
        </div>

        <!-- Skeleton -->
        <template v-if="status === 'pending'">
          <div class="space-y-3">
            <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
              <div class="h-4 bg-gray-200 rounded w-1/2" />
              <div class="h-3 bg-gray-200 rounded w-1/3" />
              <div class="flex gap-2 mt-3">
                <div class="h-9 bg-gray-200 rounded-xl flex-1" />
                <div class="h-9 bg-gray-200 rounded-xl flex-1" />
              </div>
            </div>
          </div>
        </template>

        <div v-else-if="!tasks?.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ui-app-empty-state icon="heroicons:check-circle" title="Tidak ada tugas aktif" description="Semua pekerjaan selesai! Hubungi admin untuk tugas baru." />
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(task, i) in tasks"
            :key="task.id"
            :class="[
              'bg-white rounded-2xl border shadow-sm p-5 transition-all duration-200',
              i === 0 ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
            ]"
          >
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span v-if="i === 0" class="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                    <Icon name="heroicons:arrow-up" class="w-3 h-3" />Prioritas Tinggi
                  </span>
                  <span class="text-xs text-gray-400 font-mono">{{ task.receiptNumber }}</span>
                </div>
                <p class="font-semibold text-gray-900">{{ task.garmentType }}</p>
                <p class="text-sm text-gray-500">{{ task.customerName }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-400">Deadline</p>
                <p class="text-xs font-semibold text-gray-700">{{ formatDate(task.deadline) }}</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span class="flex items-center gap-1">
                <Icon name="heroicons:calendar" class="w-3.5 h-3.5" />
                Deadline: {{ formatDate(task.deadline) }}
              </span>
              <ui-app-badge :variant="urgencyVariant(task.urgency_label)">{{ urgencyText(task.urgency_label) }}</ui-app-badge>
            </div>
            <div class="flex gap-2">
              <ui-app-button variant="outline" size="sm" class="flex-1" :loading="actionLoading && activeTaskId === task.id" @click="handleTake(task.id, task.status)">
                Ambil Tugas
              </ui-app-button>
              <ui-app-button size="sm" class="flex-1" icon="heroicons:check" :loading="actionLoading && activeTaskId === task.id" @click="handleComplete(task.id, task.status)">
                Selesai
              </ui-app-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Today -->
      <div>
        <h2 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Icon name="heroicons:check-circle" class="w-5 h-5 text-emerald-500" />
          Selesai Hari Ini <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full ml-1">{{ completed?.length }}</span>
        </h2>

        <div v-if="!completed?.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <ui-app-empty-state icon="heroicons:clock" title="Belum ada yang selesai" description="Pekerjaan yang selesai akan muncul di sini." />
        </div>

        <div v-else class="space-y-3">
          <div v-for="task in completed" :key="task.id" class="bg-white rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-sm p-5 opacity-80">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-700">{{ task.garmentType }}</p>
                <p class="text-sm text-gray-400">{{ task.customerName }}</p>
              </div>
              <div class="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                <Icon name="heroicons:check" class="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Completion Toast (Opportunistic UI) -->
    <Transition name="toast">
      <div v-if="completionToast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-medium z-50">
        <Icon name="heroicons:check-circle" class="w-5 h-5" />
        Tugas berhasil diselesaikan! 🎉
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'employee' })
useSeoMeta({ title: 'Papan Tugas — Penjahit Yan' })

// Simulasi auth: always employee id 1 (di produksi ganti dengan session/auth store)
const currentEmployeeId = ref(1)
const { employee } = useEmployeeDetail(currentEmployeeId.value)

const stageFilter = ref('semua')
const { tasks, status, refresh } = useEmployeeTasks(stageFilter)
const { takeTask, completeTask, loading: actionLoading } = useTaskActions()

// Completed tasks hari ini: pesanan yang statusnya 'done' dan di-assign ke worker ini
const completed = computed(() =>
  tasks.value?.filter(t => t.status === 'done') ?? []
)

const activeTaskId = ref<number | null>(null)
const completionToast = ref(false)

const roleLabel: Record<string, string> = {
  Potong: 'Potong', Jahit: 'Jahit', Finishing: 'Finishing',
  cutting: 'Potong', sewing: 'Jahit', finishing: 'Finishing',
}

const urgencyVariant = (label: string) =>
  ({ red: 'danger', yellow: 'warning', green: 'success' }[label] ?? 'neutral') as any

const urgencyText = (label: string) =>
  ({ red: 'Mendesak', yellow: 'Hati-hati', green: 'Aman' }[label] ?? label)

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

const handleTake = async (id: number, status: string) => {
  activeTaskId.value = id
  await takeTask(id, employee.value?.name ?? 'Unknown')
  activeTaskId.value = null
  await refresh()
}

const handleComplete = async (id: number, status: string) => {
  activeTaskId.value = id
  await completeTask(id, status)
  activeTaskId.value = null
  completionToast.value = true
  await refresh()
  setTimeout(() => (completionToast.value = false), 3000)
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
