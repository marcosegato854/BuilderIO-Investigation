import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { ErrorLog } from 'components/organisms/ErrorLog/ErrorLog'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('ErrorLog (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<ErrorLog />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display error list', () => {
    const errorList = component.getAllByTestId('error-list-item')
    expect(errorList.length).toBeGreaterThan(0)
  })

  test('it should display button', () => {
    const downloadButton = component.getByTestId('alignment-button')
    expect(downloadButton).toBeTruthy()
  })
})
