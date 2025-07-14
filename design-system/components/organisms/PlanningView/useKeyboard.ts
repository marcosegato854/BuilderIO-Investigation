import { useEffect } from 'react'
import { PlanningTools } from 'store/features/planning/types'
import { useDispatch } from 'react-redux'
import { redoAction, undoAction } from 'store/features/planning/slice'

/**
 * Hook that handles drawing polygons
 * @returns [IClickableOption[], number]
 */
const useKeyboard = (tool: PlanningTools, deselect: () => void): [] => {
  const dispatch = useDispatch()

  /**
   * Keyboard interactions
   */
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        /* avoid to deselect it 'ENTER' was hit on an input */
        const element = e.target as HTMLElement
        if (element.tagName.toUpperCase() === 'INPUT') return
        deselect()
      } else if (e.which === 90 && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        e.stopPropagation()
        if (e.shiftKey) {
          dispatch(redoAction())
        } else {
          dispatch(undoAction())
        }
      } else if (e.which === 89 && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        e.stopPropagation()
        dispatch(redoAction())
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [tool, dispatch, deselect])
  return []
}
export default useKeyboard
