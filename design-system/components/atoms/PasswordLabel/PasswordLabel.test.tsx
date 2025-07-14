import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  queries,
  RenderResult,
  fireEvent,
  screen,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { PasswordLabel } from './PasswordLabel'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch
const value = 'admin'
const hiddenValue = '•'.repeat(value.length)
describe('PasswordLabel (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<PasswordLabel inputValue={value} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should toggle password visibility', () => {
    const toggleButton = screen.getByRole('button')
    expect(screen.getByText(hiddenValue)).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(screen.getByText(value)).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(screen.getByText(hiddenValue)).toBeInTheDocument()
  })

  test('It should show correct icon based on visibility', () => {
    const toggleButton = screen.getByRole('button')

    expect(screen.getByTestId('VisibilityOff')).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(screen.getByTestId('VisibilityOn')).toBeInTheDocument()
  })
})
