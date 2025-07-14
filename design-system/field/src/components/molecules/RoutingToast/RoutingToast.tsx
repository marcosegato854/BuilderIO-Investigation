import { Slide, SlideProps, Snackbar } from '@mui/material'
import classNames from 'classnames'
import { AutocaptureNotificationToast } from 'components/atoms/AutocaptureNotificationToast/AutocaptureNotificationToast'
import { DirectionsIcon } from 'components/atoms/DirectionsIcon/DirectionsIcon'
import style from 'components/molecules/RoutingToast/RoutingToast.module.scss'
import { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { selectPhase } from 'store/features/alignment/slice'
import { AlignmentPhase } from 'store/features/alignment/types'
import {
  confirmAbortAutocaptureAction,
  selectAutocaptureNotifications,
  /* selectCurrentPolygon, */
  selectRouting,
  selectRoutingDirectionsEnabled,
  selectRoutingEnabled,
  selectSpeechRouting,
} from 'store/features/routing/slice'
import { HeremapsAction } from 'store/features/routing/types'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import { selectSystemState } from 'store/features/system/slice'
import { activatedStates } from 'store/features/system/types'
import { translateAutocaptureNotification } from 'utils/notifications'

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />
}

export interface IRoutingToastProps {}

/**
 * RoutingToast description
 */
export const RoutingToast: FC = () => {
  const { t } = useTranslation()
  const routing = useSelector(selectRouting)
  const speechRouting = useSelector(selectSpeechRouting)
  const navigationEnabled = useSelector(selectRoutingEnabled)
  const routingDirectionsEnabled = useSelector(selectRoutingDirectionsEnabled)
  /* const currentTrack = useSelector(selectCurrentPolygon) */
  const { action, direction, instruction } = routing || {}
  const phase = useSelector(selectPhase)
  const notifications = useSelector(selectAutocaptureNotifications)
  const dispatch = useDispatch()
  const notificationSpeechList = useRef<string[]>([])
  const lastSpeechRoutingDirectionRef = useRef<HeremapsAction | null>(null)
  const systemState = useSelector(selectSystemState)

  const isOpen = useMemo(() => {
    if (!systemState) return false
    const isAlignment = phase !== AlignmentPhase.INITIAL_DONE
    const hasNotifications = notifications.length > 0
    const isActive = activatedStates.includes(systemState?.state)
    const hasContent = !!routing || hasNotifications
    return hasContent && !isAlignment && isActive
  }, [systemState, phase, notifications.length, routing])

  const title = useMemo(() => {
    if (!action && !direction) return ''
    const actionTranslated = t(
      `acquisition.routing.actions.${action}`,
      action || ''
    )
    const directionTranslated = t(
      `acquisition.routing.directions.${direction}`,
      direction || ''
    )
    return `${actionTranslated} ${directionTranslated}`
  }, [action, direction, t])

  const abortRouting = () => {
    dispatch(confirmAbortAutocaptureAction({}))
  }

  const textToSpeechHandler = useCallback(
    (speech: string, priority: boolean) => {
      dispatch(
        addSpeechText({
          content: {
            text: speech,
            type: SpeechTextType.NAVIGATION,
          },
          priority,
        })
      )
    },
    [dispatch]
  )

  useEffect(() => {
    if (
      speechRouting &&
      speechRouting.instruction &&
      !!navigationEnabled &&
      phase === AlignmentPhase.INITIAL_DONE &&
      !!routingDirectionsEnabled
    ) {
      if (
        lastSpeechRoutingDirectionRef.current &&
        speechRouting.id === lastSpeechRoutingDirectionRef.current.id
      )
        return
      textToSpeechHandler(speechRouting.instruction, true)
      lastSpeechRoutingDirectionRef.current = speechRouting
    }
  }, [
    speechRouting,
    textToSpeechHandler,
    navigationEnabled,
    phase,
    routingDirectionsEnabled,
  ])

  useEffect(() => {
    if (
      notifications.length > 0 &&
      !!navigationEnabled &&
      !!routingDirectionsEnabled
    ) {
      notifications.forEach((n) => {
        if (!notificationSpeechList?.current.includes(n.code)) {
          const { description } = translateAutocaptureNotification(n)
          textToSpeechHandler(description, false)
        }
      })
    }
    notificationSpeechList.current = notifications.map((n) => n.code)
  }, [
    navigationEnabled,
    notifications,
    routingDirectionsEnabled,
    textToSpeechHandler,
  ])

  return (
    <Snackbar
      // key={e}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={isOpen}
      data-testid="routing-toast"
      TransitionComponent={SlideTransition}
      // onClose={handleSnackbarClose}
      // message={visibleErrors[0]}
    >
      <div className={style.container}>
        {notifications.map((n) => {
          const isStopping = n.code === 'STT-002'
          const onClick = isStopping ? abortRouting : undefined
          const buttonLabel = isStopping
            ? t('acquisition.routing.stopping_button', 'continue')
            : undefined
          return (
            <div key={n.code} data-testid="autocapture-notification">
              <AutocaptureNotificationToast
                notification={n}
                onClick={onClick}
                buttonLabel={buttonLabel}
              />
            </div>
          )
        })}
        {routing && navigationEnabled && (
          <div
            className={style.directionsContainer}
            data-testid="routing-direction"
          >
            <div className={style.row}>
              <div
                className={classNames(style.column, style.icon)}
                data-testid="routing-icon"
              >
                <DirectionsIcon action={action} direction={direction} />
              </div>
              <div className={style.column}>
                <h2 className={style.title} data-testid="routing-title">
                  {title}
                </h2>
                <p
                  className={style.instruction}
                  data-testid="routing-instruction"
                >
                  {instruction}
                </p>
              </div>
            </div>
            {/* {currentTrack && (
              <div className={classNames(style.row, style.rowStreet)}>
                <div
                  className={classNames(style.column, style.street)}
                  data-testid="routing-street"
                >
                  {currentTrack.name}
                </div>
                <div
                  className={classNames(style.column, style.color)}
                  data-testid="routing-color"
                >
                  <div
                    className={style.dot}
                    style={{
                      backgroundColor: currentTrack.color || 'inherit',
                    }}
                  />
                </div>
              </div>
            )} */}
          </div>
        )}
      </div>
    </Snackbar>
  )
}
