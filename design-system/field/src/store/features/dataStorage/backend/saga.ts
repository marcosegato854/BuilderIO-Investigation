// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { mergeDeepRight } from 'ramda'
import { call, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { selectIsAdmin } from 'store/features/auth/slice'
import {
  selectCurrentSystem,
  setCurrentCoordinateSystem,
} from 'store/features/coordsys/slice'
import { CurrentCoordinateSystem } from 'store/features/coordsys/types'
import api from 'store/features/dataStorage/api'
import {
  dataStorageAvailableDisksActions,
  dataStorageConfigActions,
  dataStorageDeleteJobTypeActions,
  dataStorageInfoActions,
  dataStorageJobDeleteActions,
  dataStorageJobDetailActions,
  dataStorageJobsActions,
  dataStorageJobTypesActions,
  dataStorageNewJobActions,
  dataStorageNewJobTypeActions,
  dataStorageNewProjectActions,
  dataStorageProcessingStatusActions,
  dataStorageProjectDeleteActions,
  dataStorageProjectDetailActions,
  dataStorageProjectsActions,
  dataStorageStartProcessingActions,
  dataStorageStopProcessingActions,
  dataStorageSubmitInfoActions,
  dataStorageUpdateJobActions,
  dataStorageUpdateJobTypeActions,
  dataStorageUpdateProjectActions,
  jobReportActions,
  jobReportInfoActions,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  DataStorageAvailableDisksResponse,
  DataStorageConfigResponse,
  DataStorageInfoResponse,
  DataStorageJobDeleteResponse,
  DataStorageJobDetailResponse,
  DataStorageJobsResponse,
  DataStorageJobTypesResponse,
  DataStorageNewJobResponse,
  DataStorageNewJobTypeResponse,
  DataStorageNewProjectResponse,
  DataStorageProcessingStatusResponse,
  DataStorageProjectDeleteResponse,
  DataStorageProjectDetailResponse,
  DataStorageProjectsResponse,
  DataStorageStartProcessingResponse,
  DataStorageUpdateJobResponse,
  DataStorageUpdateJobTypeResponse,
  DataStorageUpdateProjectRequest,
  DataStorageUpdateProjectResponse,
  JobReportInfoResponse,
  JobReportResponse,
} from 'store/features/dataStorage/types'
import { errorAction } from 'store/features/errors/slice'
import { composeErrorString } from 'utils/errors'
import { obfuscatePassword } from 'utils/objects'

/**
 * SAGAS
 */
function* dataStorageInfo() {
  try {
    const resp: AxiosResponse<DataStorageInfoResponse> = yield call(
      api.dataStorageInfo
    )
    yield put(dataStorageInfoActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageInfoActions.failure())
    console.error(e)
  }
}
function* dataStorageConfig() {
  try {
    const resp: AxiosResponse<DataStorageConfigResponse> = yield call(
      api.dataStorageConfig
    )
    console.info(
      `[DATASTORAGE] office available ${resp.data?.Process?.office?.available}, version ${resp.data?.Process?.office?.version}`
    )
    yield put(dataStorageConfigActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageConfigActions.failure())
    console.error(e)
  }
}
function* dataStorageSubmitInfo({
  payload,
}: ReturnType<typeof dataStorageSubmitInfoActions.request>) {
  try {
    const resp: AxiosResponse<DataStorageInfoResponse> = yield call(
      api.dataStorageSubmitInfo,
      payload
    )
    yield put(dataStorageSubmitInfoActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageSubmitInfoActions.failure())
    yield put(errorAction(e))
  }
}

/** DISKS */
function* dataStorageAvailableDisks() {
  try {
    const resp: AxiosResponse<DataStorageAvailableDisksResponse> = yield call(
      api.dataStorageAvailableDisks
    )
    yield put(dataStorageAvailableDisksActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageAvailableDisksActions.failure())
    yield put(errorAction(e))
  }
}

/** PROJECTS */
function* dataStorageProjects() {
  try {
    const resp: AxiosResponse<DataStorageProjectsResponse> = yield call(
      api.dataStorageProjects
    )
    yield put(dataStorageProjectsActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageProjectsActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageProjectDetail({
  payload,
}: ReturnType<typeof dataStorageProjectDetailActions.request>) {
  try {
    const resp: AxiosResponse<DataStorageProjectDetailResponse> = yield call(
      api.dataStorageProjectDetail,
      payload
    )
    yield put(dataStorageProjectDetailActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageProjectDetailActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageNewProject({
  payload,
}: ReturnType<typeof dataStorageNewProjectActions.request>) {
  try {
    const resp: AxiosResponse<DataStorageNewProjectResponse> = yield call(
      api.dataStorageNewProject,
      payload
    )
    yield put(dataStorageNewProjectActions.success(resp.data))
    yield put(setCurrentCoordinateSystem(null))
  } catch (e) {
    yield put(dataStorageNewProjectActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageUpdateProject({
  payload,
}: ReturnType<typeof dataStorageUpdateProjectActions.request>) {
  try {
    const resp: AxiosResponse<DataStorageUpdateProjectResponse> = yield call(
      api.dataStorageUpdateProject,
      payload
    )
    yield put(dataStorageUpdateProjectActions.success(resp.data))
    yield put(setCurrentCoordinateSystem(null))
  } catch (e) {
    yield put(dataStorageUpdateProjectActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageProjectDelete({
  payload,
}: ReturnType<typeof dataStorageProjectDeleteActions.request>) {
  try {
    const resp: AxiosResponse<DataStorageProjectDeleteResponse> = yield call(
      api.dataStorageProjectDelete,
      payload
    )
    yield put(dataStorageProjectDeleteActions.success(resp.data))
    yield put(setCurrentCoordinateSystem(null))
  } catch (e) {
    yield put(dataStorageProjectDeleteActions.failure())
    yield put(errorAction(e))
  }
}

/** JOBS */
function* dataStorageJobTypes() {
  try {
    const resp: AxiosResponse<DataStorageJobTypesResponse> = yield call(
      api.dataStorageJobTypes
    )
    yield put(dataStorageJobTypesActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageJobTypesActions.failure())
    yield put(errorAction(e))
  }
}
function* dataStorageJobs() {
  try {
    const currentProject: IProject = yield select(
      selectDataStorageCurrentProject
    )
    if (!currentProject) {
      console.warn('[DATASTORAGE] no current project')
      return
    }
    const resp: AxiosResponse<DataStorageJobsResponse> = yield call(
      api.dataStorageJobs,
      currentProject.disk,
      currentProject.name
    )
    yield put(dataStorageJobsActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageJobsActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageJobDetail({
  payload,
}: ReturnType<typeof dataStorageJobDetailActions.request>) {
  try {
    const currentProject: IProject = yield select(
      selectDataStorageCurrentProject
    )
    if (!currentProject) {
      console.warn('[DATASTORAGE] no current project')
      return
    }
    const resp: AxiosResponse<DataStorageJobDetailResponse> = yield call(
      api.dataStorageJobDetail,
      currentProject.disk,
      currentProject.name,
      payload
    )
    yield put(dataStorageJobDetailActions.success(resp.data))
  } catch (e) {
    console.error(e)
    yield put(dataStorageJobDetailActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageNewJob({
  payload,
}: ReturnType<typeof dataStorageNewJobActions.request>) {
  try {
    const currentProject: IProject = yield select(
      selectDataStorageCurrentProject
    )
    if (!currentProject) {
      console.warn('[DATASTORAGE] no current project')
      return
    }
    const resp: AxiosResponse<DataStorageNewJobResponse> = yield call(
      api.dataStorageNewJob,
      currentProject.disk,
      currentProject.name,
      payload.job
    )
    yield put(dataStorageNewJobActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageNewJobActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageUpdateJob({
  payload,
}: ReturnType<typeof dataStorageUpdateJobActions.request>) {
  try {
    const currentProject: IProject = yield select(
      selectDataStorageCurrentProject
    )
    if (!currentProject) {
      console.warn('[DATASTORAGE] no current project')
      return
    }
    const resp: AxiosResponse<DataStorageUpdateJobResponse> = yield call(
      api.dataStorageUpdateJob,
      {
        ...payload,
        projectName: currentProject.name,
        diskName: currentProject.disk,
      }
    )
    yield put(dataStorageUpdateJobActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageUpdateJobActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageNewJobType({
  payload,
}: ReturnType<typeof dataStorageNewJobTypeActions.request>) {
  try {
    // add admin information
    const isAdmin: boolean = yield select(selectIsAdmin)
    const jobTypeToSave = mergeDeepRight(payload, {
      jobType: { admin: isAdmin },
    })
    // call
    const resp: AxiosResponse<DataStorageNewJobTypeResponse> = yield call(
      api.dataStorageNewJobType,
      jobTypeToSave
    )
    yield put(dataStorageNewJobTypeActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageNewJobTypeActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageUpdateJobType({
  payload,
}: ReturnType<typeof dataStorageUpdateJobTypeActions.request>) {
  // add admin information
  const isAdmin: boolean = yield select(selectIsAdmin)
  const jobTypeToSave = mergeDeepRight(payload, {
    jobType: { admin: isAdmin },
  })
  try {
    const resp: AxiosResponse<DataStorageUpdateJobTypeResponse> = yield call(
      api.dataStorageUpdateJobType,
      jobTypeToSave
    )
    yield put(dataStorageUpdateJobTypeActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageUpdateJobTypeActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageDeleteJobType({
  payload,
}: ReturnType<typeof dataStorageDeleteJobTypeActions.request>) {
  try {
    yield call(api.dataStorageDeleteJobType, payload)
    yield put(dataStorageDeleteJobTypeActions.success())
  } catch (e) {
    yield put(dataStorageDeleteJobTypeActions.failure())
    yield put(errorAction(e))
  }
}

function* dataStorageJobDelete({
  payload,
}: ReturnType<typeof dataStorageJobDeleteActions.request>) {
  try {
    const currentProject: IProject = yield select(
      selectDataStorageCurrentProject
    )
    if (!currentProject) {
      console.warn('[DATASTORAGE] no current project')
      return
    }
    const resp: AxiosResponse<DataStorageJobDeleteResponse> = yield call(
      api.dataStorageJobDelete,
      currentProject.disk,
      currentProject.name,
      payload
    )
    yield put(dataStorageJobDeleteActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageJobDeleteActions.failure())
    yield put(errorAction(e))
  }
}

function* jobReport({ payload }: ReturnType<typeof jobReportActions.request>) {
  try {
    console.info('[DATASTORAGE] jobReport')
    const resp: AxiosResponse<JobReportResponse> = yield call(
      api.jobReportStart,
      payload
    )
    if (resp.data.action.status === 'error') {
      yield put(
        jobReportActions.failure(
          new Error(
            composeErrorString('Job Report failed', resp.data.action.errors)
          )
        )
      )
    } else {
      yield put(jobReportActions.success(resp.data))
    }
  } catch (e) {
    yield put(jobReportActions.failure(e as Error))
    yield put(errorAction(e))
  }
}

function* jobReportInfo() {
  try {
    const resp: AxiosResponse<JobReportInfoResponse> = yield call(
      api.jobReportInfo
    )
    if (resp.data.action.status === 'error') {
      yield put(
        jobReportActions.failure(
          new Error(
            composeErrorString('Job Report failed', resp.data.action.errors)
          )
        )
      )
    } else {
      yield put(jobReportInfoActions.success(resp.data))
    }
  } catch (e) {
    yield put(jobReportInfoActions.failure(e as Error))
    // yield put(errorAction(e))
  }
}

/** PROCESSING */
function* dataStorageProcessingStatus() {
  try {
    const resp: AxiosResponse<DataStorageProcessingStatusResponse> = yield call(
      api.dataStorageProcessingStatus
    )
    console.info('[DATASTORAGE] processing status received')
    /** According to PEF-4560 we need to hide the password embedded in the job object */
    const objectCopy = obfuscatePassword({ ...resp.data })
    console.info(JSON.stringify(objectCopy, null, '\t'))
    yield put(dataStorageProcessingStatusActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageProcessingStatusActions.failure())
    yield put(errorAction(e))
  }
}

/** check for coordinate system changes before starting processing */
function* dataStorageCheckCoordinates() {
  const currentSystem: CurrentCoordinateSystem | null = yield select(
    selectCurrentSystem
  )
  const currentProject: IProject | null = yield select(
    selectDataStorageCurrentProject
  )
  if (!currentSystem) return
  if (!currentProject) return
  if (currentProject?.coordinate?.automatic && currentSystem?.isAutomatic)
    return
  if (currentProject?.coordinate?.name === currentSystem?.name) return
  console.info('[DATASTORAGE] updating project coordinate system')
  const requestNewCoordinate: DataStorageUpdateProjectRequest = {
    diskName: currentProject?.disk,
    projectName: currentProject?.name,
    project: {
      ...currentProject,
      coordinate: {
        ...currentProject.coordinate,
        name: currentSystem.name,
        automatic: currentSystem.isAutomatic,
        unit: currentProject.coordinate?.unit ?? 'metric',
      },
    },
  }
  yield put(dataStorageUpdateProjectActions.request(requestNewCoordinate))
  const { error } = yield race({
    success: take(dataStorageUpdateProjectActions.success),
    error: take(dataStorageUpdateProjectActions.failure),
  })
  if (error) {
    throw new Error('Failed to update project coordinate system')
  }
}

function* dataStorageStartProcessing({
  payload,
}: ReturnType<typeof dataStorageStartProcessingActions.request>) {
  try {
    yield call(dataStorageCheckCoordinates)
    const resp: AxiosResponse<DataStorageStartProcessingResponse> = yield call(
      api.dataStorageStartProcessing,
      payload
    )
    console.info('[DATASTORAGE] start processing')
    /** According to PEF-4560 we need to hide the password embedded in the job object */
    const objectCopy = obfuscatePassword({ ...resp.data })
    console.info(JSON.stringify(objectCopy, null, '\t'))
    yield put(dataStorageStartProcessingActions.success(resp.data))
  } catch (e) {
    yield put(dataStorageStartProcessingActions.failure())
    yield put(errorAction(e))
  }
}
function* dataStorageStopProcessing({
  payload,
}: ReturnType<typeof dataStorageStopProcessingActions.request>) {
  try {
    const resp: AxiosResponse = yield call(
      api.dataStorageStopProcessing,
      payload
    )
    yield console.info('[DATASTORAGE] stop processing')
    /** According to PEF-4560 we need to hide the password embedded in the job object */
    const objectCopy = obfuscatePassword({ ...resp.data })
    console.info(JSON.stringify(objectCopy, null, '\t'))
    put(dataStorageStopProcessingActions.success())
  } catch (e) {
    yield put(dataStorageStopProcessingActions.failure())
    yield put(errorAction(e))
  }
}

// prettier-ignore
export function* dataStorageBackendSaga() {
  yield takeLatest(dataStorageInfoActions.request, dataStorageInfo)
  yield takeLatest(dataStorageConfigActions.request, dataStorageConfig)
  yield takeLatest(dataStorageSubmitInfoActions.request, dataStorageSubmitInfo)
  /** DISKS */
  yield takeLatest(dataStorageAvailableDisksActions.request, dataStorageAvailableDisks)
  /** PROJECTS */
  yield takeLatest(dataStorageProjectsActions.request, dataStorageProjects)
  yield takeLatest(
    dataStorageProjectDetailActions.request,
    dataStorageProjectDetail
  )
  yield takeLatest(dataStorageNewProjectActions.request, dataStorageNewProject)
  yield takeLatest(
    dataStorageUpdateProjectActions.request,
    dataStorageUpdateProject
  )
  yield takeLatest(
    dataStorageProjectDeleteActions.request,
    dataStorageProjectDelete
  )
  /** JOBS */
  yield takeLatest(dataStorageJobTypesActions.request, dataStorageJobTypes)
  yield takeLatest(dataStorageJobsActions.request, dataStorageJobs)
  yield takeLatest(dataStorageJobDetailActions.request, dataStorageJobDetail)
  yield takeLatest(dataStorageNewJobActions.request, dataStorageNewJob)
  yield takeLatest(dataStorageUpdateJobActions.request, dataStorageUpdateJob)
  yield takeLatest(dataStorageJobDeleteActions.request, dataStorageJobDelete)
  yield takeLatest(dataStorageNewJobTypeActions.request, dataStorageNewJobType)
  yield takeLatest(
    dataStorageUpdateJobTypeActions.request,
    dataStorageUpdateJobType
  )
  yield takeLatest(
    dataStorageDeleteJobTypeActions.request,
    dataStorageDeleteJobType
  )
    yield takeLatest(jobReportActions.request, jobReport)
    yield takeLatest(jobReportInfoActions.request, jobReportInfo)
  /** PROCESSING */
  yield takeLatest(
    dataStorageProcessingStatusActions.request,
    dataStorageProcessingStatus
  )
  yield takeLatest(
    dataStorageStartProcessingActions.request,
    dataStorageStartProcessing
  )
  yield takeLatest(
    dataStorageStopProcessingActions.request,
    dataStorageStopProcessing
  )
}
