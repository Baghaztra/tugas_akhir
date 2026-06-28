<template>
  <Doughnut :data="data" :options="mergedOptions" />
</template>

<script setup lang="ts">
import { Doughnut } from "vue-chartjs";
import type { ChartData, ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  data: ChartData<"doughnut">;
  options?: ChartOptions<"doughnut">;
}>();

const defaultOptions: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "65%",
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: {
        color: "#6b7280",
        font: { size: 11 },
        padding: 16,
        usePointStyle: true,
        pointStyleWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: "#1f2937",
      titleColor: "#fff",
      bodyColor: "#fff",
      cornerRadius: 8,
      padding: 10,
    },
  },
};

const mergedOptions = computed(() => ({
  ...defaultOptions,
  ...props.options,
}));
</script>
