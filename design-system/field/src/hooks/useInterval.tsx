import { useEffect, useRef } from 'react'

function useInterval(callback: Function, delay: number, disabled?: boolean) {
  const savedCallback = useRef<Function>()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current()
    }
    if (!disabled && delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
    return () => {}
  }, [delay, disabled])
}
export default useInterval
