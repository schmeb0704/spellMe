<script setup>
  import { getWordAndDefinition } from './functions/wordFetch.js'
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useSpeechSynthesis } from '@vueuse/core'
  import { toast } from 'vue3-toastify'

  const word = reactive({
    word: '',
    definition: '',
  })

  const spellingEntry = reactive({
    entry: '',
  })

  const voice = ref()
  const reactiveWord = computed(() => word.word)
  const reactiveDefinition = computed(() => word.definition)
  const readingSpeed = ref(0.5)
  const definitionReadingSpeed = 1
  const entry = computed(() => spellingEntry.entry)
  const correctSound = ref(null)
  const wrongSound = ref(null)

  const readWord = useSpeechSynthesis(reactiveWord, {
    voice,
    rate: readingSpeed,
  })

  const readDefinition = useSpeechSynthesis(reactiveDefinition, {
    voice,
    rate: definitionReadingSpeed,
  })

  let synth
  const voices = ref([])

  const getWord = async () => {
    const newWord = await getWordAndDefinition()
    console.log(word)
    word.word = newWord.word
    word.definition = newWord.definition
  }

  const play = (event) => {
    const elementId = event.target.id

    const toPlay = elementId === 'word' ? readWord : readDefinition
    toPlay.speak()
  }

  const submitEntry = async () => {
    console.log(spellingEntry.entry)
    if (spellingEntry.entry.toLowerCase() === word.word) {
      spellingEntry.entry = ''
      notifyCorrect()
      playCorrectSound()
      await getWord()
      readWord.speak()
    } else {
      spellingEntry.entry = ''
      notifyWrong()
      playWrongSound()
    }
  }

  const notifyCorrect = () => {
    toast('Correct!', {
      autoClose: 2000,
      theme: 'auto',
      type: 'success',
    })
  }
  const notifyWrong = () => {
    toast("Sorry, you're wrong!", {
      autoClose: 2000,
      theme: 'auto',
      type: 'error',
    })
  }

  const playCorrectSound = () => {
    if (correctSound.value) {
      correctSound.value.play() // Play the correct sound
    }
  }

  const playWrongSound = () => {
    if (wrongSound.value) {
      wrongSound.value.play() // Play the correct sound
    }
  }
  onMounted(async () => {
    const mountedWord = await getWordAndDefinition(1)
    word.word = mountedWord.word
    word.definition = mountedWord.definition
  })

  onMounted(() => {
    if (readWord.isSupported.value || reactiveDefinition.isSupported.value) {
      setTimeout(() => {
        synth = window.speechSynthesis
        voices.value = synth.getVoices()
        voice.value = voices.value[0]
        readWord.speak()
      })
    }
  })
</script>

<template>
  <v-container
    class="fill-height d-flex flex-column justify-center align-center"
  >
    <!-- Play Button -->
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-avatar
            id="word"
            @click="play"
            class="play-button"
            size="90"
            color="grey-darken-3"
          >
            <v-icon
              id="word"
              icon="mdi-volume-high"
              color="success"
              size="x-large"
            ></v-icon>
          </v-avatar>
        </v-col>
      </v-row>
    </v-container>

    <!-- Text Field for Spelling -->
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-text-field
            label="Spell here"
            v-model="spellingEntry.entry"
            outlined
            @keyup.enter="submitEntry"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>

    <!-- Definition with Icon -->
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="6">
          <p class="pa-4 text-justify">
            {{ word.definition }}
            <v-icon
              icon="mdi-volume-high"
              color="success"
              id="definition"
              @click="play"
              class="ml-2"
            ></v-icon>
          </p>
        </v-col>
      </v-row>
    </v-container>

    <!-- Buttons -->
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-btn @click="submitEntry" color="green" class="mx-2">
            Submit
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn @click="getWord" color="blue" class="mx-2">
            Get New Word
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
    <audio
      ref="correctSound"
      src="/sounds/correct.mp3"
      preload="auto"
    ></audio>
    <audio ref="wrongSound" src="/sounds/wrong.mp3" preload="auto"></audio>
  </v-container>
</template>

<style scoped>
  .play-button {
    cursor: pointer;
  }
</style>
