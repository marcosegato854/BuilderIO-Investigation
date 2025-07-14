import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  queries,
  RenderResult,
  waitFor,
  fireEvent,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { store } from 'store'
import { t } from 'i18n/config'
import { selectTool } from 'store/features/planning/slice'
import { PlanningTools } from 'store/features/planning/types'

import { SidePanelJobPlanning } from './SidePanelJobPlanning'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

describe('SidePanelJobPlanning (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<SidePanelJobPlanning />)(mockedStore)
  })

  afterEach(() => {})

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})

describe('SidePanelJobPlanning (real store)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(async () => {
    // enable fake timers
    jest.useFakeTimers()
    /** mock API */
    jest.advanceTimersByTime(500)
    /** render */
    component = renderWithProvider(<SidePanelJobPlanning />)(store)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('should have the initial point button', () => {
    expect(
      component.getByText(
        t('side_panel.buttons.initial_point', 'Wrong') as string
      )
    ).toBeTruthy()
  })

  test('should have the final point button', () => {
    expect(
      component.getByText(
        t('side_panel.buttons.final_point', 'Wrong') as string
      )
    ).toBeTruthy()
  })

  test('should toggle the initial point tool', async () => {
    const toggleButton = component.getByText(
      t('side_panel.buttons.initial_point', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(toggleButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const tool = await selectTool(state)
    expect(tool).toBe(PlanningTools.INITIAL_POINT)
    await waitFor(
      () => {
        fireEvent.click(toggleButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const toolAfter = await selectTool(stateAfter)
    expect(toolAfter).toBe(PlanningTools.SELECT)
  })

  test('should toggle the final point tool', async () => {
    const toggleButton = component.getByText(
      t('side_panel.buttons.final_point', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(toggleButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    const tool = await selectTool(state)
    expect(tool).toBe(PlanningTools.FINAL_POINT)
    await waitFor(
      () => {
        fireEvent.click(toggleButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const stateAfter = await store.getState()
    const toolAfter = await selectTool(stateAfter)
    expect(toolAfter).toBe(PlanningTools.SELECT)
  })
})
