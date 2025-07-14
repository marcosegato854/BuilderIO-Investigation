/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from 'axios'
import { splitAt } from 'ramda'
import api from 'store/features/planning/api'
import {
  ImportShpResponse,
  JobPlan,
  ListShpResponse,
  PlanningDeletePlanResponse,
  PlanningGetPlanResponse,
  PlanningProcessInfoResponse,
  PlanningProcessStartResponse,
  PlanningSavePlanResponse,
  PlanningSplitResponse,
  PlanningUpdatePlanResponse,
} from 'store/features/planning/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { waypoints, withNewWaypoints } from 'utils/planning/polygonHelpers'

export const mockPlan: JobPlan = {
  polygons: mockStore.planningService.undoablePolygons.present!,
  initialAlignmentPoint: mockStore.planningService.initialAlignmentPoint!,
  finalAlignmentPoint: mockStore.planningService.finalAlignmentPoint!,
  needed: mockStore.planningService.needed!,
  creationDate: mockStore.planningService.creationDate!,
  updateDate: mockStore.planningService.updateDate!,
}
const splittedWaypoints = splitAt(
  waypoints(mockPlan.polygons[0]).length / 2,
  waypoints(mockPlan.polygons[0])
)

export const mkGetPlan = (output?: PlanningGetPlanResponse) =>
  jest.spyOn(api, 'planningGetPlan').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        plan: mockPlan,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<PlanningGetPlanResponse>>
  )

export const mkSavePlan = (output?: PlanningSavePlanResponse) =>
  jest.spyOn(api, 'planningSavePlan').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        plan: mockPlan,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<PlanningSavePlanResponse>>
  )

export const mkUpdatePlan = (output?: PlanningUpdatePlanResponse) =>
  jest.spyOn(api, 'planningUpdatePlan').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        plan: mockPlan,
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<PlanningUpdatePlanResponse>>
  )

export const mkDeletePlan = (output?: PlanningDeletePlanResponse) =>
  jest.spyOn(api, 'planningDeletePlan').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {},
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<PlanningDeletePlanResponse>>
  )

export const mkPlanProcessStart = (output?: PlanningProcessStartResponse) =>
  jest.spyOn(api, 'planningProcessStart').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          progress: 0,
          description: '',
          status: 'progress',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<PlanningProcessStartResponse>>
  )

export const mkPlanProcessInfo = (output?: PlanningProcessInfoResponse) =>
  jest.spyOn(api, 'planningProcessInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: '',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<PlanningProcessInfoResponse>>
  )

export const mkImportShpStart = (output?: ImportShpResponse) =>
  jest.spyOn(api, 'planningImportShpStart').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          progress: 0,
          description: '',
          status: 'progress',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ImportShpResponse>>
  )

export const mkListShpStart = (output?: ListShpResponse) =>
  jest.spyOn(api, 'planningListShpStart').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          progress: 0,
          description: '',
          status: 'progress',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ListShpResponse>>
  )

export const mkListShpInfo = (output?: ListShpResponse) =>
  jest.spyOn(api, 'planningListShpInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          progress: 0,
          description: '',
          status: 'progress',
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ListShpResponse>>
  )

export const mkImportShpInfo = (output?: ImportShpResponse) =>
  jest.spyOn(api, 'planningImportShpInfo').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        action: {
          status: 'done',
          progress: 100,
          description: '',
        },
        result: {
          polygons: [
            {
              ...mockPlan.polygons[1],
              id: 789,
            },
          ],
        },
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<ImportShpResponse>>
  )

export const mkSplitPath = (output?: PlanningSplitResponse) =>
  jest.spyOn(api, 'planningSplit').mockReturnValue(
    Promise.resolve({
      status: 200,
      data: output || {
        polygons: [
          withNewWaypoints(
            {
              ...mockPlan.polygons[0],
              name: `${mockPlan.polygons[0].name} (1)`,
              id: 4,
            },
            splittedWaypoints[0]
          ),
          withNewWaypoints(
            {
              ...mockPlan.polygons[0],
              name: `${mockPlan.polygons[0].name} (2)`,
              id: 5,
            },
            splittedWaypoints[1]
          ),
        ],
      },
      statusText: 'progress',
      headers: {},
      config: {},
    }) as Promise<AxiosResponse<PlanningSplitResponse>>
  )
