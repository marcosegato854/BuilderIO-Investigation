import { queries, RenderResult } from '@testing-library/react'
import { RecordingButton } from 'components/atoms/RecordingButton/RecordingButton'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('RecordingButton (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <RecordingButton onClick={jest.fn()} extraInfo={<div>Test</div>} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('it should display extra info', () => {
    const extraInfo = component.getByTestId('extra-info')
    expect(extraInfo).toBeTruthy()
  })
})
