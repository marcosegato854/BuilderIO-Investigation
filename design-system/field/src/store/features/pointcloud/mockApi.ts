/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/pointcloud/api'
import { PointCloudStateResponse } from 'store/features/pointcloud/types'

export const mkPointcloudState = (output?: PointCloudStateResponse) =>
  jest.spyOn(api, 'pointCloudState').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        coordinateSystem: {
          epsg: 'string',
          proj4:
            '+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<PointCloudStateResponse>>
  )

export const mkAddFolder = () =>
  jest.spyOn(api, 'addFolder').mockReturnValue(
    Promise.resolve({
      status: 200,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<never>>
  )

export const mkCheckHspc = () =>
  jest.spyOn(api, 'checkHspc').mockReturnValue(
    Promise.resolve({
      status: 200,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<never>>
  )
