<template>
  <div class="bg-gray-900/80 rounded-3xl p-6 shadow-lg border border-gray-800/80 backdrop-blur-sm animate-fade-in relative overflow-hidden">
    <!-- Background Glow -->
    <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
    <div class="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
    
    <div class="flex items-center gap-2 mb-5">
      <SparklesIcon class="w-5 h-5 text-purple-400" />
      <h2 class="text-xs font-medium text-gray-400 tracking-wider uppercase">Probability Engineer</h2>
    </div>

    <div v-if="!predictions" class="py-6 text-center text-sm text-gray-500 flex flex-col gap-2 items-center">
      <ChartBarIcon class="w-8 h-8 text-gray-700" />
      <span>Need more data to generate predictions. Keep logging your weight!</span>
    </div>

    <div v-else class="flex flex-col gap-6 relative z-10">
      
      <!-- Dynamic TDEE & Deficit -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-black/40 rounded-2xl p-4 border border-gray-800/50 shadow-inner flex flex-col justify-between">
          <span class="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Dynamic TDEE</span>
          <div class="flex items-end gap-1">
            <span class="text-2xl font-bold text-white">{{ predictions.dynamicTDEE }}</span>
            <span class="text-xs text-gray-500 mb-1">kcal</span>
          </div>
        </div>
        <div class="bg-black/40 rounded-2xl p-4 border border-gray-800/50 shadow-inner flex flex-col justify-between">
          <span class="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Net Deficit</span>
          <div class="flex items-end gap-1">
            <span class="text-2xl font-bold" :class="predictions.dailyDeficit > 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ predictions.dailyDeficit > 0 ? '-' : '+' }}{{ Math.abs(predictions.dailyDeficit) }}
            </span>
            <span class="text-xs text-gray-500 mb-1">kcal/d</span>
          </div>
        </div>
      </div>

      <!-- Projection Message -->
      <div v-if="!predictions.isLosingWeight" class="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-xs text-orange-400 leading-relaxed text-center">
        Weight trend is stable or increasing ({{ (predictions.trendKgPerDay * 1000).toFixed(0) }}g/day). 
        Increase caloric deficit to predict target date.
      </div>
      
      <!-- Target Countdown -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex justify-between items-end border-b border-gray-800 pb-2">
          <span class="text-[10px] text-gray-400 uppercase tracking-wider">Target Date ({{ state.settings.targetWeight }}kg)</span>
          <span class="text-lg font-bold text-blue-400">{{ formatDate(predictions.p50Date) }}</span>
        </div>

        <!-- Confidence Intervals -->
        <div class="flex flex-col gap-2">
          <span class="text-[10px] text-gray-500 font-medium uppercase mb-1">Confidence Intervals</span>
          
          <div class="relative pt-6 pb-2">
            <!-- Timeline Line -->
            <div class="absolute top-8 left-0 w-full h-1 bg-gray-800 rounded-full"></div>
            
            <!-- P10: Optimistic -->
            <div class="absolute top-7 transform -translate-x-1/2 flex flex-col items-center" style="left: 10%;">
              <div class="text-[9px] text-emerald-400 mb-2 whitespace-nowrap">{{ formatDate(predictions.p10Date) }}</div>
              <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] border-2 border-black z-10"></div>
              <div class="text-[9px] text-gray-600 mt-1 font-bold">P10</div>
            </div>

            <!-- P50: Expected -->
            <div class="absolute top-7 transform -translate-x-1/2 flex flex-col items-center" style="left: 50%;">
              <div class="text-[10px] text-blue-400 mb-1.5 whitespace-nowrap font-bold">{{ formatDate(predictions.p50Date) }}</div>
              <div class="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] border-2 border-black z-10"></div>
              <div class="text-[9px] text-gray-500 mt-1 font-bold">P50</div>
            </div>

            <!-- P90: Pessimistic -->
            <div class="absolute top-7 transform -translate-x-1/2 flex flex-col items-center" style="left: 90%;">
              <div class="text-[9px] text-orange-400 mb-2 whitespace-nowrap">{{ formatDate(predictions.p90Date) }}</div>
              <div class="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] border-2 border-black z-10"></div>
              <div class="text-[9px] text-gray-600 mt-1 font-bold">P90</div>
            </div>
          </div>
          
          <div class="flex justify-between text-[9px] text-gray-600 mt-5">
            <span>Optimistic</span>
            <span>Expected</span>
            <span>Conservative</span>
          </div>
        </div>
      </div>
      
      <div class="text-[9px] text-gray-600 text-center mt-2">
        Based on {{ predictions.daysEvaluated }} days moving average.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { state } from '../store/database';
import { calculatePredictions } from '../utils/predictions';
import { SparklesIcon, ChartBarIcon } from '@heroicons/vue/24/outline';

const predictions = computed(() => {
  return calculatePredictions(state.records, state.settings.targetWeight, state.settings.averageIntake);
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
