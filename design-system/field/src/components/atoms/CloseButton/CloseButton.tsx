import React, { FC, PropsWithChildren } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import style from './CloseButton.module.scss'

export interface ICloseButtonProps {
  onClick: React.MouseEventHandler<SVGSVGElement>
}

/**
 * CloseButton description
 */
export const CloseButton: FC<ICloseButtonProps> = ({
  onClick,
}: PropsWithChildren<ICloseButtonProps>) => {
  return (
    <div className={style.container}>
      <Icon name="Close" onClick={onClick} data-testid="close-button" />
    </div>
  )
}
