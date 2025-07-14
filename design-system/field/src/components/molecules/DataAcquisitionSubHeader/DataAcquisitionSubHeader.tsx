import { Icon } from 'components/atoms/Icon/Icon'
import { SingleTool } from 'components/atoms/SingleTool/SingleTool'
import style from 'components/molecules/DataAcquisitionSubHeader/DataAcquisitionSubHeader.module.scss'
import { FC, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  cameraSnapshotActions,
  selectCameraEnabled,
} from 'store/features/camera/slice'
import { selectPointcloudModule } from 'store/features/pointcloud/slice'
import {
  planTracksVisibleAction,
  selectPlanTracksVisible,
} from 'store/features/position/slice'
import { selectCurrentPolygon } from 'store/features/routing/slice'
import { selectSystemState } from 'store/features/system/slice'
import { settings } from 'utils/planning/polygonHelpers'

export type AvailableIcons =
  | 'map_mode'
  | 'snapshot'
  | 'camera_mode'
  | 'pointcloud'
  | 'tag'
  | 'planned_tracks'

interface ClickIconHandler {
  (a: AvailableIcons): void
}
export interface IDataAcquisitionSubHeaderProps {
  /**
   * Display a different set of buttons
   */
  mode: 'map' | 'camera'
  /**
   * array of active icons
   */
  activeIcons?: AvailableIcons[]
  /**
   * callback when an icon is clicked
   */
  onClickIcon?: ClickIconHandler
  /**
   * callback when an icon is clicked
   */
  planned?: boolean
}

/**
 * DataAcquisitionSubHeader description
 */
export const DataAcquisitionSubHeader: FC<IDataAcquisitionSubHeaderProps> = ({
  mode = 'map',
  activeIcons = [],
  onClickIcon = (clicked): void => {},
  planned,
}: PropsWithChildren<IDataAcquisitionSubHeaderProps>) => {
  const { t } = useTranslation()
  const systemState = useSelector(selectSystemState)
  const currentRoutingPolygon = useSelector(selectCurrentPolygon)
  const cameraEnabled = useSelector(selectCameraEnabled)
  const dispatch = useDispatch()
  const planVisible = useSelector(selectPlanTracksVisible)
  const pointcloudModule = useSelector(selectPointcloudModule)

  const validCameraEnabled = useMemo(() => {
    if (currentRoutingPolygon) {
      const polygonSettings = settings(currentRoutingPolygon)
      return polygonSettings?.camera.enable
    }
    if (cameraEnabled === 'None') return 0
    if (cameraEnabled === 'Distance') return 1
    return 2
  }, [cameraEnabled, currentRoutingPolygon])

  const canTakeSnapshot = useMemo(() => {
    return systemState?.state === 'Recording' && validCameraEnabled !== 0
  }, [validCameraEnabled, systemState])

  const mapHandler = () => onClickIcon('map_mode')
  const cameraHandler = () => onClickIcon('camera_mode')

  /** DISABLED PEF-1208  */
  // const tagHandler = () => onClickIcon('tag')
  const snapshotHandler = () => {
    dispatch(cameraSnapshotActions.request())
    onClickIcon && onClickIcon('snapshot')
  }
  const pointCloudHandler = () => onClickIcon('pointcloud')
  const plannedTracksHandler = () => {
    dispatch(planTracksVisibleAction(!planVisible))
    console.info(
      `[ACQUISITION] [USER_ACTION] the user changed plan tracks visibility to ${!planVisible}`
    )
    return onClickIcon('planned_tracks')
  }

  return (
    <div className={style.container}>
      {mode === 'camera' && (
        <>
          <div>
            <SingleTool
              icon={<Icon name="MapMode" />}
              tooltipMessage={t('acquisition.tooltips.map_mode', 'Map')}
              onClick={mapHandler}
              selected={activeIcons.includes('map_mode')}
              transparent
            />
          </div>
          {canTakeSnapshot ? (
            <div>
              <SingleTool
                icon={<Icon name="Snapshot" data-testid="snapshot-button" />}
                tooltipMessage={t(
                  'acquisition.tooltips.take_snapshot',
                  'Snapshot'
                )}
                onClick={snapshotHandler}
                selected={activeIcons.includes('snapshot')}
                transparent
              />
            </div>
          ) : null}
        </>
      )}
      {mode === 'map' && (
        <>
          <div>
            <SingleTool
              icon={<Icon name="CameraMode" />}
              tooltipMessage={t('acquisition.tooltips.camera_mode', 'Camera')}
              onClick={cameraHandler}
              selected={activeIcons.includes('camera_mode')}
              transparent
            />
          </div>
          {pointcloudModule && (
            <div>
              <SingleTool
                icon={<Icon name="PointCloud" />}
                tooltipMessage={t(
                  'acquisition.tooltips.pointcloud',
                  'PointCloud'
                )}
                onClick={pointCloudHandler}
                selected={activeIcons.includes('pointcloud')}
                transparent
              />
            </div>
          )}
          {planned && (
            <div>
              <SingleTool
                icon={<Icon name="ScanRangeOff" />}
                tooltipMessage={t(
                  'acquisition.tooltips.planned_tracks',
                  'plan'
                )}
                onClick={plannedTracksHandler}
                selected={planVisible}
                dataTestId="planned_tracks"
                transparent
              />
            </div>
          )}
        </>
      )}
      {/* DISABLED PEF-1208
      <div>
        <SingleTool
          icon={<Tag />}
          tooltipMessage={t('acquisition.tooltips.add_tag', 'Tag')}
          onClick={tagHandler}
          selected={activeIcons.includes('tag')}
          transparent
        />
      </div> */}
    </div>
  )
}
