import { MyVRProvider } from 'hooks/useMyVRProvider'
import { Dispatch } from 'react'
import {
  addPointAction,
  editPointAction,
  finalPointAction,
  initialPointAction,
  splitActions,
  splitInternalPathActions,
} from 'store/features/planning/slice'
import { Coord3DPlanning, PlanningTools } from 'store/features/planning/types'
import api from 'store/features/planning/api'
import { getCoordinatesOfPointClickedOnMap } from 'utils/myVR/common/position'
import { errorAction } from 'store/features/errors/slice'
import { t } from 'i18n/config'
import { coord3DPlnToWp } from 'utils/planning/typeConversions'

export const addPointFromClick = (
  myVRProvider: MyVRProvider,
  e: MouseEvent | TouchEvent,
  dispatch: Dispatch<unknown>
) => {
  // const pageY = getPageY(e)
  // const pageX = getPageX(e)
  myVRProvider.execute(
    getCoordinatesOfPointClickedOnMap((coord: Coord3DPlanning | null) => {
      if (!coord) return
      const [wp] = coord3DPlnToWp([coord])
      api
        .planningNearestPoint(wp)
        .then(({ data: { latitude, longitude, distance } }) => {
          dispatch(
            addPointAction({
              coord: {
                x: longitude,
                y: latitude,
                isFreePoint: false,
              },
            })
          )
        })
        .catch((error) => {
          console.error(error)
          dispatch(
            errorAction(
              new Error(
                t(
                  'planning.errors.nearest_point',
                  'Nearest point on road not found'
                )
              )
            )
          )
        })
    }, e)
  )
}

export const splitSinglePathFromClick = (
  myVRProvider: MyVRProvider,
  e: MouseEvent | TouchEvent,
  dispatch: Dispatch<unknown>
) => {
  myVRProvider.execute(
    getCoordinatesOfPointClickedOnMap((wp: Coord3DPlanning | null) => {
      if (!wp) return
      dispatch(
        splitActions.request({
          splitPoint: coord3DPlnToWp([wp])[0],
        })
      )
    }, e)
  )
}

export const splitInternalPathFromClick = (
  myVRProvider: MyVRProvider,
  e: MouseEvent | TouchEvent,
  dispatch: Dispatch<unknown>
) => {
  myVRProvider.execute(
    getCoordinatesOfPointClickedOnMap((wp: Coord3DPlanning | null) => {
      if (!wp) return
      dispatch(
        splitInternalPathActions.request({
          splitPoint: coord3DPlnToWp([wp])[0],
        })
      )
    }, e)
  )
}

export const addFreePointFromClick = (
  myVRProvider: MyVRProvider,
  e: MouseEvent | TouchEvent,
  dispatch: Dispatch<unknown>
) => {
  myVRProvider.execute(
    getCoordinatesOfPointClickedOnMap((wp: Coord3DPlanning | null) => {
      if (!wp) return
      dispatch(
        addPointAction({
          coord: { ...wp, isFreePoint: true },
        })
      )
    }, e)
  )
}

export const addMarkerFromClick = (
  myVRProvider: MyVRProvider,
  e: MouseEvent | TouchEvent,
  tool: PlanningTools,
  dispatch: Dispatch<unknown>
) => {
  myVRProvider.execute(
    getCoordinatesOfPointClickedOnMap((wp: Coord3DPlanning | null) => {
      if (!wp) return
      const actionCreator =
        tool === PlanningTools.INITIAL_POINT
          ? initialPointAction
          : finalPointAction
      dispatch(actionCreator({ ...coord3DPlnToWp([wp])[0], freePoint: true }))
    }, e)
  )
}

export const editPointFromMouseEvent = (
  myVRProvider: MyVRProvider,
  e: MouseEvent | TouchEvent,
  featureId: string,
  dispatch: Dispatch<unknown>,
  add: boolean,
  polygon: boolean
) => {
  // const pageY = getPageY(e)
  // const pageX = getPageX(e)
  myVRProvider.execute(
    getCoordinatesOfPointClickedOnMap((coord: Coord3DPlanning | null) => {
      if (!coord) return
      const actionCreator = add ? addPointAction : editPointAction
      if (polygon) {
        const atIndex = Number(featureId.split('-')[1])
        dispatch(
          actionCreator({
            coord: {
              ...coord,
              isFreePoint: true,
            },
            atIndex,
          })
        )
        return
      }
      const [wp] = coord3DPlnToWp([coord])
      api
        .planningNearestPoint(wp)
        .then(({ data: { latitude, longitude } }) => {
          // myVRProvider.execute(
          //   getScreenCoordinates(
          //     (pointOnRoad: Position3D, canvas: HTMLCanvasElement) => {
          //       const clickedPoint: Position3D = {
          //         x: pageX,
          //         y: canvas.height - pageY,
          //       }
          //       const distance = calculateDistance(clickedPoint, pointOnRoad)
          const atIndex = Number(featureId.split('-')[1])
          // const isFreePoint = polygon || distance > 20
          const isFreePoint = false
          dispatch(
            actionCreator({
              coord: {
                // ...(isFreePoint ? wp : nearestPoint),
                x: longitude,
                y: latitude,
                isFreePoint,
              },
              atIndex,
            })
          )
          //     },
          //     nearestPoint
          //   )
          // )
        })
        .catch((error) => {
          dispatch(errorAction(error))
        })
    }, e)
  )
}
