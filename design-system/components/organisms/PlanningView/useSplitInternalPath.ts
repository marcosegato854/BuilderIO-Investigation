import { splitInternalPathFromClick } from 'components/organisms/PlanningView/addPointFromClick'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { MutableRefObject, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { PlanningTools } from 'store/features/planning/types'

/**
 * Hook that handles drawing paths
 * @returns [IClickableOption[], number]
 */
const useSplitInternalPath = (
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
    if (tool === PlanningTools.CUT_INTERNAL && myVRProvider && canvas) {
      const singletapHandler = (e: HammerInput) => {
        /** SPLITTING */
        panning.current ||
          splitInternalPathFromClick(myVRProvider, e.srcEvent, dispatch)
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
export default useSplitInternalPath
