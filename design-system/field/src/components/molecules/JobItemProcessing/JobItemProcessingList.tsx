/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Box } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import { ProcessingProgressBar } from 'components/atoms/ProcessingProgressBar/ProcessingProgressBar'
import style from 'components/molecules/JobItemProcessing/JobItemProcessing.module.scss'
import { FC, MouseEventHandler, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  JobProcessStatus,
  ProcessingProgressInfo,
} from 'store/features/dataStorage/types'

export interface IJobItemProcessingListProps {
  processingOptions: ProcessingProgressInfo
  jobAcquired?: boolean
  onProgressClick?: MouseEventHandler<HTMLDivElement>
  onProcessingIconClick?: () => void
}

/**
 * JobItemProcessingList description
 */
export const JobItemProcessingList: FC<IJobItemProcessingListProps> = ({
  processingOptions,
  jobAcquired,
  onProgressClick = console.info,
  onProcessingIconClick,
}: PropsWithChildren<IJobItemProcessingListProps>) => {
  const { t } = useTranslation()
  const { action, progress, currentStatus } = processingOptions

  const handleOnProcessingIconClick = () =>
    onProcessingIconClick && onProcessingIconClick()

  const showProgressBar = useMemo(() => {
    return currentStatus !== JobProcessStatus.NONE
  }, [currentStatus])

  const showActionButton = useMemo(() => {
    if (
      currentStatus === JobProcessStatus.PLAY ||
      currentStatus === JobProcessStatus.PAUSE
    )
      return true
    return false
  }, [currentStatus])

  const showProcessingIcon = useMemo(() => {
    if (jobAcquired) {
      if (
        currentStatus !== JobProcessStatus.PLAY &&
        currentStatus !== JobProcessStatus.PAUSE
      )
        return true
    }
    return false
  }, [jobAcquired, currentStatus])

  return (
    <Box
      className={style.containerList}
      sx={{ width: showProgressBar ? '100%' : 'fit-content' }}
      data-testid="job-item-processing-list"
    >
      {showProgressBar && (
        <div className={style.progress} onClick={onProgressClick}>
          <ProcessingProgressBar
            progress={progress}
            label={t(`job_processing.status.${currentStatus}`, 'processing')}
            status={currentStatus}
          />
        </div>
      )}
      <div className={style.buttons}>
        {showActionButton && action}
        {showProcessingIcon && (
          <Box sx={{ cursor: 'pointer' }} paddingX={1}>
            <Icon
              name="ProcessingCog"
              onClick={handleOnProcessingIconClick}
              data-testid="job-processing-icon"
            />
          </Box>
        )}
      </div>
    </Box>
  )
}
