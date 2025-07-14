/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import api from 'store/features/alignment/api'
import {
  AlignmentCommandResponse,
  AlignmentStatusResponse,
} from 'store/features/alignment/types'
import { mockStore } from 'store/mock/mockStoreTests'

export const mkAlignmentStatus = (output?: AlignmentStatusResponse) =>
  jest.spyOn(api, 'alignmentStatus').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || mockStore.alignmentService.alignmentState,
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AlignmentStatusResponse>>
  )

export const mkAlignmentCommand = (output?: AlignmentCommandResponse) =>
  jest.spyOn(api, 'alignmentCommand').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {},
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<AlignmentCommandResponse>>
  )
