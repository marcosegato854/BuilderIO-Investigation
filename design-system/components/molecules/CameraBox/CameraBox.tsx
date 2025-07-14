import React, { FC, PropsWithChildren } from 'react'
import { Camera } from 'components/atoms/Camera/Camera'
import style from './CameraBox.module.scss'

export interface ICameraBoxProps {
  socketEndpoints: string[]
}

/**
 * CameraBox description
 */
export const CameraBox: FC<ICameraBoxProps> = ({
  socketEndpoints,
}: PropsWithChildren<ICameraBoxProps>) => {
  return (
    <div className={style.cameraBox}>
      {socketEndpoints.map((socketEndpoint) => {
        return (
          <div key={`index-${socketEndpoint}`} className={style.box}>
            <Camera socketEndpoint={socketEndpoint} />
            <div className={style.label}>{socketEndpoint}</div>
          </div>
        )
      })}
    </div>
  )
}
