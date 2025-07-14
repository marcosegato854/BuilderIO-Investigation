/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/auth/api'
import { UserInfoResponse } from 'store/features/auth/types'

export const mkUserInfo = (output?: UserInfoResponse) =>
  jest.spyOn(api, 'getUserInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        usertype: 'standard',
        username: 'string',
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<UserInfoResponse>>
  )

export const mkLogout = () =>
  jest.spyOn(api, 'logout').mockReturnValue(
    Promise.resolve({
      status: 200,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<never>>
  )
