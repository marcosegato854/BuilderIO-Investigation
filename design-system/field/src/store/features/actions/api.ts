import apiClient from 'store/services/apiClientBackend'
import { trackProgress } from 'store/services/trackProgress'
import {
  ActionsServiceActivationStartResponse,
  ActionsServiceActivationInfoResponse,
  ActionsServiceStartRecordingStartResponse,
  ActionsServiceStartRecordingInfoResponse,
  ActionsServiceStopRecordingStartResponse,
  ActionsServiceStopRecordingInfoResponse,
  ActionsServiceDeactivationStartResponse,
  ActionsServiceDeactivationInfoResponse,
  ActionsServiceActivationAbortResponse,
  ActionsServiceInitialAlignmentInfoResponse,
  ActionsServiceInitialAlignmentStartResponse,
  ActionsServiceFinalAlignmentInfoResponse,
  ActionsServiceFinalAlignmentStartResponse,
} from 'store/features/actions/types'

/**
 * CALL IDS (for trackProgress)
 */
export const apiCallIds = {
  ACTIONS_ACTIVATION_START: 'ACTIONS_ACTIVATION_START',
  ACTIONS_ACTIVATION_INFO: 'ACTIONS_ACTIVATION_INFO',
  ACTIONS_ACTIVATION_ABORT: 'ACTIONS_ACTIVATION_ABORT',
  ACTIONS_INITIAL_ALIGNMENT_START: 'ACTIONS_INITIAL_ALIGNMENT_START',
  ACTIONS_INITIAL_ALIGNMENT_INFO: 'ACTIONS_INITIAL_ALIGNMENT_INFO',
  ACTIONS_FINAL_ALIGNMENT_START: 'ACTIONS_FINAL_ALIGNMENT_START',
  ACTIONS_FINAL_ALIGNMENT_INFO: 'ACTIONS_FINAL_ALIGNMENT_INFO',
  ACTIONS_START_RECORDING_START: 'ACTIONS_START_RECORDING_START',
  ACTIONS_START_RECORDING_INFO: 'ACTIONS_START_RECORDING_INFO',
  ACTIONS_START_RECORDING_ABORT: 'ACTIONS_START_RECORDING_ABORT',
  ACTIONS_STOP_RECORDING_START: 'ACTIONS_STOP_RECORDING_START',
  ACTIONS_STOP_RECORDING_INFO: 'ACTIONS_STOP_RECORDING_INFO',
  ACTIONS_DEACTIVATION_START: 'ACTIONS_DEACTIVATION_START',
  ACTIONS_DEACTIVATION_INFO: 'ACTIONS_DEACTIVATION_INFO',
}

/**
 * CALLS
 */
export default {
  actionsActivationStart: () =>
    trackProgress(
      apiClient.post<ActionsServiceActivationStartResponse>(
        '/system/actionactivate'
      ),
      apiCallIds.ACTIONS_ACTIVATION_START
    ),
  actionsActivationInfo: () =>
    trackProgress(
      apiClient.get<ActionsServiceActivationInfoResponse>(
        '/system/actionactivate'
      ),
      apiCallIds.ACTIONS_ACTIVATION_INFO
    ),
  actionsActivationAbort: () =>
    trackProgress(
      apiClient.delete<ActionsServiceActivationAbortResponse>(
        '/system/actionactivate'
      ),
      apiCallIds.ACTIONS_ACTIVATION_ABORT
    ),
  actionsStartRecordingStart: () =>
    trackProgress(
      apiClient.post<ActionsServiceStartRecordingStartResponse>(
        '/system/actionstartrecording'
      ),
      apiCallIds.ACTIONS_START_RECORDING_START
    ),
  actionsStartRecordingInfo: () =>
    trackProgress(
      apiClient.get<ActionsServiceStartRecordingInfoResponse>(
        '/system/actionstartrecording'
      ),
      apiCallIds.ACTIONS_START_RECORDING_INFO
    ),
  actionsStartRecordingAbort: () =>
    trackProgress(
      apiClient.delete('/system/actionstartrecording'),
      apiCallIds.ACTIONS_START_RECORDING_ABORT
    ),
  actionsInitialAlignmentStart: () =>
    trackProgress(
      apiClient.post<ActionsServiceInitialAlignmentStartResponse>(
        '/system/actioninitialalignment'
      ),
      apiCallIds.ACTIONS_INITIAL_ALIGNMENT_START
    ),
  actionsInitialAlignmentInfo: () =>
    trackProgress(
      apiClient.get<ActionsServiceInitialAlignmentInfoResponse>(
        '/system/actioninitialalignment'
      ),
      apiCallIds.ACTIONS_INITIAL_ALIGNMENT_INFO
    ),
  actionsFinalAlignmentStart: () =>
    trackProgress(
      apiClient.post<ActionsServiceFinalAlignmentStartResponse>(
        '/system/actionfinalalignment'
      ),
      apiCallIds.ACTIONS_FINAL_ALIGNMENT_START
    ),
  actionsFinalAlignmentInfo: () =>
    trackProgress(
      apiClient.get<ActionsServiceFinalAlignmentInfoResponse>(
        '/system/actionfinalalignment'
      ),
      apiCallIds.ACTIONS_FINAL_ALIGNMENT_INFO
    ),
  actionsStopRecordingStart: () =>
    trackProgress(
      apiClient.post<ActionsServiceStopRecordingStartResponse>(
        '/system/actionstoprecording'
      ),
      apiCallIds.ACTIONS_STOP_RECORDING_START
    ),
  actionsStopRecordingInfo: () =>
    trackProgress(
      apiClient.get<ActionsServiceStopRecordingInfoResponse>(
        '/system/actionstoprecording'
      ),
      apiCallIds.ACTIONS_STOP_RECORDING_INFO
    ),
  actionsDeactivationStart: () =>
    trackProgress(
      apiClient.post<ActionsServiceDeactivationStartResponse>(
        '/system/actiondeactivate'
      ),
      apiCallIds.ACTIONS_DEACTIVATION_START
    ),
  actionsDeactivationInfo: () =>
    trackProgress(
      apiClient.get<ActionsServiceDeactivationInfoResponse>(
        '/system/actiondeactivate'
      ),
      apiCallIds.ACTIONS_DEACTIVATION_INFO
    ),
}
