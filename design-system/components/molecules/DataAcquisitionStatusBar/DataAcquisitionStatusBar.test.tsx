import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { RenderResult, queries } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'

import { DataAcquisitionStatusBar } from './DataAcquisitionStatusBar'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('DataAcquisitionStatusBar (mockStore)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<DataAcquisitionStatusBar />)(mockedStore)
  })
  afterEach(() => {
    mockDispatch.mockClear()
  })
  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
