/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import classNames from 'classnames'
import { FinalAlignmentButton } from 'components/atoms/FinalAlignmentButton/FinalAlignmentButton'
import { HereCopyright } from 'components/atoms/HereCopyright/HereCopyright'
import { Icon } from 'components/atoms/Icon/Icon'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import {
  IMapSearchBarLocation,
  MapSearchBar,
} from 'components/molecules/MapSearchBar/MapSearchBar'
import { PlanningBigTools } from 'components/molecules/PlanningBigTools/PlanningBigTools'
import { PlanningLeftControls } from 'components/molecules/PlanningLeftControls/PlanningLeftControls'
import { PlanningTopLeftControls } from 'components/molecules/PlanningTopLeftControls/PlanningTopLeftControls'
import { PlanningUserHints } from 'components/molecules/PlanningUserHints/PlanningUserHints'
import { SidePanelJobPlanning } from 'components/molecules/SidePanelJobPlanning/SidePanelJobPlanning'
import { Header } from 'components/organisms/Header/Header'
import style from 'components/organisms/PlanningView/PlanningView.module.scss'
import { PolygonFeature } from 'components/organisms/PlanningView/PolygonFeature'
import { SingleIcon } from 'components/organisms/PlanningView/SingleIcon'
import useBusyApi from 'components/organisms/PlanningView/useBusyApi'
import useDeleteIternalPath from 'components/organisms/PlanningView/useDeleteInternalPath'
import useDeletePolygon from 'components/organisms/PlanningView/useDeletePolygon'
import useDeselect from 'components/organisms/PlanningView/useDeselect'
import useDrawPolygon from 'components/organisms/PlanningView/useDrawPolygon'
import useDrawSinglePath from 'components/organisms/PlanningView/useDrawSinglePath'
import useGhostPath from 'components/organisms/PlanningView/useGhostPath'
import useInitialFinalPoint from 'components/organisms/PlanningView/useInitialFinalPoint'
import useInternalSelectionTool from 'components/organisms/PlanningView/useInternalSelectionTool'
import useKeyboard from 'components/organisms/PlanningView/useKeyboard'
import useSelectionTool from 'components/organisms/PlanningView/useSelectionTool'
import useSplitInternalPath from 'components/organisms/PlanningView/useSplitInternalPath'
import useSplitSinglePath from 'components/organisms/PlanningView/useSplitSinglePath'
import gsap from 'gsap'
import useCopyrightInformation from 'hooks/useCopyrightInformation'
import useGeolocationRef from 'hooks/useGeolocationRef'
import useMyVRProvider from 'hooks/useMyVRProvider'
import useTheme from 'hooks/useTheme'
import { mergeDeepRight } from 'ramda'
import {
  FC,
  MouseEvent,
  RefObject,
  TouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { redirectToJobsAction } from 'store/features/global/slice'
import {
  currentInternalPathAction,
  currentPolygonAction,
  resetImportedShp,
  resetPlanAction,
  selectCurrentPolygon,
  selectCurrentPolygonId,
  selectEditedStatus,
  selectFinalAlignmentPoint,
  selectMapMode,
  selectMapView,
  selectPlanComplete,
  selectPolygonNumber,
  selectPolygons,
  selectRangeDisplay,
  selectShpImported,
  selectShpList,
  selectTool,
  selectcurrentInternalPathId,
  selectinitialAlignmentPoint,
  submitPlanAction,
  toolAction,
} from 'store/features/planning/slice'
import { PlanningTools, Polygon } from 'store/features/planning/types'
import {
  selectLastPositionState,
  setLastPositionSettings,
} from 'store/features/settings/slice'
import { selectSystemInfo } from 'store/features/system/slice'
import { TileProvider } from 'store/features/system/types'
import 'swiper/swiper.scss'
import { isMobile } from 'utils/capabilities'
import { MyVRUserInputType, addInputHandler } from 'utils/myVR/common/input'
import { refreshTiles, setMapTileStyle } from 'utils/myVR/common/mapTileStyle'
import { setPosition } from 'utils/myVR/common/position'
import { parseHitRecords } from 'utils/myVR/helpers'
import { registerGlobalCallback } from 'utils/myVR/init/startup'
import {
  addPlanningLayers,
  fitPlanningFeatures,
  updatePathStyles,
} from 'utils/myVR/planning/layers'
import { Layers, MapMode, Position } from 'utils/myVR/types'
import { toJson } from 'utils/strings'

// TODO: PLANNING - if estimation fails because the disk space is not enough, the user cannot save anymore. Maybe we should reset the estimation? (ask)

const CLEAN_MEMORY_INTERVAL = 1000 * 60

/**
 * Shows the map with controls and toolbars when the system is activated
 */
export const PlanningView: FC = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null)
  const [myVRProvider, setMyVRCanvas] = useMyVRProvider()
  const [theme] = useTheme()
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const mode = useSelector(selectMapMode)
  const mapView = useSelector(selectMapView)
  const modeRef = useRef<MapMode>(mode)
  const tool = useSelector(selectTool)
  const polygons = useSelector(selectPolygons)
  const currentPolygon = useSelector(selectCurrentPolygon)
  const currentPolygonId = useSelector(selectCurrentPolygonId)
  const currentInternalPathId = useSelector(selectcurrentInternalPathId)
  const initial = useSelector(selectinitialAlignmentPoint)
  const final = useSelector(selectFinalAlignmentPoint)
  const rangeDisplay = useSelector(selectRangeDisplay)
  const complete = useSelector(selectPlanComplete)
  const panningRef = useRef<boolean>(false)
  const [deselect] = useDeselect(tool, canvasRef.current, myVRProvider)
  const [checkHitForSelection] = useSelectionTool(
    tool,
    canvasRef.current,
    myVRProvider
  )
  const [checkHitForSelectionInternal] = useInternalSelectionTool(
    tool,
    canvasRef.current,
    myVRProvider
  )
  useKeyboard(tool, deselect)
  useDrawSinglePath(tool, canvasRef.current, panningRef, myVRProvider)
  useSplitSinglePath(tool, canvasRef.current, panningRef, myVRProvider)
  useSplitInternalPath(tool, canvasRef.current, panningRef, myVRProvider)
  useDrawPolygon(tool, canvasRef.current, panningRef, myVRProvider)
  useInitialFinalPoint(tool, canvasRef.current, panningRef, myVRProvider)
  const [updateCopyright] = useCopyrightInformation(myVRProvider)
  const [draggingPointRef, checkHitsForDragging, ghostPath, draggingPoint] =
    useGhostPath(tool, canvasRef.current, myVRProvider, currentPolygon)
  const [checkHitsForDeletePolygon] = useDeletePolygon(
    tool,
    canvasRef.current,
    polygons,
    myVRProvider
  )
  const [checkHitsForDeleteInternalPath] = useDeleteIternalPath(
    tool,
    canvasRef.current,
    polygons,
    myVRProvider
  )
  const busy = useBusyApi()
  const { pathname } = useLocation()
  const editedStatus = useSelector(selectEditedStatus)
  /** fix to be sure that styles are there at first load */
  const [polygonsWithStyle, setPolygonsWithStyle] = useState<Polygon[] | null>(
    null
  )
  const firstZoomDone = useRef<boolean>(false)
  const [userPositionRef, geolocation] = useGeolocationRef()
  const lastKnownPosition = useSelector(selectLastPositionState)
  const lastKnownUserPositionRef = useRef<Position>(lastKnownPosition)
  /**
   * Check if the plan is loaded and if it's planned
   * 'null' > the plan is not loaded
   * 0      > the plan is not planned
   * 1...N  > the plan is planned
   */
  const polygonNumber = useSelector(selectPolygonNumber)
  const systemInfo = useSelector(selectSystemInfo)
  const shpFilesList = useSelector(selectShpList)
  const shpImported = useSelector(selectShpImported)
  const tileProvider = systemInfo?.maps?.tileProvider
  const copyrightUrl = systemInfo?.maps?.copyrightUrl

  const unit = currentProject?.coordinate?.unit

  const acquired = useMemo(() => {
    if (!currentJob) return null
    return currentJob.acquired
  }, [currentJob])

  const draggingImg = useMemo(() => {
    return theme === 'light'
      ? '/assets/img/LightDot.png'
      : '/assets/img/DarkDot.png'
  }, [theme])

  const canShowPolygon = (id?: number): boolean => {
    if (!id) return false
    const isPolygonSelected =
      currentPolygon?.isPolygon && currentPolygon.paths.length
    if (
      [PlanningTools.MOVE_POINT, PlanningTools.CUT].includes(tool) ||
      isPolygonSelected
    ) {
      return id === currentPolygonId
    }
    return true
  }

  const submitClickHandler = () => {
    dispatch(currentPolygonAction(-1))
    dispatch(toolAction(PlanningTools.SELECT))
    dispatch(
      submitPlanAction({
        process: !complete,
        activate: complete,
        save: editedStatus,
      })
    )
  }

  const secondarySubmitClickHandler = () => {
    dispatch(currentPolygonAction(-1))
    dispatch(toolAction(PlanningTools.SELECT))
    dispatch(
      submitPlanAction({
        process: false,
        activate: false,
        save: true,
      })
    )
  }

  const submitLabel = useMemo(() => {
    if (editedStatus)
      return complete
        ? t('planning.submit.save_activate', 'activate')
        : t('planning.submit.estimate', 'estimate')
    return complete
      ? t('planning.submit.start_activate', 'activate')
      : t('planning.submit.estimate', 'estimate')
  }, [t, complete, editedStatus])

  const secondarySubmitLabel = useMemo(() => {
    return t('planning.submit.save_only', 'save')
  }, [t])

  const SubmitIcon = useMemo(() => {
    return complete ? 'PowerButton' : 'Estimate'
  }, [complete])

  const title = useMemo(() => {
    if (!currentProject) return '--'
    if (!currentJob) return '--'
    return `${currentProject.name}: ${currentJob.name}`
  }, [currentProject, currentJob])

  const showSubmit = useMemo(() => {
    if (acquired === null) return false
    if (acquired) return false
    if (complete) return true
    return editedStatus || !complete
  }, [editedStatus, complete, acquired])

  const myVRUserInputHandler = useCallback(
    (
      compositeId: number,
      type: MyVRUserInputType,
      x: number,
      y: number,
      dX: number,
      dY: number,
      value: number
    ) => {
      /** customize double tap */
      if (type === MyVRUserInputType.DOUBLE_TAP_EVENT) {
        return false
      }
      // if (type === MyVRUserInputType.ZOOM_EVENT) {
      if (isMobile() && type === MyVRUserInputType.ZOOM_EVENT) {
        const diff = value - 1
        const zoomMitigator = {
          x,
          y,
          dX,
          dY,
          value: 1 + diff * 0.4,
        }
        return zoomMitigator
      }
      if (modeRef.current === MapMode.MAP_2D) {
        /** disable tilt in 2D mode */
        if (type === MyVRUserInputType.TILT_EVENT) {
          return false
        }
        if (type === MyVRUserInputType.ROTATE_EVENT) {
          /** disable rotation in 2D mode */
          return false
        }
      }
      if (modeRef.current === MapMode.MAP_3D) {
        const rotationDisabler = {
          value: 0,
          x: 0,
          y: 0,
          dX: 0,
        }
        const tiltMitigator = {
          dY: Math.round(dY * 0.2),
        }
        const interactionModifier = mergeDeepRight(
          rotationDisabler,
          tiltMitigator
        )
        /** customize tilt interaction in 3D mode */
        if (type === MyVRUserInputType.TILT_EVENT) {
          return interactionModifier
        }
        /** customize rotation interaction in 3D mode */
        if (type === MyVRUserInputType.ROTATE_EVENT) {
          return interactionModifier
        }
      }
      /** handle pan to invalidate actions if the user did it */
      if (type === MyVRUserInputType.MOVE_EVENT) {
        if (Math.max(Math.abs(dX), Math.abs(dY)) > 3) {
          panningRef.current = true
        }
      }
      /** not panning anymore */
      if (type === MyVRUserInputType.NO_CONTACT_EVENT) {
        panningRef.current = false
      }
      /** disable pan during drag */
      if (draggingPointRef.current) return false
      return true
    },
    [draggingPointRef, modeRef]
  )

  /**
   * fit to the plan when the map has finished initializing
   */
  useEffect(() => {
    if (!myVRProvider) return
    if (lastKnownUserPositionRef.current) return
    if (polygonNumber !== null && polygonNumber === 0) {
      const userPosition: Position | null = geolocation
        ? {
            latitude: geolocation.latitude,
            longitude: geolocation.longitude,
          }
        : null
      if (userPosition) {
        myVRProvider.execute(setPosition(userPosition)(10000))
        lastKnownUserPositionRef.current = userPosition
      }
    }
  }, [myVRProvider, geolocation, polygonNumber])

  /**
   * fit after shape import
   */
  useEffect(() => {
    if (!myVRProvider) return
    if (shpImported) {
      setTimeout(() => {
        console.info('[SHP] imported, extents')
        try {
          myVRProvider.execute(fitPlanningFeatures)
        } catch (error) {
          console.error(error)
        }
      }, 1000)
      dispatch(resetImportedShp())
    }
  }, [dispatch, myVRProvider, shpImported])

  /**
   * fit to the plan when the map has finished initializing
   */
  const fitAfterIdle = useCallback(() => {
    if (!myVRProvider) return
    if (firstZoomDone.current) return
    try {
      myVRProvider.execute(fitPlanningFeatures)
    } catch (error) {
      console.error(error)
    }
    firstZoomDone.current = true
  }, [myVRProvider])

  /**
   * delays the execution until the map stops sending actions
   */
  const waitForIdle = useCallback(() => {
    gsap.killTweensOf(fitAfterIdle)
    gsap.delayedCall(0.5, fitAfterIdle)
  }, [fitAfterIdle])

  /**
   * back button callback
   */
  const BackToProjects = useMemo(() => {
    const onBack = () => {
      if (editedStatus) {
        dispatch(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: 'message',
              variant: 'colored',
              okButtonLabel: t('planning.alert.unsavedPlan.cancel', 'stay'),
              cancelButtonLabel: t(
                'planning.alert.unsavedPlan.ok',
                'do not save'
              ),
              cancelButtonCallback: () => dispatch(redirectToJobsAction()),
              okButtonCallback: () => dispatch(closeDialogAction()),
              title: t('planning.alert.unsavedPlan.title', 'unsaved job'),
              text: t(
                'planning.alert.unsavedPlan.message',
                'continue without saving?'
              ),
            } as IAlertProps,
          })
        )
      } else dispatch(redirectToJobsAction())
    }
    return (
      <div
        className={style.backToProjects}
        onClick={onBack}
        data-testid="plan-back-btn"
      >
        <Icon name="BackArrow" />
        <span>{t('header.back_jobs', 'Back')}</span>
      </div>
    )
  }, [t, editedStatus, dispatch])

  /**
   * tool selection callback
   */
  const handleTools = (newTool: PlanningTools) => {
    if (newTool === PlanningTools.IMPORT_SHP) {
      // dispatch(importShpStartActions.request())
      dispatch(
        openDialogAction({
          component: DialogNames.ImportShapeFile,
          componentProps: {
            shpFilesList,
          },
        })
      )
      return
    }
    if ([PlanningTools.DRAW_PATH, PlanningTools.DRAW_POLYGON].includes(tool)) {
      dispatch(toolAction(PlanningTools.SELECT))
      dispatch(currentPolygonAction(-1))
      return
    }
    if (newTool === tool) {
      dispatch(toolAction(PlanningTools.SELECT))
      return
    }
    dispatch(toolAction(newTool))
    // TODO: PLANNING - this was removed in the polygon paths version, check why
    // switch (newTool) {
    //   case PlanningTools.DRAW_PATH:
    //   case PlanningTools.DRAW_POLYGON:
    //     if (!currentPolygon) {
    //       const name =
    //         newTool === PlanningTools.DRAW_PATH ? newTrackName : newPolygonkName
    //       const newTrack =
    //         newTool === PlanningTools.DRAW_POLYGON
    //           ? emptyPolygon(name)
    //           : emptyPolygonSinglePath(name)
    //       dispatch(addPolygonAction(newTrack))
    //     }
    //     break

    //   default:
    //     break
    // }
  }

  // TODO: PLANNING - maybe it would be better to handle these two with hammer
  const handleCanvasMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    panningRef.current = false
  }
  const handleCanvasTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    panningRef.current = false
  }

  const handleLocationClick = useCallback(
    (location: IMapSearchBarLocation) => {
      if (!myVRProvider) return
      myVRProvider.execute(
        setPosition({
          latitude: location.latitude,
          longitude: location.longitude,
        })(null),
        refreshTiles
      )
    },
    [myVRProvider]
  )

  /**
   * first myVR setup, at mount
   */
  useEffect(() => {
    if (!myVRProvider) return
    const userPosition: Position | null =
      userPositionRef.current && userPositionRef.current.latitude
        ? {
            latitude: userPositionRef.current.latitude,
            longitude: userPositionRef.current.longitude,
          }
        : null
    const startPosition: Position = userPosition || lastKnownPosition
    myVRProvider.execute(
      setPosition(startPosition)(10000),
      addInputHandler(myVRUserInputHandler)
    )
  }, [
    myVRProvider,
    myVRUserInputHandler,
    dispatch,
    userPositionRef,
    lastKnownPosition,
  ])

  /**
   * add Planning layers
   */
  useEffect(() => {
    if (!myVRProvider) return
    // TODO: to optimize we can check if the layers already exist
    myVRProvider.execute(addPlanningLayers(theme))
  }, [myVRProvider, theme])

  /**
   * register the global callback
   */
  useEffect(() => {
    if (!myVRProvider) return
    myVRProvider.execute(
      registerGlobalCallback((compositeid: number, jsonStr: string) => {
        if (polygonNumber && polygonNumber > 0 && !firstZoomDone.current)
          waitForIdle()
        const j = toJson(jsonStr, 'MYVR')
        const {
          action,
          // type
        } = j
        // console.log('PlanningView.tsx (126) # j', j)
        // console.log('PlanningView.tsx (91) # action', action, type)
        switch (action) {
          case 'cameraPositionChange':
            updateCopyright(j.options)
            break
          case 'elementClicked':
            // first level
            if (
              [PlanningTools.SELECT, PlanningTools.DELETE_POLYGON].includes(
                tool
              )
            ) {
              // eslint-disable-next-line no-case-declarations
              const hits = parseHitRecords(j['hit-records'])
              hits.forEach((h) => {
                if (
                  [
                    Layers.FEATURES_PLANNING_TRACK,
                    Layers.FEATURES_SCAN_RANGE,
                  ].includes(h.layer)
                ) {
                  if (tool === PlanningTools.DELETE_POLYGON)
                    checkHitsForDeletePolygon(h)
                  if (tool === PlanningTools.SELECT) checkHitForSelection(h)
                }
              })
            }
            if (tool === PlanningTools.MOVE_POINT) {
              checkHitsForDragging(j)
            }
            // internal
            if (
              [
                PlanningTools.SELECT_INTERNAL,
                PlanningTools.DELETE_PATH,
                PlanningTools.CUT_INTERNAL,
              ].includes(tool)
            ) {
              // eslint-disable-next-line no-case-declarations
              const hits = parseHitRecords(j['hit-records'])
              if (tool !== PlanningTools.DELETE_PATH)
                dispatch(currentInternalPathAction(-1))
              hits.forEach((h) => {
                if (
                  [
                    Layers.FEATURES_PLANNING_TRACK,
                    Layers.FEATURES_SCAN_RANGE,
                  ].includes(h.layer)
                ) {
                  if (tool === PlanningTools.DELETE_PATH)
                    checkHitsForDeleteInternalPath(h)
                  if (tool === PlanningTools.SELECT_INTERNAL)
                    checkHitForSelectionInternal(h)
                }
              })
            }
            break
          case 'loadingInformation':
            // can be useful to know if loading is complete
            // myVRProvider.execute(getResourceQueueLength(console.log))
            break
          default:
            break
        }
      })
    )
  }, [
    myVRProvider,
    checkHitForSelectionInternal,
    checkHitsForDeleteInternalPath,
    myVRUserInputHandler,
    dispatch,
    tool,
    t,
    checkHitsForDeletePolygon,
    checkHitsForDragging,
    checkHitForSelection,
    polygonNumber,
    waitForIdle,
    updateCopyright,
  ])

  /**
   * set map style according to theme
   */
  useEffect(() => {
    if (!myVRProvider) return
    if (!systemInfo) return
    if (!systemInfo.maps)
      throw new Error('MISSING HEREMAPS CONFIGURATION IN SYSTEM INFO')
    mapView === 'satellite'
      ? myVRProvider.execute(
          setMapTileStyle(
            'satellite',
            systemInfo.maps,
            systemInfo.countryCode
          )
        )
      : myVRProvider.execute(
          setMapTileStyle(theme, systemInfo.maps, systemInfo.countryCode)
        )
  }, [mapView, myVRProvider, systemInfo, theme])

  /**
   * update path styles with path colors
   */
  useEffect(() => {
    if (!myVRProvider) return
    const scannerRange = rangeDisplay ? currentJob?.scanner?.range || 0 : 0
    myVRProvider.execute(updatePathStyles(polygons, scannerRange))
    setPolygonsWithStyle(polygons)
  }, [myVRProvider, polygons, currentJob, rangeDisplay, setPolygonsWithStyle])

  /**
   * set myVR canvas to instantiate it
   */
  useEffect(() => {
    if (!canvasRef.current) return
    setMyVRCanvas(canvasRef.current)
  }, [setMyVRCanvas])

  /**
   * keep modeRef updated
   */
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  /**
   * reset at unmount
   */
  useEffect(() => {
    return () => {
      console.info('[PLANNING] unmount')
      dispatch(resetPlanAction())
      console.info('[PLANNING] setting last known position')
      dispatch(setLastPositionSettings(lastKnownUserPositionRef.current))
    }
  }, [dispatch])

  return (
    <div
      className={classNames({ [style.container]: true, [style.busy]: busy })}
    >
      {myVRProvider &&
        unit &&
        polygonsWithStyle &&
        polygonsWithStyle.map((polygon) => {
          const polygonId = polygon.id || polygon.temp_id
          return (
            canShowPolygon(polygonId) && (
              <PolygonFeature
                polygon={polygon}
                key={polygonId}
                myVRProvider={myVRProvider}
                selected={polygonId === currentPolygonId}
                selectedInternalId={currentInternalPathId}
                unit={unit}
                isAcquisition={false}
                projection={null}
              />
            )
          )
        })}
      {myVRProvider && unit && (
        <PolygonFeature
          polygon={ghostPath || null}
          myVRProvider={myVRProvider}
          selected
          selectedInternalId={-1}
          unit={unit}
          isAcquisition={false}
          projection={null}
        />
      )}
      {myVRProvider && polygonsWithStyle && (
        <SingleIcon
          coord={initial}
          group={PlanningTools.INITIAL_POINT}
          myVRProvider={myVRProvider}
          tracklineId={1523}
        />
      )}
      {myVRProvider && polygonsWithStyle && (
        <SingleIcon
          coord={final}
          group={PlanningTools.FINAL_POINT}
          myVRProvider={myVRProvider}
          tracklineId={1524}
        />
      )}
      <div className={style.header}>
        <Header
          centerText={title}
          title={t('planning.title', 'Job planning')}
          leftCta={BackToProjects}
          rightComponent={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <MapSearchBar
              onLocationClick={handleLocationClick}
              userPosition={userPositionRef.current}
            />
          }
          pathname={pathname}
        />
      </div>
      {draggingPoint && (
        <img
          src={draggingImg}
          alt="draggingPoint"
          className={style.draggingPoint}
          ref={draggingPointRef}
        />
      )}
      <canvas
        ref={canvasRef}
        className={classNames({
          [style.myVRCanvas]: true,
          [style[tool]]: true,
        })}
        // to disable right click/onContectMenu in React
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleCanvasMouseDown}
        onTouchStart={handleCanvasTouchStart}
      />
      <div
        className={classNames({
          [style.bottomControls]: true,
        })}
      >
        <div className={style.row1}>
          <div>
            <PlanningLeftControls myVRProvider={myVRProvider} />
          </div>
          <div>
            <PlanningBigTools
              onSelect={handleTools}
              selected={tool}
              currentPolygonAvailable={!!currentPolygon}
              isPolygon={currentPolygon?.isPolygon}
            />
          </div>
          <div className={style.submitButton}>
            {showSubmit ? (
              <FinalAlignmentButton
                onClick={submitClickHandler}
                onClickSecondary={secondarySubmitClickHandler}
                label={submitLabel}
                labelSecondary={secondarySubmitLabel}
                icon={SubmitIcon}
                busy={busy}
              />
            ) : (
              ' '
            )}
          </div>
        </div>
      </div>
      {/* <div
        className={classNames({
          [style.topLeftControls]: true,
        })}
      >
        <div className={style.row1}>
          <SingleTool
            onClick={() => dispatch(toolAction(PlanningTools.MOVE))}
            icon={<Icon name="Move" />}
            selected={tool === PlanningTools.MOVE}
          />
        </div>
      </div> */}
      <div className={style.sidePanel}>
        <SidePanelJobPlanning myVRProvider={myVRProvider} />
      </div>
      <div className={style.userHints}>
        <PlanningUserHints />
      </div>
      <div className={style.topLeftControls}>
        <PlanningTopLeftControls />
      </div>
      <div className={style.hereCopy} data-testid="tiles-copyright">
        {tileProvider === TileProvider.HEREMAPS && (
          <HereCopyright />
        )}
        {tileProvider === TileProvider.OPENSTREETMAP && (
          <div className={style.copyText}>
            <a
              target="_blank"
              href={copyrightUrl || ''}
              rel="noopener noreferrer"
            >
              © OpenStreetMap
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// PlanningView.whyDidYouRender = true
