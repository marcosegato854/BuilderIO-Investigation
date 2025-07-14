import { ActionType, createAction } from 'typesafe-actions'
import { AnyObject } from 'yup/lib/types'

/**
 * ACTIONS
 */
export const resetSocketsAction = createAction('global/RESET_SOCKETS')()
export const resetStoreAction = createAction('global/RESET_STORE')()
export const startupAction = createAction('global/STARTUP')()
export const redirectToJobsAction = createAction('global/REDIRECT_TO_JOBS')()
export const visibilityChangeAction = createAction('global/VISIBILITY_CHANGE')<
  'hidden' | 'visible'
>()

const actions = {
  resetStoreAction,
  startupAction,
  redirectToJobsAction,
  visibilityChangeAction,
}
export type GlobalAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type GlobalServiceState = Readonly<{}>

// const initialState: GlobalServiceState = {}

// export const globalServiceReducer = combineReducers({})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      globalService: GlobalServiceState
    }
  | AnyObject

// export const selectGlobalServiceState = (
//   state: OptimizedRootState
// ): GlobalServiceState => state.globalService
