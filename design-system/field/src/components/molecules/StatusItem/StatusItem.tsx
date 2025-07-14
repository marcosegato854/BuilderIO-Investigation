import classNames from 'classnames'
import { AccuracyValue } from 'components/atoms/AccuracyValue/AccuracyValue'
import React, { FC, PropsWithChildren } from 'react'
import style from './StatusItem.module.scss'
import { fontSize } from '@mui/system'

export interface IStatusItemProps {
  label?: string
  value?: string | number
  accuracy: number
  hidden?: boolean
  variant?: 'webapp' | 'pcuapp'
}

/**
 * StatusItem description
 */
export const StatusItem: FC<IStatusItemProps> = ({
  label,
  value,
  accuracy,
  hidden,
  variant = 'webapp',
}: PropsWithChildren<IStatusItemProps>) => {
  return (
    <div
      className={classNames({ [style.infoItem]: true, [style.hidden]: hidden })}
      data-testid="status-item-box"
    >
      {variant === 'pcuapp' ? (
        <div style={{ fontSize: '14px' }}>{label}</div>
      ) : (
        <div>{label}:</div>
      )}
      <div>
        <AccuracyValue value={value} accuracy={accuracy} />
      </div>
    </div>
  )
}
