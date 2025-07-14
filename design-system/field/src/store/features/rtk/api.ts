import {
  RtkServiceServersResponse,
  RtkServiceInterfaceModesResponse,
  RtkServiceServerAuthenticateRequest,
  RtkServiceServerAuthenticateResponse,
  RtkServiceLoadMountpointsResponse,
  RtkServiceGetInfoResponse,
  RtkServiceServerSubmitRequest,
  RtkServiceServerSubmitResponse,
  RtkServiceServerDeleteRequest,
  RtkServiceServerDeleteResponse,
  RtkServiceServerUpdateRequest,
  RtkServiceServerUpdateResponse,
  RtkServiceServerTestRequest,
  RtkServiceServerTestResponse,
} from 'store/features/rtk/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  RTK_INTERFACE_MODES: 'RTK_INTERFACE_MODES',
  RTK_SERVERS: 'RTK_SERVERS',
  RTK_SERVER_AUTHENTICATE: 'RTK_SERVER_AUTHENTICATE',
  RTK_LOAD_MOUNTPOINTS: 'RTK_LOAD_MOUNTPOINTS',
  RTK_GET_INFO: 'RTK_GET_INFO',
  RTK_GET_MOUNTPOINTS: 'RTK_GET_MOUNTPOINTS',
  RTK_SERVER_SUBMIT: 'RTK_SERVER_SUBMIT',
  RTK_SERVER_UPDATE: 'RTK_SERVER_DELETE',
  RTK_SERVER_DELETE: 'RTK_SERVER_DELETE',
  RTK_SERVER_TEST: 'RTK_SERVER_TEST',
  RTK_SERVER_TEST_INFO: 'RTK_SERVER_TEST_INFO',
}

/**
 * CALLS
 */
export default {
  rtkServers: () =>
    trackProgress(
      apiClient.get<RtkServiceServersResponse>('/position/ntrip/servers'),
      apiCallIds.RTK_SERVERS
    ),
  rtkInterfaceModes: () =>
    trackProgress(
      apiClient.get<RtkServiceInterfaceModesResponse>(
        '/position/ntrip/supportedinterfacemodes'
      ),
      apiCallIds.RTK_INTERFACE_MODES
    ),
  rtkServerAuthenticate: (req: RtkServiceServerAuthenticateRequest) =>
    trackProgress(
      apiClient.post<RtkServiceServerAuthenticateResponse>(
        '/position/ntrip/actionloadmountpoints',
        req
      ),
      apiCallIds.RTK_SERVER_AUTHENTICATE
    ),
  rtkLoadMountpoints: () =>
    trackProgress(
      apiClient.get<RtkServiceLoadMountpointsResponse>(
        '/position/ntrip/actionloadmountpoints'
      ),
      apiCallIds.RTK_LOAD_MOUNTPOINTS
    ),
  rtkServerInfo: () =>
    trackProgress(
      apiClient.get<RtkServiceGetInfoResponse>('/position/ntrip'),
      apiCallIds.RTK_GET_INFO
    ),
  rtkServerSubmit: (req: RtkServiceServerSubmitRequest) =>
    trackProgress(
      apiClient.post<RtkServiceServerSubmitResponse>(
        '/position/ntrip/servers',
        req
      ),
      apiCallIds.RTK_SERVER_SUBMIT
    ),
  rtkServerDelete: (req: RtkServiceServerDeleteRequest) =>
    trackProgress(
      /* apiClient.delete<RtkServiceServerDeleteResponse>(
        `/position/ntrip/servers/${req.name?.toLowerCase()}`
      ), */
      apiClient.delete<RtkServiceServerDeleteResponse>(
        `/position/ntrip/servers/${req.id}`
      ),
      apiCallIds.RTK_SERVER_DELETE
    ),
  rtkServerUpdate: (req: RtkServiceServerUpdateRequest) =>
    trackProgress(
      apiClient.put<RtkServiceServerUpdateResponse>(
        `/position/ntrip/servers/${req.id}`,
        req.server,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.RTK_SERVER_UPDATE
    ),
  rtkServerTest: (req: RtkServiceServerTestRequest) =>
    trackProgress(
      apiClient.post<RtkServiceServerTestResponse>(
        '/position/ntrip/actiontest',
        req
      ),
      apiCallIds.RTK_SERVER_TEST
    ),
  rtkServerTestInfo: () =>
    trackProgress(
      apiClient.get<RtkServiceServerTestResponse>('/position/ntrip/actiontest'),
      apiCallIds.RTK_SERVER_TEST_INFO
    ),
}
