import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setTokenAction } from 'store/features/auth/slice'

/**
 * Hook that loads the login token from localStorage and stores it in the store
 * @returns void
 */
const useToken = (): void => {
  const dispatch = useDispatch()

  const getToken = useCallback(async () => {
    const savedToken = await localStorage.getItem('PEF_token')
    dispatch(setTokenAction(savedToken))
  }, [dispatch])

  useEffect(() => {
    getToken()
  }, [getToken])
}
export default useToken
