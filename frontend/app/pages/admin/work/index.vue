<template>
  <div class="h-[calc(100vh-2rem)] flex flex-col">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between shrink-0">
      <div class="flex gap-3">
        <ui-app-button variant="secondary" @click="refreshWork" :loading="status === 'pending'">
          <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2" /> Segarkan
        </ui-app-button>
        <ui-app-button variant="primary" @click="navigateTo('/admin/work/history')">
          <Icon name="heroicons:clock" class="w-4 h-4 mr-2" /> Riwayat
        </ui-app-button>
      </div>
    </div>

    <!-- Kanban Board -->
    <div v-if="status === 'pending' && !data?.phases?.length" class="flex-1 flex items-center justify-center">
      <div class="flex flex-col items-center text-gray-400 animate-pulse">
        <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mb-4" />
        <p>Memuat papan kerja...</p>
      </div>
    </div>

    <div v-else class="flex-1 overflow-x-auto pb-4">
      <div class="flex gap-6 h-full min-w-max">
        <!-- Phase Columns -->
        <div v-for="phase in data?.phases" :key="phase.phase"
          class="w-[400px] flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100 shrink-0">

          <!-- Phase Header -->
          <div class="p-4 border-b border-gray-100 flex items-center gap-3 shrink-0"
            :class="phaseBgColors[phase.phase]">
            <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Icon :name="phaseIcons[phase.phase]!" class="w-5 h-5" :class="phaseIconColors[phase.phase]" />
            </div>
            <div>
              <h2 class="font-bold text-gray-900 text-lg">{{ phase.phase_label }}</h2>
              <div class="flex gap-2 text-xs font-medium mt-1">
                <span class="text-gray-500">{{ phase.ready_count }} Menunggu</span>
                <span class="text-gray-300">•</span>
                <span :class="phaseCountColors[phase.phase]">{{ phase.in_progress_count }} Sedang Dikerjakan</span>
              </div>
            </div>
          </div>

          <!-- Sub Columns Container -->
          <div class="flex-1 p-4 overflow-y-auto space-y-6">

            <!-- Sedang Dikerjakan (In Progress) -->
            <div>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Icon name="heroicons:play-circle" class="w-4 h-4" /> Sedang Dikerjakan
                <span class="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{{ phase.in_progress_count
                }}</span>
              </h3>

              <div class="space-y-3">
                <div v-if="phase.in_progress.length === 0"
                  class="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  Tidak ada yang sedang dikerjakan
                </div>
                <div v-else v-for="task in phase.in_progress" :key="task.item_id"
                  class="bg-white rounded-xl border border-primary-500 shadow-sm p-4 transition-all hover:shadow-md">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-xs text-gray-400 font-mono">{{ task.receiptNumber }}</span>
                    <ui-app-badge :variant="urgencyVariant(task.urgency_label)">{{ urgencyText(task.urgency_label)
                    }}</ui-app-badge>
                  </div>
                  <h4 class="font-semibold text-gray-900 mb-1">{{ task.garmentType }}</h4>
                  <p class="text-sm text-gray-500 mb-3">{{ task.customerName }}</p>

                  <div
                    class="flex items-center gap-2 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                    <div class="w-5 h-5 rounded-full bg-primary-200 flex items-center justify-center text-[10px]">
                      {{ task.assigned_worker_name?.charAt(0) ?? 'W' }}
                    </div>
                    {{ task.assigned_worker_name }}
                  </div>
                  <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                    <p class="text-sm text-gray-500">Diambil {{ task.deadline }}</p>

                    <ui-app-button variant="primary" size="sm" @click="handleComplete(task.item_id)"
                      :loading="actionLoading">
                      Selesai
                    </ui-app-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Menunggu Dikerjakan (Ready) -->
            <div>
              <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Icon name="heroicons:inbox-arrow-down" class="w-4 h-4" /> Menunggu Dikerjakan
                <span class="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">{{ phase.ready_count
                }}</span>
              </h3>

              <div class="space-y-3">
                <div v-if="phase.ready.length === 0"
                  class="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                  Semua tugas sudah di-assign
                </div>
                <div v-else v-for="task in phase.ready" :key="task.item_id"
                  class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 transition-all hover:shadow-md">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-xs text-gray-400 font-mono">{{ task.receiptNumber }}</span>
                    <ui-app-badge :variant="urgencyVariant(task.urgency_label)">{{ urgencyText(task.urgency_label)
                    }}</ui-app-badge>
                  </div>
                  <h4 class="font-semibold text-gray-900 mb-1">{{ task.garmentType }}</h4>
                  <p class="text-sm text-gray-500 mb-3">{{ task.customerName }}</p>

                  <div class="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <p class="text-sm text-gray-500">Diambil {{ task.deadline }}</p>

                    <ui-app-button variant="secondary" size="sm" @click="openAssignModal(task.item_id, phase.phase)">
                      <Icon name="heroicons:user-plus" class="w-4 h-4 mr-1.5" /> Tugaskan
                    </ui-app-button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <ui-app-modal :show="isAssignModalOpen" title="Tugaskan Pekerja">
      <div class="p-6">
        <p class="text-sm text-gray-600 mb-4">Pilih pekerja yang sedang <span class="font-bold">Idle</span> untuk tugas
          ini.</p>

        <div v-if="!availableWorkers.length" class="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
          <Icon name="heroicons:users" class="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p class="text-sm text-gray-500">Tidak ada pekerja Idle di bagian ini.</p>
        </div>

        <div v-else class="space-y-2">
          <button v-for="worker in availableWorkers" :key="worker.id" @click="selectedWorkerId = worker.id" :class="[
            'w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left',
            selectedWorkerId === worker.id ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-gray-300'
          ]">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700">
                {{ worker.name.charAt(0) }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ worker.name }}</p>
                <p class="text-xs text-gray-500">{{ worker.role }}</p>
              </div>
            </div>
            <Icon v-if="selectedWorkerId === worker.id" name="heroicons:check-circle"
              class="w-6 h-6 text-primary-500" />
          </button>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <ui-app-button variant="secondary" @click="isAssignModalOpen = false">Batal</ui-app-button>
          <ui-app-button variant="primary" @click="submitAssign" :disabled="!selectedWorkerId"
            :loading="actionLoading">Simpan Penugasan</ui-app-button>
        </div>
      </div>
    </ui-app-modal>

    <!-- Confirm Modal -->
    <ui-app-confirm-modal :show="confirmModal.show" :title="confirmModal.title" :message="confirmModal.message"
      :confirm-text="confirmModal.confirmText" :confirm-variant="confirmModal.confirmVariant" :icon="confirmModal.icon"
      :loading="confirmModal.loading" @confirm="confirmModal.onConfirm" @cancel="confirmModal.show = false" />

  </div>
</template>

<script setup lang="ts">
import { useAdminWork, useAdminTaskActions } from '~/composables/useTasks'
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Papan Kerja — Penjahit Yan' })

const { data, status, refresh: refreshWork } = useAdminWork()
const { assignWorker, completeTask, loading: actionLoading } = useAdminTaskActions()
const { employees } = useEmployees()

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
  cutting: 'bg-blue-50/50',
  sewing: 'bg-violet-50/50',
  finishing: 'bg-amber-50/50',
}
const phaseCountColors: Record<string, string> = {
  cutting: 'text-blue-600',
  sewing: 'text-violet-600',
  finishing: 'text-amber-600',
}

const urgencyVariant = (label: string) =>
  ({ red: 'danger', yellow: 'warning', green: 'success' }[label] ?? 'neutral') as any
const urgencyText = (label: string) =>
  ({ red: 'Mendesak', yellow: 'Hati-hati', green: 'Aman' }[label] ?? label)


// Modal State
const isAssignModalOpen = ref(false)
const selectedItemId = ref<number | null>(null)
const selectedWorkerId = ref<number | null>(null)
const currentModalPhase = ref('')

const confirmModal = ref({
  show: false,
  title: 'Konfirmasi',
  message: '',
  confirmText: 'Konfirmasi',
  confirmVariant: 'primary' as 'primary' | 'secondary' | 'danger',
  icon: 'heroicons:exclamation-triangle',
  onConfirm: () => { },
  loading: false
})

const openConfirm = (config: {
  title?: string,
  message: string,
  confirmText?: string,
  variant?: 'primary' | 'secondary' | 'danger',
  icon?: string,
  onConfirm: () => void
}) => {
  confirmModal.value = {
    show: true,
    title: config.title || 'Konfirmasi',
    message: config.message,
    confirmText: config.confirmText || 'Konfirmasi',
    confirmVariant: config.variant || 'primary',
    icon: config.icon || 'heroicons:exclamation-triangle',
    onConfirm: config.onConfirm,
    loading: false
  }
}

const openAssignModal = (itemId: number, phase: string) => {
  selectedItemId.value = itemId
  currentModalPhase.value = phase
  selectedWorkerId.value = null
  isAssignModalOpen.value = true
}

// Map phase id to Worker Role
const roleMap: Record<string, string> = {
  cutting: 'Potong',
  sewing: 'Jahit',
  finishing: 'Finishing'
}

const availableWorkers = computed(() => {
  if (!employees.value) return []
  const targetRole = roleMap[currentModalPhase.value]
  return employees.value.filter(w => w.role === targetRole && w.status === 'Idle')
})

const submitAssign = async () => {
  if (!selectedItemId.value || !selectedWorkerId.value) return

  const res = await assignWorker(selectedItemId.value, selectedWorkerId.value)
  if (res.success) {
    isAssignModalOpen.value = false
    refreshWork()
  } else {
    openConfirm({
      title: 'Gagal',
      message: 'Gagal menugaskan pekerja. Silakan coba lagi.',
      confirmText: 'Tutup',
      variant: 'danger',
      onConfirm: () => confirmModal.value.show = false
    })
  }
}

const handleComplete = (itemId: number) => {
  openConfirm({
    title: 'Selesaikan Pekerjaan',
    message: 'Tandai item ini selesai dan lanjutkan ke tahap berikutnya?',
    confirmText: 'Ya, Selesai',
    icon: 'heroicons:check-circle',
    onConfirm: async () => {
      confirmModal.value.loading = true
      try {
        const res = await completeTask(itemId)
        if (res.success) {
          refreshWork()
          confirmModal.value.show = false
        } else {
          openConfirm({
            title: 'Gagal',
            message: 'Gagal memperbarui status. Silakan coba lagi.',
            confirmText: 'Tutup',
            variant: 'danger',
            onConfirm: () => confirmModal.value.show = false
          })
        }
      } finally {
        confirmModal.value.loading = false
      }
    }
  })
}
</script>
