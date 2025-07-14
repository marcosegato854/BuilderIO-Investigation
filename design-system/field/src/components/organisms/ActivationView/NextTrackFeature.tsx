import { MyVRProvider } from 'hooks/useMyVRProvider'
import { curry } from 'ramda'
import { FC, useEffect, useMemo, useRef } from 'react'
import { Polygon } from 'store/features/planning/types'
import { Position } from 'store/features/position/types'
import {
  addMarkerAtPosition,
  removeIconGroup,
} from 'utils/myVR/acquisition/drawing'
import { enc } from 'utils/myVR/helpers'
import { drawNextTrack } from 'utils/myVR/planning/tracks'
import { Layers } from 'utils/myVR/types'
import { arcs, waypoints } from 'utils/planning/polygonHelpers'
import { archsToPos3D } from 'utils/planning/typeConversions'

export interface INextTrackFeatureProps {
  /**
   * Polygon
   */
  track: Polygon | null
  /**
   * MyVR Provider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * Current acquisition track path ID
   */
  currentTrackId?: number
  /**
   * If it's the next highlight track
   */
  isHighlight?: boolean
}

export const removeTrack = curry((trackLineID: number, myVR: MyVR): MyVR => {
  const tracklineCommands = [
    {
      command: 'removeObject',
      composite: 1,
      layer: Layers.NEXT_TRACK,
      id: trackLineID,
    },
  ]
  myVR.execute(enc(tracklineCommands))

  return myVR
})

export const NextTrackFeature: FC<INextTrackFeatureProps> = ({
  track,
  myVRProvider,
  currentTrackId,
  isHighlight,
}: INextTrackFeatureProps) => {
  const trackIDRef = useRef<number>(-1)
  const groupName = useMemo(() => {
    return isHighlight ? 'nextHighlight' : 'next'
  }, [isHighlight])

  useEffect(() => {
    if (!myVRProvider) return
    if (!track) return
    trackIDRef.current = track.paths[0].id!
    const wp = waypoints(track)
    const [start, stop] = [wp[0], wp[wp.length - 1]]
    const startPosition = {
      latitude: start.latitude,
      longitude: start.longitude,
      height: start.height,
    } as Position
    const stopPosition = {
      latitude: stop.latitude,
      longitude: stop.longitude,
      height: stop.height,
    } as Position

    myVRProvider.execute(
      drawNextTrack(archsToPos3D(arcs(track)), track.id!, track.color || null),
      addMarkerAtPosition(
        `${groupName}Start`,
        startPosition,
        isHighlight ? 1525 : 1523
      ),
      addMarkerAtPosition(
        `${groupName}End`,
        stopPosition,
        isHighlight ? 1526 : 1524
      )
    )

    return () => {
      myVRProvider &&
        myVRProvider.execute(
          removeTrack(track.id!),
          removeIconGroup(`${groupName}Start`),
          removeIconGroup(`${groupName}End`)
        )
    }
  }, [groupName, isHighlight, myVRProvider, track])

  useEffect(() => {
    if (!myVRProvider) return
    if (!currentTrackId) return
    if (currentTrackId === trackIDRef.current) {
      myVRProvider.execute(removeIconGroup(`${groupName}Start`))
    }
  }, [currentTrackId, groupName, isHighlight, myVRProvider])

  return null
}
