import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { mockMediaQueries, renderWithProvider } from 'utils/test'
import { PortraitOverlay } from 'components/molecules/PortraitOverlay/PortraitOverlay'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('PortraitOverlay (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    mockMediaQueries()
    component = renderWithProvider(<PortraitOverlay />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
