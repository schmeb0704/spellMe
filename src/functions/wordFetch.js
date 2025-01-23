import axios from 'axios'

export const getRandomWord = async () => {
  const res = await axios.get('https://random-word-api.vercel.app/api?words=1')
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

export const getWordAndDefinition = async () => {
  const word = await getRandomWord()
  const definition = await getDefinition(word[0])
  

  return { word: word[0], definition }
}
