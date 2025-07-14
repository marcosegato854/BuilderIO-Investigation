/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren, useCallback } from 'react'
import style from 'components/dialogs/LogViewer/LogViewer.module.scss'
import classNames from 'classnames'
import Button from '@mui/material/Button'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { useDispatch } from 'react-redux'
import { Alert } from '@mui/lab'

export interface ILogViewerProps {
  /**
   * modal title
   */
  title: string
  /**
   * ok button label
   */
  okButtonLabel: string
  /**
   * log array
   */
  log: ProcessingError[]
}

/**
 * LogViewer description
 */
const LogViewer: FC<ILogViewerProps> = ({
  title,
  okButtonLabel,
  log,
}: PropsWithChildren<ILogViewerProps>) => {
  const dispatch = useDispatch()

  /**
   * callback for ok acton
   */
  const onClickOk = useCallback(() => {
    dispatch(closeDialogAction())
  }, [dispatch])

  return (
    <div
      className={classNames({
        [style.container]: true,
      })}
    >
      <div
        className={style.title}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: title || '' }}
      />
      <div className={classNames(style.scrollable, style.list)}>
        {log.map((l, i) => {
          const severity = l.type === 1 ? 'warning' : 'error'
          return (
            <Alert
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              severity={severity}
              data-testid={`log-${severity}`}
              className={classNames({
                [style.item]: true,
                [style[`item-${severity}`]]: true,
              })}
            >
              {l.description}
            </Alert>
          )
        })}
      </div>
      <div className={style.button}>
        <Button color="primary" onClick={onClickOk}>
          {okButtonLabel}
        </Button>
      </div>
    </div>
  )
}
export default LogViewer
