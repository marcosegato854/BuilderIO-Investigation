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

const overrides = {
  routingService: {
    moduleEnabled: false,
  },
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('SidePanelSettings (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <SidePanelSettings viewMode={ViewMode.CAMERA} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})

describe('SidePanelSettings (realStore)', () => {
  let component: RenderResult<typeof queries>
  let mockedSaveSettingsApi: jest.SpyInstance<any>

  beforeEach(() => {
    mockedSaveSettingsApi = mkSaveSettings()
    component = renderWithProvider(
      <SidePanelSettings viewMode={ViewMode.CAMERA} />
    )(store)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    store.dispatch(resetStoreAction())
    mockedSaveSettingsApi.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It changes the global volume setting', async () => {
    await waitFor(
      () => {
        store.dispatch(
          setAudioSettings({
            globalVolume: 50,
            audibleMessages: {
              COLLECTION: true,
              ERROR: true,
              NAVIGATION: true,
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    expect(state.settings.audio.globalVolume).toBe(50)
  })

  test('It mutes the volume for a specific type of messages', async () => {
    await waitFor(
      () => {
        store.dispatch(
          setAudioSettings({
            globalVolume: 50,
            audibleMessages: {
              COLLECTION: true,
              ERROR: false,
              NAVIGATION: true,
            },
          })
        )
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const state = await store.getState()
    expect(state.settings.audio.audibleMessages.ERROR).toBe(false)
  })
})
