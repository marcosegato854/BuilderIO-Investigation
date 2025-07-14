import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import { queries, RenderResult } from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import LanConnectionHelp from './LanConnectionHelp'
import { screen, fireEvent } from '@testing-library/react'
import { t } from 'i18n/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('LanConnectionHelp (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const onClose = jest.fn()
  beforeEach(() => {
    component = renderWithProvider(<LanConnectionHelp onClose={onClose} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('renders the dialog with title', () => {
    expect(
      screen.getByText(t('pcu.connection.help.title', 'connect') as string)
    ).toBeInTheDocument()
  })

  test('renders the close button', () => {
    expect(screen.getByTestId('close-button')).toBeInTheDocument()
  })

  test('calls onClose when close button is clicked', () => {
    fireEvent.click(screen.getByTestId('close-button'))
    expect(onClose).toHaveBeenCalled()
  })
})
