/* eslint-disable max-classes-per-file */
import React from 'react'
import { store } from 'store'
import { queries, RenderResult, waitFor } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { resetStoreAction } from 'store/features/global/slice'
import {
  addSpeechText,
  clearSpeechQueue,
  removeFirstItem,
  removeByText,
  setCurrentText,
} from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import { TextToSpeech } from './TextToSpeech'

const mockSpeak = jest.fn()

class SpeechSynthesisUtterance {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor, @typescript-eslint/no-empty-function
  constructor(text: string) {}

  // eslint-disable-next-line class-methods-use-this
  addEventListener() {}
}

class SpeechSynthesis {
  // eslint-disable-next-line class-methods-use-this
  cancel() {}

  // eslint-disable-next-line class-methods-use-this
  getVoices() {
    return [
      {
        default: true,
        lang: 'en_US',
        localService: true,
        name: 'George',
      },
    ]
  }

  public speak = mockSpeak
}

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: new SpeechSynthesis(),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
window.SpeechSynthesisUtterance = SpeechSynthesisUtterance as any

describe('TextToSpeech (realStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    component = renderWithProvider(<TextToSpeech />)(store)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  /* test('It adds one textToSpeech item to the queue', async () => {
    const textToSpeech1 = {
      content: {
        text: 'textToSpeech1',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    const textToSpeech2 = {
      content: {
        text: 'textToSpeech2 textToSpeech2 textToSpeech2 textToSpeech2 textToSpeech2 ',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    await waitFor(
      () => {
        store.dispatch(addSpeechText(textToSpeech1))
        store.dispatch(addSpeechText(textToSpeech2))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    // we expect a 1 because the saga resets the queue
    expect(state.speech.queue).toHaveLength(1)
  }) */

  /* test('It removes all items in the queue', async () => {
    const textToSpeech1 = {
      content: {
        text: 'textToSpeech1',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    const textToSpeech2 = {
      content: {
        text: 'textToSpeech2',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    await waitFor(
      () => {
        store.dispatch(addSpeechText(textToSpeech1))
        store.dispatch(addSpeechText(textToSpeech2))
        store.dispatch(clearSpeechQueue())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    expect(state.speech.queue).toHaveLength(0)
  }) */

  /* test('It triggers speak function when adding an item in the queue', async () => {
    const textToSpeech = {
      content: {
        text: 'Testing a text to speech text',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    await waitFor(
      () => {
        store.dispatch(addSpeechText(textToSpeech))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockSpeak).toHaveBeenCalled()
  }) */

  /* test('It removes the first item in the queue', async () => {
    // add 2 items in the store
    const textToSpeech1 = {
      content: {
        text: 'textToSpeech1',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    const textToSpeech2 = {
      content: {
        text: 'textToSpeech2',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    const textToSpeech3 = {
      content: {
        text: 'textToSpeech3',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    await waitFor(
      () => {
        store.dispatch(addSpeechText(textToSpeech1))
        store.dispatch(addSpeechText(textToSpeech2))
        store.dispatch(addSpeechText(textToSpeech3))
        // now dispatch the remove item
        store.dispatch(removeFirstItem())
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)

    const state = await store.getState()
    expect(state.speech.queue).toHaveLength(1)
    expect(state.speech.queue[0]).toHaveProperty('text', 'textToSpeech3')
  }) */

  /* test('It removes a specific item in the queue', async () => {
    // add 2 items in the store
    const textToSpeech1 = {
      content: {
        text: 'textToSpeech1',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    const textToSpeech2 = {
      content: {
        text: 'textToSpeech2',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    const textToSpeech3 = {
      content: {
        text: 'textToSpeech3',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    await waitFor(
      () => {
        store.dispatch(addSpeechText(textToSpeech1))
        store.dispatch(addSpeechText(textToSpeech2))
        store.dispatch(addSpeechText(textToSpeech3))
        // now dispatch the remove item
        store.dispatch(removeByText({ text: 'textToSpeech3' }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)

    const state = await store.getState()
    expect(state.speech.queue).toHaveLength(1)
    expect(state.speech.queue[0]).toHaveProperty('text', 'textToSpeech2')
  }) */

  /* test('It checks the priority in the queue', async () => {
    // add 2 items in the store
    const textToSpeech1 = {
      content: {
        text: 'textToSpeech1',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    const textToSpeech2 = {
      content: {
        text: 'textToSpeech2',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    const textToSpeech3 = {
      content: {
        text: 'textToSpeech3',
        type: SpeechTextType.COLLECTION,
      },
      priority: true,
    }
    await waitFor(
      () => {
        store.dispatch(addSpeechText(textToSpeech1))
        store.dispatch(addSpeechText(textToSpeech2))
        store.dispatch(addSpeechText(textToSpeech3))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)

    const state = await store.getState()
    expect(state.speech.queue[0]).toHaveProperty('text', 'textToSpeech3')
  }) */

  /* test('It verifies the current item to be played from the queue', async () => {
    // add an item in the store
    const textToSpeech1 = {
      content: {
        text: 'textToSpeech1',
        type: SpeechTextType.COLLECTION,
      },
      priority: false,
    }
    await waitFor(
      () => {
        store.dispatch(addSpeechText(textToSpeech1))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)

    // retrive the current from the store
    const state = await store.getState()
    expect(state.speech.current).toHaveProperty('text', 'textToSpeech1')
  }) */

  /* test('It sets the current item to be played', async () => {
    // add an item in the store
    const textToSpeech1 = {
      text: 'textToSpeech1',
      type: SpeechTextType.COLLECTION,
    }
    await waitFor(
      () => {
        store.dispatch(setCurrentText(textToSpeech1))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)

    // retrive the current from the store
    const state = await store.getState()
    expect(state.speech.current).toHaveProperty('text', 'textToSpeech1')
  }) */
})
