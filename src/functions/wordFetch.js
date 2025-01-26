import axios from 'axios'
//https://spellmebackend.onrender.com/words/random?difficulty=3
export const getRandomWord = async (difficulty) => {
  const res = await axios.get(
    `https://spellmebackend.onrender.com/words/random?difficulty=${difficulty}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
  const data = res.data
  return data
}

export const getDefinition = async (word) => {
  const res = await axios.get(`https://api.datamuse.com/words?sp=${word}&md=d`)

  if (res.status === 200) {
    const data = res.data

    const definition = data[0].defs[0].split('\t')[1]
    return definition
  }

  return 'Definition not found'
}

export const getWordAndDefinition = async (difficulty) => {
  const word = await getRandomWord(difficulty)

  const definition = await getDefinition(word[0].word)

  return { word: word[0].word, definition }
}
