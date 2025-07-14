import { Grid, Tab, Tabs } from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import { DialogNames } from 'components/dialogs/dialogNames'
import style from 'components/molecules/SidePanelJobPlanning/SidePanelJobPlanning.module.scss'
import { TrackList } from 'components/molecules/TrackList/TrackList'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { openDialogAction } from 'store/features/dialogs/slice'
import {
  currentInternalPathAction,
  currentPolygonAction,
  reorderPathsAction,
  reorderPolygonsAction,
  selectCurrentPolygonId,
  selectPolygons,
  selectcurrentInternalPathId,
  toolAction,
  updatePathNameAction,
  updatePathSettingsAction,
  updatePolygonNameAction,
  updatePolygonSettingsAction,
} from 'store/features/planning/slice'
import {
  Path,
  PathSettings,
  PlanningTools,
  Polygon,
  isPolygon,
} from 'store/features/planning/types'
import { fitPlanningFeature } from 'utils/myVR/planning/layers'
import { withNewSettings } from 'utils/planning/polygonHelpers'

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}

export interface ISidePanelJobPlanningPlanProps {
  /**
   * myVR provider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * open status callback
   */
  onStatusChange?: (opened: boolean) => void
}

/**
 * SidePanelJobPlanningPlan description
 */
export const SidePanelJobPlanningPlan: FC<ISidePanelJobPlanningPlanProps> = ({
  myVRProvider,
  onStatusChange,
}: PropsWithChildren<ISidePanelJobPlanningPlanProps>) => {
  const [tab, setTab] = useState(0)
  const { t } = useTranslation()
  const planTracks = useSelector(selectPolygons)
  const currentTrack = useSelector(selectCurrentPolygonId)
  const currentInternalTrack = useSelector(selectcurrentInternalPathId)
  const [opened, setOpened] = useState<boolean>(true)
  const dispatch = useDispatch()
  const sideClickRef = useRef<number | null>(null)

  const changeTabHandler = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === tab) {
      setOpened(!opened)
      onStatusChange && onStatusChange(!opened)
      return
    }
    setTab(newValue)
    setOpened(true)
    onStatusChange && onStatusChange(true)
  }

  const trackSelectionHandler = (id: number) => {
    dispatch(toolAction(PlanningTools.SELECT))
    if (id !== currentTrack) {
      sideClickRef.current = id
      dispatch(currentPolygonAction(id))
      /* This command is repeated in a useEffect to avoid the early/late MyVr draw */
      if (myVRProvider) {
        myVRProvider && myVRProvider.execute(fitPlanningFeature(id))
      }
    } else {
      sideClickRef.current = null
      dispatch(currentPolygonAction(-1))
    }
  }

  const internalTrackSelectionHandler = (id: number) => {
    if (id !== currentInternalTrack) {
      dispatch(currentInternalPathAction(id))
      sideClickRef.current = id
      if (myVRProvider) {
        myVRProvider &&
          myVRProvider.execute(fitPlanningFeature(`${currentTrack}-${id}`))
      }
    } else {
      sideClickRef.current = null
      dispatch(currentInternalPathAction(-1))
    }
  }

  const trackReorderHandler = (from: number, to: number) => {
    dispatch(
      reorderPolygonsAction({
        fromIndex: from,
        toIndex: to,
      })
    )
  }

  const internalTrackReorderHandler = (
    from: number,
    to: number,
    trackId: number
  ) => {
    dispatch(
      reorderPathsAction({
        fromIndex: from,
        toIndex: to,
        polygonId: trackId,
      })
    )
  }

  const tracksExtractionHandler = (track: Polygon) => {
    dispatch(
      openDialogAction({
        component: DialogNames.PolygonPlanFilter,
        componentProps: {
          polygon: track,
        },
      })
    )
  }

  const trackChangeNameHandler = (track: Polygon, nweName: string) => {
    if (isPolygon(track))
      dispatch(updatePolygonNameAction({ ...track, name: nweName }))
  }

  const internalTrackChangeNameHandler = (track: Path, newName: string) => {
    dispatch(
      updatePathNameAction({
        path: { ...track, name: newName },
        polygonId: currentTrack,
      })
    )
  }

  const trackSettingsHandler = (track: Polygon, settings: PathSettings) => {
    dispatch(updatePolygonSettingsAction(withNewSettings(track, settings)))
  }

  const internalTrackSettingsHandler = (
    track: Path,
    settings: PathSettings
  ) => {
    dispatch(
      updatePathSettingsAction({
        path: track,
        settings,
        polygonId: currentTrack,
      })
    )
  }

  const caretClickHandler = () => {
    setOpened(!opened)
  }

  /* Repetition from above fit/zoom to handle MyVR late draw */
  useEffect(() => {
    if (!currentTrack || currentTrack === -1) return
    // avoid the fit/zoom if the click comes from the map
    if (!sideClickRef.current || sideClickRef.current !== currentTrack) return
    if (myVRProvider) {
      myVRProvider && myVRProvider.execute(fitPlanningFeature(currentTrack))
    }
  }, [currentTrack, myVRProvider])

  return (
    <Grid
      item
      container
      className={classNames({
        [style.content]: true,
        [style.expanded]: opened,
      })}
    >
      <Icon
        name="Caret"
        className={classNames({ [style.caret]: true, [style.closed]: !opened })}
        onClick={caretClickHandler}
      />
      {/* <div> */}
      <Grid container>
        <Tabs value={tab} onChange={changeTabHandler} aria-label="help tabs">
          <Tab
            label={t('side_panel.job.plan.title', 'View plan')}
            {...changeTab(0)}
          />
        </Tabs>
      </Grid>

      <TabPanel
        value={tab}
        index={0}
        padding={0}
        cssClass={classNames({
          [style.tabPanelPlan]: true,
          [style.tabPanelPlanOpened]: opened,
        })}
      >
        <TrackList
          tracks={planTracks}
          planningCurrentTrackID={currentTrack}
          currentInternalTrackID={currentInternalTrack}
          myVRProvider={myVRProvider}
          onTrackSelection={trackSelectionHandler}
          onInternalTrackSelection={internalTrackSelectionHandler}
          onTrackReorder={trackReorderHandler}
          onInternalTrackReorder={internalTrackReorderHandler}
          onTracksExtraction={tracksExtractionHandler}
          onTrackChangeName={trackChangeNameHandler}
          onInternalTrackChangeName={internalTrackChangeNameHandler}
          onTrackUpdateSettings={trackSettingsHandler}
          onInternalTrackUpdateSettings={internalTrackSettingsHandler}
        />
      </TabPanel>
      {/* </div> */}
    </Grid>
  )
}
