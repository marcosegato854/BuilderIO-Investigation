import { push } from 'connected-react-router'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Routes } from 'Routes'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'

/**
 * Hook that returns a function to redirect to a job plan
 * @returns [Function]
 */
const useGoToPlan = (job?: IJob): [Function] => {
  const { name } = job || {}
  const dispatch = useDispatch()
  const currentProject = useSelector(selectDataStorageCurrentProject)

  const viewPlan = useCallback(() => {
    if (name) {
      dispatch(
        push(
          Routes.PLANNING.replace(':diskName', currentProject?.disk || '')
            .replace(':projectName', currentProject?.name || '')
            .replace(':jobName', name)
        )
      )
    }
  }, [currentProject, name, dispatch])
  return [viewPlan]
}
export default useGoToPlan
