import { MyVRProvider } from 'hooks/useMyVRProvider'
import { insert, update } from 'ramda'
import { RefObject, useEffect, useRef, useState, useCallback } from 'react'
import {
  Coord3DPlanning,
  PlanningTools,
  Polygon,
  Waypoint,
} from 'store/features/planning/types'
import api from 'store/features/planning/api'
import { throttle } from 'throttle-debounce'
import {
  getCoordinatesOfPoint,
  getElementsClicked,
} from 'utils/myVR/common/position'
import { getFeaturePoints } from 'utils/myVR/common/features'
import { useDispatch } from 'react-redux'
import {
  getClosestPoint,
  getInsertionIndex,
  getPageX,
  getPageY,
  parseHitRecords,
} from 'utils/myVR/helpers'
import { Layers } from 'utils/myVR/types'
import {
  emptyPolygon,
  emptyPolygonSinglePath,
  waypoints,
} from 'utils/planning/polygonHelpers'
import { coord3DPlnToWp, wpToRaw } from 'utils/planning/typeConversions'
import { editPointFromMouseEvent } from 'components/organisms/PlanningView/addPointFromClick'

/**
 * Hook that handles all the interactions used to move a point on a path
 * @returns [IClickableOption[], number]
 */
const useGhostPath = (
  tool: PlanningTools,
  canvas: HTMLCanvasElement | null,
  myVRProvider?: MyVRProvider,
  currentPolygon?: Polygon
): [
  RefObject<HTMLImageElement>,
  // keep any since it comes from plain js (myVR)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (j: any) => void,
  Polygon | null,
  string | null
] => {
  const dispatch = useDispatch()
  const draggingPointRef: RefObject<HTMLImageElement> = useRef(null)
  const [draggingPoint, setDraggingPoint] = useState<string | null>(null)
  const [ghostPath, setGhostPath] = useState<Polygon | null>(null)
  const clickCoords = useRef<ScreenPosition | null>()
  const ghostWaypointsRef = useRef<Waypoint[] | null>()
  const isAddingANewPoint = useRef<boolean>(false)

  /**
   * cleanup when no polygon is selected
   */
  useEffect(() => {
    if (!currentPolygon) {
      setDraggingPoint(null)
    }
    setGhostPath(null)
  }, [currentPolygon, setDraggingPoint, setGhostPath])

  /**
   * update waypoints ref
   */
  useEffect(() => {
    const wps = waypoints(ghostPath)
    ghostWaypointsRef.current = wps.length ? wps : undefined
  }, [ghostPath])

  const pointUpdateFunc = useCallback(
    (newWaypoint: Waypoint, atIndex: number, originalPolygon: Polygon) => {
      const wps = update(
        atIndex,
        newWaypoint,
        ghostWaypointsRef.current || waypoints(originalPolygon)
      )
      const basePolygon = originalPolygon.isPolygon
        ? emptyPolygon('Ghost')
        : emptyPolygonSinglePath('Ghost')
      const gPath: Polygon = {
        ...basePolygon,
        id: 100000,
      }
      if (originalPolygon.isPolygon) {
        gPath.coordinates = wpToRaw(wps)
      } else {
        gPath.paths[0].waypoints = wps
      }
      setGhostPath(gPath)
    },
    [setGhostPath]
  )

  /**
   * calls the api
   * and updates data insid\e the temporary polygon
   */
  const updateGhostPath = useCallback(
    (atIndex: number, originalPolygon: Polygon, pointCoords: Position3D) => {
      if (!myVRProvider || !originalPolygon || !pointCoords) return
      myVRProvider.execute(
        getCoordinatesOfPoint((coord: Coord3DPlanning | null) => {
          if (!coord) return
          if (originalPolygon.isPolygon) {
            const newWaypoint: Waypoint = {
              longitude: coord.x,
              latitude: coord.y,
              freePoint: coord.isFreePoint,
            }
            pointUpdateFunc(newWaypoint, atIndex, originalPolygon)
            return
          }
          const [wp] = coord3DPlnToWp([coord])
          api
            .planningNearestPoint(wp)
            .then(({ data: { latitude, longitude } }) => {
              // myVRProvider.execute(
              // getScreenCoordinates((pointOnRoad: Position3D) => {
              //   const distance = calculateDistance(pointCoords, pointOnRoad)
              //   const isFreePoint = distance > 20
              //   const newWaypoint: Waypoint = isFreePoint
              //     ? { ...wp, isFreePoint: true }
              //     : { ...nearestPoint, isFreePoint: false }
              const newWaypoint: Waypoint = {
                longitude,
                latitude,
                freePoint: false,
              }
              pointUpdateFunc(newWaypoint, atIndex, originalPolygon)
              // }, nearestPoint)
              // )
            })
        }, pointCoords)
      )
    },
    [myVRProvider, pointUpdateFunc]
  )

  /**
   * inserts a new point in the ghost polygon
   * then starts dragging it and sets a flag
   * to add the point on the up / touchend
   */
  const addPointBetweenWaypoints = (h: Hit) => {
    if (!myVRProvider) return
    /** get feature points array */
    myVRProvider.execute(
      getFeaturePoints(
        (points) => {
          /** find 3d coordinates of clicked point */
          myVRProvider.execute(
            getCoordinatesOfPoint(
              (wp) => {
                /** find nearest point on path */
                const closestPoint = getClosestPoint(points, wp as Position3D)
                if (!closestPoint) return
                /** get an index between two waypoints */
                const closestIndex = getInsertionIndex(
                  points,
                  closestPoint,
                  waypoints(currentPolygon)
                )
                const newWaypoint: Waypoint = {
                  longitude: closestPoint.x,
                  latitude: closestPoint.y,
                  freePoint: !!currentPolygon!.isPolygon,
                }
                /** add the new waypoint */
                isAddingANewPoint.current = true
                ghostWaypointsRef.current = insert(
                  closestIndex,
                  newWaypoint,
                  waypoints(currentPolygon)
                )
                /** update the polygon with the new point */
                pointUpdateFunc(newWaypoint, closestIndex, currentPolygon!)
                /** start dragging the point */
                setDraggingPoint(
                  `${Layers.FEATURES_PLANNING_TRACK}-${closestIndex}`
                )
              },
              {
                x: clickCoords.current!.pageX,
                y: canvas!.height - clickCoords.current!.pageY,
              }
            )
          )
        },
        h.feature.toString(),
        Layers.FEATURES_PLANNING_TRACK
      )
    )
  }

  /**
   * method that should be used in the myVR global callback
   * when intercepting the elementClicked event
   */
  // keep any since it comes from plain js (myVR)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkHitsForDragging = (j: any) => {
    if (!myVRProvider) return
    const hits = parseHitRecords(j['hit-records'])
    hits.forEach((h) => {
      if (
        [Layers.FEATURES_PLANNING_TRACK, Layers.FEATURES_SCAN_RANGE].includes(
          h.layer
        )
      ) {
        // if (h.layer === Layers.FEATURES_PLANNING_TRACK) {
        if (!clickCoords.current) return
        if (currentPolygon?.isPolygon) return
        addPointBetweenWaypoints(h)
      }
      if (h.layer === Layers.WAYPOINTS) {
        setDraggingPoint(h.feature as string)
      }
    })
  }

  /**
   * Use HammerJS to handle all the interactions
   */
  useEffect(() => {
    if (!canvas) return () => {}
    if (!myVRProvider) return () => {}
    if (tool !== PlanningTools.MOVE_POINT) return () => {}
    const throttleDelay = currentPolygon?.isPolygon ? 100 : 1000
    const throttledUpdateGhostPath = throttle(
      throttleDelay,
      false,
      updateGhostPath
    )
    const moveHandler = (e: MouseEvent | TouchEvent) => {
      if (draggingPointRef.current) {
        const pageY = getPageY(e)
        const pageX = getPageX(e)
        draggingPointRef.current.style.top = `${pageY}px`
        draggingPointRef.current.style.left = `${pageX}px`
        const coords = {
          x: pageX,
          y: canvas.height - pageY,
        }
        if (!draggingPoint) return
        const atIndex = Number(draggingPoint.split('-')[1])
        throttledUpdateGhostPath(atIndex!, currentPolygon!, coords)
      }
    }
    const downHandler = (e: MouseEvent | TouchEvent) => {
      clickCoords.current = {
        pageX: getPageX(e),
        pageY: getPageY(e),
      }
      if (!draggingPointRef.current) {
        myVRProvider.execute(getElementsClicked(e))
      }
    }
    const upHandler = (e: MouseEvent | TouchEvent) => {
      if (draggingPoint) {
        editPointFromMouseEvent(
          myVRProvider,
          e,
          draggingPoint,
          dispatch,
          isAddingANewPoint.current,
          !!currentPolygon?.isPolygon
        )
        setDraggingPoint(null)
        setGhostPath(null)
      }
      isAddingANewPoint.current = false
      clickCoords.current = null
    }
    document.addEventListener('mousemove', moveHandler as never)
    document.addEventListener('touchmove', moveHandler as never)
    document.addEventListener('mousedown', downHandler as never)
    document.addEventListener('touchstart', downHandler as never)
    document.addEventListener('mouseup', upHandler as never)
    document.addEventListener('touchend', upHandler as never)
    return () => {
      document.removeEventListener('mousemove', moveHandler as never)
      document.removeEventListener('touchmove', moveHandler as never)
      document.removeEventListener('mousedown', downHandler as never)
      document.removeEventListener('touchstart', downHandler as never)
      throttledUpdateGhostPath.cancel()
      // updateGhostTrack.cancel()
      document.removeEventListener('mouseup', upHandler as never)
      document.removeEventListener('touchend', upHandler as never)
    }
  }, [
    myVRProvider,
    tool,
    currentPolygon,
    dispatch,
    setDraggingPoint,
    setGhostPath,
    draggingPoint,
    canvas,
    updateGhostPath,
  ])

  return [draggingPointRef, checkHitsForDragging, ghostPath, draggingPoint]
}
export default useGhostPath
