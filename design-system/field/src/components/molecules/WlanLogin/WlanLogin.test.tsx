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
import { WlanLogin } from 'components/molecules/WlanLogin/WlanLogin'
import { t } from 'i18n/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const mockOnClick = jest.fn()

describe('WlanLogin (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<WlanLogin onClick={mockOnClick} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockOnClick.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('renders the password field', () => {
    expect(
      screen.getByLabelText(t('login.form.fields.password', 'wrong') as string)
    ).toBeInTheDocument()
  })

  test('renders the connect button', () => {
    expect(
      screen.getByRole('button', {
        name: t('rtk.server.form.connect', 'wrong') as string,
      })
    ).toBeInTheDocument()
  })

  test('connect button is clickable', () => {
    const button = screen.getByRole('button', {
      name: t('rtk.server.form.connect', 'wrong') as string,
    })
    fireEvent.click(button) //TODO check if the action to the store is dispatched
  })
})
