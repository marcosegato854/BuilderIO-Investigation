import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import {
  ScannerSupportedSettingsResponse,
  ScannerInfoResponse,
  ScannerSpecs,
  ScannersSettingsList,
} from 'store/features/scanner/types'
import { AnyObject } from 'yup/lib/object'
import { prop } from 'ramda'
import { selectPlanningSettingsState } from 'store/features/settings/slice'
import { getSavedScannerModel } from 'utils/planning/scanners'
import { resetStoreAction } from 'store/features/global/slice'

/**
 * ACTIONS
 */
export const scannerSupportedSettingsActions = createAsyncAction(
  'scannerService/SUPPORTED_SETTINGS_REQUEST',
  'scannerService/SUPPORTED_SETTINGS_SUCCESS',
  'scannerService/SUPPORTED_SETTINGS_FAILURE'
)<undefined, ScannerSupportedSettingsResponse, undefined>()
export const scannerInfoActions = createAsyncAction(
  'scannerService/INFO_REQUEST',
  'scannerService/INFO_SUCCESS',
  'scannerService/INFO_FAILURE'
)<undefined, ScannerInfoResponse, undefined>()
export const scannerTemperatureShow = createAction(
  'scannerService/TEMPERATURE_SHOW'
)<boolean>()
export const resetScannerStore = createAction('scannerService/RESET_STORE')()

const actions = {
  scannerSupportedSettingsActions,
  scannerInfoActions,
  scannerTemperatureShow,
  resetScannerStore,
}
export type ScannerAction = ActionType<typeof actions>

const scannerDefaultSettings = {
  settings: [
    {
      rps: 250,
      pts: 500000,
      mr: 155,
    },
  ],
}

/**
 * REDUCERS
 */
type ScannerServiceState = Readonly<{
  supportedSettings: ScannersSettingsList | null
  info: ScannerSpecs[] | null
  showTemperature: boolean
}>

const initialState: ScannerServiceState = {
  supportedSettings: null,
  info: null,
  showTemperature: false,
}

const supportedSettings = createReducer(
  initialState.supportedSettings
).handleAction(
  scannerSupportedSettingsActions.success,
  (prevState: ScannersSettingsList | null, { payload }) =>
    payload || initialState.supportedSettings
)

const info = createReducer(initialState.info)
  .handleAction(
    scannerInfoActions.success,
    (prevState: ScannerSpecs[] | null, { payload }) => payload.scanner
  )
  .handleAction(scannerInfoActions.failure, () => initialState.info)
  .handleAction(resetStoreAction, () => initialState.info)
  .handleAction(resetScannerStore, () => initialState.info)

const showTemperature = createReducer(initialState.showTemperature)
  .handleAction(
    scannerTemperatureShow,
    (prevState: boolean, { payload }) => payload
  )
  .handleAction(resetStoreAction, () => initialState.showTemperature)
  .handleAction(resetScannerStore, () => initialState.showTemperature)

export const scannerServiceReducer = combineReducers({
  supportedSettings,
  info,
  showTemperature,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      scanner: ScannerServiceState
    }
  | AnyObject
export const selectScannerServiceState = (
  state: OptimizedRootState
): ScannerServiceState => state.scanner

export const selectScannerSettingsList = createSelector(
  selectScannerServiceState,
  (data) => data.supportedSettings
)

export const selectScannerInfo = createSelector(
  selectScannerServiceState,
  (data) => data.info
)

export const selectScannerModel = createSelector(
  selectPlanningSettingsState,
  selectScannerServiceState,
  (planningSettings, scannerState) => {
    if (scannerState.info?.length) {
      const manufacturers = scannerState.info.map(prop('manufacturer'))
      return manufacturers.find((m) => m !== 'Velodyne') || manufacturers[0]
    }
    const out = getSavedScannerModel(planningSettings)
    console.warn(`[SCANNER] getting model from saved settings ${out}`)
    return out
  }
)

export const selectScannerSupportedSettings = createSelector(
  selectScannerSettingsList,
  (settingsList) => {
    if (!settingsList) return scannerDefaultSettings
    return settingsList
  }
)

export const selectShowTemperature = createSelector(
  selectScannerServiceState,
  (data) => data.showTemperature
)
