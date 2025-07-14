import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import { ActionType, createAction, createReducer } from 'typesafe-actions'

import { DialogInfo } from 'store/features/dialogs/types'
import { resetStoreAction } from 'store/features/global/slice'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
export const openDialogAction = createAction(
  'dialogs/OPEN_DIALOG'
)<DialogInfo>()
export const closeDialogAction = createAction('dialogs/CLOSE_DIALOG')()
export const closeAllDialogsAction = createAction('dialogs/CLOSE_ALL_DIALOGS')()

const actions = { openDialogAction, closeDialogAction, closeAllDialogsAction }
export type DialogAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type DialogState = Readonly<{
  dialogs: DialogInfo[]
}>

const initialState: DialogState = {
  dialogs: [],
}

const dialogs = createReducer(initialState.dialogs)
  .handleAction(
    openDialogAction,
    (previousState: DialogInfo[], { payload }) => [
      { ...payload, id: payload.id || Math.floor(Date.now() / 1000) },
      ...previousState,
    ]
  )
  .handleAction(closeDialogAction, (previousState: DialogInfo[]) => [
    ...previousState.slice(1),
  ])
  .handleAction(closeAllDialogsAction, (previousState: DialogInfo[]) => {
    console.warn('[DIALOGS] close all dialogs requested')
    return initialState.dialogs
  })
  .handleAction(
    resetStoreAction,
    (previousState: DialogInfo[]) => initialState.dialogs
  )

export const dialogsReducer = combineReducers({
  dialogs,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      dialogs: DialogState
    }
  | AnyObject
export const selectDialogsState = (state: OptimizedRootState): DialogState =>
  state.dialogs
export const selectDialogs = createSelector(
  selectDialogsState,
  (state) => state.dialogs
)
export const isDialogOpened = createSelector(
  selectDialogsState,
  (state) => state.dialogs.length > 0
)
