/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/settings/api'
import {
  SettingsGetResponse,
  SettingsSaveResponse,
} from 'store/features/settings/types'
import { mockStore } from 'store/mock/mockStoreTests'

export const mkGetSettings = (output?: SettingsSaveResponse) =>
  jest.spyOn(api, 'getSettings').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.settings,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<SettingsGetResponse>>
  )

export const mkSaveSettings = (output?: SettingsSaveResponse) =>
  jest.spyOn(api, 'saveSettings').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.settings,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<SettingsSaveResponse>>
  )
