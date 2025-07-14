import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import { store } from 'store'
import { queries, RenderResult } from '@testing-library/react'
import { DataAcquisitionSmallStatusBar } from './DataAcquisitionSmallStatusBar'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.spyOn(store, 'dispatch')

describe('DataAcquisitionSmallStatusBar (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<DataAcquisitionSmallStatusBar />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
