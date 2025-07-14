import { MyVRProvider } from 'hooks/useMyVRProvider'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  currentInternalPathAction,
  currentPolygonAction,
  toolAction,
} from 'store/features/planning/slice'
import { PlanningTools } from 'store/features/planning/types'

/**
 * Hook that handles drawing polygons
 * @returns [IClickableOption[], number]
 */
const useDeselect = (
  tool: PlanningTools,
  canvas: HTMLCanvasElement | null,
  myVRProvider?: MyVRProvider
): [() => void] => {
  const dispatch = useDispatch()

  const deselect = useCallback(() => {
    // internal tools
    if (
      [PlanningTools.CUT_INTERNAL, PlanningTools.DELETE_PATH].includes(tool)
    ) {
      dispatch(currentInternalPathAction(-1))
      return
    }
    // internal selection
    if ([PlanningTools.SELECT_INTERNAL].includes(tool)) {
      dispatch(currentInternalPathAction(-1))
      dispatch(currentPolygonAction(-1))
      dispatch(toolAction(PlanningTools.SELECT))
      return
    }
    // first level tools
    if (
      [
        PlanningTools.DRAW_PATH,
        PlanningTools.DRAW_POLYGON,
        PlanningTools.MOVE_POINT,
        PlanningTools.CUT,
        PlanningTools.DELETE_POLYGON,
        PlanningTools.DELETE_PATH,
        PlanningTools.INITIAL_POINT,
        PlanningTools.FINAL_POINT,
      ].includes(tool)
    ) {
      dispatch(currentPolygonAction(-1))
      dispatch(toolAction(PlanningTools.SELECT))
    }
    // first level selection
    if ([PlanningTools.SELECT].includes(tool)) {
      dispatch(currentPolygonAction(-1))
    }
  }, [dispatch, tool])

  /**
   * Use HammerJS to handle all the interactions
   */
  useEffect(() => {
    if (myVRProvider && canvas) {
      const doubletapHandler = () => {
        deselect()
      }
      const hm = new Hammer.Manager(canvas)
      hm.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }))
      hm.add(new Hammer.Tap({ event: 'singletap' }))
      hm.add(new Hammer.Press({ event: 'taphold', time: 1000 }))
      hm.get('doubletap').recognizeWith('singletap')
      hm.get('singletap').requireFailure('doubletap')
      hm.on('taphold', doubletapHandler)
      hm.on('doubletap', doubletapHandler)
      return () => {
        hm.off('taphold', doubletapHandler)
        hm.off('doubletap', doubletapHandler)
        hm.destroy()
      }
    }
    return () => {}
  }, [myVRProvider, tool, dispatch, deselect, canvas])
  return [deselect]
}
export default useDeselect
