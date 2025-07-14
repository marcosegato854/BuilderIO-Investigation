import { Button } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import style from 'components/dialogs/RTKSettingsDialog/RTKSettingsDialog.module.scss'
import { RTKConnectionInfo } from 'components/molecules/RTKConnectionInfo/RTKConnectionInfo'
import { RTKConnectionLoader } from 'components/molecules/RTKConnectionLoader/RTKConnectionLoader'
import {
  RTKMountPointForm,
  ServerMountpointInfo,
} from 'components/molecules/RTKMountPointForm/RTKMountPointForm'
import { RTKServersList } from 'components/molecules/RTKServersList/RTKServersList'
import { any, anyPass, isNil, isEmpty, props } from 'ramda'
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { selectDataStorageTempJob } from 'store/features/dataStorage/slice'
import {
  rtkServiceAuthenticateServerActions,
  rtkServiceCloseDialog,
  rtkServiceResetCurrentServerConnection,
  rtkServiceServersActions,
  rtkServiceSetCurrentServer,
  rtkServiceTestServerActions,
  selectIsAuthenticating,
  selectRtkCurrentServer,
  selectRtkMountpointsActionProgress,
  selectRtkServerError,
} from 'store/features/rtk/slice'
import { RtkServer } from 'store/features/rtk/types'

export interface IRTKSettingsDialogProps {
  initialValues?: RtkServer
  canAbortActivation?: boolean
}

/**
 * RTKSettingsDialog description
 */
const RTKSettingsDialog: FC<IRTKSettingsDialogProps> = ({
  initialValues,
  canAbortActivation,
}: PropsWithChildren<IRTKSettingsDialogProps>) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const tempJob = useSelector(selectDataStorageTempJob)
  const server = useRef<RtkServer | undefined>(initialValues)
  const currentServer = useSelector(selectRtkCurrentServer)
  const mountpointInfo = useRef<ServerMountpointInfo>()
  const isAuthenticating = useSelector(selectIsAuthenticating)
  const progress = useSelector(selectRtkMountpointsActionProgress)
  const connectionInfoRef = useRef<HTMLDivElement>(null)
  const [confirmDisabled, setConfirmDisabled] = useState<boolean>(true)
  const serverError = useSelector(selectRtkServerError)

  const cancelLabel = canAbortActivation
    ? t('rtk.dialog.cancel_activation', 'Back')
    : t('rtk.dialog.back', 'Back')

  const serverUpdateHandler = (srv: RtkServer) => {
    server.current = srv
    mountpointInfo.current = {
      mountpoint: srv.mountpoint,
      interfacemode: srv.interfacemode,
    }
    updateConfirmEnabled()
  }

  const serverConnectHandler = (srv: RtkServer) => {
    // server.current = srv
    dispatch(rtkServiceResetCurrentServerConnection())
    dispatch(rtkServiceSetCurrentServer(srv))
    dispatch(rtkServiceAuthenticateServerActions.request(srv))
  }

  const onRetryHandler = () => {
    if (server.current) {
      serverConnectHandler(server.current)
    }
  }

  const updateConfirmEnabled = () => {
    setConfirmDisabled(
      server.current
        ? any(
            anyPass([isNil, isEmpty]),
            props(['user', 'name'], server.current)
          )
        : true
    )
  }

  const mountpointUpdateHandler = (mpInfo: ServerMountpointInfo) => {
    mountpointInfo.current = mpInfo
  }

  const closeAndGoBackToJobDialog = () => {
    dispatch(rtkServiceCloseDialog({ canAbortActivation }))
  }

  const saveCloseAndGoBackToJobDialog = () => {
    const job: IJob = {
      ...tempJob,
      ntrip: {
        enable: true, // not filled in some cases, because the servers in the dialog don't have it
        ...tempJob?.ntrip,
        ...server.current,
        ...mountpointInfo.current,
      },
    } as IJob
    dispatch(rtkServiceCloseDialog({ job, canAbortActivation }))
  }

  const testHandler = () => {
    const serverToTest = {
      ...tempJob?.ntrip,
      ...server.current,
      ...mountpointInfo.current,
    } as RtkServer
    dispatch(rtkServiceTestServerActions.request(serverToTest))
  }

  const cancelConnectionHandler = useCallback(() => {
    dispatch(rtkServiceResetCurrentServerConnection())
  }, [dispatch])

  /** load server list at mount */
  useEffect(() => {
    dispatch(rtkServiceServersActions.request())
  }, [dispatch])

  /** set the received server as current */
  useEffect(() => {
    initialValues && dispatch(rtkServiceSetCurrentServer(initialValues))
  }, [initialValues, dispatch])

  /** keep the server ref updated */
  useEffect(() => {
    server.current = currentServer || undefined
    updateConfirmEnabled()
  }, [currentServer, dispatch])

  const displayLoadingOverlay =
    (isAuthenticating || serverError) && server.current

  return (
    <div className={style.rtkSettingsDialog}>
      <div className={style.header}>
        <Icon
          name="SettingsAdjust"
          className={style.icon}
          data-testid="dialog-title-icon"
        />
        <h1 data-testid="dialog-title" className={style.formTitle}>
          {t('rtk.dialog.title', 'RTK Settings')}
        </h1>
      </div>
      <div className={style.scrolling}>
        <div className={style.rtkServersListContainer}>
          <RTKServersList
            onUpdate={serverUpdateHandler}
            onConnect={serverConnectHandler}
            initialValues={server.current}
          />
        </div>
        <div className={style.rtkMountPointContainer}>
          <RTKMountPointForm
            onUpdate={mountpointUpdateHandler}
            onTest={testHandler}
          />
        </div>
        <div
          className={style.rtkConnectionInfoContainer}
          ref={connectionInfoRef}
        >
          <RTKConnectionInfo />
        </div>
        {displayLoadingOverlay && (
          <div className={style.loading}>
            <RTKConnectionLoader
              server={server.current!}
              progress={progress}
              onCancel={cancelConnectionHandler}
              connectionError={serverError}
              onRetry={onRetryHandler}
              canSkip={canAbortActivation}
            />
          </div>
        )}
      </div>
      <div className={style.footer}>
        <div className={style.buttonsContainer}>
          <Button
            variant="outlined"
            color="primary"
            data-testid="cancel-button"
            onClick={closeAndGoBackToJobDialog}
          >
            {cancelLabel}
          </Button>
          <Button
            color="primary"
            data-testid="rtk-confirm-button"
            onClick={saveCloseAndGoBackToJobDialog}
            disabled={confirmDisabled}
          >
            {t('rtk.dialog.confirm', 'confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
export default RTKSettingsDialog
