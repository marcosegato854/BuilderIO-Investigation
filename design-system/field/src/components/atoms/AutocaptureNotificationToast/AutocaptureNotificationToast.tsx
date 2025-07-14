import React, { FC, MouseEventHandler, PropsWithChildren } from 'react'
import style from 'components/atoms/AutocaptureNotificationToast/AutocaptureNotificationToast.module.scss'
import { AutocaptureNotification } from 'store/features/routing/types'
import { Icon } from 'components/atoms/Icon/Icon'
import { translateAutocaptureNotification } from 'utils/notifications'
import { Button } from '@mui/material'

export interface IAutocaptureNotificationToastProps {
  /**
   * Notification to display
   */
  notification: AutocaptureNotification
  /**
   * click callback
   */
  onClick?: MouseEventHandler<HTMLButtonElement>
  /**
   * button label
   */
  buttonLabel?: string
}

/**
 * AutocaptureNotification description
 */
export const AutocaptureNotificationToast: FC<IAutocaptureNotificationToastProps> =
  ({
    notification,
    onClick,
    buttonLabel = 'Ok',
  }: PropsWithChildren<IAutocaptureNotificationToastProps>) => {
    const { description } = translateAutocaptureNotification(notification)
    return (
      <div className={style.container}>
        <div className={style.icon}>
          <Icon name="Alert" data-testid="autocapture-notification-icon" />
        </div>
        <div className={style.description}>{description}</div>
        {onClick && (
          <div className={style.button}>
            <Button
              onClick={onClick}
              data-testid="autocapture-notification-button"
            >
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    )
  }
