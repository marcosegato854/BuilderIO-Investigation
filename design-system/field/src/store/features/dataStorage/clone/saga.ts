// eslint-disable-next-line import/no-extraneous-dependencies
import { AxiosResponse } from 'axios'
import { mergeDeepRight } from 'ramda'
import { call, put, race, select, take, takeLatest } from 'redux-saga/effects'
import apiDatastorage from 'store/features/dataStorage/api'
import {
  dataStorageCloneJobAction,
  dataStorageNewJobActions,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import { DataStorageJobDetailResponse } from 'store/features/dataStorage/types'
import { getCopyLimitedCharsName } from 'store/features/dataStorage/utils'
import { errorAction } from 'store/features/errors/slice'
import apiPlanning from 'store/features/planning/api'
import {
  getPlannedJobActions,
  savePlannedJobActions,
} from 'store/features/planning/slice'
import { JobPlan, PlanningGetPlanResponse } from 'store/features/planning/types'
import { extractErrorStatusCode } from 'utils/errors'

/**
 * SAGAS
 */
function* cloneJob({ payload }: ReturnType<typeof dataStorageCloneJobAction>) {
  // get current project
  const currentProject: IProject = yield select(selectDataStorageCurrentProject)
  // get complete job information
  let fullJob: IJob | null = null
  try {
    const resp: AxiosResponse<DataStorageJobDetailResponse> = yield call(
      apiDatastorage.dataStorageJobDetail,
      currentProject.disk,
      currentProject.name,
      payload.name
    )
    fullJob = resp.data.job
  } catch (e) {
    console.error(e)
    yield put(errorAction(e))
  }
  if (!fullJob) return
  console.info('[CLONE_JOB] job detail loaded')
  // check if the job is planned
  let plan: JobPlan | null = null
  if (fullJob.planned) {
    // retrieve the plan
    try {
      const resp: AxiosResponse<PlanningGetPlanResponse> = yield call(
        apiPlanning.planningGetPlan,
        {
          disk: currentProject.disk,
          project: currentProject.name,
          job: fullJob.name,
        }
      )
      plan = resp.data.plan
      console.info('[CLONE_JOB] job plan loaded')
    } catch (e) {
      yield put(getPlannedJobActions.failure(e as Error))
      const statusCode = extractErrorStatusCode(e)
      if (statusCode !== 404) {
        yield put(errorAction(e))
        return
      }
    }
  }
  // change the job name
  const newJob = mergeDeepRight(fullJob, {
    name: getCopyLimitedCharsName(fullJob.name, '_C'),
    image: undefined,
  })
  console.info(`[CLONE_JOB] job renamed to ${newJob.name}`)
  // save the job
  yield put(
    dataStorageNewJobActions.request({
      job: newJob,
    })
  )
  // eslint-disable-next-line no-unused-vars
  const [saveSuccess]: [
    ReturnType<typeof dataStorageNewJobActions.failure> | undefined
  ] = yield race([
    take(dataStorageNewJobActions.success),
    take(dataStorageNewJobActions.failure),
  ])
  console.info(`[CLONE_JOB] job saved? ${saveSuccess ? 'true' : 'false'}`)
  // save the plan
  if (saveSuccess && plan) {
    yield put(
      savePlannedJobActions.request({
        disk: currentProject.disk,
        project: currentProject.name,
        job: newJob.name,
        plan: { ...plan, needed: undefined },
      })
    )
    console.info('[CLONE_JOB] job plan save action sent')
  }
}

// prettier-ignore
export function* dataStorageCloneSaga() {
  yield takeLatest(dataStorageCloneJobAction, cloneJob)
}
