import React from 'react'
import { RenderResult, queries } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

import { RTKMountPointForm } from './RTKMountPointForm'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('RTKMountPointForm', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<RTKMountPointForm />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should diplay 5 fields', () => {
    expect(component.getAllByTestId('form-field').length).toBe(2)
  })

  test('Should diplay test button', () => {
    expect(component.getAllByTestId('submit-button-rtk-test')).toBeTruthy()
  })
})
