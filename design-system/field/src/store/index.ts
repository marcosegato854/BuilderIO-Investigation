/* eslint-disable import/no-cycle */
import { RouterAction } from 'connected-react-router'
import { ActionsServiceAction } from 'store/features/actions/slice'
import { AlignmentAction } from 'store/features/alignment/slice'
import { AuthAction } from 'store/features/auth/slice'
import { CameraAction } from 'store/features/camera/slice'
import { CoordinateSystemActions } from 'store/features/coordsys/slice'
import { DataStorageAction } from 'store/features/dataStorage/slice'
import { DialogAction } from 'store/features/dialogs/slice'
import { ErrorAction } from 'store/features/errors/slice'
import { GlobalAction } from 'store/features/global/slice'
import { PlanningAction } from 'store/features/planning/slice'
import { PointCloudAction } from 'store/features/pointcloud/slice'
import { PositionAction } from 'store/features/position/slice'
import { RoutingAction } from 'store/features/routing/slice'
import { RtkServiceAction } from 'store/features/rtk/slice'
import { ScannerAction } from 'store/features/scanner/slice'
import { SettingsAction } from 'store/features/settings/slice'
import { SpeechAction } from 'store/features/speech/slice'
import { StateAction } from 'store/features/system/slice'
import { ThemeAction } from 'store/features/theme/slice'

/**
 * Re-export from store
 */
export { store } from 'store/configureStore'
export { default as StorePersistGate } from 'store/StorePersistGate'

/**
 * RootAction - type representing union type of all action objects
 */
type RootAction =
  | RouterAction
  | AuthAction
  | ThemeAction
  | CameraAction
  | StateAction
  | ScannerAction
  | DialogAction
  | DataStorageAction
  | ActionsServiceAction
  | PositionAction
  | AlignmentAction
  | RoutingAction
  | PlanningAction
  | ErrorAction
  | RtkServiceAction
  | GlobalAction
  | PointCloudAction
  | SpeechAction
  | SettingsAction
  | CoordinateSystemActions

declare module 'typesafe-actions' {
  interface Types {
    RootAction: RootAction
  }
}
