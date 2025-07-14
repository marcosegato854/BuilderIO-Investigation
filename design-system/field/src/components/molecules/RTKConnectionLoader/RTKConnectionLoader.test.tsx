import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { RTKConnectionLoader } from './RTKConnectionLoader'

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */

describe('RTKConnectionLoader (mockStore)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStore: any = configureMockStore()(mockStore)
  const mockDispatch = jest.fn()
  mockedStore.dispatch = mockDispatch
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <RTKConnectionLoader server={mockStore.rtkService.currentServer} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})
