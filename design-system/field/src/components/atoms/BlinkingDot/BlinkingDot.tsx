import classNames from 'classnames'
import React, { FC } from 'react'
import style from './BlinkingDot.module.scss'

export interface IBlinkingDotProps {
  blinking?: boolean
}

/**
 * Squared button with an icon
 */
export const BlinkingDot: FC<IBlinkingDotProps> = ({ blinking = true }) => {
  return (
    <div className={style.container}>
      <div
        className={classNames({
          [style.dot]: true,
          [style.blinking]: blinking,
        })}
      >
        &nbsp;
      </div>
    </div>
  )
}
