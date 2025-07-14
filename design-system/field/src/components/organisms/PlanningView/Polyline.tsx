/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { FC, useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Polygon } from 'store/features/planning/types'
import { drawPolyline, removePolyline } from 'utils/myVR/planning/tracks'
import { arcs, waypoints } from 'utils/planning/polygonHelpers'
import { archsToPos3D } from 'utils/planning/typeConversions'

export interface IPolylineProps {
  /**
   * Polygon
   */
  polygon: Polygon | null
  /**
   * MyVR Provider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * Projection
   */
  projection: string | null
  /**
   * unique identifier
   */
  id: number
}

/**
 * Shows the map with controls and toolbars when the system is activated
 */
export const Polyline: FC<IPolylineProps> = ({
  myVRProvider,
  polygon: track,
  id,
  projection,
}: IPolylineProps) => {
  const waypointsLength = useRef<number>(0)
  const dispatch = useDispatch()

  const drawSinglePath = useCallback(
    (points: Position3D[], isSelected: boolean, currentPolygon: Polygon) => {
      if (!myVRProvider) return
      myVRProvider.execute(drawPolyline(points, id, projection))
    },
    [id, myVRProvider, projection]
  )

  /** draw on track updates */
  useEffect(() => {
    waypointsLength.current = waypoints(track).length || 0
    if (!myVRProvider) return () => {}
    if (!track) return () => {}
    myVRProvider.execute(removePolyline(id))
    if (arcs(track).length) {
      console.info('[ROUTING] draw polyline')
      drawSinglePath(archsToPos3D(arcs(track)), true, track)
      return () => {}
    }
    return () => {
      // disabled because it makes the track flicker
      // myVRProvider &&
      //   myVRProvider.execute(
      //     removeTrack(trackIdRef.current),
      //     removeWaypoints(trackIdRef.current, waypointsLength.current + 1)
      //   )
    }
  }, [track, myVRProvider, dispatch, drawSinglePath, id])

  /** cleanup on unmount */
  useEffect(() => {
    return () => {
      console.info('[ROUTING] unmount polyline')
      myVRProvider && myVRProvider.execute(removePolyline(id))
    }
  }, [myVRProvider, id])

  return null
}
