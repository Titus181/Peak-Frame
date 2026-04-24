<template>
  <div class="flex flex-col gap-4 animate-fade-in pb-10">
    <div class="flex justify-between items-center px-2">
      <h2 class="text-xs font-medium text-gray-400 tracking-wider uppercase">History Log</h2>
      <span class="text-xs text-gray-500">{{ sortedRecords.length }} Records</span>
    </div>

    <div v-if="sortedRecords.length === 0" class="bg-gray-900/80 rounded-3xl p-10 text-center shadow-lg border border-gray-800/80">
      <p class="text-gray-500 text-sm">No history data available.</p>
    </div>

    <div class="flex flex-col gap-3">
      <div 
        v-for="record in sortedRecords" 
        :key="record.date"
        class="bg-gray-900/80 rounded-2xl p-4 shadow-lg border border-gray-800/80 backdrop-blur-sm relative overflow-hidden group"
      >
        <div class="flex justify-between items-center mb-3">
          <span class="font-bold text-white tracking-wide">{{ formatDate(record.date) }}</span>
          <button 
            @click="confirmDelete(record.date)"
            class="text-gray-600 hover:text-red-500 transition-colors bg-black/40 p-1.5 rounded-lg"
          >
            <TrashIcon class="w-4 h-4" />
          </button>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div class="flex flex-col items-center bg-black/40 rounded-xl p-2">
            <span class="text-[10px] text-blue-400 font-medium uppercase mb-1">Weight</span>
            <span class="text-white font-bold">{{ record.weight }}<span class="text-[10px] text-gray-500 ml-0.5">kg</span></span>
          </div>
          <div class="flex flex-col items-center bg-black/40 rounded-xl p-2">
            <span class="text-[10px] text-orange-400 font-medium uppercase mb-1">Body Fat</span>
            <span class="text-white font-bold">{{ record.pbf }}<span class="text-[10px] text-gray-500 ml-0.5">%</span></span>
          </div>
          <div class="flex flex-col items-center bg-black/40 rounded-xl p-2">
            <span class="text-[10px] text-emerald-400 font-medium uppercase mb-1">Muscle</span>
            <span class="text-white font-bold">{{ record.skeletal_muscle_mass }}<span class="text-[10px] text-gray-500 ml-0.5">kg</span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { state, deleteRecord } from '../store/database';
import { TrashIcon } from '@heroicons/vue/24/outline';

const sortedRecords = computed(() => {
  // Sort descending by date (newest first)
  return [...state.records].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

const confirmDelete = async (date) => {
  if (confirm(`Are you sure you want to delete the record for ${date}?`)) {
    await deleteRecord(date);
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
