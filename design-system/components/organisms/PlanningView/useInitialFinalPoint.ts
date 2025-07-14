import { MyVRProvider } from 'hooks/useMyVRProvider'
import { MutableRefObject, useEffect } from 'react'
import { PlanningTools } from 'store/features/planning/types'
import { useDispatch } from 'react-redux'
import { addMarkerFromClick } from './addPointFromClick'

/**
 * Hook that handles drawing polygons
 * @returns [IClickableOption[], number]
 */
const useInitialFinalPoint = (
  tool: PlanningTools,
  canvas: HTMLCanvasElement | null,
  panning: MutableRefObject<boolean>,
  myVRProvider?: MyVRProvider
): [] => {
  const dispatch = useDispatch()

  /**
   * Use HammerJS to handle all the interactions
   */
  useEffect(() => {
    if (
      [PlanningTools.INITIAL_POINT, PlanningTools.FINAL_POINT].includes(tool) &&
      myVRProvider &&
      canvas
    ) {
      const singletapHandler = (e: HammerInput) => {
        /** DRAWING */
        panning.current ||
          addMarkerFromClick(myVRProvider, e.srcEvent, tool, dispatch)
      }
      const hm = new Hammer.Manager(canvas)
      hm.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }))
      hm.add(new Hammer.Tap({ event: 'singletap' }))
      hm.get('doubletap').recognizeWith('singletap')
      hm.get('singletap').requireFailure('doubletap')
      hm.on('singletap', singletapHandler)
      return () => {
        hm.off('singletap', singletapHandler)
        hm.destroy()
      }
    }
    return () => {}
  }, [myVRProvider, tool, dispatch, canvas, panning])
  return []
}
export default useInitialFinalPoint
