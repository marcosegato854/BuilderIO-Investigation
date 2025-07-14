/* eslint-disable no-param-reassign */

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { visibilityChangeAction } from 'store/features/global/slice'

export const usePageVisibility = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    const handleVisibilityChange = () => {
      dispatch(visibilityChangeAction(document.visibilityState))
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [dispatch])
}
