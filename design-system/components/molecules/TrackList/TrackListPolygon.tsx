import { Button, Portal, TextField, Typography } from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DropResult,
  Droppable,
} from 'react-beautiful-dnd'
import { useTranslation } from 'react-i18next'
import {
  Path,
  PathSettings,
  PlanningObject,
  Polygon,
} from 'store/features/planning/types'

import style from 'components/molecules/TrackList/TrackList.module.scss'
import { TrackListTrack } from 'components/molecules/TrackList/TrackListTrack'
import useIsTouchDevice from 'hooks/useIsTouchDevice'
import { AutocaptureTrackListEntityType } from 'store/features/routing/types'
import { polygonPaths, waypoints } from 'utils/planning/polygonHelpers'

export interface ITrackListPolygon {
  polygon: Polygon
  trackId: number
  currentTrackId?: number
  currentInternalTrackId?: number
  routingCurrentTrackId?: number
  routingCurrentTrackPathID?: number
  provided: DraggableProvided
  onTrackSelection: (id: number, isPolygon?: boolean) => void
  onInternalTrackSelection: (id: number) => void
  onFilterPolygon?: (pol: Polygon) => void
  onChangeName: (track: Polygon, newName: string) => void
  onInternalChangeName: (track: Path, newName: string) => void
  onReorderTracks: (
    source: number,
    destination: number,
    trackId: number
  ) => void
  onTrackUpdateSettings: (track: Path, settings: PathSettings) => void
  onTrackListDisable?: (
    entity: AutocaptureTrackListEntityType,
    id: number
  ) => void
  onTrackListFlip?: (entity: AutocaptureTrackListEntityType, id: number) => void
  isNameLocked?: boolean
  isReadOnly?: boolean
  isAcquisition?: boolean
  dragDisabledCallback: (id: number) => boolean
}

/**
 * TrackListPolygon description
 */
export const TrackListPolygon: FC<ITrackListPolygon> = ({
  polygon,
  trackId,
  currentTrackId,
  currentInternalTrackId,
  routingCurrentTrackId,
  routingCurrentTrackPathID,
  provided,
  onTrackSelection,
  onInternalTrackSelection,
  onFilterPolygon,
  onChangeName,
  onInternalChangeName,
  onReorderTracks,
  onTrackUpdateSettings,
  onTrackListDisable,
  onTrackListFlip,
  isNameLocked,
  isReadOnly,
  isAcquisition,
  dragDisabledCallback,
}: PropsWithChildren<ITrackListPolygon>) => {
  const [edit, setEdit] = useState(false)
  const editableNameInput = useRef<HTMLInputElement>()
  const { t } = useTranslation()
  const isTouchDevice = useIsTouchDevice()

  const inCapture = useMemo(
    () => trackId === routingCurrentTrackId,
    [trackId, routingCurrentTrackId]
  )

  const commitChange = useCallback(() => {
    if (!editableNameInput.current) return
    const { value } = editableNameInput.current
    setEdit(false)
    if (!value?.length) return
    if (!polygon) return
    if (polygon.name === value) return
    onChangeName(polygon, value)
  }, [onChangeName, polygon])

  const isDisabled = useMemo(() => polygon.disabled, [polygon])

  const clickHandler = useCallback(
    (id) => {
      if (edit) return
      onTrackSelection(id, true)
    },
    [edit, onTrackSelection]
  )

  const internalTrackSelectionHandler = (id: number) => {
    if (id === currentInternalTrackId) {
      onInternalTrackSelection(-1)
      return
    }
    onInternalTrackSelection(id)
  }

  const handleTrackDisabling = useCallback(() => {
    onTrackListDisable &&
      onTrackListDisable(AutocaptureTrackListEntityType.POLYGON, polygon.id!)
  }, [onTrackListDisable, polygon])

  /**
   * Keyboard interactions
   */
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        commitChange()
      }
    }
    if (!edit) {
      document.removeEventListener('keydown', keyDownHandler)
    } else {
      document.addEventListener('keydown', keyDownHandler)
    }
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [edit, commitChange])

  /**
   * Mouse interactions
   */
  useEffect(() => {
    const mouseDownHandler = (e: MouseEvent) => {
      /* avoid to loose focus on click */
      const element = e.target as HTMLElement
      if (element.tagName.toUpperCase() === 'INPUT') return
      commitChange()
    }
    if (!edit) {
      document.removeEventListener('mousedown', mouseDownHandler)
    } else {
      document.addEventListener('mousedown', mouseDownHandler)
    }
    return () => {
      document.removeEventListener('mousedown', mouseDownHandler)
    }
  }, [edit, commitChange])

  function handleOnDragEnd(result: DropResult) {
    const { source, destination } = result
    if (!destination) return
    if (destination.droppableId !== `polygon-${trackId}`) return
    /** If there's a track in acquisition
     * the destination "0" cannot be reached
     */
    if (isAcquisition && inCapture) {
      if (destination.index === 0) return
    }
    onReorderTracks(source.index, destination.index, trackId)
  }

  const onInternalChangeNameHandler = (
    track: PlanningObject,
    newName: string
  ) => {
    onInternalChangeName && onInternalChangeName(track as Path, newName)
  }

  const onTrackUpdateSettingsHandler = (
    track: PlanningObject,
    settings: PathSettings
  ) => {
    onTrackUpdateSettings && onTrackUpdateSettings(track as Path, settings)
  }

  const renderInternalTrack = (
    track: Path,
    trackID: number,
    providedDraggable: DraggableProvided
  ) => {
    return (
      <TrackListTrack
        track={track}
        trackId={trackID}
        internalTrack={true}
        planningCurrentTrackId={currentInternalTrackId}
        routingCurrentTrackId={routingCurrentTrackPathID}
        provided={providedDraggable}
        onChangeName={onInternalChangeNameHandler}
        onTrackSelection={() => {
          internalTrackSelectionHandler(trackID)
        }}
        onTrackUpdateSettings={onTrackUpdateSettingsHandler}
        onInternalTrackListDisable={onTrackListDisable}
        onInternalTrackListFlip={onTrackListFlip}
        isNameLocked={isNameLocked}
        isReadOnly={isReadOnly}
        isAcquisition={isAcquisition}
      />
    )
  }

  const paths: Path[] = useMemo(() => polygonPaths(polygon) || [], [polygon])

  const renderPolygonTracks = () => {
    if (paths.length > 0) {
      return (
        <div className={style.internalTracks}>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId={`polygon-${trackId}`}>
              {(internalProvided) => (
                <div
                  className={style.container}
                  {...internalProvided.droppableProps}
                  ref={internalProvided.innerRef}
                >
                  {paths.map((track, index) => {
                    const trackID: number = track.id || 0
                    return (
                      <Draggable
                        key={trackID}
                        draggableId={trackID.toString()}
                        index={index}
                        isDragDisabled={dragDisabledCallback(trackID)}
                      >
                        {/** use portal when dragging, otherwise the item disappears because of the backdrop filter of a parent */}
                        {(providedDraggable, snapshot) => {
                          if (isTouchDevice) {
                            return renderInternalTrack(
                              track,
                              trackID,
                              providedDraggable
                            )
                          }
                          return snapshot.isDragging ? (
                            <Portal>
                              {renderInternalTrack(
                                track,
                                trackID,
                                providedDraggable
                              )}
                            </Portal>
                          ) : (
                            renderInternalTrack(
                              track,
                              trackID,
                              providedDraggable
                            )
                          )
                        }}
                      </Draggable>
                    )
                  })}
                  {internalProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )
    }
    if (waypoints(polygon).length > 2 && onFilterPolygon) {
      return (
        <div className={style.trackExtract}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onFilterPolygon(polygon)}
          >
            {t('planning.polygon_plan_filter.extractTracks', 'Extract Tracks')}
          </Button>
        </div>
      )
    }
    return ''
  }

  /* scroll to selected track when clicking on the map */
  useEffect(() => {
    if (!currentInternalTrackId || currentInternalTrackId === -1) return
    const selectedTrack = document.getElementById(
      `trackRow-${currentInternalTrackId}`
    )
    selectedTrack &&
      selectedTrack.scrollIntoView &&
      selectedTrack.scrollIntoView({ behavior: 'smooth' })
  }, [currentInternalTrackId])

  return (
    <div
      key={trackId}
      {...provided.draggableProps}
      ref={provided.innerRef}
      className={style.area}
    >
      <div
        className={classNames({
          [style.track]: true,
          [style.trackSelected]: trackId === currentTrackId,
          [style.trackDisabled]: isDisabled && !isReadOnly,
          [style.trackInCapture]: inCapture,
        })}
        {...provided.dragHandleProps}
      >
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div
          className={style.trackClick}
          onClick={() => {
            clickHandler(trackId as number)
          }}
        >
          <Icon name="Caret" className={style.trackCaret} />
          {edit && (
            <TextField
              id={`polygon-${trackId}`}
              className={style.editable}
              // label="Standard"
              value="Standard"
              variant="standard"
              defaultValue={polygon.name}
              autoFocus
              inputRef={editableNameInput}
              inputProps={{}}
              onBlur={commitChange}
            />
          )}
          {edit || (
            <Typography variant="body2" noWrap={true}>
              {polygon.name}
            </Typography>
          )}
        </div>
        <div className={style.trackEdit}>
          {isAcquisition && (
            <Icon
              name="Shutdown"
              className={classNames({
                [style.disableIcon]: true,
                [style.disableIconOn]: isDisabled === true,
              })}
              onClick={handleTrackDisabling}
            />
          )}
          {/* show the button only if a handler is provided */}
          {onFilterPolygon && (
            <Icon
              name="StreetList"
              className={style.trackIcon}
              onClick={() => onFilterPolygon(polygon)}
            />
          )}
          <div
            className={style.trackDot}
            style={{ backgroundColor: polygon.color }}
          />
          {!isNameLocked && (
            <Icon
              name="EditName"
              className={style.trackIcon}
              onClick={() => setEdit((prevState) => !prevState)}
            />
          )}
        </div>
      </div>
      {trackId === currentTrackId && renderPolygonTracks()}
    </div>
  )
}
