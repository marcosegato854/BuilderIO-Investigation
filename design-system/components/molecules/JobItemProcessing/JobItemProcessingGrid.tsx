/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Box, Fade, Popover } from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import { ItemDetails } from 'components/atoms/ItemDetails/ItemDetails'
import { KebabMenuMaterial } from 'components/atoms/KebabMenuMaterial/KebabMenuMaterial'
import { ProcessingProgressBar } from 'components/atoms/ProcessingProgressBar/ProcessingProgressBar'
import style from 'components/molecules/JobItemProcessing/JobItemProcessing.module.scss'
import useItemDetails from 'hooks/useItemDetails'
import useItemClickHandler from 'hooks/useJobItemClickHandler'
import useJobKebabOptions from 'hooks/useJobKebabOptions'
import useRemoveJobFromUrl from 'hooks/useRemoveJobFromUrl'
import { defaultTo } from 'ramda'
import { FC, MouseEventHandler, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  JobProcessStatus,
  ProcessingProgressInfo,
} from 'store/features/dataStorage/types'
import { underscores } from 'utils/strings'

export interface IJobItemProcessingGridProps {
  processingOptions: ProcessingProgressInfo
  job: IJob
  onProgressClick?: MouseEventHandler<HTMLDivElement>
  onProcessingIconClick?: () => void
}

/**
 * JobItemProcessingGrid description
 */
export const JobItemProcessingGrid: FC<IJobItemProcessingGridProps> = ({
  processingOptions,
  job,
  onProgressClick = console.info,
  onProcessingIconClick,
}: PropsWithChildren<IJobItemProcessingGridProps>) => {
  const { t } = useTranslation()
  const { name, scans, hardwareModel, acquired } = job
  const { action, progress, currentStatus } = processingOptions
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const unit = currentProject?.coordinate?.unit || 'metric'
  const currentJob = useSelector(selectDataStorageCurrentJob)
  // prettier-ignore
  const [
    detailsMenuItem,
    setDetailsMenuItem,
    details,
    popoverCloseHandler,
  ] = useItemDetails(currentJob, unit)
  const { pathname } = useLocation()
  const [itemClickHandler] = useItemClickHandler(job)
  const [kebabOptions] = useJobKebabOptions(setDetailsMenuItem, job)
  const [removeJobFromUrl] = useRemoveJobFromUrl()

  /** detects if the kebab menu shouold be opened from the url */
  const defaultOpened = useMemo(() => {
    if (!pathname) return false
    if (!job) return false
    const jobToOpen = pathname.split('/')[5]
    return jobToOpen === job.name
  }, [pathname, job])

  const trackNumberText = useMemo(() => {
    if (scans === 1) return t('job_item.scan', 'scan')
    return t('job_item.scans', 'scans')
  }, [scans, t])

  const showFullHeader = useMemo(() => {
    return currentStatus !== JobProcessStatus.NONE
  }, [currentStatus])

  const showProcessingIcon = useMemo(() => {
    if (acquired) {
      if (
        currentStatus !== JobProcessStatus.PLAY &&
        currentStatus !== JobProcessStatus.PAUSE
      )
        return true
    }
    return false
  }, [acquired, currentStatus])

  const handleOnProcessingIconClick = () =>
    onProcessingIconClick && onProcessingIconClick()

  const showActionButton = useMemo(() => {
    if (
      currentStatus === JobProcessStatus.PLAY ||
      currentStatus === JobProcessStatus.PAUSE
    )
      return true
    return false
  }, [currentStatus])

  return (
    <div className={style.containerGrid} data-testid="job-item-processing-grid">
      <div
        className={classNames({
          [style.header]: true,
          [style.headerFull]: showFullHeader,
        })}
      >
        <div
          data-testid="clickable-title"
          className={style.headerTitle}
          onClick={itemClickHandler}
        >
          <p className={style.headerTitleName}>{name}</p>
          <div className={style.headerTitleDescription}>
            <span className={style.scansNumber}>
              {scans} {trackNumberText}
            </span>
            {hardwareModel ? (
              <span className={style.hardwareModel} data-testid="su-model">
                {t('su.su', 'su')}:{' '}
                {t(`su.model.${underscores(hardwareModel)}`, hardwareModel)}
              </span>
            ) : null}
          </div>
        </div>
        <div className={style.buttons}>
          {showFullHeader && showActionButton && action}
          {showProcessingIcon && (
            <Box sx={{ cursor: 'pointer' }} paddingX={1}>
              <Icon
                name="ProcessingCog"
                onClick={handleOnProcessingIconClick}
                data-testid="job-processing-icon"
              />
            </Box>
          )}
          <Popover
            className="scrollable-popover"
            open={!!detailsMenuItem}
            anchorEl={detailsMenuItem}
            onClose={popoverCloseHandler}
            anchorOrigin={{ horizontal: 'right', vertical: 'center' }}
            transformOrigin={{ horizontal: 'left', vertical: 'center' }}
            TransitionComponent={Fade}
          >
            <ItemDetails details={details} />
          </Popover>
          <KebabMenuMaterial
            options={kebabOptions}
            placement="right"
            variant="Processing"
            defaultOpened={defaultOpened}
            onClose={removeJobFromUrl}
          />
        </div>
      </div>
      {currentStatus !== JobProcessStatus.NONE && (
        <div
          className={style.progress}
          data-testid="processing-progress-bar"
          onClick={onProgressClick}
        >
          <ProcessingProgressBar
            progress={progress}
            label={t(`job_processing.status.${currentStatus}`, 'processing')}
            status={currentStatus}
          />
        </div>
      )}
    </div>
  )
}
