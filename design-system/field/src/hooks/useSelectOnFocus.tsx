import React, { useRef } from 'react'

/**
 * Hook that automatically selects a field on mount
 * In case of MaterialUI Field place inputRef={inputRef}
 * @returns [IClickableOption[], number]
 */
const useSelectOnFocus = (): React.MutableRefObject<
  HTMLInputElement | undefined
> => {
  const inputRef = useRef<HTMLInputElement>()

  React.useEffect(() => {
    // const timeout = setTimeout(() => {
    if (!inputRef.current) return
    inputRef.current.addEventListener('focus', () => {
      inputRef.current!.select()
    })
    // }, 100)
    // return () => {
    //   clearTimeout(timeout)
    // }
  }, [])
  return inputRef
}
export default useSelectOnFocus
