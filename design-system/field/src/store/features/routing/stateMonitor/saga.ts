import { push } from 'connected-react-router'
import {
  all,
  call,
  fork,
  put,
  race,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { Routes } from 'Routes'
import {
  actionsServiceAcquisitionReady,
  actionsServiceDeactivating,
  selectAcquisitionReady,
} from 'store/features/actions/slice'
import { loginActions } from 'store/features/auth/slice'
import {
  dataStorageInfoActions,
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
  selectDataStorageInfo,
} from 'store/features/dataStorage/slice'
import { DataStorageInfo } from 'store/features/dataStorage/types'
import { closeAllDialogsAction } from 'store/features/dialogs/slice'
import {
  getPlannedJobActions,
  selectPolygons,
} from 'store/features/planning/slice'
import { Polygon } from 'store/features/planning/types'
import {
  pointCloudSubscribeAction,
  selectPointCloudConnected,
  selectPointcloudModule,
} from 'store/features/pointcloud/slice'
import {
  autocaptureStatusActions,
  routingStatusActions,
  selectRoutingModule,
} from 'store/features/routing/slice'
import {
  selectSystemState,
  stateMessageAction,
  systemStateActions,
} from 'store/features/system/slice'
import {
  activatedStates,
  ActivationStatus,
  SystemState,
} from 'store/features/system/types'
import { redirectToCurrentJob } from 'utils/saga/redirect'

function* updateDataStorageInfo() {
  try {
    console.info('[STATUS_MONITOR] update storage info')
    yield put(dataStorageInfoActions.request())
    yield race([
      take(dataStorageInfoActions.success),
      take(dataStorageInfoActions.failure),
    ])
    console.info('[STATUS_MONITOR] storage info udpated')
  } catch (e) {
    console.error(e)
  }
}

function* redirectToAcquisition() {
  try {
    const pathname: string = yield select(
      (state) => state.router.location.pathname
    )
    const info: DataStorageInfo = yield select(selectDataStorageInfo)
    if (!info) return
    const { disk, project, job } = info
    const redirectUrl = Routes.ACQUISITION.replace(':diskName', disk || '')
      .replace(':projectName', project || '')
      .replace(':jobName', job)
    // redirect
    if (pathname === redirectUrl) return
    console.info('[STATUS_MONITOR] redirect to', redirectUrl)
    yield put(push(redirectUrl))
    // TODO: should reset the current track plotted on myVR, but it's not in the store
    yield put(closeAllDialogsAction())
  } catch (e) {
    console.error(e)
  }
}

function* checkProject() {
  try {
    const info: DataStorageInfo = yield select(selectDataStorageInfo)
    if (!info) return
    const { disk, project } = info
    if (!disk) return
    if (!project) return
    const currentProject: IProject | null = yield select(
      selectDataStorageCurrentProject
    )
    if (currentProject?.name !== project) {
      console.info('[STATUS_MONITOR] update the project')
      yield put(
        dataStorageProjectDetailActions.request({
          disk,
          project,
        })
      )
      yield race([
        take(dataStorageProjectDetailActions.success),
        take(dataStorageProjectDetailActions.failure),
      ])
      console.info('[STATUS_MONITOR] project loaded')
    }
  } catch (e) {
    console.error(e)
  }
}

function* checkJob() {
  try {
    const info: DataStorageInfo = yield select(selectDataStorageInfo)
    const job = info?.job
    if (!job) return
    const currentJob: IJob | null = yield select(selectDataStorageCurrentJob)
    if (currentJob?.name !== job) {
      console.warn(
        `[STATUS_MONITOR] reset the map, ${currentJob?.name} is not ${job}!`
      )
      yield put(actionsServiceAcquisitionReady(false))
      console.info('[STATUS_MONITOR] update the job')
      yield put(dataStorageJobDetailActions.request(job))
      yield race([
        take(dataStorageJobDetailActions.success),
        take(dataStorageJobDetailActions.failure),
      ])
      console.info('[STATUS_MONITOR] job loaded')
    }
  } catch (e) {
    console.error(e)
  }
}

function* checkPlan() {
  try {
    const info: DataStorageInfo = yield select(selectDataStorageInfo)
    if (!info) return
    const { disk, project } = info
    if (!disk) return
    if (!project) return
    const currentJob: IJob | null = yield select(selectDataStorageCurrentJob)
    if (!currentJob) return
    if (currentJob.planned) {
      const polygons: Polygon[] | null = yield select(selectPolygons)
      if (polygons?.length) return
      console.info('[STATUS_MONITOR] update the plan')
      yield put(
        getPlannedJobActions.request({
          disk,
          project,
          job: currentJob.name,
        })
      )
      yield race([
        take(getPlannedJobActions.success),
        take(getPlannedJobActions.failure),
      ])
      console.info('[STATUS_MONITOR] plan loaded')
    }
  } catch (e) {
    console.error(e)
  }
}

function* checkAutocapture() {
  try {
    console.info('[STATUS_MONITOR] update autocapture')
    yield put(autocaptureStatusActions.request())
    yield race([
      take(autocaptureStatusActions.success),
      take(autocaptureStatusActions.failure),
    ])
    console.info('[STATUS_MONITOR] autocapture status loaded')
  } catch (e) {
    console.error(e)
  }
}

function* checkRouting() {
  try {
    console.info('[STATUS_MONITOR] update routing')
    yield put(routingStatusActions.request())
    yield race([
      take(routingStatusActions.success),
      take(routingStatusActions.failure),
    ])
    console.info('[STATUS_MONITOR] routing status loaded')
  } catch (e) {
    console.error(e)
  }
}

/**
 * Connect to pointcloud socket
 */
function* connectToPointCloudSocket() {
  const pointcloudModule: boolean = yield select(selectPointcloudModule)
  if (!pointcloudModule) return
  const isConnected: boolean = yield select(selectPointCloudConnected)
  if (isConnected) {
    console.info(
      '[STATUS_MONITOR] pointcloud socket is already connected, skipping'
    )
    return
  }
  console.info('[STATUS_MONITOR] connect to pointcloud socket')
  yield put(pointCloudSubscribeAction())
}

/**
 * Connect to pointcloud socket
 */
// function* disconnectFromPointCloudSocket() {
//   const isConnected: boolean = yield select(selectPointCloudConnected)
//   if (!isConnected) return
//   console.info('[STATUS_MONITOR] connect to pointcloud socket')
//   yield put(pointCloudUnsubscribeAction())
// }

/**
 * If acquisition is not ready,
 * avoid being stuck and redirect to jobs,
 * or current job if available
 */
function* redirectIfAcquisitionNotReady() {
  // don't if it's in planning
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const section = pathname.split('/')[1]
  if (['planning'].includes(section)) return
  const acquisitionReady: boolean = yield select(selectAcquisitionReady)
  if (!acquisitionReady) {
    console.warn('[STATUS_MONITOR] acquisition not ready, back to jobs')
    yield call(redirectToCurrentJob)
  }
}

/**
 * at successful login, check what needs to be done
 */
function* checkAtLogin() {
  const state: SystemState = yield select(selectSystemState)
  if (!state) return
  console.info('[STATUS_MONITOR] redo state checks after successful login')
  yield call(reactToState, state.state)
}

/**
 * check everything for an active system
 */
function* stepsForActiveSystem() {
  yield call(updateDataStorageInfo)
  yield call(checkProject)
  yield call(checkJob)
  yield call(checkPlan)
  yield call(redirectToAcquisition)
  yield call(connectToPointCloudSocket)
  const currentJob: IJob = yield select(selectDataStorageCurrentJob)
  const routingModuleEnabled: boolean = yield select(selectRoutingModule)
  if (currentJob?.planned && routingModuleEnabled) {
    yield call(checkAutocapture)
    yield call(checkRouting)
    yield put(routingStatusActions.request())
    yield put(autocaptureStatusActions.request())
  }
}

/**
 * check everything if system is deactivating
 */
function* stepsForDeactivatingSystem() {
  yield call(updateDataStorageInfo)
  yield call(checkProject)
  yield call(checkJob)
  yield call(redirectToAcquisition)
  yield put(actionsServiceDeactivating(true))
}

/**
 * check everything if system is deactivated
 */
function* stepsForDeactivatedSystem() {
  yield call(updateDataStorageInfo)
  // yield call(disconnectFromPointCloudSocket)
  yield put(actionsServiceDeactivating(false))
  yield call(redirectIfAcquisitionNotReady)
}

/**
 * react to new state
 */
function* reactToState(newState: ActivationStatus) {
  if (activatedStates.includes(newState)) {
    console.info('[STATUS_MONITOR] system active', newState)
    yield call(stepsForActiveSystem)
  } else if (['Deactivating'].includes(newState)) {
    console.info('[STATUS_MONITOR] system deactivating')
    yield call(stepsForDeactivatingSystem)
  } else if (['Deactivated'].includes(newState)) {
    console.info('[STATUS_MONITOR] system not active', newState)
    yield call(stepsForDeactivatedSystem)
  } else {
    console.info('[STATUS_MONITOR] ignoring', newState)
  }
}

/**
 * Act on state changes
 */
function* monitorStateChanges() {
  while (true) {
    const savedState: SystemState = yield select(selectSystemState)
    const results: [
      ReturnType<typeof systemStateActions.success> | undefined,
      ReturnType<typeof stateMessageAction> | undefined
    ] = yield race([take(systemStateActions.success), take(stateMessageAction)])
    const response: { payload: SystemState } | undefined =
      results[0] || results[1]
    const newState = response?.payload.state
    if (!newState) {
      // TODO: if it happens, maybe better to trigger a system state API call
      console.error('[STATUS_MONITOR] no system state received')
    } else if (savedState?.state !== newState) {
      console.info('[STATUS_MONITOR] state change detected', newState)
      yield call(reactToState, newState)
    }
  }
}

export function* routingStateMonitorSaga() {
  yield all([fork(monitorStateChanges)])
  yield takeLatest(loginActions.success, checkAtLogin)
  // TODO: fix store after login
}
