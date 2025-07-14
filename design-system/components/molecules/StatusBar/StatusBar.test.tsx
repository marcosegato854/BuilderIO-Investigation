import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  queries,
  RenderResult,
  screen,
  fireEvent,
  render,
  cleanup,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import { StatusBar } from 'components/molecules/StatusBar/StatusBar'
import { t } from 'i18n/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

const defaultProps = {
  rtk: false,
}

describe('ActiveLan (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<StatusBar rtk={defaultProps.rtk} />)(
      mockedStore
    )
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('renders RTK text when RTK is true', () => {
    cleanup()
    renderWithProvider(<StatusBar rtk={true} />)(mockedStore)
    const rtkText = screen.getByText(
      t('data_acquisition_small_status_bar.rtk', 'error') as string
    )
    expect(rtkText).toBeTruthy()
  })

  test('renders the vertical divider when RTK is true', () => {
    cleanup()
    renderWithProvider(<StatusBar rtk={true} />)(mockedStore)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  test('does not render the vertical divider when RTK is false', () => {
    cleanup()
    renderWithProvider(<StatusBar rtk={false} />)(mockedStore)
    expect(screen.queryByRole('separator')).not.toBeInTheDocument()
  })
})
