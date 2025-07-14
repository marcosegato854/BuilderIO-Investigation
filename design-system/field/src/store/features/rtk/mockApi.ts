/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/rtk/api'
import {
  RtkServiceInterfaceModesResponse,
  RtkServiceLoadMountpointsResponse,
  RtkServiceServerAuthenticateResponse,
  RtkServiceServerDeleteResponse,
  RtkServiceServersResponse,
  RtkServiceServerSubmitResponse,
  RtkServiceServerTestResponse,
} from 'store/features/rtk/types'
import { mockStore } from 'store/mock/mockStoreTests'

export const mkRtkServers = (output?: RtkServiceServersResponse) =>
  jest.spyOn(api, 'rtkServers').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.rtkService.servers,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RtkServiceServersResponse>>
  )

export const mkRtkServerDelete = (output?: RtkServiceServerDeleteResponse) =>
  jest.spyOn(api, 'rtkServerDelete').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {},
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RtkServiceServerDeleteResponse>>
  )

export const mkRtkServerAuthenticate = (
  output?: RtkServiceServerAuthenticateResponse
) =>
  jest.spyOn(api, 'rtkServerAuthenticate').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'accepted',
          progress: 100,
          description: '',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RtkServiceServerAuthenticateResponse>>
  )

export const mkRtkInterfaceModes = (
  output?: RtkServiceInterfaceModesResponse
) =>
  jest.spyOn(api, 'rtkInterfaceModes').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: '',
        },
        ntripsupportedinterfacemode: [],
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RtkServiceInterfaceModesResponse>>
  )

export const mkRtkMountpoints = (output?: RtkServiceLoadMountpointsResponse) =>
  jest.spyOn(api, 'rtkLoadMountpoints').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: '',
        },
        result: {
          mountpoints: [],
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RtkServiceLoadMountpointsResponse>>
  )

export const mkRtkMServerTest = (output?: RtkServiceServerTestResponse) =>
  jest.spyOn(api, 'rtkServerTest').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: 'NTRIP Tested',
        },
        result: {
          internetconnection: true,
          ntripconnection: false,
          state: '',
          precision2d: '283.4113822859626',
          precisionheight: '175.13229370117188',
          satellites: {},
          hdop: '9999.0',
          vdop: '9999.0',
          gdop: '9999.0',
          // gdop: '30.0',
          // gdop: '1.1'
          agecorrection: '4739',
          position: {
            latitude: '45.8923602427',
            longitude: '12.69599714368',
            height: '139.1076',
          },
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RtkServiceServerTestResponse>>
  )

export const mkRtkMServerTestInfo = (output?: RtkServiceServerTestResponse) =>
  jest.spyOn(api, 'rtkServerTestInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: 'NTRIP Tested',
        },
        result: {
          internetconnection: true,
          ntripconnection: false,
          state: '',
          precision2d: '283.4113822859626',
          precisionheight: '175.13229370117188',
          satellites: {},
          hdop: '9999.0',
          vdop: '9999.0',
          gdop: '9999.0',
          // gdop: '30.0',
          // gdop: '1.1'
          agecorrection: '4739',
          position: {
            latitude: '45.8923602427',
            longitude: '12.69599714368',
            height: '139.1076',
          },
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RtkServiceServerTestResponse>>
  )

export const mkRtkServerSubmit = (output?: RtkServiceServerSubmitResponse) =>
  jest.spyOn(api, 'rtkServerSubmit').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        name: 'Server',
        password: 'pwd',
        port: '80',
        server: 'https://',
        user: 'Username',
        interfacemode: 'RTCM',
        mountpoint: 'NRT2-RDN',
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RtkServiceServerSubmitResponse>>
  )
