import { check } from 'prettier'
import {
  CheckUpdateResponse,
  SystemClientLogRequest,
  SystemInfoResponse,
  SystemInfoUpdateRequest,
  SystemLicensesResponse,
  SystemLogRequest,
  SystemNotificationsResponse,
  SystemResposivenessResponse,
  SystemStateResponse,
  UpdateActionResponse,
  UpdateInfoResponse,
  UpdatePrepareActionAbortResponse,
  UpdatePrepareActionResponse,
} from 'store/features/system/types'
import apiClient from 'store/services/apiClientBackend'
import apiClientNode from 'store/services/apiClientNode'
import { trackProgress } from 'store/services/trackProgress'
import { IS_TESTING } from 'utils/capabilities'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  SYSTEM_STATE: 'SYSTEM_STATE',
  SYSTEM_INFO: 'SYSTEM_INFO',
  SYSTEM_NOTIFICATIONS: 'SYSTEM_NOTIFICATIONS',
  SYSTEM_RESPONSIVENESS: 'SYSTEM_RESPONSIVENESS',
  SYSTEM_CLIENTSPEED: 'SYSTEM_CLIENTSPEED',
  SYSTEM_LOG: 'SYSTEM_LOG',
  SHUTDOWN: 'SHUTDOWN',
  REBOOT: 'REBOOT',
  MODULES: 'MODULES',
  LICENSES: 'LICENSES',
  UPDATE_PREPARE_ACTION_START: 'UPDATE_PREPARE_ACTION_START',
  UPDATE_PREPARE_ACTION_INFO: 'UPDATE_PREPARE_ACTION_INFO',
  UPDATE_PREPARE_ACTION_ABORT: 'UPDATE_PREPARE_ACTION_ABORT',
  UPDATE_INFO: 'UPDATE_INFO',
  UPDATE_ACTION_START: 'UPDATE_ACTION_START',
  UPDATE_ACTION_INFO: 'UPDATE_ACTION_INFO',
  UPDATE_ACTION_ABORT: 'UPDATE_ACTION_ABORT',
  CHECK_UPDATE: 'CHECK_UPDATE',
}

/**
 * CALLS
 */
export default {
  systemState: () =>
    trackProgress(
      apiClient.get<SystemStateResponse>('/system/state'),
      apiCallIds.SYSTEM_STATE
    ),
  systemInfo: () =>
    trackProgress(
      apiClient.get<SystemInfoResponse>('/system'),
      apiCallIds.SYSTEM_INFO
    ),
  systemUpdateInfo: (req: SystemInfoUpdateRequest) =>
    trackProgress(
      apiClient.put<SystemInfoResponse>('/system', req, {
        headers: {
          // needed only on put
          'Content-Type': 'application/json',
        },
      }),
      apiCallIds.SYSTEM_INFO
    ),
  systemLog: (req: SystemLogRequest) => {
    if (IS_TESTING) return Promise.resolve()
    return trackProgress(
      apiClient.post('/system/log', { module: '[WEB]', ...req }),
      apiCallIds.SYSTEM_LOG
    )
  },
  systeClientLog: (req: SystemClientLogRequest) => {
    if (IS_TESTING) return Promise.resolve()
    return trackProgress(
      apiClient.post('/system/clientlog', req),
      apiCallIds.SYSTEM_LOG
    )
  },
  systemNotifications: () =>
    trackProgress(
      apiClient.get<SystemNotificationsResponse>('/notification'),
      apiCallIds.SYSTEM_NOTIFICATIONS
    ),
  systemResponsiveness: () => {
    if (IS_TESTING) return Promise.resolve()
    return trackProgress(
      apiClient.get<SystemResposivenessResponse>('/system/responsiveness'),
      apiCallIds.SYSTEM_RESPONSIVENESS
    )
  },
  systemClientSpeed: () => {
    if (IS_TESTING) return Promise.resolve()
    return trackProgress(
      apiClientNode.get(
        `/assets/documents/empty.json?at=${new Date().getTime()}`
      ),
      apiCallIds.SYSTEM_CLIENTSPEED
    )
  },
  systemReleaseTag: () => {
    if (IS_TESTING)
      return Promise.resolve({
        status: 200,
        data: null,
      })
    return trackProgress(
      apiClientNode.get<string>('/assets/config/releaseTag.txt'),
      apiCallIds.SYSTEM_CLIENTSPEED
    )
  },
  systemShutdown: () =>
    trackProgress(apiClient.post('/system/actionturnoff'), apiCallIds.SHUTDOWN),
  systemReboot: () =>
    trackProgress(apiClient.post('/system/actionreboot'), apiCallIds.REBOOT),
  activeModules: () =>
    trackProgress(apiClient.get('/manager/modules'), apiCallIds.MODULES),
  systemLicenses: () =>
    trackProgress(
      apiClientNode.get<SystemLicensesResponse>('/license'),
      apiCallIds.LICENSES
    ),
  updatePrepareActionStart: () =>
    trackProgress(
      apiClient.post<UpdatePrepareActionResponse>('/update/actionPrepare'),
      apiCallIds.UPDATE_PREPARE_ACTION_START
    ),
  updatePrepareActionInfo: () =>
    trackProgress(
      apiClient.get<UpdatePrepareActionResponse>('/update/actionPrepare'),
      apiCallIds.UPDATE_PREPARE_ACTION_INFO
    ),
  // updatePrepareActionAbort: () =>
  //   trackProgress(
  //     apiClient.delete<UpdatePrepareActionAbortResponse>(
  //       '/update/actionPrepare'
  //     ),
  //     apiCallIds.UPDATE_PREPARE_ACTION_ABORT
  //   ),
  updateInfo: () =>
    trackProgress(
      apiClient.get<UpdateInfoResponse>('/update/info'),
      apiCallIds.UPDATE_INFO
    ),
  updateActionStart: () =>
    trackProgress(
      apiClient.post<UpdateActionResponse>('/update/actionStart'),
      apiCallIds.UPDATE_ACTION_START
    ),
  updateActionInfo: () =>
    trackProgress(
      apiClient.get<UpdateActionResponse>('/update/actionStart'),
      apiCallIds.UPDATE_ACTION_INFO
    ),
  updateActionAbort: () =>
    trackProgress(
      apiClient.delete('/update/actionStart'),
      apiCallIds.UPDATE_ACTION_ABORT
    ),
  checkUpdate: () =>
    trackProgress(
      apiClient.get<CheckUpdateResponse>('/update/checkupdate'),
      apiCallIds.CHECK_UPDATE
    ),
}
