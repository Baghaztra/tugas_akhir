<template>
  <div>
    <definePageMeta :layout="'admin'" />
    <useSeoMeta title="Dashboard Admin — Penjahit Yan" />

    <!-- Quick Actions -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <NuxtLink
        to="/admin/orders/create"
        class="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-primary-200 transition-all group"
      >
        <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
          <Icon name="heroicons:plus-circle" class="w-5 h-5 text-primary-500" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900">Buat Pesanan</p>
          <p class="text-xs text-gray-400">Pesanan baru</p>
        </div>
      </NuxtLink>
      <NuxtLink
        to="/admin/workers"
        class="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-emerald-200 transition-all group"
      >
        <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
          <Icon name="heroicons:user-plus" class="w-5 h-5 text-emerald-500" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900">Tambah Karyawan</p>
          <p class="text-xs text-gray-400">Kelola tim</p>
        </div>
      </NuxtLink>
      <NuxtLink
        to="/admin/reports"
        class="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition-all group"
      >
        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <Icon name="heroicons:arrow-down-tray" class="w-5 h-5 text-blue-500" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-gray-900">Export Laporan</p>
          <p class="text-xs text-gray-400">Rekap mingguan</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <ui-app-stat-card
        label="Pesanan Aktif"
        :value="summary.activeOrders"
        icon="heroicons:clipboard-document-list"
        color="primary"
        :loading="status === 'pending'"
      />
      <ui-app-stat-card
        label="Pendapatan Minggu Ini"
        :value="summary.weeklyRevenue"
        icon="heroicons:banknotes"
        color="success"
        :is-currency="true"
        :loading="status === 'pending'"
      />
      <ui-app-stat-card
        label="Selesai Hari Ini"
        :value="summary.todayDone"
        icon="heroicons:check-badge"
        color="info"
        :loading="status === 'pending'"
      />
      <ui-app-stat-card
        label="Mendekati Deadline"
        :value="summary.overdueOrders"
        icon="heroicons:exclamation-triangle"
        color="danger"
        :loading="status === 'pending'"
      />
    </div>

    <!-- Trend Chart + Notifications -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Trend Chart -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="heroicons:chart-bar" class="w-5 h-5 text-primary-500" />
          Tren Pesanan 7 Hari
        </h2>
        <template v-if="status === 'pending'">
          <div class="animate-pulse space-y-3">
            <div class="flex items-end gap-2 h-48">
              <div v-for="i in 7" :key="i" class="flex-1 bg-gray-200 rounded-t" :style="{ height: `${30 + i * 15}px` }" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="h-48">
            <charts-bar-chart :data="trendChartData" />
          </div>
          <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 bg-primary-400 rounded inline-block" />
              Masuk
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 bg-secondary-400 rounded inline-block" />
              Selesai
            </span>
          </div>
        </template>
      </div>

      <!-- Notifications -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="heroicons:bell-alert" class="w-5 h-5 text-amber-500" />
          Notifikasi
        </h2>
        <template v-if="status === 'pending'">
          <div class="animate-pulse space-y-3">
            <div v-for="i in 3" :key="i" class="h-14 bg-gray-100 rounded-lg" />
          </div>
        </template>
        <div v-else-if="!notifications.length" class="text-center py-8 text-gray-400 text-sm">
          <Icon name="heroicons:check-circle" class="w-10 h-10 mx-auto mb-2 text-emerald-300" />
          Tidak ada notifikasi
        </div>
        <div v-else class="space-y-2 max-h-48 overflow-y-auto">
          <NuxtLink
            v-for="notif in notifications"
            :key="notif.id"
            :to="`/admin/orders/${notif.id}`"
            class="flex gap-3 p-3 rounded-xl border transition-colors"
            :class="notif.urgency === 'critical' ? 'bg-red-50 border-red-100 hover:bg-red-100' : notif.urgency === 'high' ? 'bg-amber-50 border-amber-100 hover:bg-amber-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'"
          >
            <Icon
              :name="notif.urgency === 'critical' ? 'heroicons:fire' : 'heroicons:clock'"
              class="w-4 h-4 mt-0.5 flex-shrink-0"
              :class="notif.urgency === 'critical' ? 'text-red-500' : 'text-amber-500'"
            />
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold text-gray-900 truncate">{{ notif.receiptNumber }}</p>
              <p class="text-xs text-gray-500 truncate">{{ notif.customerName }} · {{ notif.garmentType ?? '-' }}</p>
            </div>
            <span class="text-xs font-medium whitespace-nowrap" :class="notif.urgency === 'critical' ? 'text-red-600' : 'text-amber-600'">
              {{ notif.daysLeft <= 0 ? 'Overdue' : `${notif.daysLeft}h` }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Charts: Garment Type + Payment -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Garment Type Doughnut -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="icon-park-outline:clothes-suit" class="w-5 h-5 text-primary-500" />
          Jenis Pakaian
        </h2>
        <template v-if="productTrendsStatus === 'pending'">
          <div class="animate-pulse flex items-center justify-center h-48">
            <div class="w-32 h-32 bg-gray-200 rounded-full" />
          </div>
        </template>
        <div v-else-if="!productTrends.length" class="flex items-center justify-center h-48 text-gray-400 text-sm">
          Tidak ada data
        </div>
        <div v-else class="h-48">
          <charts-doughnut-chart :data="garmentChartData" />
        </div>
      </div>

      <!-- Payment Status Doughnut -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="heroicons:banknotes" class="w-5 h-5 text-emerald-500" />
          Status Pembayaran
        </h2>
        <template v-if="status === 'pending'">
          <div class="animate-pulse flex items-center justify-center h-48">
            <div class="w-32 h-32 bg-gray-200 rounded-full" />
          </div>
        </template>
        <div v-else-if="totalPayments === 0" class="flex items-center justify-center h-48 text-gray-400 text-sm">
          Tidak ada data
        </div>
        <div v-else class="h-48">
          <charts-doughnut-chart :data="paymentChartData" />
        </div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-semibold text-gray-900">Pesanan Terbaru</h2>
        <NuxtLink to="/admin/orders" class="text-sm text-primary-500 hover:text-primary-700 font-medium">
          Lihat Semua →
        </NuxtLink>
      </div>
      <template v-if="ordersStatus === 'pending'">
        <div class="p-6 animate-pulse space-y-3">
          <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 rounded" />
        </div>
      </template>
      <div v-else-if="!orders.length" class="p-8">
        <ui-app-empty-state icon="heroicons:clipboard-document-list" title="Belum ada pesanan" description="Buat pesanan pertama Anda" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 text-left">Resi</th>
              <th class="px-6 py-3 text-left">Pelanggan</th>
              <th class="px-6 py-3 text-left">Jenis</th>
              <th class="px-6 py-3 text-left">Status</th>
              <th class="px-6 py-3 text-left">Deadline</th>
              <th class="px-6 py-3 text-left">Pembayaran</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="order in orders.slice(0, 5)"
              :key="order.id"
              class="hover:bg-gray-50 transition-colors cursor-pointer"
              @click="navigateTo(`/admin/orders/${order.id}`)"
            >
              <td class="px-6 py-3 font-mono text-xs text-gray-600">{{ order.receiptNumber }}</td>
              <td class="px-6 py-3 font-medium text-gray-900">{{ order.customerName }}</td>
              <td class="px-6 py-3 text-gray-600">{{ getGarmentName(order) }}</td>
              <td class="px-6 py-3">
                <ui-app-badge :variant="statusBadge(getItemStatus(order)).variant" dot>
                  {{ statusBadge(getItemStatus(order)).label }}
                </ui-app-badge>
              </td>
              <td class="px-6 py-3 text-gray-600 text-xs">{{ formatDate(order.deadline) }}</td>
              <td class="px-6 py-3">
                <ui-app-badge :variant="paymentBadge(order.paymentStatus).variant">
                  {{ paymentBadge(order.paymentStatus).label }}
                </ui-app-badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Productivity Table -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-semibold text-gray-900">Produktivitas Karyawan</h2>
        <NuxtLink to="/admin/reports" class="text-sm text-primary-500 hover:text-primary-700 font-medium">
          Lihat Semua →
        </NuxtLink>
      </div>
      <template v-if="productivityStatus === 'pending'">
        <div class="p-6 animate-pulse space-y-3">
          <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 rounded" />
        </div>
      </template>
      <div v-else-if="!productivity.length" class="p-8">
        <ui-app-empty-state icon="heroicons:users" title="Tidak ada data" description="Belum ada aktivitas karyawan" />
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 text-left">Karyawan</th>
              <th class="px-6 py-3 text-left">Divisi</th>
              <th class="px-6 py-3 text-right">Selesai</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr
              v-for="w in productivity.slice(0, 5)"
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
  </div>
</template>

<script setup lang="ts">
import type { ChartData } from "chart.js";
import type { Order } from "../../../shared/types/order";

definePageMeta({ layout: "admin" });
useSeoMeta({ title: "Dashboard Admin — Penjahit Yan" });

// ─── Data Fetching ──────────────────────────────────────────────────────────

const { summary, trend, notifications, status } = useDashboard();
const { orders, status: ordersStatus } = useOrders();
const { productTrends, status: productTrendsStatus } = useProductTrends();
const { productivity, status: productivityStatus } = useProductivity();

// ─── Trend Chart Data ───────────────────────────────────────────────────────

const trendChartData = computed<ChartData<"bar">>(() => {
  const t = trend.value;
  if (!t?.labels?.length) return { labels: [], datasets: [] };

  const shortLabels = t.labels.map((l) => {
    const parts = l.split(" ");
    return parts.length > 1 ? parts[1] ?? l : l;
  });

  return {
    labels: shortLabels,
    datasets: [
      {
        label: "Masuk",
        data: t.incoming,
        backgroundColor: "#519592",
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
      {
        label: "Selesai",
        data: t.completed,
        backgroundColor: "#f3ebd5",
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.7,
      },
    ],
  };
});

// ─── Garment Doughnut Data ──────────────────────────────────────────────────

const garmentColors = ["#17726d", "#519592", "#8bb9b6", "#c5dcdc", "#eae4d2", "#b0ab9e", "#8c897e", "#5e5b54"];

const garmentChartData = computed<ChartData<"doughnut">>(() => {
  const data = productTrends.value ?? [];
  return {
    labels: data.map((d) => d.type),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((_, i) => garmentColors[i % garmentColors.length]),
        borderWidth: 0,
      },
    ],
  };
});

// ─── Payment Doughnut Data ──────────────────────────────────────────────────

const totalPayments = computed(() => {
  const pb = summary.value.paymentBreakdown;
  return pb.paid + pb.partial + pb.unpaid;
});

const paymentChartData = computed<ChartData<"doughnut">>(() => {
  const pb = summary.value.paymentBreakdown;
  return {
    labels: ["Lunas", "DP", "Belum Lunas"],
    datasets: [
      {
        data: [pb.paid, pb.partial, pb.unpaid],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 0,
      },
    ],
  };
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function getGarmentName(order: Order): string {
  const firstItem = order.items?.[0];
  return firstItem?.garmentType?.name ?? "-";
}

function getItemStatus(order: Order): string {
  const firstItem = order.items?.[0];
  return firstItem?.status ?? "received";
}

const statusBadge = (s: string) =>
  ({
    received: { variant: "info" as const, label: "Diterima" },
    cutting: { variant: "warning" as const, label: "Potong" },
    cutted: { variant: "warning" as const, label: "Selesai Potong" },
    sewing: { variant: "warning" as const, label: "Jahit" },
    sewed: { variant: "warning" as const, label: "Selesai Jahit" },
    finishing: { variant: "warning" as const, label: "Finishing" },
    done: { variant: "success" as const, label: "Selesai" },
  })[s] ?? { variant: "neutral" as const, label: s };

const paymentBadge = (p: string | undefined) =>
  ({
    paid: { variant: "success" as const, label: "Lunas" },
    unpaid: { variant: "danger" as const, label: "Belum" },
    partial: { variant: "warning" as const, label: "DP" },
  })[p ?? ""] ?? { variant: "neutral" as const, label: p ?? "-" };

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
</script>
