import { combineReducers } from 'redux'
import { createSelector } from 'reselect'
import { ActionType, createAction, createReducer } from 'typesafe-actions'
import { AnyObject } from 'yup/lib/object'

/**
 * TYPES
 */
export type Theme = 'light' | 'dark'

/**
 * ACTIONS
 */
export const switchThemeAction = createAction('theme/SWITCH_THEME')<Theme>()

const actions = { switchThemeAction }
export type ThemeAction = ActionType<typeof actions>

/**
 * REDUCERS
 */
type ThemeState = Readonly<{
  theme: Theme
}>

const initialState: ThemeState = {
  theme: 'dark',
}

const theme = createReducer(initialState.theme).handleAction(
  switchThemeAction,
  (_: Theme, { payload }) => payload
)

export const themeReducer = combineReducers({
  theme,
})

/**
 * SELECTORS
 */
export type OptimizedRootState =
  | {
      theme: ThemeState
    }
  | AnyObject
export const selectThemeState = (state: OptimizedRootState): ThemeState =>
  state.theme

export const selectTheme = (state: OptimizedRootState) =>
  selectThemeState(state).theme

export const selectCurrentTheme = createSelector(
  selectTheme,
  (currentTheme) => currentTheme
)
