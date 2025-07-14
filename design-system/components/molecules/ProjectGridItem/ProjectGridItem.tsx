/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { CircularProgress, Fade, Popover } from '@mui/material'
import classNames from 'classnames'
import { ItemDetails } from 'components/atoms/ItemDetails/ItemDetails'
import { KebabMenuMaterial } from 'components/atoms/KebabMenuMaterial/KebabMenuMaterial'
import { ProcessingProgressBar } from 'components/atoms/ProcessingProgressBar/ProcessingProgressBar'
import { JobProcessStatus } from 'store/features/dataStorage/types'
import style from 'components/molecules/ProjectGridItem/ProjectGridItem.module.scss'
import useItemDetails from 'hooks/useItemDetails'
import useItemClickHandler from 'hooks/useProjectItemClickHandler'
import useProjectKebabOptions from 'hooks/useProjectKebabOptions'
import React, { FC, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  selectDataStorageCurrentProject,
  selectDataStorageDisks,
  selectProcessingInfo,
} from 'store/features/dataStorage/slice'
import { slotOrDisk } from 'utils/disks'
import { eqLower } from 'utils/strings'
import { isProjectProcessing } from 'store/features/dataStorage/utils'

export interface IProjectGridItemProps {
  /**
   * Object with the data of the Project.
   */
  project?: IProject
}

/**
 * Project's view as a Grid. Shown inside of the Project Browser.
 */
export const ProjectGridItem: FC<IProjectGridItemProps> = ({
  project,
}: PropsWithChildren<IProjectGridItemProps>) => {
  const {
    name,
    disk: diskName,
    jobs,
    image,
    jobsAcquired = 0,
    coordinate,
  } = project || {}
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const [detailsMenuItem, setDetailsMenuItem, details, popoverCloseHandler] =
    useItemDetails(currentProject, currentProject?.coordinate?.unit || 'metric')
  const [kebabOptions] = useProjectKebabOptions(setDetailsMenuItem, project)
  const [itemClickHandler] = useItemClickHandler(project)
  const processingInfo = useSelector(selectProcessingInfo)
  const disks = useSelector(selectDataStorageDisks)
  const { t } = useTranslation()

  const diskLabel = slotOrDisk(diskName || '', disks)
  const imageSrc = image || '/assets/img/LeicaGeosystems.png'

  const isProcessing = useMemo(() => {
    if (!project || !processingInfo) return false
    return isProjectProcessing(project, processingInfo)
  }, [processingInfo, project])

  const projectCompletionPercentage = useMemo(() => {
    if (jobsAcquired && jobs) return Math.round((jobsAcquired / jobs) * 100)
    return null
  }, [jobs, jobsAcquired])

  const jobNumberText = useMemo(() => {
    if (jobs === 1) return t('project_item.job', 'job')
    return t('project_item.jobs', 'jobs')
  }, [jobs, t])

  return (
    <div
      className={classNames({
        [style.projectGridItem]: true,
        [style.withImage]: !!image,
      })}
      role="cell"
      data-testid="project-grid-item"
    >
      <div
        className={classNames({
          [style.projectGridItem__img]: !!image,
          [style.projectGridItem__imgPlaceholder]: !image,
        })}
        onClick={itemClickHandler}
        data-testid="clickable-image"
      >
        <img src={imageSrc} alt="location" />
      </div>

      <div className={style.projectGridItem__header}>
        <div className={style.projectGridItem__headerTop}>
          <div
            data-testid="clickable-title"
            className={style.projectGridItem__titleDiv}
            onClick={itemClickHandler}
          >
            <p className={style.projectGridItem__title}>{name}</p>
            <p className={style.projectGridItem__description}>
              {jobs} {jobNumberText}
              <span className={style.projectGridItem__descriptionDisk}>
                {t('project_item.disk', 'stored in disk')} {diskLabel}
              </span>
              {coordinate?.name && (
                <span
                  data-testid="coordinateSystem-name"
                  className={style.projectGridItem__descriptionDisk}
                >
                  {coordinate.name}
                </span>
              )}
            </p>
          </div>
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
            variant="White"
          />
        </div>
        {projectCompletionPercentage && (
          <div
            className={style.projectGridItem__headerBottom}
            data-testid="project-completion-progress"
          >
            <ProcessingProgressBar
              progress={projectCompletionPercentage}
              status={JobProcessStatus.DONE}
              label={t('project_item.progress', 'completion')}
            />
          </div>
        )}
      </div>
      {isProcessing && (
        <CircularProgress
          size={28}
          className={style.processing}
          data-testid="project-processing-spinner"
        />
      )}
    </div>
  )
}
