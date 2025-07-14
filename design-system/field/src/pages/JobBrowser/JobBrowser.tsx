/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Icon } from 'components/atoms/Icon/Icon'
import { EmptyList } from 'components/atoms/EmptyList/EmptyList'
import { ProgressOverlay } from 'components/atoms/ProgressOverlay/ProgressOverlay'
import { RedPlusMobileButton } from 'components/atoms/RedPlusMobileButton/RedPlusMobileButton'
import { DialogNames } from 'components/dialogs/dialogNames'
import {
  CardsGrid,
  GridVariant,
} from 'components/molecules/CardsGrid/CardsGrid'
import { GridFilters } from 'components/molecules/GridFilters/GridFilters'
import { IJobGridItemProps } from 'components/molecules/JobGridItem/JobGridItem'
import { IJobListItemProps } from 'components/molecules/JobListItem/JobListItem'
import { Header } from 'components/organisms/Header/Header'
import { push } from 'connected-react-router'
import style from 'pages/JobBrowser/JobBrowser.module.scss'
import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RouteComponentProps, useLocation, useParams } from 'react-router-dom'
import { Routes } from 'Routes'
import { apiCallIds } from 'store/features/dataStorage/api'
import {
  dataStorageClearCurrentJob,
  dataStorageJobsActions,
  dataStorageJobsGridSettings,
  dataStorageProjectDetailActions,
  GridSettings,
  resetReportAction,
  selectDataStorageCurrentProject,
  selectDataStorageJobs,
  selectDataStorageJobsGridSettings,
  selectJobReportStatus,
} from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import { useTrackProgress } from 'store/services/trackProgress'

export interface IJobBrowserProps extends RouteComponentProps {}

/**
 * JobBrowser description
 */
export const JobBrowser: FC<IJobBrowserProps> = () => {
  const dispatch = useDispatch()
  const gridSettings = useSelector(selectDataStorageJobsGridSettings)
  const { projectName } = useParams<{ projectName: string }>()
  const { diskName } = useParams<{ diskName: string }>()
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const listData = useSelector(selectDataStorageJobs)
  const loadProgress = useTrackProgress(apiCallIds.DATA_STORAGE_JOBS)
  const detailProgress = useTrackProgress(apiCallIds.DATA_STORAGE_JOB_DETAIL)
  const reportStatus = useSelector(selectJobReportStatus)
  const reportProgress = reportStatus === 'progress'

  const showSpinner = useMemo(() => {
    return loadProgress || reportProgress || detailProgress
  }, [detailProgress, loadProgress, reportProgress])

  const listGridItems: IJobGridItemProps[] | IJobListItemProps[] = useMemo(
    () => listData.map((p) => ({ job: p })),
    [listData]
  )

  /**
   * update the store everytime the search term changes
   * @param newValue new search term
   */
  const handleSearchChange = (newValue: string) =>
    dispatch(dataStorageJobsGridSettings({ search: newValue }))

  /**
   * update the store everytime the sorting changes
   * @param newIndex new sorting data
   */
  const handleSortChange = (value: GridSettings) =>
    dispatch(dataStorageJobsGridSettings(value))

  /**
   * update the store everytime the grid view changes
   * @param index selection index
   * @param option selected value
   */
  const handleViewChange = (index: number, option: IClickableOption) => {
    if (!option.value) return
    dispatch(
      dataStorageJobsGridSettings({ viewBy: option.value as GridVariant })
    )
  }

  /**
   * add new callback
   */
  const openNewJobForm = useCallback(() => {
    dispatch(openDialogAction({ component: DialogNames.NewJobForm }))
  }, [dispatch])

  const BackToProjects = useMemo(() => {
    /**
     * back button callback
     */
    const onBack = () => {
      dispatch(push(Routes.PROJECTS))
    }
    return (
      <div className={style.backToProjects} onClick={onBack}>
        <Icon name="BackArrow" />
        <span>{t('header.back', 'Back to my Projects')}</span>
      </div>
    )
  }, [t, dispatch])

  /**
   * load the project details
   */
  useEffect(() => {
    if (projectName)
      dispatch(
        dataStorageProjectDetailActions.request({
          disk: diskName,
          project: projectName,
        })
      )
  }, [dispatch, projectName, diskName])

  /**
   * load the jobs list
   */
  useEffect(() => {
    if (currentProject) {
      console.info('[DATASTORAGE] clear job before loading job list')
      dispatch(dataStorageClearCurrentJob())
      dispatch(dataStorageJobsActions.request())
    }
  }, [dispatch, currentProject])

  /**
   * clear the search input
   * it maintains other filtering options
   */
  useEffect(() => {
    return () => {
      dispatch(dataStorageJobsGridSettings({ search: '' }))
    }
  }, [dispatch])

  /**
   * clear the report status
   */
  useEffect(() => {
    dispatch(resetReportAction())
  }, [dispatch])

  return (
    <div className={style.container}>
      <Header
        title={t('project_browser.header.browser', 'Browser')}
        centerText={`${t('job_browser.project', 'Project')}: ${
          currentProject?.name || '--'
        }`}
        // onClickSubtitle={onBack}
        leftCta={BackToProjects}
        pathname={pathname}
      />
      <div className={style.content}>
        <GridFilters
          title={t('job_browser.subtitle', 'Projects')}
          gridSettings={gridSettings}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onViewChange={handleViewChange}
        />
        {listData.length <= 0 ? (
          <EmptyList
            title={t('job_browser.no_job', 'no job')}
            subtitle={t('job_browser.click_to_create', 'new job')}
            onClickNew={openNewJobForm}
            isProject={false}
          />
        ) : (
          <div className={style['contentMain--full']}>
            <div className={style.jobsGrid}>
              <div className={style.jobsColumn}>
                <CardsGrid items={listGridItems} {...gridSettings} />
              </div>
            </div>
            <div className={style.addNew}>
              <RedPlusMobileButton onClick={openNewJobForm} />
            </div>
          </div>
        )}
      </div>
      <ProgressOverlay display={showSpinner} />
    </div>
  )
}
