import { GridVariant } from 'components/molecules/CardsGrid/CardsGrid'
import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import { ActionStatus } from 'store/features/actions/types'
import {
  DataStorageAvailableDisksResponse,
  DataStorageConfig,
  DataStorageConfigResponse,
  DataStorageDeleteJobTypeRequest,
  DataStorageInfo,
  DataStorageInfoResponse,
  DataStorageJobDeleteResponse,
  DataStorageJobDetailResponse,
  DataStorageJobsResponse,
  DataStorageJobTypesResponse,
  DataStorageNewJobRequest,
  DataStorageNewJobResponse,
  DataStorageNewJobTypeRequest,
  DataStorageNewJobTypeResponse,
  DataStorageNewProjectResponse,
  DataStorageProcessingInfo,
  DataStorageProcessingItem,
  DataStorageProcessingStatusResponse,
  DataStorageProjectDeleteResponse,
  DataStorageProjectDetailResponse,
  DataStorageProjectRequestPayload,
  DataStorageProjectsResponse,
  DataStorageStartProcessingPayload,
  DataStorageStartProcessingResponse,
  DataStorageStopProcessingPayload,
  DataStorageSubmitInfoRequest,
  DataStorageSubmitInfoResponse,
  DataStorageUpdateJobRequest,
  DataStorageUpdateJobResponse,
  DataStorageUpdateJobTypeRequest,
  DataStorageUpdateJobTypeResponse,
  DataStorageUpdateProjectRequest,
  DataStorageUpdateProjectResponse,
  JobReportInfoResponse,
  JobReportRequest,
  JobReportResponse,
  JobType,
  NewJobTypeOptions,
  SubmitFormJobPayload,
} from 'store/features/dataStorage/types'
import { resetStoreAction } from 'store/features/global/slice'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import { AnyObject } from 'yup/lib/object'

/**
 * TYPES
 */
export enum SortField {
  Name = 'Name',
  CreationDate = 'CreationDate',
  LastModified = 'LastModified',
}
export enum GridSortDirection {
  Asc = 'Asc',
  Desc = 'Desc',
}
export type GridSettings = {
  search?: string
  sortField?: SortField
  sortDirection?: GridSortDirection
  viewBy?: GridVariant
}

/**
 * ACTIONS
 */
export const dataStorageInfoActions = createAsyncAction(
  'dataStorageService/INFO_REQUEST',
  'dataStorageService/INFO_SUCCESS',
  'dataStorageService/INFO_FAILURE'
)<undefined, DataStorageInfoResponse, undefined>()
export const dataStorageConfigActions = createAsyncAction(
  'dataStorageService/CONFIG_REQUEST',
  'dataStorageService/CONFIG_SUCCESS',
  'dataStorageService/CONFIG_FAILURE'
)<undefined, DataStorageConfigResponse, undefined>()
export const dataStorageSubmitInfoActions = createAsyncAction(
  'dataStorageService/SUBMIT_INFO_REQUEST',
  'dataStorageService/SUBMIT_INFO_SUCCESS',
  'dataStorageService/SUBMIT_INFO_FAILURE'
)<DataStorageSubmitInfoRequest, DataStorageSubmitInfoResponse, undefined>()

export const jobReportActions = createAsyncAction(
  'planningService/JOB_REPORT_REQUEST',
  'planningService/JOB_REPORT_SUCCESS',
  'planningService/JOB_REPORT_FAILURE'
)<JobReportRequest, JobReportResponse, Error>()
export const jobReportInfoActions = createAsyncAction(
  'planningService/JOB_REPORT_INCO_REQUEST',
  'planningService/JOB_REPORT_INCO_SUCCESS',
  'planningService/JOB_REPORT_INCO_FAILURE'
)<undefined, JobReportInfoResponse, Error>()
export const resetReportAction = createAction(
  'dataStorageService/RESET_REPORT'
)()

/**
 * DISKS
 */
export const dataStorageAvailableDisksActions = createAsyncAction(
  'dataStorageService/AVAILABLE_DISKS_REQUEST',
  'dataStorageService/AVAILABLE_DISKS_SUCCESS',
  'dataStorageService/AVAILABLE_DISKS_FAILURE'
)<undefined, DataStorageAvailableDisksResponse, undefined>()

/** PROJECTS */
export const dataStorageProjectsActions = createAsyncAction(
  'dataStorageService/PROJECTS_REQUEST',
  'dataStorageService/PROJECTS_SUCCESS',
  'dataStorageService/PROJECTS_FAILURE'
)<undefined, DataStorageProjectsResponse, undefined>()
export const dataStorageProjectDetailActions = createAsyncAction(
  'dataStorageService/PROJECT_DETAIL_REQUEST',
  'dataStorageService/PROJECT_DETAIL_SUCCESS',
  'dataStorageService/PROJECT_DETAIL_FAILURE'
)<
  DataStorageProjectRequestPayload,
  DataStorageProjectDetailResponse,
  undefined
>()
export const dataStorageProjectDeleteActions = createAsyncAction(
  'dataStorageService/PROJECT_DELETE_REQUEST',
  'dataStorageService/PROJECT_DELETE_SUCCESS',
  'dataStorageService/PROJECT_DELETE_FAILURE'
)<
  DataStorageProjectRequestPayload,
  DataStorageProjectDeleteResponse,
  undefined
>()
export const dataStorageNewProjectActions = createAsyncAction(
  'dataStorageService/NEW_PROJECT_REQUEST',
  'dataStorageService/NEW_PROJECT_SUCCESS',
  'dataStorageService/NEW_PROJECT_FAILURE'
)<IProject, DataStorageNewProjectResponse, undefined>()
export const dataStorageUpdateProjectActions = createAsyncAction(
  'dataStorageService/UPDATE_PROJECT_REQUEST',
  'dataStorageService/UPDATE_PROJECT_SUCCESS',
  'dataStorageService/UPDATE_PROJECT_FAILURE'
)<
  DataStorageUpdateProjectRequest,
  DataStorageUpdateProjectResponse,
  undefined
>()
export const dataStorageProjectsGridSettings = createAction(
  'dataStorageService/PROJECTS_GRID_SETTINGS'
)<GridSettings>()
export const dataStorageEditProject = createAction(
  'dataStorageService/EDIT_PROJECT'
)<DataStorageProjectRequestPayload>()
export const dataStorageDeleteProjectDialog = createAction(
  'dataStorageService/DELETE_PROJECT_DIALOG'
)<DataStorageProjectRequestPayload>()
export const dataStorageClearCurrentProject = createAction(
  'dataStorageService/CLEAR_CURRENT_PROJECT'
)()

/** JOBS */
export const dataStorageJobTypesActions = createAsyncAction(
  'dataStorageService/JOB_TYPES_REQUEST',
  'dataStorageService/JOB_TYPES_SUCCESS',
  'dataStorageService/JOB_TYPES_FAILURE'
)<undefined, DataStorageJobTypesResponse, undefined>()
export const dataStorageJobsActions = createAsyncAction(
  'dataStorageService/JOBS_REQUEST',
  'dataStorageService/JOBS_SUCCESS',
  'dataStorageService/JOBS_FAILURE'
)<undefined, DataStorageJobsResponse, undefined>()
export const dataStorageJobDetailActions = createAsyncAction(
  'dataStorageService/JOB_DETAIL_REQUEST',
  'dataStorageService/JOB_DETAIL_SUCCESS',
  'dataStorageService/JOB_DETAIL_FAILURE'
)<string, DataStorageJobDetailResponse, undefined>()
export const dataStorageJobDeleteActions = createAsyncAction(
  'dataStorageService/JOB_DELETE_REQUEST',
  'dataStorageService/JOB_DELETE_SUCCESS',
  'dataStorageService/JOB_DELETE_FAILURE'
)<string, DataStorageJobDeleteResponse, undefined>()
export const dataStorageNewJobActions = createAsyncAction(
  'dataStorageService/NEW_JOB_REQUEST',
  'dataStorageService/NEW_JOB_SUCCESS',
  'dataStorageService/NEW_JOB_FAILURE'
)<DataStorageNewJobRequest, DataStorageNewJobResponse, undefined>()
export const dataStorageUpdateJobActions = createAsyncAction(
  'dataStorageService/UPDATE_JOB_REQUEST',
  'dataStorageService/UPDATE_JOB_SUCCESS',
  'dataStorageService/UPDATE_JOB_FAILURE'
)<DataStorageUpdateJobRequest, DataStorageUpdateJobResponse, undefined>()

/** JOBTYPE */
export const dataStorageNewJobTypeActions = createAsyncAction(
  'dataStorageService/NEW_JOBTYPE_REQUEST',
  'dataStorageService/NEW_JOBTYPE_SUCCESS',
  'dataStorageService/NEW_JOBTYPE_FAILURE'
)<DataStorageNewJobTypeRequest, DataStorageNewJobTypeResponse, undefined>()
export const dataStorageDeleteJobTypeActions = createAsyncAction(
  'dataStorageService/DELETE_JOBTYPE_REQUEST',
  'dataStorageService/DELETE_JOBTYPE_SUCCESS',
  'dataStorageService/DELETE_JOBTYPE_FAILURE'
)<DataStorageDeleteJobTypeRequest, undefined, undefined>()
export const dataStorageUpdateJobTypeActions = createAsyncAction(
  'dataStorageService/UPDATE_JOBTYPE_REQUEST',
  'dataStorageService/UPDATE_JOBTYPE_SUCCESS',
  'dataStorageService/UPDATE_JOBTYPE_FAILURE'
)<
  DataStorageUpdateJobTypeRequest,
  DataStorageUpdateJobTypeResponse,
  undefined
>()
export const dataStorageTempJobType = createAction(
  'dataStorageService/TEMP_JOB_TYPE'
)<NewJobTypeOptions>()

export const dataStorageEditJob = createAction(
  'dataStorageService/EDIT_JOB'
)<string>()
export const dataStorageDeleteJobDialog = createAction(
  'dataStorageService/DELETE_JOB_DIALOG'
)<string>()
export const dataStorageTempJob = createAction(
  'dataStorageService/TEMP_JOB'
)<IJob | null>()
export const dataStorageSubmitJobForm = createAction(
  'dataStorageService/SUBMIT_JOB_FORM'
)<SubmitFormJobPayload>()
export const dataStorageCloseJobForm = createAction(
  'dataStorageService/CLOSE_JOB_FORM'
)()
export const dataStorageClearCurrentJob = createAction(
  'dataStorageService/CLEAR_CURRENT_JOB'
)()
export const dataStorageCloneJobAction = createAction(
  'dataStorageService/CLONE_JOB'
)<IJob>()
export const dataStorageProcessingLog = createAction(
  'dataStorageService/PROCESSING_LOG'
)<DataStorageProcessingItem>()

/** SETTINGS */
export const dataStorageJobsGridSettings = createAction(
  'dataStorageService/JOBS_GRID_SETTINGS'
)<GridSettings>()

/** PROCESSING */
export const dataStorageProcessingStatusActions = createAsyncAction(
  'dataStorageService/PROCESSING_STATUS_REQUEST',
  'dataStorageService/PROCESSING_STATUS_SUCCESS',
  'dataStorageService/PROCESSING_STATUS_FAILURE'
)<undefined, DataStorageProcessingStatusResponse, undefined>()
export const dataStorageStartProcessingActions = createAsyncAction(
  'dataStorageService/START_PROCESSING_REQUEST',
  'dataStorageService/START_PROCESSING_SUCCESS',
  'dataStorageService/START_PROCESSING_FAILURE'
)<
  DataStorageStartProcessingPayload,
  DataStorageStartProcessingResponse,
  undefined
>()
export const dataStorageStopProcessingActions = createAsyncAction(
  'dataStorageService/STOP_PROCESSING_REQUEST',
  'dataStorageService/STOP_PROCESSING_SUCCESS',
  'dataStorageService/STOP_PROCESSING_FAILURE'
)<DataStorageStopProcessingPayload, undefined, undefined>()
export const dataStorageResetProcessing = createAction(
  'dataStorageService/RESET_PROCESSING'
)()
export const dataStorageOpenProcessingDialog = createAction(
  'dataStorageService/OPEN_PROCESSING_DIALOG'
)<{ job: IJob; disk: string; projectName: string }>()

const actions = {
  dataStorageInfoActions,
  dataStorageConfigActions,
  /** DISKS */
  dataStorageAvailableDisksActions,
  /** PROJECT */
  dataStorageProjectDetailActions,
  dataStorageProjectsActions,
  dataStorageNewProjectActions,
  dataStorageProjectDeleteActions,
  dataStorageUpdateProjectActions,
  dataStorageProjectsGridSettings,
  dataStorageEditProject,
  dataStorageClearCurrentProject,
  /** JOB */
  dataStorageJobDetailActions,
  dataStorageJobTypesActions,
  dataStorageJobsActions,
  dataStorageJobDeleteActions,
  dataStorageNewJobActions,
  dataStorageUpdateJobActions,
  dataStorageJobsGridSettings,
  dataStorageEditJob,
  dataStorageDeleteJobDialog,
  dataStorageTempJob,
  dataStorageCloseJobForm,
  dataStorageClearCurrentJob,
  dataStorageCloneJobAction,
  dataStorageProcessingLog,
  /** JOBTYPE */
  dataStorageNewJobTypeActions,
  dataStorageUpdateJobTypeActions,
  dataStorageDeleteJobTypeActions,
  dataStorageSubmitJobForm,
  dataStorageTempJobType,
  /** JOB REPORT */
  jobReportActions,
  jobReportInfoActions,
  resetReportAction,
  /** PROCESS */
  dataStorageProcessingStatusActions,
  dataStorageStartProcessingActions,
  dataStorageStopProcessingActions,
  dataStorageResetProcessing,
  dataStorageOpenProcessingDialog,
}
export type DataStorageAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type DataStorageServiceState = Readonly<{
  info: DataStorageInfo | null
  config: DataStorageConfig | null
  disks: IDisk[]
  projects: IProject[]
  currentProject: IProject | null
  projectGridSettings: GridSettings
  jobTypes: JobType[]
  jobs: IJob[]
  currentJob: IJob | null
  tempJob: IJob | null
  jobGridSettings: GridSettings
  processing: DataStorageProcessingItem[] | null
  jobReportStatus: ActionStatus
}>

const initialState: DataStorageServiceState = {
  info: null,
  config: null,
  disks: [],
  projects: [],
  currentProject: null,
  projectGridSettings: {},
  jobs: [],
  jobTypes: [],
  currentJob: null,
  tempJob: null,
  jobGridSettings: {},
  processing: null,
  jobReportStatus: null,
}

const info = createReducer(initialState.info).handleAction(
  dataStorageInfoActions.success,
  (prevState: DataStorageInfo | null, { payload }) => payload
)
// .handleAction(dataStorageInfoActions.failure, () => null)

const config = createReducer(initialState.config).handleAction(
  dataStorageConfigActions.success,
  (prevState: DataStorageConfig | null, { payload }) => payload
)
// .handleAction(dataStorageInfoActions.failure, () => null)

/**
 * DISKS
 */
// TODO: should update disk data from responsiveness API too, otherwise they won't be updated after load
const disks = createReducer(initialState.disks).handleAction(
  dataStorageAvailableDisksActions.success,
  (prevState: IDisk[], { payload }) => payload.disks
)
// .handleAction(dataStorageAvailableDisksActions.failure, () => null)

/**
 * PROJECTS
 */

const projects = createReducer(initialState.projects).handleAction(
  dataStorageProjectsActions.success,
  (prevState: IProject[], { payload }) =>
    payload.projects || initialState.projects
)
// .handleAction(dataStorageInfoActions.failure, () => null)

const currentProject = createReducer(initialState.currentProject)
  .handleAction(
    dataStorageProjectDetailActions.success,
    (prevState: IProject | null, { payload }) =>
      payload || initialState.currentProject
  )
  .handleAction(
    dataStorageJobsActions.success,
    (prevState: IProject | null, { payload }) => prevState
  )
  .handleAction(
    dataStorageProjectDeleteActions.success,
    () => initialState.currentProject
  )
  .handleAction(
    dataStorageClearCurrentProject,
    () => initialState.currentProject
  )
// .handleAction(dataStorageInfoActions.failure, () => null)

const projectGridSettings = createReducer(
  initialState.projectGridSettings
).handleAction(
  dataStorageProjectsGridSettings,
  (prevState: GridSettings, { payload }) => ({ ...prevState, ...payload })
)

/**
 * JOBS
 */

const jobs = createReducer(initialState.jobs)
  .handleAction(
    dataStorageJobsActions.success,
    (prevState: IJob[], { payload }) => payload.jobs || initialState.jobs
  )
  .handleAction(
    dataStorageJobsActions.failure,
    (prevState: IJob[]) => initialState.jobs
  )
// .handleAction(dataStorageInfoActions.failure, () => null)

const jobTypes = createReducer(initialState.jobTypes).handleAction(
  dataStorageJobTypesActions.success,
  (prevState: JobType[], { payload }) => payload.jobtype
)
// .handleAction(dataStorageInfoActions.failure, () => null)

const currentJob = createReducer(initialState.currentJob)
  .handleAction(
    dataStorageUpdateJobActions.success,
    (prevState: IJob | null, { payload }) =>
      payload.job || initialState.currentJob
  )
  .handleAction(
    dataStorageJobDetailActions.success,
    (prevState: IJob | null, { payload }) =>
      payload.job || initialState.currentJob
  )
  .handleAction(
    dataStorageJobDeleteActions.success,
    () => initialState.currentJob
  )
  .handleAction(
    dataStorageProjectDeleteActions.success,
    () => initialState.currentJob
  )
  .handleAction(dataStorageClearCurrentProject, () => initialState.currentJob)
  .handleAction(dataStorageClearCurrentJob, () => initialState.currentJob)
// .handleAction(dataStorageInfoActions.failure, () => null)

const tempJob = createReducer(initialState.tempJob)
  .handleAction(
    dataStorageTempJob,
    (prevState: IJob | null, { payload }) => payload
  )
  .handleAction(dataStorageClearCurrentJob, () => initialState.tempJob)

const jobReportStatus = createReducer(initialState.jobReportStatus)
  .handleAction(
    jobReportActions.success,
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(
    jobReportInfoActions.success,
    (prevState: ActionStatus, { payload }) => {
      if (payload.action.status === 'done') return initialState.jobReportStatus
      return payload.action.status
    }
  )
  .handleAction(
    [resetReportAction, jobReportActions.failure, jobReportInfoActions.failure],
    () => initialState.jobReportStatus
  )

const processing = createReducer(initialState.processing)
  .handleAction(
    dataStorageProcessingStatusActions.success,
    (prevState: DataStorageProcessingItem[] | null, { payload }) =>
      payload.currentProcess || null
  )
  .handleAction(
    dataStorageResetProcessing,
    (prevState: DataStorageProcessingItem[] | null) => initialState.processing
  )
  .handleAction(resetStoreAction, () => initialState.processing)

const jobGridSettings = createReducer(
  initialState.jobGridSettings
).handleAction(
  dataStorageJobsGridSettings,
  (prevState: GridSettings, { payload }) => ({ ...prevState, ...payload })
)

export const dataStorageServiceReducer = combineReducers({
  info,
  config,
  disks,
  projects,
  currentProject,
  projectGridSettings,
  jobs,
  jobTypes,
  currentJob,
  jobGridSettings,
  tempJob,
  processing,
  jobReportStatus,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      dataStorageService: DataStorageServiceState
    }
  | AnyObject

export const selectDataStorageServiceState = (
  state: OptimizedRootState
): DataStorageServiceState => state.dataStorageService

export const selectDataStorageInfo = createSelector(
  selectDataStorageServiceState,
  (data) => data.info
)

export const selectDataStorageConfig = createSelector(
  selectDataStorageServiceState,
  (data) => data.config
)

/** DISKS */
export const selectDataStorageDisks = createSelector(
  selectDataStorageServiceState,
  (data) => data.disks
)

/** PROJECTS */
export const selectDataStorageProjects = createSelector(
  selectDataStorageServiceState,
  (data) => data.projects
)

export const selectDataStorageCurrentProject = createSelector(
  selectDataStorageServiceState,
  (data) => data.currentProject
)

export const selectDataStorageProjectsGridSettings = createSelector(
  selectDataStorageServiceState,
  (data) => data.projectGridSettings
)

/** JOBS */
export const selectDataStorageJobTypes = createSelector(
  selectDataStorageServiceState,
  (data) => data.jobTypes
)

export const selectDataStorageJobs = createSelector(
  selectDataStorageServiceState,
  (data) => data.jobs
)

export const selectDataStorageCurrentJob = createSelector(
  selectDataStorageServiceState,
  (data) => data.currentJob
)

export const selectDataStorageTempJob = createSelector(
  selectDataStorageServiceState,
  (data) => data.tempJob
)

export const selectDataStorageJobsGridSettings = createSelector(
  selectDataStorageServiceState,
  (data) => data.jobGridSettings
)

export const selectProcessingInfo = createSelector(
  selectDataStorageServiceState,
  (data) => data.processing
)

export const selectJobReportStatus = createSelector(
  selectDataStorageServiceState,
  (data) => data.jobReportStatus
)

export const selectDataStorageCurrentDisk = createSelector(
  selectDataStorageDisks,
  selectDataStorageCurrentProject,
  (dataStorageDisks, dataStorageCurrentProject) =>
    dataStorageDisks.find(
      (disk) => disk.name === dataStorageCurrentProject?.disk
    )
)
