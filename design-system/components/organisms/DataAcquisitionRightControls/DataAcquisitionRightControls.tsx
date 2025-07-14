import { FinalAlignmentButton } from 'components/atoms/FinalAlignmentButton/FinalAlignmentButton'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { DataAcquisitionSmallStatusBar } from 'components/molecules/DataAcquisitionSmallStatusBar/DataAcquisitionSmallStatusBar'
import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  actionsServiceDeactivateSystemAction,
  actionsServiceFinalAlignmentAction,
  actionsServiceInitialAlignmentAction,
  selectDeactivationStatus,
  selectRecordingStatus,
} from 'store/features/actions/slice'
import {
  alignmentCommandActions,
  selectPhase,
} from 'store/features/alignment/slice'
import {
  AlignmentCommand,
  AlignmentPhase,
} from 'store/features/alignment/types'
import { selectDataStorageCurrentJob } from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  confirmAbortAutocaptureAction,
  routingUnsubscribeAction,
  selectAutocaptureEnabled,
  selectRoutingEnabled,
  selectRoutingStatus,
  selectUncoveredPolygons,
} from 'store/features/routing/slice'
import {
  addSpeechText,
  clearSpeechNavigationQueue,
} from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types'
import { logWarning, selectSystemState } from 'store/features/system/slice'
import { activatedStates } from 'store/features/system/types'
import style from './DataAcquisitionRightControls.module.scss'

export interface IDataAcquisitionRightControlsProps {
  onDetailStatusChange?: (status: boolean) => void
}

/**
 * DataAcquisitionRightControls description
 */
export const DataAcquisitionRightControls: FC<IDataAcquisitionRightControlsProps> =
  ({
    onDetailStatusChange,
  }: PropsWithChildren<IDataAcquisitionRightControlsProps>) => {
    const recordingStatus = useSelector(selectRecordingStatus)
    const deactivationStatus = useSelector(selectDeactivationStatus)
    const currentJob = useSelector(selectDataStorageCurrentJob)
    const planned = currentJob?.planned
    const rtkEnabled = currentJob?.ntrip?.enable
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const phase = useSelector(selectPhase)
    const routingStatus = useSelector(selectRoutingStatus)
    const initialAlignmentInRange = routingStatus.initial
    // const finalAlignmentInRange = true // disabled because of https://hexagon.atlassian.net/browse/PEF-1255
    // const finalPoint = useSelector(selectFinalAlignmentPoint)
    const uncovered = useSelector(selectUncoveredPolygons)
    const systemState = useSelector(selectSystemState)
    const state = systemState?.state
    const routingEnabled = useSelector(selectRoutingEnabled)
    const autocaptureEnabled = useSelector(selectAutocaptureEnabled)

    const showAlignmentButton = useMemo(() => {
      if (state && !activatedStates.includes(state)) return false
      return recordingStatus !== 'done' && deactivationStatus !== 'done'
    }, [deactivationStatus, recordingStatus, state])

    const buttonLabel = useMemo(() => {
      /* if (deactivationStatus === 'done')
      return t('acquisition.main_button.back_jobs', 'back to Jobs') */
      switch (phase) {
        case AlignmentPhase.NONE:
          return t('acquisition.main_button.start_initial', 'Start')
        case AlignmentPhase.INITIAL:
          return t('acquisition.main_button.stop_initial', 'Stop')
        case AlignmentPhase.INITIAL_DONE:
          return t('acquisition.main_button.start_final', 'Start')
        case AlignmentPhase.FINAL:
          return t('acquisition.main_button.stop_final', 'Stop')
        case AlignmentPhase.FINAL_DONE:
          return t('acquisition.main_button.deactivate', 'Deactivate')
        default:
          return t('acquisition.main_button.start_initial', 'Start')
      }
    }, [phase, t])

    const secondaryButtonLabel = useMemo(() => {
      return t('acquisition.main_button.secondary', 'Dectivate')
    }, [t])

    const btnDeactivated = useMemo(() => {
      if (
        deactivationStatus === 'accepted' ||
        deactivationStatus === 'progress'
      )
        return true
      return false
    }, [deactivationStatus])

    const clickHandler = useCallback(() => {
      let to: NodeJS.Timeout
      const cleanup = () => {
        if (to) clearTimeout(to)
      }
      cleanup()
      /* if (deactivationStatus === 'done') {
      dispatch(actionsServiceExitAcquisition())
      return
    } */
      switch (phase) {
        case AlignmentPhase.NONE:
          if (routingEnabled && planned && !initialAlignmentInRange) {
            const text = t(
              'acquisition.alignment.out_of_range.text',
              'out of range, click on proceed to start'
            )
            dispatch(
              openDialogAction({
                component: DialogNames.Alert,
                componentProps: {
                  type: 'warning',
                  variant: 'colored',
                  text,
                  title: t(
                    'acquisition.alignment.out_of_range.title',
                    'out of range'
                  ),
                  cancelButtonLabel: t(
                    'acquisition.alignment.out_of_range.cancel',
                    'cancel'
                  ),
                  okButtonLabel: t(
                    'acquisition.alignment.out_of_range.proceed',
                    'proceed'
                  ),
                  okButtonCallback: () =>
                    dispatch(actionsServiceInitialAlignmentAction()),
                } as IAlertProps,
              })
            )
            dispatch(
              addSpeechText({
                content: { text, type: SpeechTextType.NAVIGATION },
                priority: true,
              })
            )
          } else {
            dispatch(actionsServiceInitialAlignmentAction())
          }
          break
        case AlignmentPhase.INITIAL:
          dispatch(
            alignmentCommandActions.request({ action: AlignmentCommand.SKIP })
          )
          break
        case AlignmentPhase.INITIAL_DONE:
          // eslint-disable-next-line no-case-declarations
          const action = () => {
            const startFinalAlignment = () => {
              dispatch(actionsServiceFinalAlignmentAction())
              console.info('[ROUTING] disconnect for final alignment')
              dispatch(routingUnsubscribeAction())
            }
            // disabled because of https://hexagon.atlassian.net/browse/PEF-1255
            // const outOfRangeDialog = () => {
            //   const outOfRangeText = t(
            //     'acquisition.alignment.out_of_range.text',
            //     'out of range, click on proceed to start'
            //   )
            //   dispatch(
            //     openDialogAction({
            //       component: DialogNames.Alert,
            //       componentProps: {
            //         type: 'warning',
            //         variant: 'colored',
            //         text: outOfRangeText,
            //         title: t(
            //           'acquisition.alignment.out_of_range.title',
            //           'out of range'
            //         ),
            //         cancelButtonLabel: t(
            //           'acquisition.alignment.out_of_range.cancel',
            //           'cancel'
            //         ),
            //         okButtonLabel: t(
            //           'acquisition.alignment.out_of_range.proceed',
            //           'proceed'
            //         ),
            //         okButtonCallback: confirmFinalAlignment,
            //       } as IAlertProps,
            //     })
            //   )
            //   dispatch(
            //     addSpeechText({
            //       content: {
            //         text: outOfRangeText,
            //         type: SpeechTextType.NAVIGATION,
            //       },
            //       priority: true,
            //     })
            //   )
            // }
            const confirmFinalAlignment = () => {
              const confirmText = t(
                'acquisition.alignment.final_confirm.text',
                'are you sure?'
              )
              dispatch(
                openDialogAction({
                  component: DialogNames.Alert,
                  componentProps: {
                    type: 'message',
                    variant: 'colored',
                    text: confirmText,
                    title: t(
                      'acquisition.alignment.final_confirm.title',
                      'final alignment confirm'
                    ),
                    cancelButtonLabel: t(
                      'acquisition.alignment.final_confirm.cancel',
                      'cancel'
                    ),
                    okButtonLabel: t(
                      'acquisition.alignment.final_confirm.proceed',
                      'proceed'
                    ),
                    okButtonCallback: startFinalAlignment,
                  } as IAlertProps,
                })
              )
              dispatch(
                addSpeechText({
                  content: {
                    text: confirmText,
                    type: SpeechTextType.NAVIGATION,
                  },
                  priority: true,
                })
              )
            }
            // disabled because of https://hexagon.atlassian.net/browse/PEF-1255
            // if (planned && !finalAlignmentInRange && finalPoint) {
            //   outOfRangeDialog()
            // } else {
            confirmFinalAlignment()
            // }
          }
          if (uncovered.length > 0 && autocaptureEnabled) {
            dispatch(
              confirmAbortAutocaptureAction({
                confirmCallback: () => {
                  to = setTimeout(() => {
                    action()
                  }, 500)
                },
              })
            )
          } else {
            action()
          }
          break
        case AlignmentPhase.FINAL:
          dispatch(
            alignmentCommandActions.request({ action: AlignmentCommand.SKIP })
          )
          break
        case AlignmentPhase.FINAL_DONE:
          dispatch(actionsServiceDeactivateSystemAction())
          break
        default:
          dispatch(
            errorAction(new Error(`Alignment phase ${phase} not recognized`))
          )
          break
      }
      return cleanup
    }, [
      phase,
      planned,
      initialAlignmentInRange,
      dispatch,
      uncovered.length,
      routingEnabled,
      autocaptureEnabled,
      t,
      // finalAlignmentInRange, // disabled because of https://hexagon.atlassian.net/browse/PEF-1255
      // finalPoint,
    ])

    const deactivate =
      phase !== AlignmentPhase.FINAL_DONE && deactivationStatus !== 'done'
        ? () => {
            const message = t('acquisition.deactivate_disclaimer', 'Deactivate')
            dispatch(
              addSpeechText({
                content: { text: message, type: SpeechTextType.NAVIGATION },
                priority: true,
              })
            )
            dispatch(
              openDialogAction({
                component: DialogNames.Alert,
                componentProps: {
                  type: 'error',
                  variant: 'colored',
                  cancelButtonLabel: t(
                    'project_browser.cancel_button',
                    'Cancel'
                  ),
                  okButtonLabel: t(
                    'acquisition.main_button.deactivate',
                    'Deactivate'
                  ),
                  okButtonCallback: () => {
                    dispatch(clearSpeechNavigationQueue())
                    dispatch(actionsServiceDeactivateSystemAction())
                    dispatch(
                      logWarning(
                        '[DEACTIVATE] [USER_ACTION] the  user forced deactivation'
                      )
                    )
                  },
                  title: t('acquisition.main_button.deactivate', 'Deactivate'),
                  text: message,
                } as IAlertProps,
              })
            )
          }
        : undefined

    return (
      <div className={style.controls}>
        {showAlignmentButton && (
          <FinalAlignmentButton
            onClick={clickHandler}
            onClickSecondary={deactivate}
            label={buttonLabel}
            labelSecondary={secondaryButtonLabel}
            icon="PowerButton"
            busy={btnDeactivated}
          />
        )}

        <DataAcquisitionSmallStatusBar
          rtkEnabled={rtkEnabled}
          onStatusChange={onDetailStatusChange}
        />
      </div>
    )
  }
