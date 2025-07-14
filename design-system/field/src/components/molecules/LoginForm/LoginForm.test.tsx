import {
  fireEvent,
  queries,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react'
import { LoginForm } from 'components/molecules/LoginForm/LoginForm'
import { t } from 'i18n/config'
import configureMockStore from 'redux-mock-store'
import { loginActions } from 'store/features/auth/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('LoginForm (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const mockedSubmitCallback = jest.fn()

  beforeEach(() => {
    component = renderWithProvider(
      <LoginForm currentForm="login" onSubmitCallBack={mockedSubmitCallback} />
    )(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockedSubmitCallback.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It shouold give an error if user and password are not compiled', async () => {
    const form = component.getByTestId('login-form')
    expect(form).toBeTruthy()
    fireEvent.submit(form)
    await waitFor(() => {
      const errorUsername = component.getByText(
        t('login.form.validation.username', 'wrong') as string
      )
      expect(errorUsername).toBeTruthy()
      const errorPassword = component.getByText(
        t('login.form.validation.password', 'wrong') as string
      )
      expect(errorPassword).toBeTruthy()
    })
  })

  test('It shouold NOT give an error if user and password are filled', async () => {
    const username = component.getByTestId('input-username')
    expect(username).toBeTruthy()
    const password = component.getByTestId('input-password')
    expect(password).toBeTruthy()
    const usernameInput = username.getElementsByTagName(
      'input'
    )[0] as HTMLInputElement
    const passwordInput = password.getElementsByTagName(
      'input'
    )[0] as HTMLInputElement
    // change the values
    fireEvent.change(usernameInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'asdfasdf' } })
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    const button = component.getByTestId('submit-button-login')
    expect(button).toBeTruthy()
    fireEvent.click(button)
    await waitFor(() => {}, { timeout: 500 })
    jest.advanceTimersByTime(500)
    const errorUsername = screen.queryByText(
      t('login.form.validation.username', 'wrong') as string
    )
    expect(errorUsername).not.toBeInTheDocument()
    const errorPassword = screen.queryByText(
      t('login.form.validation.password', 'wrong') as string
    )
    expect(errorPassword).not.toBeInTheDocument()
  })

  test('Should not dispatch an action if user and password are not compiled', async () => {
    const button = component.getByTestId('submit-button-login')
    expect(button).toBeTruthy()
    fireEvent.click(button)
    await waitFor(() => {
      expect(mockedSubmitCallback).not.toHaveBeenCalled()
    })
  })

  test('It shouold dispatch an action if user and password are compiled', async () => {
    const username = component.getByTestId('input-username')
    expect(username).toBeTruthy()
    const password = component.getByTestId('input-password')
    expect(password).toBeTruthy()
    const usernameInput = username.getElementsByTagName(
      'input'
    )[0] as HTMLInputElement
    const passwordInput = password.getElementsByTagName(
      'input'
    )[0] as HTMLInputElement
    // change the values
    fireEvent.change(usernameInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'asdfasdf' } })
    const button = component.getByTestId('submit-button-login')
    expect(button).toBeTruthy()
    await waitFor(
      () => {
        fireEvent.click(button)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    await waitFor(() => {
      expect(mockedStore.dispatch).toHaveBeenCalledWith(
        loginActions.request({
          username: 'test@example.com',
          password: 'asdfasdf',
          rememberMe: false,
        })
      )
    })
  })
})
