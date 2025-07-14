import NoSleep from 'nosleep.js'
import { useEffect } from 'react'
/**
 * Hook that prevents the mobile device to enter sleep mode
 * Needs user interaction to enable
 * https://stackoverflow.com/questions/32193704/js-speech-synthesis-issue-on-ios/
 * @returns void
 */

const noSleep = new NoSleep()

const useEnableNoSleep = (): void => {
  const enableNoSleep = () => {
    console.info('[NO_SLEEP] enabled')
    noSleep.enable()
    document.removeEventListener('click', enableNoSleep)
  }

  const enableClickListener = () => {
    document.addEventListener('click', enableNoSleep)
  }

  useEffect(() => {
    enableClickListener()
    // return () => events.forEach((evt) => document.removeEventListener(evt, enableNoSleep))
    return () => document.removeEventListener('click', enableNoSleep)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useEnableNoSleep
