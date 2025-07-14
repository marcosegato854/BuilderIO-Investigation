import { any, isEmpty, isNil } from 'ramda'
import { Routes } from 'Routes'
import { DataStorageProcessingItem } from 'store/features/dataStorage/types'
import { RtkServer } from 'store/features/rtk/types'
import { getMaxNameChars } from 'utils/names'

export const isRTKServerIncomplete = (server: Partial<RtkServer>): boolean =>
  any((v) => isNil(v) || isEmpty(v))([
    server.interfacemode,
    server.mountpoint,
    server.name,
    server.password,
    server.server,
    server.user,
  ])

export const getRedirectUrl = (
  currentProject: IProject | null | undefined,
  job: IJob
): string => {
  if (isNil(currentProject)) return ''
  return job.planned
    ? Routes.PLANNING.replace(':diskName', currentProject.disk || '')
        .replace(':projectName', currentProject.name || '')
        .replace(':jobName', job.name)
    : Routes.ACQUISITION.replace(':diskName', currentProject.disk || '')
        .replace(':projectName', currentProject.name || '')
        .replace(':jobName', job.name)
}

export const getCopyLimitedCharsName = (
  jobName: string,
  suffix: string
): string => {
  const charNumber = jobName.length
  const allowedChars = getMaxNameChars() - suffix.length
  if (charNumber <= allowedChars) return jobName + suffix
  return jobName.slice(0, allowedChars) + suffix
}

/**
 * Evaulate if any job inside the project is processing
 * @param project
 * @param processingArray
 * @returns boolean
 */
export const isProjectProcessing = (
  project: IProject,
  processingArray: DataStorageProcessingItem[]
): boolean =>
  processingArray?.some(
    (process) =>
      process.disk === project.disk && process.project === project.name
  )

/**
 * Evaulate if there is any processing error
 * @param processingArray
 * @returns boolean
 */
export const processingErrors = (
  processingArray: DataStorageProcessingItem[]
): boolean =>
  processingArray?.some(
    (process) => process.errors && process.errors?.length > 0
  )

/**
 * Evaulate if the job is currently processing
 * @param project
 * @param job
 * @param processingArray
 * @returns boolean
 */
export const isJobProcessing = (
  project: IProject,
  job: IJob,
  processingArray: DataStorageProcessingItem[]
): boolean =>
  processingArray?.some(
    (process) =>
      process.disk === project.disk &&
      process.project === project.name &&
      process.job === job.name
  )

export const extractJobProcessing = (
  project: IProject,
  job: IJob,
  processingArray: DataStorageProcessingItem[]
): DataStorageProcessingItem | null =>
  processingArray.find(
    (process) =>
      process.disk === project.disk &&
      process.project === project.name &&
      process.job === job.name
  ) || null

export const jobHadCameraEnabled = (job: IJob): boolean => {
  if (job.camera?.enable !== 0 && job.camera?.frames && job.camera?.frames > 0)
    return true
  return false
}
