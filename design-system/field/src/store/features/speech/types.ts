/**
 * TYPES
 */
export enum SpeechTextType {
  NAVIGATION = 'NAVIGATION',
  ERROR = 'ERROR',
  COLLECTION = 'COLLECTION',
}

export type SpeechText = {
  text: string
  type: SpeechTextType
}

export type AddSpeechTextPayload = {
  content: SpeechText
  priority: boolean
}

export type RemoveByTextPayload = {
  text: string
}

export type SetCurrentPayload = SpeechText | null
