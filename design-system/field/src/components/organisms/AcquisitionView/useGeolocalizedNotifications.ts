import { MyVRProvider } from 'hooks/useMyVRProvider'
import { differenceWith } from 'ramda'
import { useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Position } from 'store/features/position/types'
import { selectAdminSettings } from 'store/features/settings/slice'
import { AdminSettings } from 'store/features/settings/types'
import { selectSystemNotifications } from 'store/features/system/slice'
import {
  SystemNotification,
  SystemNotificationType,
} from 'store/features/system/types'
import { addMarkerAtPosition } from 'utils/myVR/acquisition/drawing'

const getNotificationGroup = (
  type: SystemNotificationType
): 'warning' | 'error' => {
  switch (type) {
    case SystemNotificationType.ERROR:
      return 'error'
    case SystemNotificationType.WARNING:
      return 'warning'
    default:
      return 'warning'
  }
}

/**
 * Hook that handles drawing polygons
 * @returns [IClickableOption[], number]
 */
const useGeolocalizedNotifications = (myVRProvider?: MyVRProvider): [] => {
  const notifications = useSelector(selectSystemNotifications)
  const adminSettings = useSelector(selectAdminSettings)
  const adminSettingsRef = useRef<AdminSettings | null>(adminSettings)
  const geoLocalizedNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        if (!n.mapPosition?.latitude) return false
        const isAllowed = [
          SystemNotificationType.ERROR,
          SystemNotificationType.WARNING,
        ].includes(n.type)
        if (!isAllowed) return false
        return true
      }),
    [notifications]
  )
  const renderedNotifications = useRef<SystemNotification[]>([])

  useEffect(() => {
    if (!myVRProvider) return
    if (adminSettingsRef.current?.disableFeatures) return
    const cmp = (x: SystemNotification, y: SystemNotification) =>
      x.mapPosition?.latitude === y.mapPosition?.latitude &&
      x.mapPosition?.longitude === y.mapPosition?.longitude &&
      x.mapPosition?.displayheight === y.mapPosition?.displayheight
    const toRender = differenceWith(
      cmp,
      geoLocalizedNotifications,
      renderedNotifications.current
    )
    toRender.forEach((n, i) => {
      const group = getNotificationGroup(n.type)
      if (!n.mapPosition) return
      const pos = {
        latitude: n.mapPosition.latitude,
        longitude: n.mapPosition.longitude,
        height: n.mapPosition?.displayheight,
      } as Position
      myVRProvider.execute(
        addMarkerAtPosition(
          group,
          pos,
          renderedNotifications.current.length + i
        )
      )
    })
    renderedNotifications.current = geoLocalizedNotifications
  }, [myVRProvider, geoLocalizedNotifications])

  return []
}
export default useGeolocalizedNotifications
