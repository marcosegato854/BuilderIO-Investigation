/* eslint-disable @typescript-eslint/no-explicit-any */
import { queries, RenderResult, screen, waitFor } from '@testing-library/react'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import moxios from 'moxios'
import React from 'react'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  mkInitialAlignmentInfo,
  mkInitialAlignmentStart,
} from 'store/features/actions/mockApi'
import { actionsServiceInitialAlignmentAction } from 'store/features/actions/slice'
import { systemStateActions } from 'store/features/system/slice'
import apiClientBackend from 'store/services/apiClientBackend'
import { composeErrorString } from 'utils/errors'
import { renderWithProvider } from 'utils/test'

describe('Initial Alignment saga', () => {
  let mockInitialAlignmentStartAPI: jest.SpyInstance<any>
  let mockInitialAlignmentInfoAPI: jest.SpyInstance<any>
  let store: Store
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    store = getTestingStore()
    moxios.install(apiClientBackend)
    moxios.stubRequest('/routing/autocapture/polygons', {
      status: 200,
      response: {},
    })
    //
    mockInitialAlignmentStartAPI = mkInitialAlignmentStart({
      action: {
        status: 'accepted',
        progress: 0,
        description: 'initialAlignment started',
      },
    })
    mockInitialAlignmentInfoAPI = mkInitialAlignmentInfo()
    // render
    component = renderWithProvider(
      <div>
        <DialogManager />
      </div>
    )(store)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(async () => {
    moxios.uninstall(apiClientBackend)
    mockInitialAlignmentStartAPI.mockClear()
    mockInitialAlignmentInfoAPI.mockClear()
    jest.useRealTimers()
  })

  test('should poll initialalignment state until action is complete', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
        store.dispatch(actionsServiceInitialAlignmentAction())
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockInitialAlignmentStartAPI).toHaveBeenCalled()
    expect(mockInitialAlignmentInfoAPI).toHaveBeenCalledTimes(2)
    //
    mockInitialAlignmentInfoAPI.mockClear()
    mockInitialAlignmentInfoAPI = mkInitialAlignmentInfo({
      action: {
        status: 'done',
        progress: 100,
        description: 'initialAlignment done',
      },
    })
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'InitialAlignment',
          })
        )
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockInitialAlignmentInfoAPI).toHaveBeenCalledTimes(1)
  })

  test('should poll initialalignment state until action is complete', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
        store.dispatch(actionsServiceInitialAlignmentAction())
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockInitialAlignmentStartAPI).toHaveBeenCalled()
    expect(mockInitialAlignmentInfoAPI).toHaveBeenCalledTimes(2)
    //
    const errors = [
      {
        code: '001',
        description: 'error description',
      },
    ]
    mockInitialAlignmentInfoAPI.mockClear()
    mockInitialAlignmentInfoAPI = mkInitialAlignmentInfo({
      action: {
        status: 'error',
        progress: 100,
        description: 'initialAlignment error',
        errors,
      },
    })
    await waitFor(() => {}, { timeout: 2000 })
    jest.advanceTimersByTime(2000)
    expect(
      screen.getByText(composeErrorString('Initial Alignment failed', errors))
    ).toBeTruthy()
  })
})
