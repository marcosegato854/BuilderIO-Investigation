import {
  CoordinateSystemLastImported,
  CoordinateSystemWktDeleteResponse,
  CoordinateSystemWktImportInfoRequest,
  CoordinateSystemWktImportRequest,
  CoordinateSystemWktImportResponse,
  CoordinateSystemWktListResponse,
  CoordinateSystemWktResponse,
  CoordinateSystemDeleteRequest,
  CoordinateSystemDeleteResponse,
  CoordinateSystemGetRequest,
  CoordinateSystemGetResponse,
  CoordinateSystemImportSystemRequest,
  CoordinateSystemImportSystemResponse,
  CoordinateSystemListSystemsResponse,
  CoordinateSystemWktDeleteRequest,
  CoordinateSystemWktGetRequest,
} from 'store/features/coordsys/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  COORDSYS_GET_SYSTEM: 'COORDSYS_GET_SYSTEM',
  COORDSYS_DELETE_SYSTEM: 'COORDSYS_DELETE_SYSTEM',
  COORDSYS_LIST_SYSTEMS: 'COORDSYS_LIST_SYSTEMS',
  COORDSYS_IMPORT_SYSTEM: 'COORDSYS_IMPORT_SYSTEM',
  COORDSYS_GET_WKT: 'COORDSYS_GET_WKT',
  COORDSYS_DELETE_WKT: 'COORDSYS_DELETE_WKT',
  COORDSYS_LIST_WKT: 'COORDSYS_LIST_WKT',
  COORDSYS_IMPORT_WKT: 'COORDSYS_IMPORT_WKT',
  COORDSYS_LAST_IMPORTED: 'COORDSYS_LAST_IMPORTED',
}

/**
 * CALLS
 */
export default {
  coordsysGetSystem: (req: CoordinateSystemGetRequest) =>
    trackProgress(
      apiClient.get<CoordinateSystemGetResponse>(
        `/coordsys/systems?name=${encodeURIComponent(req.name)}`
      ),
      apiCallIds.COORDSYS_GET_SYSTEM
    ),
  coordsysDeleteSystem: (req: CoordinateSystemDeleteRequest) =>
    trackProgress(
      apiClient.delete<CoordinateSystemDeleteResponse>(
        `/coordsys/systems?name=${encodeURIComponent(req.name)}`
      ),
      apiCallIds.COORDSYS_DELETE_SYSTEM
    ),
  coordsysListSystemsStart: () =>
    trackProgress(
      apiClient.post<CoordinateSystemListSystemsResponse>(
        '/coordsys/actionImportList'
      ),
      apiCallIds.COORDSYS_LIST_SYSTEMS
    ),
  coordsysListSystemsInfo: () =>
    trackProgress(
      apiClient.get<CoordinateSystemListSystemsResponse>(
        '/coordsys/actionImportList'
      ),
      apiCallIds.COORDSYS_LIST_SYSTEMS
    ),
  coordsysListSystemsCancel: () =>
    trackProgress(
      apiClient.delete<CoordinateSystemListSystemsResponse>(
        '/coordsys/actionImportList'
      ),
      apiCallIds.COORDSYS_LIST_SYSTEMS
    ),
  coordsysImportSystemStart: (req: CoordinateSystemImportSystemRequest) =>
    trackProgress(
      apiClient.post<CoordinateSystemImportSystemResponse>(
        '/coordsys/actionImport',
        req
      ),
      apiCallIds.COORDSYS_IMPORT_SYSTEM
    ),
  coordsysImportSystemInfo: () =>
    trackProgress(
      apiClient.get<CoordinateSystemImportSystemResponse>(
        '/coordsys/actionImport'
      ),
      apiCallIds.COORDSYS_IMPORT_SYSTEM
    ),
  coordsysImportSystemCancel: () =>
    trackProgress(
      apiClient.delete<CoordinateSystemImportSystemResponse>(
        '/coordsys/actionImport'
      ),
      apiCallIds.COORDSYS_IMPORT_SYSTEM
    ),
  coordsysGetWkt: (req: CoordinateSystemWktGetRequest) =>
    trackProgress(
      apiClient.get<CoordinateSystemWktResponse>(
        `/coordsys/systems/wkt?name=${encodeURIComponent(req.name)}`
      ),
      apiCallIds.COORDSYS_GET_WKT
    ),
  coordsysDeleteWkt: (req: CoordinateSystemWktDeleteRequest) =>
    trackProgress(
      apiClient.delete<CoordinateSystemWktDeleteResponse>(
        `/coordsys/systems/wkt?name=${encodeURIComponent(req.name)}`
      ),
      apiCallIds.COORDSYS_DELETE_WKT
    ),
  coordsysListWktStart: () =>
    trackProgress(
      apiClient.post<CoordinateSystemWktListResponse>(
        `/coordsys/systems/wkt/actionImportList`
      ),
      apiCallIds.COORDSYS_LIST_WKT
    ),
  coordsysListWktInfo: () =>
    trackProgress(
      apiClient.get<CoordinateSystemWktListResponse>(
        `/coordsys/systems/wkt/actionImportList`
      ),
      apiCallIds.COORDSYS_LIST_WKT
    ),
  coordsysListWktCancel: () =>
    trackProgress(
      apiClient.delete<CoordinateSystemWktListResponse>(
        `/coordsys/systems/wkt/actionImportList`
      ),
      apiCallIds.COORDSYS_LIST_WKT
    ),
  coordsysWktImportStart: (req: CoordinateSystemWktImportRequest) => {
    const { name, ...rest } = req
    return trackProgress(
      apiClient.post<CoordinateSystemWktImportResponse>(
        `/coordsys/systems/wkt/actionImport?name=${encodeURIComponent(name)}`,
        rest
      ),
      apiCallIds.COORDSYS_IMPORT_WKT
    )
  },
  coordsysWktImportInfo: (req: CoordinateSystemWktImportInfoRequest) =>
    trackProgress(
      apiClient.get<CoordinateSystemWktImportResponse>(
        `/coordsys/systems/wkt/actionImport?name=${encodeURIComponent(
          req.name
        )}`
      ),
      apiCallIds.COORDSYS_IMPORT_WKT
    ),
  coordsysWktImportCancel: (req: CoordinateSystemWktImportInfoRequest) =>
    trackProgress(
      apiClient.delete<CoordinateSystemWktImportResponse>(
        `/coordsys/systems/wkt/actionImport?name=${encodeURIComponent(
          req.name
        )}`
      ),
      apiCallIds.COORDSYS_IMPORT_WKT
    ),
  coordsysLastImported: () =>
    trackProgress(
      apiClient.get<CoordinateSystemLastImported>('/coordsys/lastimported'),
      apiCallIds.COORDSYS_LAST_IMPORTED
    ),
}
