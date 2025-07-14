import {
  expandedPolygons,
  findNextTrack,
} from 'components/organisms/AcquisitionView/planFeatureshelpers'
import { NextTrackFeature } from 'components/organisms/ActivationView/NextTrackFeature'
import { PolygonFeature } from 'components/organisms/PlanningView/PolygonFeature'
import { SingleIcon } from 'components/organisms/PlanningView/SingleIcon'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  clearPlanningHistoryAction,
  deletePlannedPolygonsAction,
  resetPlanAction,
  selectFinalAlignmentPoint,
  selectinitialAlignmentPoint,
} from 'store/features/planning/slice'
import { PlanningTools, Polygon } from 'store/features/planning/types'
import {
  mapModeAction,
  mapNavigationModeAction,
  selectPlanTracksVisible,
} from 'store/features/position/slice'
import { MapNavigationMode } from 'store/features/position/types'
import {
  selectAutocaptureEnabled,
  selectAutocapturePolygonsEnabled,
  selectCoveredPolygons,
  selectCurrentPolygon,
  selectUncoveredPolygons,
} from 'store/features/routing/slice'
import { AutocapturePolygonsEnabledType } from 'store/features/routing/types'
import { addPlannedTracksLayers } from 'utils/myVR/acquisition/layers'
import { updatePathStyles } from 'utils/myVR/planning/layers'
import { MapMode } from 'utils/myVR/types'

export interface IAcquisitionPlanFeaturesProps {
  /**
   * myVRProvider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * can record state
   */
  canRecord?: boolean
  /**
   * autocapture Focus View state
   */
  autocaptureFocusView?: boolean
}

/**
 * Wraps myVR Features without visual React components, to minimize the impact of rerenders on socket updates
 */
export const AcquisitionPlanFeatures: FC<IAcquisitionPlanFeaturesProps> = ({
  myVRProvider,
  canRecord,
  autocaptureFocusView,
}: PropsWithChildren<IAcquisitionPlanFeaturesProps>) => {
  const dispatch = useDispatch()
  const currentProject = useSelector(selectDataStorageCurrentProject)
  const currentJob = useSelector(selectDataStorageCurrentJob)
  const [canShowPlanning, setCanShowPlanning] = useState<boolean>(false)
  const initial = useSelector(selectinitialAlignmentPoint)
  const final = useSelector(selectFinalAlignmentPoint)
  const planVisible = useSelector(selectPlanTracksVisible)
  const autocapturePolygonsEnabled = useSelector(
    selectAutocapturePolygonsEnabled
  )
  const covered = useSelector(selectCoveredPolygons)
  const notCovered = useSelector(selectUncoveredPolygons)
  const currentTrack = useSelector(selectCurrentPolygon)
  const autocaptureEnabled = useSelector(selectAutocaptureEnabled)
  const [plannedTracksToRender, setPlannedTracksToRender] = useState<Polygon[]>(
    autocapturePolygonsEnabled === AutocapturePolygonsEnabledType.NOTCAPTURED
      ? notCovered
      : covered
  )
  const unit = currentProject?.coordinate?.unit
  const planned = currentJob?.planned

  // useEffect(() => {
  //   console.log('AcquisitionPlanFeatures.tsx (59)', planVisible)
  // }, [
  //   RWC([
  //     currentProject,
  //     currentJob,
  //     plannedTracksOriginal,
  //     canShowPlanning,
  //     plannedTracksToRender,
  //     initial,
  //     final,
  //     planVisible,
  //     unit,
  //     planned,
  //   ]),
  // ])

  const currentTrackPathId = useMemo(() => {
    if (!currentTrack) return
    return currentTrack.paths[0].id
  }, [currentTrack])

  /** add the tracks layer */
  useEffect(() => {
    if (currentProject && planned && myVRProvider) {
      myVRProvider.execute(addPlannedTracksLayers)
      console.info('[MYVR] added planned tracks layer')
    }
  }, [planned, currentProject, myVRProvider, dispatch])

  /** add the planned tracks styles */
  useEffect(() => {
    const visiblePolygons =
      autocapturePolygonsEnabled === AutocapturePolygonsEnabledType.CAPTURED
        ? covered
        : notCovered
    if (myVRProvider) {
      /** for rendering purpose:
       * 1. expand all the paths (also the paths inside polygons)
       * 2. don't show disabled tracks
       */
      const visiblePolygonsExpanded = expandedPolygons(visiblePolygons).filter(
        (vp) => vp.disabled !== true
      )
      myVRProvider.execute(updatePathStyles(visiblePolygonsExpanded, 0))
      console.info('[MYVR] added planned tracks layer style')
      setCanShowPlanning(true)
      /* setPlannedTracksToRender(
        JSON.parse(JSON.stringify(visiblePolygonsExpanded)) as Polygon[]
      ) */
      setPlannedTracksToRender(visiblePolygonsExpanded)
    }
  }, [
    myVRProvider,
    covered,
    notCovered,
    setCanShowPlanning,
    autocapturePolygonsEnabled,
  ])

  /** cleanup the planned tracks on unmount */
  useEffect(() => {
    return () => {
      dispatch(deletePlannedPolygonsAction())
      dispatch(clearPlanningHistoryAction())
      dispatch(resetPlanAction())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** set the navigation mode with plan  */
  useEffect(() => {
    if (planned && myVRProvider) {
      dispatch(mapModeAction(MapMode.MAP_3D))
      dispatch(mapNavigationModeAction(MapNavigationMode.FOLLOW))
    }
  }, [planned, myVRProvider, dispatch])

  const shouldRenderTracks = useMemo(() => {
    return myVRProvider && canShowPlanning && unit && planVisible
  }, [canShowPlanning, myVRProvider, planVisible, unit])

  // next track handler
  const nextTrackToRender = useMemo(() => {
    if (notCovered.length === 0) return null
    const flatPolygonsList = expandedPolygons(notCovered)
    return findNextTrack(flatPolygonsList, currentTrackPathId)
  }, [currentTrackPathId, notCovered])

  const showNextTrack = useMemo(() => {
    return (
      autocaptureEnabled &&
      shouldRenderTracks &&
      nextTrackToRender &&
      notCovered.length > 0 &&
      canRecord
    )
  }, [
    canRecord,
    nextTrackToRender,
    notCovered,
    shouldRenderTracks,
    autocaptureEnabled,
  ])

  const nextTrackHighlightToRender = useMemo(() => {
    if (!showNextTrack) return null
    if (nextTrackToRender!.paths[0].id !== currentTrackPathId) return null
    // flat polygons filtering the current next track
    const flatPolygonsList = expandedPolygons(notCovered).filter(
      (ep) => ep.paths[0].id !== nextTrackToRender!.paths[0].id
    )
    if (flatPolygonsList.length === 0) return null
    return findNextTrack(flatPolygonsList)
  }, [currentTrackPathId, nextTrackToRender, notCovered, showNextTrack])

  return (
    <>
      {shouldRenderTracks &&
        !autocaptureFocusView &&
        // TODO: if this is too expensive we could try to just hide the layer
        plannedTracksToRender.map((track) => (
          <PolygonFeature
            polygon={track}
            key={track.id || track.temp_id}
            myVRProvider={myVRProvider}
            selected={false}
            selectedInternalId={-1} // TODO: PLANNING - implement this
            selectAllInternalTracks={true}
            unit={unit!}
            isAcquisition={true}
            projection={null} // should be the projection of the shapefile or the one used in planning if we don't use the default anymore
          />
        ))}
      {showNextTrack && (
        <NextTrackFeature
          track={nextTrackToRender!}
          key={'nextTrack'}
          myVRProvider={myVRProvider}
          currentTrackId={currentTrackPathId}
        />
      )}
      {nextTrackHighlightToRender && (
        <NextTrackFeature
          track={nextTrackHighlightToRender}
          key={'nextTrackHighlight'}
          myVRProvider={myVRProvider}
          isHighlight={true}
        />
      )}

      {myVRProvider && canShowPlanning && (
        <SingleIcon
          coord={initial}
          group={PlanningTools.INITIAL_POINT}
          myVRProvider={myVRProvider}
          tracklineId={1521}
        />
      )}
      {myVRProvider && canShowPlanning && (
        <SingleIcon
          coord={final}
          group={PlanningTools.FINAL_POINT}
          myVRProvider={myVRProvider}
          tracklineId={1522}
        />
      )}
    </>
  )
}
