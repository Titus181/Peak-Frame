<template>
  <div class="flex flex-col gap-5 animate-fade-in pb-10">
    <div class="flex bg-black/50 rounded-xl p-1.5 border border-gray-800/80 backdrop-blur-sm shadow-inner">
      <button 
        @click="type = 'inbody'" 
        class="flex-1 py-2.5 text-xs font-bold tracking-wider uppercase rounded-lg transition-all" 
        :class="type === 'inbody' ? 'bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'"
      >
        InBody
      </button>
      <button 
        @click="type = 'dance'" 
        class="flex-1 py-2.5 text-xs font-bold tracking-wider uppercase rounded-lg transition-all" 
        :class="type === 'dance' ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'"
      >
        Dance
      </button>
    </div>
    
    <EntryForm v-if="type === 'inbody'" @saved="$emit('saved')" />
    <DanceEntryForm v-if="type === 'dance'" @saved="$emit('saved')" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import EntryForm from '../components/EntryForm.vue';
import DanceEntryForm from '../components/dance/DanceEntryForm.vue';

const emit = defineEmits(['saved']);
const type = ref('inbody');
</script>
