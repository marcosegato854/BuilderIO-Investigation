import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { Button, CircularProgress } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import { useTranslation } from 'react-i18next'
import { RtkServer, RtkServerError } from 'store/features/rtk/types'
import style from 'components/molecules/RTKConnectionLoader/RTKConnectionLoader.module.scss'
import { positionNotifications } from 'store/features/system/notifications/notificationCodes'
import { rtkServiceCloseDialog } from 'store/features/rtk/slice'
import { useDispatch } from 'react-redux'
import { logWarning } from 'store/features/system/slice'

export interface IRTKConnectionLoaderProps {
  server: RtkServer | null
  connectionError?: RtkServerError | null
  progress?: number
  onCancel?: Function
  onRetry?: Function
  canSkip?: boolean
}

/**
 * RTKConnectionLoader description
 */
export const RTKConnectionLoader: FC<IRTKConnectionLoaderProps> = ({
  server,
  connectionError,
  progress,
  onCancel,
  onRetry,
  canSkip,
}: PropsWithChildren<IRTKConnectionLoaderProps>) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const errorText = useMemo(() => {
    if (connectionError) {
      if (connectionError.code === 'SYS-002') {
        return t(
          'backend_errors.code.RTK-001',
          'no connection, check the settings'
        )
      }
      if (
        positionNotifications.includes(connectionError.code) ||
        connectionError.description
      ) {
        return t(
          `backend_errors.code.${connectionError.code}`,
          connectionError.description
        )
      }
      return t('rtk.dialog.error.deafult', 'Failed to connect')
    }
    return null
  }, [connectionError, t])

  /** log messages */
  useEffect(() => {
    if (errorText) console.info(`[MESSAGE_DISPLAYED] ${errorText}`)
  }, [errorText])

  const onCancelHandler = useCallback(() => {
    onCancel && onCancel()
  }, [onCancel])

  const onRetryHandler = useCallback(() => {
    onRetry && onRetry()
  }, [onRetry])

  const onSkipHandler = useCallback(() => {
    dispatch(
      logWarning(
        '[USER_ACTION] user decided to proceed without RTK after a failure'
      )
    )
    dispatch(rtkServiceCloseDialog({ canAbortActivation: true, skipRTK: true }))
  }, [dispatch])

  return (
    <div className={style.container} data-testid="rtk-connection-loader">
      {connectionError ? (
        <div className={style.error} data-testid="rtk-connection-error">
          <div className={style.errorIcon}>
            <Icon name="AcquisitionError" />
          </div>
          <div className={style.errorText}>{errorText}</div>
          <div className={style.buttonsContainer}>
            <Button
              variant="outlined"
              color="primary"
              data-testid="rtk-cancel-button"
              onClick={onCancelHandler}
              sx={{
                borderRadius: '6px',
              }}
            >
              {t('rtk.dialog.cancel', 'Cancel')}
            </Button>
            <Button
              color="primary"
              data-testid="rtk-retry-button"
              onClick={onRetryHandler}
              sx={{
                borderRadius: '6px',
              }}
            >
              {t('rtk.dialog.retry', 'Retry')}
            </Button>
            {canSkip && (
              <Button
                color="primary"
                data-testid="rtk-skip-button"
                onClick={onSkipHandler}
                sx={{
                  borderRadius: '6px',
                }}
              >
                {t('rtk.dialog.skip', 'skip')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className={style.spinner} data-testid="rtk-connection-spinner">
          <CircularProgress />
          <div>
            {t('rtk.dialog.loading', 'Connecting to ')}
            {/* {`${server?.name} - ${progress}%`} */}
            {`${server?.name?.toUpperCase()}`}
          </div>
          {onCancel && (
            <Button
              color="primary"
              type="button"
              data-testid="rtk-cancel-button"
              onClick={onCancelHandler}
              sx={{
                alignSelf: 'center',
                marginTop: '16px',
                width: '102px',
                height: '30px',
                borderRadius: '6px',
              }}
            >
              {t('rtk.dialog.cancel', 'Cancel')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
