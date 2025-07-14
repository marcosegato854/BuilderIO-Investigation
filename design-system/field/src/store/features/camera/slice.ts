import { difference } from 'ramda'
import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import {
  AntennaClientSettings,
  CalculateAntenna2LeverarmRequest,
  CalculateAntenna2LeverarmResponse,
  CameraExposureResponse,
  CameraExposureSetPayload,
  CameraGroup,
  CameraTrigger,
  CameraTriggerDistancePayload,
  CameraTriggerPayload,
  CameraTriggerResponse,
  DisplayableCameraNamesResponse,
  Get2ndAntennaClientSettingsResponse,
  Update2ndAntennaClientSettingsPayload,
  Update2ndAntennaClientSettingsResponse,
} from 'store/features/camera/types'
import {
  filterActiveCameraGroups,
  filterInactiveCameraGroups,
} from 'store/features/camera/utils'
import { resetSecondAntennaAction } from 'store/features/position/slice'
import { ActionType, createAsyncAction, createReducer } from 'typesafe-actions'
import { cameraTriggerFromResponse } from 'utils/camera'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
export const cameraDisplayableNamesActions = createAsyncAction(
  'cameraService/DISPLAYABLE_NAMES_REQUEST',
  'cameraService/DISPLAYABLE_NAMES_SUCCESS',
  'cameraService/DISPLAYABLE_NAMES_FAILURE'
)<undefined, DisplayableCameraNamesResponse, undefined>()

/**
 * GET THE CAMERA EXPOSURE
 */
export const cameraExposureActions = createAsyncAction(
  'cameraService/CAMERA_EXPOSURE_REQUEST',
  'cameraService/CAMERA_EXPOSURE_SUCCESS',
  'cameraService/CAMERA_EXPOSURE_FAILURE'
)<undefined, CameraExposureResponse, undefined>()

/**
 * SET THE CAMERA EXPOSURE
 */
export const cameraExposureSetActions = createAsyncAction(
  'cameraService/CAMERA_EXPOSURE_SET_REQUEST',
  'cameraService/CAMERA_EXPOSURE_SET_SUCCESS',
  'cameraService/CAMERA_EXPOSURE_SET_FAILURE'
)<CameraExposureSetPayload, CameraExposureResponse, undefined>()

/**
 * GET THE CAMERA TRIGGER (space, elapse)
 */

export const cameraTriggerActions = createAsyncAction(
  'cameraService/CAMERA_TRIGGER_REQUEST',
  'cameraService/CAMERA_TRIGGER_SUCCESS',
  'cameraService/CAMERA_TRIGGER_FAILURE'
)<undefined, CameraTriggerResponse, undefined>()

/**
 * SET THE CAMERA DISTANCE
 */
export const cameraTriggerDistanceSetActions = createAsyncAction(
  'cameraService/CAMERA_TRIGGER_DISTANCE_SET_REQUEST',
  'cameraService/CAMERA_TRIGGER_DISTANCE_SET_SUCCESS',
  'cameraService/CAMERA_TRIGGER_DISTANCE_SET_FAILURE'
)<CameraTriggerDistancePayload, CameraTriggerResponse, undefined>()

/**
 * ENABLE / DISABLE THE CAMERA
 */
export const cameraTriggerToggleActions = createAsyncAction(
  'cameraService/CAMERA_TRIGGER_TOGGLE_REQUEST',
  'cameraService/CAMERA_TRIGGER_TOGGLE_SUCCESS',
  'cameraService/CAMERA_TRIGGER_TOGGLE_FAILURE'
)<CameraTriggerPayload, CameraTriggerResponse, undefined>()

/**
 * GET / SET 2ND ANTENNA CLIENT SETTINGS
 */
export const cameraGet2ndAntennaClientSettingsActions = createAsyncAction(
  'cameraService/GET_2ND_ANTENNA_CLIENT_SETTINGS_REQUEST',
  'cameraService/GET_2ND_ANTENNA_CLIENT_SETTINGS_SUCCESS',
  'cameraService/GET_2ND_ANTENNA_CLIENT_SETTINGS_FAILURE'
)<undefined, Get2ndAntennaClientSettingsResponse, undefined>()

export const cameraUpdate2ndAntennaClientSettingsActions = createAsyncAction(
  'cameraService/UPDATE_2ND_ANTENNA_CLIENT_SETTINGS_REQUEST',
  'cameraService/UPDATE_2ND_ANTENNA_CLIENT_SETTINGS_SUCCESS',
  'cameraService/UPDATE_2ND_ANTENNA_CLIENT_SETTINGS_FAILURE'
)<
  Update2ndAntennaClientSettingsPayload,
  Update2ndAntennaClientSettingsResponse,
  undefined
>()

/**
 * CALCULATE 2ND ANTENNA LEVERARM
 */
export const cameraCalculateAntenna2LeverarmActions = createAsyncAction(
  'cameraService/CALCULATE_2ND_ANTENNA_LEVERARM_REQUEST',
  'cameraService/CALCULATE_2ND_ANTENNA_LEVERARM_SUCCESS',
  'cameraService/CALCULATE_2ND_ANTENNA_LEVERARM_FAILURE'
)<
  CalculateAntenna2LeverarmRequest,
  CalculateAntenna2LeverarmResponse,
  undefined
>()

/**
 * TAKE A SNAPSHOT
 */
export const cameraSnapshotActions = createAsyncAction(
  'cameraService/TAKE_SNAPSHOT_REQUEST',
  'cameraService/TAKE_SNAPSHOT_SUCCESS',
  'cameraService/TAKE_SNAPSHOT_FAILURE'
)<undefined, undefined, undefined>()

const actions = {
  cameraDisplayableNamesActions,
  cameraExposureActions,
  cameraExposureSetActions,
  cameraTriggerActions,
  cameraTriggerDistanceSetActions,
  cameraTriggerToggleActions,
  cameraGet2ndAntennaClientSettingsActions,
  cameraUpdate2ndAntennaClientSettingsActions,
  cameraCalculateAntenna2LeverarmActions,
  cameraSnapshotActions,
}
export type CameraAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type CameraServiceState = Readonly<{
  groups: CameraGroup[]
  initialGroups: CameraGroup[]
  exposure: CameraExposureResponse
  trigger: CameraTrigger
  antenna2: AntennaClientSettings | null
}>

const initialState: CameraServiceState = {
  groups: [],
  initialGroups: [],
  exposure: {
    automatic: true,
    extendedExposure: '0.0',
  },
  trigger: {
    type: 'Distance',
    distance: 2,
    elapse: 0,
  },
  antenna2: null,
}

const groups = createReducer(initialState.groups).handleAction(
  cameraDisplayableNamesActions.success,
  (prevState: CameraGroup[], { payload }) => payload.groups
)

const initialGroups = createReducer(initialState.initialGroups).handleAction(
  cameraDisplayableNamesActions.success,
  (prevState: CameraGroup[], { payload }) =>
    prevState.length > 0 ? prevState : payload.groups
)

const exposure = createReducer(initialState.exposure)
  .handleAction(
    cameraExposureActions.success,
    (prevState: CameraExposureResponse, { payload }) => payload
  )
  .handleAction(
    cameraExposureSetActions.success,
    (prevState: CameraExposureResponse, { payload }) => payload
  )

const trigger = createReducer(initialState.trigger)
  .handleAction(
    cameraTriggerActions.success,
    (prevState: CameraTrigger, { payload }) =>
      cameraTriggerFromResponse(payload)
  )
  .handleAction(
    cameraTriggerDistanceSetActions.success,
    (prevState: CameraTrigger, { payload }) =>
      cameraTriggerFromResponse(payload)
  )
  .handleAction(
    cameraTriggerToggleActions.success,
    (prevState: CameraTrigger, { payload }) =>
      cameraTriggerFromResponse(payload)
  )

const antenna2 = createReducer(initialState.antenna2)
  .handleAction(
    [
      cameraGet2ndAntennaClientSettingsActions.success,
      cameraUpdate2ndAntennaClientSettingsActions.success,
    ],
    (prevState: AntennaClientSettings | null, { payload }) => payload
  )
  .handleAction(
    [
      cameraGet2ndAntennaClientSettingsActions.failure,
      cameraUpdate2ndAntennaClientSettingsActions.failure,
      resetSecondAntennaAction,
    ],
    () => initialState.antenna2
  )

export const cameraServiceReducer = combineReducers({
  groups,
  initialGroups,
  exposure,
  trigger,
  antenna2,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      cameraService: CameraServiceState
    }
  | AnyObject
export const selectCameraServiceState = (
  state: OptimizedRootState
): CameraServiceState => state.cameraService

export const selectCameraGroups = (state: OptimizedRootState) =>
  selectCameraServiceState(state).groups

export const selectInitialCameraGroups = (state: OptimizedRootState) =>
  selectCameraServiceState(state).initialGroups

/** only groups with active cameras inside, omitting non active cameras */
export const selectActiveCameraGroups = createSelector(
  selectCameraServiceState,
  (data) => filterActiveCameraGroups(data.groups)
)
export const selectTotalSideCameras = createSelector(
  selectCameraServiceState,
  (data) =>
    filterActiveCameraGroups(data.groups).reduce((stack, group) => {
      if (group.name === 'Sphere') return stack
      const groupTot = group.cameras.reduce((stack2, camera) => {
        if (camera.active) return stack2 + 1
        return stack2
      }, 0)
      return stack + groupTot
    }, 0)
)

export const selectDisconnectedCameraGroups = (
  state: OptimizedRootState
): CameraGroup[] => {
  const initial = selectInitialCameraGroups(state)
  const actual = selectCameraGroups(state)
  return filterInactiveCameraGroups(difference(actual, initial))
}

export const selectCameraExposure = (state: OptimizedRootState) =>
  selectCameraServiceState(state).exposure.extendedExposure

export const selectCameraDistance = (state: OptimizedRootState) =>
  selectCameraServiceState(state).trigger.distance

export const selectCameraEnabled = (state: OptimizedRootState) =>
  selectCameraServiceState(state).trigger.type

export const select2ndAntennaClient = (state: OptimizedRootState) =>
  selectCameraServiceState(state).antenna2
