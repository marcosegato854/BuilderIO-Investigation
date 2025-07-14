import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  queries,
  RenderResult,
  screen,
  fireEvent,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { ActiveNetwork } from 'components/molecules/ActiveNetwork/ActiveNetwork'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const mockOnDisconnect = jest.fn()

const defaultProps = {
  IP: '1.1.1.1',
  networkName: 'hotspot',
  onDisconnect: mockOnDisconnect,
  password: 'admin',
  userName: 'admin',
  qrLink:
    'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
}

describe('ActiveNetwork (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ActiveNetwork
        IP="1.1.1.1"
        networkName="hotspot"
        onDisconnect={mockOnDisconnect}
        password="admin"
        userName="admin"
        qrLink="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should mount and display network info', () => {
    expect(screen.getByText(defaultProps.networkName)).toBeInTheDocument()
    expect(screen.getByText(defaultProps.userName)).toBeInTheDocument()
    expect(screen.getByText(defaultProps.IP)).toBeInTheDocument()
    expect(screen.getByAltText('QR Code for connection')).toHaveAttribute(
      'src',
      defaultProps.qrLink
    )
  })

  test('should call onDisconnect when disconnect button is clicked', () => {
    const disconnectButton = screen.getByTestId('disconnect-button')
    fireEvent.click(disconnectButton)
    expect(mockOnDisconnect).toHaveBeenCalledTimes(1)
  })
})
