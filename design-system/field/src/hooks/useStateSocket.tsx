import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { stateSubscribeAction } from 'store/features/system/slice'

/**
 * Hook that subscribes to system state
 * @returns void
 */
const useStateSocket = (): void => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(stateSubscribeAction())
  }, [dispatch])
}
export default useStateSocket
