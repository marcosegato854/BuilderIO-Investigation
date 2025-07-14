// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { push } from 'connected-react-router'
import { t } from 'i18n/config'
import { pluck } from 'ramda'
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
import { Routes } from 'Routes'
import { store } from 'store'
import api from 'store/features/actions/api'
import {
  actionServiceDialogProceed,
  actionsServiceAbort,
  actionsServiceAcquisitionReady,
  actionsServiceActivateSystemAction,
  actionsServiceActivationAbortActions,
  actionsServiceActivationInfoActions,
  actionsServiceActivationStartActions,
  selectAcquisitionReady,
  selectActivationDone,
} from 'store/features/actions/slice'
import { ActionsServiceActivationInfoResponse } from 'store/features/actions/types'
import { selectIsAdmin } from 'store/features/auth/slice'
import { selectDisconnectedCameraGroups } from 'store/features/camera/slice'
import { CameraGroup } from 'store/features/camera/types'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
  dataStorageSubmitInfoActions,
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
  selectDataStorageJobTypes,
} from 'store/features/dataStorage/slice'
import { JobType } from 'store/features/dataStorage/types'
import { isRTKServerIncomplete } from 'store/features/dataStorage/utils'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import { redirectToJobsAction } from 'store/features/global/slice'
import { getPlannedJobActions } from 'store/features/planning/slice'
import apiPointCloud from 'store/features/pointcloud/api'
import { PointCloudFolderResponse } from 'store/features/pointcloud/types'
import { selectPosition } from 'store/features/position/slice'
import { PositionNotification } from 'store/features/position/types'
import {
  rtkServiceInfoActions,
  selectRtkCurrentServer,
} from 'store/features/rtk/slice'
import { RtkServer } from 'store/features/rtk/types'
import { setLastPositionSettings } from 'store/features/settings/slice'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import {
  logMessage,
  logWarning,
  selectSystemState,
  stateMessageAction,
  systemStateActions,
} from 'store/features/system/slice'
import {
  activatedStates,
  SystemState,
  visibleMapStates,
} from 'store/features/system/types'
import { composeErrorString, translateError } from 'utils/errors'
import { obfuscatePassword } from 'utils/objects'
import { redirectToCurrentJob } from 'utils/saga/redirect'

/**
 * SAGAS
 */

/**
 * error activating
 */
function* activationError(description?: string, error?: unknown) {
  const messages = [description]
  if (error) messages.push(translateError(error))
  const message = messages.join(' - ')
  yield put(
    addSpeechText({
      content: { text: message, type: SpeechTextType.ERROR },
      priority: true,
    })
  )
  yield put(
    openDialogAction({
      component: DialogNames.Alert,
      componentProps: {
        type: 'error',
        variant: 'colored',
        okButtonLabel: 'OK',
        title: t('acquisition.activation.title', 'activation'),
        text: message,
      } as IAlertProps,
    })
  )
  yield take(closeDialogAction)
  const currentProject: IProject | null = yield select(
    selectDataStorageCurrentProject
  )
  if (currentProject) {
    yield put(
      push(
        Routes.JOBS.replace(':diskName', currentProject.disk).replace(
          ':projectName',
          currentProject.name
        )
      )
    )
  } else {
    yield put(push(Routes.PROJECTS))
  }
}

/**
 * handles activation dialogs before starting acquisition
 * @param job
 */
function* activationDialogs(job: IJob) {
  /** check if we are in acquisition */
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const section = pathname.split('/')[1]
  if (section !== 'acquisition') {
    console.info('[ACTIVATION] not in acquisition, skipping')
    return false
  }
  /** check disconnected cameras */
  const disconnectedCameras: CameraGroup[] = yield select(
    selectDisconnectedCameraGroups
  )
  if (disconnectedCameras.length > 0) {
    const message = t('acquisition.deactivated_camera.text_activating', 'text')
    yield put(
      addSpeechText({
        content: { text: message, type: SpeechTextType.ERROR },
        priority: true,
      })
    )
    yield put(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'warning',
          cancelButtonLabel: t(
            'acquisition.deactivated_camera.cancel',
            'Cancel'
          ),
          okButtonCallback: () => {
            store.dispatch(closeDialogAction())
            store.dispatch(actionServiceDialogProceed())
            store.dispatch(
              logMessage(
                '[USER_ACTION] User accepted to acquire with a disconnected camera'
              )
            )
          },
          cancelButtonCallback: () => {
            store.dispatch(closeDialogAction())
            store.dispatch(actionsServiceAbort())
            store.dispatch(
              logMessage(
                '[USER_ACTION] User refused to acquire with a disconnected camera'
              )
            )
          },
          okButtonLabel: t('acquisition.deactivated_camera.ok_active', 'YES'),
          text: message,
          title: t('acquisition.deactivated_camera.title', 'title'),
        } as IAlertProps,
      })
    )
    // wait for cancel or confirm
    const resultsDisconnected: unknown[] = yield race([
      take(actionServiceDialogProceed),
      take(actionsServiceAbort),
    ])
    if (resultsDisconnected[1]) return false
    yield delay(200) // avoid to close the next popup
  }
  /** show info dialog */
  console.info('[ACTIVATION] show job info dialog')
  yield put(
    openDialogAction({
      component: DialogNames.JobInfo,
    })
  )
  const resultsJobInfo: unknown[] = yield race([
    take(actionServiceDialogProceed),
    take(actionsServiceAbort),
  ])
  console.info('[ACTIVATION] job info dialog is done')
  if (resultsJobInfo[1]) return false
  /** get current job */
  const currentJob: IJob | undefined = yield select(selectDataStorageCurrentJob)
  if (!currentJob) return false
  /** check RTK */
  const currentServer: RtkServer | null = yield select(selectRtkCurrentServer)
  if (
    currentJob.ntrip &&
    currentJob.ntrip.enable &&
    (isRTKServerIncomplete(currentJob.ntrip) || !currentServer?.connected)
  ) {
    yield delay(200) // avoid the previous popup to close this one
    console.info('[ACTIVATION] show RTK Dialog')
    yield put(
      openDialogAction({
        component: DialogNames.RTKSettingsDialog,
        componentProps: {
          canAbortActivation: true,
          initialValues: {
            ...currentJob.ntrip,
          },
        },
      })
    )
    const resultsRtk: unknown[] = yield race([
      take(actionServiceDialogProceed),
      take(actionsServiceAbort),
    ])
    console.info('[ACTIVATION] RTK dialog is done')
    return !resultsRtk[1]
  } else {
    console.info(
      `[ACTIVATION] no need for RTK Dialog, RTK is ${
        currentJob?.ntrip?.enable ? 'ON' : 'OFF'
      }`
    )
  }
  return true
}

/**
 * do the steps to activate the system
 */
function* activateSystem({
  payload,
}: ReturnType<typeof actionsServiceActivateSystemAction>) {
  console.info('[ACTIVATION] activate system')
  /** check system state */
  let systemState: SystemState | null = yield select(selectSystemState)
  if (systemState === null) {
    yield take(systemStateActions.success)
    systemState = yield select(selectSystemState)
  }
  if (!systemState) {
    console.warn('[ACTIVATION] no systems state, aborting')
    return
  }
  console.info('[ACTIVATION] state:', systemState.state)
  if (activatedStates.includes(systemState.state)) {
    yield put(actionsServiceAcquisitionReady(true))
    console.info('[ACTIVATION] already active')
    // yield put(alignmentStatusActions.request())
    return
  }
  if (systemState.state === 'Deactivating') {
    console.info('[ACTIVATION] deactivating')
    return
  }
  if (systemState.state === 'Activating') {
    console.info('[ACTIVATION] activating ...')
    // yield call(waitForActivated)
    return
  }

  /** retrieve the project */
  yield put(
    dataStorageProjectDetailActions.request({
      disk: payload.disk,
      project: payload.project,
    })
  )
  yield race([
    take(dataStorageProjectDetailActions.success),
    take(dataStorageProjectDetailActions.failure),
  ])
  const project: IProject | null = yield select(selectDataStorageCurrentProject)
  if (!project?.name) {
    console.warn('[ACTIVATION] project not retrieved')
    yield call(activationError, 'project not retrieved')
    return
  }
  console.info('[ACTIVATION] project loaded')

  /** retrieve the job */
  yield put(dataStorageJobDetailActions.request(payload.job))
  yield race([
    take(dataStorageJobDetailActions.success),
    take(dataStorageJobDetailActions.failure),
  ])
  const job: IJob | null = yield select(selectDataStorageCurrentJob)
  if (!job?.name) {
    console.warn('[ACTIVATION] job not retrieved')
    yield call(activationError, 'job not retrieved')
    return
  }
  console.info('[ACTIVATION] job loaded')
  console.info('[JOB_SETTINGS]')
  /** According to PEF-4557 we need to hide the password embedded in the job object */
  const jobCopy = obfuscatePassword({ ...job })
  console.info(JSON.stringify(jobCopy, null, '\t'))

  const isAdmin: boolean = yield select(selectIsAdmin)
  const jobTypes: JobType[] = yield select(selectDataStorageJobTypes)
  const adminTypesNames = pluck(
    'name',
    jobTypes.filter((jt) => jt.admin)
  )
  const isAdminJob = adminTypesNames.includes(job.type || '')
  if (!isAdmin && isAdminJob) {
    yield call(activationError, t('job_browser.admin_job', 'admin_job'))
    return
  }

  if (job.acquired) {
    console.info('[ACTIVATION] job is acquired, should redirect to project')
    yield call(redirectToCurrentJob)
    return
  }

  /** retrieve the plan */
  yield put(
    getPlannedJobActions.request({
      disk: project.disk,
      project: project.name,
      job: job.name,
    })
  )

  /** get system activation info */
  yield put(actionsServiceActivationInfoActions.request())
  const [activationActionResult, activationActionFailure]: [
    ReturnType<typeof actionsServiceActivationInfoActions.success> | undefined,
    ReturnType<typeof actionsServiceActivationInfoActions.failure> | undefined
  ] = yield race([
    take(actionsServiceActivationInfoActions.success),
    take(actionsServiceActivationInfoActions.failure),
  ])
  // seems to give an error the first time, so I ignore it for now, just log
  if (!activationActionResult) {
    console.warn('[ACTIVATION] activation info failed', activationActionFailure)
    // return
  }
  const active: boolean = yield select(selectActivationDone)
  console.info('[ACTIVATION] status', active)
  if (active) {
    console.info('[ACTIVATION] already active, go directly to the map')
  } else {
    /** show the dialogs */
    console.info('[ACTIVATION] not active, show the dialogs')
    const canProceed: boolean = yield call(activationDialogs, job)
    if (!canProceed) {
      console.info('[ACTIVATION] Aborted by dialogs')
      yield call(redirectToCurrentJob)
      return
    }
    console.info('[ACTIVATION] Dialogs are done')
    // submit
    yield put(dataStorageSubmitInfoActions.request(payload))
    const [submitActionResult]: [
      ReturnType<typeof dataStorageSubmitInfoActions.success> | undefined,
      ReturnType<typeof dataStorageSubmitInfoActions.failure> | undefined
    ] = yield race([
      take(dataStorageSubmitInfoActions.success),
      take(dataStorageSubmitInfoActions.failure),
    ])
    if (!submitActionResult) {
      console.warn('[ACTIVATION] submit failed')
      return
    }
    // start activation
    yield put(actionsServiceActivationStartActions.request())
  }
}

/**
 * if activation is successful, do the next steps
 */
function* afterActivation({
  payload,
}: ReturnType<typeof actionsServiceActivationInfoActions.success>) {
  console.info(
    `[ACTIVATION] after activation. Status ${payload.action.status}. Progress ${payload.action.progress}`
  )
  // then when the system is active
  if (payload.action.progress < 100) return
  if (payload.action.status === 'abort') return
  // add the folder to load pointcloud data
  const currentJob: IJob = yield select(selectDataStorageCurrentJob)
  const currentProject: IProject = yield select(selectDataStorageCurrentProject)
  if (currentJob) {
    try {
      // load rtk info
      yield put(rtkServiceInfoActions.request())
      // make express expose the hspc folder
      const hspcFolderResult: AxiosResponse<PointCloudFolderResponse> =
        yield call(
          apiPointCloud.addFolder,
          currentProject.name,
          currentJob.name
        )
      console.info('[POINTCLOUD] addFolder response', hspcFolderResult)
      // load alignment info
      // console.info('[ACTIVATION] load alignment info after activation')
      // yield put(alignmentStatusActions.request())
      // display the activated icon for 2 seconds before going to the map
      yield delay(2000)
      console.info('[ACTIVATION] everything ok, should display the map')
      // set the position as last position (for the planning as a fallback)
      yield call(setPositionAfterActivation)
    } catch (e) {
      console.error('[POINTCLOUD] addFolder probably failed')
      console.error(e)
      yield call(activationError, 'Error after activation', e)
    }
    yield put(actionsServiceAcquisitionReady(true))
  } else {
    console.warn('[ACTIVATION] no current job')
    yield call(
      activationError,
      `${t('acquisition.activation.title')} ${t(
        'new_job_form.validation.job_name',
        'no current job'
      )}`
    )
  }
}

function* setPositionAfterActivation() {
  console.info('[ACTIVATION] setting the actual position as the last known')
  const positionNotification: PositionNotification | null = yield select(
    selectPosition
  )
  if (positionNotification?.position?.map)
    yield put(
      setLastPositionSettings({
        latitude: positionNotification.position.map.latitude,
        longitude: positionNotification.position.map.longitude,
      })
    )
}

/**
 * if activation failed, redirect
 */
function* failedActivation() {
  console.warn('[ACTIVATION] failed, redirect to job browser')
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const [, , diskName, projectName, jobName] = pathname.split('/')
  const jobRoute = `${Routes.JOBS.replace(':diskName', diskName).replace(
    ':projectName',
    projectName
  )}/${jobName}`
  yield put(push(jobRoute))
}

/**
 * starts polling for mountpoints load
 * after successful authentication
 */
function* activationPollSagaWorker() {
  // wait for successful mountpoints load
  while (true) {
    try {
      const response: AxiosResponse<ActionsServiceActivationInfoResponse> =
        yield call(api.actionsActivationInfo)
      console.info('[ACTIVATION] polling', response.data?.action?.status)
      if (response.data?.action?.status === 'error') {
        const text = composeErrorString(
          t('acquisition.activation.failure', 'Activation failed'),
          response.data.action.errors
        )
        yield put(
          addSpeechText({
            content: { text, type: SpeechTextType.ERROR },
            priority: true,
          })
        )
        yield call(activationError, text)
        break
      } else if (response.data?.action?.status === 'abort') {
        // activation abort
        console.info('[ACTIVATION] aborted, disable map')
        yield put(actionsServiceAcquisitionReady(false))
        yield put(redirectToJobsAction())
        break
      } else if (response.data?.action?.status === 'done') {
        // activation done
        yield put(actionsServiceActivationInfoActions.success(response.data))
        break
      } else {
        // not yet, update progress
        yield put(actionsServiceActivationInfoActions.success(response.data))
        yield delay(1000)
      }
    } catch (e) {
      console.error(e)
      yield put(actionsServiceActivationInfoActions.failure())
      yield put(errorAction(e))
      break
    }
  }
}

/**
 * Saga watcher.
 */
function* activationPollSagaWatcher() {
  while (true) {
    const {
      payload: { action },
    }: {
      payload: ActionsServiceActivationInfoResponse
    } = yield take(actionsServiceActivationStartActions.success)
    console.info('[ACTIVATION] start activation status', action.status)
    if (action.status !== 'error') {
      console.info('[ACTIVATION] start polling')
      // wait for successful activation
      yield race([
        call(activationPollSagaWorker),
        take('POLLING_ACTIVATION_STOP'), // actually nobody dispatches this action
      ])
    } else {
      console.info('[ACTIVATION] no polling needed', action.status)
    }
  }
}

function* logAbortActivation() {
  yield put(logWarning('[USER_ACTION] User aborted activation'))
}

function* waitForActivated() {
  while (true) {
    console.info('[ACTIVATION] waiting for activated')
    const savedState: SystemState = yield select(selectSystemState)
    const results: [
      ReturnType<typeof systemStateActions.success> | undefined,
      ReturnType<typeof stateMessageAction> | undefined
    ] = yield race([take(systemStateActions.success), take(stateMessageAction)])
    const response: { payload: SystemState } = results.filter(Boolean)[0]!
    const newState = response?.payload.state
    if (savedState?.state !== newState) {
      const acquisitionReady: boolean = yield select(selectAcquisitionReady)
      if (visibleMapStates.includes(newState)) {
        if (!acquisitionReady) {
          yield delay(2000)
          yield put(actionsServiceAcquisitionReady(true))
          console.info('[ACTIVATION] stop waiting - visible map state')
          return
        }
      } else if (acquisitionReady) {
        yield put(actionsServiceAcquisitionReady(false))
        console.info('[ACTIVATION] stop waiting - visible map state false')
      }
    }
  }
}

export function* activationPollSaga() {
  yield all([fork(activationPollSagaWatcher)])
  yield all([fork(waitForActivated)])
  yield takeLatest(actionsServiceActivateSystemAction, activateSystem)
  yield takeLatest(
    [
      actionsServiceActivationInfoActions.success,
      actionsServiceActivationStartActions.success,
    ],
    afterActivation
  )
  yield takeLatest(
    actionsServiceActivationStartActions.failure,
    failedActivation
  )
  yield takeLatest(
    actionsServiceActivationAbortActions.request,
    logAbortActivation
  )
}
