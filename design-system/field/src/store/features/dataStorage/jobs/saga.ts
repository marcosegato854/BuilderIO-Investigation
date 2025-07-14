// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { ILogViewerProps } from 'components/dialogs/LogViewer/LogViewer'
import { IProcessingDialogProps } from 'components/dialogs/ProcessingDialog/ProcessingDialog'
import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { append, mergeDeepRight } from 'ramda'
import {
  all,
  call,
  delay,
  fork,
  put,
  race,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { store } from 'store/configureStore'
import api from 'store/features/dataStorage/api'
import { checkJobType } from 'store/features/dataStorage/jobs/jobTypesUtils'
import {
  dataStorageClearCurrentJob,
  dataStorageCloseJobForm,
  dataStorageDeleteJobDialog,
  dataStorageEditJob,
  dataStorageJobDeleteActions,
  dataStorageJobDetailActions,
  dataStorageJobTypesActions,
  dataStorageNewJobActions,
  dataStorageOpenProcessingDialog,
  dataStorageProcessingLog,
  dataStorageProcessingStatusActions,
  dataStorageProjectDetailActions,
  dataStorageResetProcessing,
  dataStorageStartProcessingActions,
  dataStorageSubmitJobForm,
  dataStorageTempJob,
  dataStorageTempJobType,
  dataStorageUpdateJobActions,
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
  selectDataStorageJobTypes,
  selectProcessingInfo,
} from 'store/features/dataStorage/slice'
import {
  DataStorageJobDetailResponse,
  DataStorageProcessingItem,
  DataStorageStartProcessingPayload,
  JobType,
  NewJobTypeOptions,
} from 'store/features/dataStorage/types'
import {
  getRedirectUrl,
  processingErrors,
} from 'store/features/dataStorage/utils'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import apiPlanning from 'store/features/planning/api'
import { PlanningGetPlanResponse } from 'store/features/planning/types'
import { rtkServiceResetCurrentServerConnection } from 'store/features/rtk/slice'
import { setJobsSettings } from 'store/features/settings/slice'
import { replaceErrorParams } from 'utils/errors'
import { translateSystemNotification } from 'utils/notifications'

/**
 * SAGAS
 */

/** reset job plan estimations */
function* resetJobEstimations(disk: string, project: string, job: string) {
  console.info('[DATASTORAGE] reset job estimations')
  try {
    const getPlanResp: AxiosResponse<PlanningGetPlanResponse> = yield call(
      apiPlanning.planningGetPlan,
      {
        disk,
        job,
        project,
      }
    )
    const { plan } = getPlanResp.data
    const planWithoutEstimations = mergeDeepRight(plan, {
      needed: {
        time: null,
        battery: null,
        disk: null,
        distance: null,
      },
    })
    yield call(apiPlanning.planningUpdatePlan, {
      disk,
      job,
      project,
      plan: planWithoutEstimations,
    })
  } catch (error) {
    console.warn('[DATASTORAGE] could not reset job estimations')
    console.error(error)
  }
  return
}

/**
 * Handles the submission of a job in the variuos scenarios
 * @param param0 SubmitFormJobPayload
 */
function* submitJobForm({
  payload: { jobName, job, redirect },
}: ReturnType<typeof dataStorageSubmitJobForm>) {
  console.info('[DATASTORAGE] close the dialog')
  yield put(closeDialogAction())
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const section = pathname.split('/')[1]
  const currentProject: IProject = yield select(selectDataStorageCurrentProject)
  const shouldRedirect = section === 'acquisition' ? false : redirect
  const redirectUrl = shouldRedirect
    ? getRedirectUrl(currentProject, job)
    : undefined
  const savedJobType: NewJobTypeOptions | undefined = yield call(
    checkJobType,
    job,
    currentProject
  )
  const jobWithJobtype = mergeDeepRight(job, {
    type: savedJobType ? savedJobType.jobTypeName : job.type,
  }) as IJob
  // set job type as default
  yield put(setJobsSettings({ lastUsedProfile: jobWithJobtype.type }))
  if (jobWithJobtype.creationdate) {
    console.info(`[DATASTORAGE] update job while in section ${section}`)
    if (jobWithJobtype.planned && section === 'projects')
      yield call(
        resetJobEstimations,
        currentProject.disk,
        currentProject.name,
        jobWithJobtype.name
      )
    yield put(
      dataStorageUpdateJobActions.request({
        jobName: jobName || jobWithJobtype.name,
        job: jobWithJobtype,
        redirect: redirectUrl,
      })
    )
  } else {
    console.info('[DATASTORAGE] new job')
    yield put(
      dataStorageNewJobActions.request({
        job: jobWithJobtype,
        redirect: redirectUrl,
      })
    )
  }
  switch (section) {
    case 'projects':
      console.info('[DATASTORAGE] clear job in projects')
      yield put(dataStorageClearCurrentJob())
      break
    case 'acquisition':
      console.info('[DATASTORAGE] back to job info')
      yield delay(200) // avoid the previous popup to close this
      yield put(
        openDialogAction({
          component: DialogNames.JobInfo,
        })
      )
      break
    // case 'planning':
    //   break
    default:
      break
  }
}

/**
 * Handles the closing of a job form in the variuos scenarios
 */
function* closeJobForm() {
  console.info('[DATASTORAGE] clear temp job')
  yield put(dataStorageTempJob(null))
  // reset current RTK server
  yield put(rtkServiceResetCurrentServerConnection())
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const section = pathname.split('/')[1]
  switch (section) {
    case 'projects':
      console.info('[DATASTORAGE] just close')
      yield put(closeDialogAction())
      console.info('[DATASTORAGE] clear job before closing it')
      yield put(dataStorageClearCurrentJob())
      break
    case 'acquisition':
      yield put(closeDialogAction())
      console.info('[DATASTORAGE] go to jobinfo')
      yield put(
        openDialogAction({
          component: DialogNames.JobInfo,
        })
      )
      break
    // case 'planning':
    //   break
    default:
      console.info('[DATASTORAGE] just close default')
      yield put(closeDialogAction())
      break
  }
}

/**
 * Adds a temp job type to the list and sets it in the temp job
 */
function* tempJobType({ payload }: ReturnType<typeof dataStorageTempJobType>) {
  console.info(
    `[DATASTORAGE] temp job type ${payload.jobTypeName} profile: ${payload.jobTypeProfile}`
  )
  /** create the temp profile and update the list in the store */
  const currentProfiles: JobType[] = yield select(selectDataStorageJobTypes)
  const baseProfile = currentProfiles.find(
    (p) =>
      p.profile === payload.jobTypeProfile &&
      ['Road', 'Rail', 'Boat'].includes(p.name)
  )
  if (!baseProfile) {
    console.warn("[DATASTORAGE] couldn't find a base profile")
    return
  }
  const newProfile = mergeDeepRight(baseProfile, {
    name: payload.jobTypeName,
    temp: true,
  })
  const updatedProfiles = append(newProfile, currentProfiles)
  yield put(dataStorageJobTypesActions.success({ jobtype: updatedProfiles }))
}

/**
 * Displays the processing log of a job
 */
function* processingLog({
  payload,
}: ReturnType<typeof dataStorageProcessingLog>) {
  try {
    console.info(
      `[JOB] [USER_ACTION] user wants to see the processing logs of ${payload.job}`
    )
    const resp: AxiosResponse<DataStorageJobDetailResponse> = yield call(
      api.dataStorageJobDetail,
      payload.disk,
      payload.project,
      payload.job
    )
    if (resp.data.job.processOutput && resp.data.job.processOutput.errors) {
      const processingErrors = resp.data.job.processOutput.errors
      const translatedErrors = processingErrors.map(translateSystemNotification)
      yield put(
        openDialogAction({
          component: DialogNames.LogViewer,
          componentProps: {
            title: t('job_browser.processing_log_title', { job: payload.job }),
            okButtonLabel: t('backend_errors.dialogs.ok', 'ok'),
            log: translatedErrors,
          } as ILogViewerProps,
        })
      )
    } else return
  } catch (e) {
    console.error(e)
    yield put(errorAction(e))
  }
}

function* onEditJob() {
  while (true) {
    const { payload: jobName }: { payload: string } = yield take(
      dataStorageEditJob
    )
    yield put(dataStorageJobDetailActions.request(jobName))
    const results: unknown[] = yield race([
      take(dataStorageJobDetailActions.success),
      take(dataStorageJobDetailActions.failure),
    ])
    const response = results[0] as ReturnType<
      typeof dataStorageJobDetailActions.success
    >
    if (response) {
      console.info('[DATASTORAGE] job loaded, open dialog')
      yield put(
        openDialogAction({
          component: DialogNames.NewJobForm,
          componentProps: {
            initialValues: {
              ...response.payload.job,
            },
          },
        })
      )
    }
  }
}

/**
 * ask before deleting a job
 */
function* onDeleteJobDialog() {
  while (true) {
    const { payload: jobName }: { payload: string } = yield take(
      dataStorageDeleteJobDialog
    )
    yield put(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'error',
          cancelButtonLabel: t('job_browser.cancel_button', 'cancel'),
          okButtonCallback: () =>
            store.dispatch(dataStorageJobDeleteActions.request(jobName)),
          okButtonLabel: t('job_browser.delete_button', 'yes'),
          text: t('job_browser.delete_text', 'delete text'),
          title: t('job_browser.delete_title', { job: jobName }),
        } as IAlertProps,
      })
    )
  }
}

/**
 * updates the current processing items progress
 */
function* updateProgress() {
  while (true) {
    // wait
    yield delay(5000)
    const pathname: string = yield select(
      (state) => state.router.location.pathname
    )
    const section = pathname.split('/')[1]
    if (section === 'projects') {
      const processingInfo: DataStorageProcessingItem[] | null = yield select(
        selectProcessingInfo
      )
      if (processingInfo && processingErrors(processingInfo)) {
        console.info('[JOBS] there was an error while processing jobs')
      } else if (processingInfo && processingInfo?.length > 0) {
        console.info('[JOBS] update processing status')
        yield put(dataStorageProcessingStatusActions.request())
      } else {
        console.info('[JOBS] wait for processing to start')
        const { data } = yield race({
          data: take(dataStorageProcessingStatusActions.success),
          timeout: delay(20000),
        })
        if (data) console.info('[JOBS] new processing status received')
        if (!data) console.warn('[JOBS] no data received, check anyway')
      }
    }
  }
}

/**
 * Dialog for handling the processing disk space
 */
function* openDiskSpaceAlert(payload: DataStorageProcessingItem) {
  const newStartPayload: DataStorageStartProcessingPayload = {
    ...payload,
    forceSpace: true,
  }
  yield put(dataStorageResetProcessing())
  const translatedText = replaceErrorParams(
    t(
      'notifications.dataStorage.LCB011.text',
      'running out of space, continue anyway?'
    ),
    payload.job
  )
  yield put(
    openDialogAction({
      component: DialogNames.Alert,
      componentProps: {
        type: 'warning',
        cancelButtonLabel: t(
          'notifications.dataStorage.LCB011.cancelButton',
          'cancel'
        ),
        okButtonCallback: async () => {
          store.dispatch(
            dataStorageStartProcessingActions.request(newStartPayload)
          )
          store.dispatch(closeDialogAction())
        },
        okButtonLabel: t('notifications.dataStorage.LCB011.okButton', 'ok'),
        text: translatedText,
        title: t('notifications.dataStorage.LCB011.title', 'disk alert'),
      } as IAlertProps,
    })
  )
}

/**
 * check for low disk space errors on the POST startProcessing
 * and opens a dialog to let the user force the office processing
 */
function* startProcessingSpaceAlert({
  payload,
}: ReturnType<typeof dataStorageStartProcessingActions.success>) {
  if (payload && 'result' in payload && 'errors' in payload) {
    const diskError =
      payload.errors?.find((error) => error.code === 'LCB011') || null
    if (diskError) {
      yield call(openDiskSpaceAlert, payload.result)
    }
  }
}

/**
 * check for low disk space errors on the POST updateProcessing
 * and opens a dialog to let the user force the office processing
 */
function* updateProcessingSpaceAlert({
  payload,
}: ReturnType<typeof dataStorageProcessingStatusActions.success>) {
  if (payload && 'currentProcess' in payload) {
    const processWithErrors = payload.currentProcess?.find(
      (process) =>
        process.errors &&
        process.errors.find((error) => error.code === 'LCB011')
    )
    if (processWithErrors) {
      yield call(openDiskSpaceAlert, processWithErrors)
    }
  }
}

/**
 * opens the processing dialog
 */
function* openProcessingDialog({
  payload,
}: ReturnType<typeof dataStorageOpenProcessingDialog>) {
  /** update the project info */
  yield put(
    dataStorageProjectDetailActions.request({
      disk: payload.disk,
      project: payload.projectName,
    })
  )
  yield race([
    take(dataStorageProjectDetailActions.success),
    take(dataStorageProjectDetailActions.failure),
  ])
  /** retrieve the job */
  yield put(dataStorageJobDetailActions.request(payload.job.name))
  yield race([
    take(dataStorageJobDetailActions.success),
    take(dataStorageJobDetailActions.failure),
  ])
  const job: IJob | null = yield select(selectDataStorageCurrentJob)
  const currentProject: IProject = yield select(selectDataStorageCurrentProject)
  if (!currentProject?.name) {
    console.warn('[PROCESSING DIALOG] project not retrieved')
    return
  }
  const { coordinate } = currentProject
  const coordsysIsLocked = coordinate?.locked ?? false
  if (!job?.name) {
    console.warn('[PROCESSING DIALOG] job not retrieved')
    return
  }
  console.info('[PROCESSING DIALOG] job loaded')
  yield put(
    openDialogAction({
      component: DialogNames.ProcessingDialog,
      componentProps: {
        job,
        coordsysIsLocked,
      } as IProcessingDialogProps,
    })
  )
}

// prettier-ignore
export function* dataStorageJobsSaga() {
  yield takeLatest(dataStorageSubmitJobForm, submitJobForm)
  yield takeLatest(dataStorageCloseJobForm, closeJobForm)
  yield takeLatest(dataStorageTempJobType, tempJobType)
  yield takeLatest(dataStorageProcessingLog, processingLog)
  yield all([fork(updateProgress)])
  yield all([fork(onEditJob)])
  yield all([fork(onDeleteJobDialog)])
  yield takeLatest(
    dataStorageStartProcessingActions.success,
    startProcessingSpaceAlert
  )
  yield takeLatest(
    dataStorageProcessingStatusActions.success,
    updateProcessingSpaceAlert
  )
  yield takeLatest(dataStorageOpenProcessingDialog, openProcessingDialog)
}
