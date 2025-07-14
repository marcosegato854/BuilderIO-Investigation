/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { Fade, Popover } from '@mui/material'
import classNames from 'classnames'
import { ItemDetails } from 'components/atoms/ItemDetails/ItemDetails'
import { KebabMenuMaterial } from 'components/atoms/KebabMenuMaterial/KebabMenuMaterial'
import { GridVariant } from 'components/molecules/CardsGrid/CardsGrid'
import { JobItemProcessing } from 'components/molecules/JobItemProcessing/JobItemProcessing'
import style from 'components/molecules/JobListItem/JobListItem.module.scss'
import useItemDetails from 'hooks/useItemDetails'
import useItemClickHandler from 'hooks/useJobItemClickHandler'
import useJobKebabOptions from 'hooks/useJobKebabOptions'
import useRemoveJobFromUrl from 'hooks/useRemoveJobFromUrl'
import { FC, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import { underscores } from 'utils/strings'

export interface IJobListItemProps {
  /**
   * Object with the data of the Project.
   */
  job?: IJob
}

/**
 * JobListItem description
 */
export const JobListItem: FC<IJobListItemProps> = ({
  job,
}: PropsWithChildren<IJobListItemProps>) => {
  const { name, scans, image, acquired, hardwareModel } = job || {}

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
  const { t } = useTranslation()
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

  const imageSrc = image || '/assets/img/LeicaGeosystems.png'

  const trackNumberText = useMemo(() => {
    if (scans === 1) return t('job_item.scan', 'scan')
    return t('job_item.scans', 'scans')
  }, [scans, t])

  return (
    <div
      className={classNames({
        [style.jobListItem]: true,
      })}
      data-testid="job-list-item"
    >
      <div
        className={classNames({
          [style.img]: !!image,
          [style.imgPlaceholder]: !image,
          [style.jobListItemAcquired]: acquired,
        })}
        onClick={itemClickHandler}
        data-testid="clickable-image"
      >
        <img src={imageSrc} alt="location" />
      </div>
      <div
        className={style.title}
        data-testid="clickable-title"
        onClick={itemClickHandler}
      >
        <p>{name}</p>
      </div>
      <div
        className={style.description}
        data-testid="clickable-description"
        onClick={itemClickHandler}
      >
        <div className={style.scanNumber}>{scans}</div>
        <div>{trackNumberText}</div>
      </div>
      <div className={style.su} onClick={itemClickHandler}>
        {hardwareModel ? (
          <>
            <div className={style.suModel}>{t('su.su', 'su')}</div>
            <div className={style.suModel} data-testid="su-model">
              {t(`su.model.${underscores(hardwareModel)}`, hardwareModel)}
            </div>
          </>
        ) : (
          ' '
        )}
      </div>
      {job && (
        <div className={style.processingStatusContainer}>
          <JobItemProcessing job={job} viewMode={GridVariant.ListView} />
        </div>
      )}

      <Popover
        className="scrollable-popover"
        open={!!detailsMenuItem}
        anchorEl={detailsMenuItem}
        onClose={popoverCloseHandler}
        anchorOrigin={{ horizontal: 'left', vertical: 'center' }}
        transformOrigin={{ horizontal: 'right', vertical: 'center' }}
        TransitionComponent={Fade}
      >
        <ItemDetails details={details} />
      </Popover>
      <div className={style.kebabMenu}>
        <KebabMenuMaterial
          options={kebabOptions}
          placement="left"
          variant="White"
          defaultOpened={defaultOpened}
          onClose={removeJobFromUrl}
        />
      </div>
    </div>
  )
}
