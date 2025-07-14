import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { push } from 'connected-react-router'
import useGoToPlan from 'hooks/useGoToPlan'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Routes } from 'Routes'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'

/**
 * Hook that handles the click of a job item
 */
const useItemClickHandler = (job?: IJob) => {
  const { name, acquired, planned } = job || {}
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [viewPlan] = useGoToPlan(job)

  const itemClickHandler = useCallback(() => {
    if (acquired) {
      dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            title: name,
            text: t('job_browser.acquired_job_text', 'already acquired'),
            okButtonLabel: t('job_browser.acquired_job_label', 'ok'),
          } as IAlertProps,
        })
      )
      return
    }
    if (!name) return
    if (planned) {
      viewPlan()
      return
    }
    dispatch(
      push(
        Routes.ACQUISITION.replace(':diskName', currentProject?.disk || '')
          .replace(':projectName', currentProject?.name || '')
          .replace(':jobName', name)
      )
    )
  }, [name, planned, currentProject, dispatch, acquired, viewPlan, t])
  return [itemClickHandler]
}
export default useItemClickHandler
