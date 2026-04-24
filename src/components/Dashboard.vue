<template>
  <div class="flex flex-col gap-5 animate-fade-in">
    <!-- Latest Stats Card -->
    <div class="bg-gray-900/80 rounded-3xl p-6 shadow-lg border border-gray-800/80 backdrop-blur-sm">
      <h2 class="text-xs font-medium text-gray-400 mb-4 tracking-wider uppercase">Latest Measurement</h2>
      <div v-if="latestRecord">
        <div class="flex justify-between items-end mb-6">
          <div>
            <div class="text-5xl font-bold tracking-tight text-white drop-shadow-sm">{{ latestRecord.weight }}<span class="text-xl text-gray-500 font-normal ml-1">kg</span></div>
            <div class="text-xs text-emerald-400 mt-2 font-medium tracking-wide">BMI: {{ latestRecord.bmi }}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500 bg-black/50 px-2 py-1 rounded-md">{{ formatDate(latestRecord.date) }}</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-black/40 rounded-2xl p-4 border border-gray-800/50 flex flex-col justify-between shadow-inner">
            <span class="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Body Fat</span>
            <div class="text-2xl font-bold text-orange-400">{{ latestRecord.pbf }}<span class="text-sm text-gray-600 font-normal ml-1">%</span></div>
          </div>
          <div class="bg-black/40 rounded-2xl p-4 border border-gray-800/50 flex flex-col justify-between shadow-inner">
            <span class="text-[10px] text-gray-500 font-medium mb-1 uppercase tracking-wider">Muscle Mass</span>
            <div class="text-2xl font-bold text-emerald-400">{{ latestRecord.skeletal_muscle_mass }}<span class="text-sm text-gray-600 font-normal ml-1">kg</span></div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-10 text-gray-500 text-sm">
        No records yet. Go to Record tab to add one!
      </div>
    </div>

    <!-- Target Progress -->
    <div v-if="latestRecord" class="bg-gray-900/80 rounded-3xl p-6 shadow-lg border border-gray-800/80 backdrop-blur-sm">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xs font-medium text-gray-400 tracking-wider uppercase">Target Progress</h2>
        <span class="text-xs font-semibold bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md">{{ state.settings.targetWeight }} kg</span>
      </div>
      <div class="w-full bg-black/60 rounded-full h-4 mb-3 overflow-hidden border border-gray-800/50 shadow-inner">
        <div class="bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out relative" 
             :style="{ width: `${progressPercentage}%` }">
             <div class="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 font-medium">
        <span>Current: {{ latestRecord.weight }}kg</span>
        <span class="text-emerald-400">{{ progressPercentage }}%</span>
      </div>
    </div>

    <!-- Predictive TDEE & Target Countdown -->
    <PredictionsCard />

    <!-- 168 Fasting Status -->
    <div class="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 shadow-lg border border-gray-800/80 relative overflow-hidden">
      <div class="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
      <h2 class="text-xs font-medium text-gray-400 mb-3 tracking-wider uppercase">168 Fasting Window (12:00-18:30)</h2>
      <div class="flex items-center gap-4">
        <div class="relative">
          <div class="w-4 h-4 rounded-full" :class="isEatingWindow ? 'bg-emerald-500' : 'bg-orange-500'"></div>
          <div v-if="isEatingWindow" class="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
        </div>
        <span class="text-xl font-bold tracking-tight text-white drop-shadow-sm">
          {{ isEatingWindow ? 'Eating Window Open' : 'Fasting Time' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { state } from '../store/database';
import { calculateTargetProgress, check168Status } from '../utils/calculations';
import PredictionsCard from './PredictionsCard.vue';

const latestRecord = computed(() => {
  if (state.records.length === 0) return null;
  return state.records[state.records.length - 1];
});

const progressPercentage = computed(() => {
  if (!latestRecord.value) return 0;
  // Find start weight (max weight) to calculate meaningful progress
  const startWeight = Math.max(...state.records.map(r => r.weight));
  return calculateTargetProgress(latestRecord.value.weight, state.settings.targetWeight, startWeight);
});

const isEatingWindow = ref(check168Status());

let timer;
onMounted(() => {
  timer = setInterval(() => {
    isEatingWindow.value = check168Status();
  }, 60000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
