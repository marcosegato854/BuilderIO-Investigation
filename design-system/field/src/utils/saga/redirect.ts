import { push } from 'connected-react-router'
import { put, select } from 'redux-saga/effects'
import { Routes } from 'Routes'
import { selectDataStorageCurrentProject } from 'store/features/dataStorage/slice'

export function* redirectToCurrentJob() {
  const currentProject: IProject | null = yield select(
    selectDataStorageCurrentProject
  )
  if (currentProject) {
    yield put(
      push(
        Routes.JOBS.replace(':diskName', currentProject.disk || '').replace(
          ':projectName',
          currentProject.name
        )
      )
    )
  } else {
    yield put(push(Routes.PROJECTS))
  }
}
