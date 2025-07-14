import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCurrentTheme,
  switchThemeAction,
  Theme,
} from 'store/features/theme/slice'

/**
 * Hook that handles theme switching
 * and applies theme class to body
 * @returns [Theme, (theme: Theme)=>void]
 */
const useTheme = (): [Theme, (theme: Theme) => void] => {
  const theme = useSelector(selectCurrentTheme)
  const dispatch = useDispatch()
  const setTheme = useCallback(
    (newTheme: Theme): void => {
      if (newTheme !== theme) dispatch(switchThemeAction(newTheme))
    },
    [dispatch, theme]
  )

  /**
   * apply theme class to body when the theme changes
   */
  useEffect(() => {
    const body = document.querySelector('body')
    let oldTheme
    body?.classList.forEach((cls) => {
      if (cls.includes('theme-')) {
        oldTheme = cls
      }
    })
    if (oldTheme) body?.classList.remove(oldTheme)
    body?.classList.add(`theme-${theme}`)
  }, [theme])
  return [theme, setTheme]
}
export default useTheme
