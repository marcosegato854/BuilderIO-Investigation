import {
  fireEvent,
  queries,
  RenderResult,
  waitFor,
  screen,
} from '@testing-library/react'
import { t } from 'i18n/config'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { mockStore } from 'store/mock/mockStoreTests'
import { renderWithProvider } from 'utils/test'
import Alert from './Alert'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
const mockOkButtonClick = jest.fn()
const mockCancelButtonClick = jest.fn()
const mockCheckboxCallback = jest.fn()
mockedStore.dispatch = mockDispatch

const htmlTitle = t('new_job_form.image_blur.title', 'wrong')
const checkboxLabel = t('new_job_form.image_blur.checkbox', 'wrong')

describe('Alert (mockStore)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <Alert
        type="error"
        cancelButtonLabel="Cancel"
        okButtonCallback={mockOkButtonClick}
        cancelButtonCallback={mockCancelButtonClick}
        okButtonLabel="OK"
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockOkButtonClick.mockClear()
  })

  test('It should mount', () => {
    expect(component.container).toBeTruthy()
  })

  test('Should close when cancel button il clicked', () => {
    const cancelButton = component.getByText('Cancel')
    expect(cancelButton).toBeTruthy()
    fireEvent.click(cancelButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'dialogs/CLOSE_DIALOG',
    })
  })

  test('Should close when ok button il clicked', () => {
    const okButton = component.getByText('OK')
    expect(okButton).toBeTruthy()
    fireEvent.click(okButton)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'dialogs/CLOSE_DIALOG',
    })
  })

  test('Should call the ok button callback when ok button il clicked', () => {
    const okButton = component.getByText('OK')
    expect(okButton).toBeTruthy()
    fireEvent.click(okButton)
    expect(mockOkButtonClick).toHaveBeenCalled()
  })

  test('Should not call the ok button callback when cancel button il clicked', () => {
    const cancelButton = component.getByText('Cancel')
    expect(cancelButton).toBeTruthy()
    fireEvent.click(cancelButton)
    expect(mockOkButtonClick).not.toHaveBeenCalled()
  })

  test('Should call the cancel button callback when cancel button il clicked', () => {
    const cancelButton = component.getByText('Cancel')
    expect(cancelButton).toBeTruthy()
    fireEvent.click(cancelButton)
    expect(mockCancelButtonClick).toHaveBeenCalled()
  })

  test('Should NOT display a checkbox with text', () => {
    expect(screen.queryByText(checkboxLabel)).not.toBeInTheDocument()
  })

  test('Should NOT have a close button', () => {
    expect(screen.queryByTestId('close-button')).not.toBeInTheDocument()
  })
})

describe('Alert (mockStore - no buttons with checkbox)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <Alert
        type="error"
        title={htmlTitle}
        checkboxCallback={mockCheckboxCallback}
        checkboxLabel={checkboxLabel}
      />
    )(mockedStore)
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockOkButtonClick.mockClear()
    mockCheckboxCallback.mockClear()
    jest.useRealTimers()
  })

  test('It should mount', () => {
    expect(component.container).toBeTruthy()
  })

  test('Should display a checkbox with text', () => {
    expect(component.getByText(checkboxLabel)).toBeTruthy()
  })

  test('Should call a callback when the checkbox changes its status', async () => {
    const checkbox = component.getByText(checkboxLabel)
    await waitFor(
      () => {
        fireEvent.click(checkbox)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockCheckboxCallback).toHaveBeenCalledWith(true)
  })

  test('Should not display buttons', () => {
    expect(screen.queryByTestId('alert-cancel-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('alert-ok-button')).not.toBeInTheDocument()
  })

  test('Should have a close button', () => {
    const closeButton = component.getByTestId('close-button')
    expect(closeButton).toBeTruthy()
  })

  test('Should close the popup when clicking the close button', async () => {
    const closeButton = component.getByTestId('close-button')
    await waitFor(
      () => {
        fireEvent.click(closeButton)
      },
      { timeout: 500 }
    )
    jest.advanceTimersByTime(500)
    expect(mockDispatch).toHaveBeenCalledWith(closeDialogAction())
  })

  test('Should support HTML in the title', () => {
    // hardcoded string because the whole HTML title is not found because of the tags inside
    expect(component.getByText('GDPR')).toBeTruthy()
  })
})

describe('Alert (mockStore - show close button forced)', () => {
  let component: RenderResult<typeof queries>
  beforeEach(() => {
    component = renderWithProvider(
      <Alert
        type="error"
        cancelButtonLabel="Cancel"
        okButtonCallback={mockOkButtonClick}
        cancelButtonCallback={mockCancelButtonClick}
        showCloseButton={true}
        okButtonLabel="OK"
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
    mockOkButtonClick.mockClear()
  })

  test('It should mount', () => {
    expect(component.container).toBeTruthy()
  })

  test('Should forced to have a close button', () => {
    const closeButton = component.getByTestId('close-button')
    expect(closeButton).toBeTruthy()
  })
})
