import { CustomSlider } from 'components/atoms/CustomSlider/CustomSlider'
import { OpenSelectbox } from 'components/atoms/OpenSelectbox/OpenSelectbox'
import {
  cameraEnableOptions,
  cameraEnableOptionsAdmin,
  collectionmodeOptions,
} from 'components/dialogs/NewJobForm/options'
import { getRangesForCoordinateSystem } from 'components/dialogs/NewJobForm/ranges'
import {
  getMaxSpeed,
  speedForScanlineSpacing,
} from 'components/dialogs/NewJobForm/utils'
import style from 'components/molecules/TrackSettings/TrackSettings.module.scss'
import { compose } from 'ramda'
import { FC, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selectIsAdmin } from 'store/features/auth/slice'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  PathCollectionMode,
  PathSettings,
  PlanningObject,
} from 'store/features/planning/types'
import {
  selectRoutingEnabled,
  selectRoutingModule,
} from 'store/features/routing/slice'
import { selectScannerSupportedSettings } from 'store/features/scanner/slice'
import { selectSystemInfo } from 'store/features/system/slice'
import { cmToIn, ftToMt, inToCm, kmToM, mtToFt, unitLabel } from 'utils/numbers'
import { defaultSettings, settings } from 'utils/planning/polygonHelpers'

export interface ITrackSettingsProps {
  /**
   * track with settings
   */
  track: PlanningObject
  /**
   * on settings update
   */
  onSettingsUpdate: (track: PlanningObject, settings: PathSettings) => void
  /**
   * covered tracks in acquisition
   */
  isReadOnly?: boolean
}

/**
 * TrackSettings description
 */
export const TrackSettings: FC<ITrackSettingsProps> = ({
  track,
  onSettingsUpdate,
  isReadOnly,
}: PropsWithChildren<ITrackSettingsProps>) => {
  const { t } = useTranslation()
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const isAdmin = useSelector(selectIsAdmin)
  const supportedSettings = useSelector(selectScannerSupportedSettings)
  const routingModule = useSelector(selectRoutingModule)
  const routingEnabled = useSelector(selectRoutingEnabled)
  const systemInfo = useSelector(selectSystemInfo)
  const unit = currentProject?.coordinate?.unit
  const imperial = useMemo(() => {
    return unit === 'imperial'
  }, [unit])

  const disabled = useMemo(() => {
    if (!routingModule) return true
    return isReadOnly
  }, [isReadOnly, routingModule])

  /** derived value */
  const ranges = useMemo(() => {
    return getRangesForCoordinateSystem(supportedSettings)
  }, [supportedSettings])

  /** derived value */
  const trackSettings = useMemo(() => {
    return settings(track) || defaultSettings()
  }, [track])

  /* show the scanline spacing only if it's not a TRK100 or TRK300 */
  const showScanlineSpacing = useMemo(() => {
    if (!systemInfo) return false
    return systemInfo?.product !== 'PEGASUS TRK100' && systemInfo?.product !== 'PEGASUS TRK300'
  }, [systemInfo])

  const drivingSpeed = useMemo(() => {
    if (!currentProject?.coordinate) return 0
    if (!currentJob?.scanner) return 0
    /* if (trackSettings.drivingSpeed) return trackSettings.drivingSpeed */
    const frameDistance = trackSettings.camera.distance
    const { scanlineSpacing } = trackSettings.scanner
    const speedInKm = getMaxSpeed(
      frameDistance,
      scanlineSpacing,
      currentJob.scanner.rotationspeed,
      'Optech'
    )
    const out = imperial ? compose(Math.round, kmToM)(speedInKm) : speedInKm
    return out
  }, [currentProject, currentJob, trackSettings, imperial])

  return (
    <div className={style.container}>
      <div className={style.sliderField} data-testid="camera-enabled">
        <p>{t('side_panel.settings.camera', 'camera')}</p>
        <OpenSelectbox
          value={trackSettings.camera.enable}
          options={isAdmin ? cameraEnableOptionsAdmin() : cameraEnableOptions()}
          disabled={disabled}
          onChange={(newValue) => {
            if (!currentJob?.scanner) return
            if (!unit) return
            const frameDistance = imperial
              ? compose(Math.round, ftToMt)(trackSettings.camera.distance)
              : trackSettings.camera.distance
            const scanlineSpacing = imperial
              ? compose(
                  Math.round,
                  inToCm
                )(trackSettings.scanner.scanlineSpacing)
              : trackSettings.scanner.scanlineSpacing
            const newDrivingSpeed =
              (Number(newValue) as 0 | 1 | 2) === 1
                ? getMaxSpeed(
                    frameDistance,
                    scanlineSpacing,
                    currentJob.scanner.rotationspeed,
                    'Optech'
                  )
                : speedForScanlineSpacing(
                    scanlineSpacing,
                    currentJob.scanner.rotationspeed
                  )
            onSettingsUpdate(track, {
              ...trackSettings,
              camera: {
                ...trackSettings.camera,
                enable: Number(newValue) as 0 | 1 | 2,
                distance: frameDistance,
              },
              scanner: {
                range: trackSettings.scanner.range,
                scanlineSpacing,
              },
              drivingSpeed: newDrivingSpeed,
            })
          }}
        />
      </div>
      {trackSettings.camera.enable === 1 && (
        <div className={style.sliderField} data-testid="camera-distance">
          <p>{t('side_panel.settings.image_distance', 'Image distance')}</p>
          <CustomSlider
            unit={unitLabel('M', unit)}
            value={
              imperial
                ? compose(Math.round, mtToFt)(trackSettings.camera.distance)
                : trackSettings.camera.distance
            }
            min={
              imperial
                ? compose(Math.round, mtToFt)(ranges.cameraDistance.min)
                : ranges.cameraDistance.min
            }
            max={
              imperial
                ? compose(Math.round, mtToFt)(ranges.cameraDistance.max)
                : ranges.cameraDistance.max
            }
            disabled={disabled}
            onChangeCommitted={(event, newValue) => {
              if (!currentJob?.scanner) return
              if (!unit) return
              const frameDistance = imperial
                ? Number(ftToMt(newValue as number).toFixed(2))
                : (newValue as number)
              const newDrivingSpeed = getMaxSpeed(
                frameDistance as number,
                trackSettings.scanner.scanlineSpacing,
                currentJob.scanner.rotationspeed,
                'Optech'
              )
              onSettingsUpdate(track, {
                ...trackSettings,
                camera: {
                  ...trackSettings.camera,
                  distance: frameDistance as number,
                },
                scanner: {
                  range: trackSettings.scanner.range,
                  scanlineSpacing: trackSettings.scanner.scanlineSpacing,
                },
                drivingSpeed: newDrivingSpeed,
              })
            }}
          />
        </div>
      )}
      {trackSettings.camera.enable === 2 && (
        <div className={style.sliderField} data-testid="camera-elapse">
          <p>{t('side_panel.settings.image_elapse', 'image elapse')}</p>
          <CustomSlider
            unit={unitLabel('MS', unit)}
            value={trackSettings.camera.elapse}
            min={ranges.cameraElapse.min}
            max={ranges.cameraElapse.max}
            disabled={disabled}
            onChangeCommitted={(event, newValue) => {
              onSettingsUpdate(track, {
                ...trackSettings,
                camera: {
                  ...trackSettings.camera,
                  elapse: Number(newValue),
                },
              })
            }}
          />
        </div>
      )}
      {showScanlineSpacing && (
        <div className={style.sliderField} data-testid="scanline-spacing">
          <p>{t('side_panel.settings.scanline_spacing', 'scanline')}</p>
          <CustomSlider
            unit={unitLabel('CM', unit)}
            value={
              imperial
                ? compose(
                    Math.round,
                    cmToIn
                  )(trackSettings.scanner.scanlineSpacing!)
                : trackSettings.scanner.scanlineSpacing
            }
            min={
              imperial
                ? compose(Math.round, cmToIn)(ranges.scannerScanlineSpacing.min!)
                : ranges.scannerScanlineSpacing.min
            }
            max={
              imperial
                ? compose(Math.round, cmToIn)(ranges.scannerScanlineSpacing.max!)
                : ranges.scannerScanlineSpacing.max
            }
            disabled={disabled}
            onChangeCommitted={(event, newValue) => {
              if (!currentJob?.scanner) return
              if (!unit) return
              const scanlineSpacing = imperial
                ? compose(Math.round, inToCm)(newValue as number)
                : (newValue as number)
              const newDrivingSpeed =
                trackSettings.camera.enable === 1
                  ? getMaxSpeed(
                      trackSettings.camera.distance,
                      scanlineSpacing,
                      currentJob.scanner.rotationspeed,
                      'Optech'
                    )
                  : speedForScanlineSpacing(
                      scanlineSpacing,
                      currentJob.scanner.rotationspeed
                    )
              onSettingsUpdate(track, {
                ...trackSettings,
                scanner: {
                  ...trackSettings.scanner,
                  range: trackSettings.scanner.range,
                  scanlineSpacing,
                },
                drivingSpeed: newDrivingSpeed,
              })
            }}
          />
        </div>
      )}
      <div className={style.sliderField} data-testid="max-speed">
        <p>{t('side_panel.settings.max_speed', 'max_speed')}</p>
        <CustomSlider
          unit={unitLabel('KMH', unit)}
          value={drivingSpeed}
          min={ranges.drivingspeed.min}
          max={ranges.drivingspeed.max}
          disabled
        />
      </div>
      {routingEnabled && (
        <div className={style.sliderField}>
          <p>{t('side_panel.settings.collection_mode', 'collection')}</p>
          <OpenSelectbox
            value={
              trackSettings.collection.multiple
                ? PathCollectionMode.BOTHWAYS
                : PathCollectionMode.ONEWAY
            }
            options={collectionmodeOptions()}
            disabled={disabled}
            onChange={(newValue) => {
              onSettingsUpdate(track, {
                ...trackSettings,
                collection:
                  newValue === PathCollectionMode.ONEWAY
                    ? { multiple: false }
                    : { multiple: true, forward: 1, backward: 1 },
              })
            }}
          />
        </div>
      )}
    </div>
  )
}
