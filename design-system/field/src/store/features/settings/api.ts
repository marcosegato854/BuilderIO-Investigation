import {
  SettingsGetResponse,
  SettingsSaveRequest,
  SettingsSaveResponse,
} from 'store/features/settings/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  SETTINGS_GET: 'SETTINGS_GET',
  SETTINGS_SAVE: 'SETTINGS_SAVE',
}

/**
 * CALLS
 */
export default {
  getSettings: () =>
    trackProgress(
      apiClient.get<SettingsGetResponse>('/user/settings'),
      apiCallIds.SETTINGS_GET
    ),
  saveSettings: (settings: SettingsSaveRequest) =>
    trackProgress(
      apiClient.put<SettingsSaveResponse>('/user/settings', settings, {
        headers: {
          // needed only on put
          'Content-Type': 'application/json',
        },
      }),
      apiCallIds.SETTINGS_SAVE
    ),
}
