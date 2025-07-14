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
import { ActiveLan } from 'components/molecules/ActiveLan/ActiveLan'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const IP = '1.1.1.1'
const PASSWORD = 'admin'
const USERNAME = 'admin'

const defaultProps = {
  IP: IP,
  LanConnected: false,
  password: PASSWORD,
  userName: USERNAME,
}

describe('ActiveLan (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <ActiveLan
        IP={IP}
        password={PASSWORD}
        userName={USERNAME}
        LanConnected={false}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('should display lan not connected text at start', () => {
    expect(screen.getByText(/lan not connected/i)).toBeInTheDocument()
  })

  test('should display lan connected text if LanConnected prop is true', () => {
    renderWithProvider(
      <ActiveLan
        IP={IP}
        password={PASSWORD}
        userName={USERNAME}
        LanConnected={true}
      />
    )(mockedStore)
    expect(screen.getByText(/lan connected/i)).toBeInTheDocument()
  })

  test('should display data if LanConnected prop is true', () => {
    renderWithProvider(
      <ActiveLan
        IP={IP}
        password={PASSWORD}
        userName={USERNAME}
        LanConnected={true}
      />
    )(mockedStore)
    expect(screen.getByText(`Username: ${USERNAME}`)).toBeInTheDocument()
    expect(screen.getByText('Password:')).toBeInTheDocument()
    expect(screen.getByText(`IP: ${IP}`)).toBeInTheDocument()
  })

  test('It should show correct icon based on connections', () => {
    // Not connected
    expect(screen.getByTestId('LanNotConnected')).toBeInTheDocument()
    // Connected
    renderWithProvider(
      <ActiveLan
        IP={IP}
        password={PASSWORD}
        userName={USERNAME}
        LanConnected={true}
      />
    )(mockedStore)
    expect(screen.getByTestId('LanConnected')).toBeInTheDocument()
  })
})
