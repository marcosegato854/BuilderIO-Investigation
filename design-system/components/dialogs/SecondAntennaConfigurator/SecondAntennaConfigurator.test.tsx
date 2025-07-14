/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  waitFor,
} from '@testing-library/react'
import SecondAntennaConfigurator from 'components/dialogs/SecondAntennaConfigurator/SecondAntennaConfigurator'
import { t } from 'i18n/config'
import { Store } from 'redux'
import configureMockStore from 'redux-mock-store'
import { getTestingStore } from 'store/configureTestingStoreAcquisition'
import { mkAntennaClientSettings } from 'store/features/camera/mockApi'
import { cameraCalculateAntenna2LeverarmActions } from 'store/features/camera/slice'
import { mkGetAntennaSettings } from 'store/features/position/mockApi'
import { positionGet2ndAntennaSettingsActions } from 'store/features/position/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import React from 'react'

const mockedStore = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('SecondAntennaConfigurator (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<SecondAntennaConfigurator />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  /** disabled because now it's waiting for the camera socket to close before closing the dialog */
  // test('It should call a close action when clicking cancel', () => {
  //   const cancelButton = component.getByText(
  //     t('second_antenna.cancel', 'wrong') as string
  //   )
  //   fireEvent.click(cancelButton)
  //   expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  // })

  /** disabled because now it's waiting for the camera socket to close before closing the dialog */
  // test('It should call a close action when clicking close', () => {
  //   const closeButton = component.getByTestId('close-button')
  //   fireEvent.click(closeButton)
  //   expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  // })

  test('It should call an API when clicking use saved values', () => {
    const useSavedButton = component.getByTestId('antenna2-saved-values-button')
    fireEvent.click(useSavedButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      positionGet2ndAntennaSettingsActions.request()
    )
  })

  // it checks for the image ratio from the socket, so it doesn't work anymore
  // test('It should call an API when clicking calculate', () => {
  //   const calculateButton = component.getByTestId('antenna2-calculate-button')
  //   fireEvent.click(calculateButton)
  //   expect(mockDispatch).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       type: getType(cameraCalculateAntenna2LeverarmActions.request),
  //     })
  //   )
  // })
})

describe('SecondAntennaConfigurator (testingStore)', () => {
  let component: RenderResult<typeof queries>
  let store: Store
  let mockGetAntennaSettingsAPI: jest.SpyInstance<any>
  let mockGetAntennaClientSettingsAPI: jest.SpyInstance<any>
  const mockOnSave = jest.fn()

  beforeEach(() => {
    store = getTestingStore()
    mockGetAntennaSettingsAPI = mkGetAntennaSettings()
    mockGetAntennaClientSettingsAPI = mkAntennaClientSettings()
    component = renderWithProvider(
      <SecondAntennaConfigurator onSave={mockOnSave} />
    )(store)
  })

  afterEach(() => {
    mockGetAntennaSettingsAPI.mockClear()
    mockGetAntennaClientSettingsAPI.mockClear()
    mockOnSave.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display leverarm values from the position slice', async () => {
    jest.useFakeTimers()
    const leverArm: LeverArm = {
      x: 15,
      y: 12,
      z: 148,
    }
    await waitFor(
      () => {
        store.dispatch(cameraCalculateAntenna2LeverarmActions.success(leverArm))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(component.getByDisplayValue(leverArm.x!.toFixed(3))).toBeTruthy()
    expect(component.getByDisplayValue(leverArm.y!.toFixed(3))).toBeTruthy()
    expect(component.getByDisplayValue(leverArm.z!.toFixed(3))).toBeTruthy()
    jest.useRealTimers()
  })

  test('It should call the callback when clicking save', async () => {
    jest.useFakeTimers()
    const leverArm: LeverArm = {
      x: 15,
      y: 12,
      z: 148,
    }
    await waitFor(
      () => {
        store.dispatch(cameraCalculateAntenna2LeverarmActions.success(leverArm))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const saveButton = component.getByText(
      t('second_antenna.save', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(saveButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        server: expect.objectContaining({
          leverarm: leverArm,
        }),
      })
    )
    jest.useRealTimers()
  })

  /** disabled because now it waits for the camera socket to close before reset */
  // test('It should reset the antenna values when clicking save', async () => {
  //   jest.useFakeTimers()
  //   const leverArm: LeverArm = {
  //     x: 15,
  //     y: 12,
  //     z: 148,
  //   }
  //   await waitFor(
  //     () => {
  //       store.dispatch(cameraCalculateAntenna2LeverarmActions.success(leverArm))
  //       store.dispatch(
  //         cameraGet2ndAntennaClientSettingsActions.success({
  //           pixel: {
  //             x: 12,
  //             y: 15,
  //           },
  //           distance: 1500,
  //         })
  //       )
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const stateBefore = await store.getState()
  //   const antennaBefore = select2ndAntenna(stateBefore)
  //   const antennaClientBefore = select2ndAntennaClient(stateBefore)
  //   expect(antennaBefore.leverarm).toBeTruthy()
  //   expect(antennaClientBefore).toBeTruthy()
  //   const saveButton = component.getByText(
  //     t('second_antenna.save', 'wrong') as string
  //   )
  //   await waitFor(
  //     () => {
  //       fireEvent.click(saveButton)
  //     },
  //     { timeout: 500 }
  //   )
  //   jest.advanceTimersByTime(500)
  //   const stateAfter = await store.getState()
  //   const antennaAfter = select2ndAntenna(stateAfter)
  //   const antennaClientAfter = select2ndAntennaClient(stateAfter)
  //   expect(antennaAfter.leverarm).not.toBeTruthy()
  //   expect(antennaClientAfter).not.toBeTruthy()
  //   jest.useRealTimers()
  // })

  test('It should call the saved values API when clicking on use saved values', async () => {
    jest.useFakeTimers()
    const useSavedButton = component.getByText(
      t('second_antenna.use_saved_values', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(useSavedButton)
      },
      { timeout: 1500 }
    )
    jest.advanceTimersByTime(1500)
    expect(mockGetAntennaSettingsAPI).toHaveBeenCalled()
    jest.useRealTimers()
  })

  test('It should call the saved client values API when clicking on use saved values', async () => {
    jest.useFakeTimers()
    const useSavedButton = component.getByText(
      t('second_antenna.use_saved_values', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(useSavedButton)
      },
      { timeout: 1500 }
    )
    jest.advanceTimersByTime(1500)
    expect(mockGetAntennaClientSettingsAPI).toHaveBeenCalled()
    jest.useRealTimers()
  })
})
