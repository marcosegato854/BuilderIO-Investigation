/// <reference types="@welldone-software/why-did-you-render" />
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import { Box, Button, CircularProgress } from '@mui/material'
import classNames from 'classnames'
import { AutocaptureBadge } from 'components/atoms/AutocaptureBadge/AutocaptureBadge'
import { CameraViewDisabled } from 'components/atoms/CameraViewDisabled/CameraViewDisabled'
import { HereCopyright } from 'components/atoms/HereCopyright/HereCopyright'
import { Icon } from 'components/atoms/Icon/Icon'
import { RecordingButton } from 'components/atoms/RecordingButton/RecordingButton'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { Unit } from 'components/dialogs/NewProjectForm/NewProjectForm'
import { AcquisitionNotifications } from 'components/molecules/AcquisitionNotifications/AcquisitionNotifications'
import { AlignmentToast } from 'components/molecules/AlignmentToast/AlignmentToast'
import { CameraPreview } from 'components/molecules/CameraPreview/CameraPreview'
import { CameraView } from 'components/molecules/CameraView/CameraView'
import { DataAcquisitionLeftControls } from 'components/molecules/DataAcquisitionLeftControls/DataAcquisitionLeftControls'
import { DataAcquisitionStatusBar } from 'components/molecules/DataAcquisitionStatusBar/DataAcquisitionStatusBar'
import {
  AvailableIcons,
  DataAcquisitionSubHeader,
} from 'components/molecules/DataAcquisitionSubHeader/DataAcquisitionSubHeader'
import { RoutingToast } from 'components/molecules/RoutingToast/RoutingToast'
import { ScannerTemperature } from 'components/molecules/ScannerTemperature/ScannerTemperature'
import { AcquisitionFeatures } from 'components/organisms/AcquisitionView/AcquisitionFeatures'
import { AcquisitionPlanFeatures } from 'components/organisms/AcquisitionView/AcquisitionPlanFeatures'
import { AcquisitionPositionFeatures } from 'components/organisms/AcquisitionView/AcquisitionPositionFeatures'
import { AcquisitionRoutingFeatures } from 'components/organisms/AcquisitionView/AcquisitionRoutingFeatures'
import style from 'components/organisms/AcquisitionView/AcquisitionView.module.scss'
import { DataAcquisitionRightControls } from 'components/organisms/DataAcquisitionRightControls/DataAcquisitionRightControls'
import { Header } from 'components/organisms/Header/Header'
import { SidePanel } from 'components/organisms/SidePanel/SidePanel'
import gsap from 'gsap'
import useMyVRProvider from 'hooks/useMyVRProvider'
import { T, always, cond, equals } from 'ramda'
import {
  FC,
  RefObject,
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
  actionsServiceExitAcquisition,
  actionsServiceStartRecordingAbortActions,
  actionsServiceStartRecordingAction,
  actionsServiceStopRecordingAction,
  selectCurrentAction,
  selectDeactivationStatus,
  selectRecordingStatus,
} from 'store/features/actions/slice'
import {
  cameraExposureActions,
  cameraTriggerActions,
  selectCameraEnabled,
} from 'store/features/camera/slice'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import {
  clearPlanningHistoryAction,
  deletePlannedPolygonsAction,
  resetPlanAction,
} from 'store/features/planning/slice'
import { Polygon } from 'store/features/planning/types'
import {
  cameraViewZoomAction,
  pointcloudActiveAction,
  resetUserViewAction,
  selectPointcloudActive,
  selectTilesCopyright,
  selectViewMode,
  viewModeAction,
} from 'store/features/position/slice'
import { ViewMode } from 'store/features/position/types'
import {
  confirmAbortAutocaptureAction,
  resetRoutingAction,
  routingStatusActions,
  autocaptureNeededActions,
  routingSubscribeAction,
  routingUnsubscribeAction,
  selectCurrentPolygon,
  selectRoutingEnabled,
  selectRoutingModule,
  autocaptureStatusActions,
  selectAutocaptureEnabled,
  selectOutOfTrackEnabled,
  selectUncoveredPolygons,
} from 'store/features/routing/slice'
import { selectShowTemperature } from 'store/features/scanner/slice'
import { selectSpeechActivation } from 'store/features/speech/slice'
import {
  resetNotificationsAction,
  selectSystemInfo,
  selectSystemState,
} from 'store/features/system/slice'
import { canRecordStates, TileProvider } from 'store/features/system/types'
import 'swiper/swiper.scss'
import { IS_TESTING } from 'utils/capabilities'
import { translateSystemAction } from 'utils/notifications'
import { getTrackBaseName, settings } from 'utils/planning/polygonHelpers'

/**
 * Shows the map with controls and toolbars when the system is activated
 */
export const AcquisitionView: FC = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null)
  const containerRef: RefObject<HTMLDivElement> = useRef(null)
  const arrowRef = useRef<SVGSVGElement>(null)
  const recordingClickInterval = useRef<NodeJS.Timeout | null>()
  const [myVRProvider, setMyVRCanvas] = useMyVRProvider()
  const [detailVisible, setDetailVisible] = useState<boolean>(false)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const recordingStatus = useSelector(selectRecordingStatus)
  const pointcloudActive = useSelector(selectPointcloudActive)
  const viewMode = useSelector(selectViewMode)
  const [currentCameraGroupIndex, setCurrentCameraGroupIndex] =
    useState<number>(0)
  // useGeolocalizedNotifications(myVRProvider) // POSSIBLE CAUSE OF RE_RENDERS
  // const systemNotifications = useSelector(selectSystemNotifications) // POSSIBLE CAUSE OF RE_RENDERS
  const { pathname } = useLocation()
  const currentRoutingPolygon = useSelector(selectCurrentPolygon)
  const cameraEnabled = useSelector(selectCameraEnabled)
  const systemState = useSelector(selectSystemState)
  const routingModule = useSelector(selectRoutingModule)
  const routingEnabled = useSelector(selectRoutingEnabled)
  const autocaptureEnabled = useSelector(selectAutocaptureEnabled)
  const ttsIsActive = useSelector(selectSpeechActivation)
  const deactivationStatus = useSelector(selectDeactivationStatus)
  const state = systemState?.state
  const currentAction = useSelector(selectCurrentAction)
  const tRef = useRef(t)
  const notCovered: Polygon[] = useSelector(selectUncoveredPolygons)
  const autocaptureCurrentPolygon = useSelector(selectCurrentPolygon)
  const showScannerTemperature = useSelector(selectShowTemperature)
  const systemInfo = useSelector(selectSystemInfo)
  const tileProvider = systemInfo?.maps?.tileProvider
  const copyrightUrl = systemInfo?.maps?.copyrightUrl

  const CLICK_MIN_INTERVAL = routingModule ? 50 : 2000

  const setClickInterval = useCallback(() => {
    if (recordingClickInterval.current)
      clearTimeout(recordingClickInterval.current)
    recordingClickInterval.current = setTimeout(() => {
      recordingClickInterval.current = null
    }, CLICK_MIN_INTERVAL)
  }, [CLICK_MIN_INTERVAL])

  const planned = currentJob?.planned
  const recording = recordingStatus === 'done'
  const isOutOfTrack = useSelector(selectOutOfTrackEnabled)
  const [sidePanelOpened, setSidePanelOpened] = useState<string>(
    planned ? 'tracks' : ''
  )

  const progressActionLabel = useMemo(() => {
    if (!currentAction) return null
    const actionMessage = translateSystemAction(currentAction).description
    return actionMessage || null
  }, [currentAction])

  const progressMessage = useMemo(() => {
    if (!state) return null
    if (progressActionLabel) return progressActionLabel
    return cond([
      [
        equals('Deactivating'),
        always(`${t('acquisition.capture.deactivating', 'deactivating')}`),
      ],
      [
        equals('StartingInitialAlignment'),
        always(`${t('acquisition.capture.starting_alignment', 'alignment')}`),
      ],
      [
        equals('StartingFinalAlignment'),
        always(`${t('acquisition.capture.starting_alignment', 'alignment')}`),
      ],
      [
        equals('StartingLogging'),
        always(`${t('acquisition.capture.starting_logging', 'logging')}`),
      ],
      [
        equals('StartingRecording'),
        always(`${t('acquisition.capture.starting_recording', 'recording')}`),
      ],
      [
        equals('StoppingRecording'),
        always(
          `${t('acquisition.capture.stopping_recording', 'stopping recording')}`
        ),
      ],
      [T, always(null)],
    ])(state)
  }, [state, t, progressActionLabel])

  const showRightControls = useMemo(() => {
    if (!state) return false
    return state !== 'Deactivated'
  }, [state])

  const showCancelButton = useMemo(() => {
    if (!state) return false
    return state === 'StartingRecording'
  }, [state])

  const validCameraEnabled = useMemo(() => {
    if (currentRoutingPolygon) {
      const polygonSettings = settings(currentRoutingPolygon)
      return polygonSettings?.camera.enable
    }
    return cameraEnabled !== 'None'
  }, [cameraEnabled, currentRoutingPolygon])

  const activeIcons: AvailableIcons[] = useMemo(() => {
    return pointcloudActive
      ? ['camera_mode', 'map_mode', 'pointcloud']
      : ['camera_mode', 'map_mode']
  }, [pointcloudActive])

  const canRecord = useMemo(() => {
    if (!state) return false
    return canRecordStates.includes(state)
  }, [state])

  const acBadge = useMemo(() => {
    if (routingModule && planned)
      return (
        <AutocaptureBadge
          autocaptureEnabled={!!autocaptureEnabled}
          recording={recording}
        />
      )
    return null
  }, [routingModule, planned, autocaptureEnabled, recording])

  const recordingHandler = () => {
    if (recordingClickInterval.current) {
      console.warn('[ACQUISITION] record button clicked too soon')
      return
    }
    setClickInterval()
    const action = () => {
      if (recordingStatus === 'done') {
        dispatch(actionsServiceStopRecordingAction())
        return
      }
      dispatch(actionsServiceStartRecordingAction())
    }
    // if Out Of Track alert is active, BE will handle the autoCapture options
    if (isOutOfTrack || !autocaptureEnabled) {
      action()
    } else if (autocaptureEnabled) {
      dispatch(
        confirmAbortAutocaptureAction({
          confirmCallback: action,
        })
      )
    }
  }

  const onSwitchCamera = (index: number) => {
    dispatch(cameraViewZoomAction(0))
    setCurrentCameraGroupIndex(index)
  }

  /** rotate the arrow on yaw change */
  const onYawChange = useCallback((yaw: number) => {
    if (arrowRef.current) {
      const targetDegrees = -yaw - 45
      gsap.set(arrowRef.current, {
        rotation: targetDegrees,
        transformOrigin: '50% 50%',
      })
    }
  }, [])

  /** log messages */
  useEffect(() => {
    if (progressMessage) console.info(`[MESSAGE_DISPLAYED] ${progressMessage}`)
  }, [progressMessage])

  /** set myVR canvas to instantiate it */
  useEffect(() => {
    if (!canvasRef.current) return
    setMyVRCanvas(canvasRef.current)
  }, [setMyVRCanvas])

  /** reset the timeout before being able to click the record button */
  useEffect(() => {
    setClickInterval()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  /** reset the timeout before being able to click the record button */
  useEffect(() => {
    return () => {
      if (recordingClickInterval.current)
        clearTimeout(recordingClickInterval.current)
    }
  }, [])

  /** check routing / autocapture enabled, connect to routing socket and load estimations */
  useEffect(() => {
    if (currentProject && planned && routingModule) {
      dispatch(routingStatusActions.request())
      dispatch(autocaptureStatusActions.request())
    }
    if (currentProject && planned && autocaptureEnabled) {
      console.info('[ROUTING] initialization')
      dispatch(autocaptureNeededActions.request())
      // dispatch(routingPolylineActions.request())
      dispatch(routingSubscribeAction())
    }
  }, [planned, currentProject, dispatch, autocaptureEnabled, routingModule])

  /** force user click to enable TTS */
  useEffect(() => {
    let ttsTimer: NodeJS.Timeout
    const cleanup = () => {
      if (ttsTimer) clearInterval(ttsTimer)
    }
    cleanup()
    if (IS_TESTING) return
    if (!ttsIsActive) {
      ttsTimer = setTimeout(() => {
        dispatch(
          openDialogAction({
            component: DialogNames.Alert,
            componentProps: {
              type: 'message',
              variant: 'colored',
              okButtonLabel: tRef.current(
                'acquisition.dialogs.tts.ok',
                'continue'
              ),
              title: tRef.current(
                'acquisition.dialogs.tts.title',
                'activation'
              ),
              text: tRef.current('acquisition.dialogs.tts.text', 'click ok'),
            } as IAlertProps,
          })
        )
      }, 1000)
    }
    // eslint-disable-next-line consistent-return
    return cleanup
  }, [dispatch, ttsIsActive])

  /** reset routing socket at unmount */
  useEffect(() => {
    return () => {
      console.info('[ROUTING] unmount')
      dispatch(routingUnsubscribeAction())
      dispatch(resetRoutingAction())
    }
  }, [dispatch])

  /** Retrive Camera Exposure and Trigger */
  useEffect(() => {
    dispatch(cameraExposureActions.request())
    dispatch(cameraTriggerActions.request())
  }, [dispatch])

  /** reset notifications at unmount */
  useEffect(() => {
    return () => {
      dispatch(resetNotificationsAction())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** cleanup the planned tracks on unmount */
  useEffect(() => {
    return () => {
      dispatch(deletePlannedPolygonsAction())
      dispatch(clearPlanningHistoryAction())
      dispatch(resetPlanAction())
      // reset the user view
      dispatch(resetUserViewAction())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Handle submenu click */
  const handleSubheaderClick = (a: AvailableIcons) => {
    switch (a) {
      case 'camera_mode':
        dispatch(viewModeAction(ViewMode.CAMERA))
        break
      case 'map_mode':
        dispatch(viewModeAction(ViewMode.MAP))
        break
      case 'pointcloud':
        dispatch(pointcloudActiveAction(!pointcloudActive))
        break
      case 'snapshot':
        if (containerRef.current) {
          const q = gsap.utils.selector(containerRef)
          gsap.killTweensOf(q('img'))
          gsap.set(q('img'), {
            opacity: 0.5,
          })
          gsap.to(q('img'), {
            duration: 0.3,
            opacity: 1,
          })
        }
        break
      case 'planned_tracks':
        // handled inside DataAcquisitionSubHeader to avoid re-renders
        break
      default:
        break
    }
  }

  const onClickCancel = () => {
    dispatch(actionsServiceStartRecordingAbortActions.request())
  }

  const BackToJobs = useMemo(() => {
    /**
     * back button callback
     */
    const onBack = () => {
      dispatch(actionsServiceExitAcquisition())
    }
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div className={style.backToJobs} onClick={onBack}>
        <Icon name="BackArrow" />
        <span>{t('header.back_jobs', 'back to jobs')}</span>
      </div>
    )
  }, [t, dispatch])

  const title = useMemo(() => {
    if (!currentJob) return '--'
    if (planned && recordingStatus === 'done' && autocaptureCurrentPolygon) {
      if (!autocaptureEnabled) return `${currentJob.name}`
      const recordingObject = notCovered.find(
        (path) => path.id === autocaptureCurrentPolygon.id
      )
      if (recordingObject) {
        if (!recordingObject.isPolygon)
          return `${currentJob.name}: ${recordingObject.name}`
        return `${currentJob.name}: ${autocaptureCurrentPolygon?.paths[0].name}`
      }
    } else if (!planned && recordingStatus === 'done') {
      const totTracks = currentJob.scans
      if (totTracks) {
        const trackName = getTrackBaseName(totTracks)
        return `${currentJob.name}: ${trackName}`
      }
    }
    return `${currentJob.name}`
  }, [
    currentJob,
    recordingStatus,
    notCovered,
    autocaptureCurrentPolygon,
    planned,
    autocaptureEnabled,
  ])

  const sidePanelPageHandler = (page: string) => {
    setSidePanelOpened(page)
  }

  return (
    <div className={style.container} ref={containerRef}>
      <AcquisitionFeatures
        myVRProvider={myVRProvider}
        onYawChange={onYawChange}
      />
      {myVRProvider && planned && (
        <AcquisitionPlanFeatures
          myVRProvider={myVRProvider}
          canRecord={canRecord}
          autocaptureFocusView={
            sidePanelOpened !== 'tracks' && !!autocaptureEnabled
          }
        />
      )}
      {myVRProvider && routingEnabled && (
        <AcquisitionRoutingFeatures myVRProvider={myVRProvider} />
      )}
      {myVRProvider && (
        <AcquisitionPositionFeatures myVRProvider={myVRProvider} />
      )}
      <div className={style.header}>
        <Header
          centerText={title}
          pathname={pathname}
          leftCta={deactivationStatus === 'done' && BackToJobs}
        />
        <div className={style.subHeader}>
          <DataAcquisitionSubHeader
            mode={viewMode === ViewMode.MAP ? 'map' : 'camera'}
            activeIcons={activeIcons}
            onClickIcon={handleSubheaderClick}
            planned={currentJob?.planned}
          />
        </div>
      </div>
      {viewMode === ViewMode.CAMERA && validCameraEnabled && (
        <CameraView
          currentGroupIndex={currentCameraGroupIndex}
          leftCameraOrientation={currentJob?.camera?.left?.orientation}
          rightCameraOrientation={currentJob?.camera?.right?.orientation}
        />
      )}
      <canvas
        ref={canvasRef}
        className={classNames({
          [style.myVRCanvas]: true,
          [style.hidden]: viewMode === ViewMode.CAMERA && validCameraEnabled,
        })}
        // to disable right click/onContectMenu in React
        onContextMenu={(e) => e.preventDefault()}
        // onClick={handleClick}
      />
      {viewMode === ViewMode.CAMERA && !validCameraEnabled && (
        <CameraViewDisabled />
      )}
      {viewMode === ViewMode.CAMERA && validCameraEnabled && (
        <CameraPreview
          onSwitchCamera={onSwitchCamera}
          currentGroupIndex={currentCameraGroupIndex}
          leftCameraOrientation={currentJob?.camera?.left?.orientation}
          rightCameraOrientation={currentJob?.camera?.right?.orientation}
        />
      )}
      {showScannerTemperature && (
        <Box className={style.scannerTemperature}>
          <ScannerTemperature unit={currentProject?.coordinate?.unit as Unit} />
        </Box>
      )}
      <div
        className={classNames({
          [style.bottomControls]: true,
        })}
      >
        <div className={style.row1}>
          <div>
            <DataAcquisitionLeftControls
              myVRProvider={myVRProvider}
              viewMode={viewMode}
              ref={arrowRef}
            />
          </div>
          {canRecord && (
            <div className={style.recordingButton}>
              <RecordingButton
                onClick={recordingHandler}
                recording={recording}
                data-testid="recording-button"
                extraInfo={acBadge}
              />
            </div>
          )}
          <div
            className={classNames({
              [style.dataAcquisitionRight]: true,
            })}
          >
            <div className={style.sideButtons}>
              {showRightControls && (
                <DataAcquisitionRightControls
                  onDetailStatusChange={setDetailVisible}
                />
              )}
            </div>
            <div className={style.sidePanel}>
              <SidePanel
                planned={(currentJob?.planned && routingModule) || false}
                viewMode={viewMode}
                myVRProvider={myVRProvider}
                jobInfo={currentJob!}
                onPageClick={sidePanelPageHandler}
              />
            </div>
          </div>
        </div>
        <div className={style.row2}>
          {detailVisible && showRightControls && <DataAcquisitionStatusBar />}
        </div>
        <AcquisitionNotifications />
        <AlignmentToast sx={{ top: '70px', zIndex: 1406 }} />
        <RoutingToast />
      </div>
      {progressMessage && (
        <div className={style.blockScreen} data-testid="progress-layer">
          <div className={style.circularProgress}>
            <CircularProgress />
          </div>
          <div className={style.progressLabel} data-testid="progress-message">
            {progressMessage}
          </div>
          {showCancelButton && (
            <Box sx={{ marginTop: '14px' }}>
              <Button
                onClick={onClickCancel}
                sx={[
                  (theme) => ({
                    ...theme.typography.caption,
                    padding: '2px 8px',
                  }),
                ]}
              >
                {t('acquisition.abort_button_label', 'cancel')}
              </Button>
            </Box>
          )}
        </div>
      )}
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
// AcquisitionView.whyDidYouRender = true
