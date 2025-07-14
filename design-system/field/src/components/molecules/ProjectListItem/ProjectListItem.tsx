/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { CircularProgress, Fade, Popover } from '@mui/material'
import classNames from 'classnames'
import { ItemDetails } from 'components/atoms/ItemDetails/ItemDetails'
import { KebabMenuMaterial } from 'components/atoms/KebabMenuMaterial/KebabMenuMaterial'
import { ProcessingProgressBar } from 'components/atoms/ProcessingProgressBar/ProcessingProgressBar'
import style from 'components/molecules/ProjectListItem/ProjectListItem.module.scss'
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
import { JobProcessStatus } from 'store/features/dataStorage/types'
import { isProjectProcessing } from 'store/features/dataStorage/utils'
import { slotOrDisk } from 'utils/disks'
import { eqLower } from 'utils/strings'

export interface IProjectListItemProps {
  /**
   * Object with the data of the Project.
   */
  project?: IProject
}

/**
 * ProjectListItem description
 */
export const ProjectListItem: FC<IProjectListItemProps> = ({
  project,
}: PropsWithChildren<IProjectListItemProps>) => {
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
  const { t } = useTranslation()
  const processingInfo = useSelector(selectProcessingInfo)
  const disks = useSelector(selectDataStorageDisks)

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
    <div className={style.projectListItem} data-testid="project-list-item">
      <div className={style.leftSide}>
        <div
          className={classNames({
            [style.img]: !!image,
            [style.imgPlaceholder]: !image,
          })}
          onClick={itemClickHandler}
          data-testid="clickable-image"
        >
          <img src={imageSrc} alt="location" />
        </div>
        <div className={style.title}>
          <h1 data-testid="clickable-title" onClick={itemClickHandler}>
            {name}
          </h1>
          <p>
            {t('project_item.disk', 'stored in disk')} {diskLabel}
            {coordinate?.name && (
              <span
                data-testid="coordinateSystem-name"
                className={style.coordinateSystem}
              >
                {coordinate.name}
              </span>
            )}
          </p>
        </div>
        <div
          className={style.description}
          data-testid="clickable-description"
          onClick={itemClickHandler}
        >
          <div className={style.scanNumber}>{jobs}</div>
          <div>{jobNumberText}</div>
        </div>
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
        {projectCompletionPercentage && (
          <div
            className={style.projectCompletion}
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
      <div className={style.rightSide}>
        {isProcessing && (
          <CircularProgress
            size={28}
            className={style.processing}
            data-testid="project-processing-spinner"
          />
        )}
        <KebabMenuMaterial
          options={kebabOptions}
          placement="left"
          variant="White"
        />
      </div>
    </div>
  )
}
