import useUA from 'hooks/useUA'
import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { ttsActivated } from 'store/features/speech/slice'
/**
 * Hook that handles the first auto fire
 * for the text to speech iOs / tablets problem
 * https://stackoverflow.com/questions/32193704/js-speech-synthesis-issue-on-ios/
 * @returns void
 */

const useEnableAutoTts = (): void => {
  const ua = useUA()
  const dispatch = useDispatch()
  const isMobile = useMemo(() => {
    // TODO evaulate to add a check for touch devices, to avoid the request for a desktop site
    return ua.device.type === 'mobile' || ua.device.type === 'tablet'
  }, [ua])

  const simulateSpeech = () => {
    const lecture = new SpeechSynthesisUtterance('hello')
    lecture.volume = 0
    console.info('[TTS] useEnableAutoTts: ', lecture)
    lecture.addEventListener('end', () => {
      console.info('[TTS] useEnableAutoTts end event occurred')
      dispatch(ttsActivated(true))
      document.removeEventListener('click', simulateSpeech)
    })
    speechSynthesis.resume()
    speechSynthesis.speak(lecture)
  }

  const enableAutoTTS = () => {
    if (isMobile) {
      console.info('[TTS] mobile device found, start autoTTS')
      document.addEventListener('click', simulateSpeech)
    } else {
      console.info('[TTS] desktop device, no need for autoTTS')
      dispatch(ttsActivated(true))
    }
  }

  useEffect(() => {
    enableAutoTTS()
    return () => document.removeEventListener('click', simulateSpeech)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useEnableAutoTts
