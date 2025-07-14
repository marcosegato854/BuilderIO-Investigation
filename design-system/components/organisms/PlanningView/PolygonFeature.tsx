/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { t } from 'i18n/config'
import { FC, useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { errorAction } from 'store/features/errors/slice'
import api from 'store/features/planning/api'
import { Path, Polygon } from 'store/features/planning/types'
import {
  drawPolygonTracks,
  drawTrack,
  drawTrackWithScanRange,
  drawWaypoints,
  removePolygonTracks,
  removeTrack,
  removeWaypoints,
} from 'utils/myVR/planning/tracks'
import { arcs, polygonPaths, waypoints } from 'utils/planning/polygonHelpers'
import { archsToPos3D, length, wpToPos3D } from 'utils/planning/typeConversions'

export interface IPolygonFeatureProps {
  /**
   * Polygon
   */
  polygon: Polygon | null
  /**
   * MyVR Provider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * selected polygon
   */
  selected: boolean
  /**
   * mark all internal tracks as selected
   */
  selectAllInternalTracks?: boolean
  /**
   * is rendered during acquisition
   */
  isAcquisition: boolean
  /**
   * selected internal path id
   */
  selectedInternalId: number
  /**
   * unit
   */
  unit: 'metric' | 'imperial'
  /**
   * Projection
   */
  projection: string | null
}

/**
 * Shows the map with controls and toolbars when the system is activated
 */
export const PolygonFeature: FC<IPolygonFeatureProps> = ({
  myVRProvider,
  polygon: track,
  selected,
  selectAllInternalTracks,
  selectedInternalId,
  unit,
  isAcquisition,
  projection,
}: IPolygonFeatureProps) => {
  const waypointsLength = useRef<number>(0)
  const trackId = track?.id || track?.temp_id
  const trackIdRef = useRef<number>(trackId || 100000) // ghost track
  const internalIdsRef = useRef<number[]>([])
  const dispatch = useDispatch()

  const removeTrackAndWaypoints = useCallback(() => {
    if (!myVRProvider) return
    myVRProvider.execute(
      removeTrack(trackIdRef.current),
      removePolygonTracks(trackIdRef.current, internalIdsRef.current),
      removeWaypoints(trackIdRef.current, waypointsLength.current + 1)
    )
  }, [myVRProvider])

  const drawOnlyWaypoints = useCallback(
    (wpLength: number, points: Position3D[], isPolygon: boolean) => {
      if (!myVRProvider) return
      myVRProvider.execute(
        removeTrack(trackIdRef.current),
        drawWaypoints(points, trackIdRef.current, wpLength, isPolygon, unit)
      )
    },
    [myVRProvider, unit]
  )

  const drawInternalTracks = useCallback(
    (internal: Path[], selectedInternal: number) => {
      if (!myVRProvider) return
      if (!isAcquisition) {
        myVRProvider.execute(
          removeTrack(trackIdRef.current),
          removePolygonTracks(trackIdRef.current, internalIdsRef.current),
          removeWaypoints(trackIdRef.current, waypointsLength.current + 1)
        )
      }
      myVRProvider.execute(
        drawPolygonTracks(
          internal,
          trackIdRef.current,
          selectedInternal,
          !!selectAllInternalTracks
        )
      )
      internalIdsRef.current = internal.map((i) => i.id || 0)
    },
    [isAcquisition, myVRProvider, selectAllInternalTracks]
  )

  const drawPolygonsShape = useCallback(
    (
      points: Position3D[],
      internal: Path[],
      isSelected: boolean,
      color: string | null
    ) => {
      if (!myVRProvider) return
      const drawFunc = isAcquisition ? drawTrack : drawTrackWithScanRange
      myVRProvider.execute(
        removePolygonTracks(trackIdRef.current, internalIdsRef.current),
        drawFunc(points, trackIdRef.current, {
          selected: isSelected,
          polygon: true,
          color,
          projection,
        }),
        drawWaypoints(points, trackIdRef.current, 0, true, unit)
      )
    },
    [myVRProvider, unit, isAcquisition, projection]
  )

  const drawSinglePath = useCallback(
    (points: Position3D[], isSelected: boolean, currentPolygon: Polygon) => {
      if (!myVRProvider) return
      const drawFunc = isAcquisition ? drawTrack : drawTrackWithScanRange
      const trackLength = isSelected ? length(currentPolygon) : 0
      const wp = wpToPos3D(waypoints(currentPolygon))
      console.info('PolygonFeature: drawing the paths on the map')

      myVRProvider.execute(
        drawFunc(points, trackIdRef.current, {
          selected: isSelected,
          polygon: !!currentPolygon?.isPolygon,
          color: currentPolygon.color || null,
          projection,
        })
      )

      if (isAcquisition) return
      myVRProvider.execute(
        selected
          ? drawWaypoints(
              wp,
              trackIdRef.current,
              trackLength ? trackLength / 1000 : 0,
              !!currentPolygon?.isPolygon,
              unit
            )
          : removeWaypoints(trackIdRef.current, waypointsLength.current + 1)
      )
    },
    [myVRProvider, isAcquisition, projection, selected, unit]
  )

  const getPointsFromAPI = useCallback(
    (points: Position3D[], isSelected: boolean, currentPolygon: Polygon) => {
      if (!currentPolygon) return
      api
        .planningPath(waypoints(currentPolygon))
        .then(({ data }) => {
          // fixes ghost track being displayed if the response comes when it should be hidden
          if (!waypointsLength.current) return () => {}
          drawSinglePath(
            archsToPos3D(arcs(data.polygons[0])),
            isSelected,
            currentPolygon
          )
          return () => {}
        })
        .catch((error) => {
          console.error(error)
          dispatch(
            errorAction(
              new Error(t('planning.errors.arcs', 'Arcs not retrieved'))
            )
          )
        })
    },
    [dispatch, drawSinglePath]
  )

  /** update trackIdRef */
  useEffect(() => {
    const newTrackIdRef = track?.id || track?.temp_id
    if (newTrackIdRef) trackIdRef.current = newTrackIdRef
  }, [track])

  /** draw on track updates */
  useEffect(() => {
    waypointsLength.current = waypoints(track).length || 0
    if (!myVRProvider) return () => {}
    const waypointsAsPoints: Position3D[] = waypoints(track).map((p) => ({
      x: p.longitude,
      y: p.latitude,
    }))
    if (waypointsAsPoints.length === 0) {
      removeTrackAndWaypoints()
    } else if (waypointsAsPoints.length === 1) {
      drawOnlyWaypoints(0, waypointsAsPoints, !!track?.isPolygon)
    } else if (track) {
      if (track.isPolygon) {
        const internal = polygonPaths(track) || []
        if (selected && internal?.length) {
          drawInternalTracks(internal, selectedInternalId)
        } else {
          drawPolygonsShape(
            waypointsAsPoints,
            internal,
            selected,
            track.color || null
          )
        }
      } else {
        if (arcs(track).length) {
          drawSinglePath(archsToPos3D(arcs(track)), selected, track)
          return () => {}
        }
        /** no points from API */
        getPointsFromAPI(waypointsAsPoints, selected, track)
      }
    }
    return () => {
      // disabled because it makes the track flicker
      /* myVRProvider &&
        myVRProvider.execute(
          removeTrack(trackIdRef.current),
          removeWaypoints(trackIdRef.current, waypointsLength.current + 1)
        ) */
    }
  }, [
    track,
    myVRProvider,
    selected,
    selectedInternalId,
    dispatch,
    removeTrackAndWaypoints,
    drawOnlyWaypoints,
    drawInternalTracks,
    drawPolygonsShape,
    drawSinglePath,
    getPointsFromAPI,
  ])

  /** cleanup on unmount */
  useEffect(() => {
    return () => {
      myVRProvider &&
        myVRProvider.execute(
          removeTrack(trackIdRef.current),
          removePolygonTracks(trackIdRef.current, internalIdsRef.current),
          removeWaypoints(trackIdRef.current, waypointsLength.current + 1)
        )
    }
  }, [myVRProvider, trackIdRef, trackId])

  return null
}
