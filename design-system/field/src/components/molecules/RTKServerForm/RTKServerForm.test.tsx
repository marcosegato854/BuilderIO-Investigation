import React from 'react'
import {
  RenderResult,
  queries,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import { RtkServer } from 'store/features/rtk/types'
import { RTKServerForm } from 'components/molecules/RTKServerForm/RTKServerForm'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStoreNoCurrentServer: any = configureMockStore()({
  ...mockStore,
  rtkService: {
    ...mockStore.rtkService,
    currentServer: null,
  },
})

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('RTKServerForm', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(<RTKServerForm />)(
      mockedStoreNoCurrentServer
    )
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })
})

describe('RTKServerForm (with current server set)', () => {
  let component: RenderResult<typeof queries>
  const initServer = mockStore.rtkService.servers![0]
  beforeEach(() => {
    component = renderWithProvider(
      <RTKServerForm initialValues={initServer} />
    )(mockedStore)
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should update saved settings', async () => {
    const button = component.getByText('Update')
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: {
        server: initServer,
        id: initServer.id,
      },
      type: 'rtkService/SERVER_UPDATE_REQUEST',
    })
  })
})

describe('RTKServerForm (no servers)', () => {
  let component: RenderResult<typeof queries>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockedStoreNoServers: any = configureMockStore()({
    ...mockStore,
    rtkService: {
      ...mockStore.rtkService,
      currentServer: null,
      servers: [],
    },
  })

  /**
   * Mock the store dispatch function
   * in order to test dispatches and their content
   */
  const mockDispatchNoCurrentServer = jest.fn()
  const mockUpdate = jest.fn()
  mockedStoreNoServers.dispatch = mockDispatchNoCurrentServer
  beforeEach(() => {
    component = renderWithProvider(<RTKServerForm onUpdate={mockUpdate} />)(
      mockedStoreNoServers
    )
    // enable fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatchNoCurrentServer.mockClear()
    jest.useRealTimers()
  })

  test('Should save settings', async () => {
    const fields = component.getAllByDisplayValue('')
    fields.forEach((f) => fireEvent.change(f, { target: { value: '80' } }))
    const button = component.getByTestId('submit-button')
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const expectedServer: RtkServer = {
      name: '80',
      password: '80',
      server: '80:80',
      user: '80',
    }
    expect(mockDispatchNoCurrentServer).toHaveBeenCalledWith({
      payload: expectedServer,
      type: 'rtkService/SERVER_SUBMIT_REQUEST',
    })
  })

  test('Should call a callback on change', async () => {
    const fields = component.getAllByDisplayValue('')
    await waitFor(
      () => {
        fields.forEach((f) => fireEvent.change(f, { target: { value: '80' } }))
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    const expectedServer: RtkServer = {
      name: '80',
      password: '80',
      server: '80:80',
      user: '80',
    }
    expect(mockUpdate).toHaveBeenCalledWith(expectedServer)
  })

  test('Should open automatically if the servers array is empty', () => {
    expect(screen.queryAllByTestId('form-field').length).toBe(5)
  })
})
