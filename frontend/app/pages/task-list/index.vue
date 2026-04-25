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

    <!-- Summary Stats -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div v-for="phase in phases" :key="phase.phase" :class="[
        'rounded-xl border p-3 text-center transition-all duration-200 cursor-pointer select-none',
        activePhaseFilter === phase.phase
          ? phaseActiveStyles[phase.phase]
          : 'bg-white border-gray-100 hover:border-gray-200'
      ]" @click="togglePhaseFilter(phase.phase)">
        <div class="flex items-center justify-center gap-1.5 mb-1">
          <Icon :name="phaseIcons[phase.phase]!" class="w-4 h-4" :class="phaseIconColors[phase.phase]" />
          <span class="text-xs font-medium text-gray-500">{{ phase.phase_label }}</span>
        </div>
        <p class="text-2xl font-bold" :class="phaseCountColors[phase.phase]">{{ phase.count }}</p>
      </div>
    </div>

    <!-- Phase Sections -->
    <template v-if="status === 'pending'">
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="space-y-3">
          <div class="h-5 bg-gray-200 rounded w-24 animate-pulse" />
          <div v-for="j in 2" :key="j" class="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3">
            <div class="h-4 bg-gray-200 rounded w-1/2" />
            <div class="h-3 bg-gray-200 rounded w-1/3" />
            <div class="flex gap-2 mt-3">
              <div class="h-9 bg-gray-200 rounded-xl flex-1" />
              <div class="h-9 bg-gray-200 rounded-xl flex-1" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="!totalCount" class="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <ui-app-empty-state icon="heroicons:check-circle" title="Tidak ada tugas aktif"
        description="Semua pekerjaan selesai! Hubungi admin untuk tugas baru." />
    </div>

    <div v-else class="space-y-6">
      <template v-for="phase in displayedPhases" :key="phase.phase">
        <div v-if="phase.count > 0">
          <!-- Phase Header -->
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="phaseBgColors[phase.phase]">
              <Icon :name="phaseIcons[phase.phase]!" class="w-4.5 h-4.5" :class="phaseIconColors[phase.phase]" />
            </div>
            <h2 class="font-semibold text-gray-900">{{ phase.phase_label }}</h2>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="phaseBadgeColors[phase.phase]">{{
              phase.count }}</span>
            <div class="flex-1 h-px bg-gray-100 ml-2" />
          </div>

          <!-- Task Cards -->
          <div class="space-y-3">
            <div v-for="(task, i) in phase.tasks" :key="task.item_id" :class="[
              'bg-white rounded-2xl border shadow-sm p-5 transition-all duration-200 hover:shadow-md',
              i === 0 ? phaseBorderHighlight[phase.phase] : 'border-gray-100'
            ]">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span v-if="i === 0" class="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                      :class="phaseHighPriorityBadge[phase.phase]">
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
                  {{ formatDate(task.deadline) }}
                </span>
                <ui-app-badge :variant="urgencyVariant(task.urgency_label)">{{ urgencyText(task.urgency_label)
                  }}</ui-app-badge>
              </div>


            </div>
          </div>
        </div>
      </template>
    </div>


  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'employee' })
useSeoMeta({ title: 'Papan Tugas — Penjahit Yan' })

// Simulasi auth: always employee id 1 (di produksi ganti dengan session/auth store)
const currentEmployeeId = ref(1)
const { employee } = useEmployeeDetail(currentEmployeeId.value)

const stageFilter = ref('semua')
const { phases, totalCount, status } = useEmployeeTasks(stageFilter)

// Phase filter: klik summary card untuk filter satu phase
const activePhaseFilter = ref<string | null>(null)

const togglePhaseFilter = (phase: string) => {
  activePhaseFilter.value = activePhaseFilter.value === phase ? null : phase
}

const displayedPhases = computed(() => {
  if (!activePhaseFilter.value) return phases.value
  return phases.value.filter(p => p.phase === activePhaseFilter.value)
})

const roleLabel: Record<string, string> = {
  Potong: 'Potong', Jahit: 'Jahit', Finishing: 'Finishing',
  cutting: 'Potong', sewing: 'Jahit', finishing: 'Finishing',
}

// Phase visual config
const phaseIcons: Record<string, string> = {
  cutting: 'heroicons:scissors',
  sewing: 'heroicons:wrench-screwdriver',
  finishing: 'heroicons:sparkles',
}

const phaseIconColors: Record<string, string> = {
  cutting: 'text-blue-500',
  sewing: 'text-violet-500',
  finishing: 'text-amber-500',
}

const phaseBgColors: Record<string, string> = {
  cutting: 'bg-blue-50',
  sewing: 'bg-violet-50',
  finishing: 'bg-amber-50',
}

const phaseBadgeColors: Record<string, string> = {
  cutting: 'bg-blue-100 text-blue-700',
  sewing: 'bg-violet-100 text-violet-700',
  finishing: 'bg-amber-100 text-amber-700',
}

const phaseCountColors: Record<string, string> = {
  cutting: 'text-blue-600',
  sewing: 'text-violet-600',
  finishing: 'text-amber-600',
}

const phaseActiveStyles: Record<string, string> = {
  cutting: 'bg-blue-50 border-blue-200 ring-1 ring-blue-100',
  sewing: 'bg-violet-50 border-violet-200 ring-1 ring-violet-100',
  finishing: 'bg-amber-50 border-amber-200 ring-1 ring-amber-100',
}

const phaseBorderHighlight: Record<string, string> = {
  cutting: 'border-blue-200 bg-blue-50/30',
  sewing: 'border-violet-200 bg-violet-50/30',
  finishing: 'border-amber-200 bg-amber-50/30',
}

const phaseHighPriorityBadge: Record<string, string> = {
  cutting: 'text-blue-600 bg-blue-100',
  sewing: 'text-violet-600 bg-violet-100',
  finishing: 'text-amber-600 bg-amber-100',
}

const urgencyVariant = (label: string) =>
  ({ red: 'danger', yellow: 'warning', green: 'success' }[label] ?? 'neutral') as any

const urgencyText = (label: string) =>
  ({ red: 'Mendesak', yellow: 'Hati-hati', green: 'Aman' }[label] ?? label)

const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

</script>
