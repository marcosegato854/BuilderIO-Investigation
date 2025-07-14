import useGoToPlan from 'hooks/useGoToPlan'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsAdmin } from 'store/features/auth/slice'
import {
  dataStorageCloneJobAction,
  dataStorageDeleteJobDialog,
  dataStorageEditJob,
  dataStorageJobDetailActions,
  dataStorageOpenProcessingDialog,
  jobReportActions,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import { selectLanguage } from 'store/features/settings/slice'

/**
 * Hook that returns the kebab options of a job
 */
const useJobKebabOptions = (
  setDetailsMenuItem: React.Dispatch<
    React.SetStateAction<HTMLLIElement | null | undefined>
  >,
  job?: IJob
) => {
  const { name, acquired } = job || {}
  const { t } = useTranslation()
  const [viewPlan] = useGoToPlan(job)
  const dispatch = useDispatch()
  const isAdmin = useSelector(selectIsAdmin)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const { disk, name: projectName } = currentProject || {}
  const language = useSelector(selectLanguage)

  const cloneJob = useCallback(() => {
    if (!job) return
    dispatch(dataStorageCloneJobAction(job))
  }, [dispatch, job])

  const openProcessingDialog = useCallback(() => {
    if (!job) return
    if (!disk || !projectName) return
    // action to open the processing dialog
    dispatch(dataStorageOpenProcessingDialog({ job, disk, projectName }))
  }, [disk, dispatch, job, projectName])

  const acquiredJobAdditionalOptions = useMemo(() => {
    if (!acquired) return []
    return [
      {
        onClick: () => {
          if (!disk || !name || !projectName) return
          dispatch(
            jobReportActions.request({
              disk,
              job: name,
              project: projectName,
              language: language || 'en',
            })
          )
        },
        value: 'report',
        label: t('job_browser.kebab.job_report', 'Report'),
        enable: true,
      },
      // TODO: disabled
      // {
      //   onClick: () => console.info('view & measure clicked'),
      //   value: 'measure',
      //   label: t('job_browser.kebab.view_measure', 'View measure'),
      //   enable: true,
      // },
    ]
  }, [acquired, disk, dispatch, name, projectName, t, language])

  /* const processedJobAdditionalOptions = useMemo(() => {
    if (!job) return []
    // if (job?.imageProcessed === 100) return []
    if (!job?.acquired) return []
    return [
      {
        onClick: () => openProcessingDialog(),
        value: 'start',
        label: t('job_browser.kebab.finalise_export', 'finalise & export'),
        enable: true,
      },
    ]
  }, [job, t, openProcessingDialog]) */

  const plannedJobAdditionalOptions = useMemo(() => {
    if (!job?.planned) return []
    return [
      {
        onClick: () => viewPlan(),
        value: 'plan',
        label: t('job_browser.kebab.view_plan', 'View plan'),
        enable: !job?.acquired,
      },
    ]
  }, [job, t, viewPlan])

  const adminAdditionalOptions = useMemo(() => {
    if (!isAdmin) return []
    return [
      {
        onClick: () => cloneJob(),
        value: 'clone',
        label: t('job_browser.kebab.clone', 'clone'),
        enable: true,
      },
    ]
  }, [cloneJob, isAdmin, t])

  const kebabOptions: Array<IClickableOption> = [
    ...plannedJobAdditionalOptions,
    {
      onClick: () => dispatch(dataStorageEditJob(name || '')),
      value: 'edit',
      label: t('job_browser.kebab.edit_job', 'Edit'),
      enable: !job?.acquired,
    },
    {
      onClick: (e: React.MouseEvent<HTMLLIElement>) => {
        setDetailsMenuItem(e.currentTarget)
        dispatch(dataStorageJobDetailActions.request(name || ''))
      },
      dontCloseOnClick: true,
      value: 'settings',
      label: t('job_browser.kebab.view_settings', 'View settings'),
      enable: true,
    },
    {
      onClick: () => dispatch(dataStorageDeleteJobDialog(name || '')),
      value: 'delete',
      label: t('job_browser.kebab.delete', 'Delete'),
      enable: true,
    },
    /* ...processedJobAdditionalOptions, */
    ...acquiredJobAdditionalOptions,
    ...adminAdditionalOptions,
  ]
  return [kebabOptions]
}
export default useJobKebabOptions
