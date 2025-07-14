import style from 'components/atoms/ConnectionStatus/ConnectionStatus.module.scss'
import { Icon } from 'components/atoms/Icon/Icon'
import { max, min, pipe } from 'ramda'
import React, { FC, PropsWithChildren } from 'react'

export interface IConnectionStatusProps {
  value: number
}

/**
 * ConnectionStatus description
 */
export const ConnectionStatus: FC<IConnectionStatusProps> = ({
  value = 0,
}: PropsWithChildren<IConnectionStatusProps>) => {
  const parsedValue = pipe(min(4), max(0))(value)
  return (
    <>
      {parsedValue === 0 && (
        <Icon name="NoConnectionIcon" className={style.icon0} />
      )}
      {parsedValue !== 0 && (
        <Icon name="ConnectionIcon" className={style[`icon${value}`]} />
      )}
    </>
  )
}
