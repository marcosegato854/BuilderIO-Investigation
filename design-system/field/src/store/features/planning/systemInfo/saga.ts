import { equals } from 'ramda'
import { all, call, put, select, take, takeLatest } from 'redux-saga/effects'
import {
  cameraDisplayableNamesActions,
  selectTotalSideCameras,
} from 'store/features/camera/slice'
import {
  getPlannedJobActions,
  scannerAction,
  selectPlanScanner,
  selectPlanSideCameras,
  sideCamerasAction,
} from 'store/features/planning/slice'
import { ScannerTotals } from 'store/features/planning/types'
import {
  scannerInfoActions,
  selectScannerInfo,
} from 'store/features/scanner/slice'
import { ScannerSpecs } from 'store/features/scanner/types'
import {
  selectPlanningSettingsState,
  setPlanningSettings,
} from 'store/features/settings/slice'
import { PlanningSettings } from 'store/features/settings/types'
import {
  selectSystemInfo,
  systemInfoActions,
} from 'store/features/system/slice'
import { SystemInfo } from 'store/features/system/types'
import { scannerTotals } from 'utils/planning/scanners'

/**
 * SAGAS
 */
function* fillSystemInfo() {
  const systemInfo: SystemInfo | null = yield select(selectSystemInfo)
  const planScanners: ScannerTotals | null = yield select(selectPlanScanner)
  const planSideCameras: number | null = yield select(selectPlanSideCameras)
  if (!systemInfo?.sensorUnit?.connected) {
    const savedSettings: PlanningSettings = yield select(
      selectPlanningSettingsState
    )
    const { scanner: savedScanner, sideCameras: savedSideCameras } =
      savedSettings
    if (!equals(planScanners, savedScanner))
      yield put(scannerAction(savedScanner))
    if (!equals(planSideCameras, savedSideCameras))
      yield put(sideCamerasAction(savedSideCameras))
    return
  }
  const scanner: ScannerSpecs[] | null = yield select(selectScannerInfo)
  const systemScannerTotals = scannerTotals(scanner)
  const sideCameras: number | null = yield select(selectTotalSideCameras)
  if (sideCameras !== planSideCameras) yield put(sideCamerasAction(sideCameras))
  if (!equals(systemScannerTotals, planScanners))
    yield put(scannerAction(systemScannerTotals))
}

/**
 * save planning settings if the SU is connected
 */
function* savePlanningSettings() {
  yield all([
    take(systemInfoActions.success),
    take(scannerInfoActions.success),
    take(cameraDisplayableNamesActions.success),
  ])
  const systemInfo: SystemInfo | null = yield select(selectSystemInfo)
  const scanner: ScannerSpecs[] | null = yield select(selectScannerInfo)
  const systemScannerTotals = scannerTotals(scanner)
  const sideCameras: number | null = yield select(selectTotalSideCameras)
  if (systemInfo?.sensorUnit?.connected) {
    yield put(
      setPlanningSettings({
        scanner: systemScannerTotals,
        sideCameras,
      })
    )
  }
}

export function* planningSystemInfoSaga() {
  yield takeLatest(getPlannedJobActions.success, fillSystemInfo)
  yield call(savePlanningSettings)
}
