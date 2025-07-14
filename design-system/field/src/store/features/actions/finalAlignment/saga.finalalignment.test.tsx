/* eslint-disable @typescript-eslint/no-explicit-any */
import { queries, RenderResult, screen, waitFor } from '@testing-library/react'
import { DialogManager } from 'components/organisms/DialogManager/DialogManager'
import moxios from 'moxios'
import React from 'react'
import { Store } from 'redux'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import {
  mkFinalAlignmentInfo,
  mkFinalAlignmentStart,
} from 'store/features/actions/mockApi'
import { actionsServiceFinalAlignmentAction } from 'store/features/actions/slice'
import { systemStateActions } from 'store/features/system/slice'
import apiClientBackend from 'store/services/apiClientBackend'
import { composeErrorString } from 'utils/errors'
import { renderWithProvider } from 'utils/test'

describe('Final Alignment saga', () => {
  let mockFinalAlignmentStartAPI: jest.SpyInstance<any>
  let mockFinalAlignmentInfoAPI: jest.SpyInstance<any>
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
    mockFinalAlignmentStartAPI = mkFinalAlignmentStart()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo()
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
    mockFinalAlignmentStartAPI.mockClear()
    mockFinalAlignmentInfoAPI.mockClear()
    jest.useRealTimers()
  })

  test('should poll finalalignment state until action is complete', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
        store.dispatch(actionsServiceFinalAlignmentAction())
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockFinalAlignmentStartAPI).toHaveBeenCalled()
    expect(mockFinalAlignmentInfoAPI).toHaveBeenCalledTimes(2)
    //
    mockFinalAlignmentInfoAPI.mockClear()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo()
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'FinalAlignment',
          })
        )
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockFinalAlignmentInfoAPI).toHaveBeenCalledTimes(1)
  })

  test('should poll finalalignment state until action is complete', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
        store.dispatch(actionsServiceFinalAlignmentAction())
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockFinalAlignmentStartAPI).toHaveBeenCalled()
    expect(mockFinalAlignmentInfoAPI).toHaveBeenCalledTimes(2)
    //
    const errors = [
      {
        code: '001',
        description: 'error description',
      },
    ]
    mockFinalAlignmentInfoAPI.mockClear()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo({
      action: {
        status: 'error',
        progress: 100,
        description: 'finalAlignment error',
        errors,
      },
    })
    await waitFor(() => {}, { timeout: 2000 })
    jest.advanceTimersByTime(2000)
    expect(screen.getByText(composeErrorString('', errors))).toBeTruthy()
  })

  test('should display final alignment generic error as error', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
        store.dispatch(actionsServiceFinalAlignmentAction())
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockFinalAlignmentStartAPI).toHaveBeenCalled()
    expect(mockFinalAlignmentInfoAPI).toHaveBeenCalledTimes(2)
    //
    const errors = [
      {
        code: '001',
        description: 'error description',
      },
    ]
    mockFinalAlignmentInfoAPI.mockClear()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo({
      action: {
        status: 'error',
        progress: 100,
        description: 'finalAlignment error',
        errors,
      },
    })
    await waitFor(() => {}, { timeout: 2000 })
    jest.advanceTimersByTime(2000)
    const dialog = screen.getByTestId('alert-dialog')
    expect(dialog.getAttribute('class')).toContain('typeError')
  })

  test('should display final alignment satellites error as warning', async () => {
    await waitFor(
      () => {
        store.dispatch(
          systemStateActions.success({
            state: 'Activated',
          })
        )
        store.dispatch(actionsServiceFinalAlignmentAction())
      },
      { timeout: 2000 }
    )
    jest.advanceTimersByTime(2000)
    expect(mockFinalAlignmentStartAPI).toHaveBeenCalled()
    expect(mockFinalAlignmentInfoAPI).toHaveBeenCalledTimes(2)
    //
    const errors = [
      {
        code: 'POS-022',
        description: 'error description',
      },
    ]
    mockFinalAlignmentInfoAPI.mockClear()
    mockFinalAlignmentInfoAPI = mkFinalAlignmentInfo({
      action: {
        status: 'error',
        progress: 100,
        description: 'finalAlignment error',
        errors,
      },
    })
    await waitFor(() => {}, { timeout: 2000 })
    jest.advanceTimersByTime(2000)
    const dialog = screen.getByTestId('alert-dialog')
    expect(dialog.getAttribute('class')).toContain('typeWarning')
  })
})
