import { put, race, select, take, takeLatest } from 'redux-saga/effects'
import {
  dataStorageJobDetailActions,
  dataStorageProjectDetailActions,
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  getPlannedJobActions,
  planningServiceInitPlanning,
} from 'store/features/planning/slice'

/**
 * SAGAS
 */

/**
 * init planning view
 */

function* initPlanning({
  payload,
}: ReturnType<typeof planningServiceInitPlanning>) {
  console.info('[PLANNING] init planning')

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
    console.warn('[PLANNING] project not retrieved')
    return
  }
  console.info('[PLANNING] project loaded')

  /** retrieve the job */
  yield put(dataStorageJobDetailActions.request(payload.job))
  yield race([
    take(dataStorageJobDetailActions.success),
    take(dataStorageJobDetailActions.failure),
  ])
  const job: IJob | null = yield select(selectDataStorageCurrentJob)
  if (!job?.name) {
    console.warn('[PLANNING] job not retrieved')
    return
  }
  console.info('[PLANNING] job loaded')

  /** retrieve the plan */
  yield put(
    getPlannedJobActions.request({
      disk: project.disk,
      project: project.name,
      job: job.name,
    })
  )
  const [getJobsResult]: [
    ReturnType<typeof getPlannedJobActions.success> | undefined
  ] = yield race([
    take(getPlannedJobActions.success),
    take(getPlannedJobActions.failure),
  ])
  if (!getJobsResult) {
    console.warn('[PLANNING] plan not retrieved')
    return
  }
  console.info('[PLANNING] plan loaded')
}

export function* planningInitSaga() {
  yield takeLatest(planningServiceInitPlanning, initPlanning)
}
