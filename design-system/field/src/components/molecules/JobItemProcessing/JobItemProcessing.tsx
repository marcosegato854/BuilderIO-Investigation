import { GridVariant } from 'components/molecules/CardsGrid/CardsGrid'
import { JobItemProcessingGrid } from 'components/molecules/JobItemProcessing/JobItemProcessingGrid'
import { JobItemProcessingList } from 'components/molecules/JobItemProcessing/JobItemProcessingList'
import useProcessingOptions from 'hooks/useProcessingOptions'
import { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  dataStorageOpenProcessingDialog,
  dataStorageProcessingLog,
  dataStorageProjectDetailActions,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'

export interface IJobItemProcessingProps {
  viewMode: GridVariant
  job: IJob
}

/**
 * JobItemProcessing description
 */
export const JobItemProcessing: FC<IJobItemProcessingProps> = ({
  viewMode = GridVariant.ListView,
  job,
}: PropsWithChildren<IJobItemProcessingProps>) => {
  const dispatch = useDispatch()
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const { disk, name } = currentProject || {}
  const [processingLayoutOptions, , stopActionPayload] =
    useProcessingOptions(job)

  const onProgressClick = useCallback(() => {
    if (!currentProject) return
    if (!job.processOutput?.errors) return
    if (!stopActionPayload) return
    dispatch(dataStorageProcessingLog(stopActionPayload))
  }, [currentProject, dispatch, job, stopActionPayload])

  const onProcessingIconClick = useCallback(() => {
    /* update the current project for info on coordinate system */
    if (disk && name) {
      dispatch(
        dataStorageOpenProcessingDialog({ job, disk, projectName: name })
      )
    }
  }, [disk, dispatch, job, name])

  const ItemProcessing = useMemo(() => {
    if (viewMode === GridVariant.GridView)
      return (
        <JobItemProcessingGrid
          processingOptions={processingLayoutOptions}
          job={job}
          onProgressClick={onProgressClick}
          onProcessingIconClick={onProcessingIconClick}
        />
      )
    if (job.acquired)
      return (
        <JobItemProcessingList
          processingOptions={processingLayoutOptions}
          jobAcquired={job.acquired}
          onProgressClick={onProgressClick}
          onProcessingIconClick={onProcessingIconClick}
        />
      )
    return null
  }, [
    job,
    onProcessingIconClick,
    onProgressClick,
    processingLayoutOptions,
    viewMode,
  ])

  return ItemProcessing
}
