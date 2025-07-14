import useGeolocalizedNotifications from 'components/organisms/AcquisitionView/useGeolocalizedNotifications'
import useRecordingMarkers from 'components/organisms/AcquisitionView/useRecordingMarkers'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { FC, PropsWithChildren, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import {
  selectRecordingStatus,
  selectStopRecordingStatus,
} from 'store/features/actions/slice'
import { selectPointCloudProjection } from 'store/features/pointcloud/slice'
import {
  selectCameraHeight,
  selectNavigationMode,
  selectPanningMode,
  selectPosition,
} from 'store/features/position/slice'
import {
  MapNavigationMode,
  MapPanningMode,
  PositionNotification,
} from 'store/features/position/types'
import { selectAdminSettings } from 'store/features/settings/slice'
import { AdminSettings } from 'store/features/settings/types'
import { setCarPosition } from 'utils/myVR/acquisition/car'
import {
  addPointToTrack,
  drawTrackSegment,
} from 'utils/myVR/acquisition/drawing'
import { setPosition } from 'utils/myVR/common/position'
import {
  getPointFromPositionNotification as getPointFromNotification,
  snapToGround,
} from 'utils/myVR/helpers'

export interface IAcquisitionPositionFeaturesProps {
  /**
   * myVRProvider instance
   */
  myVRProvider?: MyVRProvider
}

/**
 * Wraps myVR Features without visual React components, to minimize the impact of rerenders on socket updates
 */
export const AcquisitionPositionFeatures: FC<IAcquisitionPositionFeaturesProps> =
  ({ myVRProvider }: PropsWithChildren<IAcquisitionPositionFeaturesProps>) => {
    const zAtCenter = useRef<number>(0)
    const firstDrawingRef = useRef<boolean>(true)
    const follow = useRef<boolean>(true)
    const lastPositionRef = useRef<PositionNotification | null>(null)
    const recordingStatus = useSelector(selectRecordingStatus)
    const stopRecordingStatus = useSelector(selectStopRecordingStatus)
    const panningMode = useSelector(selectPanningMode)
    const position = useSelector(selectPosition)
    const tracklLineIdRef = useRef<number>(0)
    const navigationMode = useSelector(selectNavigationMode)
    const cameraHeight = useSelector(selectCameraHeight)
    useGeolocalizedNotifications(myVRProvider)
    useRecordingMarkers(myVRProvider, tracklLineIdRef)
    const projection = useSelector(selectPointCloudProjection)
    const adminSettings = useSelector(selectAdminSettings)
    const adminSettingsRef = useRef<AdminSettings | null>(adminSettings)

    const rtkOn = position?.rtkenabled

    /** change follow mode without rerender */
    useEffect(() => {
      follow.current = navigationMode === MapNavigationMode.FOLLOW
    }, [navigationMode])

    // TODO: this could go on a custom hook
    /** move the map with the info from socket */
    useEffect(() => {
      if (myVRProvider && position) {
        const {
          position: { map, attitude },
        } = position
        if (map) {
          const coords = map
          if (!coords.latitude) return
          if (!attitude) return
          // TODO: move this inside the function
          const height = snapToGround()
            ? zAtCenter.current || coords.displayheight
            : coords.displayheight
          const point = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            height,
          }
          // console.info(
          //   `[MYVR] move ${panningMode} to ${coords.latitude},${coords.longitude},${coords.height}`
          // )
          if (panningMode === MapPanningMode.FREE) {
            myVRProvider.execute(
              setCarPosition(point, follow.current, attitude.yaw, cameraHeight)
            )
          } else {
            myVRProvider.execute(
              setPosition(point, null),
              setCarPosition(point, follow.current, attitude.yaw, cameraHeight)
            )
          }
        }
      }
    }, [position, myVRProvider, panningMode, cameraHeight])

    /** draw the track with the info from socket */
    useEffect(() => {
      if (!myVRProvider) return
      if (!position) return
      if (adminSettingsRef.current?.disableFeatures) return
      if (recordingStatus === 'done' || stopRecordingStatus === 'progress') {
        if (lastPositionRef.current) {
          const { current: tracklineID } = tracklLineIdRef
          const { current: firstDrawing } = firstDrawingRef
          // const trackStyle = rtkOn ? String(position.accuracy?.class) : 'neutral'
          const trackStyle = String(position.accuracy?.class)
          // last point
          const { accuracy: lastAccuracy } = lastPositionRef.current
          const lastPoint = getPointFromNotification(lastPositionRef.current)
          // new point
          const point = getPointFromNotification(position)
          if (
            firstDrawing ||
            position.accuracy?.class !== lastAccuracy?.class
          ) {
            /* new track */
            const newTrackLineID = tracklineID + 1
            myVRProvider.execute(
              drawTrackSegment(
                lastPoint,
                point,
                newTrackLineID,
                trackStyle,
                projection
              )
            )
            tracklLineIdRef.current = newTrackLineID
            //
          } else {
            /* add to previous track */
            myVRProvider.execute(addPointToTrack(point, tracklineID))
          }
          firstDrawingRef.current = false
        }
      }
      lastPositionRef.current = position
    }, [
      position,
      myVRProvider,
      recordingStatus,
      stopRecordingStatus,
      rtkOn,
      projection,
    ])

    /** handle firstDrawingRef */
    useEffect(() => {
      if (recordingStatus === 'done' || stopRecordingStatus === 'done') {
        firstDrawingRef.current = true
      }
    }, [stopRecordingStatus, recordingStatus])

    return null
  }
