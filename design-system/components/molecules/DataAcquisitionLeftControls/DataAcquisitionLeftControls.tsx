/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Icon } from 'components/atoms/Icon/Icon'
import { SatelliteButton } from 'components/atoms/SatelliteButton/SatelliteButton'
import { SingleTool } from 'components/atoms/SingleTool/SingleTool'
import { Tool, Tools } from 'components/atoms/Tools/Tools'
import { Zooming } from 'components/atoms/Zooming/Zooming'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import {
  cameraViewZoomAction,
  mapModeAction,
  mapNavigationModeAction,
  mapPanningModeAction,
  mapViewAction,
  selectCameraZoom,
  selectMapMode,
  selectNavigationMode,
  selectPanningMode,
  selectPlanTracksVisible,
  selectPointcloudActive,
} from 'store/features/position/slice'
import {
  MapNavigationMode,
  MapPanningMode,
  ViewMode,
} from 'store/features/position/types'
import { setMapMode } from 'utils/myVR/common/mapMode'
import {
  fitCoveredFeatures,
  fitHSPCLayer,
  setZoom,
} from 'utils/myVR/common/zoom'
import { fitPlanningFeatures } from 'utils/myVR/planning/layers'
import { MapMode, MapView } from 'utils/myVR/types'

import { selectSystemInfo } from 'store/features/system/slice'
import { MapsCountry, TileProvider } from 'store/features/system/types'
import style from './DataAcquisitionLeftControls.module.scss'
import {
  selectPointCloudProjection,
  selectPointcloudModule,
} from 'store/features/pointcloud/slice'

export interface IDataAcquisitionLeftControlsProps {
  /**
   * viewMode
   */
  viewMode?: ViewMode
  /**
   * myVRProvider instance
   */
  myVRProvider?: MyVRProvider
}

/**
 * DataAcquisitionLeftControls description
 */
// type removed to make it work with forwarded refs
// export const DataAcquisitionLeftControls: FC<IDataAcquisitionLeftControlsProps> = forwardRef<
export const DataAcquisitionLeftControls = forwardRef<
  SVGSVGElement,
  IDataAcquisitionLeftControlsProps
>(({ myVRProvider, viewMode }: IDataAcquisitionLeftControlsProps, arrowRef) => {
  const mode = useSelector(selectMapMode)
  const [satellite, setSatellite] = useState<boolean>(false)
  const dispatch = useDispatch()
  const navigationMode = useSelector(selectNavigationMode)
  const panningMode = useSelector(selectPanningMode)
  const cameraZoom = useSelector(selectCameraZoom)
  const cameraZoomRef = useRef<number>(cameraZoom)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const { planned } = currentJob || {}
  const isMap = viewMode === ViewMode.MAP
  const systemInfo = useSelector(selectSystemInfo)
  const mapsCountry = systemInfo?.countryCode
  const tileProvider = systemInfo?.maps?.tileProvider
  const planVisible = useSelector(selectPlanTracksVisible)
  const pointCloudActive = useSelector(selectPointcloudActive)
  const pointCloudModule = useSelector(selectPointcloudModule)
  const projection = useSelector(selectPointCloudProjection)

  const pointCloudDisplayed = pointCloudActive && pointCloudModule

  const expandZoomHandler = () => {
    let to: NodeJS.Timeout
    const cleanup = () => {
      if (to) clearTimeout(to)
    }
    cleanup()

    dispatch(mapPanningModeAction(MapPanningMode.FREE))
    dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
    // wait for the map movement to stop, otherwise it interferes with the zoom
    if (planned && planVisible) {
      console.info(
        `[ACQUISITION] [USER_ACTION] user asked to fit planning features. Planned: ${planned} / Visible: ${planVisible}`
      )
      to = setTimeout(() => {
        if (myVRProvider) {
          try {
            myVRProvider.execute(fitPlanningFeatures)
          } catch (error) {
            console.error(error)
          }
        }
      }, 200)
      return cleanup
    }
    // TODO: not working
    // if (planned && pointCloudActive) {
    //   console.info(
    //     `[ACQUISITION] [USER_ACTION] user asked to fit the pointcloud`
    //   )
    //   to = setTimeout(() => {
    //     if (myVRProvider) {
    //       try {
    //         myVRProvider.execute(fitPointCloud)
    //       } catch (error) {
    //         console.error(error)
    //       }
    //     }
    //   }, 200)
    //   return cleanup
    // }
    console.info(
      `[ACQUISITION] [USER_ACTION] user asked to fit covered features`
    )
    const fitFunc = pointCloudDisplayed
      ? fitHSPCLayer(projection || '4326')
      : fitCoveredFeatures
    // to = setTimeout(() => {
    if (myVRProvider) {
      try {
        myVRProvider.execute(fitFunc)
      } catch (error) {
        console.error(error)
      }
    }
    // }, 200)
    return cleanup
  }

  const zoomOutHandler = useCallback(() => {
    if (isMap) return myVRProvider && myVRProvider.execute(setZoom('zoomOut'))
    if (cameraZoomRef.current === 0) return null
    cameraZoomRef.current -= 1
    return dispatch(cameraViewZoomAction(cameraZoomRef.current))
  }, [myVRProvider, isMap, dispatch])

  const zoominHandler = useCallback(() => {
    if (isMap) return myVRProvider && myVRProvider.execute(setZoom('zoomIn'))
    if (cameraZoomRef.current === 50) return null
    cameraZoomRef.current += 1
    return dispatch(cameraViewZoomAction(cameraZoomRef.current))
  }, [myVRProvider, isMap, dispatch])

  /**
   * reset for camera change
   */
  useEffect(() => {
    cameraZoomRef.current = cameraZoom
  }, [cameraZoom])

  const alignHandler = () => {
    if (navigationMode === MapNavigationMode.FOLLOW) {
      dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
      return
    }
    dispatch(mapNavigationModeAction(MapNavigationMode.FOLLOW))
  }

  const modeHandler = () => {
    if (mode === MapMode.MAP_2D) {
      dispatch(mapModeAction(MapMode.MAP_3D))
      dispatch(mapNavigationModeAction(MapNavigationMode.FOLLOW))
    } else {
      dispatch(mapModeAction(MapMode.MAP_2D))
      dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
    }
  }

  const currentPositionHandler = useCallback(() => {
    if (panningMode === MapPanningMode.FREE) {
      dispatch(mapPanningModeAction(MapPanningMode.LOCKED))
      return
    }
    dispatch(mapPanningModeAction(MapPanningMode.FREE))
  }, [panningMode, dispatch])

  const satelliteHandler = () => {
    setSatellite(!satellite)
  }

  const selectedTools: Tool[] = useMemo(() => {
    return panningMode === MapPanningMode.LOCKED ? ['second'] : []
  }, [panningMode])

  const ModeIcon = useMemo(() => {
    return mode === MapMode.MAP_2D ? (
      <Icon name="Letter3D" />
    ) : (
      <Icon name="Letter2D" />
    )
  }, [mode])

  const canViewSatellite = useMemo(
    () =>
      !!mapsCountry &&
      tileProvider !== TileProvider.OPENSTREETMAP &&
      [
        MapsCountry.INTERNATIONAL,
        MapsCountry.SOUTH_KOREA,
        MapsCountry.JAPAN,
      ].includes(mapsCountry),
    [mapsCountry, tileProvider]
  )

  /**
   * force locked mode on load
   */
  useEffect(() => {
    dispatch(mapPanningModeAction(MapPanningMode.LOCKED))
  }, [dispatch])

  /**
   * handle map mode with local state
   */
  useLayoutEffect(() => {
    myVRProvider && myVRProvider.execute(setMapMode(mode))
  }, [mode, myVRProvider])

  /**
   * handle map tile mode with local state
   */
  useLayoutEffect(() => {
    if (!myVRProvider) return
    satellite
      ? dispatch(mapViewAction(MapView.SATELLITE))
      : dispatch(mapViewAction(MapView.THEME))
  }, [satellite, myVRProvider, dispatch])

  return (
    <div className={style.controls}>
      <div className={style.left}>
        {isMap && (
          <SingleTool
            icon={<Icon name="ExpandZoom" />}
            onClick={expandZoomHandler}
            // disabled={!planned}
          />
        )}
        <Zooming onMinusClick={zoomOutHandler} onPlusClick={zoominHandler} />
        {isMap && (
          <SingleTool
            icon={<Icon name="TowardsNorth" ref={arrowRef} />}
            onClick={alignHandler}
            selected={navigationMode === MapNavigationMode.FOLLOW}
          />
        )}
      </div>
      {isMap && (
        <div className={style.right}>
          {canViewSatellite && (
            <SatelliteButton satellite={satellite} onClick={satelliteHandler} />
          )}
          <Tools
            leftIcon={ModeIcon}
            rightIcon={<Icon name="CurrentPosition" />}
            onLeftClick={modeHandler}
            onRightClick={currentPositionHandler}
            selected={selectedTools}
          />
        </div>
      )}
    </div>
  )
})
