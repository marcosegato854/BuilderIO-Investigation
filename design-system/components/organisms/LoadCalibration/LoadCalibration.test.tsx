import React from 'react'
import { mockStore } from 'store/mock/mockStoreTests'
import configureMockStore from 'redux-mock-store'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { LoadCalibration } from 'components/organisms/LoadCalibration/LoadCalibration'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('LoadCalibration (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<LoadCalibration />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display calibration button', () => {
    const calibrationButton = component.getByTestId('calibration-button')
    expect(calibrationButton).toBeTruthy()
  })
})
