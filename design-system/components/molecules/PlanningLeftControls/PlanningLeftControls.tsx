/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { SingleTool } from 'components/atoms/SingleTool/SingleTool'
import { Zooming } from 'components/atoms/Zooming/Zooming'
import { Tools } from 'components/atoms/Tools/Tools'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { setZoom } from 'utils/myVR/common/zoom'
import { MapMode, MapView } from 'utils/myVR/types'
import { setMapMode } from 'utils/myVR/common/mapMode'
import { useDispatch, useSelector } from 'react-redux'
import {
  mapNavigationModeAction,
  selectPosition,
} from 'store/features/position/slice'
import { MapNavigationMode } from 'store/features/position/types'
import {
  mapModeAction,
  redoAction,
  selectCurrentPolygon,
  selectMapMode,
  selectRedoAvailable,
  selectTool,
  selectPolygons,
  selectUndoAvailable,
  toolAction,
  undoAction,
  selectcurrentInternalPathId,
  mapViewAction,
  currentPolygonAction,
} from 'store/features/planning/slice'
import { SatelliteButton } from 'components/atoms/SatelliteButton/SatelliteButton'
import { fitPlanningFeatures } from 'utils/myVR/planning/layers'
import { PlanningActions, PlanningTools } from 'store/features/planning/types'
import useGeolocationRef from 'hooks/useGeolocationRef'
import { Icon } from 'components/atoms/Icon/Icon'
import { setPosition } from 'utils/myVR/common/position'
import { selectSystemInfo } from 'store/features/system/slice'
import { MapsCountry } from 'store/features/system/types'
import style from './PlanningLeftControls.module.scss'
import { Toolbox } from '../Toolbox/Toolbox'

export interface IPlanningLeftControlsProps {
  /**
   * myVRProvider instance
   */
  myVRProvider?: MyVRProvider
}

/**
 * PlanningLeftControls description
 */
export const PlanningLeftControls: FC<IPlanningLeftControlsProps> = ({
  myVRProvider,
}: PropsWithChildren<IPlanningLeftControlsProps>) => {
  const [satellite, setSatellite] = useState<boolean>(false)
  const mode = useSelector(selectMapMode)
  const position = useSelector(selectPosition)
  const dispatch = useDispatch()
  const tool = useSelector(selectTool)
  const currentTrack = useSelector(selectCurrentPolygon)
  const currentInternalTrackId = useSelector(selectcurrentInternalPathId)
  const undoAvailable = useSelector(selectUndoAvailable)
  const redoAvailable = useSelector(selectRedoAvailable)
  const tracks = useSelector(selectPolygons)
  const [userPositionRef, geolocation] = useGeolocationRef()
  const systemInfo = useSelector(selectSystemInfo)
  const mapsCountry = systemInfo?.countryCode

  const disabledTools = useMemo(() => {
    const canCutTrack =
      (currentTrack && !currentTrack.isPolygon) || currentInternalTrackId >= 0
    const canMovePoint = currentTrack && !currentTrack.isPolygon
    const cutTrackTools = canCutTrack
      ? []
      : [PlanningTools.CUT, PlanningTools.CUT_INTERNAL]
    const movePointTools = canMovePoint ? [] : [PlanningTools.MOVE_POINT]
    const undoTools = undoAvailable ? [] : [PlanningActions.UNDO]
    const redoTools = redoAvailable ? [] : [PlanningActions.REDO]
    return [...cutTrackTools, ...movePointTools, ...undoTools, ...redoTools]
  }, [currentTrack, undoAvailable, redoAvailable, currentInternalTrackId])

  const centerMapEnabled: boolean = useMemo(() => {
    if (!position && !geolocation) return false
    if (position) {
      const {
        position: { map },
      } = position
      if (map) {
        return true
      }
    }
    if (geolocation?.latitude) {
      return true
    }
    return false
  }, [position, geolocation])

  const zoomOutHandler = useCallback(
    () => myVRProvider && myVRProvider.execute(setZoom('zoomOut')),
    [myVRProvider]
  )
  const zoominHandler = useCallback(
    () => myVRProvider && myVRProvider.execute(setZoom('zoomIn')),
    [myVRProvider]
  )
  const toolSelectHandler = (newTool: PlanningTools) => {
    if (newTool === tool) {
      dispatch(toolAction(PlanningTools.SELECT))
      return
    }
    dispatch(toolAction(newTool))
    if ([PlanningTools.DELETE_POLYGON].includes(newTool)) {
      dispatch(currentPolygonAction(-1))
    }
  }
  const toolActionHandler = (action: PlanningActions) => {
    if (action === PlanningActions.UNDO) {
      dispatch(undoAction())
    } else {
      dispatch(redoAction())
    }
  }
  const showAllHandler = () => {
    if (myVRProvider) {
      myVRProvider.execute(fitPlanningFeatures)
    }
  }
  const modeHandler = () => {
    if (mode === MapMode.MAP_2D) {
      dispatch(mapModeAction(MapMode.MAP_3D))
    } else {
      dispatch(mapModeAction(MapMode.MAP_2D))
      dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
    }
  }
  const satelliteHandler = () => {
    setSatellite(!satellite)
  }

  const currentPositionHandler = () => {
    if (position) {
      const {
        position: { map },
      } = position
      if (map) {
        const coords = map
        const point = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          height: coords.displayheight,
        }
        myVRProvider?.execute(setPosition(point, null))
        return
      }
    }
    if (userPositionRef.current?.latitude) {
      const point = {
        latitude: userPositionRef.current.latitude,
        longitude: userPositionRef.current.longitude,
      }
      myVRProvider?.execute(setPosition(point, null))
    }
  }

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
      [
        MapsCountry.INTERNATIONAL,
        MapsCountry.SOUTH_KOREA,
        MapsCountry.JAPAN,
      ].includes(mapsCountry),
    [mapsCountry]
  )

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
  }, [satellite, dispatch, myVRProvider])

  return (
    <div className={style.controls}>
      <div className={style.left}>
        <Toolbox
          onSelect={toolSelectHandler}
          onAction={toolActionHandler}
          selected={tool}
          disabled={disabledTools}
        />
        <Zooming onMinusClick={zoomOutHandler} onPlusClick={zoominHandler} />
        <SingleTool
          icon={<Icon name="ExpandZoom" />}
          onClick={showAllHandler}
          disabled={tracks.length <= 0}
        />
      </div>
      <div className={style.right}>
        {canViewSatellite && (
          <SatelliteButton satellite={satellite} onClick={satelliteHandler} />
        )}
        <Tools
          leftIcon={ModeIcon}
          rightIcon={<Icon name="CurrentPosition" />}
          onLeftClick={modeHandler}
          onRightClick={currentPositionHandler}
          disabled={centerMapEnabled ? [] : ['second']}
        />
      </div>
    </div>
  )
}
