<template>
  <Bar :data="data" :options="mergedOptions" />
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import type { ChartData, ChartOptions } from "chart.js";

const props = defineProps<{
  data: ChartData<"bar">;
  options?: ChartOptions<"bar">;
}>();

const defaultOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1f2937",
      titleColor: "#fff",
      bodyColor: "#fff",
      cornerRadius: 8,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#9ca3af", font: { size: 11 } },
    },
    y: {
      grid: { color: "#f3f4f6" },
      ticks: { color: "#9ca3af", font: { size: 11 }, stepSize: 1 },
      beginAtZero: true,
    },
  },
};

const mergedOptions = computed(() => ({
  ...defaultOptions,
  ...props.options,
}));
</script>
