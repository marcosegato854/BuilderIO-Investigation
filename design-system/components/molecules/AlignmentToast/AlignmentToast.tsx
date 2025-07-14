import {
  Button,
  Slide,
  SlideProps,
  Snackbar,
  SxProps,
  Theme,
} from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import { isNil } from 'ramda'
import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { actionsServiceDeactivateSystemAction } from 'store/features/actions/slice'
import {
  alignmentCommandActions,
  selectAlignment,
  selectPhase,
} from 'store/features/alignment/slice'
import {
  AlignmentCommand,
  AlignmentDialog,
  AlignmentPhase,
} from 'store/features/alignment/types'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'
import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import { selectSystemState } from 'store/features/system/slice'
import { alignmentStates } from 'store/features/system/types'
import { translateAlignmentNotificationMessage } from 'utils/notifications'
import { mtToFt } from 'utils/numbers'
import style from './AlignmentToast.module.scss'
import { throttle } from 'throttle-debounce'

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="down" />
}

const THROTTLE_TIME = 2000

export interface IAlignmentToastProps {
  sx?: SxProps<Theme>
}

/**
 * AlignmentToast description
 */
export const AlignmentToast: FC<IAlignmentToastProps> = ({
  sx = [],
}: IAlignmentToastProps) => {
  const { t } = useTranslation()
  const {
    remaining,
    isFailure,
    description,
    messageCode,
    dialog,
    space,
    time,
  } = useSelector(selectAlignment) || {}
  const dispatch = useDispatch()
  const phase = useSelector(selectPhase)
  const systemState = useSelector(selectSystemState)
  const currentProject = useSelector(selectDataStorageCurrentProject)

  const unit = currentProject?.coordinate?.unit

  const title = useMemo(() => {
    if (isNil(dialog)) return null
    switch (dialog) {
      case AlignmentDialog.STATIC:
        return t('acquisition.alignment.title.static', 'Unknown')
      case AlignmentDialog.METERS_BASED_DYNAMIC:
      case AlignmentDialog.TIME_BASED_DYMANIC:
        return t('acquisition.alignment.title.dynamic', 'Unknown')
      case AlignmentDialog.DYNAMIC_CONFIRMATION:
        return isFailure
          ? t('acquisition.alignment.title.dynamic', 'Unknown')
          : t('acquisition.alignment.title.confirmation', 'Unknown')
      case AlignmentDialog.STATIC_CONFIRMATION:
        return isFailure
          ? t('acquisition.alignment.title.static', 'Unknown')
          : t('acquisition.alignment.title.confirmation', 'Unknown')
      default:
        return null
    }
  }, [dialog, isFailure, t])

  const text = useMemo(() => {
    if (!description) return ''
    return translateAlignmentNotificationMessage(
      {
        description,
        messageCode: messageCode || '',
        space,
        time,
      },
      unit || 'metric'
    )
  }, [description, messageCode, space, time, unit])

  const image = useMemo(() => {
    if (isNil(dialog)) return null
    if (
      [
        AlignmentDialog.TIME_BASED_DYMANIC,
        AlignmentDialog.METERS_BASED_DYNAMIC,
        AlignmentDialog.DYNAMIC_CONFIRMATION,
      ].includes(dialog)
    )
      return '/assets/img/DynamicAnimation.gif'
    if (
      [AlignmentDialog.STATIC, AlignmentDialog.STATIC_CONFIRMATION].includes(
        dialog
      )
    )
      return '/assets/img/StaticAlignment.png'
    return 'https://inspgr.id/app/uploads/2017/02/motion-gastaloops-02.gif'
  }, [dialog])

  const ResultIcon = useMemo(() => {
    if (!dialog) return null
    if (
      [
        AlignmentDialog.STATIC_CONFIRMATION,
        AlignmentDialog.DYNAMIC_CONFIRMATION,
      ].includes(dialog)
    ) {
      if (isFailure)
        return <Icon name="GnssIns4Vect" data-testid="alignment-failed-icon" />
      return <Icon name="GnssInsGood" data-testid="alignment-complete-icon" />
    }
    return null
  }, [dialog, isFailure])

  const countdown = useMemo(() => {
    if (isNil(dialog)) return null
    if (isNil(remaining)) return null
    return (
      [
        AlignmentDialog.STATIC,
        AlignmentDialog.DYNAMIC_CONFIRMATION,
        AlignmentDialog.STATIC_CONFIRMATION,
        AlignmentDialog.METERS_BASED_DYNAMIC,
        AlignmentDialog.TIME_BASED_DYMANIC,
      ].includes(dialog) && remaining > 0
    )
  }, [dialog, remaining])

  const remainingUnit = useMemo(() => {
    if (isNil(dialog)) return null
    if (dialog === AlignmentDialog.METERS_BASED_DYNAMIC)
      return unit === 'imperial'
        ? t('acquisition.alignment.remaining_feet')
        : t('acquisition.alignment.remaining_meters')
    if (
      [
        AlignmentDialog.TIME_BASED_DYMANIC,
        AlignmentDialog.DYNAMIC_CONFIRMATION,
        AlignmentDialog.STATIC_CONFIRMATION,
      ].includes(dialog)
    )
      return t('acquisition.alignment.remaining_seconds')
    if (dialog === AlignmentDialog.STATIC)
      return t('acquisition.alignment.remaining_seconds')
    return null
  }, [dialog, unit, t])

  const remainingValue = useMemo(() => {
    if (isNil(dialog)) return 0
    if (isNil(remaining)) return 0
    if (dialog === AlignmentDialog.METERS_BASED_DYNAMIC)
      return unit === 'imperial' ? mtToFt(remaining) : remaining
    return remaining
  }, [dialog, unit, remaining])

  const hasButtons = useMemo(() => {
    if (isNil(dialog)) return false
    return [
      AlignmentDialog.DYNAMIC_CONFIRMATION,
      AlignmentDialog.STATIC_CONFIRMATION,
    ].includes(dialog)
  }, [dialog])

  const isOpen = useMemo(() => {
    if (!systemState) return false
    return alignmentStates.includes(systemState.state)
  }, [systemState])

  const okButtonLabel = useMemo(() => {
    if (phase === AlignmentPhase.FINAL_DONE)
      return t('acquisition.alignment.deactivate', 'deactivate')
    return isFailure
      ? t('acquisition.alignment.skip', 'skip')
      : t('acquisition.alignment.proceed', 'proceed')
  }, [isFailure, phase, t])

  const cancelButtonLabel = useMemo(() => {
    return t('acquisition.alignment.retry', 'retry')
  }, [t])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledProceed = useCallback(
    throttle(
      THROTTLE_TIME,
      (phase: AlignmentPhase | undefined, isFailure: boolean | undefined) => {
        console.info('[ALIGNMENT] [USER_ACTION] user clicked proceed')
        if (phase === AlignmentPhase.FINAL_DONE) {
          dispatch(actionsServiceDeactivateSystemAction())
          return
        }
        dispatch(
          alignmentCommandActions.request({
            action: isFailure
              ? AlignmentCommand.SKIP
              : AlignmentCommand.PROCEED,
          })
        )
      },
      true
    ),
    [dispatch]
  )
  const onProceed = useCallback(() => {
    throttledProceed(phase, isFailure)
  }, [throttledProceed, phase, isFailure])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledCancel = useCallback(
    throttle(
      THROTTLE_TIME,
      () => {
        console.info('[ALIGNMENT] [USER_ACTION] user clicked cancel')
        dispatch(
          alignmentCommandActions.request({ action: AlignmentCommand.RETRY })
        )
      },
      true
    ),
    [dispatch]
  )

  const onCancel = useCallback(() => {
    throttledCancel()
  }, [throttledCancel])

  // fire the text to speech for initial and final alignment
  useEffect(() => {
    if (isNil(dialog)) return
    if (isOpen) {
      if (phase === AlignmentPhase.INITIAL || AlignmentPhase.FINAL) {
        if (text)
          dispatch(
            addSpeechText({
              content: { text, type: SpeechTextType.NAVIGATION },
              priority: false,
            })
          )
      }
    }
  }, [dialog, dispatch, isOpen, phase, text])

  return (
    <Snackbar
      // key={e}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={isOpen}
      data-testid="alignment-toast"
      TransitionComponent={SlideTransition}
      // onClose={handleSnackbarClose}
      // message={visibleErrors[0]}
      sx={[
        // You cannot spread `sx` directly because `SxProps` (typeof sx) can be an array.
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <div className={style.container}>
        <div className={style.row}>
          <div className={style.column}>
            {title && (
              <div data-testid="alignment-title" className={style.title}>
                {title}
              </div>
            )}
            {text && (
              <div data-testid="alignment-text" className={style.text}>
                {ResultIcon && (
                  <div
                    className={classNames({
                      [style.icon]: true,
                      [style.warning]: isFailure,
                    })}
                  >
                    {ResultIcon}
                  </div>
                )}
                <div className={style.message}>{text}</div>
              </div>
            )}
            {countdown && (
              <div
                data-testid="alignment-countdown"
                className={style.remaining}
              >
                <div className={style.number}>
                  {Math.ceil(remainingValue || 0)}
                </div>
                <div className={style.unit}>{remainingUnit}</div>
              </div>
            )}
          </div>
          {image && (
            <div
              data-testid="alignment-image"
              className={classNames(style.column, style.image)}
            >
              <img src={image} alt="preview" />
            </div>
          )}
        </div>
        {hasButtons && (
          <div className={style.buttons} data-testid="alignment-buttons">
            {isFailure && (
              <Button
                color="primary"
                onClick={onCancel}
                data-testid="alignment-buttons-cancel"
              >
                {cancelButtonLabel}
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              onClick={onProceed}
              data-testid="alignment-buttons-proceed"
            >
              {okButtonLabel}
            </Button>
          </div>
        )}
      </div>
    </Snackbar>
  )
}
