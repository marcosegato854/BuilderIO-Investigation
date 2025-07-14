import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import {
  ActionsServiceActivationAbortResponse,
  ActionsServiceActivationInfoResponse,
  ActionsServiceActivationStartResponse,
  ActionsServiceDeactivationInfoResponse,
  ActionsServiceDeactivationStartResponse,
  ActionsServiceFinalAlignmentInfoResponse,
  ActionsServiceFinalAlignmentStartResponse,
  ActionsServiceInitialAlignmentInfoResponse,
  ActionsServiceInitialAlignmentStartResponse,
  ActionsServiceStartRecordingInfoResponse,
  ActionsServiceStartRecordingStartResponse,
  ActionsServiceStopRecordingInfoResponse,
  ActionsServiceStopRecordingStartResponse,
  ActionStatus,
  SystemAction,
} from 'store/features/actions/types'
import { DataStorageSubmitInfoRequest } from 'store/features/dataStorage/types'
import { resetStoreAction } from 'store/features/global/slice'
import {
  stateMessageAction,
  systemStateActions,
} from 'store/features/system/slice'
import { activatedStates, deactivatedStates } from 'store/features/system/types'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import { AnyObject } from 'yup/lib/object'

/**
 * TYPES
 */
export type ActionsServiceActivateSystemRequest = {
  projectName: string
  jobName: string
}

/**
 * ACTIONS
 */
/** ACTIVATE */
export const actionsServiceActivationStartActions = createAsyncAction(
  'actionsService/ACTIVATION_START_REQUEST',
  'actionsService/ACTIVATION_START_SUCCESS',
  'actionsService/ACTIVATION_START_FAILURE'
)<undefined, ActionsServiceActivationStartResponse, undefined>()
export const actionsServiceActivationInfoActions = createAsyncAction(
  'actionsService/ACTIVATION_INFO_REQUEST',
  'actionsService/ACTIVATION_INFO_SUCCESS',
  'actionsService/ACTIVATION_INFO_FAILURE'
)<undefined, ActionsServiceActivationInfoResponse, undefined>()
export const actionsServiceActivationAbortActions = createAsyncAction(
  'actionsService/ACTIVATION_ABORT_REQUEST',
  'actionsService/ACTIVATION_ABORT_SUCCESS',
  'actionsService/ACTIVATION_ABORT_FAILURE'
)<undefined, ActionsServiceActivationAbortResponse, undefined>()
export const actionsServiceActivateSystemAction = createAction(
  'actionsService/ACTIVATE_SYSTEM'
)<DataStorageSubmitInfoRequest>()
export const actionServiceDialogProceed = createAction(
  'actionsService/DIALOG_PROCEED'
)()

/** INITIAL ALIGNMENT */
export const actionsServiceInitialAlignmentStartActions = createAsyncAction(
  'actionsService/INITIAL_ALIGNMENT_START_REQUEST',
  'actionsService/INITIAL_ALIGNMENT_START_SUCCESS',
  'actionsService/INITIAL_ALIGNMENT_START_FAILURE'
)<undefined, ActionsServiceInitialAlignmentStartResponse, undefined>()
export const actionsServiceInitialAlignmentInfoActions = createAsyncAction(
  'actionsService/INITIAL_ALIGNMENT_INFO_REQUEST',
  'actionsService/INITIAL_ALIGNMENT_INFO_SUCCESS',
  'actionsService/INITIAL_ALIGNMENT_INFO_FAILURE'
)<undefined, ActionsServiceInitialAlignmentInfoResponse, undefined>()
export const actionsServiceInitialAlignmentAction = createAction(
  'actionsService/INITIAL_ALIGNMENT'
)()

/** FINAL ALIGNMENT */
export const actionsServiceFinalAlignmentStartActions = createAsyncAction(
  'actionsService/FINAL_ALIGNMENT_START_REQUEST',
  'actionsService/FINAL_ALIGNMENT_START_SUCCESS',
  'actionsService/FINAL_ALIGNMENT_START_FAILURE'
)<undefined, ActionsServiceFinalAlignmentStartResponse, undefined>()
export const actionsServiceFinalAlignmentInfoActions = createAsyncAction(
  'actionsService/FINAL_ALIGNMENT_INFO_REQUEST',
  'actionsService/FINAL_ALIGNMENT_INFO_SUCCESS',
  'actionsService/FINAL_ALIGNMENT_INFO_FAILURE'
)<undefined, ActionsServiceFinalAlignmentInfoResponse, undefined>()
export const actionsServiceFinalAlignmentAction = createAction(
  'actionsService/FINAL_ALIGNMENT'
)()

/** START RECORDING */
export const actionsServiceStartRecordingStartActions = createAsyncAction(
  'actionsService/START_RECORDING_START_REQUEST',
  'actionsService/START_RECORDING_START_SUCCESS',
  'actionsService/START_RECORDING_START_FAILURE'
)<undefined, ActionsServiceStartRecordingStartResponse, undefined>()
export const actionsServiceStartRecordingInfoActions = createAsyncAction(
  'actionsService/START_RECORDING_INFO_REQUEST',
  'actionsService/START_RECORDING_INFO_SUCCESS',
  'actionsService/START_RECORDING_INFO_FAILURE'
)<undefined, ActionsServiceStartRecordingInfoResponse, undefined>()
export const actionsServiceStartRecordingAbortActions = createAsyncAction(
  'actionsService/START_RECORDING_ABORT_REQUEST',
  'actionsService/START_RECORDING_ABORT_SUCCESS',
  'actionsService/START_RECORDING_ABORT_FAILURE'
)<undefined, undefined, undefined>()
export const actionsServiceStartRecordingAction = createAction(
  'actionsService/START_RECORDING'
)()

/** STOP RECORDING */
export const actionsServiceStopRecordingStartActions = createAsyncAction(
  'actionsService/STOP_RECORDING_START_REQUEST',
  'actionsService/STOP_RECORDING_START_SUCCESS',
  'actionsService/STOP_RECORDING_START_FAILURE'
)<undefined, ActionsServiceStopRecordingStartResponse, undefined>()
export const actionsServiceStopRecordingInfoActions = createAsyncAction(
  'actionsService/STOP_RECORDING_INFO_REQUEST',
  'actionsService/STOP_RECORDING_INFO_SUCCESS',
  'actionsService/STOP_RECORDING_INFO_FAILURE'
)<undefined, ActionsServiceStopRecordingInfoResponse, undefined>()
export const actionsServiceStopRecordingAction = createAction(
  'actionsService/STOP_RECORDING'
)()

/** DEACTIVATE */
export const actionsServiceDeactivationStartActions = createAsyncAction(
  'actionsService/DEACTIVATION_START_REQUEST',
  'actionsService/DEACTIVATION_START_SUCCESS',
  'actionsService/DEACTIVATION_START_FAILURE'
)<undefined, ActionsServiceDeactivationStartResponse, undefined>()
export const actionsServiceDeactivationInfoActions = createAsyncAction(
  'actionsService/DEACTIVATION_INFO_REQUEST',
  'actionsService/DEACTIVATION_INFO_SUCCESS',
  'actionsService/DEACTIVATION_INFO_FAILURE'
)<undefined, ActionsServiceDeactivationInfoResponse, undefined>()
export const actionsServiceDeactivateSystemAction = createAction(
  'actionsService/DEACTIVATE_SYSTEM'
)()
//
export const actionsServiceAcquisitionReady = createAction(
  'actionsService/ACQUISITION_READY'
)<boolean>()
export const actionsServiceDeactivating = createAction(
  'actionsService/DEACTIVATING'
)<boolean>()

/** EXIT ACQUISITION */
export const actionsServiceExitAcquisition = createAction(
  'actionsService/EXIT_ACQUISITION'
)()

/** ABORT */
export const actionsServiceAbort = createAction('actionsService/ABORT')()

const actions = {
  actionsServiceActivationStartActions,
  actionsServiceActivationInfoActions,
  actionsServiceActivateSystemAction,
  actionServiceDialogProceed,
  actionsServiceInitialAlignmentStartActions,
  actionsServiceInitialAlignmentInfoActions,
  actionsServiceFinalAlignmentStartActions,
  actionsServiceFinalAlignmentInfoActions,
  actionsServiceStartRecordingStartActions,
  actionsServiceStartRecordingInfoActions,
  actionsServiceStartRecordingAbortActions,
  actionsServiceStartRecordingAction,
  actionsServiceStopRecordingStartActions,
  actionsServiceStopRecordingInfoActions,
  actionsServiceStopRecordingAction,
  actionsServiceDeactivationStartActions,
  actionsServiceDeactivationInfoActions,
  actionsServiceDeactivateSystemAction,
  actionsServiceAcquisitionReady,
  actionsServiceDeactivating,
  actionsServiceAbort,
  actionsServiceExitAcquisition,
  actionsServiceActivationAbortActions,
}
export type ActionsServiceAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type ActionsState = Readonly<{
  activationProgress: number
  acquisitionReady: boolean
  deactivating: boolean
  recordingStatus: ActionStatus
  stopRecordingStatus: ActionStatus
  deactivationStatus: ActionStatus
  currentAction: SystemAction | null
}>

const initialState: ActionsState = {
  activationProgress: 0,
  acquisitionReady: false,
  deactivating: false,
  recordingStatus: null,
  stopRecordingStatus: null,
  deactivationStatus: null,
  currentAction: null,
}

const activationProgress = createReducer(initialState.activationProgress)
  .handleAction(
    [
      actionsServiceActivationInfoActions.success,
      actionsServiceActivationStartActions.success,
    ],
    (prevState: number, { payload }) => {
      if (payload.action.status === 'abort')
        return initialState.activationProgress
      return payload.action.progress
    }
  )
  .handleAction(resetStoreAction, () => initialState.activationProgress)
  .handleAction(
    [systemStateActions.success, stateMessageAction],
    (prevState: number, { payload }) => {
      if (activatedStates.includes(payload?.state)) return 100
      if (deactivatedStates.includes(payload?.state))
        return initialState.activationProgress
      return prevState
    }
  )
  .handleAction(
    [
      actionsServiceActivationInfoActions.failure,
      actionsServiceActivationStartActions.failure,
      actionsServiceDeactivationInfoActions.failure,
      actionsServiceDeactivationStartActions.failure,
    ],
    () => -1
  )

// TODO: should we update it in system deactivate actions?
const currentAction = createReducer(initialState.currentAction)
  .handleAction(
    [
      actionsServiceActivationInfoActions.success,
      actionsServiceActivationStartActions.success,
      actionsServiceStartRecordingInfoActions.success,
      actionsServiceStartRecordingStartActions.success,
      actionsServiceStopRecordingInfoActions.success,
      actionsServiceStopRecordingStartActions.success,
    ],
    (prevState: SystemAction | null, { payload }) => {
      const { status } = payload.action
      if (status && ['done', 'error', 'abort'].includes(status))
        return initialState.currentAction
      return payload.action
    }
  )
  .handleAction(
    [systemStateActions.success, stateMessageAction],
    (prevState: SystemAction | null, { payload }) => {
      return initialState.currentAction
    }
  )
  .handleAction(resetStoreAction, () => initialState.currentAction)
  .handleAction(
    [
      actionsServiceActivationInfoActions.failure,
      actionsServiceActivationStartActions.failure,
      actionsServiceDeactivationInfoActions.failure,
      actionsServiceDeactivationStartActions.failure,
    ],
    () => initialState.currentAction
  )

const recordingStatus = createReducer(initialState.recordingStatus)
  .handleAction(
    actionsServiceStartRecordingInfoActions.success,
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(
    [systemStateActions.success, stateMessageAction],
    (prevState: ActionStatus, { type, payload }) => {
      if (['StartingRecording'].includes(payload?.state)) return 'progress'
      if (['Recording'].includes(payload?.state)) return 'done'
      if (payload?.state !== 'StartingRecording')
        return initialState.recordingStatus
      return prevState || initialState.recordingStatus
    }
  )
  .handleAction(
    actionsServiceStartRecordingStartActions.success,
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(
    [
      actionsServiceStopRecordingInfoActions.success,
      actionsServiceStopRecordingStartActions.success,
    ],
    (_, payload) => null
  )
  .handleAction(
    [
      actionsServiceStartRecordingInfoActions.failure,
      actionsServiceStartRecordingStartActions.failure,
    ],
    () => 'error'
  )
  .handleAction(resetStoreAction, () => initialState.recordingStatus)

const stopRecordingStatus = createReducer(initialState.stopRecordingStatus)
  .handleAction(
    [
      actionsServiceStopRecordingInfoActions.success,
      actionsServiceStopRecordingStartActions.success,
    ],
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(actionsServiceActivateSystemAction, () => null)
  .handleAction(
    [
      actionsServiceStopRecordingInfoActions.failure,
      actionsServiceStopRecordingStartActions.failure,
    ],
    () => 'error'
  )
  .handleAction(
    [systemStateActions.success, stateMessageAction],
    (prevState: ActionStatus, { payload }) => {
      if (['StoppingRecording'].includes(payload?.state)) return 'progress'
      if (['Recording'].includes(payload?.state))
        return initialState.stopRecordingStatus
      if (activatedStates.includes(payload?.state)) return 'done'
      return prevState || initialState.stopRecordingStatus
    }
  )
  .handleAction(resetStoreAction, () => initialState.stopRecordingStatus)

const deactivating = createReducer(initialState.deactivating).handleAction(
  actionsServiceDeactivating,
  (prevState: boolean, { payload }) => payload
)

const deactivationStatus = createReducer(initialState.deactivationStatus)
  .handleAction(
    [
      actionsServiceDeactivationStartActions.success,
      actionsServiceDeactivationInfoActions.success,
    ],
    (prevState: ActionStatus, { payload }) => payload.action.status
  )
  .handleAction(
    [systemStateActions.success, stateMessageAction],
    (prevState: ActionStatus, { payload }) => {
      if (['Deactivated'].includes(payload?.state)) return 'done'
      if (['Deactivating'].includes(payload?.state)) return 'progress'
      if (activatedStates.includes(payload?.state))
        return initialState.stopRecordingStatus
      return prevState || initialState.stopRecordingStatus
    }
  )
  .handleAction(resetStoreAction, () => initialState.deactivationStatus)
  .handleAction(actionsServiceActivateSystemAction, () => null)

const acquisitionReady = createReducer(initialState.acquisitionReady)
  .handleAction(
    actionsServiceAcquisitionReady,
    (prevState: boolean, { payload }) => payload
  )
  .handleAction(
    [
      actionsServiceActivationInfoActions.success,
      actionsServiceActivationStartActions.success,
    ],
    (prevState: boolean, { payload }) => {
      if (payload.action.status === 'abort')
        return initialState.acquisitionReady
      return prevState
    }
  )
  // autoactivate if system is in active or recording
  // .handleAction(
  //   [systemStateActions.success, stateMessageAction],
  //   (prevState: boolean, { payload }) =>
  //     visibleMapStates.includes(payload?.state)
  // )
  .handleAction(resetStoreAction, () => initialState.acquisitionReady)

export const actionsServiceReducer = combineReducers({
  activationProgress,
  acquisitionReady,
  deactivating,
  recordingStatus,
  stopRecordingStatus,
  deactivationStatus,
  currentAction,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      actionsService: ActionsState
    }
  | AnyObject

export const selectActionsState = (state: OptimizedRootState): ActionsState =>
  state.actionsService

export const selectActivationProgress = createSelector(
  selectActionsState,
  (data) => data.activationProgress
)

export const selectActivationDone = createSelector(
  selectActionsState,
  (data) => data.activationProgress === 100
)

export const selectAcquisitionReady = createSelector(
  selectActionsState,
  (data) => data.acquisitionReady
)

export const selectRecordingStatus = createSelector(
  selectActionsState,
  (data) => data.recordingStatus
)

export const selectStopRecordingStatus = createSelector(
  selectActionsState,
  (data) => data.stopRecordingStatus
)

export const selectDeactivating = createSelector(
  selectActionsState,
  (data) => data.deactivating
)

export const selectDeactivationStatus = createSelector(
  selectActionsState,
  (data) => data.deactivationStatus
)

export const selectCurrentAction = createSelector(
  selectActionsState,
  (data) => data.currentAction
)
