/**
 * TYPES
 */
export type ActionStatus =
  | 'accepted'
  | 'done'
  | 'progress'
  | 'error'
  | 'abort'
  | null
export type ActionError = {
  code: string
  description: string
  module?: string
  p1?: string
  p2?: string
  p3?: string
}
export type SystemAction = {
  status: ActionStatus
  progress: number
  description: string
  code?: string
  errors?: ActionError[]
  p1?: string
  p2?: string
  p3?: string
}
export type ActivationAction = SystemAction
export type InitialAlignmentAction = SystemAction
export type FinalAlignmentAction = SystemAction
export type StartRecordingAction = SystemAction
export type StopRecordingAction = SystemAction
export type ActionsServiceActivationStartResponse = {
  action: ActivationAction
}
export type ActionsServiceActivationInfoResponse = {
  action: ActivationAction
}
export type ActionsServiceActivationAbortResponse = {}
export type ActionsServiceInitialAlignmentStartResponse = {
  action: InitialAlignmentAction
}
export type ActionsServiceInitialAlignmentInfoResponse = {
  action: InitialAlignmentAction
}
export type ActionsServiceFinalAlignmentStartResponse = {
  action: FinalAlignmentAction
}
export type ActionsServiceFinalAlignmentInfoResponse = {
  action: FinalAlignmentAction
}
export type ActionsServiceStartRecordingStartResponse = {
  action: StartRecordingAction
}
export type ActionsServiceStartRecordingInfoResponse = {
  action: StartRecordingAction
}
export type ActionsServiceStopRecordingStartResponse = {
  action: StartRecordingAction
}
export type ActionsServiceStopRecordingInfoResponse = {
  action: StopRecordingAction
}
export type ActionsServiceDeactivationStartResponse = {
  action: ActivationAction
}
export type ActionsServiceDeactivationInfoResponse = {
  action: ActivationAction
}
