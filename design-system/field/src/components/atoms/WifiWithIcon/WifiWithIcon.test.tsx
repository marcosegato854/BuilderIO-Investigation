import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  queries,
  RenderResult,
  screen,
  fireEvent,
  render,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { WifiWithIcon } from 'components/atoms/WifiWithIcon/WifiWithIcon'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const mockOnClick = jest.fn()

const TEXT = 'Test Wifi'

const defaultProps = {
  Text: TEXT,
  onClick: mockOnClick,
}

describe('WifiWithIcon (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <WifiWithIcon Text={TEXT} onClick={mockOnClick} />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockOnClick.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
  test('should render the provided text', () => {
    expect(screen.getByText(TEXT)).toBeInTheDocument()
  })

  test('should call onClick when button is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: TEXT }))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  test('should render the icon', () => {
    expect(screen.getByTestId('wifi-icon')).toBeInTheDocument()
  })
})
