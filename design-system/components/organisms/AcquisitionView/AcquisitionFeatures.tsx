import useCopyrightInformation from 'hooks/useCopyrightInformation'
import useGeolocationRef from 'hooks/useGeolocationRef'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import useTheme from 'hooks/useTheme'
import { clamp, mergeDeepRight } from 'ramda'
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectDeactivationStatus } from 'store/features/actions/slice'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import { redirectToJobsAction } from 'store/features/global/slice'
import {
  pointCloudHspcListAction,
  pointCloudUnsubscribeAction,
  selectBufferList,
  selectBufferSettings,
  selectHspcList,
  selectNotification,
  selectPointCloudProj4,
  selectPointCloudProjection,
  selectPointCloudThickness,
} from 'store/features/pointcloud/slice'
import {
  cameraHeightAction,
  mapModeAction,
  mapNavigationModeAction,
  mapPanningModeAction,
  planTracksVisibleAction,
  pointcloudActiveAction,
  selectMapMode,
  selectMapView,
  selectNavigationMode,
  selectPlanTracksVisible,
  selectPointcloudActive,
} from 'store/features/position/slice'
import {
  MapNavigationMode,
  MapPanningMode,
} from 'store/features/position/types'
import { selectAdminSettings } from 'store/features/settings/slice'
import { AdminSettings } from 'store/features/settings/types'
import { logWarning, selectSystemInfo } from 'store/features/system/slice'
import { getApiUrl } from 'store/services/apiClientNode'
import { throttle } from 'throttle-debounce'
import { isMobile } from 'utils/capabilities'
import { addCar, setCarPosition } from 'utils/myVR/acquisition/car'
import { removeIconGroup } from 'utils/myVR/acquisition/drawing'
import {
  addAcquisitionLayers,
  updatePolylineStyles,
  updateTrackStyles,
} from 'utils/myVR/acquisition/layers'
import {
  addHSPCTree,
  addPointBuffer,
  addPointCloudLayer,
  addProjection,
  pointCloudCommand,
  setProjectionOnMapLayer,
  togglePointcloud,
  updatePointCloudThickness,
} from 'utils/myVR/acquisition/pointCloud'
import { MyVRUserInputType, addInputHandler } from 'utils/myVR/common/input'
import { destroyLayer } from 'utils/myVR/common/layers'
import { setMapTileStyle } from 'utils/myVR/common/mapTileStyle'
import { resetNorth, setPosition } from 'utils/myVR/common/position'
import { fitCoveredFeatures } from 'utils/myVR/common/zoom'
import { getPositionAtCenterAsync } from 'utils/myVR/helpers'
import { registerGlobalCallback } from 'utils/myVR/init/startup'
import { Layers, MapMode, Position } from 'utils/myVR/types'
import { toJson } from 'utils/strings'

export interface IAcquisitionFeaturesProps {
  /**
   * myVRProvider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * yaw change callback
   */
  onYawChange?: (yaw: number) => void
}

const TERRAIN_HEIGHT_TOLERANCE = 0.3
const CLEAN_MEMORY_INTERVAL = 1000 * 60 * 10
const mobile = isMobile()

/**
 * Wraps myVR Features without visual React components, to minimize the impact of rerenders on socket updates
 */
export const AcquisitionFeatures: FC<IAcquisitionFeaturesProps> = ({
  myVRProvider,
  onYawChange,
}: PropsWithChildren<IAcquisitionFeaturesProps>) => {
  const dispatch = useDispatch()
  const [theme] = useTheme()
  const init = useRef<boolean>(false)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const cameraHeight = useRef<number>(200)
  const zAtCenter = useRef<number>(0)
  const addedHspc = useRef<string[]>([])
  const navigationMode = useSelector(selectNavigationMode)
  const pointcloudActive = useSelector(selectPointcloudActive)
  const pointCloudNotification = useSelector(selectNotification)
  const pointCloudThickness = useSelector(selectPointCloudThickness)
  const pointCloudProjection = useSelector(selectPointCloudProjection)
  const pointCloudProj4 = useSelector(selectPointCloudProj4)
  const bufferSettings = useSelector(selectBufferSettings)
  const deactivationStatus = useSelector(selectDeactivationStatus)
  const follow = useRef<boolean>(true)
  const mapView = useSelector(selectMapView)
  const mode = useSelector(selectMapMode)
  const modeRef = useRef<MapMode>(mode)
  const [userPositionRef] = useGeolocationRef()
  const systemInfo = useSelector(selectSystemInfo)
  const [updateCopyright] = useCopyrightInformation(myVRProvider)
  const hspcList = useSelector(selectHspcList)
  const bufferList = useSelector(selectBufferList)
  const planVisible = useSelector(selectPlanTracksVisible)
  const planVisibleRef = useRef<boolean>(planVisible)
  const adminSettings = useSelector(selectAdminSettings)
  const adminSettingsRef = useRef<AdminSettings | null>(adminSettings)

  const projectName = currentProject?.name
  const jobName = currentJob?.name

  const hspcFolder = useMemo(() => {
    const nodeUrl = getApiUrl()
    if (!currentProject) return nodeUrl
    if (!currentJob) return nodeUrl
    return `${nodeUrl}/pointCloud/${currentProject.name}/${currentJob.name}`
  }, [currentJob, currentProject])

  useEffect(() => {
    planVisibleRef.current = planVisible
  }, [planVisible])

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
      if (type === MyVRUserInputType.MOVE_EVENT) {
        dispatch(mapPanningModeAction(MapPanningMode.FREE))
      }
      /** customize double tap */
      if (type === MyVRUserInputType.DOUBLE_TAP_EVENT) {
        return false
      }
      if (mobile && type === MyVRUserInputType.ZOOM_EVENT) {
        const zoomMitigator = {
          x,
          y,
          dX,
          dY,
          value: clamp(0.985, 1.015, value),
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
        /** disable rotation in 3D follow mode
         * and mitigate it in no follow mode */
        const rotationDisabler = {
          value: 0,
          x: 0,
          y: 0,
          // dX: 0,
          dX: follow.current ? 0 : Math.round(dX * 0.2),
        }
        const tiltMitigator = {
          dY: Math.round(dY * 0.2),
        }
        const interactionModifier = mergeDeepRight(
          rotationDisabler,
          tiltMitigator
        )
        /** disable tilt in 3D mode */
        if (type === MyVRUserInputType.TILT_EVENT) {
          return interactionModifier
        }
        /** disable rotation in 3D mode */
        if (type === MyVRUserInputType.ROTATE_EVENT) {
          return interactionModifier
        }
      }
      return true
    },
    [dispatch]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledDispatchCameraHeight = useCallback(
    throttle(2000, false, () => {
      dispatch(cameraHeightAction(cameraHeight.current))
    }),
    [dispatch]
  )

  /** first myVR setup, at mount */
  useEffect(() => {
    let to: NodeJS.Timeout
    const cleanup = () => {
      if (to) clearTimeout(to)
    }
    cleanup()

    if (!myVRProvider) return cleanup
    if (init.current) return cleanup
    if (!currentJob) return cleanup
    const startPosition: Position = userPositionRef.current?.latitude
      ? userPositionRef.current
      : {
          latitude: 47.41188, // Herrbrugg
          longitude: 9.62732,
          // latitude: 59.9075, // Azzano
          // longitude: 10.7458,
        }
    console.info(
      `[MYVR] first setup at ${startPosition.latitude},${startPosition.longitude}`
    )
    myVRProvider.execute(
      registerGlobalCallback((compositeid: number, jsonStr: string) => {
        try {
          const j = toJson(jsonStr, 'MYVR')
          const {
            action,
            hits,
            // type,
            options,
          } = j
          // result of async action to retrieve current terrain z, applied to the car
          if (action === 'depthClicked' && hits?.length) {
            const hitOnMap = hits.find(
              (h: PositionHit) => h.layerid === Layers.MAP
            )
            if (hitOnMap?.z && hitOnMap.z > TERRAIN_HEIGHT_TOLERANCE) {
              zAtCenter.current = hitOnMap.z
            } else {
              const feedback = `[MYVR] height not available in ${j.hits.length} hits, skipping the car Z update`
              console.warn(feedback)
              // dispatch(logWarning(feedback))
            }
            //
            if (!hitOnMap) {
              console.warn('[MYVR] no hit on map')
              dispatch(logWarning('[MYVR] no hit on map'))
            }
          }
          // update copyright
          if (action === 'cameraPositionChange') {
            updateCopyright(j.options)
          }
          // wait for model loaded
          if (action === 'model-loaded') {
            console.info('[MYVR] model loaded')
            /** load existing hspc trees */
            dispatch(pointCloudHspcListAction.request())
          }
          if (action === 'cameraPositionChange') {
            // update zooming to scale the car
            if (cameraHeight.current !== options.height) {
              // console.info(`[MYVR] camera height changed to ${options.height}`)
              cameraHeight.current = options.height
              throttledDispatchCameraHeight()
            }
            // transmit yaw change
            onYawChange && onYawChange(options.yaw)
          }
          // check for heightmap loading
          if (
            action === 'loadingInformation' &&
            j.loadingComplete?.name?.includes('TERRAIN')
          ) {
            console.info(`[MYVR] ${j.loadingComplete?.name} heightmaps loaded`)
            myVRProvider.execute(getPositionAtCenterAsync)
            if (planVisibleRef.current) {
              dispatch(planTracksVisibleAction(false))
              setTimeout(() => {
                dispatch(planTracksVisibleAction(true))
              }, 10)
            }
          }
          // stop follow mode when user tilts
          // if (action === 'input-event') {
          //   if (type === MyVRUserInputType.TILT_EVENT)
          //     dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
          // }
        } catch (e) {
          console.error(e)
        }
      }),
      addAcquisitionLayers(
        theme,
        currentJob.profile,
        !!adminSettingsRef.current?.disableFeatures
      ),
      // next function should be false if we want a thicker line at high resolutions, otherwise we should set a threshold on the zoom
      updateTrackStyles(true, !!adminSettingsRef.current?.disableFeatures),
      setPosition(startPosition)(200),
      setCarPosition(startPosition, false, cameraHeight.current, 0),
      addInputHandler(myVRUserInputHandler),
      addCar(startPosition)
    )
    init.current = true
    return cleanup
  }, [
    myVRProvider,
    myVRUserInputHandler,
    dispatch,
    currentJob,
    theme,
    onYawChange,
    userPositionRef,
    updateCopyright,
    throttledDispatchCameraHeight,
  ])

  /** keep modeRef updated */
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  /** toggle the pointcloud */
  useLayoutEffect(() => {
    myVRProvider && myVRProvider.execute(togglePointcloud(pointcloudActive))
  }, [myVRProvider, pointcloudActive])

  /** Change the PointCloud Thickness according to settings */
  useEffect(() => {
    if (myVRProvider) {
      myVRProvider.execute(updatePointCloudThickness(pointCloudThickness))
    }
  }, [pointCloudThickness, myVRProvider])

  /** notify myVR to update the pointcloud */
  useLayoutEffect(() => {
    if (!myVRProvider) return
    if (!pointCloudProjection) return
    if (!pointCloudProj4) return
    const { commands } = pointCloudNotification || {}
    if (!commands) return
    const pointBufferUrl = `${hspcFolder}/`
    commands.forEach((c) => {
      myVRProvider.execute(
        pointCloudCommand(
          pointBufferUrl,
          c,
          pointCloudProjection,
          pointCloudProj4,
          {
            disableHspc: !!adminSettingsRef.current?.disableHSPC,
            disableBuffer: !!adminSettingsRef.current?.disableBuffer,
          }
        )
      )
      if (c.command === 'add' && c.url) {
        addedHspc.current.push(c.url)
      }
    })
  }, [
    pointCloudNotification,
    myVRProvider,
    projectName,
    jobName,
    hspcFolder,
    pointCloudProjection,
    pointCloudProj4,
  ])

  /** add missing hspcs */
  useEffect(() => {
    if (!myVRProvider) return
    if (!pointCloudProjection) return
    if (!hspcList.length) return
    adminSettingsRef.current?.disableHSPC ||
      hspcList.forEach((hspc) => {
        if (addedHspc.current.includes(hspc)) return
        console.info(`[POINTCLOUD] HSPC ${hspc} was missing, let's add it`)
        myVRProvider.execute(
          addHSPCTree(`${hspcFolder}/${hspc}`, pointCloudProjection)
        )
        addedHspc.current.push(hspc)
      })
  }, [hspcList, myVRProvider, pointCloudProjection, hspcFolder])

  /** add missing buffers */
  useEffect(() => {
    if (!myVRProvider) return
    if (!pointCloudProjection) return
    if (!bufferList.length) return
    adminSettingsRef.current?.disableBuffer ||
      bufferList.forEach((buffer) => {
        if (addedHspc.current.includes(buffer.url)) return
        console.info(
          `[POINTCLOUD] BUFFER ${buffer.url} was missing, let's add it`
        )
        myVRProvider.execute(
          addPointBuffer(`${hspcFolder}/${buffer.url}`, buffer.id)
        )
        addedHspc.current.push(buffer.url)
      })
  }, [bufferList, myVRProvider, pointCloudProjection, hspcFolder])

  /** reset north when disabling follow */
  useEffect(() => {
    if (!myVRProvider) return
    if (navigationMode === MapNavigationMode.NONE) {
      myVRProvider.execute(resetNorth)
    }
  }, [navigationMode, myVRProvider])

  /** set map style according to theme */
  useEffect(() => {
    if (!myVRProvider) return
    if (!systemInfo?.maps) return
    console.info(`[MYVR] set map tile style to ${theme}`)
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
  }, [myVRProvider, theme, mapView, systemInfo])

  /** add the acquisition tracks styles  */
  useEffect(() => {
    if (myVRProvider) {
      myVRProvider.execute(updatePolylineStyles(theme))
      console.info(`[MYVR] add acquisition tracks styles ${theme}`)
    }
  }, [myVRProvider, theme])

  /** change follow mode without rerender */
  useEffect(() => {
    follow.current = navigationMode === MapNavigationMode.FOLLOW
  }, [navigationMode])

  /** add pointcloud layer when projection is available */
  useLayoutEffect(() => {
    if (!pointCloudProjection) return
    if (!pointCloudProj4) return
    if (!currentProject) return
    if (!currentJob) return
    if (!bufferSettings) return
    console.info(
      `[MYVR] projection ${pointCloudProjection} available, add pointcloud layer`
    )
    myVRProvider &&
      myVRProvider.execute(
        addProjection(pointCloudProjection, pointCloudProj4),
        setProjectionOnMapLayer(pointCloudProjection),
        addPointCloudLayer(
          pointCloudProjection,
          pointCloudProj4,
          bufferSettings,
          !!adminSettingsRef.current?.disableHSPC,
          !!adminSettingsRef.current?.disableBuffer
        )
      )
  }, [
    pointCloudProjection,
    pointCloudProj4,
    myVRProvider,
    currentJob,
    currentProject,
    bufferSettings,
  ])

  // TODO: this could go on a custom hook
  /** Zoom the entire job after deactivation */
  useEffect(() => {
    let to: NodeJS.Timeout
    const cleanup = () => {
      if (to) clearTimeout(to)
    }
    cleanup()

    if (myVRProvider && deactivationStatus === 'done') {
      if (currentJob?.scans) {
        dispatch(mapPanningModeAction(MapPanningMode.FREE))
        dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
        dispatch(mapModeAction(MapMode.MAP_2D))
        dispatch(pointcloudActiveAction(false))
        // wait for the map movement to stop, otherwise it interferes with the zoom
        to = setTimeout(() => {
          if (myVRProvider) {
            try {
              myVRProvider.execute(
                destroyLayer(Layers.MODEL),
                removeIconGroup('start'),
                removeIconGroup('end'),
                updateTrackStyles(
                  true,
                  !!adminSettingsRef.current?.disableFeatures
                ),
                fitCoveredFeatures
              )
            } catch (error) {
              console.error(error)
            }
          }
        }, 200)
      } else {
        to = setTimeout(() => {
          if (myVRProvider) {
            dispatch(redirectToJobsAction())
          }
        }, 1000)
      }
    }
    return cleanup
  }, [currentJob, deactivationStatus, dispatch, myVRProvider])

  /** reset loaded hspcs on unmount */
  useEffect(() => {
    return () => {
      dispatch(
        pointCloudHspcListAction.success({ tree: [], buffer: [], final: [] })
      )
    }
  }, [dispatch])

  /** unsubscribe from socket at unmount */
  useEffect(() => {
    return () => {
      dispatch(pointCloudUnsubscribeAction())
    }
  }, [dispatch])

  /** log settings at mount */
  useEffect(() => {
    console.info('[ACQUISITION] admin settings', adminSettingsRef.current)
  }, [])

  return null
}
