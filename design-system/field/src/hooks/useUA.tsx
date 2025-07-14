import { useMemo } from 'react'
import parser, { IResult } from 'ua-parser-js'
/**
 * Hook that returns a ua parser obj
 * @returns boolean
 */

const useUA = (): IResult => {
  const ua = useMemo(() => {
    return parser(navigator.userAgent)
  }, [])
  return ua
}

export default useUA
