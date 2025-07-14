import { combineReducers } from 'redux'
import {
  ActionType,
  createAction,
  createAsyncAction,
  createReducer,
} from 'typesafe-actions'
import {
  AlignmentCommandRequest,
  AlignmentCommandResponse,
  AlignmentStatusResponse,
  AlignmentNotification,
} from 'store/features/alignment/types'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
export const alignmentCommandActions = createAsyncAction(
  'alignmentService/COMMAND_REQUEST',
  'alignmentService/COMMAND_SUCCESS',
  'alignmentService/COMMAND_FAILURE'
)<AlignmentCommandRequest, AlignmentCommandResponse, undefined>()
export const alignmentStatusActions = createAsyncAction(
  'alignmentService/STATUS_REQUEST',
  'alignmentService/STATUS_SUCCESS',
  'alignmentService/STATUS_FAILURE'
)<undefined, AlignmentStatusResponse, undefined>()

export const alignmentSubscribeAction = createAction(
  'alignmentService/ALIGNMENT_SUBSCRIBE'
)()
export const alignmentUnsubscribeAction = createAction(
  'alignmentService/ALIGNMENT_UNSUBSCRIBE'
)()
export const alignmentMessageAction = createAction(
  'alignmentService/ALIGNMENT_MESSAGE'
)<AlignmentNotification>()
export const alignmentSocketConnectionAction = createAction(
  'alignmentService/ALIGNMENT_SOCKET_CONNECTION'
)<boolean>()

const actions = {
  alignmentCommandActions,
  alignmentStatusActions,
  alignmentMessageAction,
  alignmentSubscribeAction,
  alignmentUnsubscribeAction,
  alignmentSocketConnectionAction,
}
export type AlignmentAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type AlignmentServiceState = Readonly<{
  alignmentState: AlignmentNotification | null
  alignmentSocketConnected: boolean
}>

const initialState: AlignmentServiceState = {
  alignmentState: null,
  alignmentSocketConnected: false,
}

const alignmentState = createReducer(initialState.alignmentState)
  .handleAction(
    alignmentMessageAction,
    (prevState: AlignmentNotification | null, { payload }) => payload
  )
  .handleAction(
    alignmentStatusActions.success,
    (prevState: AlignmentNotification | null, { payload }) => payload || null
  )

const alignmentSocketConnected = createReducer(
  initialState.alignmentSocketConnected
).handleAction(
  alignmentSocketConnectionAction,
  (prevState: boolean, { payload }) => payload
)
// .handleAction(systemStateActions.failure, () => null)

export const alignmentServiceReducer = combineReducers({
  alignmentState,
  alignmentSocketConnected,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      alignmentService: AlignmentServiceState
    }
  | AnyObject
export const selectAlignmentServiceState = (
  state: OptimizedRootState
): AlignmentServiceState => state.alignmentService

export const selectAlignment = (state: OptimizedRootState) =>
  selectAlignmentServiceState(state).alignmentState

export const selectPhase = (state: OptimizedRootState) =>
  selectAlignmentServiceState(state).alignmentState?.alignmentPhase

export const selectAlignmentSocketConnected = (state: OptimizedRootState) =>
  selectAlignmentServiceState(state).alignmentSocketConnected
