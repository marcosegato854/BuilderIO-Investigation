/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { selectAlignmentSocketConnected } from 'store/features/alignment/slice'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import { selectPointCloudConnected } from 'store/features/pointcloud/slice'
import { selectPositionSocketConnected } from 'store/features/position/slice'
import { selectRoutingSocketConnected } from 'store/features/routing/slice'
import {
  selectNotificationsSocketConnected,
  selectStateSocketConnected,
} from 'store/features/system/slice'
import { getSectionFromPathname } from 'utils/strings'

/**
 * Hook that checks for socket connection
 * and returns a boolean value
 * (true means there's at least 1 socket down)
 * @returns boolean
 */

const useIsSocketConnectionDown = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathname = useSelector((state: any) => state.router.location.pathname)
  const section = getSectionFromPathname(pathname)
  const isAcquisition = section === 'acquisition'
  const socketDownRef = useRef<boolean>(false)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const { planned } = currentJob || {}

  const routing = useSelector(selectRoutingSocketConnected)
  const position = useSelector(selectPositionSocketConnected)
  const alignment = useSelector(selectAlignmentSocketConnected)
  const pointcloud = useSelector(selectPointCloudConnected)
  const state = useSelector(selectStateSocketConnected)
  const notifications = useSelector(selectNotificationsSocketConnected)

  const socket: boolean[] = useMemo(() => {
    if (isAcquisition && planned)
      return [routing, position, alignment, pointcloud, state, notifications]
    if (isAcquisition)
      return [position, alignment, pointcloud, state, notifications]
    return [state, notifications]
  }, [
    alignment,
    isAcquisition,
    notifications,
    planned,
    pointcloud,
    position,
    routing,
    state,
  ])

  useEffect(() => {
    const isASocketDown = socket?.some((key) => key === false)
    socketDownRef.current = isASocketDown
  }, [socket])

  return socketDownRef.current
}

export default useIsSocketConnectionDown
