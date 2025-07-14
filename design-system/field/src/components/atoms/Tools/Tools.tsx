import React, { FC, MouseEventHandler } from 'react'

import classNames from 'classnames'
import style from './Tools.module.scss'

export type Tool = 'first' | 'second'
export interface IToolsProps {
  /**
   * Icon inside the left button
   */
  leftIcon?: JSX.Element
  /**
   * Icon inside the right button
   */
  rightIcon?: JSX.Element
  /**
   * Left button onClick event
   */
  onLeftClick: MouseEventHandler<HTMLElement>
  /**
   * Right button onClick event
   */
  onRightClick: MouseEventHandler<HTMLElement>
  /**
   * Selected tools
   */
  selected?: Tool[]
  /**
   * Disabled tools
   */
  disabled?: Tool[]
}

/**
 * Two buttons glued together
 */
export const Tools: FC<IToolsProps> = ({
  leftIcon,
  rightIcon,
  onLeftClick,
  onRightClick,
  selected,
  disabled,
}: IToolsProps) => {
  return (
    <div className={style.tools} data-testid="tools">
      <button
        type="button"
        className={classNames({
          [style.button]: true,
          [style.buttonLeft]: true,
          [style.selected]: selected && selected.includes('first'),
          [style.disabled]: disabled && disabled.includes('first'),
        })}
        onClick={onLeftClick}
      >
        <div className={style.icon}>{leftIcon}</div>
      </button>
      <button
        type="button"
        className={classNames({
          [style.button]: true,
          [style.buttonRight]: true,
          [style.selected]: selected && selected.includes('second'),
          [style.disabled]: disabled && disabled.includes('second'),
          // [style.disabled]: true,
        })}
        onClick={onRightClick}
      >
        <div className={style.icon}>{rightIcon}</div>
      </button>
    </div>
  )
}
