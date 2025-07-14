/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/dataStorage/api'
import {
  DataStorageAvailableDisksResponse,
  DataStorageConfigResponse,
  DataStorageInfoResponse,
  DataStorageJobDetailResponse,
  DataStorageJobTypesResponse,
  DataStorageNewJobResponse,
  DataStorageNewJobTypeResponse,
  DataStorageProcessingStatusResponse,
  DataStorageProjectDetailResponse,
  DataStorageProjectsResponse,
  DataStorageUpdateJobResponse,
  DataStorageUpdateJobTypeResponse,
  JobReportInfoResponse,
  JobReportResponse,
} from 'store/features/dataStorage/types'
import { mockStore } from 'store/mock/mockStoreTests'

export const mkProjectDetail = (output?: DataStorageProjectDetailResponse) =>
  jest.spyOn(api, 'dataStorageProjectDetail').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.dataStorageService.currentProject,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageProjectDetailResponse>>
  )

export const mkJobDetail = (output?: DataStorageJobDetailResponse) =>
  jest.spyOn(api, 'dataStorageJobDetail').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || { job: mockStore.dataStorageService.currentJob },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageJobDetailResponse>>
  )

export const mkJobUpdate = (output?: DataStorageUpdateJobResponse) =>
  jest.spyOn(api, 'dataStorageUpdateJob').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || { job: mockStore.dataStorageService.currentJob },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageUpdateJobResponse>>
  )

export const mkDataStorageProjects = (output?: DataStorageInfoResponse) =>
  jest.spyOn(api, 'dataStorageProjects').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || { projects: mockStore.dataStorageService.projects },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageProjectsResponse>>
  )

export const mkDataStorageState = (output?: DataStorageInfoResponse) =>
  jest.spyOn(api, 'dataStorageInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.dataStorageService.info,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageInfoResponse>>
  )

export const mkDataStorageConfig = (output?: DataStorageConfigResponse) =>
  jest.spyOn(api, 'dataStorageConfig').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.dataStorageService.config,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageConfigResponse>>
  )

export const mkProcessingStatus = (output?: DataStorageInfoResponse) =>
  jest.spyOn(api, 'dataStorageProcessingStatus').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.dataStorageService.processing,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageProcessingStatusResponse>>
  )

export const mkStartProcessing = (output?: DataStorageInfoResponse) =>
  jest.spyOn(api, 'dataStorageStartProcessing').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.dataStorageService.processing,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageProcessingStatusResponse>>
  )

export const mkStopProcessing = (output?: DataStorageInfoResponse) =>
  jest.spyOn(api, 'dataStorageStopProcessing').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.dataStorageService.processing,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageProcessingStatusResponse>>
  )

export const mkNewJob = (output?: DataStorageNewJobResponse) =>
  jest.spyOn(api, 'dataStorageNewJob').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.dataStorageService.currentJob,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageNewJobResponse>>
  )

export const mkReportStart = (output?: JobReportResponse) =>
  jest.spyOn(api, 'jobReportStart').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'progress',
          progress: 50,
          description: 'report progress',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<JobReportResponse>>
  )

export const mkReportInfo = (output?: JobReportInfoResponse) =>
  jest.spyOn(api, 'jobReportInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          action: {
            status: 'done',
            progress: 100,
            description: 'report done',
          },
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<JobReportInfoResponse>>
  )

export const mkDisks = (output?: DataStorageAvailableDisksResponse) =>
  jest.spyOn(api, 'dataStorageAvailableDisks').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: {
        disks: mockStore.dataStorageService.disks!,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageAvailableDisksResponse>>
  )

export const mkJobTypes = (output?: DataStorageJobTypesResponse) =>
  jest.spyOn(api, 'dataStorageJobTypes').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: {
        jobtype: mockStore.dataStorageService.jobTypes!,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageJobTypesResponse>>
  )

export const mkNewJobType = (output?: DataStorageNewJobTypeResponse) =>
  jest.spyOn(api, 'dataStorageNewJobType').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: mockStore.dataStorageService.jobTypes![0]!,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageNewJobTypeResponse>>
  )

export const mkUpdateJobType = (output?: DataStorageUpdateJobTypeResponse) =>
  jest.spyOn(api, 'dataStorageUpdateJobType').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: mockStore.dataStorageService.jobTypes![0]!,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DataStorageUpdateJobTypeResponse>>
  )
