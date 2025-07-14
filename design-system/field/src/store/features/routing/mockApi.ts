/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/routing/api'
import {
  AutocaptureCurrentPathResponse,
  RoutingStatusResponse,
  AutocaptureNeededResponse,
  AutocapturePolygonsResponse,
  RoutingPolylineResponse,
  AutocaptureUpdatePolygonsResponse,
  AutocaptureStatusResponse,
} from 'store/features/routing/types'
import { mockStore } from 'store/mock/mockStoreTests'

/** ROUTING */

export const mkAutocaptureNeeded = (output?: AutocaptureNeededResponse) =>
  jest.spyOn(api, 'autocaptureNeeded').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.planningService.needed,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AutocaptureNeededResponse>>
  )

export const mkAutocaptureCurrentPath = (
  output?: AutocaptureCurrentPathResponse
) =>
  jest.spyOn(api, 'currentPath').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || { polygons: [] },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AutocaptureCurrentPathResponse>>
  )

export const mkRoutingStatus = (output?: RoutingStatusResponse) =>
  jest.spyOn(api, 'routingStatus').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || { enabled: true, initial: false, final: false },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RoutingStatusResponse>>
  )

export const mkAutocaptureStatus = (output?: AutocaptureStatusResponse) =>
  jest.spyOn(api, 'autocaptureStatus').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || { enabled: true, initial: false, final: false },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AutocaptureStatusResponse>>
  )

export const mkAutocaptureStatusUpdate = (output?: AutocaptureStatusResponse) =>
  jest.spyOn(api, 'autocaptureStatusUpdate').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || { enabled: true, initial: false, final: false },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AutocaptureStatusResponse>>
  )

export const mkRoutingPolyline = (output?: RoutingPolylineResponse) =>
  jest.spyOn(api, 'polyline').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        polygons: [],
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<RoutingPolylineResponse>>
  )

export const mkAutocapturePolygons = (output?: AutocapturePolygonsResponse) =>
  jest.spyOn(api, 'autocapturePolygons').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        polygons: [],
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AutocapturePolygonsResponse>>
  )

export const mkAutocaptureUpdatePolygons = (
  output?: AutocaptureUpdatePolygonsResponse
) =>
  jest.spyOn(api, 'autocaptureUpdatePolygons').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        polygons: [],
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AutocaptureUpdatePolygonsResponse>>
  )
