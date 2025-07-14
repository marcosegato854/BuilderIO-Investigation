/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Button } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import Aim from 'assets/png/Aim.png'
import classNames from 'classnames'
import { AntennaActions } from 'components/molecules/AntennaActions/AntennaActions'
import { AntennaValues } from 'components/molecules/AntennaValues/AntennaValues'
import { Camera } from 'components/atoms/Camera/Camera'
import { CloseButton } from 'components/atoms/CloseButton/CloseButton'
import { ProgressOverlay } from 'components/atoms/ProgressOverlay/ProgressOverlay'
import style from 'components/dialogs/SecondAntennaConfigurator/SecondAntennaConfigurator.module.scss'
import gsap from 'gsap'
import { curry, DeepPartial } from 'ramda'
import React, {
  ChangeEvent,
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import PrismaZoom from 'react-prismazoom'
import { useDispatch, useSelector } from 'react-redux'
import { apiCallIds as apiCallIdsCamera } from 'store/features/camera/api'
import {
  cameraCalculateAntenna2LeverarmActions,
  select2ndAntennaClient,
} from 'store/features/camera/slice'
import { AntennaClientSettings } from 'store/features/camera/types'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import { apiCallIds as apiCallIdsPosition } from 'store/features/position/api'
import {
  positionGet2ndAntennaSettingsActions,
  resetSecondAntennaAction,
  select2ndAntenna,
} from 'store/features/position/slice'
import { AntennaSettings } from 'store/features/position/types'
import { useTrackProgress } from 'store/services/trackProgress'
import { leverarmWithUnits, metricLeverArm } from 'utils/antenna'
import { forceDocumentRedraw } from 'utils/dom'
import { digits, ftToMt, labelWithUnit, mtToFt } from 'utils/numbers'
import { getThemeByName } from 'utils/themes/mui'
import { checkAntennaValues } from 'utils/jobs'

export type AntennaConfiguration = {
  client: AntennaClientSettings | null
  server: DeepPartial<AntennaSettings>
}

export interface ISecondAntennaConfiguratorProps {
  /**
   * Close handler
   */
  onClose?: React.MouseEventHandler
  /**
   * Save handler
   */
  onSave?: (config: AntennaConfiguration) => void
}

const IMAGE_WIDTH = 7068
const IMAGE_HEIGHT = 3534

/**
 * SecondAntennaConfigurator description
 */
const SecondAntennaConfigurator: FC<ISecondAntennaConfiguratorProps> = ({
  onClose,
  onSave,
}: PropsWithChildren<ISecondAntennaConfiguratorProps>) => {
  const [isLandscape, setIsLandscape] = useState<boolean>(true)
  const [keyboardVisible, setKeyboardVisible] = useState<boolean>(false)
  const [firstImageDone, setFirstImageDone] = useState<boolean>(false)
  const [firstZoomDone, setFirstZoomDone] = useState<boolean>(false)
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const imageContainerEl = useRef<HTMLDivElement | null>(null)
  const targetCenter = useRef<AntennaClientSettings | null>(null)
  const image = useRef<HTMLImageElement | null>(null)
  const marker = useRef<HTMLDivElement | null>(null)
  const antenna = useSelector(select2ndAntenna)
  const apiProgressPosition = useTrackProgress(
    apiCallIdsPosition.POSITION_ANTENNA2
  )
  const apiProgressCamera = useTrackProgress(apiCallIdsCamera.CAMERA_ANTENNA_2)
  const targetCoordinates = useSelector(select2ndAntennaClient)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const zoom = useRef({
    zoom: 1,
    allowZoom: true,
    allowPan: true,
    posX: 0,
    posY: 0,
  })
  const prismaZoom = useRef<{
    zoomToZone: Function
    zoomIn: Function
    reset: Function
  } | null>(null)
  const [distance, setDistance] = useState<string>('')
  const [isClosing, setIsClosing] = useState<boolean>(false)
  /** this is checking if a manual leverarm value was already set */
  const [manual, setManual] = useState<boolean>(
    targetCoordinates?.distance === 0 && !!targetCoordinates?.leverarm
  )
  const unit = currentProject?.coordinate?.unit
  const [manualLeverarm, setManualLeverarm] =
    useState<Partial<LeverArm> | null>(
      targetCoordinates?.leverarm
        ? leverarmWithUnits(unit, targetCoordinates.leverarm)
        : null
    )
  const apiProgress = apiProgressPosition || apiProgressCamera || isClosing

  const leverArm = useMemo(() => {
    if (manual) {
      /* return leverarmWithUnits(unit, manualLeverarm) */
      return {
        x: manualLeverarm?.x || 0,
        y: manualLeverarm?.y || 0,
        z: manualLeverarm?.z || 0,
      }
    }
    if (!antenna?.leverarm) return null
    return leverarmWithUnits(unit, antenna.leverarm)
  }, [antenna, unit, manual, manualLeverarm])

  const saveDisabled = useMemo(() => {
    if (manual) return false
    if (!antenna) return true
    if (!antenna.leverarm) return true
    if (antenna.leverarm.x === 0) return true
    return false
  }, [antenna, manual])

  const loadingMessage = useMemo(
    () =>
      isClosing
        ? t('second_antenna.closing', 'closing')
        : t('second_antenna.loading', 'loading'),
    [isClosing, t]
  )

  const useSavedValues = () => {
    marker.current && gsap.set(marker.current, { visibility: 'hidden' })
    dispatch(positionGet2ndAntennaSettingsActions.request())
  }

  const onZoomChange = (newZoom: number) => {
    zoom.current.zoom = newZoom
  }

  const onPanChange = (newPan: { posX: number; posY: number }) => {
    zoom.current = {
      ...zoom.current,
      ...newPan,
    }
  }

  const close = useCallback(() => {
    console.info('[SECOND ANTENNA] close for real')
    dispatch(closeDialogAction())
    dispatch(resetSecondAntennaAction())
  }, [dispatch])

  const closeHandler = (e: React.MouseEvent) => {
    console.info('[SECOND ANTENNA] [USER_ACTION] user clicked close')
    onClose && onClose(e)
    setIsClosing(true)
  }

  const manualLeverarmHandler = curry(
    (coordinate: 'x' | 'y' | 'z', e: ChangeEvent<HTMLInputElement>) => {
      setManualLeverarm({
        ...manualLeverarm,
        [coordinate]: e.target.value,
      })
    }
  )

  const saveHandler = (e: React.MouseEvent) => {
    if (
      isNaN(Number(leverArm?.x)) ||
      isNaN(Number(leverArm?.y)) ||
      isNaN(Number(leverArm?.z))
    ) {
      const error = {
        name: 'name',
        message: t('job_info.errors.2nd_antenna_missing', 'missing values'),
      }
      dispatch(errorAction(error))
      return
    }
    if (
      leverArm &&
      !checkAntennaValues({ type: 'double', leverarm: leverArm })
    ) {
      const error = {
        name: 'name',
        message: t('job_info.errors.2nd_antenna_invalid', 'invalid values'),
      }
      dispatch(errorAction(error))
      return
    }
    if (
      manual &&
      (!leverArm ||
        (Number(leverArm?.x) === 0 &&
          Number(leverArm?.y) === 0 &&
          Number(leverArm?.z) === 0))
    ) {
      const error = {
        name: 'name',
        message: t('job_info.errors.2nd_antenna_no_manual', 'no manual'),
      }
      dispatch(errorAction(error))
      return
    }
    const manualLeverarmMetric = metricLeverArm(unit, manualLeverarm)
    const payload = {
      client: manual
        ? {
            pixel: {
              x: 0,
              y: 0,
            },
            distance: 0,
            leverarm: manualLeverarmMetric,
          }
        : targetCenter.current,
      server:
        manual && leverArm
          ? {
              enabled: true,
              leverarm: manualLeverarmMetric,
            }
          : antenna,
    }
    console.info('[SECOND ANTENNA] saving values', payload)
    onSave && onSave(payload)
    onClose && onClose(e)
    setIsClosing(true)
  }

  const calculate = () => {
    forceDocumentRedraw() // fixes bug on iOS that returned wrong measurements
    gsap.killTweensOf(deferredCalculate)
    if (keyboardVisible) {
      gsap.delayedCall(1, deferredCalculate)
      return
    }
    deferredCalculate()
  }

  const deferredCalculate = () => {
    if (!imageContainerEl.current) return
    if (!image.current) return
    //
    if (!Number(distance)) {
      const error = {
        name: 'name',
        message: t('job_info.errors.2nd_antenna_no_distance', 'no distance'),
      }
      dispatch(errorAction(error))
      return
    }
    //
    const MIN_DISTANCE = 1.2
    const distanceInMt =
      unit === 'metric' ? Number(distance) : ftToMt(Number(distance))
    if (Number(distanceInMt) < MIN_DISTANCE) {
      const error = {
        name: 'name',
        message: t('job_info.errors.2nd_antenna_min_distance', {
          distance: labelWithUnit('M', mtToFt, MIN_DISTANCE, unit, true),
        }),
      }
      dispatch(errorAction(error))
      return
    }
    //
    const containerRect = imageContainerEl.current.getBoundingClientRect()
    const imageRect = image.current.getBoundingClientRect()
    const ratio = zoom.current.zoom
    const markerPosition = {
      x:
        (-imageRect.left + containerRect?.width / 2 + containerRect.left) /
        ratio,
      y:
        (-imageRect.top + containerRect?.height / 2 + containerRect.top) /
        ratio,
    }
    console.info('[SECOND ANTENNA] markerPosition', markerPosition)
    gsap.set(marker.current, { ...markerPosition, visibility: 'visible' })
    const widthRatioToOriginalPixels =
      image.current?.naturalWidth / (imageRect.width / ratio)
    const heightRatioToOriginalPixels =
      image.current?.naturalHeight / (imageRect.height / ratio)
    if (!widthRatioToOriginalPixels || !heightRatioToOriginalPixels) {
      console.error('[SECOND ANTENNA] error calculating ratios')
      return
    }
    const realPosition = {
      x: markerPosition.x * widthRatioToOriginalPixels,
      y: markerPosition.y * heightRatioToOriginalPixels,
    }
    setDistance(distance || '')
    const antennaClientSettings: AntennaClientSettings = {
      pixel: realPosition,
      distance:
        unit === 'imperial' ? ftToMt(Number(distance)) : Number(distance),
    }
    dispatch(
      cameraCalculateAntenna2LeverarmActions.request(antennaClientSettings)
    )
    targetCenter.current = antennaClientSettings
    console.info('[SECOND ANTENNA] real position', realPosition)
  }

  const userInteractionHandler = () => {
    targetCenter.current = null
    // setDistance('')
    dispatch(resetSecondAntennaAction())
  }

  const zoomToTarget = useCallback((targetPos: { x: number; y: number }) => {
    if (!imageContainerEl.current) return
    if (!image.current) return
    forceDocumentRedraw() // fixes bug on iOS that returned wrong measurements
    const offset = 30
    const ratio = zoom.current.zoom // should be 1 at this point
    const imageRect = image.current.getBoundingClientRect()
    const containerRect = imageContainerEl.current.getBoundingClientRect()
    const displayPosition = {
      x: targetPos.x / (image.current?.naturalWidth / imageRect.width),
      y: targetPos.y / (image.current?.naturalHeight / imageRect.height),
    }
    const horizontalDelta = imageRect.left - containerRect.left
    const verticalDelta = imageRect.top * ratio - containerRect.top
    const zoomToPosition = {
      x: displayPosition.x * ratio + horizontalDelta,
      y: displayPosition.y * ratio + verticalDelta,
    }
    prismaZoom.current &&
      prismaZoom.current.zoomToZone(
        zoomToPosition.x - offset,
        zoomToPosition.y - offset,
        offset * 2,
        offset * 2
      )
  }, [])

  const firstImageCallback = useCallback(() => {
    setFirstImageDone(true)
    dispatch(positionGet2ndAntennaSettingsActions.request())
  }, [dispatch])

  const closedCallback = useCallback(() => {
    console.info('[SECOND ANTENNA] camera socket is closed')
    close()
  }, [close])

  const distanceFocusHandler: React.FocusEventHandler<HTMLInputElement> = (
    event
  ) => {
    const isFocus = event.type === 'focus'
    if (isFocus) {
      setKeyboardVisible(true)
      return
    }
    gsap.delayedCall(0.2, () => {
      try {
        setKeyboardVisible(false)
      } catch (error) {
        console.error(error)
      }
    })
  }

  /** always fit the container without scaling */
  const resizeHandler = useCallback(() => {
    if (!imageContainerEl.current) return
    if (!firstImageDone) return
    const containerRect = imageContainerEl.current.getBoundingClientRect()
    // ratio to fix image into container width
    const ratioW = containerRect.width / IMAGE_WIDTH
    // ratio to fix image into container height
    const ratioH = containerRect.height / IMAGE_HEIGHT
    setIsLandscape(ratioW < ratioH)
  }, [firstImageDone])

  /** register to window resize */
  useEffect(() => {
    window.addEventListener('resize', resizeHandler)
    resizeHandler()
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [resizeHandler])

  /**
   * zoom to target when loading saved values
   * */
  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let timeoutId: NodeJS.Timeout
    const cleanup = () => {
      if (timeoutId) clearInterval(timeoutId)
    }
    cleanup()
    // wait for animation to finish
    if (!imageContainerEl.current) return cleanup
    if (!image.current) return cleanup
    if (!firstImageDone) return cleanup
    if (!targetCoordinates?.pixel?.x) return cleanup
    // need to reset to do calculations without zoom
    prismaZoom.current && prismaZoom.current.reset()
    const convertedDistance =
      unit === 'imperial'
        ? mtToFt(targetCoordinates.distance)
        : targetCoordinates.distance
    timeoutId = setTimeout(() => {
      const roundedDistance = digits(Number(convertedDistance), 3).toString()
      setDistance(roundedDistance)
      zoomToTarget(targetCoordinates.pixel)
    }, 1000)
    console.info('[SECOND ANTENNA] zooming to target')
    return cleanup
  }, [targetCoordinates, unit, zoomToTarget, firstImageDone])

  /**
   * zoom to target at first load
   * */
  useEffect(() => {
    if (firstZoomDone) return
    if (!firstImageDone) return
    if (!targetCoordinates) return
    if (targetCoordinates?.pixel?.x) return
    forceDocumentRedraw() // fixes bug on iOS that returned wrong measurements
    prismaZoom.current && prismaZoom.current.zoomIn(1)
    setFirstZoomDone(true)
  }, [firstImageDone, firstZoomDone, targetCoordinates])

  /**
   * update  manual when loading coordinates
   * */
  useEffect(() => {
    setManual(
      targetCoordinates?.distance === 0 && !!targetCoordinates?.leverarm
    )
    if (targetCoordinates?.leverarm)
      setManualLeverarm(leverarmWithUnits(unit, targetCoordinates.leverarm))
  }, [targetCoordinates, unit])

  const manualImage = '/assets/img/AntennaDual.gif'

  // check here for theme customization: https://mui.com/styles/advanced/
  return (
    <ThemeProvider theme={getThemeByName('dark')}>
      <div
        className={classNames({
          [style.container]: true,
          [style.landscape]: isLandscape,
          [style.portrait]: !isLandscape,
        })}
      >
        <div className={style.header}>
          <div className={style.text}>
            <div className={style.title}>
              {t('second_antenna.title', '2nd antenna')}
            </div>
            <div className={style.subtitle}>
              {t('second_antenna.subtitle', 'instructions')}
            </div>
          </div>
          <div className={style.close}>
            <CloseButton onClick={closeHandler} />
          </div>
        </div>
        <div className={style.content}>
          <div
            className={style.image}
            ref={imageContainerEl}
            onMouseUp={userInteractionHandler}
            onTouchEnd={userInteractionHandler}
          >
            <PrismaZoom
              className={style.prismaZoom}
              onZoomChange={onZoomChange}
              onPanChange={onPanChange}
              maxZoom={20}
              ref={prismaZoom}
              decelerationDuration={0}
            >
              <div className={style.imageWrapper}>
                <div className={style.marker} ref={marker} />
                {isClosing || (
                  <Camera
                    socketEndpoint="/camera/antenna2"
                    ref={image}
                    firstImageCallback={firstImageCallback}
                    closedCallback={closedCallback}
                    // fitMode="Contain"
                    lockOnInteraction={true}
                    // TODO: these dimensions are hardcoded, should be dynamically retrieved after the first load
                    imageProps={{
                      height: IMAGE_HEIGHT,
                      width: IMAGE_WIDTH,
                    }}
                    noWrapper={true}
                  />
                )}
              </div>
            </PrismaZoom>
            {isClosing || <img src={Aim} className={style.aim} alt="aim" />}
            {(!firstImageDone || apiProgress) && (
              <ProgressOverlay display={true} message={loadingMessage} />
            )}
            {manual && (
              <div className={style.manualContainer}>
                <img
                  src={manualImage}
                  className={style.manualImage}
                  alt="TRK"
                />
              </div>
            )}
          </div>
          <div className={style.contentBottom}>
            <div className={style.values}>
              <AntennaValues
                distance={distance}
                distanceFocusHandler={distanceFocusHandler}
                leverArm={leverArm}
                manual={manual}
                manualLeverarmHandler={manualLeverarmHandler}
                setDistance={setDistance}
                userInteractionHandler={userInteractionHandler}
              />
            </div>
            <div className={style.buttons}>
              <AntennaActions
                apiProgress={apiProgress}
                calculate={calculate}
                manual={manual}
                setManual={setManual}
                useSavedValues={useSavedValues}
              />
            </div>
          </div>
        </div>
        <div className={style.footer}>
          <Button
            variant="outlined"
            color="primary"
            data-testid="cancel-button"
            onClick={closeHandler}
          >
            {t('second_antenna.cancel', 'cancel')}
          </Button>
          <Button
            color="primary"
            data-testid="antenna2-confirm-button"
            onClick={saveHandler}
            disabled={saveDisabled}
          >
            {t('second_antenna.save', 'save')}
          </Button>
        </div>
      </div>
    </ThemeProvider>
  )
}
export default SecondAntennaConfigurator
