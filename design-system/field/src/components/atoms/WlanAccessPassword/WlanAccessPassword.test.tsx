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
import { WlanAccessPassword } from 'components/atoms/WlanAccessPassword/WlanAccessPassword'
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

const defaultProps = {
  onClick: mockOnClick,
}

describe('ActiveNetwork (mockStore)', () => {
  let component: RenderResult<typeof queries>

  beforeEach(() => {
    component = renderWithProvider(<WlanAccessPassword />)(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('renders the password field', () => {
    expect(
      screen.getByLabelText(t('login.form.fields.password', 'wrong') as string)
    ).toBeInTheDocument()
  })

  test('toggles password visibility', () => {
    // Initially should show VisibilityOff icon
    expect(screen.getByTestId('VisibilityOff')).toBeInTheDocument()
    // Click the icon to show password
    fireEvent.click(screen.getByTestId('VisibilityOff').closest('button')!)
    expect(screen.getByTestId('VisibilityOn')).toBeInTheDocument()
    // Click again to hide password
    fireEvent.click(screen.getByTestId('VisibilityOn').closest('button')!)
    expect(screen.getByTestId('VisibilityOff')).toBeInTheDocument()
  })
})
