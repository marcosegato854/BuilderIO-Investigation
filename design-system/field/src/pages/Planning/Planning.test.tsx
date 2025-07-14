/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { IPlanningProps, Planning } from 'pages/Planning/Planning'
import apiSettings from 'store/features/settings/api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const routeComponentPropsMock = {
  history: {
    location: {
      pathname: '/HomePage',
      key: 'default',
    },
  },
  location: {},
  match: {},
}

describe('Planning (mockStore)', () => {
  let component: RenderResult<typeof queries>
  let mockedUserSettingsApi: jest.SpyInstance<any>

  beforeEach(() => {
    mockedUserSettingsApi = jest
      .spyOn(apiSettings, 'saveSettings')
      .mockReturnValue({
        status: 200,
        data: {},
      } as any)
    component = renderWithProvider(
      <Planning {...(routeComponentPropsMock as IPlanningProps)} />
    )(mockedStore)
  })

  afterEach(() => {
    mockedUserSettingsApi.mockClear()
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
