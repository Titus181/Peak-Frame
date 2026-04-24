<template>
  <div class="flex flex-col gap-5 animate-fade-in pb-4">
    
    <!-- This Month's Heatmap -->
    <div class="bg-gray-900/80 rounded-3xl p-5 shadow-lg border border-gray-800/80 backdrop-blur-sm">
      <h2 class="text-xs font-medium text-gray-400 mb-4 tracking-wider uppercase">Activity Heatmap (This Month)</h2>
      
      <div class="grid grid-cols-7 gap-1.5 mt-2">
        <!-- Day Headers -->
        <div v-for="day in ['S','M','T','W','T','F','S']" :key="'h'+day" class="text-[10px] text-center text-gray-600 font-medium">
          {{ day }}
        </div>
        
        <!-- Empty cells for padding start of month -->
        <div v-for="i in blankDays" :key="'blank'+i" class="aspect-square rounded-md bg-transparent"></div>
        
        <!-- Days of the month -->
        <div 
          v-for="day in daysInMonth" :key="day.date"
          class="aspect-square rounded-md transition-all flex items-center justify-center text-[10px]"
          :class="getHeatmapColor(day.duration)"
        >
          <span v-if="day.duration > 0" class="text-white/80 font-bold opacity-0 hover:opacity-100">{{ day.duration }}</span>
        </div>
      </div>
      
      <div class="flex justify-between items-center mt-3 text-[10px] text-gray-500">
        <span>Less</span>
        <div class="flex gap-1">
          <div class="w-3 h-3 rounded bg-gray-800"></div>
          <div class="w-3 h-3 rounded bg-purple-900/40"></div>
          <div class="w-3 h-3 rounded bg-purple-700/60"></div>
          <div class="w-3 h-3 rounded bg-purple-500/80"></div>
          <div class="w-3 h-3 rounded bg-purple-400"></div>
        </div>
        <span>More</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="bg-gray-900/80 rounded-3xl p-5 shadow-lg border border-gray-800/80 backdrop-blur-sm">
      <h2 class="text-xs font-medium text-gray-400 mb-2 tracking-wider uppercase">Style Distribution</h2>
      <div v-if="danceState.logs.length === 0" class="text-center py-6 text-gray-500 text-sm">
        No dance data available yet.
      </div>
      <div v-else class="w-full h-[250px] relative">
        <div ref="pieChartRef" class="w-full h-full absolute inset-0"></div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, shallowRef, onUnmounted } from 'vue';
import * as echarts from 'echarts/core';
import { PieChart, BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { danceState } from '../../store/danceStore';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, PieChart, BarChart, CanvasRenderer]);

// --- Heatmap Logic ---
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

const daysInMonth = computed(() => {
  const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = [];
  
  // Create a map of date to total duration
  const durationMap = {};
  danceState.logs.forEach(log => {
    const logDate = new Date(log.date);
    if (logDate.getFullYear() === currentYear && logDate.getMonth() === currentMonth) {
      const d = logDate.getDate();
      durationMap[d] = (durationMap[d] || 0) + log.duration;
    }
  });

  for (let i = 1; i <= numDays; i++) {
    days.push({
      date: i,
      duration: durationMap[i] || 0
    });
  }
  return days;
});

const blankDays = computed(() => {
  return new Date(currentYear, currentMonth, 1).getDay();
});

const getHeatmapColor = (duration) => {
  if (duration === 0) return 'bg-gray-800/50';
  if (duration <= 30) return 'bg-purple-900/40';
  if (duration <= 60) return 'bg-purple-700/60';
  if (duration <= 90) return 'bg-purple-500/80';
  return 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.4)]';
};

// --- ECharts Logic ---
const pieChartRef = ref(null);
const pieChartInstance = shallowRef(null);

const styleColors = {
  'Breaking': '#2563eb', // blue-600
  'Jazz': '#9333ea',    // purple-600
  'Hip Hop': '#f97316'  // orange-500
};

const renderCharts = () => {
  if (!pieChartRef.value || danceState.logs.length === 0) return;
  
  if (!pieChartInstance.value) {
    pieChartInstance.value = echarts.init(pieChartRef.value);
  }

  // Calculate style distribution
  const styleCounts = {};
  danceState.logs.forEach(log => {
    if (Array.isArray(log.styles)) {
      log.styles.forEach(s => {
        styleCounts[s] = (styleCounts[s] || 0) + 1;
      });
    } else if (log.style) { // fallback for older schema
       styleCounts[log.style] = (styleCounts[log.style] || 0) + 1;
    }
  });

  const pieData = Object.keys(styleCounts).map(style => ({
    name: style,
    value: styleCounts[style],
    itemStyle: { color: styleColors[style] || '#10b981' }
  }));

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: 'rgba(17, 17, 17, 0.9)', textStyle: { color: '#fff' } },
    legend: { bottom: 0, textStyle: { color: '#9ca3af' }, icon: 'circle' },
    series: [
      {
        name: 'Styles',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#111',
          borderWidth: 2
        },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold', color: '#fff' }
        },
        labelLine: { show: false },
        data: pieData
      }
    ]
  };

  pieChartInstance.value.setOption(pieOption);
};

onMounted(() => {
  renderCharts();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  if (pieChartInstance.value) pieChartInstance.value.dispose();
  window.removeEventListener('resize', handleResize);
});

const handleResize = () => {
  if (pieChartInstance.value) pieChartInstance.value.resize();
};

watch(() => danceState.logs, () => {
  renderCharts();
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
