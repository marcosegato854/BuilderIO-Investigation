import { push } from 'connected-react-router'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Routes } from 'Routes'

/**
 * Hook that handles redirection to the jobs url without the job
 */
const useRemoveJobFromUrl = (): [Function] => {
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  const removeJobFromUrl = useCallback(() => {
    if (!pathname) return
    const jobToOpen = pathname.split('/')[4]
    const diskName = pathname.split('/')[2]
    const projectName = pathname.split('/')[3]
    if (jobToOpen) {
      const newRoute = Routes.JOBS.replace(':diskName', diskName).replace(
        ':projectName',
        projectName
      )
      if (newRoute !== pathname) dispatch(push(newRoute))
    }
  }, [dispatch, pathname])
  return [removeJobFromUrl]
}
export default useRemoveJobFromUrl
