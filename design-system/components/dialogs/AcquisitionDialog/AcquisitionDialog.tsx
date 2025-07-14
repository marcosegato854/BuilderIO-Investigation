import { Button } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { SystemNotificationType } from 'store/features/system/types'

import style from './AcquisitionDialog.module.scss'

export interface IAcquisitionDialogProps {
  /**
   * type of message
   */
  type: SystemNotificationType
  /**
   * text
   */
  text?: string
  /**
   * ok button label
   */
  okButtonLabel?: string
  /**
   * ok button callback
   */
  okButtonCallback?: Function
}

/**
 * AcquisitionDialog description
 */
const AcquisitionDialog: FC<IAcquisitionDialogProps> = ({
  type = SystemNotificationType.ERROR,
  text,
  okButtonLabel,
  okButtonCallback,
}: PropsWithChildren<IAcquisitionDialogProps>) => {
  /**
   * determine the icon
   */
  const AcquisitionIcon = useMemo(() => {
    switch (type) {
      case SystemNotificationType.ERROR:
        return <Icon name="AcquisitionError" />
      case SystemNotificationType.WARNING:
        return <Icon name="AcquisitionWarning" />
      default:
        return null
    }
  }, [type])
  /**
   * callback for ok acton
   */
  const onClickOk = useCallback(() => {
    okButtonCallback && okButtonCallback()
  }, [okButtonCallback])

  return (
    <div
      className={classNames({
        [style.container]: true,
        [style[`severity-${type}`]]: true,
      })}
    >
      {AcquisitionIcon && <div className={style.icon}>{AcquisitionIcon}</div>}
      <div
        className={style.text}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: text || '' }}
      />
      <div className={style.button}>
        <Button
          color="primary"
          onClick={onClickOk}
          data-testid="acquisition-dialog-ok"
          sx={[
            (theme) => ({
              ...theme.typography.caption,
              ...theme.typography.bold,
            }),
          ]}
        >
          {okButtonLabel}
        </Button>
      </div>
    </div>
  )
}
export default AcquisitionDialog
