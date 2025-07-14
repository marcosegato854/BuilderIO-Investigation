import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  fireEvent,
  queries,
  RenderResult,
  waitFor,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import SaveAsCustomJobType from 'components/dialogs/SaveAsCustomJobType/SaveAsCustomJobType'
import { t } from 'i18n/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('SaveAsCustomJobType (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const mockOkButtonCallback = jest.fn()
  const mockCancelButtonCallback = jest.fn()

  beforeEach(() => {
    component = renderWithProvider(
      <SaveAsCustomJobType
        okButtonCallback={mockOkButtonCallback}
        cancelButtonCallback={mockCancelButtonCallback}
      />
    )(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    mockDispatch.mockClear()
    mockOkButtonCallback.mockClear()
    mockCancelButtonCallback.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should have the name input field', () => {
    expect(component.getByTestId('jobtype-name-input')).toBeTruthy()
  })

  test('It should call the callback on submit with parameters', async () => {
    const jobTypeName = 'NewJobType'
    // enter profile name
    const textField = component.getByTestId('jobtype-name-input')
    const input: HTMLInputElement = textField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: jobTypeName } })
    fireEvent.blur(input)
    // click submit
    const submitButton = component.getByText(
      t('job_browser.save_jobtype_ok', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(mockOkButtonCallback).toHaveBeenCalledWith({ jobTypeName })
  })

  test('It should NOT call the callback on submit with a reserved name', async () => {
    const jobTypeName = 'Rail'
    // enter profile name
    const textField = component.getByTestId('jobtype-name-input')
    const input: HTMLInputElement = textField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: jobTypeName } })
    fireEvent.blur(input)
    // click submit
    const submitButton = component.getByText(
      t('job_browser.save_jobtype_ok', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(mockOkButtonCallback).not.toHaveBeenCalled()
    expect(
      component.getByText(
        t('job_browser.save_jobtype_exists', 'exists') as string
      )
    ).toBeTruthy()
  })

  test('It should NOT call the callback on submit if the job type is shorter than 3 chars', async () => {
    const jobTypeName = 'xy'
    const textField = component.getByTestId('jobtype-name-input')
    const input: HTMLInputElement = textField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: jobTypeName } })
    // change focus to activate validation
    fireEvent.blur(input)
    // click submit
    const submitButton = component.getByText(
      t('job_browser.save_jobtype_ok', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(mockOkButtonCallback).not.toHaveBeenCalled()
    expect(
      component.getByText(
        t('job_browser.save_jobtype_min', 'min 3 chars') as string
      )
    ).toBeTruthy()
  })

  test('It should NOT call the callback on submit with a bad name', async () => {
    const jobTypeName = 'Name with space'
    // enter profile name
    const textField = component.getByTestId('jobtype-name-input')
    const input: HTMLInputElement = textField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: jobTypeName } })
    fireEvent.blur(input)
    // click submit
    const submitButton = component.getByText(
      t('job_browser.save_jobtype_ok', 'wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(submitButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(mockOkButtonCallback).not.toHaveBeenCalled()
    expect(
      component.getByText(
        t('login.form.validation.bad_characters', 'wrong') as string
      )
    ).toBeTruthy()
  })

  test('It should NOT call the callback on cancel', async () => {
    const jobTypeName = 'NewJobType'
    // enter profile name
    const textField = component.getByTestId('jobtype-name-input')
    const input: HTMLInputElement = textField.getElementsByTagName('input')[0]
    fireEvent.change(input, { target: { value: jobTypeName } })
    fireEvent.blur(input)
    // click submit
    const cancelButton = component.getByText(
      t('job_browser.save_jobtype_cancel', 'Wrong') as string
    )
    await waitFor(
      () => {
        fireEvent.click(cancelButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    // test
    expect(mockOkButtonCallback).not.toHaveBeenCalled()
  })
})
