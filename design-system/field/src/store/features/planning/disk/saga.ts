import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { push } from 'connected-react-router'
import { t } from 'i18n/config'
import {
  all,
  call,
  fork,
  put,
  race,
  select,
  take,
  takeLatest,
} from 'redux-saga/effects'
import { Routes } from 'Routes'
import { store } from 'store'
import {
  selectDataStorageCurrentJob,
  selectDataStorageCurrentProject,
  selectDataStorageDisks,
} from 'store/features/dataStorage/slice'
import { openDialogAction } from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  processingInfoPlanActions,
  savePlannedJobActions,
  selectPlanningServiceState,
  startProcessingPlanActions,
  updatePlannedJobActions,
} from 'store/features/planning/slice'
import { JobPlan, SaveLocation } from 'store/features/planning/types'
import { slotOrDisk } from 'utils/disks'
/* import { addSpeechText } from 'store/features/speech/slice'
import { SpeechTextType } from 'store/features/speech/types' */
import { extractErrorData } from 'utils/errors'

/**
 * SAGAS
 */

/** display warnings coming from plan CRUD operations */
function* displayPlanWarnings() {
  while (true) {
    yield race([
      take(updatePlannedJobActions.request),
      take(savePlannedJobActions.request),
    ])
    const [updateSuccess, saveSuccess]: [
      ReturnType<typeof updatePlannedJobActions.success> | undefined,
      ReturnType<typeof savePlannedJobActions.success> | undefined
    ] = yield race([
      take(updatePlannedJobActions.success),
      take(savePlannedJobActions.success),
    ])
    const warnings =
      updateSuccess?.payload.warnings || saveSuccess?.payload.warnings
    const project: IProject | null = yield select(
      selectDataStorageCurrentProject
    )
    const job: IJob | null = yield select(selectDataStorageCurrentJob)
    const disks: IDisk[] = yield select(selectDataStorageDisks)
    if (warnings?.length) {
      warnings.forEach((warning) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dialogData: any = t(`planning.warnings.${warning.code}`, {
          returnObjects: true,
        })
        if (dialogData) {
          // this handles the 'SPACE WARNING' alert
          if (warning.code === 'DS-039') {
            const actionCreator =
              updateSuccess?.payload.plan.creationDate ||
              saveSuccess?.payload.plan.creationDate
                ? updatePlannedJobActions.request
                : savePlannedJobActions.request
            const plan =
              updateSuccess?.payload.plan || saveSuccess?.payload.plan
            const { title, text, buttonCancel, buttonOk } = dialogData
            if (plan) {
              const okButtonCallback = () => {
                console.info('[PLANNING] moving the project/job to a new disk')
                store.dispatch(
                  actionCreator({
                    plan,
                    disk: project!.disk,
                    project: project!.name,
                    job: job!.name,
                    saveLocation: SaveLocation.WHERE_SPACE_AVAILABLE,
                  })
                )
              }
              const cancelButtonCallback = () => {
                console.warn(
                  '[PLANNING] forcing the project/job in the same disk'
                )
                store.dispatch(
                  actionCreator({
                    plan,
                    disk: project!.disk,
                    project: project!.name,
                    job: job!.name,
                    saveLocation: SaveLocation.CURRENT_DISK,
                  })
                )
              }
              /* store.dispatch(
                addSpeechText({
                  content: { text, type: SpeechTextType.ERROR },
                  priority: true,
                })
              ) */
              const noWrapButton = warning.code === 'DS-039'
              if (disks.length === 1) {
                store.dispatch(
                  openDialogAction({
                    component: DialogNames.Alert,
                    componentProps: {
                      title,
                      text,
                      okButtonLabel: buttonCancel,
                      okButtonCallback: cancelButtonCallback,
                      type: dialogData.$type,
                      noWrapButton,
                    } as IAlertProps,
                  })
                )
              } else {
                store.dispatch(
                  openDialogAction({
                    component: DialogNames.Alert,
                    componentProps: {
                      title,
                      text,
                      okButtonLabel: buttonOk,
                      cancelButtonLabel: buttonCancel,
                      okButtonCallback,
                      cancelButtonCallback,
                      type: dialogData.$type,
                      noWrapButton,
                    } as IAlertProps,
                  })
                )
              }
            }
          } else {
            // TODO: PLANNING - here dialogData can be empty, we should handle a default
            const { title, text, buttonOk } = dialogData
            store.dispatch(
              openDialogAction({
                component: DialogNames.Alert,
                componentProps: {
                  title,
                  text,
                  okButtonLabel: buttonOk,
                  type: dialogData.$type,
                } as IAlertProps,
              })
            )
          }
        }
      })
    }
  }
}

function* redirectIfNewDisk() {
  while (true) {
    const [updateSuccess, saveSuccess]: [
      ReturnType<typeof updatePlannedJobActions.success> | undefined,
      ReturnType<typeof savePlannedJobActions.success> | undefined
    ] = yield race([
      take(updatePlannedJobActions.success),
      take(savePlannedJobActions.success),
    ])

    const disk = updateSuccess?.payload?.disk || saveSuccess?.payload?.disk
    const project =
      updateSuccess?.payload?.project || saveSuccess?.payload?.project
    const job: IJob | null = yield select(selectDataStorageCurrentJob)
    if (disk && project && job) {
      console.info('[PLANNING] redirecting after saving on a new disk')
      const jobRoute = Routes.PLANNING.replace(':diskName', disk)
        .replace(':projectName', project)
        .replace(':jobName', job.name)
      yield put(push(jobRoute))
      // notify the user
      const availableDisks: IDisk[] = yield select(selectDataStorageDisks)
      const diskLabel = slotOrDisk(disk, availableDisks)
      yield put(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            title: t('planning.warnings.job_moved.title', 'Moved'),
            text: t('planning.warnings.job_moved.text', {
              disk: diskLabel,
              project,
              job: job.name,
            }),
            okButtonLabel: t('planning.warnings.job_moved.buttonOk', 'ok'),
            type: t('planning.warnings.job_moved.$type', 'message'),
          } as IAlertProps,
        })
      )
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* plannedJobsFailureCustomFeedback({
  payload,
}: ReturnType<typeof updatePlannedJobActions.failure>) {
  const data = extractErrorData(payload)
  if (data?.code === 'DS-038') {
    console.warn('[PLANNING] disk space is critical')
    yield call(plannedJobsHandleCriticalDisk)
  } else {
    yield put(errorAction(payload))
  }
}

function* plannedJobsHandleCriticalDisk() {
  const {
    undoablePolygons,
    initialAlignmentPoint,
    finalAlignmentPoint,
    needed,
    creationdate,
    scanner,
    sideCameras,
  } = yield select(selectPlanningServiceState)
  const plan: JobPlan = {
    polygons: undoablePolygons.present,
    finalAlignmentPoint,
    initialAlignmentPoint,
    needed,
    scanner,
    sideCameras,
  }
  const project: IProject | null = yield select(selectDataStorageCurrentProject)
  const job: IJob | null = yield select(selectDataStorageCurrentJob)
  const disks: IDisk[] = yield select(selectDataStorageDisks)
  const actionCreator = creationdate
    ? updatePlannedJobActions.request
    : savePlannedJobActions.request
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialogData: any = t('planning.warnings.DS-038', {
    returnObjects: true,
  })
  if (dialogData) {
    const { title, textSingle, textMultiple, buttonCancel, buttonOk } =
      dialogData
    const okButtonCallback = () => {
      console.info('[PLANNING] moving the project/job to a new disk')
      store.dispatch(
        actionCreator({
          plan,
          disk: project!.disk,
          project: project!.name,
          job: job!.name,
          saveLocation: SaveLocation.WHERE_SPACE_AVAILABLE,
        })
      )
    }
    const cancelButtonCallback = () => {
      console.warn('[PLANNING] forcing the project/job in the same disk')
      store.dispatch(
        actionCreator({
          plan,
          disk: project!.disk,
          project: project!.name,
          job: job!.name,
          saveLocation: SaveLocation.CURRENT_DISK,
        })
      )
    }
    if (disks.length === 1) {
      store.dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            title,
            text: textSingle,
            okButtonLabel: buttonCancel,
            okButtonCallback: cancelButtonCallback,
            type: dialogData.$type,
          } as IAlertProps,
        })
      )
    } else {
      store.dispatch(
        openDialogAction({
          component: DialogNames.Alert,
          componentProps: {
            title,
            text: textMultiple,
            okButtonLabel: buttonOk,
            cancelButtonLabel: buttonCancel,
            okButtonCallback,
            cancelButtonCallback,
            type: dialogData.$type,
          } as IAlertProps,
        })
      )
    }
  }
}

export function* planningDiskSaga() {
  yield all([fork(displayPlanWarnings)])
  yield all([fork(redirectIfNewDisk)])
  yield takeLatest(
    [
      savePlannedJobActions.failure,
      updatePlannedJobActions.failure,
      startProcessingPlanActions.failure,
      processingInfoPlanActions.failure,
    ],
    plannedJobsFailureCustomFeedback
  )
}
