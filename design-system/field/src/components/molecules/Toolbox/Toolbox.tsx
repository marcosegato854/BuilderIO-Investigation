import React, { FC, useMemo, useState } from 'react'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import { PlanningActions, PlanningTools } from 'store/features/planning/types'
import style from './Toolbox.module.scss'

export interface IToolboxProps {
  /**
   * callback on selection
   */
  onSelect: (tool: PlanningTools) => void
  /**
   * callback on selection
   */
  onAction: (action: PlanningActions) => void
  /**
   * item to select
   */
  selected?: PlanningTools
  /**
   * item to select
   */
  disabled?: (PlanningTools | PlanningActions)[]
}

/**
 * Toolbox description
 */
export const Toolbox: FC<IToolboxProps> = ({
  onSelect,
  onAction,
  selected,
  disabled,
}: IToolboxProps) => {
  const [open, setOpen] = useState(false)

  const handleClick = () => setOpen(!open)
  const handleOptionClick = (newTool: PlanningTools) => {
    onSelect(newTool)
  }
  const handleUndo = () => onAction(PlanningActions.UNDO)
  const handleRedo = () => onAction(PlanningActions.REDO)

  const isPolygonWithTracksSelected = useMemo(
    () =>
      selected &&
      [
        PlanningTools.CUT_INTERNAL,
        PlanningTools.DELETE_PATH,
        PlanningTools.SELECT_INTERNAL,
      ].includes(selected),
    [selected]
  )

  return (
    <div className={style.toolbox}>
      {open && (
        <ul className={style.list}>
          {/* <li className={style.item}>
            <button
              type="button"
              onClick={() => handleOptionClick(PlanningTools.DELETE_POLYGON)}
              className={classNames({
                [style.selected]: selected === PlanningTools.DELETE_POLYGON,
                [style.disabled]: disabled?.includes(
                  PlanningTools.DELETE_POLYGON
                ),
              })}
            >
              <DeletePolygon />
            </button>
          </li> */}
          {/* <li className={style.item}>
            <button
              type="button"
              onClick={() => handleOptionClick(PlanningTools.DELETE_TRACK)}
              className={classNames({
                [style.selected]: selected === PlanningTools.DELETE_TRACK,
                [style.disabled]: disabled?.includes(
                  PlanningTools.DELETE_TRACK
                ),
              })}
            >
              <DeleteTrack />
            </button>
          </li> */}
          {isPolygonWithTracksSelected || (
            <li className={style.item}>
              <button
                type="button"
                onClick={() => handleOptionClick(PlanningTools.DELETE_POLYGON)}
                className={classNames({
                  [style.selected]: selected === PlanningTools.DELETE_POLYGON,
                  [style.disabled]: disabled?.includes(
                    PlanningTools.DELETE_POLYGON
                  ),
                })}
              >
                <Icon name="DeleteTool" />
              </button>
            </li>
          )}
          {isPolygonWithTracksSelected || (
            <li className={style.item}>
              <button
                type="button"
                onClick={() => handleOptionClick(PlanningTools.CUT)}
                className={classNames({
                  [style.selected]: selected === PlanningTools.CUT,
                  [style.disabled]: disabled?.includes(PlanningTools.CUT),
                })}
              >
                <Icon name="Scissor" />
              </button>
            </li>
          )}
          {isPolygonWithTracksSelected && (
            <li className={style.item}>
              <button
                type="button"
                onClick={() => handleOptionClick(PlanningTools.DELETE_PATH)}
                className={classNames({
                  [style.selected]: selected === PlanningTools.DELETE_PATH,
                  [style.disabled]: disabled?.includes(
                    PlanningTools.DELETE_PATH
                  ),
                })}
              >
                <Icon name="DeleteTool" />
              </button>
            </li>
          )}
          {isPolygonWithTracksSelected && (
            <li className={style.item}>
              <button
                type="button"
                onClick={() => handleOptionClick(PlanningTools.CUT_INTERNAL)}
                className={classNames({
                  [style.selected]: selected === PlanningTools.CUT_INTERNAL,
                  [style.disabled]: disabled?.includes(
                    PlanningTools.CUT_INTERNAL
                  ),
                })}
              >
                <Icon name="Scissor" />
              </button>
            </li>
          )}
          <li className={style.item}>
            <button
              type="button"
              onClick={() => handleOptionClick(PlanningTools.MOVE_POINT)}
              className={classNames({
                [style.selected]: selected === PlanningTools.MOVE_POINT,
                [style.disabled]: disabled?.includes(PlanningTools.MOVE_POINT),
              })}
            >
              <Icon name="MoveVertex" />
            </button>
          </li>
          <li className={style.item}>
            <button
              type="button"
              onClick={handleUndo}
              className={classNames({
                [style.disabled]: disabled?.includes(PlanningActions.UNDO),
              })}
            >
              <Icon name="Undo" />
            </button>
          </li>
          <li className={style.item}>
            <button
              type="button"
              onClick={handleRedo}
              className={classNames({
                [style.disabled]: disabled?.includes(PlanningActions.REDO),
              })}
            >
              <Icon name="Redo" />
            </button>
          </li>
        </ul>
      )}

      <button
        type="button"
        className={classNames({
          [style.toggleButton]: true,
          [style.toggleButtonOpen]: open,
        })}
        onClick={handleClick}
      >
        {open ? <Icon name="Close2" /> : <Icon name="Wrench" />}
      </button>
    </div>
  )
}
