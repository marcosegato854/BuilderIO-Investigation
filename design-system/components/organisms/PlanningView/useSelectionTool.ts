import { MyVRProvider } from 'hooks/useMyVRProvider'
import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { PlanningTools } from 'store/features/planning/types'
import { getElementsClicked } from 'utils/myVR/common/position'
import { currentPolygonAction } from 'store/features/planning/slice'

/**
 * Hook that handles drawing polygons
 * @returns [IClickableOption[], number]
 */
const useSelectionTool = (
  tool: PlanningTools,
  canvas: HTMLCanvasElement | null,
  myVRProvider?: MyVRProvider
): [(h: Hit) => void] => {
  const dispatch = useDispatch()

  const checkHitForSelection = useCallback(
    (h) => {
      dispatch(currentPolygonAction(Number(h.feature)))
    },
    [dispatch]
  )

  /**
   * Use HammerJS to handle all the interactions
   */
  useEffect(() => {
    if (myVRProvider && canvas) {
      const singletapHandler = (e: HammerInput) => {
        /** CHECK ELEMENTS CLICKED */
        if ([PlanningTools.SELECT].includes(tool)) {
          myVRProvider.execute(getElementsClicked(e.srcEvent))
        }
      }
      const hm = new Hammer.Manager(canvas)
      hm.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }))
      hm.add(new Hammer.Tap({ event: 'singletap' }))
      hm.add(new Hammer.Press({ event: 'taphold', time: 1000 }))
      hm.get('doubletap').recognizeWith('singletap')
      hm.get('singletap').requireFailure('doubletap')
      hm.on('singletap', singletapHandler)
      return () => {
        hm.off('singletap', singletapHandler)
        hm.destroy()
      }
    }
    return () => {}
  }, [myVRProvider, tool, dispatch, canvas])
  return [checkHitForSelection]
}
export default useSelectionTool
