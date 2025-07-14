/**
 * TYPES
 */
export enum AlignmentDialog {
  STATIC = 0,
  STATIC_CONFIRMATION = 1,
  METERS_BASED_DYNAMIC = 2,
  TIME_BASED_DYMANIC = 3,
  DYNAMIC_CONFIRMATION = 4,
}
export enum AlignmentPhase {
  NONE = 'None',
  INITIAL = 'InitialAlignment',
  FINAL = 'FinalAlignment',
  INITIAL_DONE = 'InitialDone',
  FINAL_DONE = 'FinalDone',
}
export type AlignmentNotification = {
  remaining?: number
  isFailure: boolean
  isComplete: boolean
  description: string
  messageCode: string
  dialog: AlignmentDialog
  time?: number
  space?: number
  alignmentPhase: AlignmentPhase
}
export type AlignmentStatusResponse = AlignmentNotification

export enum AlignmentCommand {
  PROCEED = 'Proceed',
  RETRY = 'Retry',
  SKIP = 'Skip',
}
export type AlignmentCommandRequest = {
  action: AlignmentCommand
}
export type AlignmentCommandResponse = {}
