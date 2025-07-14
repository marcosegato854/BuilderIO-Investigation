export interface CompleteLanguage {
  lang: string
  favouriteVoices?: string[]
  completeCode?: string
}

export const languages: CompleteLanguage[] = [
  {
    lang: 'en',
    favouriteVoices: ['Daniel', 'Karen', 'Alex'],
    completeCode: 'en-US',
  },
  {
    lang: 'it',
    favouriteVoices: ['Alice', 'Luca'],
    completeCode: 'it-IT',
  },
  {
    lang: 'de',
    completeCode: 'de-DE',
  },
  {
    lang: 'fr',
    completeCode: 'fr-FR',
  },
  {
    lang: 'es',
    completeCode: 'es-ES',
  },
]
