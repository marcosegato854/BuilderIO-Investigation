import React from 'react'
import configureMockStore from 'redux-mock-store'
import { mockStore } from 'store/mock/mockStoreTests'
import {
  fireEvent,
  queries,
  RenderResult,
  screen,
} from '@testing-library/react'
import { renderWithProvider } from 'utils/test'
import LogViewer from 'components/dialogs/LogViewer/LogViewer'
import { getType } from 'typesafe-actions'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { t } from 'i18n/config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedStore: any = configureMockStore()(mockStore)

/**
 * Mock the store dispatch function
 * in order to test dispatches and their content
 */
const mockDispatch = jest.fn()
mockedStore.dispatch = mockDispatch

describe('LogViewer (mockStore)', () => {
  let component: RenderResult<typeof queries>
  const title = 'Job_202209301456 processing log'
  const okButtonLabel = 'Ok'
  const { processingErrors } = mockStore.dataStorageService.currentJob

  beforeEach(() => {
    component = renderWithProvider(
      <LogViewer
        title={title}
        okButtonLabel={okButtonLabel}
        log={processingErrors}
      />
    )(mockedStore)
  })

  afterEach(() => {
    mockDispatch.mockClear()
  })

  test('It should mount', () => {
    expect(component).toBeTruthy()
  })

  test('It should display the title', () => {
    expect(component.getByText(title)).toBeTruthy()
  })

  test('It should close when clicking ok', () => {
    const okButton = component.getByText(okButtonLabel)
    fireEvent.click(okButton)
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: getType(closeDialogAction) })
    )
  })

  test('It should display errors', () => {
    expect(component.getAllByTestId('log-error').length).toBeGreaterThan(0)
  })

  test('It should display warnings', () => {
    expect(component.getAllByTestId('log-warning').length).toBeGreaterThan(0)
  })

  test('It should NOT display messages', () => {
    expect(screen.queryAllByTestId('log-message').length).toBe(0)
  })
})
