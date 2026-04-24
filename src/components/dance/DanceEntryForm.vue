<template>
  <div class="flex flex-col gap-4 animate-fade-in pb-10">
    <div class="bg-gray-900/80 rounded-3xl p-6 shadow-lg border border-gray-800/80 backdrop-blur-sm">
      <h2 class="text-xs font-medium text-gray-400 mb-6 tracking-wider uppercase">New Dance Log</h2>
      
      <form @submit.prevent="saveEntry" class="flex flex-col gap-6">
        
        <!-- Date -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Date</label>
          <input 
            type="date" 
            v-model="form.date" 
            required
            class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors w-full appearance-none"
          />
        </div>

        <!-- Styles (Multiple Choice) -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Dance Styles</label>
          <div class="flex flex-wrap gap-2">
            <button 
              type="button"
              v-for="style in availableStyles" :key="style.name"
              @click="toggleStyle(style.name)"
              class="px-4 py-2 rounded-xl text-sm font-bold transition-all border"
              :class="form.styles.includes(style.name) 
                ? `${style.activeClass} border-transparent shadow-[0_0_15px_rgba(255,255,255,0.1)]` 
                : 'bg-black text-gray-500 border-gray-800 hover:border-gray-600'"
            >
              {{ style.name }}
            </button>
          </div>
        </div>

        <!-- Duration -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Duration (minutes)</label>
          <div class="grid grid-cols-4 gap-2">
            <button 
              type="button"
              v-for="dur in [30, 60, 90, 120]" :key="dur"
              @click="form.duration = dur"
              class="py-2 rounded-xl text-sm font-bold transition-all border"
              :class="form.duration === dur 
                ? 'bg-white text-black border-white' 
                : 'bg-black text-gray-400 border-gray-800 hover:border-gray-600'"
            >
              {{ dur }}m
            </button>
          </div>
        </div>

        <!-- Intensity Slider -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <label class="text-sm text-gray-300 font-medium">Intensity (1-5)</label>
            <span class="text-lg font-bold" :class="intensityColor">{{ form.intensity }}</span>
          </div>
          <input 
            type="range" min="1" max="5" step="1" 
            v-model="form.intensity"
            class="w-full accent-emerald-500"
          />
          <div class="flex justify-between text-[10px] text-gray-500">
            <span>Light</span>
            <span>Intense</span>
          </div>
        </div>

        <!-- Focus / Notes -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Focus / Notes</label>
          <textarea 
            v-model="form.notes"
            rows="2"
            placeholder="What did you focus on today?"
            class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors w-full"
          ></textarea>
        </div>

        <!-- Video URL -->
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Video Link</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CameraIcon class="h-5 w-5 text-gray-500" />
            </div>
            <input 
              type="url" 
              v-model="form.video_url"
              placeholder="Google Drive link..."
              class="bg-black border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors w-full"
            />
          </div>
        </div>

        <button 
          type="submit" 
          class="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-lg rounded-2xl py-4 transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          :disabled="isSaving || form.styles.length === 0"
        >
          <span v-if="!isSaving">Save Dance Log</span>
          <span v-else class="flex items-center justify-center gap-2">
            <div class="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            Saving...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { danceState, addDanceLog } from '../../store/danceStore';
import { CameraIcon } from '@heroicons/vue/24/outline';

const emit = defineEmits(['saved']);

const availableStyles = [
  { name: 'Breaking', activeClass: 'bg-blue-600 text-white' },
  { name: 'Jazz', activeClass: 'bg-purple-600 text-white' },
  { name: 'Hip Hop', activeClass: 'bg-orange-500 text-white' }
];

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  date: today,
  styles: [],
  duration: 60,
  intensity: 3,
  notes: '',
  video_url: ''
});

const isSaving = ref(false);

const toggleStyle = (styleName) => {
  const index = form.styles.indexOf(styleName);
  if (index > -1) {
    form.styles.splice(index, 1);
  } else {
    form.styles.push(styleName);
  }
};

const intensityColor = computed(() => {
  const val = parseInt(form.intensity);
  if (val <= 2) return 'text-blue-400';
  if (val === 3) return 'text-yellow-400';
  return 'text-red-500';
});

const saveEntry = async () => {
  if (form.styles.length === 0) {
    alert("Please select at least one dance style.");
    return;
  }
  
  isSaving.value = true;
  
  // Create a unique ID
  const id = `d_${form.date.replace(/-/g, '')}_${Date.now()}`;

  const newRecord = {
    id,
    date: form.date,
    styles: [...form.styles], // Note: user wants multi-select so we store an array, but schema originally had "style": "Breaking". We'll use styles.
    duration: parseInt(form.duration),
    intensity: parseInt(form.intensity),
    notes: form.notes,
    video_url: form.video_url
  };

  await addDanceLog(newRecord);
  
  isSaving.value = false;
  
  // Reset form (keep date)
  form.styles = [];
  form.notes = '';
  form.video_url = '';
  
  emit('saved');
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
