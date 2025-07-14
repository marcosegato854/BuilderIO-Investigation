import { MyVRProvider } from 'hooks/useMyVRProvider'
import { useCallback, useEffect } from 'react'
import { PlanningTools, Polygon } from 'store/features/planning/types'
import { getElementsClicked } from 'utils/myVR/common/position'
import { useDispatch } from 'react-redux'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { openDialogAction } from 'store/features/dialogs/slice'
import {
  currentPolygonAction,
  deletePolygonAction,
} from 'store/features/planning/slice'
import { useTranslation } from 'react-i18next'

/**
 * Hook that handles all the interactions used to delete a polygon
 * @returns [IClickableOption[], number]
 */
const useDeletePolygon = (
  tool: PlanningTools,
  canvas: HTMLCanvasElement | null,
  polygons: Polygon[],
  myVRProvider?: MyVRProvider
): [(h: Hit) => void] => {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const checkHitsForDeletePolygon = useCallback(
    (h: Hit) => {
      dispatch(currentPolygonAction(Number(h.feature)))
      const clickedPolygonId = Number(h.feature.toString().split('-')[0])
      const clickedPolygon = polygons.find((tr) => {
        const polygonId = tr.id || tr.temp_id
        return polygonId === clickedPolygonId
      })
      const textNode = clickedPolygon?.isPolygon
        ? 'planning.delete_confirm.text_polygon'
        : 'planning.delete_confirm.text'
      dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            type: 'message',
            variant: 'colored',
            cancelButtonLabel: t('planning.delete_confirm.cancel', 'Cancel'),
            okButtonCallback: () => {
              dispatch(currentPolygonAction(-1))
              dispatch(deletePolygonAction({ id: clickedPolygonId }))
            },
            cancelButtonCallback: () => {
              dispatch(currentPolygonAction(-1))
            },
            okButtonLabel: t('planning.delete_confirm.ok', 'YES'),
            text: t(textNode, 'delete text', {
              pathName: clickedPolygon?.name,
              tracks: clickedPolygon?.paths.length || 1,
            }),
            title: t('planning.delete_confirm.title', 'delete title', {
              type: polygons.find((tr) => {
                const polygonId = tr.id || tr.temp_id
                return polygonId === clickedPolygonId
              })?.isPolygon
                ? t('planning.delete_confirm.polygon')
                : t('planning.delete_confirm.track'),
            }),
          } as IAlertProps,
        })
      )
    },
    [polygons, dispatch, t]
  )

  /**
   * Use HammerJS to handle all the interactions
   */
  useEffect(() => {
    if (!canvas) return () => {}
    if (!myVRProvider) return () => {}
    if (tool !== PlanningTools.DELETE_POLYGON) return () => {}

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

  return [checkHitsForDeletePolygon]
}
export default useDeletePolygon
