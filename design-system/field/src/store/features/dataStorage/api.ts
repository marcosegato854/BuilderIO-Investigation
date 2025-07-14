import {
  DataStorageAvailableDisksResponse,
  DataStorageConfigResponse,
  DataStorageDeleteJobTypeRequest,
  DataStorageInfoResponse,
  DataStorageJobDeleteResponse,
  DataStorageJobDetailResponse,
  DataStorageJobsResponse,
  DataStorageJobTypesResponse,
  DataStorageNewJobResponse,
  DataStorageNewJobTypeRequest,
  DataStorageNewJobTypeResponse,
  DataStorageNewProjectResponse,
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
} from 'store/features/dataStorage/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  DATA_STORAGE_INFO: 'DATA_STORAGE_INFO',
  DATA_STORAGE_CONFIG: 'DATA_STORAGE_CONFIG',
  DATA_STORAGE_SUBMIT_INFO: 'DATA_STORAGE_SUBMIT_INFO',
  DATA_STORAGE_AVAILABLE_DISKS: 'DATA_STORAGE_AVAILABLE_DISKS',
  DATA_STORAGE_PROJECTS: 'DATA_STORAGE_PROJECTS',
  DATA_STORAGE_PROJECT_DETAIL: 'DATA_STORAGE_PROJECT_DETAIL',
  DATA_STORAGE_PROJECT_DELETE: 'DATA_STORAGE_PROJECT_DELETE',
  DATA_STORAGE_NEW_PROJECT: 'DATA_STORAGE_NEW_PROJECT',
  DATA_STORAGE_UPDATE_PROJECT: 'DATA_STORAGE_UPDATE_PROJECT',
  DATA_STORAGE_JOBS: 'DATA_STORAGE_JOBS',
  DATA_STORAGE_JOB_DETAIL: 'DATA_STORAGE_JOB_DETAIL',
  DATA_STORAGE_JOB_DELETE: 'DATA_STORAGE_JOB_DELETE',
  DATA_STORAGE_NEW_JOB: 'DATA_STORAGE_NEW_JOB',
  DATA_STORAGE_UPDATE_JOB: 'DATA_STORAGE_UPDATE_JOB',
  DATA_STORAGE_JOB_TYPES: 'DATA_STORAGE_JOB_TYPES',
  DATA_STORAGE_NEW_JOBTYPE: 'DATA_STORAGE_NEW_JOBTYPE',
  DATA_STORAGE_UPDATE_JOBTYPE: 'DATA_STORAGE_UPDATE_JOBTYPE',
  DATA_STORAGE_DELETE_JOBTYPE: 'DATA_STORAGE_DELETE_JOBTYPE',
  DATA_STORAGE_PROCESSING: 'DATA_STORAGE_PROCESSING',
  DATA_STORAGE_REPORT: 'DATA_STORAGE_REPORT',
  DATA_STORAGE_REPORT_DOWNLOAD: 'DATA_STORAGE_REPORT_DOWNLOAD',
}

/**
 * CALLS
 */
export default {
  dataStorageInfo: () =>
    trackProgress(
      apiClient.get<DataStorageInfoResponse>('/datastorage/state'),
      apiCallIds.DATA_STORAGE_INFO
    ),
  dataStorageConfig: () =>
    trackProgress(
      apiClient.get<DataStorageConfigResponse>('/datastorage'),
      apiCallIds.DATA_STORAGE_CONFIG
    ),
  dataStorageSubmitInfo: (request: DataStorageSubmitInfoRequest) =>
    trackProgress(
      apiClient.put<DataStorageSubmitInfoResponse>(
        '/datastorage/state',
        request,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.DATA_STORAGE_SUBMIT_INFO
    ),
  dataStorageAvailableDisks: () =>
    trackProgress(
      apiClient.get<DataStorageAvailableDisksResponse>('/datastorage/disks'),
      apiCallIds.DATA_STORAGE_AVAILABLE_DISKS
    ),
  dataStorageProjects: () =>
    trackProgress(
      apiClient.get<DataStorageProjectsResponse>('/datastorage/projects'),
      apiCallIds.DATA_STORAGE_PROJECTS
    ),
  dataStorageJobTypes: () =>
    trackProgress(
      apiClient.get<DataStorageJobTypesResponse>('/datastorage/jobtype'),
      apiCallIds.DATA_STORAGE_JOB_TYPES
    ),
  dataStorageProjectDetail: (request: DataStorageProjectRequestPayload) =>
    trackProgress(
      apiClient.get<DataStorageProjectDetailResponse>(
        `/datastorage/projects/${request.disk}/${request.project}`
      ),
      apiCallIds.DATA_STORAGE_PROJECT_DETAIL
    ),
  dataStorageProjectDelete: (request: DataStorageProjectRequestPayload) =>
    trackProgress(
      apiClient.delete<DataStorageProjectDeleteResponse>(
        `/datastorage/projects/${request.disk}/${request.project}`
      ),
      apiCallIds.DATA_STORAGE_PROJECT_DELETE
    ),
  dataStorageNewProject: (project: IProject) =>
    trackProgress(
      apiClient.post<DataStorageNewProjectResponse>(
        '/datastorage/projects',
        project
      ),
      apiCallIds.DATA_STORAGE_NEW_PROJECT
    ),
  dataStorageProcessingStatus: () =>
    trackProgress(
      apiClient.get<DataStorageProcessingStatusResponse>(
        '/datastorage/process'
      ),
      apiCallIds.DATA_STORAGE_PROCESSING
    ),
  dataStorageStartProcessing: (request: DataStorageStartProcessingPayload) =>
    trackProgress(
      apiClient.post<DataStorageStartProcessingResponse>(
        '/datastorage/process',
        request
      ),
      apiCallIds.DATA_STORAGE_PROCESSING
    ),
  dataStorageStopProcessing: (request: DataStorageStopProcessingPayload) =>
    trackProgress(
      apiClient.delete('/datastorage/process', { data: request }),
      apiCallIds.DATA_STORAGE_PROCESSING
    ),
  dataStorageUpdateProject: (request: DataStorageUpdateProjectRequest) =>
    trackProgress(
      apiClient.put<DataStorageUpdateProjectResponse>(
        `/datastorage/projects/${request.diskName}/${request.projectName}`,
        request.project,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.DATA_STORAGE_UPDATE_PROJECT
    ),
  dataStorageJobs: (diskName: string, projectName: string) =>
    trackProgress(
      apiClient.get<DataStorageJobsResponse>(
        `/datastorage/projects/${diskName}/${projectName}/jobs`
      ),
      apiCallIds.DATA_STORAGE_JOBS
    ),
  dataStorageJobDetail: (
    diskName: string,
    projectName: string,
    jobName: string
  ) =>
    trackProgress(
      apiClient.get<DataStorageJobDetailResponse>(
        `/datastorage/projects/${diskName}/${projectName}/jobs/${jobName}`
      ),
      apiCallIds.DATA_STORAGE_JOB_DETAIL
    ),
  dataStorageJobDelete: (
    diskName: string,
    projectName: string,
    jobName: string
  ) =>
    trackProgress(
      apiClient.delete<DataStorageJobDeleteResponse>(
        `/datastorage/projects/${diskName}/${projectName}/jobs/${jobName}`
      ),
      apiCallIds.DATA_STORAGE_JOB_DELETE
    ),
  dataStorageNewJob: (diskName: string, projectName: string, job: IJob) =>
    trackProgress(
      apiClient.post<DataStorageNewJobResponse>(
        `/datastorage/projects/${diskName}/${projectName}/jobs`,
        job
      ),
      apiCallIds.DATA_STORAGE_NEW_JOB
    ),
  dataStorageUpdateJob: ({
    diskName,
    projectName,
    jobName,
    job,
  }: DataStorageUpdateJobRequest) =>
    trackProgress(
      apiClient.put<DataStorageUpdateJobResponse>(
        `/datastorage/projects/${diskName}/${projectName}/jobs/${jobName}`,
        job,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.DATA_STORAGE_UPDATE_JOB
    ),
  dataStorageNewJobType: ({ jobType }: DataStorageNewJobTypeRequest) =>
    trackProgress(
      apiClient.post<DataStorageNewJobTypeResponse>(
        '/datastorage/jobtype',
        jobType
      ),
      apiCallIds.DATA_STORAGE_NEW_JOBTYPE
    ),
  dataStorageUpdateJobType: ({ jobType }: DataStorageUpdateJobTypeRequest) =>
    trackProgress(
      apiClient.put<DataStorageUpdateJobTypeResponse>(
        `/datastorage/jobtype/${jobType.name}`,
        jobType,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.DATA_STORAGE_UPDATE_JOBTYPE
    ),
  dataStorageDeleteJobType: ({ name }: DataStorageDeleteJobTypeRequest) =>
    trackProgress(
      apiClient.delete<DataStorageUpdateJobTypeResponse>(
        `/datastorage/jobtype/${name}`
      ),
      apiCallIds.DATA_STORAGE_UPDATE_JOBTYPE
    ),
  jobReportStart: (req: JobReportRequest) =>
    trackProgress(
      apiClient.post<JobReportResponse>(
        '/datastorage/jobreport/actioncreate',
        req
      ),
      apiCallIds.DATA_STORAGE_REPORT
    ),
  jobReportInfo: () =>
    trackProgress(
      apiClient.get<JobReportInfoResponse>(
        '/datastorage/jobreport/actioncreate'
      ),
      apiCallIds.DATA_STORAGE_REPORT
    ),
  jobReportDownload: (req: JobReportRequest) =>
    trackProgress(
      apiClient.get<Blob>(
        `/datastorage/jobreport/download/${req.disk}/${req.project}/${req.job}`,
        {
          responseType: 'blob',
        }
      ),
      apiCallIds.DATA_STORAGE_REPORT_DOWNLOAD
    ),
}
