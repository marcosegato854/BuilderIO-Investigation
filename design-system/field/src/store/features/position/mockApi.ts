/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/position/api'
import {
  AntennaSettings,
  Get2ndAntennaSettingsResponse,
} from 'store/features/position/types'

export const mkGetAntennaSettings = (output?: Get2ndAntennaSettingsResponse) =>
  jest.spyOn(api, 'getAntenna2Settings').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        enabled: false,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<Get2ndAntennaSettingsResponse>>
  )

export const mkUpdateAntennaSettings = (output?: AntennaSettings) =>
  jest.spyOn(api, 'updateAntenna2Settings').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        enabled: true,
        leverarm: {
          x: 15,
          y: 18,
          z: 155,
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AntennaSettings>>
  )
