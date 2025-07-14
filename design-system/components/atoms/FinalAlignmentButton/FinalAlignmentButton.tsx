/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React, {
  FC,
  MouseEventHandler,
  PropsWithChildren,
  useState,
} from 'react'
import { CircularProgress } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import icons from 'components/atoms/Icon/icons'
import style from './FinalAlignmentButton.module.scss'

export interface IFinalAlignmentButtonProps {
  /**
   * Tells the parent component if the button has been clicked or not
   */
  onClick: MouseEventHandler
  onClickSecondary?: MouseEventHandler
  label: string
  labelSecondary?: string
  icon?: keyof typeof icons
  busy?: boolean
}

/**
 * FinalAlignmentButton description
 */
export const FinalAlignmentButton: FC<IFinalAlignmentButtonProps> = ({
  onClick,
  onClickSecondary,
  label,
  labelSecondary,
  icon,
  busy,
}: PropsWithChildren<IFinalAlignmentButtonProps>) => {
  const [opened, setOpened] = useState<boolean>(false)

  const handleArrowClick = () => {
    setOpened(!opened)
  }

  const secondaryClickHandler: MouseEventHandler = (e) => {
    onClickSecondary && onClickSecondary(e)
    setOpened(false)
  }

  return (
    <div
      className={classNames({ [style.button]: true, [style.disabled]: busy })}
      data-testid="alignment-button"
    >
      <div
        className={style.mainButton}
        onClick={onClick}
        role="button"
        data-testid="submit-button"
      >
        {!busy && icon && (
          <Icon name={icon} className={style.mainIcon} data-testid="icon" />
        )}
        {busy && <CircularProgress className={style.busy} size={25} />}
        <span>{label}</span>
      </div>
      {onClickSecondary && (
        <button
          onClick={handleArrowClick}
          data-testid="arrow-icon"
          type="button"
          className={style.secondaryButton}
        >
          <Icon
            name="LittleCaret"
            className={classNames({
              [style.rightIcon]: true,
              [style.rightIconUp]: !opened,
              [style.rightIconDown]: opened,
            })}
          />
        </button>
      )}
      {opened && onClickSecondary && (
        <button
          type="button"
          data-testid="submit-button-secondary"
          className={style.innerButton}
          onClick={secondaryClickHandler}
        >
          {labelSecondary}
        </button>
      )}
    </div>
  )
}
