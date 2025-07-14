import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { startupAction } from 'store/features/global/slice'

/**
 * Hook that performs required actions at startup
 * @returns void
 */
const useStartupActions = (): void => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(startupAction())
  }, [dispatch])
}
export default useStartupActions
