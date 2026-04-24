<template>
  <div class="flex flex-col gap-5 animate-fade-in h-full">
    <div class="bg-gray-900/80 rounded-3xl p-5 shadow-lg border border-gray-800/80 backdrop-blur-sm flex flex-col flex-1">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-sm font-medium text-gray-200 tracking-wide">Trends</h2>
        
        <!-- Filter Tabs -->
        <div class="flex bg-black/50 rounded-lg p-1 border border-gray-800/80">
          <button 
            v-for="filter in filters" :key="filter.value"
            @click="currentFilter = filter.value"
            class="px-3 py-1 text-xs font-medium rounded-md transition-all"
            :class="currentFilter === filter.value ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Chart Container -->
      <div class="flex-1 w-full min-h-[350px] relative">
        <div v-if="filteredRecords.length === 0" class="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          Not enough data to display chart.
        </div>
        <div ref="chartRef" class="w-full h-full absolute inset-0"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, shallowRef, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { state } from '../store/database';

echarts.use([
  TitleComponent, TooltipComponent, GridComponent, LegendComponent, 
  LineChart, CanvasRenderer, DataZoomComponent
]);

const filters = [
  { label: '3M', value: 3 },
  { label: '6M', value: 6 },
  { label: 'ALL', value: 0 }
];
const currentFilter = ref(3);
const chartRef = ref(null);
const chartInstance = shallowRef(null);

const filteredRecords = computed(() => {
  if (currentFilter.value === 0) return state.records;
  
  const now = new Date();
  const cutoff = new Date();
  cutoff.setMonth(now.getMonth() - currentFilter.value);
  
  return state.records.filter(r => new Date(r.date) >= cutoff);
});

const renderChart = () => {
  if (!chartRef.value || filteredRecords.value.length === 0) return;
  
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value);
  }

  const dates = filteredRecords.value.map(r => r.date);
  const weights = filteredRecords.value.map(r => r.weight);
  const bodyFats = filteredRecords.value.map(r => r.pbf);
  const muscles = filteredRecords.value.map(r => r.skeletal_muscle_mass);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(17, 17, 17, 0.9)',
      borderColor: '#333',
      textStyle: { color: '#f3f4f6' },
      axisPointer: { type: 'cross', label: { backgroundColor: '#333' } }
    },
    legend: {
      data: ['Weight (kg)', 'Body Fat (%)', 'Muscle (kg)'],
      textStyle: { color: '#9ca3af', fontSize: 10 },
      bottom: 0,
      icon: 'circle',
      itemGap: 15
    },
    grid: {
      top: 30,
      left: 10,
      right: 10,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: { 
        color: '#6b7280', 
        fontSize: 10,
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }
      },
      axisLine: { lineStyle: { color: '#374151' } },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Weight',
        nameTextStyle: { color: '#3b82f6', fontSize: 10 },
        position: 'left',
        scale: true,
        axisLine: { show: true, lineStyle: { color: '#374151' } },
        axisLabel: { color: '#3b82f6', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1f2937', type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Fat %',
        nameTextStyle: { color: '#f97316', fontSize: 10 },
        position: 'right',
        scale: true,
        axisLine: { show: true, lineStyle: { color: '#374151' } },
        axisLabel: { color: '#f97316', fontSize: 10 },
        splitLine: { show: false }
      },
      {
        type: 'value',
        position: 'right',
        offset: 0,
        scale: true,
        axisLine: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Weight (kg)',
        type: 'line',
        yAxisIndex: 0,
        data: weights,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 6,
        smooth: true
      },
      {
        name: 'Body Fat (%)',
        type: 'line',
        yAxisIndex: 1,
        data: bodyFats,
        itemStyle: { color: '#f97316' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 6,
        smooth: true
      },
      {
        name: 'Muscle (kg)',
        type: 'line',
        yAxisIndex: 2,
        data: muscles,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 6,
        smooth: true
      }
    ]
  };

  chartInstance.value.setOption(option, true);
};

onMounted(() => {
  renderChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
  }
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize();
  }
};

watch([filteredRecords, currentFilter], () => {
  renderChart();
}, { deep: true });
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
