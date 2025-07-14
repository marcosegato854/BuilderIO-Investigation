/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  selectCurrentPolygon,
  selectTool,
  selectPolygons,
  selectcurrentInternalPathId,
} from 'store/features/planning/slice'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
/* import { useMousePosition } from 'hooks/useMousePosition' */
import useBusyApi from 'components/organisms/PlanningView/useBusyApi'
import { PlanningTools } from 'store/features/planning/types'
import style from 'components/molecules/PlanningUserHints/PlanningUserHints.module.scss'
import { waypoints } from 'utils/planning/polygonHelpers'

/**
 * PlanningUserHints description
 */
export const PlanningUserHints = () => {
  const { t } = useTranslation()
  const userTips = useMemo(() => {
    return {
      starting_point_empty: t(
        'planning.user_tips.starting_point_empty',
        'Draw a new track or a new polygon'
      ),
      initial_point: t('planning.user_tips.initial_point', 'Select initial'),
      final_point: t('planning.user_tips.final_point', 'Select final'),
      starting_point: t(
        'planning.user_tips.starting_point',
        'Select a track or polygon'
      ),
      new_track_start: t(
        'planning.user_tips.new_track_start',
        'Select a track or polygon'
      ),
      new_track: t('planning.user_tips.new_track', 'Click on the map'),
      new_polygon_start: t(
        'planning.user_tips.new_polygon_start',
        'Click on the map'
      ),
      new_polygon: t('planning.user_tips.new_polygon', 'Click on the map'),
      toolbar: t('planning.user_tips.toolbar', 'Click on the map'),
      toolbar_delete: t(
        'planning.user_tips.toolbar_delete',
        'Click on a track or polygon to delete'
      ),
      toolbar_cut: t(
        'planning.user_tips.toolbar_cut',
        'Click on a track to split'
      ),
      toolbar_move: t(
        'planning.user_tips.toolbar_move',
        'Move a point by dragging it'
      ),
      busy: t('planning.user_tips.busy', 'Busy'),
      select_internal_track: t(
        'planning.user_tips.select_internal_track',
        'Select a track'
      ),
      use_tools: t('planning.user_tips.use_tools', 'Use the toolbar to edit'),
      toolbar_delete_internal: t(
        'planning.user_tips.toolbar_delete_internal',
        'Click on a track to delete it'
      ),
    }
  }, [t])

  const [opened, setOpened] = useState<boolean>(true)
  const tool = useSelector(selectTool)
  const tracks = useSelector(selectPolygons)
  const currentTrack = useSelector(selectCurrentPolygon)
  const currentInternalTrackId = useSelector(selectcurrentInternalPathId)
  const hint = useRef<HTMLDivElement>(null)
  const [message, setMessage] = useState(userTips.starting_point_empty)
  const busy = useBusyApi()
  /* // 28 is the margin (10) + the common margin (18) for the sidebars
  useMousePosition(hint, 28, isMobile as boolean) */

  /** change the message according to the
   *  TOOL selected
   */
  useEffect(() => {
    if (busy) {
      setMessage(userTips.busy)
      return
    }
    const {
      starting_point,
      starting_point_empty,
      new_track,
      new_track_start,
      new_polygon,
      new_polygon_start,
      toolbar_move,
      toolbar_cut,
      initial_point,
      final_point,
      use_tools,
      select_internal_track,
      toolbar_delete_internal,
    } = userTips
    switch (tool) {
      case PlanningTools.SELECT:
        if (tracks.length > 0) {
          setMessage(starting_point)
        } else {
          setMessage(starting_point_empty)
        }
        break
      case PlanningTools.SELECT_INTERNAL:
        if (currentInternalTrackId >= 0) {
          setMessage(use_tools)
        } else {
          setMessage(select_internal_track)
        }
        break
      case PlanningTools.DRAW_PATH:
        if (waypoints(currentTrack).length > 0) {
          setMessage(new_track)
        } else {
          setMessage(new_track_start)
        }
        break
      case PlanningTools.DRAW_POLYGON:
        if (waypoints(currentTrack).length > 0) {
          setMessage(new_polygon)
        } else {
          setMessage(new_polygon_start)
        }
        break
      case PlanningTools.DELETE_POLYGON:
        setMessage(userTips.toolbar_delete)
        break
      case PlanningTools.DELETE_PATH:
        setMessage(toolbar_delete_internal)
        break
      case PlanningTools.MOVE_POINT:
        setMessage(toolbar_move)
        break
      case PlanningTools.CUT:
      case PlanningTools.CUT_INTERNAL:
        setMessage(toolbar_cut)
        break
      case PlanningTools.INITIAL_POINT:
        setMessage(initial_point)
        break
      case PlanningTools.FINAL_POINT:
        setMessage(final_point)
        break
      default:
        break
    }
  }, [tool, userTips, tracks, currentTrack, currentInternalTrackId, busy])

  const toggleOpened = () => {
    setOpened(!opened)
  }

  return (
    <div
      className={classNames({
        [style.userHint]: true,
        [style.closed]: !opened,
        // [style.userHintDesktop]: !isMobile,
      })}
      ref={hint}
      onClick={toggleOpened}
    >
      <span className={style.userHintIcon}>
        <Icon name="Help" />
      </span>
      <span className={style.text}>{message}</span>
    </div>
  )
}
