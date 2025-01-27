<script setup>
  import { getWordAndDefinition } from './functions/wordFetch.js'
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useSpeechSynthesis } from '@vueuse/core'
  import { toast } from 'vue3-toastify'
  import LevelDropdown from './components/LevelDropdown.vue'
  import { useDifficultyStore } from '@/stores/difficulty'
  import axios from 'axios'

  const audioUrl = ref(null)
  const difficultyStore = useDifficultyStore()
  const word = reactive({
    word: '',
    definition: '',
  })

  const spellingEntry = reactive({
    entry: '',
  })

  const voice = ref()
  const reactiveDefinition = computed(() => word.definition)
  const definitionReadingSpeed = 1
  const correctSound = ref(null)
  const wrongSound = ref(null)
  const wordToSpeak = ref(null)
  const wordIsVisible = ref(false)
  const buttonText = computed(() =>
    wordIsVisible.value ? 'Hide Word' : 'Reveal Word'
  )

  const readDefinition = useSpeechSynthesis(reactiveDefinition, {
    voice,
    rate: definitionReadingSpeed,
  })

  const getWord = async () => {
    const newWord = await getWordAndDefinition(difficultyStore.selectedOption)
    word.word = newWord.word
    word.definition = newWord.definition
  }

  const changeWord = async () => {
    toggleWordVisibility(false)
    spellingEntry.entry = ''
    await getWord()
    await googleSpeech()
    playWord()
  }

  const toggleWordVisibility = (state = !wordIsVisible.value) => {
    wordIsVisible.value = state
  }

  const playDefinition = (event) => {
    readDefinition.speak()
  }

  const playWord = () => {
    if (wordToSpeak.value) {
      wordToSpeak.value.play()
    }
  }

  const submitEntry = async () => {
    const sanitizedText = spellingEntry.entry.toLowerCase().trim()
    if (sanitizedText === word.word) {
      toggleWordVisibility()
      spellingEntry.entry = ''
      notifyCorrect()
      playCorrectSound()
    } else {
      notifyWrong()
      playWrongSound()
    }
  }

  const notifyCorrect = () => {
    toast('Correct! Loading next word!', {
      autoClose: 1200,
      theme: 'auto',
      type: 'success',
      onClose: () => {
        changeWord()
      },
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
      correctSound.value.play()
    }
  }

  const playWrongSound = () => {
    if (wrongSound.value) {
      wrongSound.value.play()
    }
  }

  const googleSpeech = async () => {
    try {
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${
          import.meta.env.VITE_GOOGLE_CLOUD_KEY
        }`,
        {
          input: { text: word.word },
          voice: {
            languageCode: 'en-US',
            ssmlGender: 'MALE',
            name: 'en-US-Standard-I',
          },
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.65 },
        }
      )
      if (response.data.audioContent) {
        // Decode base64 and create the Blob
        const audioBlob = new Blob(
          [
            new Uint8Array(
              atob(response.data.audioContent)
                .split('')
                .map((c) => c.charCodeAt(0))
            ),
          ],
          { type: 'audio/mp3' }
        )
        audioUrl.value = URL.createObjectURL(audioBlob)
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error)
    }
  }

  onMounted(async () => {
    await getWord()
    await googleSpeech()
  })

  watch(
    () => difficultyStore.selectedOption,
    () => {
      changeWord()
    }
  )
</script>

<template>
  <v-row class="fill-height">
    <!-- Left Sidebar for Level Dropdown -->
    <v-col cols="auto" class="d-flex flex-column align-start">
      <LevelDropdown />
    </v-col>

    <!-- Main Content Area -->
    <v-col
      cols="12"
      sm="9"
      class="d-flex flex-column justify-center align-center"
    >
      <v-container>
        <!-- Play Button -->
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <v-hover v-slot="{ isHovering, props }">
              <v-avatar
                id="word"
                @click="playWord"
                class="play-button elevation-5"
                size="90"
                :color="isHovering ? 'green' : 'grey-darken-3'"
                v-bind="props"
                style="transition: transform 0.3s, box-shadow 0.3s"
                :style="{
                  transform: isHovering ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isHovering
                    ? '0 0 15px 5px rgba(0, 255, 0, 0.5)'
                    : 'none',
                }"
              >
                <v-icon
                  id="word"
                  icon="mdi-volume-high"
                  :color="isHovering ? 'white' : 'success'"
                  size="x-large"
                ></v-icon>
              </v-avatar>
            </v-hover>
          </v-col>
          <v-col cols="auto">
    <v-text class="text-center" color="grey darken-2">Click to play the word</v-text>
  </v-col>
        </v-row>
      </v-container>

      <!-- hidden word -->
      <v-container v-if="wordIsVisible">
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <v-text class="text-h3 word-revealed">{{ word.word }}</v-text>
          </v-col>
        </v-row>
      </v-container>

      <!-- Text Field for Spelling -->
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6">
            <v-text-field
              label="Type answer here"
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
          <v-col cols="12" sm="8" md="6" mt="0">
            <p class="pa-4 text-justify">
              {{ word.definition }}
              <v-icon
                icon="mdi-volume-high"
                color="success"
                id="definition"
                @click="playDefinition"
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
            <v-btn @click="changeWord" color="blue" class="mx-2">
              Get New Word
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="toggleWordVisibility()" color="red" class="mx-2">
              {{ buttonText }}
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
      <audio ref="wordToSpeak" :src="audioUrl" preload="auto"></audio>
    </v-col>
  </v-row>
</template>

<style scoped>
  .play-button {
    cursor: pointer;
  }
  .word-revealed {
    text-transform: capitalize !important;
  }
</style>
