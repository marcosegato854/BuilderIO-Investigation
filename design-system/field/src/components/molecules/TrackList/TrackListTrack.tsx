import { TextField, Typography } from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import style from 'components/molecules/TrackList/TrackList.module.scss'
import { TrackSettings } from 'components/molecules/TrackSettings/TrackSettings'
import {
  expandedPolygons,
  findNextTrack,
} from 'components/organisms/AcquisitionView/planFeatureshelpers'
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { DraggableProvided } from 'react-beautiful-dnd'
import { useDispatch, useSelector } from 'react-redux'
import {
  PathSettings,
  PlanningObject,
  Polygon,
} from 'store/features/planning/types'
import {
  selectAutocaptureEnabled,
  selectUncoveredPolygons,
} from 'store/features/routing/slice'
import { AutocaptureTrackListEntityType } from 'store/features/routing/types'
import { selectSystemState } from 'store/features/system/slice'
import { canRecordStates } from 'store/features/system/types'
import { color, name } from 'utils/planning/polygonHelpers'

export interface ITrackListTrack {
  track: PlanningObject
  trackId: number
  internalTrack?: boolean
  planningCurrentTrackId?: number
  routingCurrentTrackId?: number
  provided: DraggableProvided
  onTrackSelection: (id: number) => void
  onChangeName: (track: PlanningObject, newName: string) => void
  onTrackUpdateSettings: (track: PlanningObject, settings: PathSettings) => void
  onTrackListDisable?: (
    entity: AutocaptureTrackListEntityType,
    id: number
  ) => void
  onInternalTrackListDisable?: (
    entity: AutocaptureTrackListEntityType,
    id: number
  ) => void
  onTrackListFlip?: (entity: AutocaptureTrackListEntityType, id: number) => void
  onInternalTrackListFlip?: (
    entity: AutocaptureTrackListEntityType,
    id: number
  ) => void
  isNameLocked?: boolean
  isReadOnly?: boolean
  isAcquisition?: boolean
}

/**
 * TrackListTrack description
 */
export const TrackListTrack: FC<ITrackListTrack> = ({
  track,
  trackId,
  planningCurrentTrackId,
  routingCurrentTrackId,
  provided,
  onTrackSelection,
  onChangeName,
  onTrackUpdateSettings,
  onTrackListDisable,
  onInternalTrackListDisable,
  onTrackListFlip,
  onInternalTrackListFlip,
  isNameLocked,
  isReadOnly,
  isAcquisition,
}: PropsWithChildren<ITrackListTrack>) => {
  const [edit, setEdit] = useState(false)
  const editableNameInput = useRef<HTMLInputElement>()
  const notCovered = useSelector(selectUncoveredPolygons)
  const systemState = useSelector(selectSystemState)
  const state = systemState?.state
  const autocaptureEnabled = useSelector(selectAutocaptureEnabled)

  const inCapture = useMemo(
    () => trackId === routingCurrentTrackId,
    [trackId, routingCurrentTrackId]
  )

  const canRecord = useMemo(() => {
    if (!state) return false
    return canRecordStates.includes(state)
  }, [state])

  const trackReferenceId = useMemo(() => {
    return isAcquisition ? track.id! : trackId
  }, [isAcquisition, track, trackId])

  const nextTrack = useMemo(() => {
    if (notCovered.length === 0) return null
    const flatPolygonsList = expandedPolygons(notCovered)
    return findNextTrack(flatPolygonsList, routingCurrentTrackId)
  }, [notCovered, routingCurrentTrackId])

  const nextTrackHighlight = useMemo(() => {
    if (!nextTrack) return null
    if (nextTrack.paths[0].id !== routingCurrentTrackId) return null
    const flatPolygonsList = expandedPolygons(notCovered).filter(
      (ep) => ep.paths[0].id !== nextTrack!.paths[0].id
    )
    if (flatPolygonsList.length === 0) return null
    return findNextTrack(flatPolygonsList)
  }, [nextTrack, notCovered, routingCurrentTrackId])

  const canFlip = useMemo(() => {
    if (!canRecord) return false
    if (inCapture) return false
    if (!autocaptureEnabled) return false
    if (nextTrackHighlight?.paths[0].id === trackId) return true
    if (nextTrack?.paths[0].id === trackId) return true
    return false
  }, [
    inCapture,
    nextTrack,
    nextTrackHighlight,
    trackId,
    canRecord,
    autocaptureEnabled,
  ])

  const isDisabled = useMemo(() => track.disabled, [track])

  const commitChange = useCallback(() => {
    if (!editableNameInput.current) return
    const { value } = editableNameInput.current
    setEdit(false)
    if (!value?.length) return
    if (!track) return
    if (name(track) === value) return
    onChangeName(track, value)
  }, [track, onChangeName])

  const clickHandler = useCallback(() => {
    if (edit) return
    onTrackSelection(trackReferenceId)
  }, [edit, onTrackSelection, trackReferenceId])

  const handleTrackDisabling = useCallback(() => {
    if (onTrackListDisable) {
      onTrackListDisable(
        AutocaptureTrackListEntityType.TRACK,
        (track as Polygon).paths[0].id!
      )
      return
    }
    if (onInternalTrackListDisable) {
      onInternalTrackListDisable(
        AutocaptureTrackListEntityType.TRACK,
        track.id!
      )
    }
  }, [onInternalTrackListDisable, onTrackListDisable, track])

  const handleTrackFlip = useCallback(() => {
    if (onTrackListFlip) {
      onTrackListFlip(
        AutocaptureTrackListEntityType.TRACK,
        (track as Polygon).paths[0].id!
      )
      return
    }
    if (onInternalTrackListFlip) {
      onInternalTrackListFlip(AutocaptureTrackListEntityType.TRACK, track.id!)
    }
  }, [onInternalTrackListFlip, onTrackListFlip, track])

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

  return (
    <div
      key={trackId}
      {...provided.draggableProps}
      ref={provided.innerRef}
      className={style.area}
      id={`trackRow-${trackId}`}
    >
      <div
        className={classNames({
          [style.track]: true,
          [style.trackSelected]: trackId === planningCurrentTrackId,
          [style.trackInCapture]: inCapture,
          [style.trackDisabled]: isDisabled && !isReadOnly,
        })}
        {...provided.dragHandleProps}
      >
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
        <div className={style.trackClick} onClick={() => clickHandler()}>
          <Icon name="Caret" className={style.trackCaret} />
          {edit && (
            <TextField
              id={`track-${trackId}`}
              className={style.editable}
              variant="standard"
              defaultValue={name(track)}
              autoFocus
              inputRef={editableNameInput}
              inputProps={{ sx: { fontSize: '1.5625rem' } }}
              onBlur={commitChange}
            />
          )}
          {edit || (
            <Typography variant="body2" noWrap={true}>
              {name(track)}
            </Typography>
          )}
        </div>
        <div className={style.trackEdit}>
          {isAcquisition && !inCapture && (
            <>
              {!isDisabled && canFlip && (
                <Icon
                  name="Flip"
                  className={style.flipIcon}
                  onClick={handleTrackFlip}
                  data-testid="flip-button"
                />
              )}
              <Icon
                name="Shutdown"
                className={classNames({
                  [style.disableIcon]: true,
                  [style.disableIconOn]: isDisabled === true,
                })}
                onClick={handleTrackDisabling}
              />
            </>
          )}

          <div
            className={style.trackDot}
            style={{ backgroundColor: color(track) || undefined }}
          />
          {!(isNameLocked || inCapture) && (
            <Icon
              name="EditName"
              className={style.trackIcon}
              onClick={() => setEdit((prevState) => !prevState)}
            />
          )}
        </div>
      </div>
      {trackReferenceId === planningCurrentTrackId && (
        <TrackSettings
          track={track}
          onSettingsUpdate={onTrackUpdateSettings}
          isReadOnly={isReadOnly || inCapture}
        />
      )}
    </div>
  )
}
