import { Grid, Tab, Tabs } from '@mui/material'
import { ScrollableOnLeft } from 'components/atoms/ScrollableOnLeft/ScrollableOnLeft'
import { TabPanel } from 'components/atoms/TabPanel/TabPanel'
import style from 'components/molecules/SidePanelTracks/SidePanelTracks.module.scss'
import { TrackList } from 'components/molecules/TrackList/TrackList'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import React, { FC, PropsWithChildren, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { selectActivationDone } from 'store/features/actions/slice'
import { Path, PathSettings, Polygon } from 'store/features/planning/types'
import {
  mapNavigationModeAction,
  mapPanningModeAction,
} from 'store/features/position/slice'
import {
  MapNavigationMode,
  MapPanningMode,
} from 'store/features/position/types'
import {
  autocapturePolygonsEnabledAction,
  autocaptureTrackListActions,
  reorderUncoveredInternalPathsAction,
  reorderUncoveredPathsAction,
  selectAutocapturePolygonsEnabled,
  selectCoveredPolygons,
  selectCurrentPolygon,
  selectTrackIdSelected,
  selectUncoveredPolygons,
  trackIdSelectedAction,
  updateUncoveredInternalPathSettingsAction,
  updateUncoveredPathSettingsAction,
} from 'store/features/routing/slice'
import {
  AutocapturePolygonsEnabledType,
  AutocaptureTrackListActionType,
  AutocaptureTrackListEntityType,
} from 'store/features/routing/types'
import { fitPlanningFeature } from 'utils/myVR/planning/layers'
import { withNewSettings } from 'utils/planning/polygonHelpers'

const changeTab = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  }
}

export interface ISidePanelTracksProps {
  /**
   * myVR provider instance
   */
  myVRProvider?: MyVRProvider
}

/**
 * Side panel that displays Covered and Uncovered Tracks
 */
export const SidePanelTracks: FC<ISidePanelTracksProps> = ({
  myVRProvider,
}: PropsWithChildren<ISidePanelTracksProps>) => {
  const { t } = useTranslation()

  const autocapturePolygonsEnabled = useSelector(
    selectAutocapturePolygonsEnabled
  )
  const [tab, setTab] = useState(
    autocapturePolygonsEnabled === AutocapturePolygonsEnabledType.NOTCAPTURED
      ? 0
      : 1
  )
  const selectedTrackId = useSelector(selectTrackIdSelected)
  // const [selectedTrackId, setSelectedTrackId] = useState(-1)
  const autocaptureCurrentPolygon = useSelector(selectCurrentPolygon)
  const covered: Polygon[] = useSelector(selectCoveredPolygons)
  const notCovered: Polygon[] = useSelector(selectUncoveredPolygons)
  const active = useSelector(selectActivationDone)
  const dispatch = useDispatch()
  // TODO: PLANNING - get it from the store
  const [selectedInternalTrackId, setSelectedInternalTrackId] = useState(-1)
  const changeTabHandler = (event: React.SyntheticEvent, newValue: number) => {
    const enabled =
      newValue === 0
        ? AutocapturePolygonsEnabledType.NOTCAPTURED
        : AutocapturePolygonsEnabledType.CAPTURED
    dispatch(autocapturePolygonsEnabledAction(enabled))
    setTab(newValue)
  }

  const trackSelectionHandler = (id: number, isPolygon?: boolean) => {
    let to: NodeJS.Timeout
    const cleanup = () => {
      if (to) clearTimeout(to)
    }
    cleanup()

    /** if it's a polygon it means it's the "title"
     * in that case we dispatch the id but don't change map modes
     */
    if (isPolygon) {
      const selectedId = id !== selectedTrackId ? id : -1
      dispatch(trackIdSelectedAction(selectedId))
    } else {
      /** dispatch the map mode to freeze the map */
      if (active) {
        dispatch(mapPanningModeAction(MapPanningMode.FREE))
        dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
      }
      if (id !== selectedTrackId) {
        dispatch(trackIdSelectedAction(id))
        /** wait for the map movement to stop, otherwise it interferes with the zoom */
        to = setTimeout(
          () => {
            if (myVRProvider) {
              myVRProvider && myVRProvider.execute(fitPlanningFeature(id))
            }
          },
          active ? 200 : 0
        )
      } else {
        dispatch(trackIdSelectedAction(-1))
      }
    }

    return cleanup
  }

  const internalTrackSelectionHandler = (id: number) => {
    let to: NodeJS.Timeout
    const cleanup = () => {
      if (to) clearTimeout(to)
    }
    cleanup()

    if (id !== selectedInternalTrackId && id !== -1) {
      /** dispatch the map mode to freeze the map */
      if (active) {
        dispatch(mapPanningModeAction(MapPanningMode.FREE))
        dispatch(mapNavigationModeAction(MapNavigationMode.NONE))
      }
      setSelectedInternalTrackId(id)
      // TODO wait for a BE + FE fix
      const newId = id + 1000
      /** wait for the map movement to stop, otherwise it interferes with the zoom */
      to = setTimeout(
        () => {
          if (myVRProvider) {
            myVRProvider && myVRProvider.execute(fitPlanningFeature(newId))
          }
        },
        active ? 200 : 0
      )
    } else {
      setSelectedInternalTrackId(-1)
    }
    return cleanup
  }

  const trackReorderHandler = (from: number, to: number) => {
    dispatch(
      reorderUncoveredPathsAction({
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
      reorderUncoveredInternalPathsAction({
        fromIndex: from,
        toIndex: to,
        polygonId: trackId,
      })
    )
  }

  const trackSettingsHandler = (track: Polygon, settings: PathSettings) => {
    const updatedTrack = withNewSettings(track, settings)
    dispatch(updateUncoveredPathSettingsAction(updatedTrack))
  }

  const internalTrackSettingsHandler = (
    track: Path,
    settings: PathSettings
  ) => {
    dispatch(
      updateUncoveredInternalPathSettingsAction({
        path: track,
        settings,
        polygonId: selectedTrackId,
      })
    )
  }

  const trackListActionHandler = (
    action: AutocaptureTrackListActionType,
    entity: AutocaptureTrackListEntityType,
    id: number
  ) => {
    dispatch(
      autocaptureTrackListActions.request({
        action,
        entity,
        id,
      })
    )
  }

  const emptyFunction = () => {
    // used only to fill the empty assignments
  }

  return (
    <Grid item container className={style.content}>
      <Grid container marginBottom={2}>
        <Tabs value={tab} onChange={changeTabHandler} aria-label="help tabs">
          <Tab
            label={t('side_panel.tracks.not_covered', 'planned')}
            {...changeTab(0)}
          />
          <Tab
            label={t('side_panel.tracks.covered', 'covered')}
            {...changeTab(1)}
          />
        </Tabs>
      </Grid>
      <TabPanel value={tab} index={0} padding={0} cssClass={style.tabPanel}>
        <ScrollableOnLeft>
          <TrackList
            tracks={notCovered}
            planningCurrentTrackID={selectedTrackId}
            routingCurrentTrackID={autocaptureCurrentPolygon?.id}
            routingCurrentTrackPathID={autocaptureCurrentPolygon?.paths[0].id}
            currentInternalTrackID={selectedInternalTrackId}
            myVRProvider={myVRProvider}
            active={active}
            onTrackSelection={trackSelectionHandler}
            onInternalTrackSelection={internalTrackSelectionHandler}
            onTrackReorder={trackReorderHandler}
            onInternalTrackReorder={internalTrackReorderHandler}
            onTrackChangeName={emptyFunction}
            onInternalTrackChangeName={emptyFunction}
            onTrackUpdateSettings={trackSettingsHandler}
            onInternalTrackUpdateSettings={internalTrackSettingsHandler}
            onTrackListAction={trackListActionHandler}
            isNameLocked={true}
            isAcquisition={true}
          />
        </ScrollableOnLeft>
      </TabPanel>
      <TabPanel value={tab} index={1} padding={0} cssClass={style.tabPanel}>
        <ScrollableOnLeft>
          <TrackList
            tracks={covered}
            planningCurrentTrackID={selectedTrackId}
            currentInternalTrackID={selectedInternalTrackId}
            myVRProvider={myVRProvider}
            active={active}
            onInternalTrackSelection={internalTrackSelectionHandler}
            onTrackSelection={trackSelectionHandler}
            onTrackReorder={emptyFunction}
            onInternalTrackReorder={emptyFunction}
            onTrackChangeName={emptyFunction}
            onInternalTrackChangeName={emptyFunction}
            onTrackUpdateSettings={emptyFunction}
            onInternalTrackUpdateSettings={emptyFunction}
            isDragDisabled={true}
            isNameLocked={true}
            isReadOnly={true}
          />
        </ScrollableOnLeft>
      </TabPanel>
    </Grid>
  )
}
