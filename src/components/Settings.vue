<template>
  <div class="flex flex-col gap-6 animate-fade-in pb-10">
    
    <!-- Profile Settings -->
    <div class="bg-gray-900/80 rounded-3xl p-6 shadow-lg border border-gray-800/80 backdrop-blur-sm">
      <h2 class="text-xs font-medium text-gray-400 mb-5 tracking-wider uppercase flex items-center gap-2">
        <UserIcon class="w-4 h-4" /> User Profile
      </h2>
      
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Height (cm)</label>
          <input 
            type="number" step="0.1" 
            v-model="state.settings.height" 
            class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Target Weight (kg)</label>
          <input 
            type="number" step="0.1" 
            v-model="state.settings.targetWeight" 
            class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Avg Daily Intake (kcal)</label>
          <input 
            type="number" step="10" 
            v-model="state.settings.averageIntake" 
            class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors w-full"
          />
        </div>
      </div>
    </div>

    <!-- GitHub Sync Settings -->
    <div class="bg-gray-900/80 rounded-3xl p-6 shadow-lg border border-gray-800/80 backdrop-blur-sm">
      <h2 class="text-xs font-medium text-gray-400 mb-5 tracking-wider uppercase flex items-center gap-2">
        <CloudArrowUpIcon class="w-4 h-4" /> Cloud Sync (GitHub API)
      </h2>
      
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Personal Access Token</label>
          <input 
            type="password" 
            v-model="state.settings.githubToken" 
            placeholder="ghp_..."
            class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">Repository Name</label>
          <input 
            type="text" 
            v-model="state.settings.repoName" 
            placeholder="username/inbody-data"
            class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm text-gray-300 font-medium">File Path</label>
          <input 
            type="text" 
            v-model="state.settings.filePath" 
            placeholder="data/inbody.json"
            class="bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors w-full"
          />
        </div>
        
        <div v-if="state.status.error" class="bg-red-500/10 border border-red-500/50 text-red-400 text-xs p-3 rounded-xl mt-2">
          {{ state.status.error }}
        </div>
        <div v-else-if="state.status.lastSync" class="text-xs text-emerald-400 mt-2 text-center">
          Last synced: {{ new Date(state.status.lastSync).toLocaleString() }}
        </div>

        <button 
          @click="syncData"
          class="mt-2 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl py-3 transition-colors flex items-center justify-center gap-2 border border-gray-700"
          :disabled="state.status.loading"
        >
          <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': state.status.loading }" />
          <span>{{ state.status.loading ? 'Syncing...' : 'Sync from GitHub' }}</span>
        </button>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { state, syncFromGitHub } from '../store/database';
import { UserIcon, CloudArrowUpIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';

const syncData = async () => {
  if (!state.settings.githubToken || !state.settings.repoName || !state.settings.filePath) {
    state.status.error = 'Please fill in all GitHub settings';
    return;
  }
  await syncFromGitHub();
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
