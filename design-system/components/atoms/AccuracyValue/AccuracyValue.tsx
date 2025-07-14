import classNames from 'classnames'
import { isNil } from 'ramda'
import React, { FC, PropsWithChildren } from 'react'
import { Accuracy } from 'store/features/position/types'
import style from 'components/atoms/AccuracyValue/AccuracyValue.module.scss'

export interface IAccuracyValueProps {
  value: string | number | null | undefined
  accuracy: Accuracy
}

/**
 * AccuracyValue description
 */
export const AccuracyValue: FC<IAccuracyValueProps> = ({
  accuracy,
  value,
}: PropsWithChildren<IAccuracyValueProps>) => {
  return (
    <div
      className={classNames({
        [style.container]: true,
        [style[`accuracy-${accuracy}`]]: true,
      })}
    >
      {!isNil(value) ? value : '--'}
    </div>
  )
}
