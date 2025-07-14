import { combineReducers } from 'redux'
import { ActionType, createAction, createReducer } from 'typesafe-actions'
import { resetStoreAction } from 'store/features/global/slice'
import {
  AddSpeechTextPayload,
  RemoveByTextPayload,
  SetCurrentPayload,
  SpeechText,
  SpeechTextType,
} from 'store/features/speech/types'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
export const addSpeechText = createAction(
  'speech/ADD_SPEECH_TEXT'
)<AddSpeechTextPayload>()
export const clearSpeechQueue = createAction('speech/CLEAR_SPEECH_QUEUE')()
export const clearSpeechNavigationQueue = createAction(
  'speech/CLEAR_SPEECH_NAVIGATION_QUEUE'
)()
export const removeFirstItem = createAction('speech/REMOVE_FIRST_ITEM')()
export const advanceQueue = createAction('speech/ADVANCE_QUEUE')()
export const removeByText = createAction(
  'speech/REMOVE_BY_TEXT'
)<RemoveByTextPayload>()
export const setCurrentText = createAction(
  'speech/SET_CURRENT_TEXT'
)<SetCurrentPayload>()
export const ttsActivated = createAction('speech/TTS_ACTIVATED')<boolean>()

const actions = {
  addSpeechText,
  clearSpeechQueue,
  clearSpeechNavigationQueue,
  removeFirstItem,
  advanceQueue,
  removeByText,
  setCurrentText,
  ttsActivated,
}
export type SpeechAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type SpeechState = Readonly<{
  queue: SpeechText[]
  current: SpeechText | null
  activated: boolean
}>

const initialState: SpeechState = {
  queue: [],
  current: null,
  activated: false,
}

const queue = createReducer(initialState.queue)
  .handleAction(addSpeechText, (prevState: SpeechText[], { payload }) => {
    console.info('[TTS] slice addSpeechText requested: ', payload.content)
    if (payload.priority) return [payload.content, ...prevState]
    return [...prevState, payload.content]
  })
  .handleAction(clearSpeechQueue, (prevState: SpeechText[]) => {
    return []
  })
  .handleAction(clearSpeechNavigationQueue, (prevState: SpeechText[]) => {
    return prevState.filter(
      (speechText) => speechText.type !== SpeechTextType.NAVIGATION
    )
  })
  .handleAction(removeFirstItem, (prevState: SpeechText[]) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const [removed, ...remaining] = prevState
    return remaining
  })
  .handleAction(removeByText, (prevState: SpeechText[], { payload }) => {
    return prevState.filter((speechText) => speechText.text !== payload.text)
  })
  .handleAction(resetStoreAction, () => initialState.queue)

const current = createReducer(initialState.current)
  .handleAction(setCurrentText, (prevState: SpeechText | null, { payload }) => {
    console.info('[TTS] slice, new current is: ', payload)
    return payload
  })
  .handleAction(resetStoreAction, () => initialState.current)

const activated = createReducer(initialState.activated)
  .handleAction(ttsActivated, (prevState: boolean, { payload }) => payload)
  .handleAction(resetStoreAction, () => initialState.activated)

export const speechReducer = combineReducers({
  queue,
  current,
  activated,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      speech: SpeechState
    }
  | AnyObject
export const selectSpeechState = (state: OptimizedRootState): SpeechState =>
  state.speech

export const selectQueue = (state: OptimizedRootState) =>
  selectSpeechState(state).queue

export const selectCurrentText = (state: OptimizedRootState) =>
  selectSpeechState(state).current

export const selectSpeechActivation = (state: OptimizedRootState) =>
  selectSpeechState(state).activated
