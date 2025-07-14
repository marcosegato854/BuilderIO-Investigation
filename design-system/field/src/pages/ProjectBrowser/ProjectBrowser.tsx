import { EmptyList } from 'components/atoms/EmptyList/EmptyList'
import { ProgressOverlay } from 'components/atoms/ProgressOverlay/ProgressOverlay'
import { RedPlusMobileButton } from 'components/atoms/RedPlusMobileButton/RedPlusMobileButton'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import {
  CardsGrid,
  GridVariant,
} from 'components/molecules/CardsGrid/CardsGrid'
import { GridFilters } from 'components/molecules/GridFilters/GridFilters'
import { IProjectGridItemProps } from 'components/molecules/ProjectGridItem/ProjectGridItem'
import { IProjectListItemProps } from 'components/molecules/ProjectListItem/ProjectListItem'
import { Header } from 'components/organisms/Header/Header'
import style from 'pages/ProjectBrowser/ProjectBrowser.module.scss'
import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RouteComponentProps, useLocation } from 'react-router-dom'
import { setCurrentCoordinateSystem } from 'store/features/coordsys/slice'
import { apiCallIds } from 'store/features/dataStorage/api'
import {
  dataStorageClearCurrentProject,
  dataStorageJobsActions,
  dataStorageProjectsActions,
  dataStorageProjectsGridSettings,
  GridSettings,
  selectDataStorageDisks,
  selectDataStorageProjects,
  selectDataStorageProjectsGridSettings,
} from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import { useTrackProgress } from 'store/services/trackProgress'

export interface IProjectBrowserProps extends RouteComponentProps {}

/**
 * ProjectBrowser description
 */
export const ProjectBrowser: FC<IProjectBrowserProps> = () => {
  const dispatch = useDispatch()
  const gridSettings = useSelector(selectDataStorageProjectsGridSettings)
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const loadProgress = useTrackProgress(apiCallIds.DATA_STORAGE_PROJECTS)

  const listData = useSelector(selectDataStorageProjects)

  const disks = useSelector(selectDataStorageDisks)

  // const sortOptions = t('filters.sort_options', {
  //   returnObjects: true,
  // }) as IClickableOption[]

  const listGridItems: IProjectGridItemProps[] | IProjectListItemProps[] =
    useMemo(() => listData.map((p) => ({ project: p })), [listData])

  /**
   * update the store everytime the search term changes
   * @param newValue new search term
   */
  const handleSearchChange = (newValue: string) =>
    dispatch(dataStorageProjectsGridSettings({ search: newValue }))

  /**
   * update the store everytime the sorting changes
   * @param newIndex new sorting data
   */
  const handleSortChange = (value: GridSettings) =>
    dispatch(dataStorageProjectsGridSettings(value))

  /**
   * update the store everytime the grid view changes
   * @param index selection index
   * @param option selected value
   */
  const handleViewChange = (index: number, option: IClickableOption) => {
    if (!option.value) return
    dispatch(
      dataStorageProjectsGridSettings({ viewBy: option.value as GridVariant })
    )
  }

  /**
   * add new callback
   */
  const openNewProjectForm = useCallback(() => {
    if (disks?.length) {
      dispatch(openDialogAction({ component: DialogNames.NewProjectForm }))
    } else {
      dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            title: t('project_browser.no_disks.title', 'canont create'),
            text: t('project_browser.no_disks.text', 'no disks'),
            okButtonLabel: t('job_browser.acquired_job_label', 'ok'),
          } as IAlertProps,
        })
      )
    }
  }, [dispatch, disks, t])

  /**
   * load the projects list
   */
  useEffect(() => {
    dispatch(dataStorageClearCurrentProject())
    dispatch(dataStorageProjectsActions.request())
  }, [dispatch])

  /**
   * clear the coordinate system selection
   */
  useEffect(() => {
    dispatch(setCurrentCoordinateSystem(null))
  }, [dispatch])

  /**
   * clear the jobs list
   */
  useEffect(() => {
    dispatch(dataStorageJobsActions.success({ jobs: [] }))
  }, [dispatch])

  /**
   * clear the search input
   * it maintains other filtering options
   */
  useEffect(() => {
    return () => {
      dispatch(dataStorageProjectsGridSettings({ search: '' }))
    }
  }, [dispatch])

  return (
    <div className={style.container}>
      <Header
        title={t('project_browser.header.browser', 'Browser')}
        centerText={t('header.welcome', 'Welcome')}
        pathname={pathname}
      />
      <div className={style.content}>
        <GridFilters
          title={t('project_browser.subtitle', 'Projects')}
          gridSettings={gridSettings}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onViewChange={handleViewChange}
        />
        {listData.length <= 0 ? (
          <EmptyList
            title={t('project_browser.no_project', 'No project found')}
            subtitle={t('project_browser.click_to_create', 'click +')}
            onClickNew={openNewProjectForm}
            isProject={true}
          />
        ) : (
          <div className={style['contentMain--full']}>
            <div className={style.projectsGrid}>
              <div className={style.projectsColumn}>
                <CardsGrid items={listGridItems} {...gridSettings} />
              </div>
            </div>
            <div className={style.addNew}>
              <RedPlusMobileButton onClick={openNewProjectForm} />
            </div>
          </div>
        )}
      </div>
      <ProgressOverlay display={loadProgress} />
    </div>
  )
}
