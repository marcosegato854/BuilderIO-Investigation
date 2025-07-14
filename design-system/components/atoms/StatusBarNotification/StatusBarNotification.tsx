import classNames from 'classnames'
import useUA from 'hooks/useUA'
import React, { FC, PropsWithChildren, useMemo } from 'react'
import style from './StatusBarNotification.module.scss'

export interface IStatusBarNotificationProps {
  message: string
}

/**
 * StatusBarNotification description
 */
export const StatusBarNotification: FC<IStatusBarNotificationProps> = ({
  message,
}: PropsWithChildren<IStatusBarNotificationProps>) => {
  const ua = useUA()

  const isIPad = useMemo(
    () => ua.device.type === 'tablet' && ua.os.name === 'iOS',
    [ua]
  )

  return (
    <div
      className={classNames({
        [style.container]: true,
        [style.iPad]: isIPad,
      })}
    >
      {message}
    </div>
  )
}
