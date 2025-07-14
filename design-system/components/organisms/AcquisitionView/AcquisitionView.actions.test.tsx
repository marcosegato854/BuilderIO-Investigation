/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
  queries,
  RenderResult,
  waitFor,
  within,
  screen,
} from '@testing-library/react'
import { AcquisitionView } from 'components/organisms/AcquisitionView/AcquisitionView'
import { t } from 'i18n/config'
import { mergeDeepRight } from 'ramda'
import configureMockStore from 'redux-mock-store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  actionsServiceStartRecordingInfoActions,
  actionsServiceStopRecordingInfoActions,
} from 'store/features/actions/slice'
import { SystemAction } from 'store/features/actions/types'
import { systemStateActions } from 'store/features/system/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import {
  mkCameraExposure,
  mkCameraTrigger,
} from 'store/features/camera/mockApi'
import { mkDataStorageState } from 'store/features/dataStorage/mockApi'

describe('AcquisitionView (mockStore)', () => {
  let component: RenderResult<typeof queries>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
  })

  afterEach(() => {})

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should not display progress by default', () => {
    expect(screen.queryByTestId('progress-layer')).not.toBeInTheDocument()
  })
})

describe('AcquisitionView (mockStore with current action starting recording)', () => {
  let component: RenderResult<typeof queries>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentAction: SystemAction = {
    code: 'SCN-045',
    status: 'progress',
    progress: 1,
    description: 'temp',
    p1: 'Param1',
  }
  const mockedStore: any = configureMockStore()(
    mergeDeepRight(mockStore, {
      actionsService: {
        currentAction,
      },
      system: {
        systemState: {
          state: 'StartingRecording',
        },
      },
    })
  )

  beforeEach(() => {
    component = renderWithProvider(<AcquisitionView />)(mockedStore)
  })

  afterEach(() => {})

  test('It should display activation action message', () => {
    const progresLayer = component.getByTestId('progress-layer')
    const expectedMessage = t(
      `backend_errors.code.${currentAction.code}`
    ).replace('{p1}', currentAction.p1!)
    expect(within(progresLayer).getByText(expectedMessage)).toBeTruthy()
  })
})

describe('AcquisitionView (realStore)', () => {
  let component: RenderResult<typeof queries>
  const store = getTestingStore()

  let mockedCameraExposure: jest.SpyInstance<any>
  let mockedCameraTrigger: jest.SpyInstance<any>
  let mockedDatastorageState: jest.SpyInstance<any>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentAction: SystemAction = {
    code: 'SCN-045',
    status: 'progress',
    progress: 1,
    description: 'temp',
    p1: 'Param1',
  }

  beforeEach(() => {
    mockedCameraExposure = mkCameraExposure()
    mockedCameraTrigger = mkCameraTrigger()
    mockedDatastorageState = mkDataStorageState()
    // enable fake timers
    jest.useFakeTimers()
    component = renderWithProvider(<AcquisitionView />)(store)
  })

  afterEach(() => {
    jest.useRealTimers()
    mockedCameraExposure.mockClear()
    mockedCameraTrigger.mockClear()
    mockedDatastorageState.mockClear()
  })

  test('It should update starting recording action message', async () => {
    await waitFor(
      () => {
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: 'StartingRecording',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          actionsServiceStartRecordingInfoActions.success({
            action: mergeDeepRight(currentAction, { p1: 'ChangedParam' }),
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const progresLayer = component.getByTestId('progress-layer')
    const expectedMessage = t(
      `backend_errors.code.${currentAction.code}`
    ).replace('{p1}', 'ChangedParam')
    expect(within(progresLayer).getByText(expectedMessage)).toBeTruthy()
  })

  test('It should update stopping recording action message', async () => {
    await waitFor(
      () => {
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: 'StoppingRecording',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        store.dispatch(
          actionsServiceStopRecordingInfoActions.success({
            action: mergeDeepRight(currentAction, { p1: 'StoppingParam' }),
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const progresLayer = component.getByTestId('progress-layer')
    const expectedMessage = t(
      `backend_errors.code.${currentAction.code}`
    ).replace('{p1}', 'StoppingParam')
    expect(within(progresLayer).getByText(expectedMessage)).toBeTruthy()
  })

  test('It should not display any action message in logging state', async () => {
    await waitFor(
      () => {
        store.dispatch(
          actionsServiceStartRecordingInfoActions.success({
            action: mergeDeepRight(currentAction, { p1: 'StoppingParam' }),
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: 'Logging',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const expectedMessage = t(
      `backend_errors.code.${currentAction.code}`
    ).replace('{p1}', 'StoppingParam')
    expect(screen.queryByText(expectedMessage)).not.toBeInTheDocument()
  })

  test('It should not display any action message in recording state', async () => {
    await waitFor(
      () => {
        store.dispatch(
          actionsServiceStartRecordingInfoActions.success({
            action: mergeDeepRight(currentAction, { p1: 'StoppingParam' }),
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(
      () => {
        // set system state
        store.dispatch(
          systemStateActions.success({
            state: 'Recording',
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const expectedMessage = t(
      `backend_errors.code.${currentAction.code}`
    ).replace('{p1}', 'StoppingParam')
    expect(screen.queryByText(expectedMessage)).not.toBeInTheDocument()
  })
})
