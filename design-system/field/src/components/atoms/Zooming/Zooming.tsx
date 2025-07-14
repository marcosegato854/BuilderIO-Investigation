/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { FC, MouseEventHandler, useEffect, useRef } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import style from './Zooming.module.scss'

export interface IZoomingProps {
  /**
   * Plus button onClick event
   */
  onPlusClick: MouseEventHandler<HTMLElement>
  /**
   * Minus button onClick event
   */
  onMinusClick: MouseEventHandler<HTMLElement>
}

/**
 * Button used to zoom in and out of the map
 */
export const Zooming: FC<IZoomingProps> = ({
  onPlusClick,
  onMinusClick,
}: IZoomingProps) => {
  const intervalRef = useRef<NodeJS.Timeout>()
  const isTouchDeviceRef = useRef<boolean>(false)
  /**
   * on mouseDown / touchStart create an interval and fire continuosly the event
   */
  const startZoomHandle = (
    f: MouseEventHandler<HTMLElement>,
    touchEvent: boolean
  ) => {
    isTouchDeviceRef.current = touchEvent
    if (intervalRef.current) clearInterval(intervalRef.current)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intervalRef.current = setInterval(f, 100) as any
  }

  const stopZoomHandle = (event: string) => {
    if (isTouchDeviceRef.current) {
      if (event !== 'touchEnd') return
    }
    intervalRef.current && clearInterval(intervalRef.current)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className={style.zooming} data-testid="zooming">
      <button
        type="button"
        className={classNames({
          [style.button]: true,
          [style.buttonUp]: true,
        })}
        onMouseDown={() => startZoomHandle(onPlusClick, false)}
        onMouseUp={() => stopZoomHandle('mouseUp')}
        onMouseOut={() => stopZoomHandle('mouseOut')}
        onTouchStart={() => startZoomHandle(onPlusClick, true)}
        onTouchEnd={() => stopZoomHandle('touchEnd')}
        data-testid="zoom-in"
      >
        <div className={style.icon}>
          <Icon name="Plus" />
        </div>
      </button>
      <button
        type="button"
        className={classNames({
          [style.button]: true,
          [style.buttonDown]: true,
        })}
        onMouseDown={() => startZoomHandle(onMinusClick, false)}
        onMouseUp={() => stopZoomHandle('mouseUp')}
        onMouseOut={() => stopZoomHandle('mouseOut')}
        onTouchStart={() => startZoomHandle(onMinusClick, true)}
        onTouchEnd={() => stopZoomHandle('touchEnd')}
        data-testid="zoom-out"
      >
        <div className={style.icon}>
          <Icon name="Minus" />
        </div>
      </button>
    </div>
  )
}
