import { fireEvent, queries, RenderResult } from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { RtkServer } from 'store/features/rtk/types'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import {
  IRTKServersListItemProps,
  RTKServersListItem,
} from './RTKServersListItem'

const defaultProps: IRTKServersListItemProps = {
  server: {
    name: 'Test Server',
    password: 'mypassword',
    port: '8000',
    server: '127.0.0.1:8000',
    user: 'username',
    mountpoint: 'Mountpoint 2',
    interfacemode: 'MODE3',
    connected: false,
  },
  connected: false,
  onEdit: () => {},
  isEditing: false,
}

const serverNotListed: RtkServer = {
  name: 'Server not in list',
  password: 'mypassword',
  server: '127.0.0.1:8000',
  user: 'usernameCurrent',
  mountpoint: 'Mountpoint 2',
  interfacemode: 'MODE3',
  connected: true,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch
/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */

describe('RTKServersListItem', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <RTKServersListItem
        server={defaultProps.server}
        connected
        isEditing={defaultProps.isEditing}
        onEdit={defaultProps.onEdit}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('Should dispatch server selection when clicking on edit icon', () => {
    const icon = component.getByTestId('icon-edit')
    expect(icon).toBeTruthy()
    fireEvent.click(icon)
    expect(mockDispatch).toHaveBeenCalledWith({
      payload: defaultProps.server,
      type: 'rtkService/SET_CURRENT_SERVER',
    })
  })
})

describe('RTKServersListItem - with currentServer not listed', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(
      <RTKServersListItem
        server={serverNotListed}
        connected
        isEditing={defaultProps.isEditing}
        onEdit={defaultProps.onEdit}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('Should NOT display the delete icon if the server is not listed', () => {
    expect(component.queryByTestId('icon-delete')).not.toBeInTheDocument()
  })
})
