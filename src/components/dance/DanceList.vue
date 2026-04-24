<template>
  <div class="flex flex-col gap-4 animate-fade-in pb-10">
    <div class="flex justify-between items-center px-2">
      <h2 class="text-xs font-medium text-gray-400 tracking-wider uppercase">Training Logs</h2>
      
      <!-- Style Filter -->
      <select 
        v-model="currentFilter"
        class="bg-black border border-gray-800 text-xs text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500"
      >
        <option value="All">All Styles</option>
        <option value="Breaking">Breaking</option>
        <option value="Jazz">Jazz</option>
        <option value="Hip Hop">Hip Hop</option>
      </select>
    </div>

    <div v-if="filteredLogs.length === 0" class="bg-gray-900/80 rounded-3xl p-10 text-center shadow-lg border border-gray-800/80 flex flex-col items-center justify-center gap-3">
      <p class="text-gray-400 text-sm">今日尚未練習，來段 Groove 吧！</p>
      <div class="w-16 h-16 rounded-full bg-purple-900/20 flex items-center justify-center">
        <MusicalNoteIcon class="w-8 h-8 text-purple-500 opacity-50" />
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div 
        v-for="log in filteredLogs" 
        :key="log.id"
        class="bg-gray-900/80 rounded-2xl p-4 shadow-lg border border-gray-800/80 backdrop-blur-sm relative overflow-hidden group"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="flex flex-col">
            <span class="font-bold text-white tracking-wide">{{ formatDate(log.date) }}</span>
            <div class="flex gap-1 mt-1 flex-wrap">
              <span 
                v-for="style in (Array.isArray(log.styles) ? log.styles : [log.style])" 
                :key="style"
                class="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                :class="getStyleColor(style)"
              >
                {{ style }}
              </span>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <!-- Video Link -->
            <a 
              v-if="log.video_url" 
              :href="log.video_url" 
              target="_blank"
              class="flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs px-2 py-1.5 rounded-lg transition-colors"
            >
              <PlayIcon class="w-4 h-4" />
              <span>Play</span>
            </a>
            
            <!-- Delete Button -->
            <button 
              @click="confirmDelete(log.id, log.date)"
              class="text-gray-600 hover:text-red-500 transition-colors bg-black/40 p-1.5 rounded-lg"
            >
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mb-3">
          <div class="flex flex-col bg-black/40 rounded-xl p-2 px-3">
            <span class="text-[10px] text-gray-500 font-medium uppercase mb-0.5">Duration</span>
            <span class="text-white font-bold text-sm">{{ log.duration }}<span class="text-[10px] text-gray-500 ml-1">min</span></span>
          </div>
          <div class="flex flex-col bg-black/40 rounded-xl p-2 px-3">
            <span class="text-[10px] text-gray-500 font-medium uppercase mb-0.5">Intensity</span>
            <div class="flex gap-0.5 mt-1">
              <div v-for="i in 5" :key="i" class="w-full h-1.5 rounded-full" :class="i <= log.intensity ? getIntensityColor(log.intensity) : 'bg-gray-800'"></div>
            </div>
          </div>
        </div>

        <div v-if="log.notes" class="bg-black/20 rounded-xl p-3 border border-gray-800/50">
          <p class="text-xs text-gray-300 leading-relaxed">{{ log.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { danceState, deleteDanceLog } from '../../store/danceStore';
import { TrashIcon, PlayIcon, MusicalNoteIcon } from '@heroicons/vue/24/outline';
import { PlayIcon as PlayIconSolid } from '@heroicons/vue/24/solid';

const currentFilter = ref('All');

const filteredLogs = computed(() => {
  if (currentFilter.value === 'All') return danceState.logs;
  return danceState.logs.filter(log => {
    if (Array.isArray(log.styles)) return log.styles.includes(currentFilter.value);
    return log.style === currentFilter.value;
  });
});

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const getStyleColor = (style) => {
  switch(style) {
    case 'Breaking': return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
    case 'Jazz': return 'bg-purple-900/30 text-purple-400 border-purple-800/50';
    case 'Hip Hop': return 'bg-orange-900/30 text-orange-400 border-orange-800/50';
    default: return 'bg-gray-800 text-gray-400 border-gray-700';
  }
};

const getIntensityColor = (intensity) => {
  if (intensity <= 2) return 'bg-blue-400';
  if (intensity === 3) return 'bg-yellow-400';
  return 'bg-red-500';
};

const confirmDelete = async (id, date) => {
  if (confirm(`Are you sure you want to delete the dance log for ${date}?`)) {
    await deleteDanceLog(id);
  }
};
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
