import React, { useRef } from 'react'

/**
 * Hook that automatically selects a field on mount
 * In case of MaterialUI Field place inputRef={inputRef}
 * @returns [IClickableOption[], number]
 */
const useAutoSelect = (): React.MutableRefObject<
  HTMLInputElement | undefined
> => {
  const inputRef = useRef<HTMLInputElement>()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!inputRef.current) return
      inputRef.current.select()
      /** safari fix (highlights but doesn't bring up the keyboard) */
      // inputRef.current.focus()
      // inputRef.current.setSelectionRange(0, inputRef.current.value.length)
    }, 100)
    return () => {
      clearTimeout(timeout)
    }
  }, [])
  return inputRef
}
export default useAutoSelect
