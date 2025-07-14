import { MyVRProvider } from 'hooks/useMyVRProvider'
import { MutableRefObject, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectPosition } from 'store/features/position/slice'
import {
  Position as PositionType,
  PositionNotification,
} from 'store/features/position/types'
import { selectAdminSettings } from 'store/features/settings/slice'
import { AdminSettings } from 'store/features/settings/types'
import { selectSystemState } from 'store/features/system/slice'
import { ActivationStatus } from 'store/features/system/types'
import { addMarkerAtPosition } from 'utils/myVR/acquisition/drawing'
import { getPointFromPositionNotification as getPointFromNotification } from 'utils/myVR/helpers'

/**
 * Hook that handles drawing polygons
 * @returns [IClickableOption[], number]
 */
const useRecordingMarkers = (
  myVRProvider: MyVRProvider | null | undefined,
  tracklLineIdRef: MutableRefObject<number | null>
): [] => {
  const systemState = useSelector(selectSystemState)
  const systemStateRefStart = useRef<ActivationStatus>()
  const systemStateRefEnd = useRef<ActivationStatus>()
  const lastPositionRef = useRef<PositionNotification | null>(null)
  const position = useSelector(selectPosition)
  const adminSettings = useSelector(selectAdminSettings)
  const adminSettingsRef = useRef<AdminSettings | null>(adminSettings)

  useEffect(() => {
    lastPositionRef.current = position
  }, [position])

  /**
   * add start marker
   */
  useEffect(() => {
    if (!lastPositionRef.current) return
    if (adminSettingsRef.current?.disableFeatures) return
    if (myVRProvider) {
      const prevState = systemStateRefStart.current
      const currentState = systemState?.state
      const shouldDropMarker =
        currentState === 'Recording' && prevState === 'StartingRecording'
      // TODO: maybe we can remove these logs if there are no more bugs
      console.info(
        `[MARKERS] START prevState: ${prevState} currentState: ${currentState} tracklineID: ${tracklLineIdRef.current} shouldDropMarker=${shouldDropMarker}`
      )
      if (shouldDropMarker) {
        const { current: tracklineID } = tracklLineIdRef
        if (tracklineID !== null) {
          const lastPoint = getPointFromNotification(lastPositionRef.current)
          const carPosition = {
            latitude: lastPoint.latitude,
            longitude: lastPoint.longitude,
            height: lastPoint.height,
          } as PositionType
          myVRProvider.execute(
            addMarkerAtPosition('start', carPosition, tracklineID)
          )
          console.info('[MARKERS] added start marker')
        }
      }
    }
    systemStateRefStart.current = systemState?.state
  }, [myVRProvider, tracklLineIdRef, systemState])

  /**
   * add end marker
   */
  useEffect(() => {
    if (!lastPositionRef.current) return
    if (adminSettingsRef.current?.disableFeatures) return
    if (myVRProvider) {
      const prevState = systemStateRefEnd.current
      const currentState = systemState?.state
      const shouldDropMarker =
        currentState === 'Logging' && prevState === 'StoppingRecording'
      // TODO: maybe we can remove these logs if there are no more bugs
      console.info(
        `[MARKERS] END prevState: ${prevState} currentState: ${currentState} tracklineID: ${tracklLineIdRef.current} shouldDropMarker=${shouldDropMarker}`
      )
      if (shouldDropMarker) {
        const { current: tracklineID } = tracklLineIdRef
        if (tracklineID !== null) {
          const lastPoint = getPointFromNotification(lastPositionRef.current)
          const carPosition = {
            latitude: lastPoint.latitude,
            longitude: lastPoint.longitude,
            height: lastPoint.height,
          } as PositionType
          myVRProvider.execute(
            addMarkerAtPosition('end', carPosition, tracklineID)
          )
          console.info('[MARKERS] added end marker')
        }
      }
    }
    systemStateRefEnd.current = systemState?.state
  }, [myVRProvider, tracklLineIdRef, systemState])

  return []
}
export default useRecordingMarkers
