import React, { FC, MouseEventHandler, PropsWithChildren } from 'react'
import style from './IconGhostButton.module.scss'
import icons from 'components/atoms/Icon/icons'
import { Icon } from '../Icon/Icon'
import { IconButton } from '@mui/material'

export interface IIconGhostButtonProps {
  icon: keyof typeof icons
  onClick?: MouseEventHandler
  testId?: string
}

/**
 * IconGhostButton description
 */
export const IconGhostButton: FC<IIconGhostButtonProps> = ({
  icon,
  onClick,
  testId,
}: PropsWithChildren<IIconGhostButtonProps>) => {
  return (
    <IconButton
      className={style.button}
      size="small"
      onClick={onClick}
      data-testid={testId}
    >
      <Icon name={icon}></Icon>
    </IconButton>
  )
}
