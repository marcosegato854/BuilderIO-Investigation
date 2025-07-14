import {
  Get2ndAntennaSettingsResponse,
  PositionSatellitesResponse,
  Update2ndAntennaSettingsPayload,
  Update2ndAntennaSettingsResponse,
} from 'store/features/position/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  POSITION_SATELLITES: 'POSITION_SATELLITES',
  POSITION_ANTENNA2: 'POSITION_ANTENNA2',
}

/**
 * CALLS
 */
export default {
  positionSatellites: () =>
    trackProgress(
      apiClient.get<PositionSatellitesResponse>(
        '/position/supportedsatellites'
      ),
      apiCallIds.POSITION_SATELLITES
    ),
  getAntenna2Settings: () =>
    trackProgress(
      apiClient.get<Get2ndAntennaSettingsResponse>('/position/antenna2'),
      apiCallIds.POSITION_ANTENNA2
    ),
  updateAntenna2Settings: (payload: Update2ndAntennaSettingsPayload) =>
    trackProgress(
      apiClient.put<Update2ndAntennaSettingsResponse>(
        '/position/antenna2',
        payload,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.POSITION_ANTENNA2
    ),
}
