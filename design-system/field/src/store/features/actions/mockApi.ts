/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/actions/api'
import {
  ActionsServiceFinalAlignmentInfoResponse,
  ActionsServiceFinalAlignmentStartResponse,
  ActionsServiceInitialAlignmentInfoResponse,
  ActionsServiceInitialAlignmentStartResponse,
  ActionsServiceStartRecordingInfoResponse,
  ActionsServiceStartRecordingStartResponse,
  ActionsServiceStopRecordingInfoResponse,
  ActionsServiceStopRecordingStartResponse,
} from 'store/features/actions/types'

export const mkStartRecording = (
  output?: ActionsServiceStartRecordingStartResponse
) =>
  jest.spyOn(api, 'actionsStartRecordingStart').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: 'done',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ActionsServiceStartRecordingStartResponse>>
  )

export const mkStartRecordingInfo = (
  output?: ActionsServiceStartRecordingInfoResponse
) =>
  jest.spyOn(api, 'actionsStartRecordingInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: 'done',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ActionsServiceStartRecordingInfoResponse>>
  )

export const mkStopRecording = (
  output?: ActionsServiceStopRecordingStartResponse
) =>
  jest.spyOn(api, 'actionsStopRecordingStart').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: 'done',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ActionsServiceStopRecordingStartResponse>>
  )

export const mkStopRecordingInfo = (
  output?: ActionsServiceStopRecordingInfoResponse
) =>
  jest.spyOn(api, 'actionsStopRecordingInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: 'done',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ActionsServiceStopRecordingInfoResponse>>
  )

export const mkInitialAlignmentStart = (
  output?: ActionsServiceInitialAlignmentStartResponse
) =>
  jest.spyOn(api, 'actionsInitialAlignmentStart').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'accepted',
          progress: 0,
          description: 'initialAlignment started',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ActionsServiceInitialAlignmentStartResponse>>
  )

export const mkInitialAlignmentInfo = (
  output?: ActionsServiceInitialAlignmentInfoResponse
) =>
  jest.spyOn(api, 'actionsInitialAlignmentInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'progress',
          progress: 50,
          description: 'initialAlignment progress',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ActionsServiceInitialAlignmentInfoResponse>>
  )

export const mkFinalAlignmentStart = (
  output?: ActionsServiceFinalAlignmentStartResponse
) =>
  jest.spyOn(api, 'actionsFinalAlignmentStart').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'accepted',
          progress: 0,
          description: 'finalAlignment started',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ActionsServiceFinalAlignmentStartResponse>>
  )

export const mkFinalAlignmentInfo = (
  output?: ActionsServiceFinalAlignmentInfoResponse
) =>
  jest.spyOn(api, 'actionsFinalAlignmentInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'progress',
          progress: 50,
          description: 'finalAlignment progress',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ActionsServiceFinalAlignmentInfoResponse>>
  )

export const mkActivationAbort = () =>
  jest.spyOn(api, 'actionsActivationAbort').mockReturnValue(
    Promise.resolve({
      status: 200,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<never>>
  )
