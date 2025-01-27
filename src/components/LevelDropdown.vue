<script setup>
  import { ref } from 'vue'
  import { useDifficultyStore } from '@/stores/difficulty';

  const difficultyStore = useDifficultyStore()
  
  
</script>

<template>
  <v-container>
    <v-select
      v-model="difficultyStore.selectedOption"
      :items="difficultyStore.options"
      label="Level"
      item-title="label"
      item-value="value"
    style="font-size: x-large;"
    >
    </v-select>
  </v-container>
</template>

<style scoped>
  .w-full {
    width: 100%;
  }
</style>
