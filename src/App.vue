<template>
  <div class="min-h-screen bg-[#0a0a0a] text-gray-100 flex justify-center">
    <!-- Desktop wrapper: limit width to 430px (iPhone Pro Max) to keep mobile layout on desktop -->
    <div class="w-full max-w-[430px] bg-black min-h-screen flex flex-col relative shadow-2xl overflow-hidden border-x border-gray-900/50">
      
      <!-- Header -->
      <header class="pt-10 pb-3 px-6 border-b border-gray-900 flex justify-between items-center bg-black/80 backdrop-blur-xl z-10 sticky top-0">
        <h1 class="text-xl font-bold bg-gradient-to-r from-blue-500 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
          InBody Lite
        </h1>
        <div class="flex items-center gap-2">
           <div v-if="inbodyState.status.loading || danceState.status.loading" class="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto no-scrollbar pb-24 px-5 py-6">
        <Dashboard v-if="currentTab === 'dashboard'" />
        <InBodyView v-if="currentTab === 'inbody'" />
        <DanceView v-if="currentTab === 'dance'" />
        <RecordView v-if="currentTab === 'record'" @saved="currentTab = 'dashboard'" />
        <Settings v-if="currentTab === 'settings'" />
      </main>

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-black/90 backdrop-blur-xl border-t border-gray-900 pb-safe pt-2 px-6 flex justify-between items-center z-20">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="currentTab = tab.id"
          class="flex flex-col items-center p-2 rounded-xl transition-all duration-300"
          :class="currentTab === tab.id ? 'text-emerald-400 scale-110' : 'text-gray-500 hover:text-gray-300'"
        >
          <component :is="tab.icon" class="w-6 h-6 mb-1" :class="currentTab === tab.id ? 'stroke-2' : 'stroke-1.5'" />
          <span class="text-[10px] font-medium tracking-wide">{{ tab.name }}</span>
        </button>
      </nav>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { HomeIcon, ChartBarIcon, FireIcon, PlusCircleIcon, Cog8ToothIcon } from '@heroicons/vue/24/outline';
import { state as inbodyState, initApp as initInBody } from './store/database';
import { danceState, initDanceApp } from './store/danceStore';

import Dashboard from './components/Dashboard.vue';
import InBodyView from './views/InBodyView.vue';
import DanceView from './views/DanceView.vue';
import RecordView from './views/RecordView.vue';
import Settings from './components/Settings.vue';

const currentTab = ref('dashboard');

const tabs = [
  { id: 'dashboard', name: 'Home', icon: HomeIcon },
  { id: 'inbody', name: 'Body', icon: ChartBarIcon },
  { id: 'dance', name: 'Dance', icon: FireIcon },
  { id: 'record', name: 'Record', icon: PlusCircleIcon },
  { id: 'settings', name: 'Settings', icon: Cog8ToothIcon },
];

onMounted(() => {
  initInBody();
  initDanceApp();
});
</script>

<style>
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 24px);
}
</style>
