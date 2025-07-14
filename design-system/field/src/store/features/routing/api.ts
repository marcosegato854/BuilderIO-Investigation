import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'
import {
  AutocaptureCurrentPathResponse,
  RoutingStatusResponse,
  AutocaptureNeededResponse,
  AutocapturePolygonsResponse,
  RoutingPolylineResponse,
  AutocaptureUpdatePolygonsRequest,
  AutocaptureUpdatePolygonsResponse,
  AutocaptureStatusResponse,
  AutocaptureStatusUpdateRequest,
  AutocaptureTrackListRequest,
} from './types'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  AUTOCAPTURE_STATUS: 'AUTOCAPTURE_STATUS',
  AUTOCAPTURE_STATUS_UPDATE: 'AUTOCAPTURE_STATUS_UPDATE',
  AUTOCAPTURE_CURRENT_PATH: 'AUTOCAPTURE_CURRENT_PATH',
  AUTOCAPTURE_POLYGONS: 'AUTOCAPTURE_POLYGONS',
  AUTOCAPTURE_UPDATE_POLYGONS: 'AUTOCAPTURE_UPDATE_POLYGONS',
  AUTOCAPTURE_NEEDED: 'AUTOCAPTURE_NEEDED',
  AUTOCAPTURE_TRACK_LIST: 'AUTOCAPTURE_TRACK_LIST',
  ROUTING_STATUS: 'ROUTING_STATUS',
  ROUTING_POLYLINE: 'ROUTING_POLYLINE',
}

/**
 * CALLS
 */
export default {
  autocaptureStatus: () =>
    trackProgress(
      apiClient.get<AutocaptureStatusResponse>('/routing/autocapture'),
      apiCallIds.AUTOCAPTURE_STATUS
    ),
  autocaptureStatusUpdate: (req: AutocaptureStatusUpdateRequest) =>
    trackProgress(
      apiClient.put<AutocaptureStatusResponse>('/routing/autocapture', req, {
        headers: {
          // needed only on put
          'Content-Type': 'application/json',
        },
      }),
      apiCallIds.AUTOCAPTURE_STATUS_UPDATE
    ),
  autocapturePolygons: () =>
    trackProgress(
      apiClient.get<AutocapturePolygonsResponse>(
        '/routing/autocapture/polygons'
      ),
      apiCallIds.AUTOCAPTURE_POLYGONS
    ),
  autocaptureUpdatePolygons: (req: AutocaptureUpdatePolygonsRequest) =>
    trackProgress(
      apiClient.post<AutocaptureUpdatePolygonsResponse>(
        '/routing/autocapture/polygons',
        req
      ),
      apiCallIds.AUTOCAPTURE_UPDATE_POLYGONS
    ),
  autocaptureNeeded: () =>
    trackProgress(
      apiClient.get<AutocaptureNeededResponse>('/routing/autocapture/needed'),
      apiCallIds.AUTOCAPTURE_NEEDED
    ),
  autocaptureTrackList: (req: AutocaptureTrackListRequest) =>
    trackProgress(
      apiClient.put<AutocapturePolygonsResponse>(
        '/routing/autocapture/trackListAction',
        req,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.AUTOCAPTURE_TRACK_LIST
    ),
  currentPath: () =>
    trackProgress(
      apiClient.get<AutocaptureCurrentPathResponse>(
        '/routing/autocapture/currentpath'
      ),
      apiCallIds.AUTOCAPTURE_CURRENT_PATH
    ),
  routingStatus: () =>
    trackProgress(
      apiClient.get<RoutingStatusResponse>('/routing/routing'),
      apiCallIds.ROUTING_STATUS
    ),
  polyline: () =>
    trackProgress(
      apiClient.get<RoutingPolylineResponse>('/routing/routing/polyline'),
      apiCallIds.ROUTING_POLYLINE
    ),
}
