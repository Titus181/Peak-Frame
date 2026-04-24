<template>
  <div class="flex flex-col gap-4 animate-fade-in pb-10">
    <div class="bg-gray-900/80 rounded-3xl p-6 shadow-lg border border-gray-800/80 backdrop-blur-sm">
      <h2 class="text-xs font-medium text-gray-400 mb-6 tracking-wider uppercase">New Measurement</h2>
      
      <form @submit.prevent="saveEntry" class="flex flex-col gap-5">
        
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

        <div class="grid grid-cols-2 gap-4">
          <!-- Weight -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-300 font-medium text-blue-400">Weight (kg)</label>
            <input 
              type="number" step="0.1" 
              v-model="form.weight" 
              required
              class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-center"
            />
          </div>

          <!-- Body Fat % (PBF) -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-300 font-medium text-orange-400">Body Fat (%)</label>
            <input 
              type="number" step="0.1" 
              v-model="form.pbf" 
              required
              class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors text-center"
            />
          </div>

          <!-- Muscle Mass -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-300 font-medium text-emerald-400">Muscle (kg)</label>
            <input 
              type="number" step="0.1" 
              v-model="form.skeletal_muscle_mass" 
              required
              class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors text-center"
            />
          </div>

          <!-- Visceral Fat Level -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-300 font-medium text-purple-400">Visceral Fat</label>
            <input 
              type="number" step="1" 
              v-model="form.visceral_fat_level" 
              class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-center"
            />
          </div>
          
          <!-- BMR -->
          <div class="flex flex-col gap-2 col-span-2">
            <label class="text-sm text-gray-300 font-medium text-pink-400">BMR (kcal)</label>
            <input 
              type="number" step="1" 
              v-model="form.bmr" 
              class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors text-center"
            />
          </div>
        </div>

        <button 
          type="submit" 
          class="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-lg rounded-2xl py-4 transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          :disabled="isSaving"
        >
          <span v-if="!isSaving">Save Record</span>
          <span v-else class="flex items-center justify-center gap-2">
            <div class="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
            Saving...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { state, addRecord } from '../store/database';
import { calculateBMI, calculateSMI } from '../utils/calculations';

const emit = defineEmits(['saved']);

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  date: today,
  weight: '',
  skeletal_muscle_mass: '',
  pbf: '',
  visceral_fat_level: '',
  bmr: ''
});

const isSaving = ref(false);

const saveEntry = async () => {
  if (!form.weight || !form.skeletal_muscle_mass || !form.pbf) return;
  
  isSaving.value = true;
  
  const weight = parseFloat(form.weight);
  const pbf = parseFloat(form.pbf);
  const skeletal_muscle_mass = parseFloat(form.skeletal_muscle_mass);
  const height = parseFloat(state.settings.height);

  const newRecord = {
    date: form.date,
    weight,
    skeletal_muscle_mass,
    pbf,
    body_fat_mass: Number((weight * (pbf / 100)).toFixed(1)),
    bmi: calculateBMI(weight, height),
    smi: calculateSMI(skeletal_muscle_mass, height),
    visceral_fat_level: form.visceral_fat_level ? parseInt(form.visceral_fat_level) : null,
    bmr: form.bmr ? parseInt(form.bmr) : null
  };

  await addRecord(newRecord);
  
  isSaving.value = false;
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

/* Hide number input spinners */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
input[type=number] {
  -moz-appearance: textfield;
}
</style>
