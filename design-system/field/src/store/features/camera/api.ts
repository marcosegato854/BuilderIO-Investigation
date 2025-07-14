import {
  CalculateAntenna2LeverarmRequest,
  CalculateAntenna2LeverarmResponse,
  CameraExposureResponse,
  CameraExposureSetPayload,
  CameraTriggerDistancePayload,
  CameraTriggerPayload,
  CameraTriggerResponse,
  DisplayableCameraNamesResponse,
  Get2ndAntennaClientSettingsResponse,
  Update2ndAntennaClientSettingsPayload,
  Update2ndAntennaClientSettingsResponse,
} from 'store/features/camera/types'
import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  CAMERA_DISPLAYABLE: 'CAMERA_DISPLAYABLE',
  CAMERA_EXPOSURE: 'CAMERA_EXPOSURE',
  CAMERA_SET_EXPOSURE: 'CAMERA_SET_EXPOSURE',
  CAMERA_TRIGGER: 'CAMERA_TRIGGER',
  CAMERA_SET_DISTANCE: 'CAMERA_SET_DISTANCE',
  CAMERA_TRIGGER_TOGGLE: 'CAMERA_TRIGGER_TOGGLE',
  CAMERA_ANTENNA_2: 'CAMERA_ANTENNA_2',
  CAMERA_SNAPSHOT: 'CAMERA_SNAPSHOT',
}

/**
 * CALLS
 */
export default {
  displayableCameraNames: () =>
    trackProgress(
      apiClient.get<DisplayableCameraNamesResponse>(
        '/camera/displayableCameraNames'
      ),
      apiCallIds.CAMERA_DISPLAYABLE
    ),

  /**
   * GET CURRENT EXPOSURE
   */
  cameraExposure: () =>
    trackProgress(
      apiClient.get<CameraExposureResponse>('/camera/exposure'),
      apiCallIds.CAMERA_EXPOSURE
    ),

  /**
   * INCREASE OR DCREASE CAMERA EXPOSURE
   * */
  cameraSetExposure: (request: CameraExposureSetPayload) =>
    trackProgress(
      apiClient.put<CameraExposureResponse>('/camera/exposure', request, {
        headers: {
          // needed only on put
          'Content-Type': 'application/json',
        },
      }),
      apiCallIds.CAMERA_SET_EXPOSURE
    ),

  /**
   * GET THE CAMERA TRIGGER (time and space)
   */
  cameraTrigger: () =>
    trackProgress(
      apiClient.get<CameraTriggerResponse>('/camera/trigger'),
      apiCallIds.CAMERA_TRIGGER
    ),

  /**
   * SET THE CAMERA DISTANCE
   * */
  cameraSetDistance: (request: CameraTriggerDistancePayload) =>
    trackProgress(
      apiClient.put<CameraTriggerResponse>('/camera/trigger', request, {
        headers: {
          // needed only on put
          'Content-Type': 'application/json',
        },
      }),
      apiCallIds.CAMERA_SET_DISTANCE
    ),

  /**
   * ENABLE / DISABLE THE CAMERA
   * */
  cameraTriggerToggle: (request: CameraTriggerPayload) =>
    trackProgress(
      apiClient.put<CameraTriggerResponse>('/camera/trigger', request, {
        headers: {
          // needed only on put
          'Content-Type': 'application/json',
        },
      }),
      apiCallIds.CAMERA_TRIGGER_TOGGLE
    ),

  /**
   * 2ND ANTENNA
   */
  getAntenna2ClientSettings: () =>
    trackProgress(
      apiClient.get<Get2ndAntennaClientSettingsResponse>('/camera/antenna2'),
      apiCallIds.CAMERA_ANTENNA_2
    ),
  updateAntenna2ClientSettings: (
    payload: Update2ndAntennaClientSettingsPayload
  ) =>
    trackProgress(
      apiClient.put<Update2ndAntennaClientSettingsResponse>(
        '/camera/antenna2',
        payload,
        {
          headers: {
            // needed only on put
            'Content-Type': 'application/json',
          },
        }
      ),
      apiCallIds.CAMERA_ANTENNA_2
    ),
  calculateLeverarm: (payload: CalculateAntenna2LeverarmRequest) =>
    trackProgress(
      apiClient.post<CalculateAntenna2LeverarmResponse>(
        '/camera/antenna2/calculate',
        payload
      ),
      apiCallIds.CAMERA_ANTENNA_2
    ),
  takeSnapshot: () =>
    trackProgress(
      apiClient.post('/camera/trigger/shot'),
      apiCallIds.CAMERA_SNAPSHOT
    ),
}
