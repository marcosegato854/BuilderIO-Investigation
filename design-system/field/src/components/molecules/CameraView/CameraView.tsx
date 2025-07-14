import { Camera } from 'components/atoms/Camera/Camera'
import React, { FC, PropsWithChildren, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectActiveCameraGroups } from 'store/features/camera/slice'
import { CameraDetails } from 'store/features/camera/types'
import { selectCameraZoom } from 'store/features/position/slice'
import { getCameraId, translateCameraName } from 'utils/camera'
import style from './CameraView.module.scss'

export interface ICameraViewProps {
  currentGroupIndex?: number
  leftCameraOrientation?: 'landscape' | 'portrait' | undefined
  rightCameraOrientation?: 'landscape' | 'portrait' | undefined
}

/**
 * CameraView description
 */
export const CameraView: FC<ICameraViewProps> = ({
  currentGroupIndex = 0,
  leftCameraOrientation,
  rightCameraOrientation,
}: PropsWithChildren<ICameraViewProps>) => {
  const cameraGroups = useSelector(selectActiveCameraGroups)
  const cameraZoom = useSelector(selectCameraZoom)
  const currentGroup = useMemo(
    () => cameraGroups[currentGroupIndex],
    [currentGroupIndex, cameraGroups]
  )
  const cameras: CameraDetails[] = useMemo(() => {
    if (!currentGroup) return []
    return currentGroup.cameras
  }, [currentGroup])
  return (
    <div className={style.container} data-testid="camera-view">
      {cameras.map((camera, index) => {
        const singleAlign = 'Center'
        const doubleAlign = index === 0 ? 'Right' : 'Left'
        const align = cameras.length > 1 ? doubleAlign : singleAlign
        const translatedCamera = translateCameraName(
          currentGroup,
          camera,
          leftCameraOrientation,
          rightCameraOrientation
        )
        return (
          <div className={style.camera} key={`${camera.name}`}>
            <Camera
              socketEndpoint={`/camera/${getCameraId(camera)}`}
              fitMode="Cover"
              align={align}
              zoom={cameraZoom}
            />
            <div className={style.cameraName}>{translatedCamera}</div>
          </div>
        )
      })}
    </div>
  )
}
// CameraView.whyDidYouRender = true
