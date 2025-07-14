/**
 * TYPES
 */

import { ActionError, ActionStatus } from 'store/features/actions/types'

// DataStorage Info
export type DataStorageInfo = {
  disk: string
  project: string
  job: string
  scan: string
}

export type DataStorageInfoResponse = {
  disk: string
  project: string
  job: string
  scan: string
}
// DataStorage Config
export type DataStorageConfigProcessing = {
  office: {
    available: boolean
    version: string
  }
}
export type DataStorageConfig = {
  Process?: DataStorageConfigProcessing
}
export type DataStorageConfigResponse = DataStorageConfig & {}
// DataStorage Submit Info
export type DataStorageSubmitInfoRequest = {
  disk: string
  project: string
  job: string
  scan: string
}
export type DataStorageSubmitInfoResponse = {
  disk: string
  project: string
  job: string
  scan: string
}

// dataStorage disks available
export type DataStorageAvailableDisksResponse = {
  disks: IDisk[]
}

// Get Projects
export type DataStorageProjectsResponse = {
  projects: IProject[]
}

// Get Project Detail
export interface DataStorageProjectRequestPayload {
  disk: string
  project: string
  coordinate?: Coordinate
}

export interface DataStorageProjectDetailResponse extends IProject {}

// Delete Project
export interface DataStorageProjectDeleteResponse {}

// Save New Project
export interface DataStorageNewProjectResponse extends IProject {}

// Update Project
export interface DataStorageUpdateProjectRequest {
  diskName: string
  projectName: string
  project: IProject
}
export interface DataStorageUpdateProjectResponse extends IProject {}

// Get Jobs
export type DataStorageJobsResponse = {
  jobs: IJob[]
}

// Get Job Detail
export interface DataStorageJobDetailResponse {
  job: IJob
}

// Delete Job
export interface DataStorageJobDeleteResponse {}

// Save New Job
export interface DataStorageNewJobRequest {
  job: IJob
  redirect?: string
}
export interface DataStorageNewJobResponse {
  job: IJob
}

// Update Job
export interface DataStorageUpdateJobRequest {
  diskName?: string
  projectName?: string
  jobName: string
  job: IJob
  redirect?: string
}
export interface DataStorageUpdateJobResponse {
  job: IJob
}

// Save New JobType
export interface NewJobTypeOptions {
  jobTypeName: string
  jobTypeProfile?: number
}
export interface DataStorageNewJobTypeRequest {
  jobType: JobType
}

// Delete Job Type
export interface DataStorageDeleteJobTypeRequest {
  name: string
}
export interface DataStorageNewJobTypeResponse extends JobType {}

// Update Job
export interface DataStorageUpdateJobTypeRequest {
  jobType: JobType
}
export interface DataStorageUpdateJobTypeResponse extends JobType {}

// Job Types
export interface DataStorageJobTypesResponse {
  jobtype: JobType[]
}

export type JobType = Pick<
  IJob,
  | 'name'
  | 'ntrip'
  | 'dmi'
  | 'collectionmode'
  | 'camera'
  | 'antenna'
  | 'drivingspeed'
  | 'scanner'
  | 'position'
  | 'profile'
> & {
  temp?: boolean
  admin?: boolean
}

// Job form
export interface SubmitFormJobPayload {
  job: IJob
  jobName?: string
  redirect?: boolean
}

export enum AcquisitionProfile {
  PEDESTRIAN = -1,
  ROAD = 0,
  RAIL = 1,
  MARINE = 2,
}

export type DataStorageProcessingItem = {
  disk: string
  project: string
  job: string
  isImageAI?: boolean
  progress?: number
  options?: ProcessingOptions
  errors?: ProcessingError[]
  // option to force the processing in the case of low disk space
  forceSpace?: boolean
}

export type DataStorageProcessingInfo = {
  currentProcess?: DataStorageProcessingItem[]
}

export type DataStorageProcessingStatusResponse = DataStorageProcessingInfo

export type DataStorageStartProcessingPayload = DataStorageProcessingItem

export type DataStorageStartProcessingResponse =
  | {
      result: DataStorageProcessingItem
      errors?: ProcessingError[]
    }
  | { success: boolean }

export type DataStorageStartProcessingResponseSuccess = {
  success: boolean
}

export type DataStorageStopProcessingPayload = DataStorageProcessingItem

export type DataStorageAction = {
  status: ActionStatus
  progress: number
  description: string
  errors?: ActionError[]
}
export type JobReportRequest = {
  project: string
  job: string
  disk: string
  language: string
}
export type JobReportResponse = {
  action: DataStorageAction
  result?: unknown
}
export type JobReportInfoResponse = JobReportResponse & {}

export enum JobProcessStatus {
  PLAY = 'play',
  PAUSE = 'pause',
  NONE = 'none',
  ERROR = 'error',
  DONE = 'done',
  // IMAGE_ONLY = 'imageOnly',
}

export type ProcessingProgressInfo = {
  action: JSX.Element | null
  progress: number
  currentStatus: JobProcessStatus
  isImageAI?: boolean
  // imageStatus: JobProcessStatus
  // officeStatus: JobProcessStatus
}

export const IGNORED_FLAT_JOB_TYPE_PROPS = [
  'name',
  'type',
  'image',
  'ntripEnable',
  'planned',
  'drivingspeed',
]

export const IGNORED_JOB_TYPE_PROPS = [
  'name',
  'type',
  'image',
  'ntrip',
  'planned',
  'drivingspeed',
]
