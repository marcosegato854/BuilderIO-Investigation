import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult, waitFor } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { store } from 'store'
import { PlanningTools } from 'store/features/planning/types'
import { t } from 'i18n/config'
import { toolAction } from 'store/features/planning/slice'
import { PlanningUserHints } from './PlanningUserHints'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('PlanningUserHints (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PlanningUserHints />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})

describe('SidePanelJobPlanning (mock API responses)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    // enable fake timers
    jest.useFakeTimers()
    /** render */
    component = renderWithProvider(<PlanningUserHints />)(store)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('should change the hint for the initial point tool', async () => {
    await waitFor(
      () => {
        store.dispatch(toolAction(PlanningTools.INITIAL_POINT))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('planning.user_tips.initial_point', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('should change the hint for the final point tool', async () => {
    await waitFor(
      () => {
        store.dispatch(toolAction(PlanningTools.FINAL_POINT))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(
      component.getByText(
        t('planning.user_tips.final_point', 'wrong') as string
      )
    ).toBeTruthy()
  })
})
