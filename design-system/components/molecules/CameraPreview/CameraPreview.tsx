import React, {
  FC,
  PropsWithChildren,
  useRef,
  useState,
  MouseEvent,
} from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import { SingleTool } from 'components/atoms/SingleTool/SingleTool'
import { Fade, Grid, Popover } from '@mui/material'
import { Camera } from 'components/atoms/Camera/Camera'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { selectActiveCameraGroups } from 'store/features/camera/slice'
import { getCameraId, translateCameraName } from 'utils/camera'
import style from 'components/molecules/CameraPreview/CameraPreview.module.scss'

export interface ICameraPreviewProps {
  onSwitchCamera?: (index: number) => void
  currentGroupIndex?: number
  leftCameraOrientation?: 'landscape' | 'portrait' | undefined
  rightCameraOrientation?: 'landscape' | 'portrait' | undefined
}

/**
 * CameraPreview description
 */
export const CameraPreview: FC<ICameraPreviewProps> = ({
  onSwitchCamera,
  currentGroupIndex = 0,
  leftCameraOrientation,
  rightCameraOrientation,
}: PropsWithChildren<ICameraPreviewProps>) => {
  const cameraGroups = useSelector(selectActiveCameraGroups)
  const [expanded, setExpanded] = useState<boolean>(false)
  const container = useRef<HTMLDivElement>(null)
  const buttonClickHandler = () => {
    setExpanded(!expanded)
  }
  const switchHandler = (e: MouseEvent<HTMLDivElement>) => {
    onSwitchCamera &&
      onSwitchCamera(Number(e.currentTarget.getAttribute('data-index')))
  }
  return (
    <div className={style.container} ref={container}>
      {expanded || (
        <SingleTool
          icon={<Icon name="ExpandCameras" />}
          // tooltipMessage={t('acquisition.tooltips.map_mode', 'Map')}
          onClick={buttonClickHandler}
          // selected={activeIcons.includes('map_mode')}
          // transparent
        />
      )}
      <Popover
        open={!!expanded}
        anchorEl={container.current}
        // keepMounted
        // onClose={buttonClickHandler}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        TransitionComponent={Fade}
        hideBackdrop={true}
        disablePortal={true}
        sx={{ zIndex: 0 }}
      >
        <div className={style.cameraList}>
          <div className={style.header}>
            <div>Cameras</div>
            <Icon name="Close" onClick={buttonClickHandler} />
          </div>
          <div
            className={classNames({
              [style.scrollable]: true,
              [style.customizedGrid]: true,
            })}
          >
            {cameraGroups.map((group, index) => {
              const { cameras } = group
              return (
                <Grid
                  container
                  onClick={switchHandler}
                  data-index={index}
                  data-selected={currentGroupIndex === index}
                  spacing={1}
                  key={group.name}
                >
                  {cameras.map((camera, i) => {
                    const singleAlign = 'Center'
                    const doubleAlign = i === 0 ? 'Right' : 'Left'
                    const align = cameras.length > 1 ? doubleAlign : singleAlign
                    const translatedCamera = translateCameraName(
                      group,
                      camera,
                      leftCameraOrientation,
                      rightCameraOrientation
                    )
                    return (
                      <Grid item xs key={camera.name}>
                        <div className={style.cameraWrapper}>
                          <Camera
                            fitMode="Cover"
                            align={align}
                            socketEndpoint={`/camera/${getCameraId(camera)}`}
                          />
                          <div className={style.name}>{translatedCamera}</div>
                        </div>
                      </Grid>
                    )
                  })}
                </Grid>
              )
            })}
          </div>
        </div>
      </Popover>
    </div>
  )
}
