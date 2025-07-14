import {
  CompleteLanguage,
  languages,
} from 'components/atoms/TextToSpeech/completeLanguages'
import { has, isEmpty } from 'ramda'

export const findLanguage = (language: string) => {
  const selectedLanguage = languages.find((l) => language === l.lang)
  return selectedLanguage || { lang: language }
}

const setFavouriteLanguage = (
  favouriteVoices: string[],
  voices: SpeechSynthesisVoice[]
) => {
  for (const favVoice of favouriteVoices) {
    const langVoice = voices.find((voice) => voice.name === favVoice)
    if (langVoice) {
      console.info(
        `[TTS] favourite voice (${langVoice.name}) has been loaded: `,
        langVoice
      )
      return langVoice
    }
  }
  return null
}

const setCodeLanguage = (
  langCodes: (string | undefined)[],
  voices: SpeechSynthesisVoice[]
) => {
  for (const code of langCodes) {
    const matchVoice = new RegExp(code!, 'gi')
    const langVoice = voices.find((voice) => voice.lang.match(matchVoice))
    if (langVoice) {
      console.info(`[TTS] voice is set to '${code}':`, langVoice)
      return langVoice
    }
  }
  return null
}

export const setLanguage = (
  completeLanguage: CompleteLanguage,
  voices: SpeechSynthesisVoice[]
) => {
  // if the language has a favourite voice, try search on voices
  if (
    has('favouriteVoices', completeLanguage) &&
    !isEmpty(completeLanguage.favouriteVoices)
  ) {
    const langVoice = setFavouriteLanguage(
      completeLanguage.favouriteVoices!,
      voices
    )
    if (langVoice) return langVoice
  }

  // try matching the complete code language if present, fallback to language
  const langCodes = has('completeCode', completeLanguage)
    ? [completeLanguage.completeCode, completeLanguage.lang]
    : [completeLanguage.lang]

  if (langCodes && langCodes.length > 0) {
    const langVoice = setCodeLanguage(langCodes, voices)
    if (langVoice) return langVoice
  }

  return null
}
