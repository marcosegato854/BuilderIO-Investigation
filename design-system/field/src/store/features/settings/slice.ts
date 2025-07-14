import { combineReducers } from 'redux'
import { resetStoreAction } from 'store/features/global/slice'
import {
  AdminSettings,
  AudioSettings,
  I18nSettings,
  JobsSettings,
  LocalFonts,
  PlanningSettings,
  SetAdminSettingsPayload,
  SetAudioSettingsPayload,
  SetI18nSettingsPayload,
  SetJobsSettingsPayload,
  SetLastPositionSettingsPayload,
  SetPlanningSettingsPayload,
  SettingsGetResponse,
  SettingsSaveRequest,
  SettingsSaveResponse,
  SetUpdateSettingsPayload,
  UpdateSettings,
} from 'store/features/settings/types'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import { Position } from 'utils/myVR/types'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
export const setAudioSettings = createAction(
  'settings/SET_AUDIO_SETTINGS'
)<SetAudioSettingsPayload>()
export const setLastPositionSettings = createAction(
  'settings/SET_LAST_POSITION_SETTINGS'
)<SetLastPositionSettingsPayload>()
export const setPlanningSettings = createAction(
  'settings/SET_PLANNING_SETTINGS'
)<SetPlanningSettingsPayload>()
export const setJobsSettings = createAction(
  'settings/SET_JOBS_SETTINGS'
)<SetJobsSettingsPayload>()
export const setI18nSettings = createAction(
  'settings/SET_I18N_SETTINGS'
)<SetI18nSettingsPayload>()
export const setAdminSettings = createAction(
  'settings/SET_ADMIN_SETTINGS'
)<SetAdminSettingsPayload>()
export const setFont = createAction('settings/SET_FONT')<LocalFonts>()
export const settingsGetActions = createAsyncAction(
  'settings/GET_REQUEST',
  'settings/GET_SUCCESS',
  'settings/GET_FAILURE'
)<undefined, SettingsGetResponse, undefined>()
export const settingsSaveActions = createAsyncAction(
  'settings/SAVE_REQUEST',
  'settings/SAVE_SUCCESS',
  'settings/SAVE_FAILURE'
)<SettingsSaveRequest, SettingsSaveResponse, undefined>()
export const setUpdateSettings = createAction(
  'settings/SET_UPDATE_SETTINGS'
)<SetUpdateSettingsPayload>()

const actions = {
  setAudioSettings,
  setAdminSettings,
  setLastPositionSettings,
  setPlanningSettings,
  setI18nSettings,
  setFont,
  setJobsSettings,
  settingsGetActions,
  settingsSaveActions,
  setUpdateSettings,
}
export type SettingsAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type SettingsState = Readonly<{
  audio: AudioSettings
  lastPosition: Position
  planning: PlanningSettings
  i18n: I18nSettings
  font: LocalFonts
  jobs: JobsSettings
  admin: AdminSettings
  update: UpdateSettings
}>

const defaultEnabled = true
const initialState: SettingsState = {
  audio: {
    globalVolume: 75,
    audibleMessages: {
      COLLECTION: defaultEnabled,
      ERROR: defaultEnabled,
      NAVIGATION: defaultEnabled,
    },
  },
  lastPosition: {
    // Leica Geosystems AG as fallback
    latitude: 47.50018,
    longitude: 9.62328,
  },
  planning: {
    scanner: null,
    sideCameras: null,
  },
  jobs: {},
  i18n: {
    language: null,
  },
  font: LocalFonts.LATIN,
  admin: {},
  update: {},
}

const jobs = createReducer(initialState.jobs)
  .handleAction(
    settingsGetActions.success,
    (prevState: JobsSettings | undefined, { payload }) => ({
      ...prevState,
      ...(payload.jobs || initialState.jobs),
    })
  )
  .handleAction(
    setJobsSettings,
    (prevState: JobsSettings | undefined, { payload }) => ({
      ...prevState,
      ...payload,
    })
  )
  .handleAction(resetStoreAction, () => initialState.jobs)

const audio = createReducer(initialState.audio)
  .handleAction(
    settingsGetActions.success,
    (prevState: AudioSettings | undefined, { payload }) => ({
      ...prevState,
      ...(payload.audio || initialState.audio),
    })
  )
  .handleAction(
    setAudioSettings,
    (prevState: AudioSettings | undefined, { payload }) => ({
      ...prevState,
      ...payload,
    })
  )
  .handleAction(resetStoreAction, () => initialState.audio)

const admin = createReducer(initialState.admin)
  .handleAction(
    settingsGetActions.success,
    (prevState: AdminSettings | undefined, { payload }) => ({
      ...prevState,
      ...(payload.admin || initialState.admin),
    })
  )
  .handleAction(
    setAdminSettings,
    (prevState: AdminSettings | undefined, { payload }) => ({
      ...prevState,
      ...payload,
    })
  )
// .handleAction(resetStoreAction, () => initialState.admin)

const lastPosition = createReducer(initialState.lastPosition)
  .handleAction(
    settingsGetActions.success,
    (prevState: Position | undefined, { payload }) =>
      payload.lastPosition || initialState.lastPosition
  )
  .handleAction(
    setLastPositionSettings,
    (prevState: Position | undefined, { payload }) => payload
  )

const planning = createReducer(initialState.planning)
  .handleAction(
    settingsGetActions.success,
    (prevState: PlanningSettings | undefined, { payload }) =>
      payload.planning || initialState.planning
  )
  .handleAction(
    setPlanningSettings,
    (prevState: PlanningSettings | undefined, { payload }) => payload
  )

const i18n = createReducer(initialState.i18n)
  .handleAction(
    settingsGetActions.success,
    (prevState: I18nSettings | undefined, { payload }) =>
      payload.i18n || initialState.i18n
  )
  .handleAction(
    setI18nSettings,
    (prevState: I18nSettings | undefined, { payload }) => payload
  )

const font = createReducer(initialState.font).handleAction(
  setFont,
  (prevState: LocalFonts | null, { payload }) => payload
)

const update = createReducer(initialState.update)
  .handleAction(
    settingsGetActions.success,
    (prevState: UpdateSettings | undefined, { payload }) =>
      payload.update || initialState.update
  )
  .handleAction(
    setUpdateSettings,
    (prevState: UpdateSettings | undefined, { payload }) => ({
      ...prevState,
      ...payload,
    })
  )

export const settingsReducer = combineReducers({
  audio,
  lastPosition,
  planning,
  jobs,
  i18n,
  font,
  admin,
  update,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      settings: SettingsState
    }
  | AnyObject
export const selectSettingsState = (state: OptimizedRootState): SettingsState =>
  state.settings

export const selectAudioState = (state: OptimizedRootState) =>
  selectSettingsState(state).audio

export const selectLastPositionState = (state: OptimizedRootState) =>
  selectSettingsState(state).lastPosition

export const selectPlanningSettingsState = (state: OptimizedRootState) =>
  selectSettingsState(state).planning

export const selectI18SettingsState = (state: OptimizedRootState) =>
  selectSettingsState(state).i18n

export const selectLanguage = (state: OptimizedRootState) =>
  selectI18SettingsState(state).language

export const selectFont = (state: OptimizedRootState) =>
  selectSettingsState(state).font

export const selectJobsSettingsState = (state: OptimizedRootState) =>
  selectSettingsState(state).jobs

export const selectAdminSettings = (state: OptimizedRootState) =>
  selectSettingsState(state).admin

export const selectUpdateSettings = (state: OptimizedRootState) =>
  selectSettingsState(state).update
