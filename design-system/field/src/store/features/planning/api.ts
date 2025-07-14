import {
  ExtractPolygonResponse,
  ExtractPolygonStartRequest,
  ImportShpResponse,
  ImportShpStartRequest,
  ListShpResponse,
  PlanningDeletePlanRequest,
  PlanningDeletePlanResponse,
  PlanningGetPlanRequest,
  PlanningGetPlanResponse,
  PlanningNearestPointResponse,
  PlanningPathResponse,
  PlanningProcessInfoResponse,
  PlanningProcessingStartRequest,
  PlanningProcessStartResponse,
  PlanningSavePlanRequest,
  PlanningSavePlanResponse,
  PlanningSplitRequest,
  PlanningSplitResponse,
  PlanningUpdatePlanRequest,
  PlanningUpdatePlanResponse,
  Waypoint,
} from 'store/features/planning/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  PLANNING_PATH: 'PLANNING_PATH',
  PLANNING_NEAREST_POINT: 'PLANNING_NEAREST_POINT',
  PLANNING_GET_PLAN: 'PLANNING_GET_PLAN',
  PLANNING_SAVE_PLAN: 'PLANNING_SAVE_PLAN',
  PLANNING_UPDATE_PLAN: 'PLANNING_UPDATE_PLAN',
  PLANNING_DELETE_PLAN: 'PLANNING_DELETE_PLAN',
  PLANNING_PROCESS_START: 'PLANNING_PROCESS_START',
  PLANNING_PROCESS_INFO: 'PLANNING_PROCESS_INFO',
  PLANNING_SPLIT: 'PLANNING_SPLIT',
  PLANNING_EXTRACT_POLYGON: 'PLANNING_EXTRACT_POLYGON',
  PLANNING_IMPORT_SHP: 'PLANNING_IMPORT_SHP',
  PLANNING_LIST_SHP: 'PLANNING_LIST_SHP',
}

/**
 * CALLS
 */
export default {
  planningPath: (waypoints: Waypoint[]) =>
    trackProgress(
      apiClient.post<PlanningPathResponse>('/planning/path', {
        waypoints,
      }),
      apiCallIds.PLANNING_PATH
    ),
  planningNearestPoint: (point: Waypoint) =>
    trackProgress(
      apiClient.post<PlanningNearestPointResponse>(
        '/planning/nearestPointOnRoad',
        point
      ),
      apiCallIds.PLANNING_NEAREST_POINT
    ),
  planningGetPlan: (req: PlanningGetPlanRequest) =>
    trackProgress(
      apiClient.get<PlanningGetPlanResponse>(
        `/planning/plan/${req.disk}/${req.project}/${req.job}`
      ),
      apiCallIds.PLANNING_GET_PLAN
    ),
  planningSavePlan: (req: PlanningSavePlanRequest) => {
    const { disk, project, job, ...data } = req
    return trackProgress(
      apiClient.post<PlanningSavePlanResponse>(
        `/planning/plan/${disk}/${project}/${job}`,
        data
      ),
      apiCallIds.PLANNING_SAVE_PLAN
    )
  },
  planningUpdatePlan: (req: PlanningUpdatePlanRequest) => {
    const { disk, project, job, ...data } = req
    return trackProgress(
      apiClient.put<PlanningUpdatePlanResponse>(
        `/planning/plan/${disk}/${project}/${job}`,
        data,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.PLANNING_UPDATE_PLAN
    )
  },
  // TODO: PLANNING - not used, maybe it should be removed
  planningDeletePlan: (req: PlanningDeletePlanRequest) =>
    trackProgress(
      apiClient.delete<PlanningDeletePlanResponse>(
        `/planning/plan/${req.disk}/${req.project}/${req.job}`
      ),
      apiCallIds.PLANNING_DELETE_PLAN
    ),
  planningProcessStart: (req: PlanningProcessingStartRequest) =>
    trackProgress(
      apiClient.post<PlanningProcessStartResponse>(
        '/planning/actionProcess',
        req
      ),
      apiCallIds.PLANNING_PROCESS_START
    ),
  planningProcessInfo: () =>
    trackProgress(
      apiClient.get<PlanningProcessInfoResponse>('/planning/actionProcess'),
      apiCallIds.PLANNING_PROCESS_INFO
    ),
  planningSplit: (req: PlanningSplitRequest) =>
    trackProgress(
      apiClient.post<PlanningSplitResponse>('/planning/split', req),
      apiCallIds.PLANNING_SPLIT
    ),
  planningExtractPolygonStart: (req: ExtractPolygonStartRequest) =>
    trackProgress(
      apiClient.post<ExtractPolygonResponse>(
        '/planning/actionExtractPolygon',
        req
      ),
      apiCallIds.PLANNING_EXTRACT_POLYGON
    ),
  planningExtractPolygonInfo: () =>
    trackProgress(
      apiClient.get<ExtractPolygonResponse>('/planning/actionExtractPolygon'),
      apiCallIds.PLANNING_EXTRACT_POLYGON
    ),
  planningImportShpStart: (req: ImportShpStartRequest) =>
    trackProgress(
      apiClient.post<ImportShpResponse>('/planning/actionShp', req),
      apiCallIds.PLANNING_IMPORT_SHP
    ),
  planningImportShpInfo: () =>
    trackProgress(
      apiClient.get<ImportShpResponse>('/planning/actionShp'),
      apiCallIds.PLANNING_IMPORT_SHP
    ),
  planningListShpStart: () =>
    trackProgress(
      apiClient.post<ListShpResponse>('/planning/actionListShp'),
      apiCallIds.PLANNING_LIST_SHP
    ),
  planningListShpInfo: () =>
    trackProgress(
      apiClient.get<ListShpResponse>('/planning/actionListShp'),
      apiCallIds.PLANNING_LIST_SHP
    ),
}
