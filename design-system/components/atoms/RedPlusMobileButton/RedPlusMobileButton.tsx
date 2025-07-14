import React, { FC, MouseEventHandler } from 'react'
import { Icon } from 'components/atoms/Icon/Icon'
import style from './RedPlusMobileButton.module.scss'

export interface IRedPlusMobileButtonProps {
  /**
   * toggle the disabled state
   */
  disabled?: boolean
  /**
   * button onClick event
   */
  onClick?: MouseEventHandler<HTMLElement>
}

/**
 * Red mobile button with plus icon inside it
 */
export const RedPlusMobileButton: FC<IRedPlusMobileButtonProps> = ({
  disabled = false,
  onClick,
}) => (
  <button
    className={style.redPlusMobileButton}
    onClick={(e) => onClick && onClick(e)}
    disabled={disabled}
    type="button"
    data-testid="red-plus-mobile"
  >
    <Icon name="Plus" className={style.redPlusMobileButton__icon} />
  </button>
)
