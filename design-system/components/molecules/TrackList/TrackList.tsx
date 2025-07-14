import { Portal } from '@mui/material'
import { TrackListPolygon } from 'components/molecules/TrackList/TrackListPolygon'
import { TrackListTrack } from 'components/molecules/TrackList/TrackListTrack'
import useIsTouchDevice from 'hooks/useIsTouchDevice'
import { MyVRProvider } from 'hooks/useMyVRProvider'
import { FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd'
import { useSelector } from 'react-redux'
import {
  Path,
  PathSettings,
  PlanningObject,
  Polygon,
} from 'store/features/planning/types'
import { selectAutocapturePolygonsEnabled } from 'store/features/routing/slice'
import {
  AutocaptureTrackListActionType,
  AutocaptureTrackListEntityType,
} from 'store/features/routing/types'
import style from './TrackList.module.scss'

export interface ITrackListProps {
  /**
   * list of tracks / polygons to display
   */
  tracks: Polygon[]
  /**
   * id of the currently selected track
   */
  planningCurrentTrackID?: number
  /**
   * id of the currently capturing track
   */
  routingCurrentTrackID?: number
  /**
   * id of the currently capturing track path
   */
  routingCurrentTrackPathID?: number
  /**
   * id of the currently selected internal track
   */
  currentInternalTrackID?: number
  /**
   * myVR provider instance
   */
  myVRProvider?: MyVRProvider
  /**
   * system is active
   */
  active?: boolean
  /**
   * on track selection function
   */
  onTrackSelection: (id: number, isPolygon?: boolean) => void
  /**
   * on internal track selection function
   */
  onInternalTrackSelection: (id: number) => void
  /**
   * on track dragend
   */
  onTrackReorder: (
    source: number,
    destination: number,
    trackId?: number
  ) => void
  /**
   * on internal track dragend
   */
  onInternalTrackReorder: (
    source: number,
    destination: number,
    trackId: number
  ) => void
  /**
   * on filter polygon
   */
  onTracksExtraction?: (track: Polygon) => void
  /**
   * on track change name
   */
  onTrackChangeName: (track: Polygon, newName: string) => void
  /**
   * on internal track change name
   */
  onInternalTrackChangeName: (track: Path, newName: string) => void
  /**
   * on track update settings
   */
  onTrackUpdateSettings: (track: Polygon, settings: PathSettings) => void
  /**
   * on internal track update settings
   */
  onInternalTrackUpdateSettings: (track: Path, settings: PathSettings) => void
  /**
   * on track list actions (disable / flip)
   */
  onTrackListAction?: (
    action: AutocaptureTrackListActionType,
    entity: AutocaptureTrackListEntityType,
    id: number
  ) => void
  /**
   * a flag to control if drag is allowed
   */
  isDragDisabled?: boolean
  /**
   * a flag to control if the name can be edited
   */
  isNameLocked?: boolean
  /**
   * a flag to control if the settings can be edited
   */
  isReadOnly?: boolean
  /**
   * a flag to control if the view is acquisition
   */
  isAcquisition?: boolean
}

/**
 * TrackList description
 */
export const TrackList: FC<ITrackListProps> = ({
  tracks,
  planningCurrentTrackID,
  routingCurrentTrackID,
  routingCurrentTrackPathID,
  currentInternalTrackID,
  myVRProvider,
  active,
  onTrackSelection,
  onInternalTrackSelection,
  onTrackReorder,
  onInternalTrackReorder,
  onTracksExtraction,
  onTrackChangeName,
  onInternalTrackChangeName,
  onTrackUpdateSettings,
  onInternalTrackUpdateSettings,
  onTrackListAction,
  isDragDisabled,
  isNameLocked,
  isReadOnly,
  isAcquisition,
}: PropsWithChildren<ITrackListProps>) => {
  const isTouchDevice = useIsTouchDevice()
  const firstAvailableIdRef = useRef(0)
  const autocapturePolygonsEnabled = useSelector(
    selectAutocapturePolygonsEnabled
  )

  function handleOnDragEnd(result: DropResult) {
    const { source, destination } = result
    if (!destination) return
    if (destination.droppableId !== 'tracks') return
    /** If there's a track in acquisition
     * the destination "0" cannot be reached
     */
    if (isAcquisition && !!routingCurrentTrackPathID) {
      if (destination.index === 0) return
    }
    onTrackReorder(source.index, destination.index)
  }

  const filterPolygon = (track: Polygon) => {
    const id = track.id || track.temp_id
    if (id !== planningCurrentTrackID) {
      onTrackSelection(id as number)
    }
    if (onTracksExtraction) onTracksExtraction(track)
  }

  const onTrackChangeNameHandler = (track: PlanningObject, newName: string) => {
    onTrackChangeName && onTrackChangeName(track as Polygon, newName)
  }

  const onTrackUpdateSettingsHandler = (
    track: PlanningObject,
    settings: PathSettings
  ) => {
    onTrackUpdateSettings && onTrackUpdateSettings(track as Polygon, settings)
  }

  const onTrackListDisableHandler = (
    entity: AutocaptureTrackListEntityType,
    id: number
  ) => {
    onTrackListAction &&
      onTrackListAction(AutocaptureTrackListActionType.DISABLE, entity, id)
  }

  const onTrackListFlipHandler = (
    entity: AutocaptureTrackListEntityType,
    id: number
  ) => {
    onTrackListAction &&
      onTrackListAction(AutocaptureTrackListActionType.FLIP, entity, id)
  }

  const renderCard = (
    provided: DraggableProvided,
    trackId: number,
    track: Polygon
  ) => {
    if (track.isPolygon)
      return (
        <TrackListPolygon
          polygon={track}
          trackId={trackId}
          currentTrackId={planningCurrentTrackID}
          currentInternalTrackId={currentInternalTrackID}
          routingCurrentTrackId={routingCurrentTrackID}
          routingCurrentTrackPathID={routingCurrentTrackPathID}
          provided={provided}
          onTrackSelection={onTrackSelection}
          onInternalTrackSelection={onInternalTrackSelection}
          // onFilterPolygon={filterPolygon} // TODO: disabled until we can distinguist between imported and created polygons
          onChangeName={onTrackChangeName}
          onInternalChangeName={onInternalTrackChangeName}
          onReorderTracks={onInternalTrackReorder}
          onTrackUpdateSettings={onInternalTrackUpdateSettings}
          onTrackListDisable={onTrackListDisableHandler}
          onTrackListFlip={onTrackListFlipHandler}
          isNameLocked={isNameLocked}
          isReadOnly={isReadOnly}
          isAcquisition={isAcquisition}
          dragDisabledCallback={dragDisabled}
        />
      )
    return (
      <TrackListTrack
        track={track}
        trackId={trackId}
        planningCurrentTrackId={planningCurrentTrackID}
        routingCurrentTrackId={routingCurrentTrackPathID}
        provided={provided}
        onTrackSelection={onTrackSelection}
        onChangeName={onTrackChangeNameHandler}
        onTrackUpdateSettings={onTrackUpdateSettingsHandler}
        onTrackListDisable={onTrackListDisableHandler}
        onTrackListFlip={onTrackListFlipHandler}
        isNameLocked={isNameLocked}
        isReadOnly={isReadOnly}
        isAcquisition={isAcquisition}
      />
    )
  }

  /* scroll to selected track when clicking on the map */
  useEffect(() => {
    if (!planningCurrentTrackID || planningCurrentTrackID === -1) return
    const selectedTrack = document.getElementById(
      `trackRow-${planningCurrentTrackID}`
    )
    selectedTrack &&
      selectedTrack.scrollIntoView &&
      selectedTrack.scrollIntoView({ behavior: 'smooth' })
  }, [planningCurrentTrackID])

  const firstIdAvailable = useCallback(() => {
    const id = firstAvailableIdRef.current ?? 0
    firstAvailableIdRef.current += 1
    return id
  }, [])

  /** disable the drag feature if a track is in acquisition */
  const dragDisabled = useCallback(
    (id: number, isPolygon?: boolean) => {
      if (isDragDisabled) return true
      if (isAcquisition && autocapturePolygonsEnabled) {
        if (isPolygon) return routingCurrentTrackID === id
        return routingCurrentTrackPathID === id
      }
      return false
    },
    [
      isDragDisabled,
      isAcquisition,
      autocapturePolygonsEnabled,
      routingCurrentTrackID,
      routingCurrentTrackPathID,
    ]
  )

  const assignTrackId = useCallback(
    (track: Polygon) => {
      if (track.isPolygon)
        return track.id || track.temp_id || firstIdAvailable()
      if (isAcquisition) return track.paths[0].id!
      return track.id || track.temp_id || firstIdAvailable()
    },
    [firstIdAvailable, isAcquisition]
  )

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="tracks">
        {(provided) => (
          <div
            className={style.container}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tracks.map((track, index) => {
              const trackId = assignTrackId(track)
              return (
                <Draggable
                  key={trackId}
                  draggableId={trackId.toString()}
                  index={index}
                  isDragDisabled={dragDisabled(trackId, track.isPolygon)}
                >
                  {/** use portal when dragging, otherwise the item disappears because of the backdrop filter of a parent */}
                  {(providedDraggable, snapshot) => {
                    if (isTouchDevice) {
                      return renderCard(providedDraggable, trackId, track)
                    }
                    return snapshot.isDragging ? (
                      <Portal>
                        {renderCard(providedDraggable, trackId, track)}
                      </Portal>
                    ) : (
                      renderCard(providedDraggable, trackId, track)
                    )
                  }}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
