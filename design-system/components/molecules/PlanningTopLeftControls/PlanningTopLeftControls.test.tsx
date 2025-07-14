import {
  fireEvent,
  queries,
  RenderResult,
  waitFor,
} from '@testing-library/react'
import { PlanningTopLeftControls } from 'components/molecules/PlanningTopLeftControls/PlanningTopLeftControls'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { rangeDisplayAction } from 'store/features/planning/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('PlanningTopLeftControls (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PlanningTopLeftControls />)(mockedStore)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should have the show range button', () => {
    expect(component.getByTestId('toggle-range-button')).toBeTruthy()
  })

  test('should toggle range display', async () => {
    const toggleButton = component.getByTestId('toggle-range-button')
    await waitFor(
      () => {
        fireEvent.click(toggleButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(rangeDisplayAction(false))
  })
})
