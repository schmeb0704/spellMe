import { defineStore } from 'pinia'
import { ref } from 'vue'
import { watchEffect } from 'vue'

export const useDifficultyStore = defineStore('difficulty', () => {
  // You can also store your options in the store if needed
  const options = ref([
    { label: 'Easy ', value: 1 },
    { label: 'Medium', value: 2 },
    { label: 'Hard', value: 3 },
  ])
  const selectedOption = ref(options.value[0].value)
  watchEffect(() => {
    console.log('Current selectedOption: ', selectedOption.value) // Reactive log
  })

  return {
    selectedOption,
    options,
  }
})
