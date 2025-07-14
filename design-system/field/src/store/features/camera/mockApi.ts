/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/camera/api'
import {
  AntennaClientSettings,
  CameraExposureResponse,
  CameraTriggerResponse,
  DisplayableCameraNamesResponse,
  Get2ndAntennaClientSettingsResponse,
} from 'store/features/camera/types'
import { mockStore } from 'store/mock/mockStoreTests'

/** ROUTING */

/** CAMERA */

export const mkCameraSnapshot = () =>
  jest.spyOn(api, 'takeSnapshot').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: {},
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<never>>
  )

export const mkCameraTrigger = (output?: CameraTriggerResponse) =>
  jest.spyOn(api, 'cameraTrigger').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        type: 'None',
        space: 0,
        time: 0,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<CameraTriggerResponse>>
  )

export const mkCameraExposure = (output?: CameraExposureResponse) =>
  jest.spyOn(api, 'cameraExposure').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        automatic: false,
        extendedExposure: '',
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<CameraExposureResponse>>
  )

export const mkAntennaClientSettings = (
  output?: Get2ndAntennaClientSettingsResponse
) =>
  jest.spyOn(api, 'getAntenna2ClientSettings').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        distance: 1,
        pixel: {
          x: 0,
          y: 0,
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<Get2ndAntennaClientSettingsResponse>>
  )

export const mkAntennaClientSettingsUpdate = (output?: AntennaClientSettings) =>
  jest.spyOn(api, 'updateAntenna2ClientSettings').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        distance: 1,
        pixel: {
          x: 0,
          y: 0,
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AntennaClientSettings>>
  )

export const mkAntennaCalculate = (output?: LeverArm) =>
  jest.spyOn(api, 'calculateLeverarm').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        x: 0,
        y: 0,
        z: 0,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<LeverArm>>
  )

export const mkDisplayableCameras = (output?: DisplayableCameraNamesResponse) =>
  jest.spyOn(api, 'displayableCameraNames').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || { groups: [...mockStore.cameraService.groups] },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<DisplayableCameraNamesResponse>>
  )
