import { Button, CircularProgress, Portal } from '@mui/material'
import Done from 'assets/png/BigGreenDoneIcon.png'
import classNames from 'classnames'
import { AcquisitionNotifications } from 'components/molecules/AcquisitionNotifications/AcquisitionNotifications'
import style from 'components/organisms/ActivationView/ActivationView.module.scss'
import { Header } from 'components/organisms/Header/Header'
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  actionsServiceActivationAbortActions,
  selectCurrentAction,
} from 'store/features/actions/slice'
import {
  selectSystemInfo,
  selectSystemState,
} from 'store/features/system/slice'
import { translateSystemAction } from 'utils/notifications'
import { underscores } from 'utils/strings'

export interface IActivationViewProps {
  /**
   * system is activated
   */
  activated: boolean
}

/**
 * ActivationView description
 */
export const ActivationView: FC<IActivationViewProps> = ({
  activated,
}: PropsWithChildren<IActivationViewProps>) => {
  const [aborting, setAborting] = useState<boolean>(false)
  const systemState = useSelector(selectSystemState)
  const systemInfo = useSelector(selectSystemInfo)
  const state = systemState?.state
  const hardware = systemInfo?.product ? underscores(systemInfo?.product) : ''
  const currentAction = useSelector(selectCurrentAction)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const canAbort = useMemo(
    () => !aborting && state === 'Activating',
    [state, aborting]
  )
  const progressVisible = useMemo(() => {
    if (!state) return true
    return state !== 'Deactivated'
  }, [state])
  const progressLabel = useMemo(() => {
    if (!state) return t('acquisition.activation.bootingUp', 'booting')
    const defaultMessage = t(
      `acquisition.activation.state.${state.toLowerCase()}`,
      '--'
    )
    const actionMessage =
      currentAction && translateSystemAction(currentAction).description
    return actionMessage || defaultMessage
  }, [state, t, currentAction])
  const Icon = useMemo(() => {
    // eslint-disable-next-line jsx-a11y/alt-text
    if (activated) return <img className={style.done} src={Done} />
    return (
      <div className={style.circularProgress}>
        <CircularProgress />
      </div>
    )
  }, [activated])
  const abortActivation = () => {
    setAborting(true)
    dispatch(actionsServiceActivationAbortActions.request())
  }

  /** log messages */
  useEffect(() => {
    if (progressLabel) console.info(`[MESSAGE_DISPLAYED] ${progressLabel}`)
  }, [progressLabel])

  return (
    <>
      <div className={style.container}>
        <div className={style.header}>
          <Header
            centerText={t('acquisition.activation.title', 'Pegasus TRK')}
          />
        </div>
        <div
          className={classNames({
            [style.main]: true,
            [style[`${hardware}`]]: true,
          })}
        >
          {progressVisible && (
            <div className={style.progress} data-testid="progress-layer">
              {Icon}
              <div className={style.progressLabel}>{progressLabel}</div>
            </div>
          )}
        </div>
        <AcquisitionNotifications />
      </div>
      {canAbort && (
        <Portal>
          <div className={style.abortButton}>
            <Button
              /* variant="caption" */
              size="small"
              onClick={abortActivation}
              data-testid="abort-activation-button"
            >
              {t('acquisition.activation.abort', 'abort')}
            </Button>
          </div>
        </Portal>
      )}
    </>
  )
}
