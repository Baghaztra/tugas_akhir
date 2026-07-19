<template>
  <div>
    <definePageMeta :layout="'admin'" />
    <useSeoMeta title="Laporan & Analitik — Penjahit Yan" />

    <!-- Week Navigator -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-3">
        <button
          @click="prevWeek"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <Icon name="heroicons:chevron-left" class="w-4 h-4" />
        </button>
        <div class="text-center min-w-[220px]">
          <p class="text-sm font-semibold text-gray-900">{{ weekLabel }}</p>
          <p class="text-xs text-gray-400">{{ weekSubLabel }}</p>
        </div>
        <button
          @click="nextWeek"
          class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <Icon name="heroicons:chevron-right" class="w-4 h-4" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <ui-app-button variant="ghost" size="sm" @click="goToThisWeek">
          Hari Ini
        </ui-app-button>
        <ui-app-button
          variant="outline"
          size="sm"
          icon="heroicons:arrow-down-tray"
          @click="handleExport"
        >
          Export Excel
        </ui-app-button>
      </div>
    </div>

    <!-- Skeleton -->
    <template v-if="status === 'pending'">
      <div class="animate-pulse space-y-6">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="i in 4" :key="i" class="h-24 bg-gray-100 rounded-xl" />
        </div>
        <div class="h-64 bg-gray-100 rounded-xl" />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="h-48 bg-gray-100 rounded-xl" />
          <div class="h-48 bg-gray-100 rounded-xl" />
        </div>
        <div class="h-48 bg-gray-100 rounded-xl" />
      </div>
    </template>

    <template v-else-if="recap.week_start">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Icon name="heroicons:clipboard-document-list" class="w-5 h-5 text-primary-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ recap.summary.total_orders }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Pesanan Masuk</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Icon name="heroicons:banknotes" class="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(recap.summary.total_revenue) }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Pendapatan</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Icon name="heroicons:check-badge" class="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ recap.summary.orders_completed }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Pesanan Selesai</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Icon name="heroicons:squares-2x2" class="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ recap.summary.total_items }}</p>
          <p class="text-xs text-gray-400 mt-0.5">Total Item</p>
        </div>
      </div>

      <!-- Daily Breakdown Table -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="heroicons:calendar-days" class="w-5 h-5 text-primary-500" />
            Rekap Harian
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">Pesanan masuk dan selesai per hari</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left">Hari</th>
                <th class="px-6 py-3 text-left">Tanggal</th>
                <th class="px-6 py-3 text-right">Masuk</th>
                <th class="px-6 py-3 text-right">Selesai</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="d in recap.daily"
                :key="d.date"
                class="hover:bg-gray-50 transition-colors"
                :class="isToday(d.date) ? 'bg-primary-50/50' : ''"
              >
                <td class="px-6 py-3 font-medium text-gray-900">
                  {{ d.day }}
                  <span v-if="isToday(d.date)" class="ml-1.5 text-xs text-primary-500 font-semibold">(Hari ini)</span>
                </td>
                <td class="px-6 py-3 text-gray-600">{{ formatDate(d.date) }}</td>
                <td class="px-6 py-3 text-right">
                  <span
                    class="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="d.orders_in > 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-400'"
                  >
                    {{ d.orders_in }}
                  </span>
                </td>
                <td class="px-6 py-3 text-right">
                  <span
                    class="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="d.orders_done > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'"
                  >
                    {{ d.orders_done }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="bg-gray-50 font-semibold text-gray-900">
                <td class="px-6 py-3" colspan="2">Total</td>
                <td class="px-6 py-3 text-right">{{ dailyTotal.in }}</td>
                <td class="px-6 py-3 text-right">{{ dailyTotal.done }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Garment Type & Payment Status -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Garment Type -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 class="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Icon name="icon-park-outline:clothes-suit" class="w-5 h-5 text-primary-500" />
            Jenis Pakaian
          </h3>
          <p class="text-xs text-gray-400 mb-4">Jumlah item per jenis</p>
          <div v-if="recap.by_garment_type.length === 0" class="text-center py-6 text-gray-400 text-sm">
            Tidak ada data
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(item, i) in recap.by_garment_type"
              :key="item.type"
              class="flex items-center gap-3"
            >
              <span class="text-sm text-gray-700 w-24 flex-shrink-0 truncate">{{ item.type }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-2.5">
                <div
                  class="h-2.5 rounded-full transition-all duration-700"
                  :style="{
                    width: `${(item.count / maxGarment) * 100}%`,
                    backgroundColor: chartColors[i % chartColors.length],
                  }"
                />
              </div>
              <span class="text-sm font-semibold text-gray-700 w-8 text-right">{{ item.count }}</span>
            </div>
          </div>
        </div>

        <!-- Payment Status -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 class="font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Icon name="heroicons:banknotes" class="w-5 h-5 text-emerald-500" />
            Status Pembayaran
          </h3>
          <p class="text-xs text-gray-400 mb-4">Distribusi pembayaran pesanan masuk</p>
          <div class="space-y-4">
            <div v-for="item in paymentItems" :key="item.key" class="flex items-center gap-3">
              <ui-app-badge :variant="item.badgeVariant">{{ item.label }}</ui-app-badge>
              <div class="flex-1 bg-gray-100 rounded-full h-2.5">
                <div
                  class="h-2.5 rounded-full transition-all duration-700"
                  :class="item.barColor"
                  :style="{ width: `${maxPayment > 0 ? (item.count / maxPayment) * 100 : 0}%` }"
                />
              </div>
              <span class="text-sm font-semibold text-gray-700 w-8 text-right">{{ item.count }}</span>
            </div>
          </div>
          <div
            v-if="totalPayments === 0"
            class="text-center py-6 text-gray-400 text-sm"
          >
            Tidak ada data
          </div>
        </div>
      </div>

      <!-- Productivity Table -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            <Icon name="heroicons:users" class="w-5 h-5 text-primary-500" />
            Produktivitas Karyawan
          </h3>
          <p class="text-xs text-gray-400 mt-0.5">Total item selesai dalam minggu ini</p>
        </div>
        <div v-if="productivityStatus === 'pending'" class="p-6 animate-pulse space-y-3">
          <div v-for="i in 4" :key="i" class="h-10 bg-gray-100 rounded" />
        </div>
        <div v-else-if="productivity.length === 0" class="p-8">
          <ui-app-empty-state
            icon="heroicons:users"
            title="Tidak ada data"
            description="Belum ada aktivitas karyawan dalam periode ini"
          />
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left">Karyawan</th>
                <th class="px-6 py-3 text-left">Divisi</th>
                <th class="px-6 py-3 text-right">Selesai</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="w in productivity"
                :key="w.worker"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-3">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {{ w.worker.charAt(0) }}
                    </div>
                    <span class="font-medium text-gray-900">{{ w.worker }}</span>
                  </div>
                </td>
                <td class="px-6 py-3 text-gray-600">{{ w.role }}</td>
                <td class="px-6 py-3 text-right">
                  <span
                    class="inline-flex items-center justify-center min-w-[28px] px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    :class="w.total_finished > 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-400'"
                  >
                    {{ w.total_finished }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin" });
useSeoMeta({ title: "Laporan & Analitik — Penjahit Yan" });

// ─── Week Navigator ──────────────────────────────────────────────────────────

function getSunday(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay(); // 0=Sun
  const diff = result.getDate() - day;
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

const currentWeekStart = ref(getSunday(new Date()));

function toDateStr(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getWeekEnd(start: Date): Date {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

const weekStartStr = ref(toDateStr(currentWeekStart.value));
const weekEndStr = ref(toDateStr(getWeekEnd(currentWeekStart.value)));

watch(currentWeekStart, (d) => {
  weekStartStr.value = toDateStr(d);
  weekEndStr.value = toDateStr(getWeekEnd(d));
});

const { recap, status } = useWeeklyRecap(weekStartStr);

const {
  productivity,
  status: productivityStatus,
} = useProductivity({
  startDate: weekStartStr,
  endDate: weekEndStr,
});

function prevWeek() {
  const d = new Date(currentWeekStart.value);
  d.setDate(d.getDate() - 7);
  currentWeekStart.value = d;
}

function nextWeek() {
  const d = new Date(currentWeekStart.value);
  d.setDate(d.getDate() + 7);
  currentWeekStart.value = d;
}

function goToThisWeek() {
  currentWeekStart.value = getSunday(new Date());
}

const weekLabel = computed(() => {
  const start = currentWeekStart.value;
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = months[start.getMonth()];
  const endMonth = months[end.getMonth()];
  const year = end.getFullYear();
  if (start.getMonth() === end.getMonth()) {
    return `${startDay} – ${endDay} ${startMonth} ${year}`;
  }
  return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
});

const weekSubLabel = computed(() => {
  const today = new Date();
  const todayStr = toDateStr(today);
  if (todayStr >= weekStartStr.value && todayStr <= weekEndStr.value) {
    return "Minggu ini";
  }
  if (today < currentWeekStart.value) {
    return "Minggu depan";
  }
  return "Minggu lalu";
});

// ─── Formatters ──────────────────────────────────────────────────────────────

const chartColors = ["#17726d", "#519592", "#8bb9b6", "#c5dcdc", "#eae4d2", "#b0ab9e"];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split("T")[0];
}

// ─── Computed ────────────────────────────────────────────────────────────────

const maxGarment = computed(() =>
  Math.max(...(recap.value?.by_garment_type.map((g) => g.count) ?? [1])),
);

const dailyTotal = computed(() => {
  const daily = recap.value?.daily ?? [];
  return {
    in: daily.reduce((sum, d) => sum + d.orders_in, 0),
    done: daily.reduce((sum, d) => sum + d.orders_done, 0),
  };
});

const paymentItems = computed(() => {
  const ps = recap.value?.by_payment_status ?? { paid: 0, partial: 0, unpaid: 0 };
  return [
    { key: "paid", label: "Lunas", count: ps.paid, badgeVariant: "success" as const, barColor: "bg-emerald-400" },
    { key: "partial", label: "DP", count: ps.partial, badgeVariant: "warning" as const, barColor: "bg-amber-400" },
    { key: "unpaid", label: "Belum Lunas", count: ps.unpaid, badgeVariant: "danger" as const, barColor: "bg-red-400" },
  ];
});

const totalPayments = computed(() =>
  paymentItems.value.reduce((sum, p) => sum + p.count, 0),
);

const maxPayment = computed(() =>
  Math.max(...paymentItems.value.map((p) => p.count), 1),
);

// ─── Export ──────────────────────────────────────────────────────────────────

function handleExport() {
  exportWeeklyRecap(weekStartStr.value);
}
</script>
