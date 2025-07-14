/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  fireEvent,
  queries,
  RenderResult,
  waitFor,
  within,
  screen,
} from '@testing-library/react'
import { SidePanelSettings } from 'components/molecules/SidePanelSettings/SidePanelSettings'
import { SidePanelSettingsMap } from 'components/molecules/SidePanelSettings/SidePanelSettingsMap'
import moxios from 'moxios'
import { mergeDeepRight } from 'ramda'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { store } from 'store'
import { resetStoreAction } from 'store/features/global/slice'
import { ViewMode } from 'store/features/position/types'
import { confirmAbortAutocaptureAction } from 'store/features/routing/slice'
import { mkSaveSettings } from 'store/features/settings/mockApi'
import { setAudioSettings } from 'store/features/settings/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import apiClient from 'store/services/apiClientBackend'
import mockApiClient from 'store/services/mockApiClientPlanning'
import { t } from 'i18n/config'
import { renderWithProvider } from 'utils/test'
import { planTracksVisibleAction } from 'store/features/position/slice'

const noPlanOverrides = {
  planningService: {
    undoablePolygons: {
      present: null,
    },
  },
  dataStorageService: {
    currentJob: {
      planned: false,
    },
  },
  positionService: {
    planTracksVisible: true,
  },
}
const hiddenPlanOverrides = {
  positionService: {
    planTracksVisible: false,
  },
}
const noPlanStore = mergeDeepRight(mockStore, noPlanOverrides)
const hiddenPlanStore = mergeDeepRight(mockStore, hiddenPlanOverrides)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)
const mockedStoreNoPlan = configureMockStore()(noPlanStore)
const mockedStoreHiddenPlan = configureMockStore()(hiddenPlanStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch
const mockDispatchHiddenPlan = jest.fn()
mockedStoreHiddenPlan.dispatch = mockDispatchHiddenPlan

describe('SidePanelSettingsMap (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<SidePanelSettingsMap />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the automatic capture toggle', () => {
    expect(component.getByTestId('autocapture-toggle')).toBeTruthy()
  })
})

describe('SidePanelSettingsMap (mockStore no plan)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<SidePanelSettingsMap />)(mockedStoreNoPlan)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should NOT display the automatic capture toggle', () => {
    expect(screen.queryByTestId('autocapture-toggle')).not.toBeInTheDocument()
  })
  /** moved to top bar */
  // test('It should NOT display show / hide planned tracks option', () => {
  //   expect(screen.queryByTestId('planned_tracks')).not.toBeInTheDocument()
  // })
})
