// eslint-disable-next-line import/no-extraneous-dependencies
import { DialogNames } from 'components/dialogs/dialogNames'
import {
  checkJobtypeChangesWithFlatjob,
  flattenJob,
  createJobtypeFromJob,
} from 'components/dialogs/NewJobForm/utils'
import { ISaveAsCustomJobTypeProps } from 'components/dialogs/SaveAsCustomJobType/SaveAsCustomJobType'
import { put, race, take, select, call } from 'redux-saga/effects'
import { store } from 'store/configureStore'
import {
  dataStorageNewJobTypeActions,
  dataStorageUpdateJobTypeActions,
  selectDataStorageJobTypes,
} from 'store/features/dataStorage/slice'
import { JobType, NewJobTypeOptions } from 'store/features/dataStorage/types'
import {
  openDialogAction,
  closeDialogAction,
} from 'store/features/dialogs/slice'
import {
  selectScannerModel,
  selectScannerSupportedSettings,
} from 'store/features/scanner/slice'
import {
  ScannerSupportedSettings,
  ScannerSpecs,
} from 'store/features/scanner/types'

/**
 * Ask the user if he wants to save the custom job type as a preset
 * @param job
 */
export function* askToSaveCustomJobType(job: IJob) {
  yield put(
    openDialogAction({
      component: DialogNames.SaveAsCustomJobType,
      componentProps: {
        okButtonCallback: (values: NewJobTypeOptions) => {
          console.info(
            `[DATASTORAGE] [USER_ACTION] user wants to save job type ${values.jobTypeName}`
          )
          store.dispatch({ type: 'SAVE_JOB_TYPE_CONFIRM', payload: values })
        },
        cancelButtonCallback: () => {
          console.info("[DATASTORAGE] [USER_ACTION] user doesn't want to save")
        },
      } as ISaveAsCustomJobTypeProps,
    })
  )
  // wait for cancel or confirm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any[] = yield race([
    take('SAVE_JOB_TYPE_CONFIRM'),
    take(closeDialogAction),
  ])
  return results[0]?.payload
}

/**
 * Various checks on custom profiles
 * @param job
 */
export function* checkJobType(job: IJob, project: IProject) {
  // check unsaved custom
  const savedCustomOptions: NewJobTypeOptions | undefined = yield call(
    checkUnsavedCustom,
    job
  )
  if (savedCustomOptions) return savedCustomOptions
  // check temp profile
  const savedTemp: boolean | undefined = yield call(checkTempProfile, job)
  if (savedTemp) return undefined
  // check profile to update
  yield call(updateProfile, job, project)
  return undefined
}

/**
 * Check if there is a custom job type to save
 * @param job
 */
export function* checkUnsavedCustom(job: IJob) {
  // check if the job has a custom job type
  if (!job.type) return undefined
  if (job.type === 'Custom') {
    console.info('[DATASTORAGE] job type is custom')
    const newJobTypeOptions: NewJobTypeOptions | undefined =
      yield askToSaveCustomJobType(job)
    // create new job type
    if (newJobTypeOptions) {
      const newJobType = createJobtypeFromJob(
        job,
        newJobTypeOptions.jobTypeName
      )
      console.info(`[DATASTORAGE] new job type ${newJobType.name}`)
      yield put(dataStorageNewJobTypeActions.request({ jobType: newJobType }))
      const [success]: boolean[] = yield race([
        take(dataStorageNewJobTypeActions.success),
        take(dataStorageNewJobTypeActions.failure),
      ])
      if (success) return newJobTypeOptions
    }
  }
  return undefined
}

/**
 * Check if there is a temp job type to save
 * @param job
 */
export function* checkTempProfile(job: IJob) {
  if (!job.type) return undefined
  const jobTypes: JobType[] = yield select(selectDataStorageJobTypes)
  const currentJobType = jobTypes.find((jt) => jt.name === job.type)
  if (!currentJobType) {
    console.warn(`[DATASTORAGE] jobtype not found ${job.type}`)
    return undefined
  }
  // check if it's a temp profile
  if (currentJobType?.temp) {
    // create new job type
    const newJobType = createJobtypeFromJob(job, currentJobType.name)
    console.info(`[DATASTORAGE] new job type to save ${newJobType.name}`)
    yield put(dataStorageNewJobTypeActions.request({ jobType: newJobType }))
    return true
  }
  return undefined
}

/**
 * Check if there is a job type to update
 * @param job
 */
export function* updateProfile(job: IJob, project: IProject) {
  if (!job.type) return undefined
  const jobTypes: JobType[] = yield select(selectDataStorageJobTypes)
  const currentJobType = jobTypes.find((jt) => jt.name === job.type)
  if (!currentJobType) {
    console.warn(`[DATASTORAGE] jobtype not found ${job.type}`)
    return undefined
  }
  // check if it's a custom profile to update
  if (!['Road', 'Rail', 'Boat'].includes(job.type)) {
    const scannerModel: ScannerSpecs['manufacturer'] = yield select(
      selectScannerModel
    )
    const unit = project.coordinate?.unit || 'metric'
    const supportedSettings: ScannerSupportedSettings = yield select(
      selectScannerSupportedSettings
    )
    const changedValues = checkJobtypeChangesWithFlatjob(
      currentJobType,
      flattenJob(job, unit, scannerModel, supportedSettings),
      unit,
      scannerModel,
      supportedSettings
    )
    if (changedValues.length) {
      console.info(
        `[DATASTORAGE] update this profile: ${
          job.type
        }, changed props: ${changedValues.join(', ')}`
      )
      const newJobType = createJobtypeFromJob(job, currentJobType.name)
      yield put(
        dataStorageUpdateJobTypeActions.request({ jobType: newJobType })
      )
      return true
    }
  }
  return undefined
}
