import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { push } from 'connected-react-router'
import { t } from 'i18n/config'
import { isNil } from 'ramda'
import { call, put, race, select, take, takeLatest } from 'redux-saga/effects'
import { Routes } from 'Routes'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
} from 'store/features/dataStorage/slice'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import {
  clearPlanningHistoryAction,
  getPlannedJobActions,
  processingInfoPlanActions,
  resetPlanAction,
  savePlannedJobActions,
  saveProcessingResult,
  selectOptimisation,
  selectPlanComplete,
  selectPlanningServiceState,
  startProcessingPlanActions,
  submitPlanAction,
  toolAction,
  updatePlannedJobActions,
} from 'store/features/planning/slice'
import { JobPlan, PlanningTools } from 'store/features/planning/types'
import { resetRandomColors } from 'utils/colors'
import { onlyWithEnoughPoints } from 'utils/planning/polygonHelpers'
import { store } from 'store'

/**
 * SAGAS
 */

function* clearHistoryOnSave() {
  yield put(clearPlanningHistoryAction())
}

function* resetColors() {
  yield call(resetRandomColors)
}

function* checkPlanCompleteness(plan: JobPlan) {
  if (!plan.polygons.length) {
    console.warn('[PLANNING] no tracks')
    yield put(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'error',
          title: t('planning.alert.notracks.title', 'process'),
          text: t('planning.alert.notracks.message', 'no tracks'),
          okButtonLabel: t('planning.alert.notracks.button', 'ok'),
          okButtonCallback: () => {
            store.dispatch(closeDialogAction())
          },
        } as IAlertProps,
      })
    )
    return false
  }
  if (!plan.initialAlignmentPoint) {
    console.warn('[PLANNING] no initialAlignmentPoint')
    yield put(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'error',
          title: t('planning.alert.initialAlignmentPoint.title', 'process'),
          text: t(
            'planning.alert.initialAlignmentPoint.message',
            'no initial point'
          ),
          okButtonLabel: t('planning.alert.initialAlignmentPoint.button', 'ok'),
          okButtonCallback: () => {
            store.dispatch(toolAction(PlanningTools.INITIAL_POINT))
            store.dispatch(closeDialogAction())
          },
        } as IAlertProps,
      })
    )
    return false
  }
  if (!plan.finalAlignmentPoint) {
    console.warn('[PLANNING] no finalAlignmentPoint')
    yield put(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'warning',
          title: t('planning.alert.finalAlignmentPoint.title', 'process'),
          text: t(
            'planning.alert.finalAlignmentPoint.message',
            'no initial point'
          ),
          okButtonLabel: t('planning.alert.finalAlignmentPoint.button', 'ok'),
        } as IAlertProps,
      })
    )
    yield take(closeDialogAction)
  }
  return true
}

function* waitProcessingResult() {
  while (true) {
    const [startFailure, infoFailure, startSuccess, infoSuccess]: [
      ReturnType<typeof startProcessingPlanActions.failure> | undefined,
      ReturnType<typeof processingInfoPlanActions.failure> | undefined,
      ReturnType<typeof startProcessingPlanActions.success> | undefined,
      ReturnType<typeof processingInfoPlanActions.success> | undefined
    ] = yield race([
      take(startProcessingPlanActions.failure),
      take(processingInfoPlanActions.failure),
      take(startProcessingPlanActions.success),
      take(processingInfoPlanActions.success),
    ])
    const processed = !startFailure && !infoFailure
    if (!processed) {
      console.error('[PLANNING] error processing')
      return false
    }
    const result = startSuccess || infoSuccess
    const { status } = result?.payload.action || {}
    if (status === 'done') {
      console.info('[PLANNING] processing is complete')
      const processingResult = result?.payload.result?.plan
      if (processingResult) {
        yield put(saveProcessingResult(processingResult))
      }
      return processingResult
    }
    console.info('[PLANNING] still processing')
  }
}

function* redirectToActivation() {
  const project: IProject | null = yield select(selectDataStorageCurrentProject)
  const job: IJob | null = yield select(selectDataStorageCurrentJob)
  console.info(
    '[PLANNING] redirect to:',
    Routes.ACQUISITION.replace(':diskName', project!.disk || '')
      .replace(':projectName', project!.name || '')
      .replace(':jobName', job!.name)
  )
  yield put(
    push(
      Routes.ACQUISITION.replace(':diskName', project!.disk || '')
        .replace(':projectName', project!.name || '')
        .replace(':jobName', job!.name)
    )
  )
}

function* submitPlan({ payload }: ReturnType<typeof submitPlanAction>) {
  // get necessary data
  const {
    undoablePolygons,
    initialAlignmentPoint,
    finalAlignmentPoint,
    sideCameras,
    scanner,
    creationDate,
    needed,
  } = yield select(selectPlanningServiceState)
  const complete: boolean = yield select(selectPlanComplete)
  let plan: JobPlan = {
    polygons: onlyWithEnoughPoints(undoablePolygons.present),
    ...(finalAlignmentPoint ? { finalAlignmentPoint } : {}),
    ...(initialAlignmentPoint ? { initialAlignmentPoint } : {}),
    ...(!isNil(sideCameras) ? { sideCameras } : {}),
    ...(scanner ? { scanner } : {}),
    ...(needed ? { needed } : {}),
  }
  const project: IProject | null = yield select(selectDataStorageCurrentProject)
  const job: IJob | null = yield select(selectDataStorageCurrentJob)
  // process
  if (payload.process) {
    console.info('[PLANNING] start processing')
    const proceed: boolean = yield call(checkPlanCompleteness, plan)
    if (!proceed) {
      console.info('[PLANNING] processing aborted')
      return
    }

    yield put(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'message',
          variant: 'colored',
          cancelButtonLabel: t(
            'planning.submit.optimise_plan',
            'refine track order'
          ),
          okButtonLabel: t('planning.submit.keep_plan', 'keep current plan'),
          okButtonCallback: () => {
            store.dispatch(selectOptimisation(false))
          }, //actual plan callback
          cancelButtonCallback: () => {
            store.dispatch(selectOptimisation(true))
          }, //optimized plan callback
          title: t('planning.submit.estimate', 'estimate'),
          text: t(
            'planning.submit.optimise_popup',
            'estimation is based on the current plan.'
          ),
          noWrapButton: true,
          showCloseButton: true,
        } as IAlertProps,
      })
    )
    /** wait user interaction */
    const action: ReturnType<typeof selectOptimisation> = yield take(
      selectOptimisation
    )
    const optimize: boolean = action.payload

    yield put(
      startProcessingPlanActions.request({
        plan,
        disk: project!.disk,
        project: project!.name,
        job: job!.name,
        optimize: optimize,
      })
    )

    /** wait processing result */
    const processingResult: JobPlan | null = yield call(waitProcessingResult)
    if (!processingResult) {
      console.error('[PLANNING] processing error')
      return
    }
    plan = { ...processingResult }
  }
  // save / update
  if (payload.save || payload.process) {
    console.info('[PLANNING] saving / updating plan')
    const actionCreator = creationDate
      ? updatePlannedJobActions.request
      : savePlannedJobActions.request
    yield put(
      actionCreator({
        plan,
        disk: project!.disk,
        project: project!.name,
        job: job!.name,
      })
    )
    console.info('[PLANNING] plan saved / updated')
  }
  // redirect
  if (payload.activate && complete) {
    console.info('[PLANNING] plan is complete, will redirect to aquisition')
    /** wait save result */
    if (payload.save) {
      const [saveSuccess, updateSuccess]: [
        ReturnType<typeof updatePlannedJobActions.failure> | undefined,
        ReturnType<typeof savePlannedJobActions.failure> | undefined
      ] = yield race([
        take(updatePlannedJobActions.success),
        take(savePlannedJobActions.success),
        take(updatePlannedJobActions.failure),
        take(savePlannedJobActions.failure),
      ])
      if (saveSuccess || updateSuccess) {
        yield call(redirectToActivation)
      }
      return
    }
    yield call(redirectToActivation)
  }
}

export function* planningSubmitSaga() {
  yield takeLatest(
    [
      savePlannedJobActions.success,
      updatePlannedJobActions.success,
      getPlannedJobActions.success,
      resetPlanAction,
    ],
    clearHistoryOnSave
  )
  yield takeLatest(submitPlanAction, submitPlan)
  yield takeLatest(resetPlanAction, resetColors)
}
