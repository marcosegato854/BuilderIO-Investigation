/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { FC, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Waypoint } from 'store/features/planning/types'
import {
  addMarkerAtPosition,
  removeIconGroup,
} from 'utils/myVR/acquisition/drawing'

export interface ISingleIconProps {
  /**
   * Coordinate
   */
  coord: Waypoint | null
  /**
   * Group
   */
  group: string | null
  /**
   * Trackline id
   */
  tracklineId: number
  /**
   * MyVR Provider instance
   */
  myVRProvider?: MyVRProvider
}

/**
 * Shows the map with controls and toolbars when the system is activated
 */
export const SingleIcon: FC<ISingleIconProps> = ({
  myVRProvider,
  coord,
  group,
  tracklineId,
}: ISingleIconProps) => {
  const dispatch = useDispatch()

  /** draw on polygon updates */
  useEffect(() => {
    if (!myVRProvider) return () => {}
    if (!group) return () => {}
    if (coord) {
      myVRProvider.execute(
        addMarkerAtPosition(
          group,
          {
            longitude: coord.longitude,
            latitude: coord.latitude,
            height: coord.height || 0,
            displayheight: coord.height || 0,
          },
          tracklineId || 10
        )
      )
    } else {
      myVRProvider.execute(removeIconGroup(group))
    }
    return () => {}
  }, [myVRProvider, coord, group, dispatch, tracklineId])

  /** cleanup on unmount */
  useEffect(() => {
    return () => {}
  }, [myVRProvider])

  return null
}
