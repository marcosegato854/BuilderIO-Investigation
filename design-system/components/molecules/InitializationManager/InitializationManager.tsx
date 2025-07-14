import Dialog from '@mui/material/Dialog'
import { TransitionProps } from '@mui/material/transitions'
import Zoom from '@mui/material/Zoom'
import classNames from 'classnames'
import Alert, { IAlertProps } from 'components/dialogs/Alert/Alert'
import style from 'components/molecules/InitializationManager/InitializationManager.module.scss'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  hideInitializationAction,
  selectInitializationHidden,
  selectSystemNotifications,
  selectSystemState,
} from 'store/features/system/slice'
import { SystemNotificationType } from 'store/features/system/types'
import { translateSystemNotification } from 'utils/notifications'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>
) {
  return <Zoom ref={ref} {...props} />
})

/**
 * InitializationManager description
 */
export const InitializationManager: FC = () => {
  const initializationHidden = useSelector(selectInitializationHidden)
  const systemState = useSelector(selectSystemState)
  const notifications = useSelector(selectSystemNotifications)
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const state = useMemo(() => {
    return systemState ? systemState.state : 'Starting'
  }, [systemState])

  const errorsArr = useMemo(
    () =>
      notifications
        .filter((nf) => nf.type === SystemNotificationType.ERROR)
        .map(translateSystemNotification)
        .map((n) => `<span>${n.description}</span>`),
    [notifications]
  )

  const alertProps = useMemo(() => {
    const initializing = ['Starting', 'Initializing', 'Configuring'].includes(
      state
    )
    const statusStr = t('initialization.state', 'state')
    const titleStr = initializing
      ? t('initialization.title', 'initialization')
      : t('initialization.title_initialized', 'initialized')
    const eventsStr = t('initialization.events', 'events')
    const stateStr = t(`initialization.state${state}`, state)
    const errorsStr = errorsArr?.length
      ? `<div><br/><h4>${eventsStr}:</h4>${errorsArr.join(
          '<br/>'
        )}<br/><br/></div>`
      : ''
    const text = `${statusStr}: <span>${stateStr}</span>${errorsStr}`
    return {
      type: 'message',
      variant: 'colored',
      okButtonCallback: () => {
        dispatch(hideInitializationAction(true))
      },
      okButtonLabel: t('initialization.ok', 'OK'),
      text,
      title: titleStr,
    } as IAlertProps
  }, [state, dispatch, t, errorsArr])

  const canDisplay = useMemo(() => {
    if (errorsArr.length) return true
    if (!systemState) return false
    if (!['Starting', 'Initializing', 'Configuring'].includes(state))
      return false
    return true
  }, [systemState, state, errorsArr])

  if (initializationHidden) return null
  if (!canDisplay) return null

  return (
    <div
      className={classNames({
        [style.container]: true,
        [style[`container-${state}`]]: true,
      })}
    >
      <Dialog
        open
        TransitionComponent={Transition}
        maxWidth={false}
        scroll="body"
      >
        <Alert {...alertProps} />
      </Dialog>
    </div>
  )
}
