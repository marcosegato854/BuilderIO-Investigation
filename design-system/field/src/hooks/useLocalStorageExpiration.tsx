import moment from 'moment'
import { useMemo, useState } from 'react'

/**
 * Hook that uses localstorage to save or remove the current date
 * and calculate expiration on it
 * @returns [boolean, (setToNow: boolean) => void]
 */
function useLocalStorageExpiration(
  key: string,
  days: number
): [boolean, (setToNow: boolean) => void] {
  const [storedValue, setStoredValue] = useState<string | null>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item
    } catch (error) {
      console.error(error)
      return null
    }
  })

  const setValue = (value: string) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, value)
    } catch (error) {
      console.error(error)
    }
  }

  const expired = useMemo(() => {
    if (!storedValue) return true
    try {
      const expiration = moment(storedValue)
      const now = moment(new Date())
      const daysPassed = now.diff(expiration, 'days')
      return daysPassed > days
    } catch (error) {
      console.error(error)
      return true
    }
  }, [storedValue, days])

  const setExpirationFromNow = (setToNow: boolean) => {
    setValue(setToNow ? moment(new Date()).format() : '')
  }

  return [expired, setExpirationFromNow]
}

export default useLocalStorageExpiration
