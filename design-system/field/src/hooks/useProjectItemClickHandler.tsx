import { push } from 'connected-react-router'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Routes } from 'Routes'

/**
 * Hook that handles the click of a project item
 */
const useItemClickHandler = (project?: IProject) => {
  const { name, disk: diskName } = project || {}
  const dispatch = useDispatch()

  const itemClickHandler = useCallback(() => {
    dispatch(
      push(
        Routes.JOBS.replace(':diskName', diskName || '').replace(
          ':projectName',
          name || ''
        )
      )
    )
  }, [dispatch, diskName, name])

  return [itemClickHandler]
}
export default useItemClickHandler
