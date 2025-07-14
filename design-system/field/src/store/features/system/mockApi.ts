/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/system/api'
import {
  SystemInfoResponse,
  SystemModulesResponse,
  SystemNotificationsResponse,
  SystemResposivenessResponse,
  SystemStateResponse,
} from 'store/features/system/types'
import { mockStore } from 'store/mock/mockStoreTests'

export const mkSystemState = (output?: SystemStateResponse) =>
  jest.spyOn(api, 'systemState').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        state: 'Logging',
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<SystemStateResponse>>
  )

export const mkSystemInfo = (output?: SystemInfoResponse) =>
  jest.spyOn(api, 'systemInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.system.info,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<SystemInfoResponse>>
  )

export const mkSystemLog = (output?: any) =>
  jest.spyOn(api, 'systemLog').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {},
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<any>>
  )

export const mkSystemNotifications = (output?: SystemNotificationsResponse) =>
  jest.spyOn(api, 'systemNotifications').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        notifications: mockStore.system.notifications,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<SystemNotificationsResponse>>
  )

export const mkShutDown = () =>
  jest.spyOn(api, 'systemShutdown').mockReturnValue(
    Promise.resolve({
      status: 200,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<never>>
  )

export const mkReboot = () =>
  jest.spyOn(api, 'systemReboot').mockReturnValue(
    Promise.resolve({
      status: 200,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<never>>
  )

export const mkResponsiveness = (output?: SystemResposivenessResponse) =>
  jest.spyOn(api, 'systemResponsiveness').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: mockStore.system.responsiveness!,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<SystemResposivenessResponse>>
  )

export const mkModules = (output?: SystemModulesResponse) =>
  jest.spyOn(api, 'activeModules').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        modules: mockStore.system.modules,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<SystemModulesResponse>>
  )

export const mkSystemReleaseTag = (output?: string) => {
  return jest.spyOn(api, 'systemReleaseTag').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || 'dev',
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<string>>
  )
}
