// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCurrentText,
  advanceQueue,
  clearSpeechQueue,
  setCurrentText,
  clearSpeechNavigationQueue,
  selectSpeechActivation,
} from 'store/features/speech/slice'
import { selectAudioState, selectLanguage } from 'store/features/settings/slice'
import { SpeechTextType } from 'store/features/speech/types'
import EasySpeech from 'easy-speech'
import { findLanguage, setLanguage } from 'components/atoms/TextToSpeech/utils'
import { IS_TESTING } from 'utils/capabilities'

/* fixed values for the voice of the speech systhesis */
const RATE = 1
const PITCH = 1

/**
 * TextToSpeech description
 */
export const TextToSpeech = () => {
  const dispatch = useDispatch()
  const speechText = useSelector(selectCurrentText)
  const audioSettings = useSelector(selectAudioState)
  const hookActivated = useSelector(selectSpeechActivation)
  const [ttsActivated, setTtsActivated] = useState(false)
  const audioSettingsRef = useRef(audioSettings)
  const language = useSelector(selectLanguage)

  // retrive the main language, as suggested in the i18next docs
  // const language = i18next.languages[0]

  const initSpeech = useCallback(async () => {
    if (IS_TESTING) return
    const status = await EasySpeech.init()
    setTtsActivated(status)
    console.info('[TTS] Speech engine activated: ', status)

    // set handlers
    EasySpeech.on({
      start: () => console.info('[TTS] TextToSpeech event started'),
      // boundary: () => console.info('[TTS] TextToSpeech boundary event'),
      end: () => {
        console.info('[TTS] TextToSpeech end event occurred, advanceQueue')
        dispatch(advanceQueue())
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error: (e: any) => {
        console.info('[TTS] error: ', e)
        dispatch(advanceQueue())
      },
      // mark: () => console.info('[TTS] TextToSpeech mark event'),
      // pause: () => console.info('[TTS] TextToSpeech pause event'),
      // resume: () => console.info('[TTS] TextToSpeech resume event'),
    })

    // set defaults
    EasySpeech.defaults({
      pitch: PITCH,
      rate: RATE,
    })
  }, [dispatch])

  // retrive all voices from the browser
  const browserVoices = useMemo(() => {
    if (ttsActivated && language) {
      const voices = EasySpeech.voices()
      if (voices && voices.length > 0) return voices
      console.info('[TTS] getVoices() is empty, no voices found on the browser')
      return null
    }
    return null
  }, [language, ttsActivated])

  // search for a complete language code
  const completeLanguage = useMemo(() => {
    if (language) return findLanguage(language)
    return null
  }, [language])

  // set the language voice
  const languageVoice = useMemo(() => {
    if (browserVoices && completeLanguage) {
      const langVoice = setLanguage(completeLanguage, browserVoices)
      if (langVoice) return langVoice
      console.info(
        `[TTS] no voice found in the browser for the code '${completeLanguage.lang}'`
      )
      return null
    }
    return null
  }, [browserVoices, completeLanguage])

  const speak = useCallback(
    async (text: string) => {
      // some browser can have problems if the lang is not set
      EasySpeech.defaults({
        lang: languageVoice!.lang,
      })
      // if we're inside speak, languageVoice has a value
      const voice = languageVoice!
      const volume = audioSettingsRef.current.globalVolume / 100
      try {
        await EasySpeech.speak({ text, voice, volume })
      } catch (e) {
        console.error('[TTS] error while speaking, ', e)
      }
    },
    [languageVoice]
  )

  useEffect(() => {
    audioSettingsRef.current = audioSettings
  }, [audioSettings])

  // verify if the text can be spoken
  useEffect(() => {
    if (!speechText) {
      console.info('[TTS] no current')
      return
    }

    // check for the init() result or hook activation
    if (!ttsActivated || !hookActivated) {
      console.info(
        '[TTS] TTS is not active, clearing the queue and the current - No current'
      )
      dispatch(clearSpeechQueue())
      dispatch(setCurrentText(null))
      return
    }

    // if the language has no voice in the browser, return
    if (!languageVoice) {
      console.info(
        '[TTS] The voice for the language was not found, skip the voice message'
      )
      dispatch(clearSpeechQueue())
      dispatch(setCurrentText(null))
      return
    }

    // if global volume is at 0 return
    if (audioSettingsRef.current.globalVolume === 0) {
      console.info('[TTS] Clear the queue and the current - No volume')
      dispatch(clearSpeechQueue())
      dispatch(setCurrentText(null))
      return
    }

    // skip the specific message if it is not audible
    if (!audioSettingsRef.current.audibleMessages[speechText.type]) {
      console.info(`[TTS] Type ${speechText.type} cannot be reproduced`)
      dispatch(advanceQueue())
      return
    }

    // if it's an error, clear the navigation queue
    if (speechText.type === SpeechTextType.ERROR)
      dispatch(clearSpeechNavigationQueue())

    speak(speechText.text)
  }, [speechText, speak, dispatch, languageVoice, ttsActivated, hookActivated])

  // check and destroy speechSynthesis on unmount
  useEffect(() => {
    initSpeech()
    return () => {
      console.info('[TTS] TextToSpeech UNMOUNT')
      // EasySpeech.reset()
      dispatch(advanceQueue())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
