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
import { WlanNetwork } from 'components/molecules/WlanNetwork/WlanNetwork'

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

describe('WlanNetwork (mockStore)', () => {
  let component: RenderResult<typeof queries>

  afterEach(() => {
    mockDispatch.mockClear()
    mockOnClick.mockClear()
  })
  test('It should mount', () => {
    component = renderWithProvider(
      <WlanNetwork WLANsAvailable={3} WifiText={TEXT} onClick={mockOnClick} />
    )(mockedStore)
    expect(component).toBeTruthy()
  })

  test('should render the correct number of WifiWithIcon components', () => {
    mockDispatch.mockClear()
    mockOnClick.mockClear()
    renderWithProvider(
      <WlanNetwork WLANsAvailable={2} WifiText={TEXT} onClick={mockOnClick} />
    )(mockedStore)
    expect(screen.getAllByText(TEXT)).toHaveLength(2)
  })

  test('should render "No network available" if WLANsAvailable is 0', () => {
    renderWithProvider(
      <WlanNetwork WLANsAvailable={0} WifiText={TEXT} onClick={mockOnClick} />
    )(mockedStore)
    expect(screen.getByText('No network available')).toBeInTheDocument()
  })
  test('should call onClick when WifiWithIcon is clicked', () => {
    renderWithProvider(
      <WlanNetwork WLANsAvailable={1} WifiText={TEXT} onClick={mockOnClick} />
    )(mockedStore)
    fireEvent.click(screen.getByRole('button', { name: TEXT }))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
