import classNames from 'classnames'
import React, { FC, MouseEventHandler } from 'react'
import style from './BigTool.module.scss'

export interface IBigToolProps {
  /**
   * Button onClick event
   */
  onClick: MouseEventHandler<HTMLElement>
  /**
   * Icon inside the button
   */
  icon?: JSX.Element
  /**
   * disabled
   */
  disabled?: boolean
  /**
   * description
   */
  description?: string
  /**
   * selected
   */
  selected?: boolean
}

/**
 * Squared button with an icon
 */
export const BigTool: FC<IBigToolProps> = ({
  onClick,
  icon,
  disabled,
  selected,
  description,
}) => {
  const clickHandler: MouseEventHandler<HTMLButtonElement> = (e) => {
    // prevents dispatching the click when hitting enter
    e.detail !== 0 && onClick && onClick(e)
  }
  return (
    <button
      className={classNames({
        [style.container]: true,
        [style.disabled]: disabled,
        [style.selected]: selected,
      })}
      onClick={clickHandler}
      data-testid="big-tool"
      type="button"
    >
      <div className={style.icon}>{icon}</div>
      <div className={style.description}>{description}</div>
    </button>
  )
}
