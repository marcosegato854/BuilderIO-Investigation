import { AxiosError } from 'axios'
import { uniqBy } from 'ramda'
import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import { selectIsAdmin } from 'store/features/auth/slice'
import { resetStoreAction } from 'store/features/global/slice'
import { ActionType, createAction, createReducer } from 'typesafe-actions'
import { errorIsVisible, shortError } from 'utils/errors'
import { AnyObject } from 'yup/lib/object'

/**
 * ACTIONS
 */
export const errorAction = createAction('errors/ERROR')<unknown>()
export const errorCloseAction = createAction('errors/ERROR_CLOSE')<number>()
export const errorCloseByMessageAction = createAction(
  'errors/ERROR_CLOSE_BY_MESSAGE'
)<string>()
export const resetErrorsAction = createAction('errors/RESET_ERRORS')()

const actions = {
  errorAction,
  errorCloseAction,
  errorCloseByMessageAction,
  resetErrorsAction,
}
export type ErrorAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type ErrorState = Readonly<{
  errors: Error[]
}>

const initialState: ErrorState = {
  errors: [],
}

const errors = createReducer(initialState.errors)
  .handleAction(errorAction, (initialValue: Error[], { payload }) => {
    console.error(payload)
    return [payload as Error, ...initialValue]
  })
  .handleAction(errorCloseAction, (initialValue: Error[], { payload }) => {
    const newArr = [...initialValue]
    newArr.splice(payload, 1)
    return newArr
  })
  .handleAction(
    errorCloseByMessageAction,
    (initialValue: Error[], { payload }) => {
      return initialValue.filter((e) => e.message !== payload)
    }
  )
  .handleAction(
    [resetErrorsAction, resetStoreAction],
    (previouseValue) => initialState.errors
  )

export const errorsReducer = combineReducers({
  errors,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      errors: ErrorState
    }
  | AnyObject
export const selectErrorState = (state: OptimizedRootState): ErrorState =>
  state.errors

export const selectErrors = (state: OptimizedRootState) =>
  uniqBy(shortError, selectErrorState(state).errors as AxiosError[])

export const selectVisibleErrors = createSelector(
  selectErrors,
  selectIsAdmin,
  (errors, isAdmin) =>
    errors.filter((e) => {
      return errorIsVisible(e, isAdmin)
    })
)
