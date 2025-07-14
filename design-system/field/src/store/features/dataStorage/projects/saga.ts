// eslint-disable-next-line import/no-extraneous-dependencies
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { DialogNames } from 'components/dialogs/dialogNames'
import { push } from 'connected-react-router'
import { t } from 'i18n/config'
import { all, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { Routes } from 'Routes'
import { store } from 'store/configureStore'
import {
  dataStorageDeleteProjectDialog,
  dataStorageEditProject,
  dataStorageJobsActions,
  dataStorageNewProjectActions,
  dataStorageProjectDeleteActions,
  dataStorageProjectDetailActions,
  dataStorageProjectsActions,
  dataStorageUpdateProjectActions,
} from 'store/features/dataStorage/slice'
import {
  DataStorageNewProjectResponse,
  DataStorageProjectDetailResponse,
  DataStorageProjectRequestPayload,
} from 'store/features/dataStorage/types'
import { openDialogAction } from 'store/features/dialogs/slice'

/**
 * SAGAS
 */
function* backToProjectsIfProjectNotFound() {
  const pathname: string = yield select(
    (state) => state.router.location.pathname
  )
  const section = pathname.split('/')[1]
  const isJob = pathname.split('/').length > 2
  if (section !== 'projects' || isJob) {
    console.warn(
      '[DATASTORAGE] project not found, back to project list',
      section
    )
    yield put(push(Routes.PROJECTS))
  }
}

function* onEditProject() {
  while (true) {
    const { payload: request }: { payload: DataStorageProjectRequestPayload } =
      yield take(dataStorageEditProject)
    yield put(dataStorageProjectDetailActions.request(request))
    const response: { payload: DataStorageProjectDetailResponse } = yield take(
      dataStorageProjectDetailActions.success
    )
    yield put(
      openDialogAction({
        component: DialogNames.NewProjectForm,
        componentProps: {
          initialValues: {
            ...response.payload,
          },
        },
      })
    )
  }
}

/**
 * ask before deleting a project
 */
function* onDeleteProjectDialog() {
  while (true) {
    const { payload: request }: { payload: DataStorageProjectRequestPayload } =
      yield take(dataStorageDeleteProjectDialog)
    yield put(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'error',
          cancelButtonLabel: t('project_browser.cancel_button', 'Cancel'),
          okButtonCallback: () =>
            store.dispatch(dataStorageProjectDeleteActions.request(request)),
          okButtonLabel: t('project_browser.delete_button', 'YES'),
          text: t('project_browser.delete_text', 'delete text'),
          title: `Delete ${request.project}`,
        } as IAlertProps,
      })
    )
  }
}

function* refreshAfterDeleteProject() {
  while (true) {
    yield take(dataStorageProjectDeleteActions.success)
    yield put(dataStorageProjectsActions.request())
  }
}

function* refreshAfterNewProject() {
  while (true) {
    yield take(dataStorageNewProjectActions.success)
    yield put(dataStorageProjectsActions.request())
  }
}

/**
 * reset current project after successful Project creation
 * and redirect to Job browser
 * and open new Job form
 */
function* redirectAfterNewProject() {
  while (true) {
    const data: { payload: DataStorageNewProjectResponse } = yield take(
      dataStorageNewProjectActions.success
    )
    yield put(
      push(
        Routes.JOBS.replace(':diskName', data.payload.disk).replace(
          ':projectName',
          data.payload.name
        )
      )
    )
    // wait for jobs list so the new job name is ok
    yield take(dataStorageJobsActions.success)
    console.info('[DATASTORAGE] open new job form automatically')
    yield put(openDialogAction({ component: DialogNames.NewJobForm }))
  }
}

function* refreshAfterUpdateProject() {
  while (true) {
    yield take(dataStorageUpdateProjectActions.success)
    yield put(dataStorageProjectsActions.request())
  }
}

// prettier-ignore
export function* dataStorageProjectsSaga() {
  yield takeLatest(
    dataStorageProjectDetailActions.failure,
    backToProjectsIfProjectNotFound
  )
  yield all([fork(onEditProject)])
  yield all([fork(onDeleteProjectDialog)])
  yield all([fork(refreshAfterDeleteProject)])
  yield all([fork(refreshAfterNewProject)])
  yield all([fork(redirectAfterNewProject)])
  yield all([fork(refreshAfterUpdateProject)])
}
