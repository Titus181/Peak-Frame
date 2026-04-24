<template>
  <div class="flex flex-col gap-6 animate-fade-in">
    <DanceAnalytics />
    <DanceList />
  </div>
</template>

<script setup>
import DanceAnalytics from '../components/dance/DanceAnalytics.vue';
import DanceList from '../components/dance/DanceList.vue';
</script>
