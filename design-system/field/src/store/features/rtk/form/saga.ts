import { DialogNames } from 'components/dialogs/dialogNames'
import { t } from 'i18n/config'
import { put, race, select, take, takeLatest } from 'redux-saga/effects'
import {
  actionServiceDialogProceed,
  actionsServiceAbort,
} from 'store/features/actions/slice'
import {
  dataStorageUpdateJobActions,
  selectDataStorageCurrentJob,
  selectDataStorageTempJob,
} from 'store/features/dataStorage/slice'
import { isRTKServerIncomplete } from 'store/features/dataStorage/utils'
import {
  closeDialogAction,
  openDialogAction,
} from 'store/features/dialogs/slice'
import { errorAction } from 'store/features/errors/slice'
import {
  rtkServiceCloseDialog,
  selectRtkCurrentServer,
} from 'store/features/rtk/slice'
import { RtkServer } from 'store/features/rtk/types'

/**
 * SAGAS
 */
function* rtkCloseDialog({
  payload,
}: ReturnType<typeof rtkServiceCloseDialog>) {
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const section = pathname.split('/')[1]
  const { job } = payload
  const tempJob: IJob | null = yield select(selectDataStorageTempJob)
  const currentJob: IJob | null = yield select(selectDataStorageCurrentJob)
  const currentServer: RtkServer | null = yield select(selectRtkCurrentServer)
  // canAbortActivation is true only when the user
  // already confirmed the job dialog during activation
  const canAbortActivation: boolean = !!payload.canAbortActivation
  const skipRTK: boolean = !!payload.skipRTK
  switch (section) {
    case 'projects':
      console.info('[RTK_CLOSE_DIALOG] close the dialog')
      yield put(closeDialogAction())
      console.info('[RTK_CLOSE_DIALOG] back to job form')
      yield put(
        openDialogAction({
          component: DialogNames.NewJobForm,
          componentProps: {
            initialValues: job || tempJob,
          },
        })
      )
      break
    case 'acquisition':
      if (job) {
        if (canAbortActivation && isRTKServerIncomplete(job.ntrip!)) {
          console.warn('[RTK_CLOSE_DIALOG] RTK Server is incomplete')
          if (currentServer && !currentServer?.connected) {
            yield put(
              errorAction(
                new Error(
                  t('rtk.dialog.connection', 'Please connect to a server')
                )
              )
            )
          } else {
            yield put(
              errorAction(
                new Error(
                  t('rtk.dialog.incomplete', 'Server information is incomplete')
                )
              )
            )
          }
          return
        }
        // save rtk settings on job and wait for success
        const jobToUpdate = tempJob || currentJob
        if (!jobToUpdate) {
          console.info('[RTK_CLOSE_DIALOG] No job to update')
          return
        }
        yield put(
          dataStorageUpdateJobActions.request({
            jobName: jobToUpdate.name,
            job: { ...jobToUpdate, ntrip: job.ntrip },
          })
        )
        const results: unknown[] = yield race([
          take(dataStorageUpdateJobActions.success),
          take(dataStorageUpdateJobActions.failure),
        ])
        if (results[1]) return
        yield put(closeDialogAction())
        if (canAbortActivation) {
          console.info('[RTK_CLOSE_DIALOG] RTK server saved, proceed')
          yield put(actionServiceDialogProceed())
        } else {
          console.info('[RTK_CLOSE_DIALOG] RTK server saved, back to job')
          yield put(
            openDialogAction({
              component: DialogNames.NewJobForm,
              componentProps: {
                initialValues: job,
                lockedPlan: true,
              },
            })
          )
        }
      } else if (canAbortActivation) {
        if (skipRTK) {
          console.info('[RTK_CLOSE_DIALOG] skip')
          if (!currentJob) {
            console.info('[RTK_CLOSE_DIALOG] no current job')
            return
          }
          yield put(
            dataStorageUpdateJobActions.request({
              jobName: currentJob.name,
              job: {
                ...currentJob,
                ntrip: { ...currentJob.ntrip, enable: false },
              },
            })
          )
          const results: unknown[] = yield race([
            take(dataStorageUpdateJobActions.success),
            take(dataStorageUpdateJobActions.failure),
          ])
          if (results[1]) return
          yield put(closeDialogAction())
          yield put(actionServiceDialogProceed())
        } else {
          console.warn('[RTK_CLOSE_DIALOG] abort')
          yield put(closeDialogAction())
          yield put(actionsServiceAbort())
        }
      } else {
        console.warn('[RTK_CLOSE_DIALOG] RTK edit canceled, back to job')
        yield put(closeDialogAction())
        yield put(
          openDialogAction({
            component: DialogNames.NewJobForm,
            componentProps: {
              initialValues: tempJob,
              lockedPlan: true,
            },
          })
        )
      }
      break
    default:
      console.info('[RTK_CLOSE_DIALOG] just close')
      yield put(closeDialogAction())
      break
  }
}

export function* rtkFormSaga() {
  yield takeLatest(rtkServiceCloseDialog, rtkCloseDialog)
}
