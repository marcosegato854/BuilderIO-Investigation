import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { notificationsSubscribeAction } from 'store/features/system/slice'

/**
 * Hook that subscribes to system notifications
 * @returns void
 */
const useNotificationsSocket = (): void => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(notificationsSubscribeAction())
  }, [dispatch])
}
export default useNotificationsSocket
