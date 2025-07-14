import { useTrackProgress } from 'store/services/trackProgress'
import { apiCallIds as apiCallIdsPlanning } from 'store/features/planning/api'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  selectExtractionStatus,
  selectImportShpStatus,
  selectListShpStatus,
  selectProcessingStatus,
} from 'store/features/planning/slice'
import { apiCallIds } from 'store/features/dataStorage/api'

/**
 * Hook that handles drawing paths
 * @returns [IClickableOption[], number]
 */
const useBusyApi = (): boolean => {
  const nearestPointProgress = useTrackProgress(
    apiCallIdsPlanning.PLANNING_NEAREST_POINT
  )
  const arcsProgress = useTrackProgress(apiCallIdsPlanning.PLANNING_PATH)
  const shpProgress = useTrackProgress(apiCallIdsPlanning.PLANNING_IMPORT_SHP)
  const processingStartProgress = useTrackProgress(
    apiCallIdsPlanning.PLANNING_PROCESS_START
  )
  const processingInfoProgress = useTrackProgress(
    apiCallIdsPlanning.PLANNING_PROCESS_INFO
  )
  const savePlanProgress = useTrackProgress(
    apiCallIdsPlanning.PLANNING_SAVE_PLAN
  )
  const updatePlanProgress = useTrackProgress(
    apiCallIdsPlanning.PLANNING_UPDATE_PLAN
  )
  const getPlanProgress = useTrackProgress(apiCallIdsPlanning.PLANNING_GET_PLAN)
  const getProjectProgress = useTrackProgress(
    apiCallIds.DATA_STORAGE_PROJECT_DETAIL
  )
  const getJobProgress = useTrackProgress(apiCallIds.DATA_STORAGE_JOB_DETAIL)
  const processingStatus = useSelector(selectProcessingStatus)
  const extractionStatus = useSelector(selectExtractionStatus)
  const importShpStatus = useSelector(selectImportShpStatus)
  const listShpStatus = useSelector(selectListShpStatus)

  const busy = useMemo(() => {
    return (
      getPlanProgress ||
      nearestPointProgress ||
      arcsProgress ||
      shpProgress ||
      processingStartProgress ||
      processingInfoProgress ||
      savePlanProgress ||
      updatePlanProgress ||
      getProjectProgress ||
      getJobProgress ||
      processingStatus === 'progress' ||
      extractionStatus === 'progress' ||
      importShpStatus === 'progress' ||
      listShpStatus === 'progress'
    )
  }, [
    getPlanProgress,
    nearestPointProgress,
    arcsProgress,
    shpProgress,
    processingStartProgress,
    processingInfoProgress,
    savePlanProgress,
    updatePlanProgress,
    getProjectProgress,
    getJobProgress,
    processingStatus,
    extractionStatus,
    importShpStatus,
    listShpStatus,
  ])

  return busy
}
export default useBusyApi
