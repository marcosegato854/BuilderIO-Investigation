import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { openDialogAction } from 'store/features/dialogs/slice'
import {
  currentInternalPathAction,
  deleteInternalPathAction,
} from 'store/features/planning/slice'
import { PlanningTools, Polygon } from 'store/features/planning/types'
import { getElementsClicked } from 'utils/myVR/common/position'
import { name, polygonPaths } from 'utils/planning/polygonHelpers'

/**
 * Hook that handles all the interactions used to move a point on a path
 * @returns [IClickableOption[], number]
 */
const useDeleteIternalPath = (
  tool: PlanningTools,
  canvas: HTMLCanvasElement | null,
  polygons: Polygon[],
  myVRProvider?: MyVRProvider
): [(h: Hit) => void] => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const checkHitsForDeletePath = useCallback(
    (h: Hit) => {
      const [polygonId, internalPathId] = h.feature.toString().split('-')
      const polygon = polygons.find((tr) => {
        return tr.id === Number(polygonId) || tr.temp_id === Number(polygonId)
      })
      const internal = polygonPaths(polygon)?.find(
        (int) => int.id === Number(internalPathId)
      )
      const pathName = name(internal)
      dispatch(currentInternalPathAction(Number(internalPathId)))
      dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            type: 'message',
            variant: 'colored',
            cancelButtonLabel: t('planning.delete_confirm.cancel', 'Cancel'),
            okButtonCallback: () => {
              dispatch(currentInternalPathAction(-1))
              dispatch(
                deleteInternalPathAction({
                  polygonId: Number(polygonId),
                  pathId: Number(internalPathId),
                })
              )
            },
            cancelButtonCallback: () => {
              dispatch(currentInternalPathAction(-1))
            },
            okButtonLabel: t('planning.delete_confirm.ok', 'YES'),
            text: t('planning.delete_confirm.text', 'save text', {
              pathName,
            }),
            title: t('planning.delete_confirm.title', 'save title', {
              type: t('planning.delete_confirm.polygon_internal_path'),
            }),
          } as IAlertProps,
        })
      )
    },
    [dispatch, t, polygons]
  )

  /**
   * Use HammerJS to handle all the interactions
   */
  useEffect(() => {
    if (!canvas) return () => {}
    if (!myVRProvider) return () => {}
    if (tool !== PlanningTools.DELETE_PATH) return () => {}

    const singletapHandler = (e: HammerInput) => {
      /** CHECK ELEMENTS CLICKED */
      myVRProvider.execute(getElementsClicked(e.srcEvent))
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
  }, [myVRProvider, tool, canvas])

  return [checkHitsForDeletePath]
}
export default useDeleteIternalPath
